"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  addReplicationLedger,
  createReplicationRegistry,
  parseEvidenceLedger,
  parseReplicationRegistry,
  replicationReport,
  serializeReplicationRegistry,
  type HnkEvidenceLedger,
  type HnkReplicationRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "REPLICATION_REGISTRY_DESCRIBES_REPEATABILITY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
  summary: {
    statuses: string[];
    directions: string[];
    supported_metric_types: string[];
    comparison_basis: string;
    replicated_means: string;
    distinct_experiment_ids_required: boolean;
    exact_metric_signature_required: boolean;
    automatic_truth_inference: false;
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

function metricIds(ledger: HnkEvidenceLedger | null) {
  if (!ledger) return [];
  return [...new Set(
    ledger.evidence_entries
      .filter((entry) => entry.kind === "MEASUREMENT_RECORD" && entry.metric_id)
      .map((entry) => entry.metric_id as string),
  )];
}

export default function ReplicationRegistryLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [registry, setRegistry] = useState<HnkReplicationRegistry | null>(null);
  const [stagedLedger, setStagedLedger] = useState<HnkEvidenceLedger | null>(null);
  const [replicationKey, setReplicationKey] = useState("");
  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [metricId, setMetricId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const report = useMemo(() => {
    if (!registry) return null;
    try {
      return replicationReport(registry);
    } catch {
      return null;
    }
  }, [registry]);

  const stagedMetricIds = useMemo(() => metricIds(stagedLedger), [stagedLedger]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/replications", {
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

  async function importLedger(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseEvidenceLedger(await file.text());
      setStagedLedger(parsed);
      const ids = metricIds(parsed);
      if (!metricId && ids[0]) setMetricId(ids[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "LEDGER_IMPORT_FAILED");
    }
  }

  async function importRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseReplicationRegistry(await file.text());
      setRegistry(parsed);
      setReplicationKey(parsed.replication_key);
      setTitle(parsed.title);
      setQuestion(parsed.question);
      setMetricId(parsed.metric_signature.metric_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_IMPORT_FAILED");
    }
  }

  function createRegistry(event: FormEvent) {
    event.preventDefault();
    if (!stagedLedger) return;
    try {
      setError("");
      const timestamp = now();
      const next = createReplicationRegistry({
        replication_key: replicationKey,
        title,
        question,
        metric_id: metricId,
        created_at: timestamp,
        seed_run_id: `RUN-${crypto.randomUUID()}`,
        seed_added_at: timestamp,
        seed_ledger: stagedLedger,
      });
      setRegistry(next);
      setStagedLedger(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_CREATE_FAILED");
    }
  }

  function addRun() {
    if (!registry || !stagedLedger) return;
    try {
      setError("");
      const next = addReplicationLedger(registry, {
        run_id: `RUN-${crypto.randomUUID()}`,
        added_at: now(),
        ledger: stagedLedger,
      });
      setRegistry(next);
      setStagedLedger(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "REPLICATION_ADD_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Replication Registry</h2>
        <p>O token libera apenas a bancada. Ledgers e registries continuam em arquivos controlados pelo usuário.</p>
        <form onSubmit={unlock} className={styles.unlockForm}>
          <input type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="HNK_RESEARCH_LAB_TOKEN" required />
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
          <span className={handshake.summary.exact_metric_signature_required ? styles.goodDot : styles.badDot} />
          <div><strong>{handshake.layer}</strong><p>repeatability · descriptive only</p></div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{registry?.runs.length ?? 0}</strong><span>runs</span></article>
          <article><strong>{report?.eligible_runs ?? 0}</strong><span>eligible</span></article>
          <article><strong>{report?.insufficient_runs ?? 0}</strong><span>insufficient</span></article>
          <article><strong>{report?.status ?? "—"}</strong><span>status</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}. “REPLICATED” significa apenas a mesma direção descritiva em pelo menos duas execuções elegíveis.</p>

        <label>Importar Evidence Ledger<input type="file" accept="application/json,.json" onChange={importLedger} /></label>
        <label>Importar Replication Registry<input type="file" accept="application/json,.json" onChange={importRegistry} /></label>

        {registry ? (
          <button className={styles.ghostButton} onClick={() => downloadJson(`${registry.replication_key}.hnk-replication-registry.json`, serializeReplicationRegistry(registry))}>Exportar registry</button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!registry ? (
          <form className={styles.stageCard} onSubmit={createRegistry}>
            <p className={styles.kicker}>01 · CREATE REPLICATION KEY</p>
            <h2>Definir comparação acumulativa</h2>
            <p>Importe um Evidence Ledger como seed e escolha uma métrica quantitativa ou booleana. A assinatura completa dessa métrica ficará congelada.</p>
            <label>Replication key<input value={replicationKey} onChange={(event) => setReplicationKey(event.target.value)} placeholder="EX.: SCORE-DIRECTION-V1" required /></label>
            <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
            <label>Pergunta<textarea value={question} onChange={(event) => setQuestion(event.target.value)} required /></label>
            <label>Métrica
              <select value={metricId} onChange={(event) => setMetricId(event.target.value)} required>
                <option value="">Selecione</option>
                {stagedMetricIds.map((id) => <option key={id}>{id}</option>)}
              </select>
            </label>
            <p>{stagedLedger ? `Seed: ${stagedLedger.experiment_id}` : "Importe primeiro um Evidence Ledger."}</p>
            <button className={styles.primaryButton} disabled={!stagedLedger}>Criar Replication Registry</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>REPLICATION REGISTRY V1</p>
                <code>{registry.registry_digest}</code>
                <h2>{registry.title}</h2>
                <p>{registry.question}</p>
              </div>
              <div className={styles.badges}>
                <span>{report?.status ?? "CHECK"}</span>
                <span>{report?.repeated_direction ?? "NO SINGLE DIRECTION"}</span>
                <span>NO AUTO TRUTH</span>
              </div>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div><p className={styles.kicker}>FROZEN METRIC SIGNATURE</p><h2>{registry.metric_signature.metric_id}</h2></div>
                <div className={styles.badges}><span>{registry.metric_signature.metric_type}</span><span>{registry.metric_signature.evidence_source ?? "source —"}</span></div>
              </div>
              <div className={styles.eventList}>
                <article>
                  <strong>{registry.metric_signature.label}</strong>
                  <code>{registry.metric_signature.signature_digest}</code>
                  <p>{registry.metric_signature.unit ?? "unitless"} · {registry.metric_signature.timepoint ?? "timepoint —"}</p>
                  <p>Critério: {registry.metric_signature.evaluation_criterion ?? "—"}</p>
                </article>
              </div>
            </section>

            {stagedLedger ? (
              <section className={styles.stageCard}>
                <p className={styles.kicker}>02 · ADD INDEPENDENT RUN</p>
                <h2>{stagedLedger.experiment_id}</h2>
                <p>O run só entra se o experiment_id for distinto e a assinatura da métrica corresponder exatamente ao registry.</p>
                <button className={styles.primaryButton} onClick={addRun}>Adicionar execução</button>
              </section>
            ) : (
              <section className={styles.stageCard}>
                <p className={styles.kicker}>02 · WAITING FOR REPLICATION</p>
                <h2>Importe outro Evidence Ledger</h2>
                <p>Cada ledger deve representar um experiment_id independente. Duplicatas são rejeitadas.</p>
              </section>
            )}

            {report ? (
              <section className={styles.resultCard}>
                <p className={styles.kicker}>DESCRIPTIVE REPLICATION REPORT</p>
                <h2>{report.status}</h2>
                <pre>{JSON.stringify({
                  total_runs: report.total_runs,
                  eligible_runs: report.eligible_runs,
                  insufficient_runs: report.insufficient_runs,
                  direction_counts: report.direction_counts,
                  repeated_direction: report.repeated_direction,
                }, null, 2)}</pre>

                {report.run_results.map((run) => (
                  <article key={run.run_id}>
                    <strong>{run.direction} · {run.experiment_id}</strong>
                    <code>{run.ledger_digest}</code>
                    <p>CONTROL: n={run.control.n} · aggregate={String(run.control.aggregate)}</p>
                    <p>EXPERIMENT: n={run.experiment.n} · aggregate={String(run.experiment.aggregate)}</p>
                    <p>{run.eligible ? "eligible=true" : `eligible=false · ${run.insufficiency_reasons.join(", ")}`}</p>
                  </article>
                ))}

                <code>truth_assessed=false · causal_claim_permitted=false · metaphysical_proof_permitted=false</code>
              </section>
            ) : null}
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
