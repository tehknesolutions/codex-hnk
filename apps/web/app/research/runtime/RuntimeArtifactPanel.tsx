"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  compareRuntimeSessionArtifacts,
  createRuntimeSessionArtifact,
  parseRuntimeSessionArtifact,
  replayRuntimeSessionArtifact,
  serializeRuntimeSessionArtifact,
  type RuntimeSessionArtifact,
  type SymbolicRuntimeSession,
} from "@hnk/quest-engine";
import styles from "./runtime.module.css";

type Props = {
  session: SymbolicRuntimeSession;
  initialCurrentState: string;
  onLoadArtifact: (artifact: RuntimeSessionArtifact) => void;
};

function makeArtifact(session: SymbolicRuntimeSession, initialCurrentState: string) {
  return createRuntimeSessionArtifact({
    session,
    exported_at: new Date().toISOString(),
    initial: {
      session_id: session.session_id,
      created_at: session.created_at,
      intention: session.intention,
      current_state: initialCurrentState,
      target_state: session.target_state,
    },
  });
}

function downloadArtifact(artifact: RuntimeSessionArtifact) {
  const blob = new Blob([serializeRuntimeSessionArtifact(artifact)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${artifact.initial.session_id}.hnk-runtime.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function RuntimeArtifactPanel({ session, initialCurrentState, onLoadArtifact }: Props) {
  const [left, setLeft] = useState<RuntimeSessionArtifact | null>(null);
  const [right, setRight] = useState<RuntimeSessionArtifact | null>(null);
  const [artifactError, setArtifactError] = useState("");

  const comparison = useMemo(() => {
    if (!left || !right) return null;
    try {
      return compareRuntimeSessionArtifacts(left, right);
    } catch (error) {
      setArtifactError(error instanceof Error ? error.message : "COMPARE_FAILED");
      return null;
    }
  }, [left, right]);

  function currentArtifact() {
    return makeArtifact(session, initialCurrentState);
  }

  function useCurrent(slot: "left" | "right") {
    try {
      setArtifactError("");
      const artifact = currentArtifact();
      if (slot === "left") setLeft(artifact);
      else setRight(artifact);
    } catch (error) {
      setArtifactError(error instanceof Error ? error.message : "ARTIFACT_EXPORT_FAILED");
    }
  }

  function exportCurrent() {
    try {
      setArtifactError("");
      downloadArtifact(currentArtifact());
    } catch (error) {
      setArtifactError(error instanceof Error ? error.message : "ARTIFACT_EXPORT_FAILED");
    }
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>, slot: "left" | "right") {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setArtifactError("");
      const artifact = parseRuntimeSessionArtifact(await file.text());
      const replay = replayRuntimeSessionArtifact(artifact);
      if (!replay.ok || !replay.matches_snapshot) throw new Error(replay.issues.join("; ") || "REPLAY_MISMATCH");
      if (slot === "left") setLeft(artifact);
      else setRight(artifact);
    } catch (error) {
      setArtifactError(error instanceof Error ? error.message : "ARTIFACT_IMPORT_FAILED");
    }
  }

  return (
    <section className={styles.auditPanel}>
      <div className={styles.auditHeader}>
        <div>
          <p className={styles.kicker}>RUNTIME SESSION ARTIFACT V1</p>
          <h2>Exportar · importar · replay · comparar</h2>
        </div>
        <div className={styles.badges}>
          <span>USER CONTROLLED FILE</span>
          <span>NO SERVER STORAGE</span>
          <span>DETERMINISTIC REPLAY</span>
        </div>
      </div>

      <p className={styles.boundary}>
        O arquivo preserva a sessão e o histórico de eventos para reexecução determinística. Comparação descreve diferenças entre registros; não atribui causalidade nem prova eficácia metafísica.
      </p>

      <div className={styles.stageGrid}>
        <article className={styles.stageCard}>
          <p className={styles.kicker}>EXPORT</p>
          <h3>Sessão atual</h3>
          <p>{session.session_id} · {session.phase} · {session.events.length} eventos</p>
          <button className={styles.primaryButton} onClick={exportCurrent}>Baixar JSON validado</button>
          <button className={styles.ghostButton} onClick={() => useCurrent("left")}>Usar atual como A</button>
          <button className={styles.ghostButton} onClick={() => useCurrent("right")}>Usar atual como B</button>
        </article>

        <article className={styles.stageCard}>
          <p className={styles.kicker}>IMPORT A</p>
          <h3>Artifact A</h3>
          <input type="file" accept="application/json,.json" onChange={(event) => importFile(event, "left")} />
          {left ? <p>{left.initial.session_id} · {left.session.phase} · replay PASS</p> : <p>Nenhum artifact carregado.</p>}
          {left ? <button className={styles.ghostButton} onClick={() => onLoadArtifact(left)}>Carregar A no Runtime</button> : null}
        </article>

        <article className={styles.stageCard}>
          <p className={styles.kicker}>IMPORT B</p>
          <h3>Artifact B</h3>
          <input type="file" accept="application/json,.json" onChange={(event) => importFile(event, "right")} />
          {right ? <p>{right.initial.session_id} · {right.session.phase} · replay PASS</p> : <p>Nenhum artifact carregado.</p>}
          {right ? <button className={styles.ghostButton} onClick={() => onLoadArtifact(right)}>Carregar B no Runtime</button> : null}
        </article>

        <article className={styles.stageCard}>
          <p className={styles.kicker}>REPLAY STATUS</p>
          <h3>Integridade</h3>
          <p>A: {left ? (replayRuntimeSessionArtifact(left).matches_snapshot ? "MATCH" : "MISMATCH") : "—"}</p>
          <p>B: {right ? (replayRuntimeSessionArtifact(right).matches_snapshot ? "MATCH" : "MISMATCH") : "—"}</p>
          <p>Compatibilidade: {comparison ? (comparison.compatible ? "SIM" : "NÃO") : "—"}</p>
        </article>
      </div>

      {comparison ? (
        <div className={styles.eventList}>
          {comparison.metrics.map((entry) => (
            <article key={entry.key}>
              <strong>{entry.equal ? "=" : "≠"} {entry.key}</strong>
              <code>A: {String(entry.left ?? "—")}</code>
              <code>B: {String(entry.right ?? "—")}</code>
            </article>
          ))}
        </div>
      ) : null}

      {artifactError ? <p className={styles.error}>{artifactError}</p> : null}
    </section>
  );
}
