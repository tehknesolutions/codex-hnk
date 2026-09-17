"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_MEASUREMENT_EVIDENCE_SOURCES,
  HNK_MEASUREMENT_TIMEPOINTS,
  HNK_MEASUREMENT_TYPES,
  addMeasurementRecord,
  createMeasurementContract,
  measurementDescriptiveSummary,
  measurementMatrix,
  parseExperimentProtocol,
  parseMeasurementContract,
  serializeMeasurementContract,
  validateMeasurementContract,
  type HnkExperimentProtocol,
  type HnkMeasurementContract,
  type HnkMeasurementEvidenceSource,
  type HnkMeasurementTimepoint,
  type HnkMeasurementType,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "MEASUREMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF";
  summary: {
    types: string[];
    plan_locked_before_sessions: boolean;
    observed_variables_exactly_typed: boolean;
    descriptive_statistics_only: boolean;
    causal_claim_permitted: false;
    metaphysical_proof_permitted: false;
  };
};

type MetricDraft = {
  metric_id: string;
  source_variable: string;
  label: string;
  type: HnkMeasurementType;
  unit: string;
  collection_method: string;
  evidence_source: HnkMeasurementEvidenceSource;
  timepoint: HnkMeasurementTimepoint;
  timepoint_label: string;
  evaluation_criterion: string;
  min: string;
  max: string;
  category_options: string;
  scale_min: string;
  scale_max: string;
  scale_step: string;
};

function now() {
  return new Date().toISOString();
}

function slug(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "METRIC";
}

function draftFor(variable: string): MetricDraft {
  return {
    metric_id: `M-${slug(variable)}`,
    source_variable: variable,
    label: variable,
    type: "TEXT",
    unit: "",
    collection_method: "Registrar de forma consistente conforme o protocolo.",
    evidence_source: "SELF_REPORT",
    timepoint: "POST",
    timepoint_label: "",
    evaluation_criterion: "Comparar descritivamente entre os papéis sem inferir causalidade.",
    min: "",
    max: "",
    category_options: "",
    scale_min: "0",
    scale_max: "10",
    scale_step: "1",
  };
}

function numberOrNull(value: string) {
  return value.trim() === "" ? null : Number(value);
}

function metricFromDraft(draft: MetricDraft) {
  return {
    metric_id: draft.metric_id,
    source_variable: draft.source_variable,
    label: draft.label,
    type: draft.type,
    unit: draft.unit.trim() || null,
    collection_method: draft.collection_method,
    evidence_source: draft.evidence_source,
    timepoint: draft.timepoint,
    timepoint_label: draft.timepoint_label.trim() || null,
    evaluation_criterion: draft.evaluation_criterion,
    numeric_bounds: ["NUMBER", "COUNT"].includes(draft.type)
      ? { min: numberOrNull(draft.min), max: numberOrNull(draft.max) }
      : null,
    category_options: draft.type === "CATEGORY"
      ? draft.category_options.split("\n").map((value) => value.trim()).filter(Boolean)
      : [],
    scale: draft.type === "SCALE"
      ? { min: Number(draft.scale_min), max: Number(draft.scale_max), step: Number(draft.scale_step), anchors: [] }
      : null,
  };
}

