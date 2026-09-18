"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  compareResearchWorkspaceSnapshots,
  createResearchWorkspaceSnapshot,
  parseClaimReevaluationQueue,
  parseResearchArtifactLibrary,
  parseResearchWorkspaceSnapshot,
  parseReviewedClaimRegistry,
  restoreResearchWorkspaceSnapshot,
  serializeClaimReevaluationQueue,
  serializeResearchArtifactLibrary,
  serializeResearchWorkspaceSnapshot,
  serializeReviewedClaimRegistry,
  type HnkClaimReevaluationQueue,
  type HnkResearchArtifactLibrary,
  type HnkResearchWorkspaceSnapshot,
  type HnkReviewedClaimRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "WORKSPACE_SNAPSHOT_FREEZES_RESEARCH_STATE_NOT_TRUTH_REVIEW_DECISION_OR_CANON";
  summary: {
    components: string[];
    root_digest: "SHA-256";
    component_digest_binding: boolean;
    direct_parent_lineage: boolean;
    comparison: boolean;
    exact_component_restore: boolean;
    immutable_checkpoint: boolean;
    automatic_truth_inference: false;
    machine_can_decide_review: false;
    automatic_canon_promotion: false;
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

export default function ResearchWorkspaceSnapshotLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);

  const [artifactLibrary, setArtifactLibrary] = useState<HnkResearchArtifactLibrary | null>(null);
  const [reviewedRegistry, setReviewedRegistry] = useState<HnkReviewedClaimRegistry | null>(null);
  const [reevaluationQueue, setReevaluationQueue] = useState<HnkClaimReevaluationQueue | null>(null);

  const [snapshot, setSnapshot] = useState<HnkResearchWorkspaceSnapshot | null>(null);
  const [comparisonSnapshot, setComparisonSnapshot] = useState<HnkResearchWorkspaceSnapshot | null>(null);

  const [snapshotKey, setSnapshotKey] = useState("");
  const [label, setLabel] = useState("");
  const [parentDigest, setParentDigest] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const comparison = useMemo(() => {
    if (!snapshot || !comparisonSnapshot) return null;
    try {
      return compareResearchWorkspaceSnapshots(snapshot, comparisonSnapshot);
    } catch {
      return null;
    }
  }, [snapshot, comparisonSnapshot]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/workspace-snapshots", {
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

  async function importArtifactLibrary(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setArtifactLibrary(parseResearchArtifactLibrary(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ARTIFACT_LIBRARY_IMPORT_FAILED");
    }
  }

  async function importReviewedRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setReviewedRegistry(parseReviewedClaimRegistry(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "REVIEWED_REGISTRY_IMPORT_FAILED");
    }
  }

  async function importQueue(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setReevaluationQueue(parseClaimReevaluationQueue(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "REEVALUATION_QUEUE_IMPORT_FAILED");
    }
  }

  async function importSnapshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseResearchWorkspaceSnapshot(await file.text());
      const restored = restoreResearchWorkspaceSnapshot(parsed);
      setSnapshot(parsed);
      setArtifactLibrary(restored.artifact_library);
      setReviewedRegistry(restored.reviewed_claim_registry);
      setReevaluationQueue(restored.claim_reevaluation_queue);
      setSnapshotKey(parsed.snapshot_key);
      setLabel(parsed.label);
      setParentDigest(parsed.parent_snapshot_digest ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "WORKSPACE_SNAPSHOT_IMPORT_FAILED");
    }
  }

  async function importComparisonSnapshot(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setComparisonSnapshot(parseResearchWorkspaceSnapshot(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "COMPARISON_SNAPSHOT_IMPORT_FAILED");
    }
  }

  function createSnapshot(event: FormEvent) {
    event.preventDefault();
    if (!artifactLibrary || !reviewedRegistry || !reevaluationQueue) return;
    try {
      setError("");
      setSnapshot(createResearchWorkspaceSnapshot({
        snapshot_key: snapshotKey,
        label,
        created_at: now(),
        parent_snapshot_digest: parentDigest || null,
        artifact_library: artifactLibrary,
        reviewed_claim_registry: reviewedRegistry,
        claim_reevaluation_queue: reevaluationQueue,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "WORKSPACE_SNAPSHOT_CREATE_FAILED");
    }
  }

  function makeNextCheckpoint() {
    if (!snapshot) return;
    setParentDigest(snapshot.snapshot_digest);
    setSnapshotKey(`${snapshot.snapshot_key}-NEXT`);
    setLabel(`${snapshot.label} · next checkpoint`);
  }

  function exportRestoredComponents() {
    if (!snapshot) return;
    try {
      const restored = restoreResearchWorkspaceSnapshot(snapshot);
      downloadJson(
        `${snapshot.snapshot_key}.artifact-library.json`,
        serializeResearchArtifactLibrary(restored.artifact_library),
      );
      downloadJson(
        `${snapshot.snapshot_key}.reviewed-claims.json`,
        serializeReviewedClaimRegistry(restored.reviewed_claim_registry),
      );
      downloadJson(
        `${snapshot.snapshot_key}.reevaluation-queue.json`,
        serializeClaimReevaluationQueue(restored.claim_reevaluation_queue),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "WORKSPACE_RESTORE_EXPORT_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Research Workspace Snapshot</h2>
        <p>
          O checkpoint congela o estado dos três componentes sob um root digest. Nenhum dado é salvo
          automaticamente no servidor ou no navegador.
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

  const componentsReady = Boolean(artifactLibrary && reviewedRegistry && reevaluationQueue);

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <article className={styles.healthCard}>
          <span className={handshake.summary.component_digest_binding ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>root digest · exact restore · no auto persistence</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{artifactLibrary ? "READY" : "—"}</strong><span>artifact library</span></article>
          <article><strong>{reviewedRegistry ? "READY" : "—"}</strong><span>reviewed registry</span></article>
          <article><strong>{reevaluationQueue ? "READY" : "—"}</strong><span>re-evaluation queue</span></article>
          <article><strong>{snapshot ? "SEALED" : "OPEN"}</strong><span>checkpoint</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>Artifact Library<input type="file" accept="application/json,.json" onChange={importArtifactLibrary} /></label>
        <label>Reviewed Claim Registry<input type="file" accept="application/json,.json" onChange={importReviewedRegistry} /></label>
        <label>Claim Re-evaluation Queue<input type="file" accept="application/json,.json" onChange={importQueue} /></label>
        <label>Importar Workspace Snapshot<input type="file" accept="application/json,.json" onChange={importSnapshot} /></label>
        <label>Snapshot para comparação<input type="file" accept="application/json,.json" onChange={importComparisonSnapshot} /></label>

        {snapshot ? (
          <>
            <button
              className={styles.ghostButton}
              onClick={() => downloadJson(
                `${snapshot.snapshot_key}.hnk-research-workspace-snapshot.json`,
                serializeResearchWorkspaceSnapshot(snapshot),
              )}
            >
              Exportar checkpoint
            </button>
            <button className={styles.ghostButton} onClick={exportRestoredComponents}>
              Restaurar/exportar componentes exatos
            </button>
            <button className={styles.ghostButton} onClick={makeNextCheckpoint}>
              Usar checkpoint atual como parent
            </button>
          </>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        <form className={styles.stageCard} onSubmit={createSnapshot}>
          <p className={styles.kicker}>01 · FREEZE WORKSPACE</p>
          <h2>Criar checkpoint científico do Research Lab</h2>
          <label>
            Snapshot key
            <input value={snapshotKey} onChange={(event) => setSnapshotKey(event.target.value)} required />
          </label>
          <label>
            Label
            <input value={label} onChange={(event) => setLabel(event.target.value)} required />
          </label>
          <label>
            Parent snapshot digest — opcional
            <input value={parentDigest} onChange={(event) => setParentDigest(event.target.value)} placeholder="64-char SHA-256" />
          </label>
          <button className={styles.primaryButton} disabled={!componentsReady}>
            Selar workspace snapshot
          </button>
          {!componentsReady ? (
            <p>Importe os três componentes válidos antes de criar o checkpoint.</p>
          ) : null}
        </form>

        {snapshot ? (
          <section className={styles.auditPanel}>
            <div className={styles.auditHeader}>
              <div>
                <p className={styles.kicker}>SEALED CHECKPOINT</p>
                <h2>{snapshot.label}</h2>
                <code>{snapshot.snapshot_digest}</code>
              </div>
              <div className={styles.badges}>
                <span>IMMUTABLE</span>
                <span>ROOT SHA-256</span>
                <span>NO AUTO CANON</span>
              </div>
            </div>

            <pre>{JSON.stringify({
              snapshot_key: snapshot.snapshot_key,
              parent_snapshot_digest: snapshot.parent_snapshot_digest,
              component_digests: snapshot.component_digests,
              state_summary: snapshot.state_summary,
              immutable_checkpoint: snapshot.immutable_checkpoint,
              automatic_truth_inference: snapshot.automatic_truth_inference,
              machine_can_decide_review: snapshot.machine_can_decide_review,
              canon_promotion_permitted: snapshot.canon_promotion_permitted,
            }, null, 2)}</pre>
          </section>
        ) : null}

        {comparison ? (
          <section className={styles.auditPanel}>
            <div className={styles.auditHeader}>
              <div>
                <p className={styles.kicker}>CHECKPOINT DIFF</p>
                <h2>{comparison.lineage_relation}</h2>
              </div>
              <div className={styles.badges}>
                <span>{comparison.changed_components.length} CHANGED COMPONENTS</span>
                <span>TRUTH_ASSESSED=false</span>
              </div>
            </div>
            <pre>{JSON.stringify({
              left_snapshot_digest: comparison.left_snapshot_digest,
              right_snapshot_digest: comparison.right_snapshot_digest,
              changed_components: comparison.changed_components,
              component_changes: comparison.component_changes,
              deltas: comparison.deltas,
              canon_promotion_permitted: comparison.canon_promotion_permitted,
            }, null, 2)}</pre>
          </section>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
