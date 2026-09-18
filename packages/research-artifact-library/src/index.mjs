import { validateClaimDossier } from "@hnk/claim-dossier";
import { validateEvidenceSynthesis } from "@hnk/evidence-synthesis";
import { sha256Canonical } from "@hnk/experiment-attestation";
import { queryReviewedClaimRegistry, validateReviewedClaimRegistry } from "@hnk/reviewed-claim-registry";

export const HNK_RESEARCH_ARTIFACT_LIBRARY_ID = "HNK_RESEARCH_ARTIFACT_LIBRARY_V1";
export const HNK_RESEARCH_ARTIFACT_LIBRARY_VERSION = "1.0.0";
export const HNK_RESEARCH_ARTIFACT_LIBRARY_BOUNDARY =
  "ARTIFACT_LIBRARY_CATALOGS_VALIDATED_RESEARCH_SNAPSHOTS_WITHOUT_INTERPRETING_TRUTH_RELEVANCE_OR_CANON";
export const HNK_RESEARCH_ARTIFACT_KINDS = Object.freeze([
  "CLAIM_DOSSIER",
  "EVIDENCE_SYNTHESIS",
]);

const HEX_64 = /^[0-9a-f]{64}$/;
const clone = (v) => JSON.parse(JSON.stringify(v));
function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
const nonEmpty = (v) => typeof v === "string" && Boolean(v.trim());
function cleanString(v, field) {
  if (!nonEmpty(v)) throw new TypeError(`${field} must be a non-empty string`);
  return v.trim();
}

function metadataFor(kind, payload) {
  if (kind === "CLAIM_DOSSIER") {
    const validation = validateClaimDossier(payload);
    if (!validation.ok) throw new Error(`invalid claim dossier: ${validation.issues.join("; ")}`);
    return {
      logical_key: payload.claim_id,
      content_digest: payload.dossier_digest,
      source_created_at: payload.created_at,
    };
  }
  if (kind === "EVIDENCE_SYNTHESIS") {
    const validation = validateEvidenceSynthesis(payload);
    if (!validation.ok) throw new Error(`invalid evidence synthesis: ${validation.issues.join("; ")}`);
    return {
      logical_key: payload.synthesis_key,
      content_digest: payload.synthesis_digest,
      source_created_at: payload.created_at,
    };
  }
  throw new RangeError(`unsupported artifact kind ${kind}`);
}

function artifactProjection(record) {
  const projected = clone(record);
  delete projected.artifact_digest;
  return projected;
}
function artifactDigest(record) {
  return sha256Canonical(artifactProjection(record));
}
export function researchArtifactLibraryProjection(library) {
  const projected = clone(library);
  delete projected.library_digest;
  return deepFreeze(projected);
}
function libraryDigest(library) {
  return sha256Canonical(researchArtifactLibraryProjection(library));
}

function entries(library) {
  const supersededBy = new Map();
  for (const artifact of library.artifacts) {
    if (artifact.supersedes_artifact_id) {
      supersededBy.set(artifact.supersedes_artifact_id, artifact.artifact_id);
    }
  }
  return library.artifacts.map((artifact) => ({
    ...clone(artifact),
    latest: !supersededBy.has(artifact.artifact_id),
    superseded_by_artifact_id: supersededBy.get(artifact.artifact_id) ?? null,
  }));
}

export function createResearchArtifactLibrary(input) {
  if (!input || typeof input !== "object") throw new TypeError("artifact library input required");
  const library = {
    library_id: HNK_RESEARCH_ARTIFACT_LIBRARY_ID,
    library_version: HNK_RESEARCH_ARTIFACT_LIBRARY_VERSION,
    authority: "HNK_AUTHORED_RESEARCH_ARTIFACT_LIBRARY",
    library_key: cleanString(input.library_key, "library_key"),
    title: cleanString(input.title, "title"),
    created_at: cleanString(input.created_at, "created_at"),
    artifacts: [],
    library_digest: "",
    persistence: "USER_CONTROLLED_FILE_ONLY",
    server_persistence: false,
    browser_persistence: false,
    immutable_history: true,
    latest_selection_rule: "HIGHEST_LIBRARY_REVISION_PER_KIND_AND_LOGICAL_KEY",
    automatic_truth_inference: false,
    automatic_relevance_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_RESEARCH_ARTIFACT_LIBRARY_BOUNDARY,
  };
  library.library_digest = libraryDigest(library);
  return deepFreeze(library);
}

