"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  allowedSymbolicRuntimeEvents,
  applySymbolicRuntimeEvent,
  createSymbolicRuntimeSession,
  symbolicRuntimeSummary,
  type EvidenceScope,
  type FeedbackAction,
  type RuntimeSessionArtifact,
  type SymbolicRuntimeEvent,
  type SymbolicRuntimeSession,
} from "@hnk/quest-engine";
import RuntimeArtifactPanel from "./RuntimeArtifactPanel";
import styles from "./runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: "NONE";
  execution: string;
  boundary: "RUNTIME_RECORD_NOT_METAPHYSICAL_PROOF";
  summary: ReturnType<typeof symbolicRuntimeSummary>;
};

const EVIDENCE_SCOPES: EvidenceScope[] = ["OBSERVED", "SELF_REPORTED", "SYSTEM_MEASURED", "MIXED"];
const FEEDBACK_ACTIONS: FeedbackAction[] = ["CONTINUE", "CORRECT", "PRUNE", "CLOSE"];

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function event(type: SymbolicRuntimeEvent["type"], payload?: Record<string, unknown>): SymbolicRuntimeEvent {
  return { event_id: id(type.toLowerCase()), type, at: now(), ...(payload ? { payload } : {}) };
}

export default function SymbolicRuntimeLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [session, setSession] = useState<SymbolicRuntimeSession | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [intention, setIntention] = useState("Investigar uma transformação de forma observável e registrável.");
  const [currentState, setCurrentState] = useState("ESTADO_ATUAL");
  const [targetState, setTargetState] = useState("ESTADO_ALVO");
  const [pathId, setPathId] = useState("PATH-001");
  const [constraints, setConstraints] = useState("Registrar apenas o que for observado; separar interpretação de evidência.");
  const [questAction, setQuestAction] = useState("Executar a prática definida e registrar o que ocorreu.");
  const [symbolicKey, setSymbolicKey] = useState("HNK-KEY-001");
  const [symbolicReference, setSymbolicReference] = useState("GLYPH_OR_SYMBOL_REFERENCE");
  const [vesselType, setVesselType] = useState("RESEARCH_LAB");
  const [vesselRef, setVesselRef] = useState("LOCAL_EPHEMERAL_SESSION");
  const [observationRaw, setObservationRaw] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [assessment, setAssessment] = useState("");
  const [nextAction, setNextAction] = useState<FeedbackAction>("CLOSE");
  const [resultState, setResultState] = useState("ESTADO_RESULTANTE");
  const [evidenceScope, setEvidenceScope] = useState<EvidenceScope>("SELF_REPORTED");
  const [evidenceNote, setEvidenceNote] = useState("");

  const allowed = useMemo(() => session ? allowedSymbolicRuntimeEvents(session.phase) : [], [session]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/runtime", {
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

  function transact(runtimeEvent: SymbolicRuntimeEvent) {
    if (!session) throw new Error("SESSION_NOT_CREATED");
    try {
      setError("");
      setSession(applySymbolicRuntimeEvent(session, runtimeEvent));
    } catch (err) {
      setError(err instanceof Error ? err.message : "RUNTIME_TRANSITION_FAILED");
    }
  }

  function createSession(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      setSession(createSymbolicRuntimeSession({
        session_id: id("session"),
        created_at: now(),
        intention,
        current_state: currentState,
        target_state: targetState,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "SESSION_CREATE_FAILED");
    }
  }

  function loadArtifact(artifact: RuntimeSessionArtifact) {
    setError("");
    setIntention(artifact.initial.intention);
    setCurrentState(artifact.initial.current_state);
    setTargetState(artifact.initial.target_state);
    setSession(artifact.session);
  }

  function resetSession() {
    setSession(null);
    setObservationRaw("");
    setInterpretation("");
    setAssessment("");
    setEvidenceNote("");
    setError("");
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Runtime Lab</h2>
        <p>
          O token é usado apenas no handshake da API privada. A sessão simbólica permanece no navegador e não é persistida pelo laboratório.
        </p>
        <form onSubmit={unlock} className={styles.unlockForm}>
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
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
          <span className={handshake.summary.canon_contract_ok ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>{handshake.summary.canon_dependencies} dependências canônicas</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{session?.phase ?? "—"}</strong><span>phase</span></article>
          <article><strong>{session?.cycle ?? 0}</strong><span>cycle</span></article>
          <article><strong>{session?.events.length ?? 0}</strong><span>events</span></article>
          <article><strong>{session?.observations.length ?? 0}</strong><span>observations</span></article>
        </div>

        <section className={styles.allowedBox}>
          <p className={styles.kicker}>EVENTOS PERMITIDOS AGORA</p>
          <div className={styles.badges}>
            {allowed.length ? allowed.map((value) => <span key={value}>{value}</span>) : <span>—</span>}
          </div>
        </section>

        <p className={styles.boundary}>
          {handshake.boundary}. Resultado de runtime é registro de execução/evidência, não prova metafísica automática.
        </p>
      </aside>

      <section className={styles.mainPanel}>
        {!session ? (
          <form className={styles.stageCard} onSubmit={createSession}>
            <p className={styles.kicker}>01 · INTENÇÃO E ESTADOS</p>
            <h2>Criar sessão efêmera</h2>
            <label>Intenção<textarea value={intention} onChange={(e) => setIntention(e.target.value)} required /></label>
            <div className={styles.twoCols}>
              <label>Estado atual<input value={currentState} onChange={(e) => setCurrentState(e.target.value)} required /></label>
              <label>Estado alvo<input value={targetState} onChange={(e) => setTargetState(e.target.value)} required /></label>
            </div>
            <button className={styles.primaryButton}>Criar sessão</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>SESSION</p>
                <code>{session.session_id}</code>
                <h2>{session.current_state} → {session.target_state}</h2>
                <p>{session.intention}</p>
              </div>
              <button className={styles.ghostButton} onClick={resetSession}>Nova sessão</button>
            </section>

            <div className={styles.stageGrid}>
              <section className={styles.stageCard}>
                <p className={styles.kicker}>02 · SPECIFY</p>
                <h3>Caminho e restrições</h3>
                <label>Path ID<input value={pathId} onChange={(e) => setPathId(e.target.value)} /></label>
                <label>Restrições<textarea value={constraints} onChange={(e) => setConstraints(e.target.value)} /></label>
                <button className={styles.primaryButton} disabled={!allowed.includes("SPECIFY")} onClick={() => transact(event("SPECIFY", {
                  path_id: pathId,
                  from_state: session.current_state,
                  to_state: session.target_state,
                  constraints: constraints.split("\n").map((v) => v.trim()).filter(Boolean),
                }))}>Aplicar especificação</button>
              </section>

              <section className={styles.stageCard}>
                <p className={styles.kicker}>03 · CONSTRUCT</p>
                <h3>Quest / ação concreta</h3>
                <label>Ação<textarea value={questAction} onChange={(e) => setQuestAction(e.target.value)} /></label>
                <button className={styles.primaryButton} disabled={!allowed.includes("CONSTRUCT")} onClick={() => transact(event("CONSTRUCT", {
                  construction_id: id("construction"),
                  steps: [{ step_id: "step-001", action: questAction }],
                }))}>Construir Quest</button>
              </section>

              <section className={styles.stageCard}>
                <p className={styles.kicker}>04 · BIND</p>
                <h3>Glifo-chave e Vessel</h3>
                <label>Key ID<input value={symbolicKey} onChange={(e) => setSymbolicKey(e.target.value)} /></label>
                <label>Referência simbólica<input value={symbolicReference} onChange={(e) => setSymbolicReference(e.target.value)} /></label>
                <div className={styles.twoCols}>
                  <label>Context type<input value={vesselType} onChange={(e) => setVesselType(e.target.value)} /></label>
                  <label>Context ref<input value={vesselRef} onChange={(e) => setVesselRef(e.target.value)} /></label>
                </div>
                <button className={styles.primaryButton} disabled={!allowed.includes("BIND")} onClick={() => transact(event("BIND", {
                  symbolic_key: { key_id: symbolicKey, reference: symbolicReference },
                  vessel: { vessel_id: id("vessel"), context_type: vesselType, context_ref: vesselRef },
                }))}>Vincular contexto</button>
              </section>

              <section className={styles.stageCard}>
                <p className={styles.kicker}>05 · ACTIVATE</p>
                <h3>Executar</h3>
                <p>Ativa a Quest no Vessel atual. A ação acontece fora do software; o runtime registra o processo.</p>
                <button className={styles.primaryButton} disabled={!allowed.includes("ACTIVATE")} onClick={() => transact(event("ACTIVATE"))}>Ativar Quest</button>
              </section>

              <section className={styles.stageCard}>
                <p className={styles.kicker}>06 · OBSERVE</p>
                <h3>Observação ≠ interpretação</h3>
                <label>Observação bruta<textarea value={observationRaw} onChange={(e) => setObservationRaw(e.target.value)} placeholder="O que ocorreu, sem explicar por quê." /></label>
                <label>Interpretação opcional<textarea value={interpretation} onChange={(e) => setInterpretation(e.target.value)} placeholder="Sua leitura do ocorrido, separada do dado bruto." /></label>
                <button className={styles.primaryButton} disabled={!allowed.includes("OBSERVE") || !observationRaw.trim()} onClick={() => transact(event("OBSERVE", {
                  observation_id: id("observation"),
                  raw: observationRaw,
                  interpretation: interpretation || undefined,
                }))}>Registrar observação</button>
              </section>

              <section className={styles.stageCard}>
                <p className={styles.kicker}>07 · FEEDBACK</p>
                <h3>Avaliação e próxima ação</h3>
                <label>Avaliação<textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} /></label>
                <label>Próxima ação<select value={nextAction} onChange={(e) => setNextAction(e.target.value as FeedbackAction)}>{FEEDBACK_ACTIONS.map((v) => <option key={v}>{v}</option>)}</select></label>
                <button className={styles.primaryButton} disabled={!allowed.includes("FEEDBACK") || !assessment.trim()} onClick={() => transact(event("FEEDBACK", { feedback_id: id("feedback"), assessment, next_action: nextAction }))}>Registrar feedback</button>
                <button className={styles.ghostButton} disabled={!allowed.includes("CYCLE")} onClick={() => transact(event("CYCLE"))}>Novo ciclo</button>
              </section>

              <section className={styles.stageCard}>
                <p className={styles.kicker}>08 · COMPLETE</p>
                <h3>Resultado e escopo de evidência</h3>
                <label>Estado resultante<input value={resultState} onChange={(e) => setResultState(e.target.value)} /></label>
                <label>Evidence scope<select value={evidenceScope} onChange={(e) => setEvidenceScope(e.target.value as EvidenceScope)}>{EVIDENCE_SCOPES.map((v) => <option key={v}>{v}</option>)}</select></label>
                <label>Nota/evidência<textarea value={evidenceNote} onChange={(e) => setEvidenceNote(e.target.value)} /></label>
                <button className={styles.primaryButton} disabled={!allowed.includes("COMPLETE")} onClick={() => transact(event("COMPLETE", {
                  result_state: resultState,
                  evidence_scope: evidenceScope,
                  evidence: evidenceNote.trim() ? [{ note: evidenceNote.trim() }] : [],
                }))}>Encerrar sessão</button>
                <button className={styles.dangerButton} disabled={!allowed.includes("ABORT")} onClick={() => transact(event("ABORT", { reason: "Abortado manualmente no Runtime Lab." }))}>Abortar</button>
              </section>
            </div>

            <section className={styles.auditPanel}>
              <div className={styles.auditHeader}>
                <div><p className={styles.kicker}>AUDIT TRAIL</p><h2>{session.events.length} eventos</h2></div>
                <div className={styles.badges}><span>{session.phase}</span><span>CYCLE {session.cycle}</span></div>
              </div>
              <div className={styles.eventList}>
                {[...session.events].reverse().map((runtimeEvent) => (
                  <article key={runtimeEvent.event_id}>
                    <strong>{runtimeEvent.type}</strong>
                    <code>{runtimeEvent.at}</code>
                    <pre>{JSON.stringify(runtimeEvent.payload ?? {}, null, 2)}</pre>
                  </article>
                ))}
              </div>
              {session.result ? (
                <article className={styles.resultCard}>
                  <p className={styles.kicker}>RESULT</p>
                  <h3>{session.result.result_state}</h3>
                  <p>{session.result.evidence_scope}</p>
                  <code>{session.result.claim_boundary}</code>
                </article>
              ) : null}
            </section>

            <RuntimeArtifactPanel session={session} initialCurrentState={currentState} onLoadArtifact={loadArtifact} />
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}