function parseValue(type: HnkMeasurementType, value: string) {
  if (["NUMBER", "COUNT", "SCALE"].includes(type)) return Number(value);
  if (type === "BOOLEAN") {
    if (value === "true") return true;
    if (value === "false") return false;
    throw new Error("BOOLEAN_VALUE_REQUIRED");
  }
  return value;
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

export default function MeasurementContractLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [experiment, setExperiment] = useState<HnkExperimentProtocol | null>(null);
  const [contract, setContract] = useState<HnkMeasurementContract | null>(null);
  const [drafts, setDrafts] = useState<MetricDraft[]>([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [metricId, setMetricId] = useState("");
  const [measurementValue, setMeasurementValue] = useState("");
  const [measurementNote, setMeasurementNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validation = useMemo(() => {
    if (!contract) return null;
    return validateMeasurementContract(contract, experiment ?? undefined);
  }, [contract, experiment]);

  const matrix = useMemo(() => {
    if (!contract || !experiment || !validation?.ok) return null;
    try { return measurementMatrix(contract, experiment) as { rows: Array<{ assignment_id: string; role: string; session_id: string; values: Record<string, unknown>; missing_metrics: string[] }>; metrics: Array<{ metric_id: string; label: string; type: string; unit: string | null }> }; }
    catch { return null; }
  }, [contract, experiment, validation]);

  const descriptive = useMemo(() => {
    if (!contract || !experiment || !validation?.ok) return null;
    try { return measurementDescriptiveSummary(contract, experiment) as { metrics: Array<{ metric_id: string; label: string; type: string; unit: string | null; evaluation_criterion: string; control: Record<string, unknown>; experiment: Record<string, unknown> }>; inferential_statistics_performed: false; causal_claim_permitted: false; metaphysical_proof_permitted: false }; }
    catch { return null; }
  }, [contract, experiment, validation]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/measurements", {
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

  async function importExperiment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseExperimentProtocol(await file.text());
      if (contract) {
        const linked = validateMeasurementContract(contract, parsed);
        if (!linked.ok) throw new Error(linked.issues.join("; "));
      }
      setExperiment(parsed);
      if (!contract && parsed.status === "PREREGISTERED" && parsed.sessions.length === 0) {
        setDrafts(parsed.plan.observed_variables.map(draftFor));
      }
      if (parsed.sessions[0]) setAssignmentId(parsed.sessions[0].assignment_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "EXPERIMENT_IMPORT_FAILED");
    }
  }

  async function importContract(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseMeasurementContract(await file.text());
      if (experiment) {
        const linked = validateMeasurementContract(parsed, experiment);
        if (!linked.ok) throw new Error(linked.issues.join("; "));
      }
      setContract(parsed);
      if (parsed.metrics[0]) setMetricId(parsed.metrics[0].metric_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "MEASUREMENT_IMPORT_FAILED");
    }
  }

  function updateDraft(index: number, patch: Partial<MetricDraft>) {
    setDrafts((current) => current.map((draft, position) => position === index ? { ...draft, ...patch } : draft));
  }

  function sealPlan(event: FormEvent) {
    event.preventDefault();
    if (!experiment) return;
    try {
      setError("");
      const timestamp = now();
      const next = createMeasurementContract(experiment, {
        created_at: timestamp,
        locked_at: timestamp,
        metrics: drafts.map(metricFromDraft),
      });
      setContract(next);
      if (next.metrics[0]) setMetricId(next.metrics[0].metric_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "MEASUREMENT_PLAN_FAILED");
    }
  }

  function recordMeasurement(event: FormEvent) {
    event.preventDefault();
    if (!experiment || !contract) return;
    try {
      setError("");
      const metric = contract.metrics.find((entry) => entry.metric_id === metricId);
      if (!metric) throw new Error("METRIC_REQUIRED");
      const next = addMeasurementRecord(contract, experiment, {
        measurement_id: `MEASURE-${crypto.randomUUID()}`,
        assignment_id: assignmentId,
        metric_id: metricId,
        measured_at: now(),
        value: parseValue(metric.type, measurementValue),
        note: measurementNote.trim() || null,
      });
      setContract(next);
      setMeasurementValue("");
      setMeasurementNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "MEASUREMENT_RECORD_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Measurement Lab</h2>
        <p>O token libera apenas a bancada. Protocolos, contratos e medidas permanecem em arquivos controlados pelo usuário.</p>
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
          <span className={handshake.summary.plan_locked_before_sessions ? styles.goodDot : styles.badDot} />
          <div><strong>{handshake.layer}</strong><p>typed metrics · descriptive only</p></div>
        </article>
        <div className={styles.metricGrid}>
          <article><strong>{experiment?.status ?? "—"}</strong><span>experiment</span></article>
          <article><strong>{contract?.metrics.length ?? 0}</strong><span>metrics</span></article>
          <article><strong>{contract?.records.length ?? 0}</strong><span>records</span></article>
          <article><strong>{validation?.ok === true ? "PASS" : contract ? "CHECK" : "—"}</strong><span>binding</span></article>
        </div>
        <p className={styles.boundary}>{handshake.boundary}. Tipagem e hash melhoram estrutura e auditabilidade; não concedem prova causal ou metafísica.</p>
        <label>Importar experimento JSON<input type="file" accept="application/json,.json" onChange={importExperiment} /></label>
        <label>Importar measurement JSON<input type="file" accept="application/json,.json" onChange={importContract} /></label>
        {contract ? <button className={styles.ghostButton} onClick={() => downloadJson(`${contract.experiment_id}.hnk-measurement.json`, serializeMeasurementContract(contract))}>Exportar measurement</button> : null}
      </aside>

      <section className={styles.mainPanel}>
        {!experiment ? (
          <section className={styles.stageCard}>
            <p className={styles.kicker}>01 · IMPORT PREREGISTRATION</p>
            <h2>Carregue o experimento</h2>
            <p>Para selar um novo plano de medidas, importe a versão `PREREGISTERED` antes de qualquer sessão. Depois você poderá importar versões posteriores do mesmo experimento para registrar valores.</p>
          </section>
        ) : null}

        {experiment && !contract ? (
          <form className={styles.stageCard} onSubmit={sealPlan}>
            <p className={styles.kicker}>02 · TYPE OBSERVED VARIABLES</p>
            <h2>Selar plano de medidas</h2>
            <p><code>{experiment.experiment_id}</code> · {experiment.status} · {experiment.plan.observed_variables.length} variáveis observadas</p>
            {drafts.map((draft, index) => (
              <article className={styles.stageCard} key={draft.source_variable}>
                <strong>{draft.source_variable}</strong>
                <div className={styles.twoCols}>
                  <label>Metric ID<input value={draft.metric_id} onChange={(event) => updateDraft(index, { metric_id: event.target.value })} required /></label>
                  <label>Rótulo<input value={draft.label} onChange={(event) => updateDraft(index, { label: event.target.value })} required /></label>
                </div>
                <div className={styles.twoCols}>
                  <label>Tipo<select value={draft.type} onChange={(event) => updateDraft(index, { type: event.target.value as HnkMeasurementType })}>{HNK_MEASUREMENT_TYPES.map((value) => <option key={value}>{value}</option>)}</select></label>
                  <label>Unidade<input value={draft.unit} onChange={(event) => updateDraft(index, { unit: event.target.value })} placeholder="opcional" /></label>
                </div>
                <label>Método de coleta<textarea value={draft.collection_method} onChange={(event) => updateDraft(index, { collection_method: event.target.value })} required /></label>
                <div className={styles.twoCols}>
                  <label>Fonte<select value={draft.evidence_source} onChange={(event) => updateDraft(index, { evidence_source: event.target.value as HnkMeasurementEvidenceSource })}>{HNK_MEASUREMENT_EVIDENCE_SOURCES.map((value) => <option key={value}>{value}</option>)}</select></label>
                  <label>Momento<select value={draft.timepoint} onChange={(event) => updateDraft(index, { timepoint: event.target.value as HnkMeasurementTimepoint })}>{HNK_MEASUREMENT_TIMEPOINTS.map((value) => <option key={value}>{value}</option>)}</select></label>
                </div>
                <label>Detalhe do momento<input value={draft.timepoint_label} onChange={(event) => updateDraft(index, { timepoint_label: event.target.value })} placeholder="obrigatório em FOLLOW_UP / EVENT_BOUNDARY" /></label>
                <label>Critério preregistrado<textarea value={draft.evaluation_criterion} onChange={(event) => updateDraft(index, { evaluation_criterion: event.target.value })} required /></label>
                {["NUMBER", "COUNT"].includes(draft.type) ? <div className={styles.twoCols}><label>Mínimo<input type="number" value={draft.min} onChange={(event) => updateDraft(index, { min: event.target.value })} /></label><label>Máximo<input type="number" value={draft.max} onChange={(event) => updateDraft(index, { max: event.target.value })} /></label></div> : null}
                {draft.type === "CATEGORY" ? <label>Categorias, uma por linha<textarea value={draft.category_options} onChange={(event) => updateDraft(index, { category_options: event.target.value })} required /></label> : null}
                {draft.type === "SCALE" ? <div className={styles.twoCols}><label>Scale min<input type="number" value={draft.scale_min} onChange={(event) => updateDraft(index, { scale_min: event.target.value })} /></label><label>Scale max<input type="number" value={draft.scale_max} onChange={(event) => updateDraft(index, { scale_max: event.target.value })} /></label><label>Scale step<input type="number" step="any" value={draft.scale_step} onChange={(event) => updateDraft(index, { scale_step: event.target.value })} /></label></div> : null}
              </article>
            ))}
            <button className={styles.primaryButton}>Selar Measurement Contract</button>
          </form>
        ) : null}

        {experiment && contract ? (
          <>
            <section className={styles.sessionHeader}>
              <div><p className={styles.kicker}>LOCKED MEASUREMENT PLAN</p><code>{contract.measurement_plan_digest}</code><h2>{contract.metrics.length} métricas tipadas</h2><p>{contract.experiment_id} · preregistration SHA-256 bound</p></div>
              <button className={styles.ghostButton} onClick={() => { setContract(null); setDrafts(experiment.plan.observed_variables.map(draftFor)); }}>Novo plano</button>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}><div><p className={styles.kicker}>METRIC DEFINITIONS</p><h2>Plano preregistrado</h2></div><div className={styles.badges}><span>PLAN LOCKED</span><span>{validation?.ok ? "BINDING PASS" : "CHECK"}</span></div></div>
              <div className={styles.eventList}>{contract.metrics.map((metric) => <article key={metric.metric_id}><strong>{metric.metric_id} · {metric.label}</strong><code>{metric.type} · {metric.unit ?? "unitless"} · {metric.evidence_source} · {metric.timepoint}</code><p>{metric.collection_method}</p><p>Critério: {metric.evaluation_criterion}</p></article>)}</div>
            </section>

            {experiment.sessions.length ? (
              <form className={styles.stageCard} onSubmit={recordMeasurement}>
                <p className={styles.kicker}>03 · RECORD</p>
                <h2>Registrar medida tipada</h2>
                <div className={styles.twoCols}>
                  <label>Assignment<select value={assignmentId} onChange={(event) => setAssignmentId(event.target.value)} required><option value="">Selecione</option>{experiment.sessions.map((entry) => <option key={entry.assignment_id} value={entry.assignment_id}>{entry.role} · {entry.assignment_id}</option>)}</select></label>
                  <label>Métrica<select value={metricId} onChange={(event) => setMetricId(event.target.value)} required><option value="">Selecione</option>{contract.metrics.map((metric) => <option key={metric.metric_id} value={metric.metric_id}>{metric.metric_id} · {metric.type}</option>)}</select></label>
                </div>
                {contract.metrics.find((entry) => entry.metric_id === metricId)?.type === "BOOLEAN" ? <label>Valor<select value={measurementValue} onChange={(event) => setMeasurementValue(event.target.value)} required><option value="">Selecione</option><option value="true">true</option><option value="false">false</option></select></label> : <label>Valor<input value={measurementValue} onChange={(event) => setMeasurementValue(event.target.value)} required /></label>}
                <label>Nota opcional<textarea value={measurementNote} onChange={(event) => setMeasurementNote(event.target.value)} /></label>
                <button className={styles.primaryButton}>Adicionar medida</button>
              </form>
            ) : <section className={styles.stageCard}><p className={styles.kicker}>03 · WAITING FOR SESSIONS</p><h2>Plano selado</h2><p>Importe uma versão posterior do mesmo experimento, contendo assignments `CONTROL` / `EXPERIMENT`, para registrar medidas. O digest da preregistration precisa continuar idêntico.</p></section>}

            {matrix ? <section className={styles.auditPanel}><div className={styles.auditHeader}><div><p className={styles.kicker}>MEASUREMENT MATRIX</p><h2>{matrix.rows.length} assignments</h2></div><div className={styles.badges}><span>{contract.records.length} RECORDS</span><span>NO IMPUTATION</span></div></div><div className={styles.eventList}>{matrix.rows.map((row) => <article key={row.assignment_id}><strong>{row.role} · {row.assignment_id}</strong><code>{row.session_id}</code>{matrix.metrics.map((metric) => <p key={metric.metric_id}>{metric.metric_id}: {JSON.stringify(row.values[metric.metric_id])}</p>)}<code>missing: {row.missing_metrics.join(", ") || "none"}</code></article>)}</div></section> : null}

            {descriptive ? <section className={styles.resultCard}><p className={styles.kicker}>DESCRIPTIVE SUMMARY</p><h2>Controle × experimental</h2>{descriptive.metrics.map((metric) => <article key={metric.metric_id}><strong>{metric.label} · {metric.type}</strong><pre>{JSON.stringify({ control: metric.control, experiment: metric.experiment }, null, 2)}</pre><p>Critério preregistrado: {metric.evaluation_criterion}</p></article>)}<code>inferential_statistics_performed=false · causal_claim_permitted=false · metaphysical_proof_permitted=false</code></section> : null}
          </>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