export function addResearchArtifact(library, input) {
  const validation = validateResearchArtifactLibrary(library);
  if (!validation.ok) throw new Error(`invalid artifact library: ${validation.issues.join("; ")}`);
  if (!input || typeof input !== "object") throw new TypeError("artifact input required");
  if (!HNK_RESEARCH_ARTIFACT_KINDS.includes(input.kind)) throw new RangeError(`invalid artifact kind ${input.kind}`);

  const meta = metadataFor(input.kind, input.payload);
  if (library.artifacts.some((a) => a.kind === input.kind && a.content_digest === meta.content_digest)) {
    throw new Error(`duplicate artifact content digest ${meta.content_digest}`);
  }

  const lineage = library.artifacts
    .filter((a) => a.kind === input.kind && a.logical_key === meta.logical_key)
    .sort((a, b) => a.revision - b.revision);
  const previous = lineage.at(-1) ?? null;
  const revision = previous ? previous.revision + 1 : 1;
  const artifactId = `${input.kind}:${meta.logical_key}:r${revision}:${meta.content_digest.slice(0, 16)}`;

  const record = {
    artifact_id: artifactId,
    kind: input.kind,
    logical_key: meta.logical_key,
    revision,
    content_digest: meta.content_digest,
    source_created_at: meta.source_created_at,
    added_at: cleanString(input.added_at, "added_at"),
    supersedes_artifact_id: previous?.artifact_id ?? null,
    payload: clone(input.payload),
    artifact_digest: "",
  };
  record.artifact_digest = artifactDigest(record);

  const next = clone(library);
  next.artifacts.push(record);
  next.library_digest = libraryDigest(next);
  const nextValidation = validateResearchArtifactLibrary(next);
  if (!nextValidation.ok) throw new Error(`artifact produced invalid library: ${nextValidation.issues.join("; ")}`);
  return deepFreeze(next);
}

