import { CorrespondenceRegistry } from "./registry.js";
import { RESEARCH_001_DATASETS, TRADITIONS } from "./datasets.js";

export interface RegistryInvariantReport {
  ok: boolean;
  checks: string[];
  failures: string[];
}

export function auditResearch001Registry(): RegistryInvariantReport {
  const registry = new CorrespondenceRegistry(RESEARCH_001_DATASETS);
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
  expect(registry.records.length === 173, "registry total is 173 records");
  expect(registry.gaps.length === 3, "registry preserves 3 explicit source gaps");

  const alephTarot = registry.compare("HEBREW_ALEPH", "TAROT_TRUMP");
  expect((alephTarot.by_tradition[TRADITIONS.GOLDEN_DAWN_STANDARD]?.length ?? 0) === 1, "Aleph Tarot exists in Golden Dawn");
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
  expect(hehValues.length === 3 && hehValues.every((value) => value === "ARIES"), "Heh→Aries survives across all three stored datasets");

  return { ok: failures.length === 0, checks, failures };
}
