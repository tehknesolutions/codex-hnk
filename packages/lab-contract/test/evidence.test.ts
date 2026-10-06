import { describe, expect, it } from "vitest";
import { buildLabEvidence, hasEvidenceAdapter } from "../src/evidence.js";
import { registerCoreEvidenceAdapters } from "../src/evidence-adapters.js";

describe("M8 evidence adapter", () => {
  it("delegates evidence construction to typed practice builders", () => {
    registerCoreEvidenceAdapters();
    expect(hasEvidenceAdapter("001")).toBe(true);
    const evidence = buildLabEvidence<any, any>("001", {
      sessionId: "session-1",
      jachin: { durationSeconds: 1 },
      ritualTone528: {},
      boaz: { durationSeconds: 1, environmentDistractionsCount: 3 },
      middle: { durationSeconds: 1, voiceRecorded: false },
      soulMirror: {},
    });
    expect(evidence.protocol_version).toBe("HNK-KETHER-D001-V2");
    expect(evidence.source_sha).toBeTruthy();
    expect(evidence.voluntary_completion_confirmed).toBe(true);
  });

  it("preserves builder privacy validation instead of accepting arbitrary prose", () => {
    registerCoreEvidenceAdapters();
    expect(() => buildLabEvidence<any, any>("001", {
      sessionId: "session-2",
      jachin: { durationSeconds: 1 },
      ritualTone528: {},
      boaz: { durationSeconds: 1, environmentDistractionsCount: 3, vaultEntryRef: "private prose must not be here" },
      middle: { durationSeconds: 1, voiceRecorded: false },
      soulMirror: {},
    })).toThrow("invalid_boaz_vault_entry_ref");
  });

  it("fails closed when no typed adapter is registered", () => {
    expect(() => buildLabEvidence("072", {})).toThrow("lab_evidence_adapter_missing:072");
  });
});