export function validateResearchArtifactLibrary(library) {
  const issues = [];
  if (!library || typeof library !== "object") return deepFreeze({ ok:false, issues:["library must be object"] });

  if (library.library_id !== HNK_RESEARCH_ARTIFACT_LIBRARY_ID) issues.push(`unexpected library_id ${library.library_id}`);
  if (library.library_version !== HNK_RESEARCH_ARTIFACT_LIBRARY_VERSION) issues.push(`unexpected library_version ${library.library_version}`);
  if (library.authority !== "HNK_AUTHORED_RESEARCH_ARTIFACT_LIBRARY") issues.push(`unexpected authority ${library.authority}`);
  for (const field of ["library_key","title","created_at"]) if (!nonEmpty(library[field])) issues.push(`${field} required`);
  if (!Array.isArray(library.artifacts)) issues.push("artifacts must be array");

  if (Array.isArray(library.artifacts)) {
    const ids = new Set(), digestKeys = new Set(), lineages = new Map();
    for (const artifact of library.artifacts) {
      if (!artifact || typeof artifact !== "object") { issues.push("artifact must be object"); continue; }
      for (const field of ["artifact_id","kind","logical_key","content_digest","source_created_at","added_at","artifact_digest"]) {
        if (!nonEmpty(artifact[field])) issues.push(`artifact ${field} required`);
      }
      if (!HNK_RESEARCH_ARTIFACT_KINDS.includes(artifact.kind)) issues.push(`${artifact.artifact_id}: invalid kind`);
      if (!Number.isInteger(artifact.revision) || artifact.revision < 1) issues.push(`${artifact.artifact_id}: revision must be >=1`);
      if (!HEX_64.test(artifact.content_digest ?? "")) issues.push(`${artifact.artifact_id}: content_digest must be SHA-256 hex`);
      if (!HEX_64.test(artifact.artifact_digest ?? "")) issues.push(`${artifact.artifact_id}: artifact_digest must be SHA-256 hex`);
      if (artifact.supersedes_artifact_id !== null && !nonEmpty(artifact.supersedes_artifact_id)) issues.push(`${artifact.artifact_id}: invalid supersedes_artifact_id`);

      try {
        const meta = metadataFor(artifact.kind, artifact.payload);
        if (meta.logical_key !== artifact.logical_key || meta.content_digest !== artifact.content_digest || meta.source_created_at !== artifact.source_created_at) {
          issues.push(`${artifact.artifact_id}: payload metadata drift`);
        }
      } catch (error) {
        issues.push(`${artifact.artifact_id}: ${error instanceof Error ? error.message : "invalid payload"}`);
      }

      if (HEX_64.test(artifact.artifact_digest ?? "") && artifactDigest(artifact) !== artifact.artifact_digest) {
        issues.push(`${artifact.artifact_id}: artifact_digest mismatch`);
      }
      if (ids.has(artifact.artifact_id)) issues.push(`duplicate artifact_id ${artifact.artifact_id}`);
      ids.add(artifact.artifact_id);
      const dk = `${artifact.kind}::${artifact.content_digest}`;
      if (digestKeys.has(dk)) issues.push(`duplicate content digest ${dk}`);
      digestKeys.add(dk);
      const lk = `${artifact.kind}::${artifact.logical_key}`;
      const arr = lineages.get(lk) ?? [];
      arr.push(artifact);
      lineages.set(lk, arr);
    }

    for (const [key, lineage] of lineages.entries()) {
      lineage.sort((a,b)=>a.revision-b.revision);
      lineage.forEach((artifact,index) => {
        const expected = index + 1;
        if (artifact.revision !== expected) issues.push(`${key}: revisions must be contiguous from 1`);
        const expectedPrevious = index === 0 ? null : lineage[index-1].artifact_id;
        if (artifact.supersedes_artifact_id !== expectedPrevious) issues.push(`${artifact.artifact_id}: supersession chain drift`);
      });
    }
  }

  if (library.persistence !== "USER_CONTROLLED_FILE_ONLY") issues.push("persistence must remain USER_CONTROLLED_FILE_ONLY");
  if (library.server_persistence !== false) issues.push("server_persistence must remain false");
  if (library.browser_persistence !== false) issues.push("browser_persistence must remain false");
  if (library.immutable_history !== true) issues.push("immutable_history must remain true");
  if (library.latest_selection_rule !== "HIGHEST_LIBRARY_REVISION_PER_KIND_AND_LOGICAL_KEY") issues.push("latest_selection_rule drift");
  if (library.automatic_truth_inference !== false) issues.push("automatic_truth_inference must remain false");
  if (library.automatic_relevance_inference !== false) issues.push("automatic_relevance_inference must remain false");
  if (library.automatic_canon_promotion !== false) issues.push("automatic_canon_promotion must remain false");
  if (library.canon_promotion_permitted !== false) issues.push("canon_promotion_permitted must remain false");
  if (library.claim_boundary !== HNK_RESEARCH_ARTIFACT_LIBRARY_BOUNDARY) issues.push("claim_boundary drift");
  if (!HEX_64.test(library.library_digest ?? "")) issues.push("library_digest must be SHA-256 hex");
  else if (libraryDigest(library) !== library.library_digest) issues.push("library_digest mismatch");

  return deepFreeze({ ok: issues.length === 0, issues });
}

export function researchArtifactLibraryIndex(library) {
  const validation = validateResearchArtifactLibrary(library);
  if (!validation.ok) throw new Error(`cannot index invalid artifact library: ${validation.issues.join("; ")}`);
  const indexed = entries(library);
  return deepFreeze({
    library_key: library.library_key,
    total_artifacts: indexed.length,
    claim_dossiers: indexed.filter((x)=>x.kind==="CLAIM_DOSSIER").length,
    evidence_syntheses: indexed.filter((x)=>x.kind==="EVIDENCE_SYNTHESIS").length,
    logical_keys: new Set(indexed.map((x)=>`${x.kind}::${x.logical_key}`)).size,
    latest_artifacts: indexed.filter((x)=>x.latest).length,
    artifacts: indexed,
    truth_assessed: false,
    relevance_inferred: false,
    canon_promotion_permitted: false,
  });
}

export function queryResearchArtifactLibrary(library, query = {}) {
  const indexed = researchArtifactLibraryIndex(library);
  let result = [...indexed.artifacts];
  if (query.latest_only !== false) result = result.filter((x)=>x.latest);
  if (query.kind) result = result.filter((x)=>x.kind===query.kind);
  if (query.logical_key) result = result.filter((x)=>x.logical_key===query.logical_key);
  if (query.content_digest) result = result.filter((x)=>x.content_digest===query.content_digest);
  if (nonEmpty(query.q)) {
    const needle = query.q.trim().toLowerCase();
    result = result.filter((x)=>[
      x.artifact_id,x.kind,x.logical_key,x.content_digest,x.source_created_at,x.added_at
    ].some((v)=>String(v).toLowerCase().includes(needle)));
  }
  return deepFreeze(result);
}

