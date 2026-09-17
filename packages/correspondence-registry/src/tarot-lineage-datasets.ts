import type { CorrespondenceRecord, CorrespondenceSourceRef } from "@hnk/correspondence-contract";
import type { RegistryDataset } from "./types.js";

const LETTERS = [
  ["ALEPH", 1], ["BETH", 2], ["GIMEL", 3], ["DALETH", 4], ["HEH", 5], ["VAV", 6],
  ["ZAIN", 7], ["CHETH", 8], ["TETH", 9], ["YOD", 10], ["KAPH", 11], ["LAMED", 12],
  ["MEM", 13], ["NUN", 14], ["SAMEKH", 15], ["AYIN", 16], ["PEH", 17], ["TZADDI", 18],
  ["QOPH", 19], ["RESH", 20], ["SHIN", 21], ["TAV", 22],
] as const;

type LetterId = (typeof LETTERS)[number][0];
type TarotMapping = Record<LetterId, { number: number; title: string }>;

export const TAROT_LINEAGE_TRADITIONS = {
  ELIPHAS_LEVI_SEQUENCE: "ELIPHAS_LEVI_SEQUENCE",
  CROWLEY_THOTH: "CROWLEY_THOTH",
} as const;

const SOURCE_LEVI: CorrespondenceSourceRef = {
  id: "SRC-LEVI-DOGME-RITUEL",
  title: "Dogme et Rituel de la Haute Magie",
  author_or_order: "Éliphas Lévi",
  date_label: "1854–1856",
};

const SOURCE_THOTH: CorrespondenceSourceRef = {
  id: "SRC-CROWLEY-BOOK-OF-THOTH",
  title: "The Book of Thoth",
  author_or_order: "Aleister Crowley",
  date_label: "1944 publication",
};

const LEVI_TAROT: TarotMapping = {
  ALEPH: { number: 1, title: "MAGICIAN" },
  BETH: { number: 2, title: "HIGH_PRIESTESS" },
  GIMEL: { number: 3, title: "EMPRESS" },
  DALETH: { number: 4, title: "EMPEROR" },
  HEH: { number: 5, title: "HIEROPHANT" },
  VAV: { number: 6, title: "LOVERS" },
  ZAIN: { number: 7, title: "CHARIOT" },
  CHETH: { number: 8, title: "JUSTICE" },
  TETH: { number: 9, title: "HERMIT" },
  YOD: { number: 10, title: "WHEEL_OF_FORTUNE" },
  KAPH: { number: 11, title: "STRENGTH" },
  LAMED: { number: 12, title: "HANGED_MAN" },
  MEM: { number: 13, title: "DEATH" },
  NUN: { number: 14, title: "TEMPERANCE" },
  SAMEKH: { number: 15, title: "DEVIL" },
  AYIN: { number: 16, title: "TOWER" },
  PEH: { number: 17, title: "STAR" },
  TZADDI: { number: 18, title: "MOON" },
  QOPH: { number: 19, title: "SUN" },
  RESH: { number: 20, title: "JUDGEMENT" },
  SHIN: { number: 0, title: "FOOL" },
  TAV: { number: 21, title: "WORLD" },
};

const THOTH_TAROT: TarotMapping = {
  ALEPH: { number: 0, title: "FOOL" },
  BETH: { number: 1, title: "MAGUS" },
  GIMEL: { number: 2, title: "PRIESTESS" },
  DALETH: { number: 3, title: "EMPRESS" },
  HEH: { number: 17, title: "STAR" },
  VAV: { number: 5, title: "HIEROPHANT" },
  ZAIN: { number: 6, title: "LOVERS" },
  CHETH: { number: 7, title: "CHARIOT" },
  TETH: { number: 11, title: "LUST" },
  YOD: { number: 9, title: "HERMIT" },
  KAPH: { number: 10, title: "FORTUNE" },
  LAMED: { number: 8, title: "ADJUSTMENT" },
  MEM: { number: 12, title: "HANGED_MAN" },
  NUN: { number: 13, title: "DEATH" },
  SAMEKH: { number: 14, title: "ART" },
  AYIN: { number: 15, title: "DEVIL" },
  PEH: { number: 16, title: "TOWER" },
  TZADDI: { number: 4, title: "EMPEROR" },
  QOPH: { number: 18, title: "MOON" },
  RESH: { number: 19, title: "SUN" },
  SHIN: { number: 20, title: "AEON" },
  TAV: { number: 21, title: "UNIVERSE" },
};

function tarotRecords(options: {
  prefix: string;
  tradition_id: string;
  historical_layer: string;
  source: CorrespondenceSourceRef;
  mapping: TarotMapping;
  notes: string;
}): CorrespondenceRecord[] {
  return LETTERS.map(([letter, letterPosition]) => ({
    id: `${options.prefix}-${letter}-TAROT_TRUMP`,
    subject_id: `HEBREW_${letter}`,
    domain: "TAROT_TRUMP",
    value: options.mapping[letter].title,
    tradition_id: options.tradition_id,
    system_version: "1.0.0",
    historical_layer: options.historical_layer,
    origin: "HISTORICAL_SOURCE",
    claim_kind: "CORRESPONDENCE",
    evidence_scope: "SOURCE_SCOPED",
    decision: "REFERENCE",
    ordinals: {
      hebrew_letter_position: letterPosition,
      tarot_card_number: options.mapping[letter].number,
    },
    sources: [options.source],
    notes: options.notes,
  }));
}

const LEVI_RECORDS = tarotRecords({
  prefix: "LEVI",
  tradition_id: TAROT_LINEAGE_TRADITIONS.ELIPHAS_LEVI_SEQUENCE,
  historical_layer: "PRE_GOLDEN_DAWN_TAROT_OCCULTISM",
  source: SOURCE_LEVI,
  mapping: LEVI_TAROT,
  notes: "Reference sequence preserved from Comparative Pass 004; Tarot number and Hebrew-letter position remain separate ordinals.",
});

const THOTH_RECORDS = tarotRecords({
  prefix: "THOTH",
  tradition_id: TAROT_LINEAGE_TRADITIONS.CROWLEY_THOTH,
  historical_layer: "CROWLEY_THOTH_COUNTERCHANGE",
  source: SOURCE_THOTH,
  mapping: THOTH_TAROT,
  notes: "Reference mapping preserves Crowley/Thoth titles and the Heh↔Tzaddi counterchange; no automatic HNK adoption.",
});

export const TAROT_LINEAGE_DATASETS: readonly RegistryDataset[] = [
  {
    id: "HNK-R001-DATASET-ELIPHAS-LEVI",
    label: "Éliphas Lévi — Tarot/Hebrew sequence",
    tradition_id: TAROT_LINEAGE_TRADITIONS.ELIPHAS_LEVI_SEQUENCE,
    system_version: "1.0.0",
    records: LEVI_RECORDS,
    gaps: [],
  },
  {
    id: "HNK-R001-DATASET-CROWLEY-THOTH",
    label: "Crowley / Thoth — Tarot/Hebrew sequence",
    tradition_id: TAROT_LINEAGE_TRADITIONS.CROWLEY_THOTH,
    system_version: "1.0.0",
    records: THOTH_RECORDS,
    gaps: [],
  },
];
