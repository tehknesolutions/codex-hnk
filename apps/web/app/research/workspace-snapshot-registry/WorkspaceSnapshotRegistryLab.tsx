"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  compareRegisteredWorkspaceSnapshots,
  createWorkspaceSnapshotRegistry,
  moveWorkspaceSnapshotHead,
  parseResearchWorkspaceSnapshot,
  parseWorkspaceSnapshotRegistry,
  registerWorkspaceSnapshot,
  serializeWorkspaceSnapshotRegistry,
  workspaceSnapshotAncestry,
  workspaceSnapshotRegistryIndex,
  type HnkResearchWorkspaceSnapshotComparison,
  type HnkWorkspaceSnapshotAncestry,
  type HnkWorkspaceSnapshotRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "SNAPSHOT_REGISTRY_CATALOGS_CHECKPOINT_LINEAGE_AND_HEAD_POINTER_NOT_TRUTH_REVIEW_DECISION_OR_CANON";
  summary: {
    identity: "SNAPSHOT_DIGEST";
    parent_must_be_registered_first: true;
    orphan_snapshots_permitted: false;
    forks_permitted_and_detected: true;
    compare_any_registered_pair: true;
    explicit_head_move_required: true;
    head_event_history: true;
    machine_can_choose_head: false;
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

export default function WorkspaceSnapshotRegistryLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [registry, setRegistry] = useState<HnkWorkspaceSnapshotRegistry | null>(null);

  const [registryKey, setRegistryKey] = useState("");
  const [registryTitle, setRegistryTitle] = useState("");
  const [headTarget, setHeadTarget] = useState("");
  const [headReason, setHeadReason] = useState("");
  const [headSignal, setHeadSignal] = useState("");
  const [leftDigest, setLeftDigest] = useState("");
  const [rightDigest, setRightDigest] = useState("");
  const [ancestryDigest, setAncestryDigest] = useState("");

  const [comparison, setComparison] =
    useState<HnkResearchWorkspaceSnapshotComparison | null>(null);
  const [ancestry, setAncestry] = useState<HnkWorkspaceSnapshotAncestry | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const index = useMemo(() => {
    if (!registry) return null;
    try {
      return workspaceSnapshotRegistryIndex(registry);
    } catch {
      return null;
    }
  }, [registry]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/workspace-snapshot-registry", {
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
      setRegistry(createWorkspaceSnapshotRegistry({
        registry_key: registryKey,
        title: registryTitle,
        created_at: now(),
      }));
      setComparison(null);
      setAncestry(null);
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
      const parsed = parseWorkspaceSnapshotRegistry(await file.text());
      setRegistry(parsed);
      setRegistryKey(parsed.registry_key);
      setRegistryTitle(parsed.title);
      setHeadTarget(parsed.head_snapshot_digest ?? "");
      setComparison(null);
      setAncestry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_IMPORT_FAILED");
    }
  }

  async function importSnapshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !registry) return;

    try {
      setError("");
      const snapshot = parseResearchWorkspaceSnapshot(await file.text());
      const next = registerWorkspaceSnapshot(registry, {
        snapshot,
        registered_at: now(),
      });
      setRegistry(next);
      if (!leftDigest) setLeftDigest(snapshot.snapshot_digest);
      if (!ancestryDigest) setAncestryDigest(snapshot.snapshot_digest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SNAPSHOT_REGISTRATION_FAILED");
    }
  }

  function moveHead(event: FormEvent) {
    event.preventDefault();
    if (!registry) return;

    try {
      setError("");
      setRegistry(moveWorkspaceSnapshotHead(registry, {
        to_snapshot_digest: headTarget,
        moved_at: now(),
        reason: headReason,
        explicit_human_signal: headSignal,
      }));
      setHeadReason("");
      setHeadSignal("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "HEAD_MOVE_FAILED");
    }
  }

  function compareSnapshots() {
    if (!registry) return;
    try {
      setError("");
      setComparison(compareRegisteredWorkspaceSnapshots(
        registry,
        leftDigest,
        rightDigest,
      ));
    } catch (err) {
      setComparison(null);
      setError(err instanceof Error ? err.message : "SNAPSHOT_COMPARE_FAILED");
    }
  }

  function traceAncestry() {
    if (!registry) return;
    try {
      setError("");
      setAncestry(workspaceSnapshotAncestry(registry, ancestryDigest));
    } catch (err) {
      setAncestry(null);
      setError(err instanceof Error ? err.message : "ANCESTRY_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Workspace Snapshot Registry</h2>
        <p>
          O registry organiza checkpoints e HEAD. A máquina não escolhe HEAD e nenhum movimento ocorre
          sem um sinal humano explícito.
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
          <span className={handshake.summary.machine_can_choose_head === false ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>timeline · forks · explicit HEAD</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{index?.snapshot_count ?? 0}</strong><span>snapshots</span></article>
          <article><strong>{index?.fork_count ?? 0}</strong><span>forks</span></article>
          <article><strong>{index?.tip_count ?? 0}</strong><span>tips</span></article>
          <article><strong>{index?.head_snapshot_digest ? "SET" : "UNSET"}</strong><span>HEAD</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>
          Importar Snapshot Registry
          <input type="file" accept="application/json,.json" onChange={importRegistry} />
        </label>

        {registry ? (
          <>
            <label>
              Registrar Workspace Snapshot
              <input type="file" accept="application/json,.json" onChange={importSnapshot} />
            </label>
            <button
              className={styles.ghostButton}
              onClick={() => downloadJson(
                `${registry.registry_key}.hnk-workspace-snapshot-registry.json`,
                serializeWorkspaceSnapshotRegistry(registry),
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
            <p className={styles.kicker}>01 · CREATE TIMELINE</p>
            <h2>Abrir Workspace Snapshot Registry</h2>
            <label>
              Registry key
              <input value={registryKey} onChange={(event) => setRegistryKey(event.target.value)} required />
            </label>
            <label>
              Título
              <input value={registryTitle} onChange={(event) => setRegistryTitle(event.target.value)} required />
            </label>
            <button className={styles.primaryButton}>Criar Snapshot Registry</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>WORKSPACE SNAPSHOT REGISTRY V1</p>
                <code>{registry.registry_digest}</code>
                <h2>{registry.title}</h2>
                <p>{registry.registry_key}</p>
              </div>
              <div className={styles.badges}>
                <span>NO ORPHANS</span>
                <span>FORKS DETECTED</span>
                <span>HUMAN HEAD</span>
              </div>
            </section>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div>
                  <p className={styles.kicker}>TIMELINE</p>
                  <h2>Checkpoints registrados</h2>
                </div>
                <div className={styles.badges}>
                  <span>{index?.root_count ?? 0} ROOTS</span>
                  <span>{index?.tip_count ?? 0} TIPS</span>
                  <span>{index?.fork_count ?? 0} FORKS</span>
                </div>
              </div>

              <div className={styles.eventList}>
                {index?.timeline.map((record) => (
                  <article key={record.snapshot_digest}>
                    <strong>
                      {record.snapshot_key} · {record.label}
                      {registry.head_snapshot_digest === record.snapshot_digest ? " · HEAD" : ""}
                    </strong>
                    <code>{record.snapshot_digest}</code>
                    <p>parent={record.parent_snapshot_digest ?? "ROOT"}</p>
                    <p>snapshot_created_at={record.snapshot_created_at} · registered_at={record.registered_at}</p>
                    <code>{record.record_digest}</code>
                  </article>
                ))}
              </div>

              {index?.forks.length ? (
                <pre>{JSON.stringify({ forks: index.forks }, null, 2)}</pre>
              ) : null}
            </section>

            <form className={styles.stageCard} onSubmit={moveHead}>
              <p className={styles.kicker}>02 · EXPLICIT HEAD</p>
              <h2>Selecionar checkpoint ativo</h2>
              <p>HEAD atual: {registry.head_snapshot_digest ?? "UNSET"}</p>
              <label>
                Target snapshot
                <select value={headTarget} onChange={(event) => setHeadTarget(event.target.value)} required>
                  <option value="">Selecione</option>
                  {registry.snapshots.map((record) => (
                    <option key={record.snapshot_digest} value={record.snapshot_digest}>
                      {record.snapshot_key} · {record.snapshot_digest.slice(0, 12)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Motivo
                <input value={headReason} onChange={(event) => setHeadReason(event.target.value)} required />
              </label>
              <label>
                Sinal humano explícito
                <input value={headSignal} onChange={(event) => setHeadSignal(event.target.value)} placeholder="SET HEAD ..." required />
              </label>
              <button className={styles.primaryButton}>Mover HEAD</button>
            </form>

            {index?.head_history.length ? (
              <section className={styles.auditPanel}>
                <div className={styles.auditHeader}>
                  <div>
                    <p className={styles.kicker}>HEAD HISTORY</p>
                    <h2>Movimentos explícitos</h2>
                  </div>
                  <div className={styles.badges}>
                    <span>{index.head_history.length} EVENTS</span>
                    <span>MACHINE_CAN_CHOOSE=false</span>
                  </div>
                </div>
                <div className={styles.eventList}>
                  {index.head_history.map((event) => (
                    <article key={event.event_id}>
                      <strong>{event.event_id}</strong>
                      <p>{event.from_snapshot_digest ?? "UNSET"} → {event.to_snapshot_digest}</p>
                      <p>{event.reason} · signal={event.explicit_human_signal}</p>
                      <code>{event.event_digest}</code>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            <section className={styles.stageCard}>
              <p className={styles.kicker}>03 · ANCESTRY</p>
              <h2>Traçar root → snapshot</h2>
              <label>
                Snapshot
                <select value={ancestryDigest} onChange={(event) => setAncestryDigest(event.target.value)}>
                  <option value="">Selecione</option>
                  {registry.snapshots.map((record) => (
                    <option key={record.snapshot_digest} value={record.snapshot_digest}>
                      {record.snapshot_key} · {record.snapshot_digest.slice(0, 12)}
                    </option>
                  ))}
                </select>
              </label>
              <button className={styles.primaryButton} disabled={!ancestryDigest} onClick={traceAncestry}>
                Traçar ancestry
              </button>
              {ancestry ? <pre>{JSON.stringify(ancestry, null, 2)}</pre> : null}
            </section>

            <section className={styles.stageCard}>
              <p className={styles.kicker}>04 · COMPARE ANY PAIR</p>
              <h2>Comparar checkpoints registrados</h2>
              <div className={styles.twoCols}>
                <label>
                  Left
                  <select value={leftDigest} onChange={(event) => setLeftDigest(event.target.value)}>
                    <option value="">Selecione</option>
                    {registry.snapshots.map((record) => (
                      <option key={record.snapshot_digest} value={record.snapshot_digest}>
                        {record.snapshot_key} · {record.snapshot_digest.slice(0, 12)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Right
                  <select value={rightDigest} onChange={(event) => setRightDigest(event.target.value)}>
                    <option value="">Selecione</option>
                    {registry.snapshots.map((record) => (
                      <option key={record.snapshot_digest} value={record.snapshot_digest}>
                        {record.snapshot_key} · {record.snapshot_digest.slice(0, 12)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                className={styles.primaryButton}
                disabled={!leftDigest || !rightDigest}
                onClick={compareSnapshots}
              >
                Comparar
              </button>
              {comparison ? (
                <pre>{JSON.stringify({
                  lineage_relation: comparison.lineage_relation,
                  changed_components: comparison.changed_components,
                  component_changes: comparison.component_changes,
                  deltas: comparison.deltas,
                  truth_assessed: comparison.truth_assessed,
                  canon_promotion_permitted: comparison.canon_promotion_permitted,
                }, null, 2)}</pre>
              ) : null}
            </section>
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
