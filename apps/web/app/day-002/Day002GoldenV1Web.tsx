'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ExperienceDirector,
  QuestRuntime,
  createQuestCatalog,
  type ExperienceDirective,
  type PlayerContext,
  type SessionSnapshot,
} from '@hnk/quest-engine';
import { createBundledQuestLibrary, type RuntimeQuestBundle } from '@hnk/quest-library';
import { sealDay002V1, startDay002PracticeSessionV1 } from '@hnk/supabase-client';
import { QuestAudioPhase } from '../_runtime/QuestAudioPhase';
import { useWebHnkRuntime } from '../_runtime/WebHnkRuntime';
import styles from './day002-golden-v1.module.css';

type Day002Session = Awaited<ReturnType<typeof startDay002PracticeSessionV1>>;
type Day002Seal = Extract<Awaited<ReturnType<typeof sealDay002V1>>, { ok: true }>['response'];

type PracticeDurations = { jachin: number; boaz: number; middle: number };

function createClientSessionId(userId: string): string {
  return `hnk-web-d002-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function canonicalText(bundle: RuntimeQuestBundle, directive: ExperienceDirective): string[] {
  return (directive.phase.source.block_ids ?? []).map((id) => {
    const block = bundle.canon.blocks.find((entry) => entry.id === id);
    if (!block) throw new Error(`canonical_block_missing:${id}`);
    return block.text;
  });
}

export function Day002GoldenV1Web() {
  const auth = useWebHnkRuntime();
  const [bundle, setBundle] = useState<RuntimeQuestBundle | null>(null);
  const runtimeRef = useRef<QuestRuntime | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [session, setSession] = useState<Day002Session | null>(null);
  const [durations, setDurations] = useState<PracticeDurations>({ jachin: 0, boaz: 0, middle: 0 });
  const [impulseCount, setImpulseCount] = useState(0);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [voluntary, setVoluntary] = useState(false);
  const [safetyStopped, setSafetyStopped] = useState(false);
  const [sealed, setSealed] = useState<Day002Seal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);
  const playerContext = useMemo<PlayerContext>(() => ({
    mediationMode: 'HNK_CANONICAL',
    accessibility: {
      reducedMotion: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
      audioEnabled: true,
      microphoneAvailable: false,
    },
    offline: !live,
  }), [live]);

  useEffect(() => {
    let active = true;
    const library = createBundledQuestLibrary();
    const catalog = createQuestCatalog(library);
    void Promise.all([catalog.requireDay(2), library.loadBundle(2)]).then(([definition, loadedBundle]) => {
      if (!active || !loadedBundle) return;
      const runtime = new QuestRuntime(definition);
      runtimeRef.current = runtime;
      setBundle(loadedBundle);
      setSnapshot(runtime.start());
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'day002_bundle_load_failed');
    });
    return () => { active = false; };
  }, []);

  const director = useMemo(() => bundle ? new ExperienceDirector(bundle.quest) : null, [bundle]);
  const directive = useMemo(() => {
    if (!director || !snapshot?.currentPhaseId) return null;
    return director.resolvePhase(snapshot.currentPhaseId, playerContext, snapshot);
  }, [director, playerContext, snapshot]);

  async function ensureSession(): Promise<Day002Session | null> {
    if (session) return session;
    if (!live || !auth.client || !auth.userId) return null;
    const created = await startDay002PracticeSessionV1(auth.client, {
      clientSessionId: createClientSessionId(auth.userId),
      appVersion: '0.4.1-web-day002-golden-v1',
    });
    setSession(created);
    return created;
  }

  async function completePhase(phaseId: string): Promise<void> {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    setError(null);
    try {
      if (phaseId === 'jachin_reading' || phaseId === 'jachin_practice') await ensureSession();
      setSnapshot(runtime.completePhase(phaseId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'quest_phase_completion_failed');
    }
  }

  async function safetyStop(reason?: string): Promise<void> {
    setSafetyStopped(true);
    setError(reason ? `Prática interrompida com segurança: ${reason}` : 'Prática interrompida com segurança.');
    const runtime = runtimeRef.current;
    if (runtime) setSnapshot(runtime.safetyStop());
  }

  function resume(): void {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    setError(null);
    setSnapshot(runtime.resume());
  }

  async function seal(): Promise<void> {
    const runtime = runtimeRef.current;
    if (!runtime || !auth.client || !session || !voluntary || !reflectionDone) return;
    if (durations.jachin <= 0 || durations.boaz <= 0 || durations.middle <= 0) {
      setError('practice_duration_required');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await sealDay002V1(auth.client, {
        evidence: {
          sessionId: session.id,
          mode: 'first_completion',
          jachin: { durationSeconds: durations.jachin },
          audio: {},
          boaz: {
            durationSeconds: durations.boaz,
            impulseCount,
            firstFiveMinutesReflectionCompleted: true,
          },
          middle: { durationSeconds: durations.middle },
          soulMirror: { difficultyRating: difficulty },
          safetyStopOccurred: safetyStopped,
        },
        totalDurationSeconds: durations.jachin + durations.boaz + durations.middle,
        impulseCount,
      });
      if (!result.ok) throw new Error(result.code);
      setSealed(result.response);
      setSnapshot(runtime.confirmServerCompletion());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'day002_completion_failed');
    } finally {
      setBusy(false);
    }
  }

  if (!bundle || !snapshot || !director) {
    return <main className={styles.shell}><p>CARREGANDO QUEST PACK DO DIA 002…</p>{error ? <p className={styles.error}>{error}</p> : null}</main>;
  }

  if (snapshot.runState === 'SAFETY_STOP') {
    return (
      <main className={styles.shell}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>SAFETY STOP</p>
          <h1>A prática foi interrompida.</h1>
          <p>Movimente-se, respire naturalmente e retome apenas quando desejar. Nenhum fenômeno subjetivo é requisito de conclusão.</p>
          <button type="button" onClick={resume}>RETOMAR DA ÚLTIMA FASE</button>
        </section>
      </main>
    );
  }

  if (snapshot.runState === 'COMPLETE') {
    return (
      <main className={styles.shell}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>DIA 002 · REGISTRADO</p>
          <h1>Asana do Louco concluído.</h1>
          <p>{sealed?.first_completion ? `+${sealed.xp_awarded} XP canônicos.` : 'Revisita registrada sem novo XP.'}</p>
          <p>O ganho de Disciplina é calculado exclusivamente pelo servidor conforme a Matriz de Progressão V1.</p>
        </section>
      </main>
    );
  }

  if (!directive) return <main className={styles.shell}><p>FASE INDISPONÍVEL.</p></main>;

  const texts = directive.requiresCanonicalContent ? canonicalText(bundle, directive) : [];
  const phase = directive.phase;

  return (
    <main className={styles.shell} data-hnk-theme="kether">
      <header className={styles.header}>
        <div><span>DIA 002 · KETHER</span><strong>ASANA DO LOUCO</strong></div>
        <div className={styles.status}>{live ? 'BACKEND V2 · ATIVO' : 'OFFLINE · PRÁTICA LOCAL'}</div>
      </header>
      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.panel} data-phase={phase.type}>
        <p className={styles.eyebrow}>{phase.type} · {phase.id}</p>

        {phase.type === 'NARRATIVE' ? <><h1>O segundo limiar de Kether.</h1><p>Hoje a jornada muda da atenção inicial para a relação entre presença, corpo e impulso.</p></> : null}

        {phase.type === 'TERM_REVEAL' ? <><h2>Termos desta travessia</h2><div className={styles.tags}>{(phase.terms ?? []).map((term) => <span key={term}>{term}</span>)}</div></> : null}

        {phase.type === 'READ' ? <div className={styles.canon}>{texts.map((text, index) => <p key={index}>{text}</p>)}</div> : null}

        {phase.type === 'INSTRUCTION' ? <div className={styles.system}>{(phase.content_intent ?? []).map((item) => <p key={item}>{item}</p>)}</div> : null}

        {phase.type === 'FOCUS' ? (
          <FocusPractice
            phaseId={phase.id}
            target={Number(phase.interaction?.duration_seconds ?? 0)}
            impulseCount={phase.id === 'boaz_asana' ? impulseCount : undefined}
            onImpulse={phase.id === 'boaz_asana' ? () => setImpulseCount((value) => value + 1) : undefined}
            onFinish={(seconds) => {
              if (phase.id === 'jachin_practice') setDurations((value) => ({ ...value, jachin: seconds }));
              if (phase.id === 'boaz_asana') setDurations((value) => ({ ...value, boaz: seconds }));
              if (phase.id === 'middle_practice') setDurations((value) => ({ ...value, middle: seconds }));
              void completePhase(phase.id);
            }}
            onSafetyStop={() => void safetyStop('practice_safety_stop')}
          />
        ) : null}

        {phase.type === 'AUDIO' ? (
          <QuestAudioPhase directive={directive} onCompletePhase={completePhase} onSafetyStop={safetyStop} />
        ) : null}

        {phase.type === 'RETURN' ? <ReturnGate onConfirm={() => void completePhase(phase.id)} /> : null}

        {phase.type === 'JOURNAL' ? (
          <div className={styles.system}>
            <p>O texto íntimo permanece no Vault. Para a Evidence do Day 002, basta registrar que você realizou a reflexão dos primeiros minutos.</p>
            <label><input type="checkbox" checked={reflectionDone} onChange={(event) => setReflectionDone(event.target.checked)} /> Reflexão estruturada concluída</label>
            <button type="button" disabled={!reflectionDone} onClick={() => void completePhase(phase.id)}>REGISTRAR E CONTINUAR</button>
          </div>
        ) : null}

        {phase.type === 'STRUCTURED_JOURNAL' ? (
          <div className={styles.system}>
            <p>Espelho da Alma · dificuldade percebida, sem interpretação automática.</p>
            <div className={styles.rating}>{[0,1,2,3,4,5,6,7,8,9,10].map((value) => <button type="button" key={value} data-active={difficulty === value} onClick={() => setDifficulty(value)}>{value}</button>)}</div>
            <button type="button" onClick={() => void completePhase(phase.id)}>CONCLUIR ESPELHO</button>
          </div>
        ) : null}

        {phase.type === 'CORRESPONDENCE_REVEAL' ? <><h2>Correspondências</h2><div className={styles.tags}>{(phase.items ?? []).map((item) => <span key={item}>{item}</span>)}</div></> : null}

        {phase.type === 'COMPLETION' ? (
          <div className={styles.system}>
            <h2>Selo canônico</h2>
            <p>O cliente não concede XP nem atributo. O servidor valida sequência, Evidence, contrato e idempotência.</p>
            <label><input type="checkbox" checked={voluntary} onChange={(event) => setVoluntary(event.target.checked)} /> Confirmo que concluí voluntariamente esta prática.</label>
            <button type="button" disabled={!live || !session || !reflectionDone || !voluntary || busy} onClick={() => void seal()}>{busy ? 'SELANDO…' : 'SELAR DIA 002'}</button>
            {!live ? <p>Faça login para transformar esta prática local em conclusão canônica.</p> : null}
          </div>
        ) : null}

        {phase.type === 'UNLOCK' ? <div className={styles.system}><h2>Vehuiah · 2/5</h2><p>Nenhum fragmento é concedido até 5/5.</p></div> : null}

        {!['FOCUS','AUDIO','RETURN','JOURNAL','STRUCTURED_JOURNAL','COMPLETION'].includes(phase.type) ? (
          <button className={styles.primary} type="button" onClick={() => void completePhase(phase.id)}>CONTINUAR</button>
        ) : null}
      </section>
    </main>
  );
}

function FocusPractice({ phaseId, target, impulseCount, onImpulse, onFinish, onSafetyStop }: {
  phaseId: string;
  target: number;
  impulseCount?: number;
  onImpulse?: () => void;
  onFinish: (seconds: number) => void;
  onSafetyStop: () => void;
}) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt == null) return;
    const timer = window.setInterval(() => setElapsed(Math.max(1, Math.floor((Date.now() - startedAt) / 1000))), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return (
    <div className={styles.practice}>
      <h2>{phaseId === 'boaz_asana' ? 'Imobilidade consciente' : 'Prática de foco'}</h2>
      <p>Alvo canônico: {Math.round(target / 60)} min. Você pode mover-se, pausar ou encerrar diante de desconforto.</p>
      <strong>{elapsed}s</strong>
      {startedAt == null ? <button type="button" onClick={() => { setStartedAt(Date.now()); setElapsed(1); }}>INICIAR PRÁTICA</button> : null}
      {onImpulse ? <button type="button" onClick={onImpulse}>IMPULSO PERCEBIDO · {impulseCount ?? 0}</button> : null}
      <button type="button" disabled={elapsed <= 0} onClick={() => onFinish(elapsed)}>CONCLUIR ESTA PRÁTICA</button>
      <button type="button" onClick={onSafetyStop}>SAFETY STOP</button>
    </div>
  );
}

function ReturnGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className={styles.system}>
      <h2>Return Gate</h2>
      <p>Respire normalmente. Movimente mãos e pés. Oriente-se ao ambiente e abra os olhos quando desejar.</p>
      <button type="button" onClick={onConfirm}>ESTOU ORIENTADO · CONTINUAR</button>
    </div>
  );
}
