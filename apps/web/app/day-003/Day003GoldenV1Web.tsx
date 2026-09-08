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
import type { RealWorldActionSnapshot } from '@hnk/real-world-action-contract';
import {
  createDay003ClientActionId,
  createSupabaseRealWorldActionPort,
  loadDay003PracticeSessionV1,
  sealDay003V1,
  startDay003PracticeSessionV1,
} from '@hnk/supabase-client';
import { QuestAudioPhase } from '../_runtime/QuestAudioPhase';
import { QuestRealWorldActionPhase } from '../_runtime/QuestRealWorldActionPhase';
import { createWebQuestSnapshotStore } from '../_runtime/quest-snapshot-store';
import { useWebHnkRuntime } from '../_runtime/WebHnkRuntime';
import styles from './day003-golden-v1.module.css';

type Day003Session = NonNullable<Awaited<ReturnType<typeof loadDay003PracticeSessionV1>>>;
type Day003Seal = Extract<Awaited<ReturnType<typeof sealDay003V1>>, { ok: true }>['response'];

function canonicalText(bundle: RuntimeQuestBundle, directive: ExperienceDirective): string[] {
  return (directive.phase.source.block_ids ?? []).map((id) => {
    const block = bundle.canon.blocks.find((entry) => entry.id === id);
    if (!block) throw new Error(`canonical_block_missing:${id}`);
    return block.text;
  });
}

