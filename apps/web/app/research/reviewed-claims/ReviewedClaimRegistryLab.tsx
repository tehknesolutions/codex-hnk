"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_REVIEWED_CLAIM_CLASSIFICATIONS,
  addReviewedClaim,
  createReviewedClaimRegistry,
  parseClaimDossier,
  parseEvidenceReviewGate,
  parseReviewedClaimRegistry,
  queryReviewedClaimRegistry,
  reviewedClaimRegistryIndex,
  serializeReviewedClaimRegistry,
  verifyEvidenceReviewGate,
  type HnkClaimDossier,
  type HnkEvidenceReviewGate,
  type HnkReviewedClaimClassification,
  type HnkReviewedClaimRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "REVIEWED_CLAIM_REGISTRY_INDEXES_HUMAN_REVIEW_CLASSIFICATIONS_NOT_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON";
  summary: {
    classifications: string[];
    reviewed_gate_required: true;
    human_decision_required: true;
    non_destructive_history: true;
    searchable: true;
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

export default function ReviewedClaimRegistryLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [registry, setRegistry] = useState<HnkReviewedClaimRegistry | null>(null);
  const [dossier, setDossier] = useState<HnkClaimDossier | null>(null);
  const [reviewGate, setReviewGate] = useState<HnkEvidenceReviewGate | null>(null);

  const [registryKey, setRegistryKey] = useState("");
  const [registryTitle, setRegistryTitle] = useState("");
  const [supersedesRecordId, setSupersedesRecordId] = useState("");

  const [q, setQ] = useState("");
  const [classification, setClassification] = useState<"" | HnkReviewedClaimClassification>("");
  const [showHistory, setShowHistory] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const index = useMemo(() => {
    if (!registry) return null;
    try {
      return reviewedClaimRegistryIndex(registry);
    } catch {
      return null;
    }
  }, [registry]);

  const currentActiveForDossier = useMemo(() => {
    if (!index || !dossier) return null;
    return index.records.find((record) => record.claim_id === dossier.claim_id && record.active) ?? null;
  }, [index, dossier]);

  const results = useMemo(() => {
    if (!registry) return [];
    try {
      return queryReviewedClaimRegistry(registry, {
        q,
        classification: classification || undefined,
        active_only: !showHistory,
      });
    } catch {
      return [];
    }
  }, [registry, q, classification, showHistory]);

  const stagedBinding = useMemo(() => {
    if (!dossier || !reviewGate) return null;
    try {
      return verifyEvidenceReviewGate(reviewGate, dossier);
    } catch {
      return null;
    }
  }, [dossier, reviewGate]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/reviewed-claims", {
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

  function createRegistry(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      setRegistry(createReviewedClaimRegistry({
        registry_key: registryKey,
        title: registryTitle,
        created_at: now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_CREATE_FAILED");
    }
  }

  async function importRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseReviewedClaimRegistry(await file.text());
      setRegistry(parsed);
      setRegistryKey(parsed.registry_key);
      setRegistryTitle(parsed.title);
      setSupersedesRecordId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_IMPORT_FAILED");
    }
  }

  async function importDossier(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setDossier(parseClaimDossier(await file.text()));
      setSupersedesRecordId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "DOSSIER_IMPORT_FAILED");
    }
  }

  async function importReviewGate(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setReviewGate(parseEvidenceReviewGate(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "REVIEW_GATE_IMPORT_FAILED");
    }
  }

  function registerReviewedClaim() {
    if (!registry || !dossier || !reviewGate) return;
    try {
      setError("");
      if (currentActiveForDossier && !supersedesRecordId) {
        throw new Error("SELECT_ACTIVE_RECORD_TO_SUPERSEDE");
      }
      const next = addReviewedClaim(registry, {
        record_id: `RCR-${crypto.randomUUID()}`,
        registered_at: now(),
        dossier,
        review_gate: reviewGate,
        supersedes_record_id: supersedesRecordId || null,
      });
      setRegistry(next);
      setDossier(null);
      setReviewGate(null);
      setSupersedesRecordId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTER_REVIEWED_CLAIM_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Reviewed Claim Registry</h2>
        <p>O token abre somente a bancada. O registry continua em JSON controlado pelo usuário e só admite gates já revisados por humano.</p>
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
          <span className={handshake.summary.human_decision_required ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>reviewed claims · versioned · not canon</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{index?.total_records ?? 0}</strong><span>records</span></article>
          <article><strong>{index?.active_claims ?? 0}</strong><span>active claims</span></article>
          <article><strong>{index?.claim_ids ?? 0}</strong><span>claim ids</span></article>
          <article><strong>{showHistory ? "ALL" : "ACTIVE"}</strong><span>view</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>Importar Reviewed Claim Registry<input type="file" accept="application/json,.json" onChange={importRegistry} /></label>
        <label>Importar Claim Dossier<input type="file" accept="application/json,.json" onChange={importDossier} /></label>
        <label>Importar Evidence Review Gate<input type="file" accept="application/json,.json" onChange={importReviewGate} /></label>

        {registry ? (
          <button
            className={styles.ghostButton}
            onClick={() => downloadJson(
              `${registry.registry_key}.hnk-reviewed-claim-registry.json`,
              serializeReviewedClaimRegistry(registry),
            )}
          >
            Exportar registry
          </button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!registry ? (
          <form className={styles.stageCard} onSubmit={createRegistry}>
            <p className={styles.kicker}>01 · CREATE REGISTRY</p>
            <h2>Abrir índice de claims revisadas</h2>
            <label>Registry key<input value={registryKey} onChange={(event) => setRegistryKey(event.target.value)} required /></label>
            <label>Título<input value={registryTitle} onChange={(event) => setRegistryTitle(event.target.value)} required /></label>
            <button className={styles.primaryButton}>Criar Reviewed Claim Registry</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>REVIEWED CLAIM REGISTRY V1</p>
                <code>{registry.registry_digest}</code>
                <h2>{registry.title}</h2>
                <p>{registry.registry_key}</p>
              </div>
              <div className={styles.badges}>
                <span>HUMAN REVIEW DERIVED</span>
                <span>NON-DESTRUCTIVE HISTORY</span>
                <span>NOT CANON</span>
              </div>
            </section>

            <section className={styles.stageCard}>
              <p className={styles.kicker}>02 · REGISTER REVIEWED CLAIM</p>
              <h2>{dossier?.claim_id ?? "Importe dossier + reviewed gate"}</h2>
              <p>
                Binding: {stagedBinding?.ok === true ? "PASS" : dossier && reviewGate ? "CHECK" : "—"} ·
                gate_status={reviewGate?.status ?? "—"}
              </p>

              {dossier ? <p>{dossier.statement}</p> : null}
              {reviewGate?.review ? (
                <p>
                  outcome={reviewGate.review.outcome} · reviewer={reviewGate.review.reviewer} ·
                  human_decision={String(reviewGate.review.human_decision)}
                </p>
              ) : null}

              {currentActiveForDossier ? (
                <label>Supersede explicitamente a versão ativa
                  <select value={supersedesRecordId} onChange={(event) => setSupersedesRecordId(event.target.value)} required>
                    <option value="">Selecione a versão ativa</option>
                    <option value={currentActiveForDossier.record_id}>
                      {currentActiveForDossier.record_id} · v{currentActiveForDossier.claim_version} · {currentActiveForDossier.classification}
                    </option>
                  </select>
                </label>
              ) : null}

              <button
                className={styles.primaryButton}
                disabled={
                  !dossier ||
                  !reviewGate ||
                  reviewGate.status !== "REVIEWED" ||
                  stagedBinding?.ok !== true ||
                  Boolean(currentActiveForDossier && !supersedesRecordId)
                }
                onClick={registerReviewedClaim}
              >
                Registrar claim revisada
              </button>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>SEARCH + HISTORY</p>
                  <h2>Índice pesquisável</h2>
                </div>
                <div className={styles.badges}>
                  <span>{results.length} RESULTS</span>
                  <span>{showHistory ? "HISTORY ON" : "ACTIVE ONLY"}</span>
                </div>
              </div>

              <div className={styles.twoCols}>
                <label>Pesquisar
                  <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="claim, reviewer, rationale, gap..." />
                </label>
                <label>Classificação
                  <select
                    value={classification}
                    onChange={(event) => setClassification(event.target.value as "" | HnkReviewedClaimClassification)}
                  >
                    <option value="">Todas</option>
                    {HNK_REVIEWED_CLAIM_CLASSIFICATIONS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>

              <label>
                <input type="checkbox" checked={showHistory} onChange={(event) => setShowHistory(event.target.checked)} />
                Mostrar versões superseded
              </label>

              {index ? (
                <pre>{JSON.stringify({
                  active_classification_counts: index.active_classification_counts,
                  classification_counts_all_history: index.classification_counts,
                }, null, 2)}</pre>
              ) : null}

              <div className={styles.eventList}>
                {results.map((record) => (
                  <article key={record.record_id}>
                    <strong>
                      {record.classification} · {record.claim_id} · v{record.claim_version} · {record.active ? "ACTIVE" : "SUPERSEDED"}
                    </strong>
                    <code>{record.record_digest}</code>
                    <p>{record.statement}</p>
                    <p>
                      outcome={record.review_outcome} · reviewer={record.reviewer} · reviewed_at={record.reviewed_at}
                    </p>
                    <p>
                      synthesis={record.synthesis_key} · gaps={record.gaps.length} · conflicts={record.conflicts.length} · unresolved={record.unresolved_questions.length}
                    </p>
                    <p>
                      supersedes={record.supersedes_record_id ?? "—"} · superseded_by={record.superseded_by_record_id ?? "—"}
                    </p>
                    <code>truth_assessed=false · canon_status=NOT_CANON · causal_claim_permitted=false</code>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
