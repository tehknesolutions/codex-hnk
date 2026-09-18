"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_RELEASE_GATE_DECISIONS,
  createReleaseVerificationRegistry,
  decideHumanReleaseGate,
  parseReleaseVerificationRegistry,
  parseReproducibilityVerificationReport,
  registerReleaseVerificationReport,
  releaseVerificationRegistryIndex,
  serializeReleaseVerificationRegistry,
  type HnkReleaseGateDecision,
  type HnkReleaseVerificationRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  boundary: string;
  summary: {
    human_release_gate_required: true;
    match_auto_accepts_release: false;
    latest_report_reopens_gate: true;
    non_match_acceptance_requires_explicit_override: true;
    machine_can_accept_release: false;
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

export default function ReleaseVerificationRegistryLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [registry, setRegistry] = useState<HnkReleaseVerificationRegistry | null>(null);

  const [registryKey, setRegistryKey] = useState("");
  const [registryTitle, setRegistryTitle] = useState("");

  const [releaseKey, setReleaseKey] = useState("");
  const [reportDigest, setReportDigest] = useState("");
  const [decision, setDecision] = useState<HnkReleaseGateDecision>("RELEASE_HELD");
  const [reviewer, setReviewer] = useState("TW-DVF");
  const [signal, setSignal] = useState("");
  const [rationale, setRationale] = useState("");
  const [override, setOverride] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const index = useMemo(() => {
    if (!registry) return null;
    try {
      return releaseVerificationRegistryIndex(registry);
    } catch {
      return null;
    }
  }, [registry]);

  const selectedReport = useMemo(() => {
    if (!registry || !reportDigest) return null;
    return registry.reports.find((entry) => entry.report_digest === reportDigest) ?? null;
  }, [registry, reportDigest]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/release-verification-registry", {
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
      setRegistry(createReleaseVerificationRegistry({
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
      const parsed = parseReleaseVerificationRegistry(await file.text());
      setRegistry(parsed);
      setRegistryKey(parsed.registry_key);
      setRegistryTitle(parsed.title);
      setReleaseKey("");
      setReportDigest("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_IMPORT_FAILED");
    }
  }

  async function importVerificationReport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !registry) return;

    try {
      setError("");
      const report = parseReproducibilityVerificationReport(await file.text());
      const next = registerReleaseVerificationReport(registry, {
        report,
        registered_at: now(),
      });
      setRegistry(next);
      setReleaseKey(report.release_key);
      setReportDigest(report.report_digest);
      setDecision("RELEASE_HELD");
      setSignal("");
      setRationale("");
      setOverride(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "REPORT_REGISTRATION_FAILED");
    }
  }

  function chooseReport(release: string, digest: string) {
    setReleaseKey(release);
    setReportDigest(digest);
    setDecision("RELEASE_HELD");
    setSignal("");
    setRationale("");
    setOverride(false);
  }

  function submitDecision(event: FormEvent) {
    event.preventDefault();
    if (!registry) return;

    try {
      setError("");
      const next = decideHumanReleaseGate(registry, {
        release_key: releaseKey,
        report_digest: reportDigest,
        decision,
        reviewer,
        decided_at: now(),
        explicit_human_signal: signal,
        rationale,
        non_match_override_acknowledged: override,
      });
      setRegistry(next);
      setSignal("");
      setRationale("");
      setOverride(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "HUMAN_RELEASE_GATE_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Human Release Gate</h2>
        <p>
          MATCH é evidência de correspondência reprodutível, não aprovação automática.
          RELEASE_ACCEPTED exige uma decisão humana explícita sobre um report digest específico.
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
          <span className={handshake.summary.machine_can_accept_release === false ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>report history · explicit human release decision</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{index?.releases ?? 0}</strong><span>releases</span></article>
          <article><strong>{index?.reports ?? 0}</strong><span>reports</span></article>
          <article><strong>{index?.accepted_releases ?? 0}</strong><span>accepted</span></article>
          <article><strong>{index?.pending_human_gate ?? 0}</strong><span>pending gate</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>
          Importar Verification Registry
          <input type="file" accept="application/json,.json" onChange={importRegistry} />
        </label>

        {registry ? (
          <>
            <label>
              Registrar Verification Report
              <input type="file" accept="application/json,.json" onChange={importVerificationReport} />
            </label>
            <button
              className={styles.ghostButton}
              onClick={() => downloadJson(
                `${registry.registry_key}.hnk-release-verification-registry.json`,
                serializeReleaseVerificationRegistry(registry),
              )}
            >
              Exportar registry
            </button>
          </>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!registry ? (
          <form className={styles.stageCard} onSubmit={createRegistry}>
            <p className={styles.kicker}>01 · CREATE VERIFICATION REGISTRY</p>
            <h2>Abrir histórico de reports e decisões humanas</h2>
            <label>
              Registry key
              <input value={registryKey} onChange={(event) => setRegistryKey(event.target.value)} required />
            </label>
            <label>
              Título
              <input value={registryTitle} onChange={(event) => setRegistryTitle(event.target.value)} required />
            </label>
            <button className={styles.primaryButton}>Criar Verification Registry</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>RELEASE VERIFICATION REGISTRY V1</p>
                <code>{registry.registry_digest}</code>
                <h2>{registry.title}</h2>
                <p>{registry.registry_key}</p>
              </div>
              <div className={styles.badges}>
                <span>MATCH ≠ AUTO ACCEPT</span>
                <span>HUMAN GATE REQUIRED</span>
                <span>NO AUTO CANON</span>
              </div>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>REPORT HISTORY</p>
                  <h2>Releases verificadas</h2>
                </div>
                <div className={styles.badges}>
                  <span>{index?.match_reports_without_acceptance ?? 0} MATCH WITHOUT ACCEPT</span>
                  <span>{index?.pending_human_gate ?? 0} GATE PENDING</span>
                </div>
              </div>

              <div className={styles.eventList}>
                {index?.statuses.map((status) => (
                  <article key={status.release_key}>
                    <strong>
                      {status.release_key} · {status.latest_report_status}
                      {status.accepted ? " · RELEASE_ACCEPTED" : ""}
                    </strong>
                    <p>
                      reports={status.report_count} · decisions={status.decision_count} ·
                      latest_gate={status.human_gate_pending ? "PENDING" : "DECIDED"}
                    </p>
                    <p>
                      current_decision={status.current_decision ?? "NONE"} ·
                      on_latest={String(status.current_decision_is_on_latest_report)}
                    </p>
                    <code>{status.latest_report_digest}</code>
                    <button
                      className={styles.ghostButton}
                      onClick={() => chooseReport(status.release_key, status.latest_report_digest)}
                    >
                      Abrir Human Gate para latest report
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>ALL REGISTERED REPORTS</p>
                  <h2>Histórico append-only</h2>
                </div>
                <div className={styles.badges}>
                  <span>{registry.reports.length} REPORTS</span>
                </div>
              </div>
              <div className={styles.eventList}>
                {registry.reports.map((record) => (
                  <article key={record.report_digest}>
                    <strong>{record.release_key} · {record.overall_status}</strong>
                    <p>registered_at={record.registered_at}</p>
                    <code>{record.report_digest}</code>
                    <button
                      className={styles.ghostButton}
                      onClick={() => chooseReport(record.release_key, record.report_digest)}
                    >
                      Decidir sobre este report
                    </button>
                  </article>
                ))}
              </div>
            </section>

            {selectedReport ? (
              <form className={styles.stageCard} onSubmit={submitDecision}>
                <p className={styles.kicker}>02 · HUMAN RELEASE GATE</p>
                <h2>Decisão humana sobre report específico</h2>
                <p>
                  release={selectedReport.release_key} · report_status={selectedReport.overall_status}
                </p>
                <code>{selectedReport.report_digest}</code>

                <label>
                  Decision
                  <select
                    value={decision}
                    onChange={(event) => {
                      setDecision(event.target.value as HnkReleaseGateDecision);
                      setOverride(false);
                    }}
                  >
                    {HNK_RELEASE_GATE_DECISIONS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>

                <label>
                  Reviewer
                  <input value={reviewer} onChange={(event) => setReviewer(event.target.value)} required />
                </label>

                <label>
                  Sinal humano explícito
                  <input value={signal} onChange={(event) => setSignal(event.target.value)} placeholder="ACCEPT RELEASE / HOLD RELEASE / REJECT RELEASE" required />
                </label>

                <label>
                  Rationale
                  <textarea value={rationale} onChange={(event) => setRationale(event.target.value)} required />
                </label>

                {decision === "RELEASE_ACCEPTED" && selectedReport.overall_status !== "MATCH" ? (
                  <label>
                    <input
                      type="checkbox"
                      checked={override}
                      onChange={(event) => setOverride(event.target.checked)}
                    />
                    Eu reconheço explicitamente que este report NÃO é MATCH e ainda assim aceito esta release.
                  </label>
                ) : null}

                <button className={styles.primaryButton}>
                  Registrar decisão humana
                </button>
              </form>
            ) : null}

            {registry.decisions.length ? (
              <section className={styles.auditPanel}>
                <div className={styles.auditHeader}>
                  <div>
                    <p className={styles.kicker}>HUMAN DECISION HISTORY</p>
                    <h2>Decisões não destrutivas</h2>
                  </div>
                  <div className={styles.badges}>
                    <span>{registry.decisions.length} EVENTS</span>
                    <span>MACHINE_CAN_DECIDE=false</span>
                  </div>
                </div>
                <div className={styles.eventList}>
                  {registry.decisions.map((event) => (
                    <article key={event.decision_id}>
                      <strong>{event.release_key} · {event.decision}</strong>
                      <p>report={event.report_overall_status} · reviewer={event.reviewer}</p>
                      <p>signal={event.explicit_human_signal}</p>
                      <p>{event.rationale}</p>
                      <p>
                        override_non_match={String(event.non_match_override_acknowledged)} ·
                        supersedes={event.supersedes_decision_id ?? "—"}
                      </p>
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
