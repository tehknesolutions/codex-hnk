import { CorrespondenceRegistry } from "./registry.js";
import { RESEARCH_001_DATASETS, TRADITIONS } from "./datasets.js";
import {
  TAROT_LINEAGE_DATASETS,
  TAROT_LINEAGE_TRADITIONS,
} from "./tarot-lineage-datasets.js";

export interface RegistryInvariantReport {
  ok: boolean;
  checks: string[];
  failures: string[];
}

export function auditResearch001Registry(): RegistryInvariantReport {
  const registry = new CorrespondenceRegistry([
    ...RESEARCH_001_DATASETS,
    ...TAROT_LINEAGE_DATASETS,
  ]);
  const checks: string[] = [];
  const failures: string[] = [];

  const expect = (condition: boolean, label: string) => {
    if (condition) checks.push(label);
    else failures.push(label);
  };

  const validation = registry.validate();
  expect(validation.ok, "contract validation passes");
  if (!validation.ok) failures.push(...validation.issues);

  const coverage = new Map(registry.coverage().map((entry) => [entry.tradition_id, entry]));
  expect(coverage.get(TRADITIONS.SEFER_YETZIRAH_REFERENCE_A)?.record_count === 44, "Sefer Yetzirah dataset has 44 scoped records");
  expect(coverage.get(TRADITIONS.GOLDEN_DAWN_STANDARD)?.record_count === 66, "Golden Dawn dataset has 66 scoped records");
  expect(coverage.get(TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA)?.record_count === 63, "Del Debbio dataset has 63 scoped records");
  expect(coverage.get(TAROT_LINEAGE_TRADITIONS.ELIPHAS_LEVI_SEQUENCE)?.record_count === 22, "Eliphas Levi dataset has 22 scoped Tarot records");
  expect(coverage.get(TAROT_LINEAGE_TRADITIONS.CROWLEY_THOTH)?.record_count === 22, "Crowley/Thoth dataset has 22 scoped Tarot records");
  expect(registry.records.length === 217, "registry total is 217 records");
  expect(registry.gaps.length === 3, "registry preserves 3 explicit source gaps");

  const alephTarot = registry.compare("HEBREW_ALEPH", "TAROT_TRUMP");
  expect((alephTarot.by_tradition[TRADITIONS.GOLDEN_DAWN_STANDARD]?.length ?? 0) === 1, "Aleph Tarot exists in Golden Dawn");
  expect((alephTarot.by_tradition[TAROT_LINEAGE_TRADITIONS.ELIPHAS_LEVI_SEQUENCE]?.[0]?.value) === "MAGICIAN", "Levi keeps Aleph→Magician");
  expect((alephTarot.by_tradition[TAROT_LINEAGE_TRADITIONS.CROWLEY_THOTH]?.[0]?.value) === "FOOL", "Thoth keeps Aleph→Fool");
  expect((alephTarot.by_tradition[TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA]?.length ?? 0) === 0, "Aleph Tarot is not inferred into Del Debbio");
  expect(alephTarot.gaps.some((gap) => gap.tradition_id === TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA), "Aleph Del Debbio gap is explicit");

  const bethPlanet = registry.compare("HEBREW_BETH", "PLANET");
  const syBeth = bethPlanet.by_tradition[TRADITIONS.SEFER_YETZIRAH_REFERENCE_A]?.[0]?.value;
  const gdBeth = bethPlanet.by_tradition[TRADITIONS.GOLDEN_DAWN_STANDARD]?.[0]?.value;
  const ddbBeth = bethPlanet.by_tradition[TRADITIONS.DEL_DEBBIO_KABBALAH_HERMETICA]?.[0]?.value;
  expect(syBeth === "SATURN", "consulted Sefer Yetzirah reference keeps Beth→Saturn");
  expect(gdBeth === "MERCURY", "Golden Dawn keeps Beth→Mercury");
  expect(ddbBeth === "MERCURY", "Del Debbio audit keeps Beth→Mercury");

  const hehZodiac = registry.compare("HEBREW_HEH", "ZODIAC");
  const hehValues = Object.values(hehZodiac.by_tradition).flat().map((record) => record.value);
  expect(hehValues.length === 3 && hehValues.every((value) => value === "ARIES"), "Heh→Aries survives across the three astrology-bearing datasets");

  const hehTarot = registry.compare("HEBREW_HEH", "TAROT_TRUMP");
  expect(hehTarot.by_tradition[TAROT_LINEAGE_TRADITIONS.ELIPHAS_LEVI_SEQUENCE]?.[0]?.value === "HIEROPHANT", "Levi keeps Heh→Hierophant");
  expect(hehTarot.by_tradition[TRADITIONS.GOLDEN_DAWN_STANDARD]?.[0]?.value === "EMPEROR", "Golden Dawn keeps Heh→Emperor");
  expect(hehTarot.by_tradition[TAROT_LINEAGE_TRADITIONS.CROWLEY_THOTH]?.[0]?.value === "STAR", "Thoth keeps Heh→Star");

  const tzaddiTarot = registry.compare("HEBREW_TZADDI", "TAROT_TRUMP");
  expect(tzaddiTarot.by_tradition[TAROT_LINEAGE_TRADITIONS.ELIPHAS_LEVI_SEQUENCE]?.[0]?.value === "MOON", "Levi keeps Tzaddi→Moon");
  expect(tzaddiTarot.by_tradition[TRADITIONS.GOLDEN_DAWN_STANDARD]?.[0]?.value === "STAR", "Golden Dawn keeps Tzaddi→Star");
  expect(tzaddiTarot.by_tradition[TAROT_LINEAGE_TRADITIONS.CROWLEY_THOTH]?.[0]?.value === "EMPEROR", "Thoth keeps Tzaddi→Emperor");

  return { ok: failures.length === 0, checks, failures };
}