export function resolveReevaluationArtifactBundle(library, reviewedRegistry) {
  const libValidation = validateResearchArtifactLibrary(library);
  if (!libValidation.ok) throw new Error(`invalid artifact library: ${libValidation.issues.join("; ")}`);
  const regValidation = validateReviewedClaimRegistry(reviewedRegistry);
  if (!regValidation.ok) throw new Error(`invalid reviewed claim registry: ${regValidation.issues.join("; ")}`);

  const active = queryReviewedClaimRegistry(reviewedRegistry, { active_only:true });
  const dossierByDigest = new Map(
    library.artifacts
      .filter((a)=>a.kind==="CLAIM_DOSSIER")
      .map((a)=>[a.content_digest,a]),
  );
  const latestSynthByKey = new Map();
  for (const artifact of library.artifacts.filter((a)=>a.kind==="EVIDENCE_SYNTHESIS")) {
    const current = latestSynthByKey.get(artifact.logical_key);
    if (!current || artifact.revision > current.revision) latestSynthByKey.set(artifact.logical_key, artifact);
  }

  const resolutions = [];
  const dossierMap = new Map();
  const synthMap = new Map();

  for (const record of active) {
    const dossierArtifact = dossierByDigest.get(record.dossier_digest) ?? null;
    const synthArtifact = latestSynthByKey.get(record.synthesis_key) ?? null;
    if (dossierArtifact) dossierMap.set(dossierArtifact.content_digest, clone(dossierArtifact.payload));
    if (synthArtifact) synthMap.set(synthArtifact.logical_key, clone(synthArtifact.payload));
    resolutions.push({
      claim_id: record.claim_id,
      reviewed_record_id: record.record_id,
      dossier_digest: record.dossier_digest,
      synthesis_key: record.synthesis_key,
      original_synthesis_digest: record.synthesis_digest,
      dossier_found: Boolean(dossierArtifact),
      candidate_synthesis_found: Boolean(synthArtifact),
      selected_candidate_synthesis_digest: synthArtifact?.content_digest ?? null,
      selected_candidate_revision: synthArtifact?.revision ?? null,
    });
  }

  return deepFreeze({
    reviewed_registry_key: reviewedRegistry.registry_key,
    original_dossiers: [...dossierMap.values()],
    candidate_syntheses: [...synthMap.values()],
    resolutions,
    active_claims: active.length,
    dossier_coverage: resolutions.filter((x)=>x.dossier_found).length,
    synthesis_coverage: resolutions.filter((x)=>x.candidate_synthesis_found).length,
    coverage_complete: resolutions.every((x)=>x.dossier_found && x.candidate_synthesis_found),
    machine_inferred_relevance: false,
    candidate_selection_rule: "HIGHEST_LIBRARY_REVISION_PER_SYNTHESIS_KEY",
  });
}

export function serializeResearchArtifactLibrary(library) {
  const validation = validateResearchArtifactLibrary(library);
  if (!validation.ok) throw new Error(`cannot serialize invalid artifact library: ${validation.issues.join("; ")}`);
  return `${JSON.stringify(library,null,2)}\n`;
}
export function parseResearchArtifactLibrary(text) {
  if (!nonEmpty(text)) throw new TypeError("artifact library JSON text required");
  let library;
  try { library = JSON.parse(text); }
  catch (error) { throw new SyntaxError(`invalid artifact library JSON: ${error instanceof Error ? error.message : "parse failed"}`); }
  const validation = validateResearchArtifactLibrary(library);
  if (!validation.ok) throw new Error(`invalid artifact library: ${validation.issues.join("; ")}`);
  return deepFreeze(library);
}

export function researchArtifactLibrarySummary() {
  return deepFreeze({
    library_id: HNK_RESEARCH_ARTIFACT_LIBRARY_ID,
    version: HNK_RESEARCH_ARTIFACT_LIBRARY_VERSION,
    kinds: [...HNK_RESEARCH_ARTIFACT_KINDS],
    append_only_revision_history: true,
    exact_content_digest_identity: true,
    latest_selection_rule: "HIGHEST_LIBRARY_REVISION_PER_KIND_AND_LOGICAL_KEY",
    reevaluation_bundle_resolution: true,
    machine_inferred_relevance: false,
    automatic_truth_inference: false,
    automatic_canon_promotion: false,
    canon_promotion_permitted: false,
    claim_boundary: HNK_RESEARCH_ARTIFACT_LIBRARY_BOUNDARY,
  });
}
