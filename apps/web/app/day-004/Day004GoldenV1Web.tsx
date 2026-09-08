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
import { sealDay004V1, startDay004PracticeSessionV1 } from '@hnk/supabase-client';
import { QuestAudioPhase } from '../_runtime/QuestAudioPhase';
import { QuestBehavioralExperimentPhase, type BehavioralExperimentResult } from '../_runtime/QuestBehavioralExperimentPhase';
import { useWebHnkRuntime } from '../_runtime/WebHnkRuntime';

type Day004Session = Awaited<ReturnType<typeof startDay004PracticeSessionV1>>;
type Day004Seal = Extract<Awaited<ReturnType<typeof sealDay004V1>>, { ok: true }>['response'];

function canonicalText(bundle: RuntimeQuestBundle, directive: ExperienceDirective): string[] {
  return (directive.phase.source.block_ids ?? []).map((id) => {
    const block = bundle.canon.blocks.find((entry) => entry.id === id);
    if (!block) throw new Error(`canonical_block_missing:${id}`);
    return block.text;
  });
}
function sessionKey(userId: string): string { return `hnk-web-d004-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

export function Day004GoldenV1Web() {
  const auth = useWebHnkRuntime();
  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);
  const runtimeRef = useRef<QuestRuntime | null>(null);
  const [bundle, setBundle] = useState<RuntimeQuestBundle | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [session, setSession] = useState<Day004Session | null>(null);
  const [baseline, setBaseline] = useState<BehavioralExperimentResult | null>(null);
  const [swish, setSwish] = useState<BehavioralExperimentResult | null>(null);
  const [jachinSeconds, setJachinSeconds] = useState(0);
  const [boazSeconds, setBoazSeconds] = useState(0);
  const [patternNotices, setPatternNotices] = useState(0);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [triggerRecorded, setTriggerRecorded] = useState(false);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [voluntary, setVoluntary] = useState(false);
  const [safetyStopped, setSafetyStopped] = useState(false);
  const [sealed, setSealed] = useState<Day004Seal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    void Promise.all([catalog.requireDay(4), library.loadBundle(4)]).then(([definition, loaded]) => {
      if (!active || !loaded) return;
      const runtime = new QuestRuntime(definition);
      runtimeRef.current = runtime;
      setBundle(loaded);
      setSnapshot(runtime.start());
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : 'day004_bundle_load_failed'); });
    return () => { active = false; };
  }, []);

  const director = useMemo(() => bundle ? new ExperienceDirector(bundle.quest) : null, [bundle]);
  const directive = useMemo(() => director && snapshot?.currentPhaseId ? director.resolvePhase(snapshot.currentPhaseId, playerContext, snapshot) : null, [director, playerContext, snapshot]);

  async function ensureSession(): Promise<Day004Session | null> {
    if (session) return session;
    if (!live || !auth.client || !auth.userId) return null;
    const created = await startDay004PracticeSessionV1(auth.client, { clientSessionId: sessionKey(auth.userId), appVersion: '0.1.0-web-day004-golden-v1' });
    setSession(created);
    return created;
  }

  async function completePhase(phaseId: string): Promise<void> {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    try {
      setError(null);
      if (phaseId === 'jachin_reading' || phaseId === 'placebo_baseline') await ensureSession();
      if (phaseId === 'theta432_audio') setAudioCompleted(true);
      setSnapshot(runtime.completePhase(phaseId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'quest_phase_completion_failed'); }
  }
  function safetyStop(reason?: string): void {
    setSafetyStopped(true);
    setError(reason ? `Prática interrompida com segurança: ${reason}` : 'Prática interrompida com segurança.');
    if (runtimeRef.current) setSnapshot(runtimeRef.current.safetyStop());
  }
  function resume(): void { if (runtimeRef.current) { setError(null); setSnapshot(runtimeRef.current.resume()); } }

  async function seal(): Promise<void> {
    if (!auth.client || !session || !runtimeRef.current || !baseline || !swish || !audioCompleted || !triggerRecorded || !voluntary) return;
    if (jachinSeconds <= 0 || boazSeconds <= 0) { setError('day004_required_practice_duration_missing'); return; }
    setBusy(true); setError(null);
    try {
      const result = await sealDay004V1(auth.client, {
        evidence: {
          sessionId: session.id,
          mode: 'first_completion',
          experiment: {
            expectationBefore: baseline.before.expectation_rating ?? 5,
            bodyStateBefore: baseline.before.body_state_rating ?? 5,
            perceivedChangeAfter: baseline.after.perceived_change_rating ?? 5,
          },
          jachin: { durationSeconds: jachinSeconds },
          audio: { started: true },
          boaz: { durationSeconds: boazSeconds, patternNotices },
          middle: {
            targetStateBefore: swish.before.target_state_rating ?? 5,
            perceivedChangeAfter: swish.after.perceived_change_rating ?? 5,
          },
          soulMirror: { difficultyRating: difficulty },
          safetyStopOccurred: safetyStopped,
        },
        totalDurationSeconds: jachinSeconds + boazSeconds,
        patternNotices,
      });
      if (!result.ok) throw new Error(result.code);
      setSealed(result.response);
      setSnapshot(runtimeRef.current.confirmServerCompletion());
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'day004_completion_failed'); }
    finally { setBusy(false); }
  }

  if (!bundle || !snapshot || !director) return <main style={{ padding: 32, color: '#eee7d7', background: '#090910', minHeight: '100vh' }}>CARREGANDO DAY 004…{error ? <p>{error}</p> : null}</main>;
  if (snapshot.runState === 'SAFETY_STOP') return <main style={{ padding: 32, color: '#eee7d7', background: '#090910', minHeight: '100vh' }}><h1>Prática pausada com segurança.</h1><button onClick={resume}>RETOMAR</button></main>;
  if (snapshot.runState === 'COMPLETE') return <main style={{ padding: 32, color: '#eee7d7', background: '#090910', minHeight: '100vh' }}><p>DIA 004 · REGISTRADO</p><h1>Efeito Placebo Intencional concluído.</h1><p>{sealed?.first_completion ? `+${sealed.xp_awarded} XP canônicos.` : 'Revisita sem novo XP.'}</p><p>Day 004 V1 não concede ganho numérico de atributo.</p></main>;
  if (!directive) return <main>FASE INDISPONÍVEL.</main>;

  const phase = directive.phase;
  const texts = directive.requiresCanonicalContent ? canonicalText(bundle, directive) : [];
  const shell: React.CSSProperties = { maxWidth: 860, margin: '0 auto', padding: '28px 20px 80px', color: '#eee7d7', background: '#090910', minHeight: '100vh', fontFamily: 'system-ui' };
  const panel: React.CSSProperties = { border: '1px solid #6f5f29', borderRadius: 18, padding: 22, display: 'grid', gap: 14, background: '#111018' };

  return <main style={shell} data-hnk-theme="kether">
    <header style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginBottom: 24 }}><div><small>DIA 004 · KETHER</small><h1>EFEITO PLACEBO INTENCIONAL</h1></div><span>{live ? 'BACKEND · REVIEWED' : 'OFFLINE · PRÁTICA LOCAL'}</span></header>
    {error ? <p style={{ color: '#ffb4ab' }}>{error}</p> : null}
    <section style={panel} data-phase={phase.type}>
      <small>{phase.type} · {phase.id}</small>
      {phase.type === 'NARRATIVE' ? <><h2>Observe a expectativa como variável.</h2><p>O objetivo é executar e registrar, não provar uma causa.</p></> : null}
      {phase.type === 'TERM_REVEAL' ? <p>{(phase.terms ?? []).join(' · ')}</p> : null}
      {phase.type === 'READ' ? texts.map((text, index) => <p key={index} style={{ lineHeight: 1.75 }}>{text}</p>) : null}
      {phase.type === 'INSTRUCTION' ? (phase.content_intent ?? []).map((item) => <p key={item}>{item}</p>) : null}
      {phase.type === 'EXPERIMENT' ? <QuestBehavioralExperimentPhase directive={directive} onResult={phase.id === 'placebo_baseline' ? setBaseline : setSwish} onCompletePhase={completePhase} onSafetyStop={safetyStop} /> : null}
      {phase.type === 'FOCUS' ? <TimedPractice target={Number(phase.interaction?.duration_seconds ?? 0)} showCounter={phase.id === 'boaz_monitor'} counter={patternNotices} onCount={() => setPatternNotices((v) => v + 1)} onFinish={(seconds) => { if (phase.id === 'jachin_visualization') setJachinSeconds(seconds); if (phase.id === 'boaz_monitor') setBoazSeconds(seconds); void completePhase(phase.id); }} onSafetyStop={() => safetyStop('focus_safety_stop')} /> : null}
      {phase.type === 'AUDIO' ? <QuestAudioPhase directive={directive} onCompletePhase={completePhase} onSafetyStop={safetyStop} /> : null}
      {phase.type === 'RETURN' ? <><p>Respire naturalmente, movimente-se e confirme orientação ao ambiente.</p><button onClick={() => void completePhase(phase.id)}>ESTOU ORIENTADO · CONTINUAR</button></> : null}
      {phase.type === 'JOURNAL' && phase.id === 'boaz_trigger_journal' ? <><p>O texto do gatilho fica no seu espaço privado. O servidor recebe apenas que houve registro.</p><label><input type="checkbox" checked={triggerRecorded} onChange={(e) => setTriggerRecorded(e.target.checked)} /> Registrei o gatilho</label><button disabled={!triggerRecorded} onClick={() => void completePhase(phase.id)}>CONTINUAR</button></> : null}
      {phase.type === 'STRUCTURED_JOURNAL' ? <><p>Espelho da Alma · dificuldade percebida.</p><div>{[0,2,4,6,8,10].map((v) => <button key={v} onClick={() => setDifficulty(v)} style={{ marginRight: 6 }}>{v}</button>)}</div><button onClick={() => void completePhase(phase.id)}>CONCLUIR ESPELHO</button></> : null}
      {phase.type === 'CORRESPONDENCE_REVEAL' ? <p>{(phase.items ?? []).join(' · ')}</p> : null}
      {phase.type === 'COMPLETION' ? <><h2>Selo canônico</h2><p>O cliente nunca concede XP. O servidor valida a Evidence V1.</p><label><input type="checkbox" checked={voluntary} onChange={(e) => setVoluntary(e.target.checked)} /> Confirmo conclusão voluntária</label><button disabled={busy || !voluntary} onClick={() => void seal()}>{busy ? 'SELANDO…' : 'SELAR DAY 004'}</button></> : null}
      {!['NARRATIVE','TERM_REVEAL','READ','INSTRUCTION','EXPERIMENT','FOCUS','AUDIO','RETURN','JOURNAL','STRUCTURED_JOURNAL','CORRESPONDENCE_REVEAL','COMPLETION','UNLOCK'].includes(phase.type) ? <button onClick={() => void completePhase(phase.id)}>CONTINUAR</button> : null}
      {['NARRATIVE','TERM_REVEAL','READ','INSTRUCTION','CORRESPONDENCE_REVEAL','UNLOCK'].includes(phase.type) ? <button onClick={() => void completePhase(phase.id)}>CONTINUAR</button> : null}
    </section>
  </main>;
}

function TimedPractice({ target, showCounter, counter, onCount, onFinish, onSafetyStop }: { target: number; showCounter: boolean; counter: number; onCount: () => void; onFinish: (seconds: number) => void; onSafetyStop: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running) return; const id = window.setInterval(() => setSeconds((v) => v + 1), 1000); return () => window.clearInterval(id); }, [running]);
  return <div style={{ display: 'grid', gap: 10 }}><p>{seconds}s {target ? `/ ${target}s canônicos` : ''}</p><div><button onClick={() => setRunning((v) => !v)}>{running ? 'PAUSAR' : 'INICIAR / RETOMAR'}</button> {showCounter ? <button onClick={onCount}>PADRÃO PERCEBIDO · {counter}</button> : null}</div><button disabled={seconds <= 0} onClick={() => onFinish(seconds)}>CONCLUIR PRÁTICA</button><button onClick={onSafetyStop}>SAFETY STOP</button></div>;
}
