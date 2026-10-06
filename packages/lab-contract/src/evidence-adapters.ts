import {
  buildDay001EvidenceV2,
  buildDay002EvidenceV1,
  buildDay003EvidenceV1,
  type Day001EvidenceInput,
  type Day001EvidenceV2,
  type Day002EvidenceInput,
  type Day002EvidenceV1,
  type Day003EvidenceInput,
  type Day003EvidenceV1,
} from "@hnk/practice-contract";
import { registerEvidenceAdapter } from "./evidence.js";

export function registerCoreEvidenceAdapters(): void {
  registerEvidenceAdapter<Day001EvidenceInput, Day001EvidenceV2>({ dayId: "001", build: buildDay001EvidenceV2 });
  registerEvidenceAdapter<Day002EvidenceInput, Day002EvidenceV1>({ dayId: "002", build: buildDay002EvidenceV1 });
  registerEvidenceAdapter<Day003EvidenceInput, Day003EvidenceV1>({ dayId: "003", build: buildDay003EvidenceV1 });
}
