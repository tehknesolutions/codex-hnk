import type {
  CorrespondenceOrdinalIdentity,
  CorrespondenceRecord,
  CorrespondenceSourceRef,
} from "@hnk/correspondence-contract";
import type { CorrespondenceGap, RegistryDataset } from "./types.js";

const LETTERS = [
  ["ALEPH", 1], ["BETH", 2], ["GIMEL", 3], ["DALETH", 4], ["HEH", 5], ["VAV", 6],
  ["ZAIN", 7], ["CHETH", 8], ["TETH", 9], ["YOD", 10], ["KAPH", 11], ["LAMED", 12],
  ["MEM", 13], ["NUN", 14], ["SAMEKH", 15], ["AYIN", 16], ["PEH", 17], ["TZADDI", 18],
  ["QOPH", 19], ["RESH", 20], ["SHIN", 21], ["TAV", 22],
] as const;

type LetterId = (typeof LETTERS)[number][0];
type Mapping = Partial<Record<LetterId, string>>;
type NumberMapping = Partial<Record<LetterId, number>>;

export const TRADITIONS = {
  SEFER_YETZIRAH_REFERENCE_A: "SEFER_YETZIRAH_REFERENCE_A",
  GOLDEN_DAWN_STANDARD: "GOLDEN_DAWN_STANDARD",
  DEL_DEBBIO_KABBALAH_HERMETICA: "DEL_DEBBIO_KABBALAH_HERMETICA",
} as const;

const SOURCE_SY: CorrespondenceSourceRef = {
  id: "SRC-SY-REFERENCE-A",
  title: "Sefer Yetzirah",
  edition_or_recension: "Consulted reference text; planetary mappings are recension-sensitive",
  url: "https://www.sefaria.org/Sefer_Yetzirah",
  date_label: "ancient/late-antique text; consulted modern digital edition",
};

const SOURCE_GD: CorrespondenceSourceRef = {
  id: "SRC-GD-STANDARD",
  title: "Golden Dawn correspondence system",
  author_or_order: "Hermetic Order of the Golden Dawn",
  edition_or_recension: "Cipher Manuscript / standard later Golden Dawn lineage",
  date_label: "late 19th century",
};

const SOURCE_DEL_DEBBIO: CorrespondenceSourceRef = {
  id: "SRC-DEL-DEBBIO-KABBALAH-HERMETICA",
  title: "Kabbalah Hermética",
  author_or_order: "Marcelo Del Debbio",
  edition_or_recension: "PDF supplied to HNK Research 001",
  date_label: "research source",
};

const LETTER_CLASS: Record<LetterId, string> = {
  ALEPH: "MOTHER", BETH: "DOUBLE", GIMEL: "DOUBLE", DALETH: "DOUBLE", HEH: "SIMPLE", VAV: "SIMPLE",
  ZAIN: "SIMPLE", CHETH: "SIMPLE", TETH: "SIMPLE", YOD: "SIMPLE", KAPH: "DOUBLE", LAMED: "SIMPLE",
  MEM: "MOTHER", NUN: "SIMPLE", SAMEKH: "SIMPLE", AYIN: "SIMPLE", PEH: "DOUBLE", TZADDI: "SIMPLE",
  QOPH: "SIMPLE", RESH: "DOUBLE", SHIN: "MOTHER", TAV: "DOUBLE",
};

const SY_ELEMENTS: Mapping = { ALEPH: "AIR", MEM: "WATER", SHIN: "FIRE" };
const SY_PLANETS: Mapping = {
  BETH: "SATURN", GIMEL: "JUPITER", DALETH: "MARS", KAPH: "SUN", PEH: "VENUS", RESH: "MERCURY", TAV: "MOON",
};
const ZODIAC: Mapping = {
  HEH: "ARIES", VAV: "TAURUS", ZAIN: "GEMINI", CHETH: "CANCER", TETH: "LEO", YOD: "VIRGO",
  LAMED: "LIBRA", NUN: "SCORPIO", SAMEKH: "SAGITTARIUS", AYIN: "CAPRICORN", TZADDI: "AQUARIUS", QOPH: "PISCES",
};

