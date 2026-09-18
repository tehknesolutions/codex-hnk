"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  claimReevaluationQueueIndex,
  createClaimReevaluationQueue,
  materializeClaimReevaluationBatch,
  parseClaimDossier,
  parseClaimReevaluationQueue,
  parseEvidenceSynthesis,
  parseReviewedClaimRegistry,
  scanClaimReevaluationBatch,
  serializeClaimReevaluationBatchScan,
  serializeClaimReevaluationQueue,
  type HnkClaimDossier,
  type HnkClaimReevaluationBatchScan,
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
  boundary: "BATCH_SCANNER_AUTOMATES_CHANGE_DETECTION_COVERAGE_NOT_HUMAN_REVIEW_RECLASSIFICATION_TRUTH_OR_CANON";
  summary: {
    scope: "ALL_ACTIVE_REVIEWED_CLAIMS";
    dossier_match: "EXACT_DOSSIER_DIGEST";
    candidate_match: "EXACT_SYNTHESIS_KEY";
    duplicate_candidate_keys_rejected: true;
    incomplete_input_coverage_preserved: true;
    idempotent_queue_materialization: true;
    machine_can_change_classification: false;
    machine_can_decide_review: false;
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

async function readMany<T>(
  event: ChangeEvent<HTMLInputElement>,
  parser: (text: string) => T,
): Promise<T[]> {
  const files = Array.from(event.target.files ?? []);
  event.target.value = "";
  return Promise.all(files.map(async (file) => parser(await file.text())));
}

export default function ClaimReevaluationBatchScannerLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);

  const [reviewedRegistry, setReviewedRegistry] =
    useState<HnkReviewedClaimRegistry | null>(null);
  const [dossiers, setDossiers] = useState<HnkClaimDossier[]>([]);
  const [syntheses, setSyntheses] = useState<HnkEvidenceSynthesis[]>([]);
  const [queue, setQueue] = useState<HnkClaimReevaluationQueue | null>(null);
  const [scan, setScan] = useState<HnkClaimReevaluationBatchScan | null>(null);

  const [queueKey, setQueueKey] = useState("");
  const [queueTitle, setQueueTitle] = useState("");
  const [lastAdded, setLastAdded] = useState<number | null>(null);
  const [lastSkipped, setLastSkipped] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const queueIndex = useMemo(() => {
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
      const response = await fetch("/api/research/re-evaluation-batch", {
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

  async function importRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setReviewedRegistry(parseReviewedClaimRegistry(await file.text()));
      setScan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "REVIEWED_REGISTRY_IMPORT_FAILED");
    }
  }

  async function importDossiers(event: ChangeEvent<HTMLInputElement>) {
    try {
      setError("");
      setDossiers(await readMany(event, parseClaimDossier));
      setScan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "DOSSIER_BATCH_IMPORT_FAILED");
    }
  }

  async function importSyntheses(event: ChangeEvent<HTMLInputElement>) {
    try {
      setError("");
      setSyntheses(await readMany(event, parseEvidenceSynthesis));
      setScan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYNTHESIS_BATCH_IMPORT_FAILED");
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
      setLastAdded(null);
      setLastSkipped(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "QUEUE_IMPORT_FAILED");
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
      setLastAdded(null);
      setLastSkipped(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "QUEUE_CREATE_FAILED");
    }
  }

  function runScan() {
    if (!reviewedRegistry) return;
    try {
      setError("");
      setLastAdded(null);
      setLastSkipped(null);
      setScan(scanClaimReevaluationBatch({
        reviewed_registry: reviewedRegistry,
        original_dossiers: dossiers,
        candidate_syntheses: syntheses,
        scanned_at: now(),
      }));
    } catch (err) {
      setScan(null);
      setError(err instanceof Error ? err.message : "BATCH_SCAN_FAILED");
    }
  }

  function materialize() {
    if (!reviewedRegistry || !queue || !scan) return;
    try {
      setError("");
      const result = materializeClaimReevaluationBatch(queue, {
        reviewed_registry: reviewedRegistry,
        original_dossiers: dossiers,
        candidate_syntheses: syntheses,
        scanned_at: scan.scanned_at,
      });
      setQueue(result.queue);
      setScan(result.scan);
      setLastAdded(result.added);
      setLastSkipped(result.skipped_existing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "BATCH_MATERIALIZATION_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Re-evaluation Batch Scanner</h2>
        <p>
          O scanner automatiza cobertura e detecção de drift. Relevância, reclassificação e revisão
          continuam humanas.
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

  const unresolved =
    (scan?.status_counts.MISSING_ORIGINAL_DOSSIER ?? 0) +
    (scan?.status_counts.MISSING_CANDIDATE_SYNTHESIS ?? 0);

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <article className={styles.healthCard}>
          <span
            className={
              handshake.summary.machine_can_change_classification === false
                ? styles.goodDot
                : styles.badDot
            }
          />
          <div>
            <strong>{handshake.layer}</strong>
            <p>batch detection · human decisions preserved</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{scan?.active_claims ?? 0}</strong><span>active claims</span></article>
          <article><strong>{scan?.status_counts.REVIEW_DUE ?? 0}</strong><span>review due</span></article>
          <article><strong>{unresolved}</strong><span>coverage gaps</span></article>
          <article><strong>{queueIndex?.review_due ?? 0}</strong><span>queue items</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>
          Reviewed Claim Registry
          <input type="file" accept="application/json,.json" onChange={importRegistry} />
        </label>
        <label>
          Dossiers originais — múltiplos arquivos
          <input type="file" multiple accept="application/json,.json" onChange={importDossiers} />
        </label>
        <label>
          Candidate Evidence Syntheses — múltiplos arquivos
          <input type="file" multiple accept="application/json,.json" onChange={importSyntheses} />
        </label>
        <label>
          Re-evaluation Queue existente
          <input type="file" accept="application/json,.json" onChange={importQueue} />
        </label>

        {scan ? (
          <button
            className={styles.ghostButton}
            onClick={() =>
              downloadJson(
                `batch-scan-${scan.scan_digest.slice(0, 12)}.hnk-reevaluation-scan.json`,
                serializeClaimReevaluationBatchScan(scan),
              )
            }
          >
            Exportar batch scan
          </button>
        ) : null}

        {queue ? (
          <button
            className={styles.ghostButton}
            onClick={() =>
              downloadJson(
                `${queue.queue_key}.hnk-claim-reevaluation-queue.json`,
                serializeClaimReevaluationQueue(queue),
              )
            }
          >
            Exportar queue
          </button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!queue ? (
          <form className={styles.stageCard} onSubmit={createQueue}>
            <p className={styles.kicker}>01 · TARGET QUEUE</p>
            <h2>Criar ou importar a fila de destino</h2>
            <label>
              Queue key
              <input value={queueKey} onChange={(event) => setQueueKey(event.target.value)} required />
            </label>
            <label>
              Título
              <input value={queueTitle} onChange={(event) => setQueueTitle(event.target.value)} required />
            </label>
            <button className={styles.primaryButton}>Criar queue</button>
          </form>
        ) : (
          <section className={styles.sessionHeader}>
            <div>
              <p className={styles.kicker}>TARGET RE-EVALUATION QUEUE</p>
              <code>{queue.queue_digest}</code>
              <h2>{queue.title}</h2>
              <p>{queue.queue_key}</p>
            </div>
            <div className={styles.badges}>
              <span>{queueIndex?.review_due ?? 0} ITEMS</span>
              <span>IDEMPOTENT PAIRS</span>
              <span>NO AUTO REVIEW</span>
            </div>
          </section>
        )}

        <section className={styles.stageCard}>
          <p className={styles.kicker}>02 · BATCH INPUT COVERAGE</p>
          <h2>Scan de todas as claims ativas</h2>
          <p>
            registry={reviewedRegistry?.registry_key ?? "—"} · dossiers={dossiers.length} ·
            candidate_syntheses={syntheses.length}
          </p>
          <button
            className={styles.primaryButton}
            disabled={!reviewedRegistry}
            onClick={runScan}
          >
            Executar batch scan
          </button>
        </section>

        {scan ? (
          <section className={styles.auditPanel}>
            <div className={styles.auditHeader}>
              <div>
                <p className={styles.kicker}>BATCH SCAN RESULT</p>
                <h2>{scan.coverage_complete ? "Coverage complete" : "Coverage gaps preserved"}</h2>
                <code>{scan.scan_digest}</code>
              </div>
              <div className={styles.badges}>
                <span>{scan.status_counts.CURRENT} CURRENT</span>
                <span>{scan.status_counts.REVIEW_DUE} REVIEW_DUE</span>
                <span>{unresolved} GAPS</span>
              </div>
            </div>

            <pre>{JSON.stringify({
              status_counts: scan.status_counts,
              unused_dossier_digests: scan.unused_dossier_digests,
              unused_candidate_synthesis_keys: scan.unused_candidate_synthesis_keys,
              machine_can_change_classification: scan.machine_can_change_classification,
            }, null, 2)}</pre>

            <div className={styles.eventList}>
              {scan.results.map((result) => (
                <article key={result.reviewed_record_id}>
                  <strong>
                    {result.status} · {result.claim_id} · v{result.claim_version}
                  </strong>
                  <p>
                    previous_classification={result.previous_classification} ·
                    synthesis={result.synthesis_key}
                  </p>
                  <code>{result.original_synthesis_digest}</code>
                  {result.candidate_synthesis_digest ? (
                    <code>{result.candidate_synthesis_digest}</code>
                  ) : null}
                  {result.assessment ? (
                    <p>
                      reasons={result.assessment.reasons.join(" · ") || "NONE"} ·
                      machine_changed_classification=false
                    </p>
                  ) : (
                    <p>assessment unavailable because required input coverage is missing.</p>
                  )}
                </article>
              ))}
            </div>

            <button
              className={styles.primaryButton}
              disabled={!queue || scan.status_counts.REVIEW_DUE === 0}
              onClick={materialize}
            >
              Materializar REVIEW_DUE na queue
            </button>

            {lastAdded !== null ? (
              <p>
                batch materialization: added={lastAdded} · skipped_existing={lastSkipped ?? 0} ·
                machine_reclassifications=0
              </p>
            ) : null}
          </section>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
