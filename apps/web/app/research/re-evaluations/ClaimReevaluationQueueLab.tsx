"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  addClaimReevaluation,
  assessClaimReevaluation,
  claimReevaluationQueueIndex,
  createClaimReevaluationQueue,
  parseClaimDossier,
  parseClaimReevaluationQueue,
  parseEvidenceSynthesis,
  parseReviewedClaimRegistry,
  serializeClaimReevaluationQueue,
  type HnkClaimDossier,
  type HnkClaimReevaluationQueue,
  type HnkEvidenceSynthesis,
  type HnkReviewedClaimRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "REEVALUATION_QUEUE_DETECTS_EVIDENCE_SNAPSHOT_CHANGE_NOT_NEW_TRUTH_CLASSIFICATION_OR_CANON";
  summary: {
    trigger: string;
    linked_group_comparison: boolean;
    new_groups_flagged_as_unclassified_not_relevant: boolean;
    review_due_status: "REVIEW_DUE";
    machine_can_change_classification: false;
    machine_can_decide_review: false;
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

export default function ClaimReevaluationQueueLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [queue, setQueue] = useState<HnkClaimReevaluationQueue | null>(null);
  const [reviewedRegistry, setReviewedRegistry] = useState<HnkReviewedClaimRegistry | null>(null);
  const [dossier, setDossier] = useState<HnkClaimDossier | null>(null);
  const [candidateSynthesis, setCandidateSynthesis] = useState<HnkEvidenceSynthesis | null>(null);

  const [queueKey, setQueueKey] = useState("");
  const [queueTitle, setQueueTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const assessment = useMemo(() => {
    if (!reviewedRegistry || !dossier || !candidateSynthesis) return null;
    try {
      return assessClaimReevaluation({
        reviewed_registry: reviewedRegistry,
        claim_id: dossier.claim_id,
        original_dossier: dossier,
        candidate_synthesis: candidateSynthesis,
      });
    } catch {
      return null;
    }
  }, [reviewedRegistry, dossier, candidateSynthesis]);

  const index = useMemo(() => {
    if (!queue) return null;
    try {
      return claimReevaluationQueueIndex(queue);
    } catch {
      return null;
    }
  }, [queue]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/re-evaluations", {
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

  function createQueue(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      setQueue(createClaimReevaluationQueue({
        queue_key: queueKey,
        title: queueTitle,
        created_at: now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "QUEUE_CREATE_FAILED");
    }
  }

  async function importQueue(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseClaimReevaluationQueue(await file.text());
      setQueue(parsed);
      setQueueKey(parsed.queue_key);
      setQueueTitle(parsed.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "QUEUE_IMPORT_FAILED");
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

  async function importDossier(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setDossier(parseClaimDossier(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "DOSSIER_IMPORT_FAILED");
    }
  }

  async function importCandidateSynthesis(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setCandidateSynthesis(parseEvidenceSynthesis(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYNTHESIS_IMPORT_FAILED");
    }
  }

  function addReviewDue() {
    if (!queue || !reviewedRegistry || !dossier || !candidateSynthesis || !assessment?.review_due) return;
    try {
      setError("");
      setQueue(addClaimReevaluation(queue, {
        item_id: `REEVAL-${crypto.randomUUID()}`,
        detected_at: now(),
        reviewed_registry: reviewedRegistry,
        claim_id: dossier.claim_id,
        original_dossier: dossier,
        candidate_synthesis: candidateSynthesis,
      }));
      setDossier(null);
      setCandidateSynthesis(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "QUEUE_ADD_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Claim Re-evaluation Queue</h2>
        <p>O token libera a bancada. A fila só detecta mudança de evidência; nenhuma classificação é alterada automaticamente.</p>
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
          <span className={handshake.summary.machine_can_change_classification === false ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>change detection · human review required</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{index?.review_due ?? 0}</strong><span>review due</span></article>
          <article><strong>{index?.claim_ids ?? 0}</strong><span>claim ids</span></article>
          <article><strong>{assessment?.review_due ? "DUE" : assessment ? "CURRENT" : "—"}</strong><span>candidate</span></article>
          <article><strong>0</strong><span>machine reclassifications</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>Importar Re-evaluation Queue<input type="file" accept="application/json,.json" onChange={importQueue} /></label>
        <label>Importar Reviewed Claim Registry<input type="file" accept="application/json,.json" onChange={importReviewedRegistry} /></label>
        <label>Importar dossier original da claim ativa<input type="file" accept="application/json,.json" onChange={importDossier} /></label>
        <label>Importar novo Evidence Synthesis<input type="file" accept="application/json,.json" onChange={importCandidateSynthesis} /></label>

        {queue ? (
          <button
            className={styles.ghostButton}
            onClick={() => downloadJson(
              `${queue.queue_key}.hnk-claim-reevaluation-queue.json`,
              serializeClaimReevaluationQueue(queue),
            )}
          >
            Exportar queue
          </button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!queue ? (
          <form className={styles.stageCard} onSubmit={createQueue}>
            <p className={styles.kicker}>01 · CREATE QUEUE</p>
            <h2>Abrir fila de reavaliação</h2>
            <label>Queue key<input value={queueKey} onChange={(event) => setQueueKey(event.target.value)} required /></label>
            <label>Título<input value={queueTitle} onChange={(event) => setQueueTitle(event.target.value)} required /></label>
            <button className={styles.primaryButton}>Criar Claim Re-evaluation Queue</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>CLAIM RE-EVALUATION QUEUE V1</p>
                <code>{queue.queue_digest}</code>
                <h2>{queue.title}</h2>
                <p>{queue.queue_key}</p>
              </div>
              <div className={styles.badges}>
                <span>REVIEW_DUE ONLY</span>
                <span>NO MACHINE RECLASSIFICATION</span>
                <span>NOT CANON</span>
              </div>
            </section>

            <section className={styles.stageCard}>
              <p className={styles.kicker}>02 · ASSESS NEW SYNTHESIS SNAPSHOT</p>
              <h2>{dossier?.claim_id ?? "Importe registry + dossier + synthesis"}</h2>
              <p>
                Original synthesis: {dossier?.synthesis_binding.synthesis_key ?? "—"} ·
                candidate synthesis: {candidateSynthesis?.synthesis_key ?? "—"}
              </p>

              {assessment ? (
                <>
                  <div className={styles.badges}>
                    <span>{assessment.review_due ? "REVIEW_DUE" : "CURRENT"}</span>
                    <span>PREVIOUS={assessment.previous_classification}</span>
                    <span>MACHINE_CHANGED=false</span>
                  </div>

                  <pre>{JSON.stringify({
                    reasons: assessment.reasons,
                    original_synthesis_digest: assessment.original_synthesis_digest,
                    candidate_synthesis_digest: assessment.candidate_synthesis_digest,
                    unclassified_new_group_signatures: assessment.unclassified_new_group_signatures,
                    next_workflow: assessment.next_workflow,
                  }, null, 2)}</pre>

                  <div className={styles.eventList}>
                    {assessment.linked_group_changes.map((change) => (
                      <article key={change.metric_signature_digest}>
                        <strong>{change.metric_id} · {change.changes.length ? change.changes.join(" · ") : "NO LINKED-GROUP FIELD CHANGE"}</strong>
                        <code>{change.metric_signature_digest}</code>
                        <p>status: {change.old_group_status} → {change.new_group_status ?? "MISSING"}</p>
                        <p>direction: {change.old_direction ?? "—"} → {change.new_direction ?? "—"}</p>
                        <p>questions: {change.old_source_questions.length} → {change.new_source_questions.length}</p>
                      </article>
                    ))}
                  </div>

                  <button
                    className={styles.primaryButton}
                    disabled={!assessment.review_due}
                    onClick={addReviewDue}
                  >
                    {assessment.review_due ? "Adicionar REVIEW_DUE à fila" : "Snapshot atual — nenhuma reavaliação necessária"}
                  </button>
                </>
              ) : (
                <p>
                  A avaliação exige a versão ativa do Reviewed Claim Registry, o dossier original ligado a essa versão
                  e um novo Evidence Synthesis com a mesma synthesis key.
                </p>
              )}
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>REVIEW DUE INDEX</p>
                  <h2>Fila acumulada</h2>
                </div>
                <div className={styles.badges}>
                  <span>{index?.review_due ?? 0} ITEMS</span>
                  <span>HUMAN REVIEW REQUIRED</span>
                </div>
              </div>

              {index ? <pre>{JSON.stringify(index.reason_counts, null, 2)}</pre> : null}

              <div className={styles.eventList}>
                {index?.items.map((item) => (
                  <article key={item.item_id}>
                    <strong>{item.status} · {item.claim_id} · v{item.previous_claim_version}</strong>
                    <code>{item.item_digest}</code>
                    <p>previous_classification={item.previous_classification}</p>
                    <p>{item.reasons.join(" · ")}</p>
                    <p>
                      linked_group_changes={item.linked_group_changes.filter((change) => change.changes.length > 0).length} ·
                      new_unclassified_groups={item.unclassified_new_group_signatures.length}
                    </p>
                    <code>machine_changed_classification=false · machine_can_resolve=false · next={item.next_workflow}</code>
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