const GD_ELEMENTS: Mapping = { ALEPH: "AIR", MEM: "WATER", SHIN: "FIRE" };
const GD_PLANETS: Mapping = {
  BETH: "MERCURY", GIMEL: "MOON", DALETH: "VENUS", KAPH: "JUPITER", PEH: "MARS", RESH: "SUN", TAV: "SATURN",
};
const GD_TAROT: Mapping = {
  ALEPH: "FOOL", BETH: "MAGICIAN", GIMEL: "HIGH_PRIESTESS", DALETH: "EMPRESS", HEH: "EMPEROR", VAV: "HIEROPHANT",
  ZAIN: "LOVERS", CHETH: "CHARIOT", TETH: "STRENGTH", YOD: "HERMIT", KAPH: "WHEEL_OF_FORTUNE", LAMED: "JUSTICE",
  MEM: "HANGED_MAN", NUN: "DEATH", SAMEKH: "TEMPERANCE", AYIN: "DEVIL", PEH: "TOWER", TZADDI: "STAR",
  QOPH: "MOON", RESH: "SUN", SHIN: "JUDGEMENT", TAV: "WORLD",
};
const GD_TAROT_NUMBERS: NumberMapping = {
  ALEPH: 0, BETH: 1, GIMEL: 2, DALETH: 3, HEH: 4, VAV: 5, ZAIN: 6, CHETH: 7, TETH: 11, YOD: 9,
  KAPH: 10, LAMED: 8, MEM: 12, NUN: 13, SAMEKH: 14, AYIN: 15, PEH: 16, TZADDI: 17, QOPH: 18, RESH: 19,
  SHIN: 20, TAV: 21,
};
const TREE_PATHS: Record<LetterId, string> = {
  ALEPH: "KETHER↔CHOKMAH", BETH: "KETHER↔BINAH", GIMEL: "KETHER↔TIPHERETH", DALETH: "CHOKMAH↔BINAH",
  HEH: "CHOKMAH↔TIPHERETH", VAV: "CHOKMAH↔CHESED", ZAIN: "BINAH↔TIPHERETH", CHETH: "BINAH↔GEBURAH",
  TETH: "CHESED↔GEBURAH", YOD: "CHESED↔TIPHERETH", KAPH: "CHESED↔NETZACH", LAMED: "GEBURAH↔TIPHERETH",
  MEM: "GEBURAH↔HOD", NUN: "TIPHERETH↔NETZACH", SAMEKH: "TIPHERETH↔YESOD", AYIN: "TIPHERETH↔HOD",
  PEH: "NETZACH↔HOD", TZADDI: "NETZACH↔YESOD", QOPH: "NETZACH↔MALKUTH", RESH: "HOD↔YESOD",
  SHIN: "HOD↔MALKUTH", TAV: "YESOD↔MALKUTH",
};

const DEL_DEBBIO_AVAILABLE = new Set<LetterId>(LETTERS.map(([id]) => id).filter((id) => id !== "ALEPH"));

function makeRecords(options: {
  prefix: string;
  tradition_id: string;
  system_version: string;
  historical_layer: string;
  source: CorrespondenceSourceRef;
  domain: string;
  mapping: Mapping;
  tarotNumbers?: NumberMapping;
  include?: ReadonlySet<LetterId>;
  notes?: string;
}): CorrespondenceRecord[] {
  return LETTERS.flatMap(([letter, position]) => {
    if (options.include && !options.include.has(letter)) return [];
    const value = options.mapping[letter];
    if (!value) return [];

    const ordinals: CorrespondenceOrdinalIdentity = { hebrew_letter_position: position };
    if (options.domain === "TREE_PATH") ordinals.path_number = position + 10;
    const tarotNumber = options.tarotNumbers?.[letter];
    if (tarotNumber !== undefined) ordinals.tarot_card_number = tarotNumber;

    return [{
      id: `${options.prefix}-${letter}-${options.domain}`,
      subject_id: `HEBREW_${letter}`,
      domain: options.domain,
      value,
      tradition_id: options.tradition_id,
      system_version: options.system_version,
      historical_layer: options.historical_layer,
      origin: "HISTORICAL_SOURCE",
      claim_kind: "CORRESPONDENCE",
      evidence_scope: "SOURCE_SCOPED",
      decision: "REFERENCE",
      ordinals,
      sources: [options.source],
      notes: options.notes,
    } satisfies CorrespondenceRecord];
  });
}