function clientSessionId(userId: string): string {
  return `hnk-web-d003-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function storageKeys(userId: string) {
  return {
    snapshot: `hnk:quest:d003:${userId}:snapshot:v1`,
    session: `hnk:quest:d003:${userId}:practice-session:v1`,
  };
}

export function Day003GoldenV1Web() {
  const auth = useWebHnkRuntime();
  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);
  const runtimeRef = useRef<QuestRuntime | null>(null);
  const [bundle, setBundle] = useState<RuntimeQuestBundle | null>(null);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
  const [session, setSession] = useState<Day003Session | null>(null);
  const [jachinSeconds, setJachinSeconds] = useState(0);
  const [thoughtReturns, setThoughtReturns] = useState(0);
  const [beliefsCount, setBeliefsCount] = useState(0);
  const [beliefReframeDone, setBeliefReframeDone] = useState(false);
  const [inquiryDone, setInquiryDone] = useState(false);
  const [realWorld, setRealWorld] = useState<RealWorldActionSnapshot | null>(null);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [voluntary, setVoluntary] = useState(false);
  const [safetyStopped, setSafetyStopped] = useState(false);
  const [sealed, setSealed] = useState<Day003Seal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!auth.userId) return;
    let active = true;
    const library = createBundledQuestLibrary();
    const catalog = createQuestCatalog(library);
    const store = createWebQuestSnapshotStore();
    const keys = storageKeys(auth.userId);

    void Promise.all([catalog.requireDay(3), library.loadBundle(3), store.load(keys.snapshot)]).then(([definition, loadedBundle, saved]) => {
      if (!active || !loadedBundle) return;
      const runtime = new QuestRuntime(definition);
      runtimeRef.current = runtime;
      setBundle(loadedBundle);
      setSnapshot(saved ? runtime.restore(saved) : runtime.start());
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : 'day003_bundle_load_failed');
    });
    return () => { active = false; };
  }, [auth.userId]);

  useEffect(() => {
    if (!auth.userId || !snapshot) return;
    const store = createWebQuestSnapshotStore();
    const key = storageKeys(auth.userId).snapshot;
    if (snapshot.runState === 'COMPLETE') void store.remove(key);
    else void store.save(key, snapshot);
  }, [auth.userId, snapshot]);

  useEffect(() => {
    if (!live || !auth.client || !auth.userId || session) return;
    const storedId = window.localStorage.getItem(storageKeys(auth.userId).session);
    if (!storedId) return;
    void loadDay003PracticeSessionV1(auth.client, storedId).then((restored) => {
      if (restored) setSession(restored);
      else window.localStorage.removeItem(storageKeys(auth.userId!).session);
    }).catch(() => window.localStorage.removeItem(storageKeys(auth.userId!).session));
  }, [auth.client, auth.userId, live, session]);

  const director = useMemo(() => bundle ? new ExperienceDirector(bundle.quest) : null, [bundle]);
  const directive = useMemo(() => {
    if (!director || !snapshot?.currentPhaseId) return null;
    return director.resolvePhase(snapshot.currentPhaseId, playerContext, snapshot);
  }, [director, playerContext, snapshot]);

  const actionPort = useMemo(() => live && auth.client ? createSupabaseRealWorldActionPort(auth.client) : null, [auth.client, live]);
  const actionClientId = auth.userId ? createDay003ClientActionId(auth.userId) : 'offline-unavailable';

  async function ensureSession(): Promise<Day003Session | null> {
    if (session) return session;
    if (!live || !auth.client || !auth.userId) return null;
    const created = await startDay003PracticeSessionV1(auth.client, {
      clientSessionId: clientSessionId(auth.userId),
      appVersion: '0.1.0-web-day003-golden-v1',
    });
    setSession(created);
    window.localStorage.setItem(storageKeys(auth.userId).session, created.id);
    return created;
  }

  async function completePhase(phaseId: string): Promise<void> {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    setError(null);
    try {
      if (phaseId === 'jachin_reading' || phaseId === 'jachin_observation') await ensureSession();
      setSnapshot(runtime.completePhase(phaseId));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'quest_phase_completion_failed');
    }
  }

  async function safetyStop(reason?: string) {
    setSafetyStopped(true);
    setError(reason ? `Prática interrompida com segurança: ${reason}` : 'Prática interrompida com segurança.');
    const runtime = runtimeRef.current;
    if (runtime) setSnapshot(runtime.safetyStop());
  }

  function resume() {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    setError(null);
    setSnapshot(runtime.resume());
  }

  async function seal() {
    const runtime = runtimeRef.current;
    if (!runtime || !auth.client || !session || !realWorld || realWorld.state !== 'qualified' || !voluntary) return;
    if (jachinSeconds <= 0 || beliefsCount < 3 || !inquiryDone) {
      setError('day003_required_evidence_incomplete');
      return;
    }
    setBusy(true); setError(null);
    try {
      const result = await sealDay003V1(auth.client, {
        evidence: {
          sessionId: session.id,
          mode: 'first_completion',
          jachin: {
            durationSeconds: jachinSeconds,
            thoughtReturns,
            beliefsRecordedCount: beliefsCount,
            beliefReframeCompleted: beliefReframeDone,
          },
          boaz: {
            realWorldActionId: realWorld.id,
            restartCount: realWorld.restart_count,
          },
          middle: {},
          soulMirror: { difficultyRating: difficulty },
          safetyStopOccurred: safetyStopped,
        },
        totalDurationSeconds: jachinSeconds,
        thoughtReturns,
        restartCount: realWorld.restart_count,
      });
      if (!result.ok) throw new Error(result.code);
      setSealed(result.response);
      setSnapshot(runtime.confirmServerCompletion());
      if (auth.userId) window.localStorage.removeItem(storageKeys(auth.userId).session);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'day003_completion_failed');
    } finally { setBusy(false); }
  }

  if (!auth.userId) return <main className={styles.shell}><p>ENTRE NO ÁTRIO PARA INICIAR O DIA 003.</p></main>;
  if (!bundle || !snapshot || !director) return <main className={styles.shell}><p>CARREGANDO QUEST PACK DO DIA 003…</p>{error ? <p className={styles.error}>{error}</p> : null}</main>;

  if (snapshot.runState === 'SAFETY_STOP') return (
    <main className={styles.shell}><section className={styles.panel}><p className={styles.eyebrow}>SAFETY STOP</p><h1>A jornada foi pausada.</h1><p>Retome apenas quando desejar. Nenhuma janela temporal, sensação ou estado subjetivo vale mais que sua segurança.</p><button onClick={resume}>RETOMAR</button></section></main>
  );

  if (snapshot.runState === 'COMPLETE') return (
    <main className={styles.shell}><section className={styles.panel}><p className={styles.eyebrow}>DIA 003 · REGISTRADO</p><h1>Despolarização do Ego concluída.</h1><p>{sealed?.first_completion ? `+${sealed.xp_awarded} XP canônicos.` : 'Revisita registrada sem novo XP.'}</p><p>Day 003 V1 não concede ganho numérico de atributo.</p></section></main>
  );

  if (!directive) return <main className={styles.shell}><p>FASE INDISPONÍVEL.</p></main>;
  const phase = directive.phase;
  const texts = directive.requiresCanonicalContent ? canonicalText(bundle, directive) : [];

  return (
    <main className={styles.shell} data-hnk-theme="kether">
      <header className={styles.header}><div><span>DIA 003 · KETHER</span><strong>DESPOLARIZAÇÃO DO EGO</strong></div><span>{live ? 'BACKEND · REVIEWED' : 'OFFLINE · LEITURA'}</span></header>
      {error ? <p className={styles.error}>{error}</p> : null}
      <section className={styles.panel} data-phase={phase.type}>
        <p className={styles.eyebrow}>{phase.type} · {phase.id}</p>

        {phase.type === 'NARRATIVE' ? <><h1>Observe antes de acreditar.</h1><p>O terceiro limiar transforma certeza em objeto de investigação.</p></> : null}
        {phase.type === 'TERM_REVEAL' ? <div className={styles.tags}>{(phase.terms ?? []).map((term) => <span key={term}>{term}</span>)}</div> : null}
        {phase.type === 'READ' ? <div className={styles.canon}>{texts.map((text,index) => <p key={index}>{text}</p>)}</div> : null}
        {phase.type === 'INSTRUCTION' ? <div className={styles.system}>{(phase.content_intent ?? []).map((item) => <p key={item}>{item}</p>)}</div> : null}

        {phase.type === 'FOCUS' ? <TimedPractice target={Number(phase.interaction?.duration_seconds ?? 0)} showReturn={phase.id === 'jachin_observation'} thoughtReturns={thoughtReturns} onReturn={() => setThoughtReturns((v) => v + 1)} onFinish={(seconds) => { if (phase.id === 'jachin_observation') setJachinSeconds(seconds); void completePhase(phase.id); }} onSafetyStop={() => void safetyStop('focus_safety_stop')} /> : null}
        {phase.type === 'RELAXATION' ? <div className={styles.system}><p>Prática voluntária e no seu ritmo. Não force músculos ou pálpebras.</p><button onClick={() => void completePhase(phase.id)}>CONCLUIR RELAXAMENTO</button><button onClick={() => void safetyStop('relaxation_safety_stop')}>SAFETY STOP</button></div> : null}
        {phase.type === 'AUDIO' ? <QuestAudioPhase directive={directive} onCompletePhase={completePhase} onSafetyStop={safetyStop} /> : null}
        {phase.type === 'RETURN' ? <div className={styles.system}><p>Respire naturalmente, movimente-se e oriente-se ao ambiente.</p><button onClick={() => void completePhase(phase.id)}>ESTOU ORIENTADO · CONTINUAR</button></div> : null}

        {phase.type === 'JOURNAL' && phase.id === 'jachin_beliefs' ? <div className={styles.system}><p>Registre as crenças no seu espaço privado. O servidor recebe apenas a contagem.</p><div className={styles.counter}><button onClick={() => setBeliefsCount((v) => Math.max(0,v-1))}>−</button><strong>{beliefsCount}</strong><button onClick={() => setBeliefsCount((v) => v+1)}>+</button></div><button disabled={beliefsCount < 3} onClick={() => void completePhase(phase.id)}>REGISTREI AO MENOS 3</button></div> : null}
        {phase.type === 'JOURNAL' && phase.id === 'boaz_inquiry' ? <div className={styles.system}><p>A resposta introspectiva permanece privada; não é tratada automaticamente como fato.</p><label><input type="checkbox" checked={inquiryDone} onChange={(e) => setInquiryDone(e.target.checked)} /> Realizei a investigação</label><button disabled={!inquiryDone} onClick={() => void completePhase(phase.id)}>CONTINUAR</button></div> : null}
        {phase.type === 'STRUCTURED_JOURNAL' && phase.id === 'belief_reframe' ? <div className={styles.system}><label><input type="checkbox" checked={beliefReframeDone} onChange={(e) => setBeliefReframeDone(e.target.checked)} /> Transformei uma certeza em pergunta</label><button onClick={() => void completePhase(phase.id)}>CONTINUAR</button></div> : null}
        {phase.type === 'STRUCTURED_JOURNAL' && phase.id === 'soul_mirror' ? <div className={styles.system}><p>Espelho da Alma · dificuldade percebida.</p><div className={styles.rating}>{[0,1,2,3,4,5,6,7,8,9,10].map((v) => <button key={v} data-active={difficulty===v} onClick={() => setDifficulty(v)}>{v}</button>)}</div><button onClick={() => void completePhase(phase.id)}>CONCLUIR ESPELHO</button></div> : null}

        {phase.type === 'REAL_WORLD_ACTION' ? actionPort ? <QuestRealWorldActionPhase directive={directive} port={actionPort} clientActionId={actionClientId} onCompletePhase={completePhase} onSafetyStop={safetyStop} onSnapshotChange={setRealWorld} /> : <p>Entre e mantenha conexão para iniciar ou verificar a janela servidor-side.</p> : null}
        {phase.type === 'CORRESPONDENCE_REVEAL' ? <div className={styles.tags}>{(phase.items ?? []).map((item) => <span key={item}>{item}</span>)}</div> : null}

        {phase.type === 'COMPLETION' ? <div className={styles.system}><h2>Selo canônico</h2><p>O Completion Contract Day 003 permanece em revisão até a ativação final. O cliente nunca concede XP.</p><label><input type="checkbox" checked={voluntary} onChange={(e) => setVoluntary(e.target.checked)} /> Confirmo a conclusão voluntária.</label><button disabled={!live || !session || realWorld?.state !== 'qualified' || !voluntary || busy} onClick={() => void seal()}>{busy ? 'VALIDANDO…' : 'SOLICITAR SELO DAY 003'}</button></div> : null}
        {phase.type === 'UNLOCK' ? <div className={styles.system}><h2>Vehuiah · 3/5</h2><p>Ainda não há fragmento; ele chega em 5/5.</p></div> : null}

        {!['FOCUS','RELAXATION','AUDIO','RETURN','JOURNAL','STRUCTURED_JOURNAL','REAL_WORLD_ACTION','COMPLETION'].includes(phase.type) ? <button className={styles.primary} onClick={() => void completePhase(phase.id)}>CONTINUAR</button> : null}
      </section>
    </main>
  );
}

function TimedPractice({ target, showReturn, thoughtReturns, onReturn, onFinish, onSafetyStop }: { target:number; showReturn:boolean; thoughtReturns:number; onReturn:()=>void; onFinish:(seconds:number)=>void; onSafetyStop:()=>void }) {
  const [startedAt,setStartedAt]=useState<number|null>(null); const [elapsed,setElapsed]=useState(0);
  useEffect(()=>{ if(startedAt==null)return; const id=window.setInterval(()=>setElapsed(Math.max(1,Math.floor((Date.now()-startedAt)/1000))),1000); return()=>window.clearInterval(id); },[startedAt]);
  return <div className={styles.practice}><p>Alvo canônico: {target ? `${Math.round(target/60)} min` : 'no seu ritmo'}.</p><strong>{elapsed}s</strong>{startedAt==null?<button onClick={()=>{setStartedAt(Date.now());setElapsed(1);}}>INICIAR</button>:null}{showReturn?<button onClick={onReturn}>PENSAMENTO PERCEBIDO · {thoughtReturns}</button>:null}<button disabled={elapsed<=0 && target>0} onClick={()=>onFinish(Math.max(1,elapsed))}>CONCLUIR PRÁTICA</button><button onClick={onSafetyStop}>SAFETY STOP</button></div>;
}
