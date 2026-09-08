import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
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
import { useHnkAuth } from '../auth/AuthContext';
import { QuestAudioPhase } from '../../runtime/QuestAudioPhase';
import { QuestRealWorldActionPhase } from '../../runtime/QuestRealWorldActionPhase';
import { createMobileQuestSnapshotStore } from '../../runtime/quest-snapshot-store';

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
  return `hnk-mobile-d003-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function storageKeys(userId: string) {
  return {
    snapshot: `hnk:quest:d003:${userId}:snapshot:v1`,
    session: `hnk:quest:d003:${userId}:practice-session:v1`,
  };
}

export function Day003GoldenV1Mobile() {
  const auth = useHnkAuth();
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
    accessibility: { reducedMotion: false, audioEnabled: true, microphoneAvailable: false },
    offline: !live,
  }), [live]);

  useEffect(() => {
    if (!auth.userId) return;
    let active = true;
    const library = createBundledQuestLibrary();
    const catalog = createQuestCatalog(library);
    const store = createMobileQuestSnapshotStore();
    const keys = storageKeys(auth.userId);

    void Promise.all([catalog.requireDay(3), library.loadBundle(3), store.load(keys.snapshot)])
      .then(([definition, loadedBundle, saved]) => {
        if (!active || !loadedBundle) return;
        const runtime = new QuestRuntime(definition);
        runtimeRef.current = runtime;
        setBundle(loadedBundle);
        setSnapshot(saved ? runtime.restore(saved) : runtime.start());
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : 'day003_bundle_load_failed');
      });

    return () => { active = false; };
  }, [auth.userId]);

  useEffect(() => {
    if (!auth.userId || !snapshot) return;
    const store = createMobileQuestSnapshotStore();
    const key = storageKeys(auth.userId).snapshot;
    if (snapshot.runState === 'COMPLETE') void store.remove(key);
    else void store.save(key, snapshot);
  }, [auth.userId, snapshot]);

  useEffect(() => {
    if (!live || !auth.client || !auth.userId || session) return;
    const key = storageKeys(auth.userId).session;
    void SecureStore.getItemAsync(key).then(async (storedId) => {
      if (!storedId || !auth.client) return;
      try {
        const restored = await loadDay003PracticeSessionV1(auth.client, storedId);
        if (restored) setSession(restored);
        else await SecureStore.deleteItemAsync(key);
      } catch {
        await SecureStore.deleteItemAsync(key);
      }
    });
  }, [auth.client, auth.userId, live, session]);

  const director = useMemo(() => bundle ? new ExperienceDirector(bundle.quest) : null, [bundle]);
  const directive = useMemo(() => {
    if (!director || !snapshot?.currentPhaseId) return null;
    return director.resolvePhase(snapshot.currentPhaseId, playerContext, snapshot);
  }, [director, playerContext, snapshot]);

  const actionPort = useMemo(
    () => live && auth.client ? createSupabaseRealWorldActionPort(auth.client) : null,
    [auth.client, live],
  );
  const actionClientId = auth.userId ? createDay003ClientActionId(auth.userId) : 'offline-unavailable';

  async function ensureSession(): Promise<Day003Session | null> {
    if (session) return session;
    if (!live || !auth.client || !auth.userId) return null;
    const created = await startDay003PracticeSessionV1(auth.client, {
      clientSessionId: clientSessionId(auth.userId),
      appVersion: '0.1.0-mobile-day003-golden-v1',
    });
    setSession(created);
    await SecureStore.setItemAsync(storageKeys(auth.userId).session, created.id);
    return created;
  }

  async function completePhase(phaseId: string): Promise<void> {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    setError(null);
    try {
      if (phaseId === 'jachin_reading' || phaseId === 'jachin_observation') await ensureSession();
      setSnapshot(runtime.completePhase(phaseId));
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
    if (!runtime || !auth.client || !session || !realWorld || realWorld.state !== 'qualified' || !voluntary) return;
    if (jachinSeconds <= 0 || beliefsCount < 3 || !inquiryDone) {
      setError('day003_required_evidence_incomplete');
      return;
    }

    setBusy(true);
    setError(null);
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
      if (auth.userId) await SecureStore.deleteItemAsync(storageKeys(auth.userId).session);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'day003_completion_failed');
    } finally {
      setBusy(false);
    }
  }

  if (!auth.userId) return <View style={styles.center}><Text style={styles.text}>ENTRE NO ÁTRIO PARA INICIAR O DIA 003.</Text></View>;
  if (!bundle || !snapshot || !director) return <View style={styles.center}><Text style={styles.text}>CARREGANDO QUEST PACK DO DIA 003…</Text>{error ? <Text style={styles.error}>{error}</Text> : null}</View>;

  if (snapshot.runState === 'SAFETY_STOP') return (
    <View style={styles.center}>
      <Text style={styles.eyebrow}>SAFETY STOP</Text>
      <Text style={styles.title}>A jornada foi pausada.</Text>
      <Text style={styles.text}>Retome apenas quando desejar. Nenhuma janela temporal ou estado subjetivo vale mais que sua segurança.</Text>
      <Action label="RETOMAR" onPress={resume} />
    </View>
  );

  if (snapshot.runState === 'COMPLETE') return (
    <View style={styles.center}>
      <Text style={styles.eyebrow}>DIA 003 · REGISTRADO</Text>
      <Text style={styles.title}>Despolarização do Ego concluída.</Text>
      <Text style={styles.text}>{sealed?.first_completion ? `+${sealed.xp_awarded} XP canônicos.` : 'Revisita registrada sem novo XP.'}</Text>
      <Text style={styles.text}>Day 003 V1 não concede ganho numérico de atributo.</Text>
    </View>
  );

  if (!directive) return <View style={styles.center}><Text style={styles.text}>FASE INDISPONÍVEL.</Text></View>;

  const phase = directive.phase;
  const texts = directive.requiresCanonicalContent ? canonicalText(bundle, directive) : [];

  return (
    <ScrollView contentContainerStyle={styles.shell}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DIA 003 · KETHER</Text>
        <Text style={styles.headerTitle}>DESPOLARIZAÇÃO DO EGO</Text>
        <Text style={styles.status}>{live ? 'BACKEND · REVIEWED' : 'OFFLINE · LEITURA'}</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.panel}>
        <Text style={styles.eyebrow}>{phase.type} · {phase.id}</Text>

        {phase.type === 'NARRATIVE' ? <><Text style={styles.title}>Observe antes de acreditar.</Text><Text style={styles.text}>O terceiro limiar transforma certeza em objeto de investigação.</Text></> : null}
        {phase.type === 'TERM_REVEAL' ? <TagList values={phase.terms ?? []} /> : null}
        {phase.type === 'READ' ? texts.map((text, index) => <Text style={styles.canon} key={index}>{text}</Text>) : null}
        {phase.type === 'INSTRUCTION' ? (phase.content_intent ?? []).map((item) => <Text style={styles.systemText} key={item}>{item}</Text>) : null}

        {phase.type === 'FOCUS' ? (
          <TimedPractice
            target={Number(phase.interaction?.duration_seconds ?? 0)}
            showReturn={phase.id === 'jachin_observation'}
            thoughtReturns={thoughtReturns}
            onReturn={() => setThoughtReturns((value) => value + 1)}
            onFinish={(seconds) => {
              if (phase.id === 'jachin_observation') setJachinSeconds(seconds);
              void completePhase(phase.id);
            }}
            onSafetyStop={() => void safetyStop('focus_safety_stop')}
          />
        ) : null}

        {phase.type === 'RELAXATION' ? <View style={styles.system}><Text style={styles.text}>Prática voluntária e no seu ritmo. Não force músculos ou pálpebras.</Text><Action label="CONCLUIR RELAXAMENTO" onPress={() => void completePhase(phase.id)} /><Action label="SAFETY STOP" onPress={() => void safetyStop('relaxation_safety_stop')} /></View> : null}
        {phase.type === 'AUDIO' ? <QuestAudioPhase directive={directive} onCompletePhase={completePhase} onSafetyStop={safetyStop} /> : null}
        {phase.type === 'RETURN' ? <View style={styles.system}><Text style={styles.text}>Respire naturalmente, movimente-se e oriente-se ao ambiente.</Text><Action label="ESTOU ORIENTADO · CONTINUAR" onPress={() => void completePhase(phase.id)} /></View> : null}

        {phase.type === 'JOURNAL' && phase.id === 'jachin_beliefs' ? <View style={styles.system}><Text style={styles.text}>Registre as crenças no seu espaço privado. O servidor recebe apenas a contagem.</Text><Counter value={beliefsCount} onDecrease={() => setBeliefsCount((v) => Math.max(0, v - 1))} onIncrease={() => setBeliefsCount((v) => v + 1)} /><Action disabled={beliefsCount < 3} label="REGISTREI AO MENOS 3" onPress={() => void completePhase(phase.id)} /></View> : null}
        {phase.type === 'JOURNAL' && phase.id === 'boaz_inquiry' ? <View style={styles.system}><Text style={styles.text}>A resposta introspectiva permanece privada; não é tratada automaticamente como fato.</Text><Action label={inquiryDone ? 'INVESTIGAÇÃO REGISTRADA' : 'MARCAR INVESTIGAÇÃO REALIZADA'} onPress={() => setInquiryDone((value) => !value)} /><Action disabled={!inquiryDone} label="CONTINUAR" onPress={() => void completePhase(phase.id)} /></View> : null}
        {phase.type === 'STRUCTURED_JOURNAL' && phase.id === 'belief_reframe' ? <View style={styles.system}><Action label={beliefReframeDone ? 'REFRAME REGISTRADO' : 'MARCAR REFRAME CONCLUÍDO'} onPress={() => setBeliefReframeDone((value) => !value)} /><Action label="CONTINUAR" onPress={() => void completePhase(phase.id)} /></View> : null}
        {phase.type === 'STRUCTURED_JOURNAL' && phase.id === 'soul_mirror' ? <View style={styles.system}><Text style={styles.text}>Espelho da Alma · dificuldade percebida.</Text><Rating value={difficulty} onChange={setDifficulty} /><Action label="CONCLUIR ESPELHO" onPress={() => void completePhase(phase.id)} /></View> : null}

        {phase.type === 'REAL_WORLD_ACTION' ? actionPort ? (
          <QuestRealWorldActionPhase
            directive={directive}
            port={actionPort}
            clientActionId={actionClientId}
            onCompletePhase={completePhase}
            onSafetyStop={safetyStop}
            onSnapshotChange={setRealWorld}
          />
        ) : <Text style={styles.text}>Entre e mantenha conexão para iniciar ou verificar a janela servidor-side.</Text> : null}

        {phase.type === 'CORRESPONDENCE_REVEAL' ? <TagList values={phase.items ?? []} /> : null}

        {phase.type === 'COMPLETION' ? <View style={styles.system}><Text style={styles.title}>Selo canônico</Text><Text style={styles.text}>O cliente nunca concede XP. O servidor valida a ação qualificada, Evidence, sequência e idempotência.</Text><Action label={voluntary ? 'CONCLUSÃO VOLUNTÁRIA CONFIRMADA' : 'CONFIRMAR CONCLUSÃO VOLUNTÁRIA'} onPress={() => setVoluntary((value) => !value)} /><Action disabled={!live || !session || !realWorld || realWorld.state !== 'qualified' || !voluntary || busy} label={busy ? 'SELANDO…' : 'SELAR DIA 003'} onPress={() => void seal()} /></View> : null}

        {phase.type === 'UNLOCK' ? <View style={styles.system}><Text style={styles.title}>Vehuiah · 3/5</Text><Text style={styles.text}>Nenhum fragmento é concedido antes de 5/5.</Text></View> : null}

        {!['FOCUS','RELAXATION','AUDIO','RETURN','JOURNAL','STRUCTURED_JOURNAL','REAL_WORLD_ACTION','COMPLETION'].includes(phase.type) ? <Action label="CONTINUAR" onPress={() => void completePhase(phase.id)} /> : null}
      </View>
    </ScrollView>
  );
}

function TimedPractice({ target, showReturn, thoughtReturns, onReturn, onFinish, onSafetyStop }: {
  target: number;
  showReturn: boolean;
  thoughtReturns: number;
  onReturn: () => void;
  onFinish: (seconds: number) => void;
  onSafetyStop: () => void;
}) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (startedAt == null) return;
    const timer = setInterval(() => setElapsed(Math.max(1, Math.floor((Date.now() - startedAt) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return <View style={styles.practice}><Text style={styles.title}>Prática de observação</Text><Text style={styles.text}>Alvo canônico: {target > 0 ? `${Math.round(target / 60)} min` : 'ritmo livre'}. Você pode interromper diante de desconforto.</Text><Text style={styles.timer}>{elapsed}s</Text>{startedAt == null ? <Action label="INICIAR PRÁTICA" onPress={() => { setStartedAt(Date.now()); setElapsed(1); }} /> : null}{showReturn ? <Action label={`PENSAMENTO PERCEBIDO · ${thoughtReturns}`} onPress={onReturn} /> : null}<Action disabled={elapsed <= 0} label="CONCLUIR PRÁTICA" onPress={() => onFinish(elapsed)} /><Action label="SAFETY STOP" onPress={onSafetyStop} /></View>;
}

function Action({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

function Counter({ value, onDecrease, onIncrease }: { value: number; onDecrease: () => void; onIncrease: () => void }) {
  return <View style={styles.row}><Action label="−" onPress={onDecrease} /><Text style={styles.counter}>{value}</Text><Action label="+" onPress={onIncrease} /></View>;
}

function Rating({ value, onChange }: { value: number | null; onChange: (value: number) => void }) {
  return <View style={styles.row}>{[0,1,2,3,4,5,6,7,8,9,10].map((item) => <Pressable key={item} onPress={() => onChange(item)} style={[styles.rating, value === item && styles.ratingActive]}><Text style={styles.buttonText}>{item}</Text></Pressable>)}</View>;
}

function TagList({ values }: { values: string[] }) {
  return <View style={styles.row}>{values.map((value) => <View style={styles.tag} key={value}><Text style={styles.tagText}>{value}</Text></View>)}</View>;
}

const styles = StyleSheet.create({
  shell: { minHeight: '100%', padding: 20, gap: 16, backgroundColor: '#07080d' },
  center: { flex: 1, minHeight: 500, justifyContent: 'center', padding: 24, gap: 14, backgroundColor: '#07080d' },
  header: { gap: 4, paddingVertical: 14 },
  headerTitle: { color: 'white', fontSize: 26, fontWeight: '800' },
  status: { color: 'rgba(255,255,255,0.58)', fontSize: 11 },
  panel: { gap: 16, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.035)' },
  system: { gap: 12, padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)' },
  practice: { gap: 12 },
  eyebrow: { color: 'rgba(255,255,255,0.62)', fontSize: 11, letterSpacing: 1.5 },
  title: { color: 'white', fontSize: 22, fontWeight: '700' },
  text: { color: 'rgba(255,255,255,0.82)', lineHeight: 21 },
  canon: { color: 'rgba(255,255,255,0.92)', lineHeight: 24 },
  systemText: { color: 'rgba(255,255,255,0.78)', lineHeight: 21 },
  error: { color: '#ffb4b4' },
  timer: { color: 'white', fontSize: 34, fontWeight: '700', fontVariant: ['tabular-nums'] },
  button: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  buttonText: { color: 'white', fontSize: 12, fontWeight: '700', letterSpacing: 0.7 },
  disabled: { opacity: 0.4 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  counter: { color: 'white', fontSize: 22, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  rating: { minWidth: 38, minHeight: 38, justifyContent: 'center', alignItems: 'center', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  ratingActive: { backgroundColor: 'rgba(255,255,255,0.16)', borderColor: 'rgba(255,255,255,0.75)' },
  tag: { paddingVertical: 7, paddingHorizontal: 11, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  tagText: { color: 'rgba(255,255,255,0.84)', fontSize: 12 },
});