function classRecords(): CorrespondenceRecord[] {
  return makeRecords({
    prefix: "SY-A",
    tradition_id: TRADITIONS.SEFER_YETZIRAH_REFERENCE_A,
    system_version: "1.0.0",
    historical_layer: "SEFER_YETZIRAH_CORE_CLASSIFICATION",
    source: SOURCE_SY,
    domain: "LETTER_CLASS",
    mapping: LETTER_CLASS,
    notes: "3 Mothers / 7 Doubles / 12 Simples classification.",
  });
}

const SEFER_YETZIRAH_RECORDS: CorrespondenceRecord[] = [
  ...classRecords(),
  ...makeRecords({ prefix: "SY-A", tradition_id: TRADITIONS.SEFER_YETZIRAH_REFERENCE_A, system_version: "1.0.0", historical_layer: "SEFER_YETZIRAH_CORE", source: SOURCE_SY, domain: "ELEMENT", mapping: SY_ELEMENTS }),
  ...makeRecords({ prefix: "SY-A", tradition_id: TRADITIONS.SEFER_YETZIRAH_REFERENCE_A, system_version: "1.0.0", historical_layer: "SEFER_YETZIRAH_RECENSION_SENSITIVE", source: SOURCE_SY, domain: "PLANET", mapping: SY_PLANETS, notes: "Planetary allocation is recension-sensitive; this record set represents the consulted reference text only." }),
  ...makeRecords({ prefix: "SY-A", tradition_id: TRADITIONS.SEFER_YETZIRAH_REFERENCE_A, system_version: "1.0.0", historical_layer: "SEFER_YETZIRAH_CORE", source: SOURCE_SY, domain: "ZODIAC", mapping: ZODIAC }),
];

const GOLDEN_DAWN_RECORDS: CorrespondenceRecord[] = [
  ...makeRecords({ prefix: "GD", tradition_id: TRADITIONS.GOLDEN_DAWN_STANDARD, system_version: "1.0.0", historical_layer: "GOLDEN_DAWN_SYNTHESIS", source: SOURCE_GD, domain: "ELEMENT", mapping: GD_ELEMENTS }),
  ...makeRecords({ prefix: "GD", tradition_id: TRADITIONS.GOLDEN_DAWN_STANDARD, system_version: "1.0.0", historical_layer: "GOLDEN_DAWN_SYNTHESIS", source: SOURCE_GD, domain: "PLANET", mapping: GD_PLANETS }),
  ...makeRecords({ prefix: "GD", tradition_id: TRADITIONS.GOLDEN_DAWN_STANDARD, system_version: "1.0.0", historical_layer: "GOLDEN_DAWN_SYNTHESIS", source: SOURCE_GD, domain: "ZODIAC", mapping: ZODIAC }),
  ...makeRecords({ prefix: "GD", tradition_id: TRADITIONS.GOLDEN_DAWN_STANDARD, system_version: "1.0.0", historical_layer: "GOLDEN_DAWN_SYNTHESIS", source: SOURCE_GD, domain: "TAROT_TRUMP", mapping: GD_TAROT, tarotNumbers: GD_TAROT_NUMBERS }),
  ...makeRecords({ prefix: "GD", tradition_id: TRADITIONS.GOLDEN_DAWN_STANDARD, system_version: "1.0.0", historical_layer: "GOLDEN_DAWN_KIRCHER_STYLE_TREE", source: SOURCE_GD, domain: "TREE_PATH", mapping: TREE_PATHS }),
];

