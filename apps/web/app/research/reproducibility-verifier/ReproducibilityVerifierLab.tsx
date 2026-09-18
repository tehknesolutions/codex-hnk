"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  parseResearchReleaseManifest,
  serializeReproducibilityVerificationReport,
  verifyResearchReleaseManifest,
  type HnkResearchReleaseManifest,
  type HnkReproducibilityVerificationReport,
  type HnkVerificationFileObservation,
  type HnkVerificationValidatorExecutionObservation,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  boundary: string;
  summary: {
    statuses: string[];
    automatic_command_execution: false;
    automatic_filesystem_scan_in_contract: false;
    production_readiness_inferred: false;
  };
};

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

export default function ReproducibilityVerifierLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [manifest, setManifest] = useState<HnkResearchReleaseManifest | null>(null);
  const [files, setFiles] = useState<HnkVerificationFileObservation[]>([]);
  const [executions, setExecutions] = useState<HnkVerificationValidatorExecutionObservation[]>([]);
  const [report, setReport] = useState<HnkReproducibilityVerificationReport | null>(null);

  const [repository, setRepository] = useState("");
  const [commitSha, setCommitSha] = useState("");
  const [gitRef, setGitRef] = useState("");
  const [nodeEngine, setNodeEngine] = useState("");
  const [packageManager, setPackageManager] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const expectedSources = useMemo(() => {
    if (!manifest) return [];
    const entries = [
      ...manifest.contracts.map((entry) => ({
        id: `CONTRACT:${entry.contract_id}`,
        path: entry.source_path,
        digest: entry.content_digest,
      })),
      ...manifest.validators.map((entry) => ({
        id: `VALIDATOR:${entry.validator_id}`,
        path: entry.source_path,
        digest: entry.content_digest,
      })),
    ];
    return entries.filter(
      (entry, index) => entries.findIndex((candidate) => candidate.path === entry.path) === index,
    );
  }, [manifest]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/reproducibility-verifier", {
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

  async function importManifest(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseResearchReleaseManifest(await file.text());
      setManifest(parsed);
      setRepository(parsed.git.repository_full_name);
      setCommitSha("");
      setGitRef(parsed.git.ref);
      setNodeEngine(parsed.runtime.node_engine);
      setPackageManager(parsed.runtime.package_manager);
      setFiles([]);
      setExecutions([]);
      setReport(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "MANIFEST_IMPORT_FAILED");
    }
  }

  async function observeSource(sourcePath: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const sourceText = await file.text();
    setFiles((current) => [
      ...current.filter((entry) => entry.source_path !== sourcePath),
      { source_path: sourcePath, source_text: sourceText },
    ]);
    setReport(null);
  }

  function observeValidatorResult(validatorId: string, result: string) {
    setExecutions((current) => {
      const rest = current.filter((entry) => entry.validator_id !== validatorId);
      if (!result) return rest;
      return [
        ...rest,
        {
          validator_id: validatorId,
          result: result as HnkVerificationValidatorExecutionObservation["result"],
          executed_at: null,
          environment: "USER_OBSERVED",
        },
      ];
    });
    setReport(null);
  }

  function runVerification() {
    if (!manifest) return;
    try {
      setError("");
      setReport(verifyResearchReleaseManifest(manifest, {
        git: {
          repository_full_name: repository || null,
          commit_sha: commitSha || null,
          ref: gitRef || null,
        },
        runtime: {
          node_engine: nodeEngine || null,
          package_manager: packageManager || null,
        },
        files,
        validator_executions: executions,
      }));
    } catch (err) {
      setReport(null);
      setError(err instanceof Error ? err.message : "VERIFICATION_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Reproducibility Verifier</h2>
        <p>
          O verifier compara somente evidência observada. Campos não fornecidos permanecem UNVERIFIED;
          arquivos esperados ausentes ficam MISSING.
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
            <p>MATCH · DRIFT · MISSING · UNVERIFIED</p>
          </div>
        </article>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>
          Research Release Manifest
          <input type="file" accept="application/json,.json" onChange={importManifest} />
        </label>

        {report ? (
          <button
            className={styles.ghostButton}
            onClick={() => downloadJson(
              `${manifest?.release_key ?? "release"}.hnk-reproducibility-verification.json`,
              serializeReproducibilityVerificationReport(report),
            )}
          >
            Exportar verification report
          </button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!manifest ? (
          <section className={styles.stageCard}>
            <p className={styles.kicker}>01 · LOAD RELEASE</p>
            <h2>Importe um Reproducibility Pack válido</h2>
            <p>O manifest precisa passar sua própria validação antes da comparação com o projeto observado.</p>
          </section>
        ) : (
          <>
            <section className={styles.stageCard}>
              <p className={styles.kicker}>01 · OBSERVED PROJECT</p>
              <h2>Estado Git e runtime observado</h2>
              <div className={styles.twoCols}>
                <label>Repository<input value={repository} onChange={(event) => setRepository(event.target.value)} /></label>
                <label>Commit SHA<input value={commitSha} onChange={(event) => setCommitSha(event.target.value)} placeholder={manifest.git.commit_sha} /></label>
                <label>Git ref<input value={gitRef} onChange={(event) => setGitRef(event.target.value)} /></label>
                <label>Node engine<input value={nodeEngine} onChange={(event) => setNodeEngine(event.target.value)} /></label>
                <label>Package manager<input value={packageManager} onChange={(event) => setPackageManager(event.target.value)} /></label>
              </div>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>02 · SOURCE DIGESTS</p>
                  <h2>Arquivos esperados pelo manifest</h2>
                </div>
                <div className={styles.badges}>
                  <span>{files.length}/{expectedSources.length} OBSERVED</span>
                </div>
              </div>
              <div className={styles.eventList}>
                {expectedSources.map((entry) => {
                  const observed = files.some((file) => file.source_path === entry.path);
                  return (
                    <article key={entry.path}>
                      <strong>{entry.id} · {observed ? "OBSERVED" : "MISSING"}</strong>
                      <p>{entry.path}</p>
                      <code>{entry.digest}</code>
                      <input type="file" onChange={(event) => observeSource(entry.path, event)} />
                    </article>
                  );
                })}
              </div>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>03 · OPTIONAL VALIDATOR RE-OBSERVATION</p>
                  <h2>Resultado reproduzido agora</h2>
                </div>
                <div className={styles.badges}>
                  <span>NO AUTO EXECUTION</span>
                </div>
              </div>
              <div className={styles.eventList}>
                {manifest.validators.map((validator) => (
                  <article key={validator.validator_id}>
                    <strong>{validator.validator_id} · recorded={validator.result}</strong>
                    <p>{validator.source_path}</p>
                    <select
                      value={executions.find((entry) => entry.validator_id === validator.validator_id)?.result ?? ""}
                      onChange={(event) => observeValidatorResult(validator.validator_id, event.target.value)}
                    >
                      <option value="">UNVERIFIED</option>
                      <option>PASS</option>
                      <option>FAIL</option>
                      <option>NOT_EXECUTED</option>
                      <option>INFRASTRUCTURE_BLOCKED</option>
                    </select>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.stageCard}>
              <p className={styles.kicker}>04 · VERIFY</p>
              <h2>Comparar manifest ↔ projeto observado</h2>
              <button className={styles.primaryButton} onClick={runVerification}>
                Executar verificação
              </button>
            </section>

            {report ? (
              <section className={styles.auditPanel}>
                <div className={styles.auditHeader}>
                  <div>
                    <p className={styles.kicker}>VERIFICATION REPORT</p>
                    <h2>{report.overall_status}</h2>
                    <code>{report.report_digest}</code>
                  </div>
                  <div className={styles.badges}>
                    <span>MATCH {report.counts.MATCH}</span>
                    <span>DRIFT {report.counts.DRIFT}</span>
                    <span>MISSING {report.counts.MISSING}</span>
                    <span>UNVERIFIED {report.counts.UNVERIFIED}</span>
                  </div>
                </div>
                <div className={styles.eventList}>
                  {report.checks.map((check) => (
                    <article key={check.check_id}>
                      <strong>{check.status} · {check.check_id}</strong>
                      <p>{check.subject}</p>
                      <p>expected={check.expected ?? "—"}</p>
                      <p>observed={check.observed ?? "—"}</p>
                      <p>{check.note}</p>
                    </article>
                  ))}
                </div>
                <pre>{JSON.stringify({
                  commands_executed: report.commands_executed,
                  filesystem_scanned_by_contract: report.filesystem_scanned_by_contract,
                  authorship_proof: report.authorship_proof,
                  trusted_timestamp_proof: report.trusted_timestamp_proof,
                  truth_assessed: report.truth_assessed,
                  production_readiness_inferred: report.production_readiness_inferred,
                  canon_promotion_permitted: report.canon_promotion_permitted,
                }, null, 2)}</pre>
              </section>
            ) : null}
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
