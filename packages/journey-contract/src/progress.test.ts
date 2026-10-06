import { describe, expect, it } from "vitest";
import { getJourneyDay } from "./registry.js";
import {
  advanceJourneyProgress,
  persistJourneyProgress,
  resolveResumePointer,
  type JourneyProgressRecord,
  type ProgressLedgerPort,
} from "./progress.js";

describe("M6 journey progress", () => {
  it("supports NOT_STARTED -> IN_PROGRESS -> COMPLETED without mutating Day authority", () => {
    const descriptor = getJourneyDay("001");
    if (!descriptor || descriptor.status !== "AVAILABLE") throw new Error("missing fixture");
    const snapshot = JSON.stringify(descriptor);
    const started = advanceJourneyProgress(undefined, "001", "IN_PROGRESS");
    const completed = advanceJourneyProgress(started, "001", "COMPLETED");
    expect(started.state).toBe("IN_PROGRESS");
    expect(completed.state).toBe("COMPLETED");
    expect(JSON.stringify(descriptor)).toBe(snapshot);
  });

  it("accepts a valid resume pointer only for an available Day with progress", () => {
    const records: JourneyProgressRecord[] = [{ dayId: "037", state: "IN_PROGRESS", updatedAt: "2026-10-06T12:00:00.000Z" }];
    expect(resolveResumePointer(records, { dayId: "037" })?.dayId).toBe("037");
  });

  it("rejects stale, dormant and malformed resume pointers", () => {
    const records: JourneyProgressRecord[] = [{ dayId: "037", state: "IN_PROGRESS", updatedAt: "2026-10-06T12:00:00.000Z" }];
    expect(resolveResumePointer(records, { dayId: "073" })).toBeNull();
    expect(resolveResumePointer(records, { dayId: "abc" })).toBeNull();
    expect(resolveResumePointer(records, { dayId: "038" })).toBeNull();
  });

  it("isolates persistence errors from registry and canon state", async () => {
    const descriptor = getJourneyDay("072");
    if (!descriptor) throw new Error("missing fixture");
    const snapshot = JSON.stringify(descriptor);
    const record = advanceJourneyProgress(undefined, "072", "IN_PROGRESS");
    const port: ProgressLedgerPort = { save: async () => { throw new Error("offline"); } };
    await expect(persistJourneyProgress(port, record)).rejects.toThrow("offline");
    expect(JSON.stringify(descriptor)).toBe(snapshot);
  });
});