const DEL_DEBBIO_RECORDS: CorrespondenceRecord[] = [
  ...makeRecords({ prefix: "DDB", tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA, system_version: "1.0.0", historical_layer: "DEL_DEBBIO_HERMETIC_SYNTHESIS", source: SOURCE_DEL_DEBBIO, domain: "ELEMENT", mapping: { MEM: "WATER", SHIN: "FIRE" }, include: DEL_DEBBIO_AVAILABLE }),
  ...makeRecords({ prefix: "DDB", tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA, system_version: "1.0.0", historical_layer: "DEL_DEBBIO_HERMETIC_SYNTHESIS", source: SOURCE_DEL_DEBBIO, domain: "PLANET", mapping: GD_PLANETS, include: DEL_DEBBIO_AVAILABLE }),
  ...makeRecords({ prefix: "DDB", tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA, system_version: "1.0.0", historical_layer: "DEL_DEBBIO_HERMETIC_SYNTHESIS", source: SOURCE_DEL_DEBBIO, domain: "ZODIAC", mapping: ZODIAC, include: DEL_DEBBIO_AVAILABLE }),
  ...makeRecords({ prefix: "DDB", tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA, system_version: "1.0.0", historical_layer: "DEL_DEBBIO_HERMETIC_SYNTHESIS", source: SOURCE_DEL_DEBBIO, domain: "TAROT_TRUMP", mapping: GD_TAROT, tarotNumbers: GD_TAROT_NUMBERS, include: DEL_DEBBIO_AVAILABLE, notes: "Research 001 found the available PDF sheets aligned with the standard Golden Dawn Tarot/path scheme." }),
  ...makeRecords({ prefix: "DDB", tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA, system_version: "1.0.0", historical_layer: "DEL_DEBBIO_HERMETIC_SYNTHESIS", source: SOURCE_DEL_DEBBIO, domain: "TREE_PATH", mapping: TREE_PATHS, include: DEL_DEBBIO_AVAILABLE, notes: "ALEPH intentionally omitted because its individual sheet is absent from the supplied PDF." }),
];

const DEL_DEBBIO_GAPS: CorrespondenceGap[] = [
  { id: "DDB-GAP-ALEPH-TAROT", subject_id: "HEBREW_ALEPH", domain: "TAROT_TRUMP", tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA, reason: "The supplied PDF ends at the beginning of Beit; Aleph is named but its individual sheet is absent.", source_id: SOURCE_DEL_DEBBIO.id },
  { id: "DDB-GAP-ALEPH-PATH", subject_id: "HEBREW_ALEPH", domain: "TREE_PATH", tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA, reason: "The supplied PDF does not contain Aleph's individual path sheet.", source_id: SOURCE_DEL_DEBBIO.id },
  { id: "DDB-GAP-ALEPH-ELEMENT", subject_id: "HEBREW_ALEPH", domain: "ELEMENT", tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA, reason: "No Aleph sheet is present; do not infer the element from Golden Dawn into the Del Debbio dataset.", source_id: SOURCE_DEL_DEBBIO.id },
];

export const RESEARCH_001_DATASETS: readonly RegistryDataset[] = [
  {
    id: "HNK-R001-DATASET-SEFER-YETZIRAH-A",
    label: "Sefer Yetzirah — consulted reference set",
    tradition_id: TRADITIONS.SEFER_YETZIRAH_REFERENCE_A,
    system_version: "1.0.0",
    records: SEFER_YETZIRAH_RECORDS,
    gaps: [],
  },
  {
    id: "HNK-R001-DATASET-GOLDEN-DAWN",
    label: "Golden Dawn — standard correspondence set",
    tradition_id: TRADITIONS.GOLDEN_DAWN_STANDARD,
    system_version: "1.0.0",
    records: GOLDEN_DAWN_RECORDS,
    gaps: [],
  },
  {
    id: "HNK-R001-DATASET-DEL-DEBBIO",
    label: "Marcelo Del Debbio — Kabbalah Hermética PDF audit",
    tradition_id: TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA,
    system_version: "1.0.0",
    records: DEL_DEBBIO_RECORDS,
    gaps: DEL_DEBBIO_GAPS,
  },
];

export const RESEARCH_001_RECORDS = RESEARCH_001_DATASETS.flatMap((dataset) => [...dataset.records]);
export const RESEARCH_001_GAPS = RESEARCH_001_DATASETS.flatMap((dataset) => [...dataset.gaps]);
