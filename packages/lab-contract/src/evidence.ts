export type EvidenceBuilder<TInput, TEvidence> = (input: TInput) => TEvidence;

export interface LabEvidenceAdapter<TInput, TEvidence> {
  dayId: string;
  build: EvidenceBuilder<TInput, TEvidence>;
}

const ADAPTERS = new Map<string, LabEvidenceAdapter<unknown, unknown>>();

export function registerEvidenceAdapter<TInput, TEvidence>(
  adapter: LabEvidenceAdapter<TInput, TEvidence>,
): void {
  if (!/^\d{3}$/.test(adapter.dayId)) throw new Error("lab_evidence_day_id_invalid");
  if (typeof adapter.build !== "function") throw new Error("lab_evidence_builder_required");
  ADAPTERS.set(adapter.dayId, adapter as LabEvidenceAdapter<unknown, unknown>);
}

export function hasEvidenceAdapter(dayId: string): boolean {
  return ADAPTERS.has(dayId);
}

export function buildLabEvidence<TInput, TEvidence>(dayId: string, input: TInput): TEvidence {
  const adapter = ADAPTERS.get(dayId);
  if (!adapter) throw new Error(`lab_evidence_adapter_missing:${dayId}`);
  return adapter.build(input) as TEvidence;
}
