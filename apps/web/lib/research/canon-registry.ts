import {
  HNK_CANON_KINDS,
  hnkCanonSummary,
  queryHnkCanon,
  validateHnkCanonContract,
  type HnkCanonEntry,
  type HnkCanonKind,
  type HnkCanonQuery,
  type HnkCanonRecord,
} from "@hnk/canon-contract";

export const CANON_REGISTRY_KINDS = HNK_CANON_KINDS;
export type CanonRegistryKind = HnkCanonKind;
export type CanonRegistryRecord = HnkCanonRecord;
export type CanonRegistryQuery = HnkCanonQuery;
export type CanonRegistryEntry = HnkCanonEntry;

export const queryCanonRegistry = queryHnkCanon;
export const canonRegistrySummary = hnkCanonSummary;
export const validateCanonRegistry = validateHnkCanonContract;
