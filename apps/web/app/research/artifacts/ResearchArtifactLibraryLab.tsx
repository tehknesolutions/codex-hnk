"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_RESEARCH_ARTIFACT_KINDS,
  addResearchArtifact,
  createResearchArtifactLibrary,
  parseClaimDossier,
  parseEvidenceSynthesis,
  parseResearchArtifactLibrary,
  parseReviewedClaimRegistry,
  queryResearchArtifactLibrary,
  researchArtifactLibraryIndex,
  resolveReevaluationArtifactBundle,
  serializeResearchArtifactLibrary,
  type HnkResearchArtifactKind,
  type HnkResearchArtifactLibrary,
  type HnkReviewedClaimRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "ARTIFACT_LIBRARY_CATALOGS_VALIDATED_RESEARCH_SNAPSHOTS_WITHOUT_INTERPRETING_TRUTH_RELEVANCE_OR_CANON";
  summary: {
    kinds: string[];
    append_only_revision_history: boolean;
    exact_content_digest_identity: boolean;
    reevaluation_bundle_resolution: boolean;
    machine_inferred_relevance: false;
    automatic_truth_inference: false;
    automatic_canon_promotion: false;
  };
};

function now() {
  return new Date().toISOString();
}

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function readMany(event: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(event.target.files ?? []);
  event.target.value = "";
  return Promise.all(files.map(async (file) => ({ name: file.name, text: await file.text() })));
}

export default function ResearchArtifactLibraryLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [library, setLibrary] = useState<HnkResearchArtifactLibrary | null>(null);
  const [reviewedRegistry, setReviewedRegistry] = useState<HnkReviewedClaimRegistry | null>(null);

  const [libraryKey, setLibraryKey] = useState("");
  const [libraryTitle, setLibraryTitle] = useState("");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"" | HnkResearchArtifactKind>("");
  const [showHistory, setShowHistory] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const index = useMemo(() => {
    if (!library) return null;
    try {
      return researchArtifactLibraryIndex(library);
    } catch {
      return null;
    }
  }, [library]);

  const results = useMemo(() => {
    if (!library) return [];
    try {
      return queryResearchArtifactLibrary(library, {
        q,
        kind: kind || undefined,
        latest_only: !showHistory,
      });
    } catch {
      return [];
    }
  }, [library, q, kind, showHistory]);

  const bundle = useMemo(() => {
    if (!library || !reviewedRegistry) return null;
    try {
      return resolveReevaluationArtifactBundle(library, reviewedRegistry);
    } catch {
      return null;
    }
  }, [library, reviewedRegistry]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/artifacts", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error ?? `HTTP_${response.status}`);
      setHandshake(body as Handshake);
    } catch (err) {
      setHandshake(null);
      setError(err instanceof Error ? err.message : "UNLOCK_FAILED");
    } finally {
      setLoading(false);
    }
  }

  function createLibrary(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      setLibrary(createResearchArtifactLibrary({
        library_key: libraryKey,
        title: libraryTitle,
        created_at: now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "LIBRARY_CREATE_FAILED");
    }
  }

  async function importLibrary(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseResearchArtifactLibrary(await file.text());
      setLibrary(parsed);
      setLibraryKey(parsed.library_key);
      setLibraryTitle(parsed.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "LIBRARY_IMPORT_FAILED");
    }
  }

  async function importReviewedRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setReviewedRegistry(parseReviewedClaimRegistry(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "REVIEWED_REGISTRY_IMPORT_FAILED");
    }
  }

  async function importDossiers(event: ChangeEvent<HTMLInputElement>) {
    if (!library) return;
    try {
      setError("");
      let next = library;
      for (const file of await readMany(event)) {
        const dossier = parseClaimDossier(file.text);
        next = addResearchArtifact(next, {
          kind: "CLAIM_DOSSIER",
          payload: dossier,
          added_at: now(),
        });
      }
      setLibrary(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "DOSSIER_ARTIFACT_IMPORT_FAILED");
    }
  }

  async function importSyntheses(event: ChangeEvent<HTMLInputElement>) {
    if (!library) return;
    try {
      setError("");
      let next = library;
      for (const file of await readMany(event)) {
        const synthesis = parseEvidenceSynthesis(file.text);
        next = addResearchArtifact(next, {
          kind: "EVIDENCE_SYNTHESIS",
          payload: synthesis,
          added_at: now(),
        });
      }
      setLibrary(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYNTHESIS_ARTIFACT_IMPORT_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Artifact Library</h2>
        <p>
          O token abre a bancada. Os snapshots continuam em JSON controlado pelo usuário; a biblioteca
          cataloga e resolve arquivos, mas não interpreta verdade nem relevância.
        </p>
        <form onSubmit={unlock} className={styles.unlockForm}>
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="HNK_RESEARCH_LAB_TOKEN"
            required
          />
          <button disabled={loading}>{loading ? "Validando…" : "Entrar"}</button>
        </form>
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    );
  }

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <article className={styles.healthCard}>
          <span className={handshake.summary.machine_inferred_relevance === false ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>validated snapshots · append-only revisions</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{index?.total_artifacts ?? 0}</strong><span>artifacts</span></article>
          <article><strong>{index?.claim_dossiers ?? 0}</strong><span>dossiers</span></article>
          <article><strong>{index?.evidence_syntheses ?? 0}</strong><span>syntheses</span></article>
          <article><strong>{index?.latest_artifacts ?? 0}</strong><span>latest</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>Importar Artifact Library<input type="file" accept="application/json,.json" onChange={importLibrary} /></label>
        <label>Importar Reviewed Claim Registry<input type="file" accept="application/json,.json" onChange={importReviewedRegistry} /></label>

        {library ? (
          <>
            <label>Adicionar Claim Dossiers<input type="file" multiple accept="application/json,.json" onChange={importDossiers} /></label>
            <label>Adicionar Evidence Syntheses<input type="file" multiple accept="application/json,.json" onChange={importSyntheses} /></label>
            <button
              className={styles.ghostButton}
              onClick={() => downloadJson(
                `${library.library_key}.hnk-research-artifact-library.json`,
                serializeResearchArtifactLibrary(library),
              )}
            >
              Exportar library
            </button>
          </>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!library ? (
          <form className={styles.stageCard} onSubmit={createLibrary}>
            <p className={styles.kicker}>01 · CREATE ARTIFACT LIBRARY</p>
            <h2>Abrir catálogo append-only</h2>
            <label>Library key<input value={libraryKey} onChange={(event) => setLibraryKey(event.target.value)} required /></label>
            <label>Título<input value={libraryTitle} onChange={(event) => setLibraryTitle(event.target.value)} required /></label>
            <button className={styles.primaryButton}>Criar Artifact Library</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>RESEARCH ARTIFACT LIBRARY V1</p>
                <code>{library.library_digest}</code>
                <h2>{library.title}</h2>
                <p>{library.library_key}</p>
              </div>
              <div className={styles.badges}>
                <span>APPEND-ONLY</span>
                <span>SHA-256</span>
                <span>NO RELEVANCE INFERENCE</span>
              </div>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>CATALOG QUERY</p>
                  <h2>Snapshots por key, digest e revisão</h2>
                </div>
                <div className={styles.badges}>
                  <span>{results.length} RESULTS</span>
                  <span>{showHistory ? "ALL REVISIONS" : "LATEST ONLY"}</span>
                </div>
              </div>

              <div className={styles.twoCols}>
                <label>Pesquisar
                  <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="claim id, synthesis key, digest..." />
                </label>
                <label>Tipo
                  <select value={kind} onChange={(event) => setKind(event.target.value as "" | HnkResearchArtifactKind)}>
                    <option value="">Todos</option>
                    {HNK_RESEARCH_ARTIFACT_KINDS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>

              <label>
                <input type="checkbox" checked={showHistory} onChange={(event) => setShowHistory(event.target.checked)} />
                Mostrar histórico superseded
              </label>

              <div className={styles.eventList}>
                {results.map((artifact) => (
                  <article key={artifact.artifact_id}>
                    <strong>{artifact.kind} · {artifact.logical_key} · r{artifact.revision} · {artifact.latest ? "LATEST" : "SUPERSEDED"}</strong>
                    <code>{artifact.content_digest}</code>
                    <p>source_created_at={artifact.source_created_at} · added_at={artifact.added_at}</p>
                    <p>supersedes={artifact.supersedes_artifact_id ?? "—"} · superseded_by={artifact.superseded_by_artifact_id ?? "—"}</p>
                    <code>{artifact.artifact_digest}</code>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.stageCard}>
              <p className={styles.kicker}>02 · RE-EVALUATION INPUT RESOLVER</p>
              <h2>Montar inputs do Batch Scanner</h2>
              {!reviewedRegistry ? (
                <p>Importe um Reviewed Claim Registry para resolver os dossiers originais e o último Evidence Synthesis de cada synthesis key.</p>
              ) : bundle ? (
                <>
                  <div className={styles.badges}>
                    <span>{bundle.active_claims} ACTIVE CLAIMS</span>
                    <span>{bundle.dossier_coverage}/{bundle.active_claims} DOSSIERS</span>
                    <span>{bundle.synthesis_coverage}/{bundle.active_claims} SYNTHESIS COVERAGE</span>
                    <span>{bundle.coverage_complete ? "COMPLETE" : "GAPS"}</span>
                  </div>
                  <pre>{JSON.stringify({
                    candidate_selection_rule: bundle.candidate_selection_rule,
                    machine_inferred_relevance: bundle.machine_inferred_relevance,
                    resolutions: bundle.resolutions,
                  }, null, 2)}</pre>
                </>
              ) : (
                <p>Não foi possível resolver o bundle com os artefatos atuais.</p>
              )}
            </section>
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
