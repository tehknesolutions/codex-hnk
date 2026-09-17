import {
  createHnkCanonConsumerSnapshot,
  queryHnkCanon,
  validateHnkCanonContract,
  type HnkCanonKind,
  type HnkCanonQuery,
} from "@hnk/canon-contract";

export const MOBILE_HNK_CANON = createHnkCanonConsumerSnapshot("@hnk/mobile");

export function queryMobileHnkCanon(query: HnkCanonQuery = {}) {
  return queryHnkCanon(query);
}

export function validateMobileHnkCanon() {
  return validateHnkCanonContract();
}

export type MobileHnkCanonKind = HnkCanonKind;
