"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_DEPLOYMENT_GATE_DECISIONS,
  createDeploymentGateRegistry,
  decideHumanDeploymentGate,
  deploymentGateRegistryIndex,
  evaluateDeploymentCandidate,
  nominateDeploymentCandidate,
  parseDeploymentGateRegistry,
  parseReleaseVerificationRegistry,
  releaseVerificationRegistryIndex,
  serializeDeploymentGateRegistry,
  type HnkDeploymentGateDecision,
  type HnkDeploymentGateRegistry,
  type HnkReleaseVerificationRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  boundary: string;
  summary: {
    candidate_requires_current_release_acceptance: true;
    deployment_approval_requires_current_candidate_eligibility: true;
    release_accepted_auto_approves_deployment: false;
    latest_release_evidence_can_stale_candidate: true;
    explicit_human_nomination_required: true;
    human_deployment_gate_required: true;
    machine_can_nominate: false;
    machine_can_approve_deployment: false;
    deployment_execution_performed_by_registry: false;
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

export default function DeploymentGateLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [releaseRegistry, setReleaseRegistry] =
    useState<HnkReleaseVerificationRegistry | null>(null);
  const [deploymentRegistry, setDeploymentRegistry] =
    useState<HnkDeploymentGateRegistry | null>(null);

  const [registryKey, setRegistryKey] = useState("");
  const [registryTitle, setRegistryTitle] = useState("");

  const [nominationReleaseKey, setNominationReleaseKey] = useState("");
  const [targetEnvironment, setTargetEnvironment] = useState("production");
  const [nominatedBy, setNominatedBy] = useState("TW-DVF");
  const [nominationSignal, setNominationSignal] = useState("");
  const [nominationRationale, setNominationRationale] = useState("");

  const [candidateId, setCandidateId] = useState("");
  const [deploymentDecision, setDeploymentDecision] =
    useState<HnkDeploymentGateDecision>("DEPLOYMENT_HELD");
  const [reviewer, setReviewer] = useState("TW-DVF");
  const [decisionSignal, setDecisionSignal] = useState("");
  const [decisionRationale, setDecisionRationale] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const releaseIndex = useMemo(() => {
    if (!releaseRegistry) return null;
    try {
      return releaseVerificationRegistryIndex(releaseRegistry);
    } catch {
      return null;
    }
  }, [releaseRegistry]);

  const deploymentIndex = useMemo(() => {
    if (!deploymentRegistry) return null;
    try {
      return deploymentGateRegistryIndex(deploymentRegistry);
    } catch {
      return null;
    }
  }, [deploymentRegistry]);

  const evaluations = useMemo(() => {
    if (!deploymentRegistry || !releaseRegistry) return [];
    return deploymentRegistry.candidates.map((candidate) => ({
      candidate,
      evaluation: evaluateDeploymentCandidate(
        deploymentRegistry,
        releaseRegistry,
        candidate.candidate_id,
      ),
    }));
  }, [deploymentRegistry, releaseRegistry]);

  const selected = evaluations.find(
    ({ candidate }) => candidate.candidate_id === candidateId,
  ) ?? null;

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/deployment-gate", {
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
      setDeploymentRegistry(createDeploymentGateRegistry({
        registry_key: registryKey,
        title: registryTitle,
        created_at: now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "DEPLOYMENT_REGISTRY_CREATE_FAILED");
    }
  }

  async function importReleaseRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setError("");
      const parsed = parseReleaseVerificationRegistry(await file.text());
      setReleaseRegistry(parsed);
      const accepted = releaseVerificationRegistryIndex(parsed).statuses.find(
        (status) => status.accepted,
      );
      setNominationReleaseKey(accepted?.release_key ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "RELEASE_REGISTRY_IMPORT_FAILED");
    }
  }

  async function importDeploymentRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setError("");
      const parsed = parseDeploymentGateRegistry(await file.text());
      setDeploymentRegistry(parsed);
      setRegistryKey(parsed.registry_key);
      setRegistryTitle(parsed.title);
      setCandidateId(parsed.candidates.at(-1)?.candidate_id ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "DEPLOYMENT_REGISTRY_IMPORT_FAILED");
    }
  }

  function nominateCandidate(event: FormEvent) {
    event.preventDefault();
    if (!deploymentRegistry || !releaseRegistry) return;

    try {
      setError("");
      const next = nominateDeploymentCandidate(deploymentRegistry, {
        release_verification_registry: releaseRegistry,
        release_key: nominationReleaseKey,
        target_environment: targetEnvironment,
        nominated_by: nominatedBy,
        nominated_at: now(),
        explicit_human_signal: nominationSignal,
        rationale: nominationRationale,
      });
      setDeploymentRegistry(next);
      setCandidateId(next.candidates.at(-1)?.candidate_id ?? "");
      setNominationSignal("");
      setNominationRationale("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "DEPLOYMENT_NOMINATION_FAILED");
    }
  }

  function submitDeploymentDecision(event: FormEvent) {
    event.preventDefault();
    if (!deploymentRegistry || !releaseRegistry || !candidateId) return;

    try {
      setError("");
      const next = decideHumanDeploymentGate(deploymentRegistry, {
        release_verification_registry: releaseRegistry,
        candidate_id: candidateId,
        decision: deploymentDecision,
        reviewer,
        decided_at: now(),
        explicit_human_signal: decisionSignal,
        rationale: decisionRationale,
      });
      setDeploymentRegistry(next);
      setDecisionSignal("");
      setDecisionRationale("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "HUMAN_DEPLOYMENT_GATE_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Deployment Gate</h2>
        <p>
          RELEASE_ACCEPTED permite candidatura, não deployment. A autorização de deployment exige
          outro sinal humano explícito e o vínculo da release precisa continuar atual.
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

  const acceptedReleases =
    releaseIndex?.statuses.filter((status) => status.accepted) ?? [];

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <article className={styles.healthCard}>
          <span className={handshake.summary.machine_can_approve_deployment === false ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>human nomination · current-state eligibility · human deployment gate</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{acceptedReleases.length}</strong><span>accepted releases</span></article>
          <article><strong>{deploymentIndex?.candidates ?? 0}</strong><span>candidates</span></article>
          <article><strong>{deploymentIndex?.recorded_approvals ?? 0}</strong><span>recorded approvals</span></article>
          <article><strong>{deploymentIndex?.human_gate_pending_without_current_state_check ?? 0}</strong><span>gate pending</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>
          Release Verification Registry atual
          <input type="file" accept="application/json,.json" onChange={importReleaseRegistry} />
        </label>

        <label>
          Importar Deployment Gate Registry
          <input type="file" accept="application/json,.json" onChange={importDeploymentRegistry} />
        </label>

        {deploymentRegistry ? (
          <button
            className={styles.ghostButton}
            onClick={() => downloadJson(
              `${deploymentRegistry.registry_key}.hnk-deployment-gate-registry.json`,
              serializeDeploymentGateRegistry(deploymentRegistry),
            )}
          >
            Exportar Deployment Gate Registry
          </button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!deploymentRegistry ? (
          <form className={styles.stageCard} onSubmit={createRegistry}>
            <p className={styles.kicker}>01 · CREATE DEPLOYMENT GOVERNANCE</p>
            <h2>Abrir Deployment Gate Registry</h2>
            <label>
              Registry key
              <input value={registryKey} onChange={(event) => setRegistryKey(event.target.value)} required />
            </label>
            <label>
              Título
              <input value={registryTitle} onChange={(event) => setRegistryTitle(event.target.value)} required />
            </label>
            <button className={styles.primaryButton}>Criar Deployment Gate Registry</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>DEPLOYMENT GATE REGISTRY V1</p>
                <code>{deploymentRegistry.registry_digest}</code>
                <h2>{deploymentRegistry.title}</h2>
                <p>{deploymentRegistry.registry_key}</p>
              </div>
              <div className={styles.badges}>
                <span>RELEASE_ACCEPTED ≠ DEPLOYMENT_APPROVED</span>
                <span>NO AUTO DEPLOY</span>
                <span>NO AUTO CANON</span>
              </div>
            </section>

            <form className={styles.stageCard} onSubmit={nominateCandidate}>
              <p className={styles.kicker}>02 · HUMAN NOMINATION</p>
              <h2>Nomear release aceita como Deployment Candidate</h2>
              {!releaseRegistry ? (
                <p>Importe o Release Verification Registry atual.</p>
              ) : acceptedReleases.length === 0 ? (
                <p>Nenhuma release atualmente aceita está disponível para candidatura.</p>
              ) : (
                <>
                  <label>
                    Release aceita
                    <select
                      value={nominationReleaseKey}
                      onChange={(event) => setNominationReleaseKey(event.target.value)}
                      required
                    >
                      <option value="">Selecione</option>
                      {acceptedReleases.map((status) => (
                        <option key={status.release_key} value={status.release_key}>
                          {status.release_key} · {status.latest_report_status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Target environment
                    <input value={targetEnvironment} onChange={(event) => setTargetEnvironment(event.target.value)} required />
                  </label>
                  <label>
                    Nominated by
                    <input value={nominatedBy} onChange={(event) => setNominatedBy(event.target.value)} required />
                  </label>
                  <label>
                    Sinal humano explícito
                    <input value={nominationSignal} onChange={(event) => setNominationSignal(event.target.value)} placeholder="NOMINATE FOR PRODUCTION" required />
                  </label>
                  <label>
                    Rationale
                    <textarea value={nominationRationale} onChange={(event) => setNominationRationale(event.target.value)} required />
                  </label>
                  <button className={styles.primaryButton}>Criar Deployment Candidate</button>
                </>
              )}
            </form>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>CURRENT CANDIDATE ELIGIBILITY</p>
                  <h2>Candidatos vinculados ao estado atual da release</h2>
                </div>
                <div className={styles.badges}>
                  <span>{evaluations.filter(({ evaluation }) => evaluation.eligibility_status === "ELIGIBLE").length} ELIGIBLE</span>
                  <span>{evaluations.filter(({ evaluation }) => evaluation.approved_for_deployment).length} APPROVED NOW</span>
                </div>
              </div>

              <div className={styles.eventList}>
                {evaluations.map(({ candidate, evaluation }) => (
                  <article key={candidate.candidate_id}>
                    <strong>
                      {candidate.release_key} · {candidate.target_environment} · {evaluation.eligibility_status}
                    </strong>
                    <p>
                      report={candidate.report_overall_status} · release_accepted={String(evaluation.release_accepted)}
                    </p>
                    <p>
                      deployment_decision={evaluation.latest_deployment_decision ?? "NONE"} ·
                      approved_now={String(evaluation.approved_for_deployment)}
                    </p>
                    <p>
                      report_match={String(evaluation.latest_report_matches_candidate)} ·
                      release_decision_match={String(evaluation.release_decision_matches_candidate)}
                    </p>
                    <code>{candidate.candidate_digest}</code>
                    <button
                      className={styles.ghostButton}
                      onClick={() => {
                        setCandidateId(candidate.candidate_id);
                        setDeploymentDecision("DEPLOYMENT_HELD");
                        setDecisionSignal("");
                        setDecisionRationale("");
                      }}
                    >
                      Abrir Human Deployment Gate
                    </button>
                  </article>
                ))}
              </div>
            </section>

            {selected ? (
              <form className={styles.stageCard} onSubmit={submitDeploymentDecision}>
                <p className={styles.kicker}>03 · HUMAN DEPLOYMENT GATE</p>
                <h2>Autorizar, rejeitar ou reter candidatura</h2>
                <p>
                  {selected.candidate.release_key} → {selected.candidate.target_environment} ·
                  eligibility={selected.evaluation.eligibility_status}
                </p>
                <code>{selected.candidate.candidate_id}</code>

                <label>
                  Decision
                  <select
                    value={deploymentDecision}
                    onChange={(event) => setDeploymentDecision(event.target.value as HnkDeploymentGateDecision)}
                  >
                    {HNK_DEPLOYMENT_GATE_DECISIONS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>

                <label>
                  Reviewer
                  <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} required />
                </label>

                <label>
                  Sinal humano explícito
                  <input
                    value={decisionSignal}
                    onChange={(event) => setDecisionSignal(event.target.value)}
                    placeholder="APPROVE DEPLOYMENT / HOLD DEPLOYMENT / REJECT DEPLOYMENT"
                    required
                  />
                </label>

                <label>
                  Rationale
                  <textarea value={decisionRationale} onChange={(event) => setDecisionRationale(event.target.value)} required />
                </label>

                {deploymentDecision === "DEPLOYMENT_APPROVED" &&
                selected.evaluation.eligibility_status !== "ELIGIBLE" ? (
                  <p>
                    DEPLOYMENT_APPROVED está bloqueado: o candidate precisa estar ELIGIBLE contra o
                    Release Verification Registry atual. Gere/aceite o novo report e nomeie um novo candidate.
                  </p>
                ) : null}

                <button
                  className={styles.primaryButton}
                  disabled={
                    deploymentDecision === "DEPLOYMENT_APPROVED" &&
                    selected.evaluation.eligibility_status !== "ELIGIBLE"
                  }
                >
                  Registrar Human Deployment Decision
                </button>
              </form>
            ) : null}

            {deploymentRegistry.decisions.length ? (
              <section className={styles.auditPanel}>
                <div className={styles.auditHeader}>
                  <div>
                    <p className={styles.kicker}>DEPLOYMENT DECISION HISTORY</p>
                    <h2>Histórico não destrutivo</h2>
                  </div>
                  <div className={styles.badges}>
                    <span>{deploymentRegistry.decisions.length} EVENTS</span>
                    <span>DEPLOYMENT_EXECUTED=false</span>
                  </div>
                </div>
                <div className={styles.eventList}>
                  {deploymentRegistry.decisions.map((event) => (
                    <article key={event.deployment_decision_id}>
                      <strong>{event.release_key} · {event.target_environment} · {event.decision}</strong>
                      <p>eligibility_at_decision={event.eligibility_at_decision}</p>
                      <p>reviewer={event.reviewer} · signal={event.explicit_human_signal}</p>
                      <p>{event.rationale}</p>
                      <p>supersedes={event.supersedes_deployment_decision_id ?? "—"}</p>
                      <code>{event.decision_digest}</code>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
