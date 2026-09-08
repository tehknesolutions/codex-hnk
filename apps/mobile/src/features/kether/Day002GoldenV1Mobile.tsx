import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { useHnkAuth } from '../auth/AuthContext';
import { QuestAudioPhase } from '../../runtime/QuestAudioPhase';

type Day002Session = Awaited<ReturnType<typeof startDay002PracticeSessionV1>>;
type Day002Seal = Extract<Awaited<ReturnType<typeof sealDay002V1>>, { ok: true }>['response'];
type PracticeDurations = { jachin: number; boaz: number; middle: number };

function sessionKey(userId: string): string {
  return `hnk-mobile-d002-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function canonicalText(bundle: RuntimeQuestBundle, directive: ExperienceDirective): string[] {
  return (directive.phase.source.block_ids ?? []).map((id) => {
    const block = bundle.canon.blocks.find((entry) => entry.id === id);
    if (!block) throw new Error(`canonical_block_missing:${id}`);
    return block.text;
  });
}

export function Day002GoldenV1Mobile() {
  const auth = useHnkAuth();
  const runtimeRef = useRef<QuestRuntime | null>(null);
  const [bundle, setBundle] = useState<RuntimeQuestBundle | null>(null);
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
    accessibility: { reducedMotion: false, audioEnabled: true, microphoneAvailable: false },
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
      clientSessionId: sessionKey(auth.userId),
      appVersion: '0.4.1-mobile-day002-golden-v1',
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
    return <View style={styles.center}><Text style={styles.text}>CARREGANDO QUEST PACK DO DIA 002…</Text>{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
  }

  if (snapshot.runState === 'SAFETY_STOP') {
    return (
      <View style={styles.center}>
        <Text style={styles.eyebrow}>SAFETY STOP</Text>
        <Text style={styles.title}>A prática foi interrompida.</Text>
        <Text style={styles.text}>Movimente-se, respire naturalmente e retome apenas quando desejar.</Text>
        <Action label="RETOMAR DA ÚLTIMA FASE" onPress={resume} />
      </View>
    );
  }

  if (snapshot.runState === 'COMPLETE') {
    return (
      <View style={styles.center}>
        <Text style={styles.eyebrow}>DIA 002 · REGISTRADO</Text>
        <Text style={styles.title}>Asana do Louco concluído.</Text>
        <Text style={styles.text}>{sealed?.first_completion ? `+${sealed.xp_awarded} XP canônicos.` : 'Revisita registrada sem novo XP.'}</Text>
        <Text style={styles.text}>Disciplina é atualizada pelo servidor conforme a Matriz de Progressão V1.</Text>
      </View>
    );
  }

  if (!directive) return <View style={styles.center}><Text style={styles.text}>FASE INDISPONÍVEL.</Text></View>;

  const phase = directive.phase;
  const texts = directive.requiresCanonicalContent ? canonicalText(bundle, directive) : [];

  return (
    <ScrollView contentContainerStyle={styles.shell}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>DIA 002 · KETHER</Text>
        <Text style={styles.headerTitle}>ASANA DO LOUCO</Text>
        <Text style={styles.status}>{live ? 'BACKEND V2 · ATIVO' : 'OFFLINE · PRÁTICA LOCAL'}</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.panel}>
        <Text style={styles.eyebrow}>{phase.type} · {phase.id}</Text>

        {phase.type === 'NARRATIVE' ? <><Text style={styles.title}>O segundo limiar de Kether.</Text><Text style={styles.text}>Presença, corpo e impulso tornam-se matéria de observação.</Text></> : null}

        {phase.type === 'TERM_REVEAL' ? <TagList values={phase.terms ?? []} /> : null}

        {phase.type === 'READ' ? texts.map((text, index) => <Text style={styles.canon} key={index}>{text}</Text>) : null}

        {phase.type === 'INSTRUCTION' ? (phase.content_intent ?? []).map((item) => <Text style={styles.systemText} key={item}>{item}</Text>) : null}

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

        {phase.type === 'AUDIO' ? <QuestAudioPhase directive={directive} onCompletePhase={completePhase} onSafetyStop={safetyStop} /> : null}

        {phase.type === 'RETURN' ? <Action label="ESTOU ORIENTADO · CONTINUAR" onPress={() => void completePhase(phase.id)} /> : null}

        {phase.type === 'JOURNAL' ? (
          <View style={styles.systemBox}>
            <Text style={styles.text}>O texto íntimo pertence ao Vault. A Evidence registra apenas que a reflexão estruturada foi feita.</Text>
            <Action label={reflectionDone ? 'REFLEXÃO REGISTRADA ✓' : 'MARCAR REFLEXÃO COMO CONCLUÍDA'} onPress={() => setReflectionDone(true)} />
            <Action label="CONTINUAR" disabled={!reflectionDone} onPress={() => void completePhase(phase.id)} />
          </View>
        ) : null}

        {phase.type === 'STRUCTURED_JOURNAL' ? (
          <View style={styles.systemBox}>
            <Text style={styles.text}>Dificuldade percebida · 0–10</Text>
            <View style={styles.row}>{[0,1,2,3,4,5,6,7,8,9,10].map((value) => <Pressable key={value} onPress={() => setDifficulty(value)} style={[styles.rating, difficulty === value && styles.ratingActive]}><Text style={styles.text}>{value}</Text></Pressable>)}</View>
            <Action label="CONCLUIR ESPELHO" onPress={() => void completePhase(phase.id)} />
          </View>
        ) : null}

        {phase.type === 'CORRESPONDENCE_REVEAL' ? <TagList values={phase.items ?? []} /> : null}

        {phase.type === 'COMPLETION' ? (
          <View style={styles.systemBox}>
            <Text style={styles.text}>O servidor valida sequência, Evidence, contrato e idempotência. O cliente não concede XP nem atributo.</Text>
            <Action label={voluntary ? 'CONCLUSÃO VOLUNTÁRIA ✓' : 'CONFIRMAR CONCLUSÃO VOLUNTÁRIA'} onPress={() => setVoluntary(true)} />
            <Action label={busy ? 'SELANDO…' : 'SELAR DIA 002'} disabled={!live || !session || !reflectionDone || !voluntary || busy} onPress={() => void seal()} />
          </View>
        ) : null}

        {phase.type === 'UNLOCK' ? <><Text style={styles.title}>Vehuiah · 2/5</Text><Text style={styles.text}>Nenhum fragmento é concedido até 5/5.</Text></> : null}

        {!['FOCUS','AUDIO','RETURN','JOURNAL','STRUCTURED_JOURNAL','COMPLETION'].includes(phase.type) ? <Action label="CONTINUAR" onPress={() => void completePhase(phase.id)} /> : null}
      </View>
    </ScrollView>
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
    const timer = setInterval(() => setElapsed(Math.max(1, Math.floor((Date.now() - startedAt) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return (
    <View style={styles.systemBox}>
      <Text style={styles.title}>{phaseId === 'boaz_asana' ? 'Imobilidade consciente' : 'Prática de foco'}</Text>
      <Text style={styles.text}>Alvo canônico: {Math.round(target / 60)} min. Movimento é permitido se houver desconforto.</Text>
      <Text style={styles.timer}>{elapsed}s</Text>
      {startedAt == null ? <Action label="INICIAR PRÁTICA" onPress={() => { setStartedAt(Date.now()); setElapsed(1); }} /> : null}
      {onImpulse ? <Action label={`IMPULSO PERCEBIDO · ${impulseCount ?? 0}`} onPress={onImpulse} /> : null}
      <Action label="CONCLUIR ESTA PRÁTICA" disabled={elapsed <= 0} onPress={() => onFinish(elapsed)} />
      <Action label="SAFETY STOP" onPress={onSafetyStop} />
    </View>
  );
}

function TagList({ values }: { values: string[] }) {
  return <View style={styles.row}>{values.map((value) => <View style={styles.tag} key={value}><Text style={styles.text}>{value}</Text></View>)}</View>;
}

function Action({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  shell: { minHeight: '100%', padding: 18, gap: 14, backgroundColor: '#06070b' },
  center: { flex: 1, justifyContent: 'center', gap: 14, padding: 24, backgroundColor: '#06070b' },
  header: { gap: 4, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.14)' },
  headerTitle: { color: '#f6f0df', fontSize: 18, fontWeight: '700' },
  status: { color: '#f6f0df', opacity: 0.65, fontSize: 10, letterSpacing: 1.2 },
  panel: { gap: 14, padding: 18, borderWidth: 1, borderColor: 'rgba(217,183,99,0.24)', borderRadius: 18, backgroundColor: '#0a0b13' },
  eyebrow: { color: '#f6f0df', opacity: 0.65, fontSize: 10, letterSpacing: 1.5 },
  title: { color: '#f6f0df', fontSize: 24, fontWeight: '600' },
  text: { color: '#f6f0df', lineHeight: 21 },
  canon: { color: '#f6f0df', lineHeight: 23, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(217,183,99,0.55)' },
  systemText: { color: '#f6f0df', lineHeight: 21, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  systemBox: { gap: 10, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 999 },
  rating: { minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 999 },
  ratingActive: { backgroundColor: 'rgba(217,183,99,0.18)', borderColor: 'rgba(217,183,99,0.75)' },
  button: { minHeight: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999 },
  buttonText: { color: '#f6f0df', fontWeight: '700', fontSize: 12, letterSpacing: 0.7 },
  disabled: { opacity: 0.4 },
  timer: { color: '#f6f0df', fontSize: 42, fontWeight: '300' },
  error: { color: '#ffb4b4' },
});
