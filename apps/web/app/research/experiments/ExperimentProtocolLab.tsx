"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  addExperimentArtifact,
  createExperimentAttestation,
  createExperimentProtocol,
  experimentDescriptiveSummary,
  finalizeExperimentProtocol,
  parseExperimentProtocol,
  parseRuntimeSessionArtifact,
  serializeExperimentProtocol,
  type HnkExperimentAttestation,
  type HnkExperimentProtocol,
  type HnkExperimentRole,
} from "@hnk/quest-engine";
import ExperimentAttestationPanel from "./ExperimentAttestationPanel";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "EXPERIMENT_RECORD_NOT_CAUSAL_OR_METAPHYSICAL_PROOF";
  summary: {
    preregistration_required: boolean;
    control_required: boolean;
    deterministic_artifact_replay_required: boolean;
    causal_claim_permitted: false;
    metaphysical_proof_permitted: false;
  };
  attestation: {
    algorithm: "SHA-256";
    scope: "CONTENT_INTEGRITY_ONLY";
    timestamp_authority: "NONE";
    identity_signature: "NONE";
  };
};

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function lines(value: string) {
  return value.split("\n").map((entry) => entry.trim()).filter(Boolean);
}

function downloadProtocol(protocol: HnkExperimentProtocol) {
  const blob = new Blob([serializeExperimentProtocol(protocol)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${protocol.experiment_id}.hnk-experiment.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ExperimentProtocolLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [protocol, setProtocol] = useState<HnkExperimentProtocol | null>(null);
  const [baselineAttestation, setBaselineAttestation] = useState<HnkExperimentAttestation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("Experimento HNK controlado");
  const [question, setQuestion] = useState("Os registros diferem entre a condição controle e a condição experimental?");
  const [hypothesis, setHypothesis] = useState("Pode haver diferença descritiva entre os registros, sem pressupor causalidade.");
  const [observedVariables, setObservedVariables] = useState("result_state\nobservation_count\nevidence_scope");
  const [controlledVariables, setControlledVariables] = useState("mesmo runtime contract\nmesmos critérios de registro");
  const [intervention, setIntervention] = useState("Aplicar a condição simbólica definida apenas às sessões experimentais.");
  const [controlRequired, setControlRequired] = useState(1);
  const [experimentRequired, setExperimentRequired] = useState(1);
  const [completionCriteria, setCompletionCriteria] = useState("artifacts válidos e replay MATCH nos dois papéis");
  const [exclusionCriteria, setExclusionCriteria] = useState("artifact inválido\nreplay MISMATCH\nsessão duplicada");
  const [descriptiveSummary, setDescriptiveSummary] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [limitations, setLimitations] = useState("amostra limitada\nevidência dependente do escopo registrado");

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/experiments", {
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

  function preregister(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      const timestamp = now();
      const nextProtocol = createExperimentProtocol({
        experiment_id: id("experiment"),
        created_at: timestamp,
        locked_at: timestamp,
        title,
        question,
        hypothesis,
        plan: {
          observed_variables: lines(observedVariables),
          controlled_variables: lines(controlledVariables),
          intervention,
          control_sessions_required: controlRequired,
          experimental_sessions_required: experimentRequired,
          completion_criteria: lines(completionCriteria),
          exclusion_criteria: lines(exclusionCriteria),
        },
      });
      setProtocol(nextProtocol);
      setBaselineAttestation(createExperimentAttestation(nextProtocol, { generated_at: timestamp }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "PREREGISTRATION_FAILED");
    }
  }

  async function importArtifact(event: ChangeEvent<HTMLInputElement>, role: HnkExperimentRole) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !protocol) return;
    try {
      setError("");
      const artifact = parseRuntimeSessionArtifact(await file.text());
      setProtocol(addExperimentArtifact(protocol, {
        assignment_id: id(role.toLowerCase()),
        role,
        added_at: now(),
        artifact,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ARTIFACT_IMPORT_FAILED");
    }
  }

  async function importExperiment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setProtocol(parseExperimentProtocol(await file.text()));
      setBaselineAttestation(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "EXPERIMENT_IMPORT_FAILED");
    }
  }

  function finalize(event: FormEvent) {
    event.preventDefault();
    if (!protocol) return;
    try {
      setError("");
      setProtocol(finalizeExperimentProtocol(protocol, {
        completed_at: now(),
        descriptive_summary: descriptiveSummary,
        interpretation,
        limitations: lines(limitations),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "FINALIZATION_FAILED");
    }
  }

  const summary = protocol ? experimentDescriptiveSummary(protocol) as {
    counts: { control: number; experiment: number; total: number };
    control: Array<{ assignment_id: string; session_id: string; result_state: string | null; evidence_scope: string | null; observations: number }>;
    experiment: Array<{ assignment_id: string; session_id: string; result_state: string | null; evidence_scope: string | null; observations: number }>;
  } : null;

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Experiment Lab</h2>
        <p>O token libera apenas a bancada. Experimentos, artifacts e attestations permanecem em arquivos controlados pelo usuário, sem persistência automática.</p>
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
          <span className={handshake.summary.deterministic_artifact_replay_required ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>Preregistration + control + experiment + SHA-256 attestation</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{protocol?.status ?? "—"}</strong><span>status</span></article>
          <article><strong>{summary?.counts.total ?? 0}</strong><span>sessions</span></article>
          <article><strong>{summary?.counts.control ?? 0}</strong><span>control</span></article>
          <article><strong>{summary?.counts.experiment ?? 0}</strong><span>experiment</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}. O protocolo organiza registros e comparação descritiva; não concede prova causal ou metafísica.</p>
        <p className={styles.boundary}>{handshake.attestation.scope} · {handshake.attestation.algorithm}. Sem assinatura de identidade ou timestamp confiável externo.</p>

        <label>
          Importar experimento JSON
          <input type="file" accept="application/json,.json" onChange={importExperiment} />
        </label>
      </aside>

      <section className={styles.mainPanel}>
        {!protocol ? (
          <form className={styles.stageCard} onSubmit={preregister}>
            <p className={styles.kicker}>01 · PREREGISTRATION</p>
            <h2>Definir o experimento antes das sessões</h2>
            <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
            <label>Pergunta<textarea value={question} onChange={(event) => setQuestion(event.target.value)} required /></label>
            <label>Hipótese<textarea value={hypothesis} onChange={(event) => setHypothesis(event.target.value)} required /></label>
            <div className={styles.twoCols}>
              <label>Variáveis observadas<textarea value={observedVariables} onChange={(event) => setObservedVariables(event.target.value)} required /></label>
              <label>Variáveis controladas<textarea value={controlledVariables} onChange={(event) => setControlledVariables(event.target.value)} /></label>
            </div>
            <label>Condição/intervenção<textarea value={intervention} onChange={(event) => setIntervention(event.target.value)} /></label>
            <div className={styles.twoCols}>
              <label>Controles mínimos<input type="number" min={1} value={controlRequired} onChange={(event) => setControlRequired(Number(event.target.value))} /></label>
              <label>Experimentais mínimos<input type="number" min={1} value={experimentRequired} onChange={(event) => setExperimentRequired(Number(event.target.value))} /></label>
            </div>
            <div className={styles.twoCols}>
              <label>Critérios de conclusão<textarea value={completionCriteria} onChange={(event) => setCompletionCriteria(event.target.value)} required /></label>
              <label>Critérios de exclusão<textarea value={exclusionCriteria} onChange={(event) => setExclusionCriteria(event.target.value)} /></label>
            </div>
            <button className={styles.primaryButton}>Selar preregistration + gerar fingerprint</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>LOCKED PROTOCOL</p>
                <code>{protocol.experiment_id}</code>
                <h2>{protocol.title}</h2>
                <p>{protocol.question}</p>
              </div>
              <div>
                <button className={styles.ghostButton} onClick={() => downloadProtocol(protocol)}>Exportar experimento</button>
                <button className={styles.ghostButton} onClick={() => { setProtocol(null); setBaselineAttestation(null); setError(""); }}>Novo experimento</button>
              </div>
            </section>

            <div className={styles.stageGrid}>
              <section className={styles.stageCard}>
                <p className={styles.kicker}>02 · CONTROL</p>
                <h3>Adicionar artifact controle</h3>
                <p>Necessários: {protocol.plan.control_sessions_required}. Cada arquivo deve passar replay determinístico.</p>
                <input type="file" accept="application/json,.json" disabled={protocol.status === "COMPLETED"} onChange={(event) => importArtifact(event, "CONTROL")} />
              </section>

              <section className={styles.stageCard}>
                <p className={styles.kicker}>03 · EXPERIMENT</p>
                <h3>Adicionar artifact experimental</h3>
                <p>Necessários: {protocol.plan.experimental_sessions_required}. O papel é atribuído explicitamente pelo pesquisador.</p>
                <input type="file" accept="application/json,.json" disabled={protocol.status === "COMPLETED"} onChange={(event) => importArtifact(event, "EXPERIMENT")} />
              </section>
            </div>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div><p className={styles.kicker}>DESCRIPTIVE RECORDS</p><h2>{summary?.counts.total ?? 0} sessões admitidas</h2></div>
                <div className={styles.badges}><span>CONTROL {summary?.counts.control ?? 0}</span><span>EXPERIMENT {summary?.counts.experiment ?? 0}</span><span>{protocol.status}</span></div>
              </div>
              <div className={styles.eventList}>
                {[...(summary?.control ?? []).map((entry) => ({ ...entry, role: "CONTROL" })), ...(summary?.experiment ?? []).map((entry) => ({ ...entry, role: "EXPERIMENT" }))].map((entry) => (
                  <article key={entry.assignment_id}>
                    <strong>{entry.role} · {entry.session_id}</strong>
                    <code>result: {entry.result_state ?? "—"} · evidence: {entry.evidence_scope ?? "—"}</code>
                    <code>observations: {entry.observations}</code>
                  </article>
                ))}
              </div>
            </section>

            <ExperimentAttestationPanel protocol={protocol} baselineAttestation={baselineAttestation} />

            {protocol.status === "READY_TO_FINALIZE" ? (
              <form className={styles.stageCard} onSubmit={finalize}>
                <p className={styles.kicker}>04 · REPORT</p>
                <h2>Separar descrição de interpretação</h2>
                <label>Resumo descritivo<textarea value={descriptiveSummary} onChange={(event) => setDescriptiveSummary(event.target.value)} placeholder="O que os registros mostram, sem explicar por quê." required /></label>
                <label>Interpretação<textarea value={interpretation} onChange={(event) => setInterpretation(event.target.value)} placeholder="Sua leitura dos registros, explicitamente separada." required /></label>
                <label>Limitações<textarea value={limitations} onChange={(event) => setLimitations(event.target.value)} /></label>
                <button className={styles.primaryButton}>Finalizar experimento</button>
              </form>
            ) : null}

            {protocol.report ? (
              <section className={styles.resultCard}>
                <p className={styles.kicker}>COMPLETED REPORT</p>
                <h3>Descrição</h3><p>{protocol.report.descriptive_summary}</p>
                <h3>Interpretação</h3><p>{protocol.report.interpretation}</p>
                <h3>Limitações</h3><p>{protocol.report.limitations.join(" · ") || "Nenhuma informada"}</p>
                <code>{protocol.claim_boundary}</code>
              </section>
            ) : null}
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
