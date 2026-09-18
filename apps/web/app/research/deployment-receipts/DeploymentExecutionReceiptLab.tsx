"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_DEPLOYMENT_EXECUTION_RESULTS,
  createDeploymentExecutionReceipt,
  evaluateDeploymentCandidate,
  parseDeploymentExecutionReceipt,
  parseDeploymentGateRegistry,
  parseReleaseVerificationRegistry,
  serializeDeploymentExecutionReceipt,
  type HnkDeploymentExecutionReceipt,
  type HnkDeploymentExecutionResult,
  type HnkDeploymentGateRegistry,
  type HnkReleaseVerificationRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  boundary: string;
  summary: {
    requires_current_approved_deployment_candidate: true;
    exact_git_commit_match_required: true;
    provider_payload_sha256_binding: true;
    deployment_approval_is_not_execution: true;
    deployment_execution_performed_by_contract: false;
    provider_signature_verified: false;
    production_readiness_inferred: false;
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

function expectedCommitFromReport(
  releaseRegistry: HnkReleaseVerificationRegistry,
  reportDigest: string,
) {
  const record = releaseRegistry.reports.find(
    (entry) => entry.report_digest === reportDigest,
  );
  const check = record?.report.checks.find(
    (entry) => entry.check_id === "GIT:COMMIT",
  );
  return check?.expected ?? "";
}

export default function DeploymentExecutionReceiptLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [releaseRegistry, setReleaseRegistry] =
    useState<HnkReleaseVerificationRegistry | null>(null);
  const [deploymentRegistry, setDeploymentRegistry] =
    useState<HnkDeploymentGateRegistry | null>(null);
  const [receipt, setReceipt] =
    useState<HnkDeploymentExecutionReceipt | null>(null);

  const [candidateId, setCandidateId] = useState("");
  const [receiptKey, setReceiptKey] = useState("");
  const [observedCommit, setObservedCommit] = useState("");
  const [providerName, setProviderName] = useState("Vercel");
  const [deploymentId, setDeploymentId] = useState("");
  const [deploymentUrl, setDeploymentUrl] = useState("");
  const [result, setResult] =
    useState<HnkDeploymentExecutionResult>("UNKNOWN");
  const [startedAt, setStartedAt] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [observedBy, setObservedBy] = useState("TW-DVF");
  const [observedAt, setObservedAt] = useState("");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [providerPayload, setProviderPayload] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const evaluations = useMemo(() => {
    if (!releaseRegistry || !deploymentRegistry) return [];
    return deploymentRegistry.candidates.map((candidate) => ({
      candidate,
      evaluation: evaluateDeploymentCandidate(
        deploymentRegistry,
        releaseRegistry,
        candidate.candidate_id,
      ),
    }));
  }, [releaseRegistry, deploymentRegistry]);

  const approvedCandidates = evaluations.filter(
    ({ evaluation }) => evaluation.approved_for_deployment,
  );

  const selected = approvedCandidates.find(
    ({ candidate }) => candidate.candidate_id === candidateId,
  ) ?? null;

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/deployment-receipts", {
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

  async function importReleaseRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setReleaseRegistry(parseReleaseVerificationRegistry(await file.text()));
      setReceipt(null);
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
      setDeploymentRegistry(parseDeploymentGateRegistry(await file.text()));
      setCandidateId("");
      setReceipt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "DEPLOYMENT_REGISTRY_IMPORT_FAILED");
    }
  }

  async function importReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setReceipt(parseDeploymentExecutionReceipt(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "RECEIPT_IMPORT_FAILED");
    }
  }

  function chooseCandidate(id: string) {
    setCandidateId(id);
    const item = approvedCandidates.find(
      ({ candidate }) => candidate.candidate_id === id,
    );
    if (!item || !releaseRegistry) return;
    setObservedCommit(
      expectedCommitFromReport(releaseRegistry, item.candidate.report_digest),
    );
    setReceiptKey(
      `DEPLOY-RECEIPT-${item.candidate.release_key}-${item.candidate.target_environment}`,
    );
    setCompletedAt(now());
    setObservedAt(now());
    setReceipt(null);
  }

  function createReceipt(event: FormEvent) {
    event.preventDefault();
    if (!releaseRegistry || !deploymentRegistry || !candidateId) return;

    try {
      setError("");
      const created = createDeploymentExecutionReceipt({
        receipt_key: receiptKey,
        created_at: now(),
        deployment_gate_registry: deploymentRegistry,
        release_verification_registry: releaseRegistry,
        candidate_id: candidateId,
        observed_git_commit_sha: observedCommit,
        provider: {
          name: providerName,
          deployment_id: deploymentId,
          deployment_url: deploymentUrl || null,
          result,
          provider_payload_text: providerPayload,
        },
        execution: {
          started_at: startedAt || null,
          completed_at: completedAt,
          observed_by: observedBy,
          observed_at: observedAt,
          evidence_note: evidenceNote,
        },
      });
      setReceipt(created);
    } catch (err) {
      setReceipt(null);
      setError(err instanceof Error ? err.message : "RECEIPT_CREATE_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Deployment Execution Receipt</h2>
        <p>
          O recibo só pode nascer de um candidate ainda aprovado. O contrato registra a execução observada,
          mas não executa deployment e não transforma SUCCEEDED em production readiness.
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
          <span className={handshake.summary.production_readiness_inferred === false ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>authorization → observed execution → SHA-256 receipt</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{evaluations.length}</strong><span>candidates</span></article>
          <article><strong>{approvedCandidates.length}</strong><span>approved now</span></article>
          <article><strong>{receipt ? "YES" : "NO"}</strong><span>receipt loaded</span></article>
          <article><strong>{receipt?.provider.result ?? "—"}</strong><span>result</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>
          Release Verification Registry atual
          <input type="file" accept="application/json,.json" onChange={importReleaseRegistry} />
        </label>

        <label>
          Deployment Gate Registry atual
          <input type="file" accept="application/json,.json" onChange={importDeploymentRegistry} />
        </label>

        <label>
          Importar Execution Receipt existente
          <input type="file" accept="application/json,.json" onChange={importReceipt} />
        </label>

        {receipt ? (
          <button
            className={styles.ghostButton}
            onClick={() => downloadJson(
              `${receipt.receipt_key}.hnk-deployment-execution-receipt.json`,
              serializeDeploymentExecutionReceipt(receipt),
            )}
          >
            Exportar receipt
          </button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        <section className={styles.auditPanel}>
          <div className={styles.auditHeader}>
            <div>
              <p className={styles.kicker}>01 · CURRENT AUTHORIZATION</p>
              <h2>Deployment Candidates atualmente aprovados</h2>
            </div>
            <div className={styles.badges}>
              <span>{approvedCandidates.length} APPROVED NOW</span>
              <span>STALE = BLOCKED</span>
            </div>
          </div>

          <div className={styles.eventList}>
            {approvedCandidates.map(({ candidate, evaluation }) => (
              <article key={candidate.candidate_id}>
                <strong>
                  {candidate.release_key} · {candidate.target_environment} · DEPLOYMENT_APPROVED
                </strong>
                <p>
                  eligibility={evaluation.eligibility_status} ·
                  report={candidate.report_overall_status}
                </p>
                <code>{candidate.candidate_digest}</code>
                <button
                  className={styles.ghostButton}
                  onClick={() => chooseCandidate(candidate.candidate_id)}
                >
                  Registrar execução observada
                </button>
              </article>
            ))}
          </div>
        </section>

        {selected ? (
          <form className={styles.stageCard} onSubmit={createReceipt}>
            <p className={styles.kicker}>02 · OBSERVED DEPLOYMENT EXECUTION</p>
            <h2>Criar receipt sem executar deployment</h2>
            <p>
              {selected.candidate.release_key} → {selected.candidate.target_environment}
            </p>

            <div className={styles.twoCols}>
              <label>
                Receipt key
                <input value={receiptKey} onChange={(event) => setReceiptKey(event.target.value)} required />
              </label>
              <label>
                Observed Git commit
                <input value={observedCommit} onChange={(event) => setObservedCommit(event.target.value)} required />
              </label>
              <label>
                Provider
                <input value={providerName} onChange={(event) => setProviderName(event.target.value)} required />
              </label>
              <label>
                Deployment ID
                <input value={deploymentId} onChange={(event) => setDeploymentId(event.target.value)} required />
              </label>
              <label>
                Deployment URL
                <input value={deploymentUrl} onChange={(event) => setDeploymentUrl(event.target.value)} />
              </label>
              <label>
                Result
                <select value={result} onChange={(event) => setResult(event.target.value as HnkDeploymentExecutionResult)}>
                  {HNK_DEPLOYMENT_EXECUTION_RESULTS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>
                Started at
                <input value={startedAt} onChange={(event) => setStartedAt(event.target.value)} placeholder="ISO-8601 opcional" />
              </label>
              <label>
                Completed at
                <input value={completedAt} onChange={(event) => setCompletedAt(event.target.value)} required />
              </label>
              <label>
                Observed by
                <input value={observedBy} onChange={(event) => setObservedBy(event.target.value)} required />
              </label>
              <label>
                Observed at
                <input value={observedAt} onChange={(event) => setObservedAt(event.target.value)} required />
              </label>
            </div>

            <label>
              Evidence note
              <textarea value={evidenceNote} onChange={(event) => setEvidenceNote(event.target.value)} required />
            </label>

            <label>
              Provider payload exato
              <textarea
                value={providerPayload}
                onChange={(event) => setProviderPayload(event.target.value)}
                placeholder="Cole JSON/metadados/log resumido retornado pelo provider; o receipt grava somente SHA-256."
                required
              />
            </label>

            <button className={styles.primaryButton}>
              Selar Deployment Execution Receipt
            </button>
          </form>
        ) : null}

        {receipt ? (
          <section className={styles.auditPanel}>
            <div className={styles.auditHeader}>
              <div>
                <p className={styles.kicker}>SEALED EXECUTION RECEIPT</p>
                <h2>{receipt.provider.name} · {receipt.provider.result}</h2>
                <code>{receipt.receipt_digest}</code>
              </div>
              <div className={styles.badges}>
                <span>EXECUTION_RECORDED=true</span>
                <span>PROVIDER_SIGNATURE=false</span>
                <span>READINESS_INFERRED=false</span>
              </div>
            </div>

            <pre>{JSON.stringify({
              release_key: receipt.release_key,
              candidate_id: receipt.candidate_id,
              deployment_decision_id: receipt.deployment_decision_id,
              target_environment: receipt.target_environment,
              expected_git_commit_sha: receipt.expected_git_commit_sha,
              observed_git_commit_sha: receipt.observed_git_commit_sha,
              provider: receipt.provider,
              execution: receipt.execution,
              deployment_authorization_current_at_receipt_creation:
                receipt.deployment_authorization_current_at_receipt_creation,
              deployment_execution_performed_by_contract:
                receipt.deployment_execution_performed_by_contract,
              provider_signature_verified: receipt.provider_signature_verified,
              production_readiness_inferred: receipt.production_readiness_inferred,
              truth_assessed: receipt.truth_assessed,
              canon_promotion_permitted: receipt.canon_promotion_permitted,
            }, null, 2)}</pre>
          </section>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
