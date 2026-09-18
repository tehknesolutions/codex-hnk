"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_POST_DEPLOYMENT_CHECK_RESULTS,
  HNK_PRODUCTION_GATE_DECISIONS,
  createPostDeploymentVerification,
  createProductionVerificationRegistry,
  decideHumanProductionGate,
  parseDeploymentExecutionReceipt,
  parseProductionVerificationRegistry,
  productionVerificationRegistryIndex,
  registerDeploymentExecutionReceipt,
  serializeProductionVerificationRegistry,
  type HnkPostDeploymentCheckResult,
  type HnkProductionGateDecision,
  type HnkProductionVerificationRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  boundary: string;
  summary: {
    deployment_succeeded_auto_accepts_production: false;
    post_deployment_pass_auto_accepts_production: false;
    latest_receipt_and_verification_required: true;
    production_accept_requires_succeeded_receipt_and_pass_verification: true;
    machine_can_accept_production: false;
    network_checks_executed_by_registry: false;
  };
};

type DraftCheck = {
  check_id: string;
  kind: "URL" | "HEALTH" | "SMOKE" | "CUSTOM";
  expected: string;
  observed: string;
  result: HnkPostDeploymentCheckResult;
  evidence_note: string;
  evidence_text: string;
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

export default function ProductionVerificationLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [registry, setRegistry] =
    useState<HnkProductionVerificationRegistry | null>(null);

  const [registryKey, setRegistryKey] = useState("");
  const [registryTitle, setRegistryTitle] = useState("");

  const [selectedReceiptDigest, setSelectedReceiptDigest] = useState("");
  const [observedCommit, setObservedCommit] = useState("");
  const [observedUrl, setObservedUrl] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("TW-DVF");
  const [draftChecks, setDraftChecks] = useState<DraftCheck[]>([]);

  const [checkId, setCheckId] = useState("");
  const [checkKind, setCheckKind] = useState<DraftCheck["kind"]>("HEALTH");
  const [checkExpected, setCheckExpected] = useState("");
  const [checkObserved, setCheckObserved] = useState("");
  const [checkResult, setCheckResult] =
    useState<HnkPostDeploymentCheckResult>("UNVERIFIED");
  const [checkEvidenceNote, setCheckEvidenceNote] = useState("");
  const [checkEvidenceText, setCheckEvidenceText] = useState("");

  const [gateReleaseKey, setGateReleaseKey] = useState("");
  const [gateEnvironment, setGateEnvironment] = useState("");
  const [gateVerificationDigest, setGateVerificationDigest] = useState("");
  const [gateDecision, setGateDecision] =
    useState<HnkProductionGateDecision>("PRODUCTION_HELD");
  const [reviewer, setReviewer] = useState("TW-DVF");
  const [gateSignal, setGateSignal] = useState("");
  const [gateRationale, setGateRationale] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const index = useMemo(() => {
    if (!registry) return null;
    try {
      return productionVerificationRegistryIndex(registry);
    } catch {
      return null;
    }
  }, [registry]);

  const selectedReceipt = useMemo(() => {
    if (!registry || !selectedReceiptDigest) return null;
    return registry.receipts.find(
      (record) => record.receipt_digest === selectedReceiptDigest,
    ) ?? null;
  }, [registry, selectedReceiptDigest]);

  const selectedGateVerification = useMemo(() => {
    if (!registry || !gateVerificationDigest) return null;
    return registry.verifications.find(
      (entry) => entry.verification_digest === gateVerificationDigest,
    ) ?? null;
  }, [registry, gateVerificationDigest]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/production-verification", {
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
      setRegistry(createProductionVerificationRegistry({
        registry_key: registryKey,
        title: registryTitle,
        created_at: now(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_CREATE_FAILED");
    }
  }

  async function importRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseProductionVerificationRegistry(await file.text());
      setRegistry(parsed);
      setRegistryKey(parsed.registry_key);
      setRegistryTitle(parsed.title);
      setSelectedReceiptDigest(parsed.receipts.at(-1)?.receipt_digest ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_IMPORT_FAILED");
    }
  }

  async function importReceipt(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !registry) return;
    try {
      setError("");
      const receipt = parseDeploymentExecutionReceipt(await file.text());
      const next = registerDeploymentExecutionReceipt(registry, {
        receipt,
        registered_at: now(),
      });
      setRegistry(next);
      setSelectedReceiptDigest(receipt.receipt_digest);
      setObservedCommit(receipt.expected_git_commit_sha);
      setObservedUrl(receipt.provider.deployment_url ?? "");
      setDraftChecks([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "RECEIPT_REGISTRATION_FAILED");
    }
  }

  function chooseReceipt(digest: string) {
    if (!registry) return;
    const record = registry.receipts.find(
      (entry) => entry.receipt_digest === digest,
    );
    if (!record) return;
    setSelectedReceiptDigest(digest);
    setObservedCommit(record.receipt.expected_git_commit_sha);
    setObservedUrl(record.receipt.provider.deployment_url ?? "");
    setDraftChecks([]);
  }

  function addCheck(event: FormEvent) {
    event.preventDefault();
    try {
      if (!checkId.trim()) throw new Error("CHECK_ID_REQUIRED");
      if (draftChecks.some((check) => check.check_id === checkId.trim())) {
        throw new Error("DUPLICATE_CHECK_ID");
      }
      const check: DraftCheck = {
        check_id: checkId.trim(),
        kind: checkKind,
        expected: checkExpected,
        observed: checkObserved,
        result: checkResult,
        evidence_note: checkEvidenceNote,
        evidence_text: checkEvidenceText,
      };
      setDraftChecks((current) => [...current, check]);
      setCheckId("");
      setCheckExpected("");
      setCheckObserved("");
      setCheckResult("UNVERIFIED");
      setCheckEvidenceNote("");
      setCheckEvidenceText("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "CHECK_ADD_FAILED");
    }
  }

  function createVerification(event: FormEvent) {
    event.preventDefault();
    if (!registry || !selectedReceiptDigest) return;
    try {
      setError("");
      const next = createPostDeploymentVerification(registry, {
        receipt_digest: selectedReceiptDigest,
        observed_git_commit_sha: observedCommit,
        observed_url: observedUrl,
        verified_by: verifiedBy,
        verified_at: now(),
        checks: draftChecks,
      });
      setRegistry(next);
      const verification = next.verifications.at(-1);
      if (verification) {
        setGateReleaseKey(verification.release_key);
        setGateEnvironment(verification.target_environment);
        setGateVerificationDigest(verification.verification_digest);
      }
      setDraftChecks([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "POST_DEPLOY_VERIFY_FAILED");
    }
  }

  function openGate(
    releaseKey: string,
    targetEnvironment: string,
    verificationDigest: string,
  ) {
    setGateReleaseKey(releaseKey);
    setGateEnvironment(targetEnvironment);
    setGateVerificationDigest(verificationDigest);
    setGateDecision("PRODUCTION_HELD");
    setGateSignal("");
    setGateRationale("");
  }

  function submitGate(event: FormEvent) {
    event.preventDefault();
    if (!registry || !gateVerificationDigest) return;
    try {
      setError("");
      const next = decideHumanProductionGate(registry, {
        release_key: gateReleaseKey,
        target_environment: gateEnvironment,
        verification_digest: gateVerificationDigest,
        decision: gateDecision,
        reviewer,
        decided_at: now(),
        explicit_human_signal: gateSignal,
        rationale: gateRationale,
      });
      setRegistry(next);
      setGateSignal("");
      setGateRationale("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "HUMAN_PRODUCTION_GATE_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Production Verification</h2>
        <p>
          SUCCEEDED e PASS continuam sendo evidência, não aprovação. PRODUCTION_ACCEPTED exige decisão
          humana explícita sobre a verificação mais recente do receipt mais recente.
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
          <span className={handshake.summary.machine_can_accept_production === false ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>receipt → post-deploy checks → human production decision</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{index?.receipts ?? 0}</strong><span>receipts</span></article>
          <article><strong>{index?.verifications ?? 0}</strong><span>verifications</span></article>
          <article><strong>{index?.production_accepted ?? 0}</strong><span>accepted</span></article>
          <article><strong>{index?.awaiting_verification ?? 0}</strong><span>awaiting verify</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>
          Importar Production Registry
          <input type="file" accept="application/json,.json" onChange={importRegistry} />
        </label>

        {registry ? (
          <>
            <label>
              Registrar Deployment Execution Receipt
              <input type="file" accept="application/json,.json" onChange={importReceipt} />
            </label>
            <button
              className={styles.ghostButton}
              onClick={() => downloadJson(
                `${registry.registry_key}.hnk-production-verification-registry.json`,
                serializeProductionVerificationRegistry(registry),
              )}
            >
              Exportar Production Registry
            </button>
          </>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!registry ? (
          <form className={styles.stageCard} onSubmit={createRegistry}>
            <p className={styles.kicker}>01 · CREATE PRODUCTION REGISTRY</p>
            <h2>Abrir histórico pós-deployment</h2>
            <label>
              Registry key
              <input value={registryKey} onChange={(event) => setRegistryKey(event.target.value)} required />
            </label>
            <label>
              Título
              <input value={registryTitle} onChange={(event) => setRegistryTitle(event.target.value)} required />
            </label>
            <button className={styles.primaryButton}>Criar Production Registry</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>PRODUCTION VERIFICATION REGISTRY V1</p>
                <code>{registry.registry_digest}</code>
                <h2>{registry.title}</h2>
              </div>
              <div className={styles.badges}>
                <span>SUCCEEDED ≠ AUTO ACCEPT</span>
                <span>PASS ≠ AUTO ACCEPT</span>
                <span>NO AUTO CANON</span>
              </div>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>02 · DEPLOYMENT RECEIPTS</p>
                  <h2>Histórico append-only de execuções</h2>
                </div>
                <div className={styles.badges}>
                  <span>{registry.receipts.length} RECEIPTS</span>
                </div>
              </div>
              <div className={styles.eventList}>
                {registry.receipts.map((record) => (
                  <article key={record.receipt_digest}>
                    <strong>
                      {record.release_key} · {record.target_environment} · {record.provider_result}
                    </strong>
                    <p>{record.receipt.provider.name} · {record.receipt.provider.deployment_id}</p>
                    <code>{record.receipt_digest}</code>
                    <button className={styles.ghostButton} onClick={() => chooseReceipt(record.receipt_digest)}>
                      Criar post-deployment verification
                    </button>
                  </article>
                ))}
              </div>
            </section>

            {selectedReceipt ? (
              <>
                <section className={styles.stageCard}>
                  <p className={styles.kicker}>03 · POST-DEPLOYMENT CHECK SET</p>
                  <h2>{selectedReceipt.release_key} → {selectedReceipt.target_environment}</h2>
                  <div className={styles.twoCols}>
                    <label>
                      Observed Git commit
                      <input value={observedCommit} onChange={(event) => setObservedCommit(event.target.value)} required />
                    </label>
                    <label>
                      Observed URL
                      <input value={observedUrl} onChange={(event) => setObservedUrl(event.target.value)} required />
                    </label>
                    <label>
                      Verified by
                      <input value={verifiedBy} onChange={(event) => setVerifiedBy(event.target.value)} required />
                    </label>
                  </div>

                  <form onSubmit={addCheck}>
                    <div className={styles.twoCols}>
                      <label>
                        Check ID
                        <input value={checkId} onChange={(event) => setCheckId(event.target.value)} required />
                      </label>
                      <label>
                        Kind
                        <select value={checkKind} onChange={(event) => setCheckKind(event.target.value as DraftCheck["kind"])}>
                          <option>URL</option>
                          <option>HEALTH</option>
                          <option>SMOKE</option>
                          <option>CUSTOM</option>
                        </select>
                      </label>
                      <label>
                        Expected
                        <input value={checkExpected} onChange={(event) => setCheckExpected(event.target.value)} required />
                      </label>
                      <label>
                        Observed
                        <input value={checkObserved} onChange={(event) => setCheckObserved(event.target.value)} required />
                      </label>
                      <label>
                        Result
                        <select value={checkResult} onChange={(event) => setCheckResult(event.target.value as HnkPostDeploymentCheckResult)}>
                          {HNK_POST_DEPLOYMENT_CHECK_RESULTS.map((item) => <option key={item}>{item}</option>)}
                        </select>
                      </label>
                      <label>
                        Evidence note
                        <input value={checkEvidenceNote} onChange={(event) => setCheckEvidenceNote(event.target.value)} required />
                      </label>
                    </div>
                    <label>
                      Evidence text exato
                      <textarea value={checkEvidenceText} onChange={(event) => setCheckEvidenceText(event.target.value)} required />
                    </label>
                    <button className={styles.ghostButton}>Adicionar check</button>
                  </form>

                  <div className={styles.eventList}>
                    {draftChecks.map((check) => (
                      <article key={check.check_id}>
                        <strong>{check.check_id} · {check.kind} · {check.result}</strong>
                        <p>expected={check.expected}</p>
                        <p>observed={check.observed}</p>
                      </article>
                    ))}
                  </div>

                  <form onSubmit={createVerification}>
                    <button className={styles.primaryButton} disabled={draftChecks.length === 0}>
                      Selar Post-Deployment Verification
                    </button>
                  </form>
                </section>
              </>
            ) : null}

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>04 · CURRENT PRODUCTION STATE</p>
                  <h2>Latest receipt + latest verification + human gate</h2>
                </div>
                <div className={styles.badges}>
                  <span>{index?.pass_without_acceptance ?? 0} PASS WITHOUT ACCEPT</span>
                  <span>{index?.pending_human_gate ?? 0} GATE PENDING</span>
                </div>
              </div>
              <div className={styles.eventList}>
                {index?.states.map((state) => (
                  <article key={`${state.release_key}:${state.target_environment}`}>
                    <strong>
                      {state.release_key} · {state.target_environment}
                      {state.production_accepted ? " · PRODUCTION_ACCEPTED" : ""}
                    </strong>
                    <p>
                      receipt={state.latest_provider_result} · verification={state.latest_verification_status ?? "REQUIRED"}
                    </p>
                    <p>
                      current_decision={state.current_decision ?? "NONE"} ·
                      on_latest={String(state.current_decision_is_on_latest_verification)}
                    </p>
                    {state.latest_verification_digest ? (
                      <button
                        className={styles.ghostButton}
                        onClick={() => openGate(
                          state.release_key,
                          state.target_environment,
                          state.latest_verification_digest!,
                        )}
                      >
                        Abrir Human Production Gate
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            {selectedGateVerification ? (
              <form className={styles.stageCard} onSubmit={submitGate}>
                <p className={styles.kicker}>05 · HUMAN PRODUCTION GATE</p>
                <h2>Decisão humana sobre a verificação mais recente</h2>
                <p>
                  {gateReleaseKey} → {gateEnvironment} · verification={selectedGateVerification.overall_status}
                </p>
                <code>{selectedGateVerification.verification_digest}</code>

                <label>
                  Decision
                  <select value={gateDecision} onChange={(event) => setGateDecision(event.target.value as HnkProductionGateDecision)}>
                    {HNK_PRODUCTION_GATE_DECISIONS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  Reviewer
                  <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} required />
                </label>
                <label>
                  Sinal humano explícito
                  <input value={gateSignal} onChange={(event) => setGateSignal(event.target.value)} placeholder="ACCEPT PRODUCTION / HOLD PRODUCTION / REJECT PRODUCTION" required />
                </label>
                <label>
                  Rationale
                  <textarea value={gateRationale} onChange={(event) => setGateRationale(event.target.value)} required />
                </label>

                {gateDecision === "PRODUCTION_ACCEPTED" &&
                selectedGateVerification.overall_status !== "PASS" ? (
                  <p>
                    PRODUCTION_ACCEPTED está bloqueado: V1 exige receipt SUCCEEDED e latest verification PASS.
                  </p>
                ) : null}

                <button
                  className={styles.primaryButton}
                  disabled={
                    gateDecision === "PRODUCTION_ACCEPTED" &&
                    selectedGateVerification.overall_status !== "PASS"
                  }
                >
                  Registrar Human Production Decision
                </button>
              </form>
            ) : null}

            {registry.decisions.length ? (
              <section className={styles.auditPanel}>
                <div className={styles.auditHeader}>
                  <div>
                    <p className={styles.kicker}>PRODUCTION DECISION HISTORY</p>
                    <h2>Histórico humano não destrutivo</h2>
                  </div>
                  <div className={styles.badges}>
                    <span>{registry.decisions.length} EVENTS</span>
                    <span>MACHINE_CAN_DECIDE=false</span>
                  </div>
                </div>
                <div className={styles.eventList}>
                  {registry.decisions.map((event) => (
                    <article key={event.decision_id}>
                      <strong>
                        {event.release_key} · {event.target_environment} · {event.decision}
                      </strong>
                      <p>verification={event.verification_status} · reviewer={event.reviewer}</p>
                      <p>signal={event.explicit_human_signal}</p>
                      <p>{event.rationale}</p>
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
