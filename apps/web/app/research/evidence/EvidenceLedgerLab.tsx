"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_EVIDENCE_CLAIM_SCOPES,
  addEvidenceClaim,
  createEvidenceLedger,
  evidenceLedgerIndex,
  parseEvidenceLedger,
  parseExperimentAttestation,
  parseExperimentProtocol,
  parseMeasurementContract,
  serializeEvidenceLedger,
  verifyEvidenceLedger,
  type HnkEvidenceClaimScope,
  type HnkEvidenceLedger,
  type HnkExperimentAttestation,
  type HnkExperimentProtocol,
  type HnkMeasurementContract,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "EVIDENCE_LEDGER_TRACKS_COVERAGE_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
  summary: {
    evidence_kinds: string[];
    claim_scopes: string[];
    requirement_kinds: string[];
    coverage_statuses: string[];
    sha256_bound_sources: boolean;
    explicit_insufficiency: boolean;
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

export default function EvidenceLedgerLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [protocol, setProtocol] = useState<HnkExperimentProtocol | null>(null);
  const [attestation, setAttestation] = useState<HnkExperimentAttestation | null>(null);
  const [measurement, setMeasurement] = useState<HnkMeasurementContract | null>(null);
  const [ledger, setLedger] = useState<HnkEvidenceLedger | null>(null);
  const [claimStatement, setClaimStatement] = useState("");
  const [claimScope, setClaimScope] = useState<HnkEvidenceClaimScope>("DESCRIPTIVE");
  const [metricId, setMetricId] = useState("");
  const [role, setRole] = useState<"CONTROL" | "EXPERIMENT">("CONTROL");
  const [minCount, setMinCount] = useState("1");
  const [requireAttestation, setRequireAttestation] = useState(true);
  const [requireReport, setRequireReport] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verification = useMemo(() => {
    if (!ledger || !protocol || !attestation || !measurement) return null;
    try {
      return verifyEvidenceLedger(ledger, protocol, attestation, measurement);
    } catch {
      return null;
    }
  }, [ledger, protocol, attestation, measurement]);

  const index = useMemo(() => {
    if (!ledger) return null;
    try {
      return evidenceLedgerIndex(ledger) as {
        experiment_id: string;
        ledger_digest: string;
        evidence: { preregistration: number; sessions: number; measurements: number; reports: number };
        claims: Array<{
          claim_id: string;
          statement: string;
          scope: string;
          coverage_status: string;
          satisfied_requirements: number;
          total_requirements: number;
          missing_requirements: string[];
          truth_assessed: false;
          requirements: Array<{
            requirement_id: string;
            kind: string;
            satisfied: boolean;
            observed_count: number | null;
            required_count: number | null;
            note: string;
          }>;
        }>;
        automatic_truth_inference: false;
      };
    } catch {
      return null;
    }
  }, [ledger]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/evidence", {
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

  async function importProtocol(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setProtocol(parseExperimentProtocol(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "PROTOCOL_IMPORT_FAILED");
    }
  }

  async function importAttestation(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setAttestation(parseExperimentAttestation(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ATTESTATION_IMPORT_FAILED");
    }
  }

  async function importMeasurement(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseMeasurementContract(await file.text());
      setMeasurement(parsed);
      if (parsed.metrics[0]) setMetricId(parsed.metrics[0].metric_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "MEASUREMENT_IMPORT_FAILED");
    }
  }

  async function importLedger(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setLedger(parseEvidenceLedger(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "LEDGER_IMPORT_FAILED");
    }
  }

  function buildLedger() {
    if (!protocol || !attestation || !measurement) return;
    try {
      setError("");
      setLedger(createEvidenceLedger(protocol, attestation, measurement, { created_at: now() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "LEDGER_BUILD_FAILED");
    }
  }

  function addClaim(event: FormEvent) {
    event.preventDefault();
    if (!ledger) return;
    try {
      setError("");
      const requirements: Array<Record<string, unknown>> = [];
      if (requireAttestation) {
        requirements.push({
          requirement_id: `REQ-ATTEST-${crypto.randomUUID()}`,
          kind: "ATTESTATION_INTEGRITY",
        });
      }
      if (metricId) {
        requirements.push({
          requirement_id: `REQ-METRIC-${crypto.randomUUID()}`,
          kind: "METRIC_ROLE_RECORDS",
          role,
          metric_id: metricId,
          min_count: Number(minCount),
        });
      }
      if (requireReport) {
        requirements.push({
          requirement_id: `REQ-REPORT-${crypto.randomUUID()}`,
          kind: "REPORT_PRESENT",
        });
      }
      if (!requirements.length) throw new Error("DECLARE_AT_LEAST_ONE_EVIDENCE_REQUIREMENT");

      const next = addEvidenceClaim(ledger, {
        claim_id: `CLAIM-${crypto.randomUUID()}`,
        statement: claimStatement,
        scope: claimScope,
        created_at: now(),
        requirements: requirements as never,
      });
      setLedger(next);
      setClaimStatement("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "CLAIM_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Evidence Ledger</h2>
        <p>O token libera apenas a bancada. Protocolos, attestations, medidas e ledgers continuam em arquivos controlados pelo usuário.</p>
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
          <span className={handshake.summary.sha256_bound_sources ? styles.goodDot : styles.badDot} />
          <div><strong>{handshake.layer}</strong><p>coverage ledger · no truth inference</p></div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{protocol ? "OK" : "—"}</strong><span>protocol</span></article>
          <article><strong>{attestation ? "OK" : "—"}</strong><span>attestation</span></article>
          <article><strong>{measurement ? "OK" : "—"}</strong><span>measurement</span></article>
          <article><strong>{verification?.ok === true ? "PASS" : ledger ? "CHECK" : "—"}</strong><span>source bind</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}. Cobertura de requisitos não é avaliação automática de verdade.</p>

        <label>Importar experimento JSON<input type="file" accept="application/json,.json" onChange={importProtocol} /></label>
        <label>Importar attestation JSON<input type="file" accept="application/json,.json" onChange={importAttestation} /></label>
        <label>Importar measurement JSON<input type="file" accept="application/json,.json" onChange={importMeasurement} /></label>
        <label>Importar evidence ledger JSON<input type="file" accept="application/json,.json" onChange={importLedger} /></label>

        {protocol && attestation && measurement ? (
          <button className={styles.primaryButton} onClick={buildLedger}>Construir Evidence Ledger</button>
        ) : null}
        {ledger ? (
          <button className={styles.ghostButton} onClick={() => downloadJson(`${ledger.experiment_id}.hnk-evidence-ledger.json`, serializeEvidenceLedger(ledger))}>Exportar ledger</button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!ledger ? (
          <section className={styles.stageCard}>
            <p className={styles.kicker}>01 · BIND SOURCES</p>
            <h2>Carregue as três fontes verificáveis</h2>
            <p>O ledger só nasce quando experimento, attestation e measurement contract pertencem à mesma preregistration e seus hashes conferem.</p>
          </section>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>EVIDENCE LEDGER V1</p>
                <code>{ledger.ledger_digest}</code>
                <h2>{ledger.experiment_id}</h2>
                <p>Preregistration, artifacts, medidas e relatório encadeados por referências e SHA-256.</p>
              </div>
              <div className={styles.badges}>
                <span>{verification?.ok ? "SOURCE BIND PASS" : "SOURCE CHECK"}</span>
                <span>NO AUTO TRUTH</span>
              </div>
            </section>

            {index ? (
              <section className={styles.auditPanel}>
                <div className={styles.auditHeader}>
                  <div><p className={styles.kicker}>EVIDENCE INDEX</p><h2>Registros disponíveis</h2></div>
                  <div className={styles.badges}><span>{ledger.evidence_entries.length} EVIDENCE</span><span>{ledger.claims.length} CLAIMS</span></div>
                </div>
                <div className={styles.metricGrid}>
                  <article><strong>{index.evidence.preregistration}</strong><span>preregistration</span></article>
                  <article><strong>{index.evidence.sessions}</strong><span>sessions</span></article>
                  <article><strong>{index.evidence.measurements}</strong><span>measurements</span></article>
                  <article><strong>{index.evidence.reports}</strong><span>reports</span></article>
                </div>
                <div className={styles.eventList}>
                  {ledger.evidence_entries.map((entry) => (
                    <article key={entry.evidence_id}>
                      <strong>{entry.kind} · {entry.evidence_id}</strong>
                      <code>{entry.digest}</code>
                      <p>{entry.role ?? "—"} · {entry.assignment_id ?? "—"} · {entry.metric_id ?? "—"}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <form className={styles.stageCard} onSubmit={addClaim}>
              <p className={styles.kicker}>02 · DECLARE CLAIM REQUIREMENTS</p>
              <h2>Registrar afirmação auditável</h2>
              <label>Afirmação<textarea value={claimStatement} onChange={(event) => setClaimStatement(event.target.value)} required /></label>
              <div className={styles.twoCols}>
                <label>Escopo<select value={claimScope} onChange={(event) => setClaimScope(event.target.value as HnkEvidenceClaimScope)}>{HNK_EVIDENCE_CLAIM_SCOPES.map((scope) => <option key={scope}>{scope}</option>)}</select></label>
                <label>Métrica<select value={metricId} onChange={(event) => setMetricId(event.target.value)}><option value="">Nenhuma</option>{measurement?.metrics.map((metric) => <option key={metric.metric_id} value={metric.metric_id}>{metric.metric_id} · {metric.type}</option>)}</select></label>
              </div>
              <div className={styles.twoCols}>
                <label>Papel<select value={role} onChange={(event) => setRole(event.target.value as "CONTROL" | "EXPERIMENT")}><option>CONTROL</option><option>EXPERIMENT</option></select></label>
                <label>Mínimo de registros<input type="number" min="1" value={minCount} onChange={(event) => setMinCount(event.target.value)} /></label>
              </div>
              <label><input type="checkbox" checked={requireAttestation} onChange={(event) => setRequireAttestation(event.target.checked)} /> Exigir integridade da attestation</label>
              <label><input type="checkbox" checked={requireReport} onChange={(event) => setRequireReport(event.target.checked)} /> Exigir relatório final</label>
              <button className={styles.primaryButton}>Adicionar claim</button>
            </form>

            {index?.claims.length ? (
              <section className={styles.resultCard}>
                <p className={styles.kicker}>CLAIM COVERAGE</p>
                <h2>Cobertura explícita de evidência</h2>
                {index.claims.map((claim) => (
                  <article key={claim.claim_id}>
                    <strong>{claim.coverage_status} · {claim.scope}</strong>
                    <p>{claim.statement}</p>
                    <code>{claim.satisfied_requirements}/{claim.total_requirements} requisitos satisfeitos · truth_assessed=false</code>
                    {claim.requirements.map((requirement) => (
                      <p key={requirement.requirement_id}>
                        {requirement.satisfied ? "✓" : "✕"} {requirement.kind}: {requirement.note}
                      </p>
                    ))}
                    {claim.missing_requirements.length ? <p>Insuficiente: {claim.missing_requirements.join(", ")}</p> : null}
                  </article>
                ))}
                <code>causal_claim_permitted=false · metaphysical_proof_permitted=false</code>
              </section>
            ) : null}
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
