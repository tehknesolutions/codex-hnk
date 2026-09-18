"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_RELEASE_VALIDATOR_RESULTS,
  createReleaseContractBinding,
  createReleaseValidatorBinding,
  createResearchReleaseManifest,
  parseResearchReleaseManifest,
  parseWorkspaceSnapshotRegistry,
  serializeResearchReleaseManifest,
  type HnkReleaseContractBinding,
  type HnkReleaseValidatorBinding,
  type HnkReleaseValidatorResult,
  type HnkResearchReleaseManifest,
  type HnkWorkspaceSnapshotRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "RELEASE_MANIFEST_BINDS_RESEARCH_STATE_CODE_CONTRACTS_AND_VALIDATION_EVIDENCE_NOT_TRUTH_AUTHORSHIP_TIME_OR_CANON";
  summary: {
    binds_workspace_registry_head: boolean;
    git_commit_binding: boolean;
    exact_contract_source_digests: boolean;
    exact_validator_source_digests: boolean;
    infrastructure_blocked_is_not_pass: boolean;
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

export default function ResearchReleaseManifestLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [registry, setRegistry] = useState<HnkWorkspaceSnapshotRegistry | null>(null);
  const [contracts, setContracts] = useState<HnkReleaseContractBinding[]>([]);
  const [validators, setValidators] = useState<HnkReleaseValidatorBinding[]>([]);
  const [manifest, setManifest] = useState<HnkResearchReleaseManifest | null>(null);

  const [releaseKey, setReleaseKey] = useState("");
  const [label, setLabel] = useState("");
  const [repo, setRepo] = useState("tehknesolutions/codex-hnk");
  const [commitSha, setCommitSha] = useState("");
  const [gitRef, setGitRef] = useState("main");
  const [nodeEngine, setNodeEngine] = useState("22.x");
  const [packageManager, setPackageManager] = useState("pnpm@12.1.0");
  const [installCommand, setInstallCommand] = useState("corepack pnpm install --frozen-lockfile");
  const [validationCommands, setValidationCommands] = useState(
    "node scripts/validate-hnk-research-workspace-snapshot.mjs\nnode scripts/validate-hnk-workspace-snapshot-registry.mjs",
  );
  const [buildCommand, setBuildCommand] = useState("node scripts/build-web-vercel.mjs");
  const [notes, setNotes] = useState("Use the exact Git commit and source digests bound by this manifest.");

  const [contractId, setContractId] = useState("");
  const [contractVersion, setContractVersion] = useState("1.0.0");
  const [contractPackage, setContractPackage] = useState("");
  const [contractPath, setContractPath] = useState("");

  const [validatorId, setValidatorId] = useState("");
  const [validatorPath, setValidatorPath] = useState("");
  const [validatorResult, setValidatorResult] = useState<HnkReleaseValidatorResult>("NOT_EXECUTED");
  const [validatorExecutedAt, setValidatorExecutedAt] = useState("");
  const [validatorEnvironment, setValidatorEnvironment] = useState("");
  const [validatorNote, setValidatorNote] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/releases", {
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
      setRegistry(parseWorkspaceSnapshotRegistry(await file.text()));
      setManifest(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SNAPSHOT_REGISTRY_IMPORT_FAILED");
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
      setRegistry(parsed.workspace_snapshot_registry);
      setContracts([...parsed.contracts]);
      setValidators([...parsed.validators]);
      setReleaseKey(parsed.release_key);
      setLabel(parsed.label);
      setRepo(parsed.git.repository_full_name);
      setCommitSha(parsed.git.commit_sha);
      setGitRef(parsed.git.ref);
      setNodeEngine(parsed.runtime.node_engine);
      setPackageManager(parsed.runtime.package_manager);
      setInstallCommand(parsed.reproduction.install_command);
      setValidationCommands(parsed.reproduction.validation_commands.join("\n"));
      setBuildCommand(parsed.reproduction.build_command);
      setNotes(parsed.reproduction.notes.join("\n"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "RELEASE_MANIFEST_IMPORT_FAILED");
    }
  }

  async function addContract(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const binding = createReleaseContractBinding({
        contract_id: contractId,
        contract_version: contractVersion,
        package_name: contractPackage,
        source_path: contractPath,
        source_text: await file.text(),
      });
      setContracts((current) => [...current.filter((item) => item.contract_id !== binding.contract_id), binding]);
      setContractId("");
      setContractPackage("");
      setContractPath("");
      setManifest(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "CONTRACT_BINDING_FAILED");
    }
  }

  async function addValidator(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const binding = createReleaseValidatorBinding({
        validator_id: validatorId,
        source_path: validatorPath,
        source_text: await file.text(),
        result: validatorResult,
        executed_at:
          validatorResult === "PASS" || validatorResult === "FAIL"
            ? validatorExecutedAt
            : null,
        environment: validatorEnvironment,
        evidence_note: validatorNote,
      });
      setValidators((current) => [...current.filter((item) => item.validator_id !== binding.validator_id), binding]);
      setValidatorId("");
      setValidatorPath("");
      setValidatorExecutedAt("");
      setValidatorEnvironment("");
      setValidatorNote("");
      setValidatorResult("NOT_EXECUTED");
      setManifest(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "VALIDATOR_BINDING_FAILED");
    }
  }

  function createManifest(event: FormEvent) {
    event.preventDefault();
    if (!registry) return;

    try {
      setError("");
      setManifest(createResearchReleaseManifest({
        release_key: releaseKey,
        label,
        created_at: now(),
        workspace_snapshot_registry: registry,
        git: {
          repository_full_name: repo,
          commit_sha: commitSha,
          ref: gitRef,
        },
        runtime: {
          node_engine: nodeEngine,
          package_manager: packageManager,
        },
        contracts,
        validators,
        reproduction: {
          install_command: installCommand,
          validation_commands: validationCommands
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          build_command: buildCommand,
          notes: notes.split("\n").map((item) => item.trim()).filter(Boolean),
        },
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "RELEASE_MANIFEST_CREATE_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Research Release Manifest</h2>
        <p>
          O pack registra integridade e evidência de execução. Um validator bloqueado continua bloqueado;
          o manifest não converte ausência de QA em PASS.
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
            <p>HEAD + Git + contract source + validator evidence</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{registry?.head_snapshot_digest ? "SET" : "—"}</strong><span>registry HEAD</span></article>
          <article><strong>{contracts.length}</strong><span>contracts</span></article>
          <article><strong>{validators.length}</strong><span>validators</span></article>
          <article><strong>{manifest ? manifest.validator_execution_status : "—"}</strong><span>validation</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>
          Importar Snapshot Registry
          <input type="file" accept="application/json,.json" onChange={importRegistry} />
        </label>
        <label>
          Importar Release Manifest existente
          <input type="file" accept="application/json,.json" onChange={importManifest} />
        </label>

        {manifest ? (
          <button
            className={styles.ghostButton}
            onClick={() => downloadJson(
              `${manifest.release_key}.hnk-research-release-manifest.json`,
              serializeResearchReleaseManifest(manifest),
            )}
          >
            Exportar Reproducibility Pack
          </button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        <section className={styles.stageCard}>
          <p className={styles.kicker}>01 · CONTRACT SOURCE BINDINGS</p>
          <h2>Vincular contratos por SHA-256 do texto-fonte exato</h2>
          <div className={styles.twoCols}>
            <label>Contract ID<input value={contractId} onChange={(event) => setContractId(event.target.value)} /></label>
            <label>Version<input value={contractVersion} onChange={(event) => setContractVersion(event.target.value)} /></label>
            <label>Package<input value={contractPackage} onChange={(event) => setContractPackage(event.target.value)} placeholder="@hnk/..." /></label>
            <label>Source path<input value={contractPath} onChange={(event) => setContractPath(event.target.value)} /></label>
          </div>
          <label>
            Arquivo-fonte exato do contrato
            <input type="file" onChange={addContract} disabled={!contractId || !contractPackage || !contractPath} />
          </label>
          <div className={styles.eventList}>
            {contracts.map((entry) => (
              <article key={entry.contract_id}>
                <strong>{entry.contract_id} · {entry.contract_version}</strong>
                <p>{entry.package_name} · {entry.source_path}</p>
                <code>{entry.content_digest}</code>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.stageCard}>
          <p className={styles.kicker}>02 · VALIDATOR EVIDENCE</p>
          <h2>Preservar fonte e estado real de execução</h2>
          <div className={styles.twoCols}>
            <label>Validator ID<input value={validatorId} onChange={(event) => setValidatorId(event.target.value)} /></label>
            <label>Source path<input value={validatorPath} onChange={(event) => setValidatorPath(event.target.value)} /></label>
            <label>
              Resultado
              <select value={validatorResult} onChange={(event) => setValidatorResult(event.target.value as HnkReleaseValidatorResult)}>
                {HNK_RELEASE_VALIDATOR_RESULTS.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Executed at
              <input
                value={validatorExecutedAt}
                onChange={(event) => setValidatorExecutedAt(event.target.value)}
                placeholder="ISO-8601; obrigatório para PASS/FAIL"
                disabled={validatorResult !== "PASS" && validatorResult !== "FAIL"}
              />
            </label>
            <label>Environment<input value={validatorEnvironment} onChange={(event) => setValidatorEnvironment(event.target.value)} /></label>
            <label>Evidence note<input value={validatorNote} onChange={(event) => setValidatorNote(event.target.value)} /></label>
          </div>
          <label>
            Arquivo-fonte exato do validator
            <input
              type="file"
              onChange={addValidator}
              disabled={!validatorId || !validatorPath || !validatorEnvironment || !validatorNote}
            />
          </label>
          <div className={styles.eventList}>
            {validators.map((entry) => (
              <article key={entry.validator_id}>
                <strong>{entry.validator_id} · {entry.result}</strong>
                <p>{entry.source_path} · {entry.environment} · executed={entry.executed_at ?? "NO"}</p>
                <p>{entry.evidence_note}</p>
                <code>{entry.content_digest}</code>
              </article>
            ))}
          </div>
        </section>

        <form className={styles.stageCard} onSubmit={createManifest}>
          <p className={styles.kicker}>03 · SEAL REPRODUCIBILITY PACK</p>
          <h2>Vincular estado científico e estado de código</h2>
          <div className={styles.twoCols}>
            <label>Release key<input value={releaseKey} onChange={(event) => setReleaseKey(event.target.value)} required /></label>
            <label>Label<input value={label} onChange={(event) => setLabel(event.target.value)} required /></label>
            <label>Repository<input value={repo} onChange={(event) => setRepo(event.target.value)} required /></label>
            <label>Git commit SHA<input value={commitSha} onChange={(event) => setCommitSha(event.target.value)} required /></label>
            <label>Git ref<input value={gitRef} onChange={(event) => setGitRef(event.target.value)} required /></label>
            <label>Node engine<input value={nodeEngine} onChange={(event) => setNodeEngine(event.target.value)} required /></label>
            <label>Package manager<input value={packageManager} onChange={(event) => setPackageManager(event.target.value)} required /></label>
            <label>Install command<input value={installCommand} onChange={(event) => setInstallCommand(event.target.value)} required /></label>
          </div>
          <label>
            Validation commands — um por linha
            <textarea value={validationCommands} onChange={(event) => setValidationCommands(event.target.value)} />
          </label>
          <label>
            Build command
            <input value={buildCommand} onChange={(event) => setBuildCommand(event.target.value)} required />
          </label>
          <label>
            Notes — uma por linha
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          <button
            className={styles.primaryButton}
            disabled={!registry?.head_snapshot_digest || contracts.length === 0 || validators.length === 0}
          >
            Selar Research Release Manifest
          </button>
        </form>

        {manifest ? (
          <section className={styles.auditPanel}>
            <div className={styles.auditHeader}>
              <div>
                <p className={styles.kicker}>SEALED REPRODUCIBILITY PACK</p>
                <h2>{manifest.label}</h2>
                <code>{manifest.manifest_digest}</code>
              </div>
              <div className={styles.badges}>
                <span>{manifest.validator_execution_status}</span>
                <span>READINESS_INFERRED=false</span>
                <span>NO AUTO CANON</span>
              </div>
            </div>
            <pre>{JSON.stringify({
              release_key: manifest.release_key,
              workspace_registry_digest: manifest.workspace_registry_digest,
              head_snapshot_digest: manifest.head_snapshot_digest,
              head_record_digest: manifest.head_record_digest,
              head_event_digest: manifest.head_event_digest,
              git: manifest.git,
              runtime: manifest.runtime,
              contracts: manifest.contracts,
              validators: manifest.validators,
              reproduction: manifest.reproduction,
              authorship_proof: manifest.authorship_proof,
              trusted_timestamp_proof: manifest.trusted_timestamp_proof,
              truth_assessed: manifest.truth_assessed,
              production_readiness_inferred: manifest.production_readiness_inferred,
              canon_promotion_permitted: manifest.canon_promotion_permitted,
            }, null, 2)}</pre>
          </section>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
