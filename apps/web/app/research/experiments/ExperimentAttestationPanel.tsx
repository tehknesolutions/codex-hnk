"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  compareExperimentAttestations,
  createExperimentAttestation,
  parseExperimentAttestation,
  serializeExperimentAttestation,
  verifyExperimentAttestation,
  type HnkExperimentAttestation,
  type HnkExperimentProtocol,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Props = {
  protocol: HnkExperimentProtocol;
  baselineAttestation: HnkExperimentAttestation | null;
};

function downloadAttestation(attestation: HnkExperimentAttestation, suffix: string) {
  const blob = new Blob([serializeExperimentAttestation(attestation)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${attestation.experiment_id}.${suffix}.hnk-attestation.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function short(hash: string) {
  return `${hash.slice(0, 12)}…${hash.slice(-12)}`;
}

export default function ExperimentAttestationPanel({ protocol, baselineAttestation }: Props) {
  const [reference, setReference] = useState<HnkExperimentAttestation | null>(null);
  const [error, setError] = useState("");

  const current = useMemo(() => createExperimentAttestation(protocol, {
    generated_at: new Date().toISOString(),
  }), [protocol]);

  const comparisonSource = reference ?? baselineAttestation;
  const comparison = useMemo(() => {
    if (!comparisonSource) return null;
    try {
      return compareExperimentAttestations(comparisonSource, current);
    } catch {
      return null;
    }
  }, [comparisonSource, current]);

  const verification = useMemo(() => {
    try {
      return verifyExperimentAttestation(current, protocol);
    } catch (err) {
      return { ok: false, issues: [err instanceof Error ? err.message : "ATTESTATION_VERIFY_FAILED"] };
    }
  }, [current, protocol]);

  async function importReference(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setReference(parseExperimentAttestation(await file.text()));
    } catch (err) {
      setReference(null);
      setError(err instanceof Error ? err.message : "ATTESTATION_IMPORT_FAILED");
    }
  }

  return (
    <section className={styles.auditPanel}>
      <div className={styles.auditHeader}>
        <div>
          <p className={styles.kicker}>EXPERIMENT ATTESTATION V1</p>
          <h2>SHA-256 · preregistration · artifacts · report</h2>
        </div>
        <div className={styles.badges}>
          <span>CONTENT INTEGRITY ONLY</span>
          <span>NO IDENTITY SIGNATURE</span>
          <span>NO TRUSTED TIMESTAMP</span>
        </div>
      </div>

      <p className={styles.boundary}>
        A cadeia detecta mudança de conteúdo contra um seal preservado. Ela não prova autoria, tempo externo,
        causalidade ou eficácia metafísica.
      </p>

      <div className={styles.stageGrid}>
        <article className={styles.stageCard}>
          <p className={styles.kicker}>LOCKED PREREGISTRATION</p>
          <h3>Fingerprint estável</h3>
          <code title={current.preregistration_digest}>{short(current.preregistration_digest)}</code>
          <p>{comparison?.same_preregistration === false ? "MISMATCH com o seal de referência" : "Preregistration preservada"}</p>
          {baselineAttestation ? (
            <button className={styles.ghostButton} onClick={() => downloadAttestation(baselineAttestation, "preregistration")}>Baixar seal original</button>
          ) : (
            <p>Seal original não está na sessão atual. Importe o arquivo preservado para comparar.</p>
          )}
        </article>

        <article className={styles.stageCard}>
          <p className={styles.kicker}>CURRENT SNAPSHOT</p>
          <h3>Chain head</h3>
          <code title={current.chain_head}>{short(current.chain_head)}</code>
          <p>{current.sessions.length} artifact(s) · report {current.report ? "SIM" : "NÃO"}</p>
          <button className={styles.primaryButton} onClick={() => downloadAttestation(current, "current")}>Exportar attestation atual</button>
        </article>

        <article className={styles.stageCard}>
          <p className={styles.kicker}>VERIFY CURRENT</p>
          <h3>{verification.ok ? "PASS" : "FAIL"}</h3>
          <p>Snapshot: {"snapshot_matches" in verification && verification.snapshot_matches ? "MATCH" : verification.ok ? "MATCH" : "MISMATCH"}</p>
          <p>Chain: {"chain_matches" in verification && verification.chain_matches ? "MATCH" : verification.ok ? "MATCH" : "MISMATCH"}</p>
          {!verification.ok ? <code>{verification.issues.join(" · ")}</code> : null}
        </article>

        <article className={styles.stageCard}>
          <p className={styles.kicker}>REFERENCE SEAL</p>
          <h3>Comparar arquivo preservado</h3>
          <input type="file" accept="application/json,.json" onChange={importReference} />
          <p>Fonte: {reference ? "arquivo importado" : baselineAttestation ? "seal criado nesta preregistration" : "—"}</p>
          {comparison ? (
            <>
              <p>Mesmo experimento: {comparison.same_experiment ? "SIM" : "NÃO"}</p>
              <p>Mesma preregistration: {comparison.same_preregistration ? "SIM" : "NÃO"}</p>
              <p>Mesmo snapshot completo: {comparison.same_snapshot ? "SIM" : "NÃO"}</p>
            </>
          ) : null}
        </article>
      </div>

      <div className={styles.eventList}>
        {current.sessions.map((entry) => (
          <article key={entry.assignment_id}>
            <strong>#{entry.ordinal} · {entry.role} · {entry.session_id}</strong>
            <code>artifact {short(entry.artifact_digest)}</code>
            <code>chain {short(entry.chain_digest)}</code>
          </article>
        ))}
        {current.report ? (
          <article>
            <strong>FINAL REPORT</strong>
            <code>report {short(current.report.report_digest)}</code>
            <code>chain {short(current.report.chain_digest)}</code>
          </article>
        ) : null}
      </div>

      <p className={styles.boundary}><code>{current.claim_boundary}</code></p>
      {error ? <p className={styles.error}>{error}</p> : null}
    </section>
  );
}
