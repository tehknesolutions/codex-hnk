import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { useHnkAuth } from '../auth/AuthContext';
import { QuestAudioPhase } from '../../runtime/QuestAudioPhase';
import { QuestBehavioralExperimentPhase, type BehavioralExperimentResult } from '../../runtime/QuestBehavioralExperimentPhase';

type Day004Session = Awaited<ReturnType<typeof startDay004PracticeSessionV1>>;
type Day004Seal = Extract<Awaited<ReturnType<typeof sealDay004V1>>, { ok: true }>['response'];

function canonicalText(bundle: RuntimeQuestBundle, directive: ExperienceDirective): string[] {
  return (directive.phase.source.block_ids ?? []).map((id) => {
    const block = bundle.canon.blocks.find((entry) => entry.id === id);
    if (!block) throw new Error(`canonical_block_missing:${id}`);
    return block.text;
  });
}
function sessionKey(userId: string): string { return `hnk-mobile-d004-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

export function Day004GoldenV1Mobile() {
  const auth = useHnkAuth();
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

  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);
  const playerContext = useMemo<PlayerContext>(() => ({ mediationMode: 'HNK_CANONICAL', accessibility: { reducedMotion: false, audioEnabled: true, microphoneAvailable: false }, offline: !live }), [live]);

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
    const created = await startDay004PracticeSessionV1(auth.client, { clientSessionId: sessionKey(auth.userId), appVersion: '0.1.0-mobile-day004-golden-v1' });
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
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'quest_phase_completion_failed'); }
  }
  async function safetyStop(reason?: string): Promise<void> {
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

  if (!bundle || !snapshot || !director) return <View style={styles.center}><Text style={styles.text}>CARREGANDO DAY 004…</Text>{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
  if (snapshot.runState === 'SAFETY_STOP') return <View style={styles.center}><Text style={styles.title}>Prática pausada com segurança.</Text><Action label="RETOMAR" onPress={resume} /></View>;
  if (snapshot.runState === 'COMPLETE') return <View style={styles.center}><Text style={styles.eyebrow}>DIA 004 · REGISTRADO</Text><Text style={styles.title}>Efeito Placebo Intencional concluído.</Text><Text style={styles.text}>{sealed?.first_completion ? `+${sealed.xp_awarded} XP canônicos.` : 'Revisita sem novo XP.'}</Text><Text style={styles.text}>Day 004 V1 não concede ganho numérico de atributo.</Text></View>;
  if (!directive) return <View style={styles.center}><Text style={styles.text}>FASE INDISPONÍVEL.</Text></View>;

  const phase = directive.phase;
  const texts = directive.requiresCanonicalContent ? canonicalText(bundle, directive) : [];

  return <ScrollView contentContainerStyle={styles.shell}>
    <View style={styles.header}><Text style={styles.eyebrow}>DIA 004 · KETHER</Text><Text style={styles.headerTitle}>EFEITO PLACEBO INTENCIONAL</Text><Text style={styles.status}>{live ? 'BACKEND · REVIEWED' : 'OFFLINE · PRÁTICA LOCAL'}</Text></View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>{phase.type} · {phase.id}</Text>
      {phase.type === 'NARRATIVE' ? <><Text style={styles.title}>Observe a expectativa como variável.</Text><Text style={styles.text}>Execute e registre; não transforme a experiência em prova causal.</Text></> : null}
      {phase.type === 'TERM_REVEAL' ? <Text style={styles.text}>{(phase.terms ?? []).join(' · ')}</Text> : null}
      {phase.type === 'READ' ? texts.map((text, index) => <Text style={styles.canon} key={index}>{text}</Text>) : null}
      {phase.type === 'INSTRUCTION' ? (phase.content_intent ?? []).map((item) => <Text style={styles.systemText} key={item}>{item}</Text>) : null}
      {phase.type === 'EXPERIMENT' ? <QuestBehavioralExperimentPhase directive={directive} onResult={phase.id === 'placebo_baseline' ? setBaseline : setSwish} onCompletePhase={completePhase} onSafetyStop={safetyStop} /> : null}
      {phase.type === 'FOCUS' ? <TimedPractice target={Number(phase.interaction?.duration_seconds ?? 0)} showCounter={phase.id === 'boaz_monitor'} counter={patternNotices} onCount={() => setPatternNotices((v) => v + 1)} onFinish={(seconds) => { if (phase.id === 'jachin_visualization') setJachinSeconds(seconds); if (phase.id === 'boaz_monitor') setBoazSeconds(seconds); void completePhase(phase.id); }} onSafetyStop={() => void safetyStop('focus_safety_stop')} /> : null}
      {phase.type === 'AUDIO' ? <QuestAudioPhase directive={directive} onCompletePhase={completePhase} onSafetyStop={safetyStop} /> : null}
      {phase.type === 'RETURN' ? <><Text style={styles.systemText}>Respire naturalmente, movimente-se e confirme orientação ao ambiente.</Text><Action label="ESTOU ORIENTADO · CONTINUAR" onPress={() => void completePhase(phase.id)} /></> : null}
      {phase.type === 'JOURNAL' && phase.id === 'boaz_trigger_journal' ? <><Text style={styles.systemText}>O gatilho fica no Vault; o servidor recebe apenas a confirmação estruturada.</Text><Action label={triggerRecorded ? 'GATILHO REGISTRADO ✓' : 'CONFIRMAR REGISTRO DO GATILHO'} onPress={() => setTriggerRecorded((v) => !v)} /><Action disabled={!triggerRecorded} label="CONTINUAR" onPress={() => void completePhase(phase.id)} /></> : null}
      {phase.type === 'STRUCTURED_JOURNAL' ? <><Text style={styles.systemText}>Espelho da Alma · dificuldade percebida.</Text><View style={styles.scale}>{[0,2,4,6,8,10].map((v) => <Pressable key={v} onPress={() => setDifficulty(v)} style={[styles.chip, difficulty === v && styles.activeChip]}><Text style={styles.text}>{v}</Text></Pressable>)}</View><Action label="CONCLUIR ESPELHO" onPress={() => void completePhase(phase.id)} /></> : null}
      {phase.type === 'CORRESPONDENCE_REVEAL' ? <Text style={styles.text}>{(phase.items ?? []).join(' · ')}</Text> : null}
      {phase.type === 'COMPLETION' ? <><Text style={styles.title}>Selo canônico</Text><Text style={styles.systemText}>XP é autoridade do servidor.</Text><Action label={voluntary ? 'CONCLUSÃO VOLUNTÁRIA ✓' : 'CONFIRMAR CONCLUSÃO VOLUNTÁRIA'} onPress={() => setVoluntary((v) => !v)} /><Action disabled={busy || !voluntary} label={busy ? 'SELANDO…' : 'SELAR DAY 004'} onPress={() => void seal()} /></> : null}
      {['NARRATIVE','TERM_REVEAL','READ','INSTRUCTION','CORRESPONDENCE_REVEAL','UNLOCK'].includes(phase.type) ? <Action label="CONTINUAR" onPress={() => void completePhase(phase.id)} /> : null}
    </View>
  </ScrollView>;
}

function TimedPractice({ target, showCounter, counter, onCount, onFinish, onSafetyStop }: { target: number; showCounter: boolean; counter: number; onCount: () => void; onFinish: (seconds: number) => void; onSafetyStop: () => void }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => { if (!running) return; const id = setInterval(() => setSeconds((v) => v + 1), 1000); return () => clearInterval(id); }, [running]);
  return <View style={styles.practice}><Text style={styles.text}>{seconds}s {target ? `/ ${target}s canônicos` : ''}</Text><Action label={running ? 'PAUSAR' : 'INICIAR / RETOMAR'} onPress={() => setRunning((v) => !v)} />{showCounter ? <Action label={`PADRÃO PERCEBIDO · ${counter}`} onPress={onCount} /> : null}<Action disabled={seconds <= 0} label="CONCLUIR PRÁTICA" onPress={() => onFinish(seconds)} /><Action label="SAFETY STOP" onPress={onSafetyStop} /></View>;
}
function Action({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  shell: { padding: 20, paddingBottom: 80, backgroundColor: '#090910', minHeight: '100%' },
  center: { flex: 1, padding: 28, justifyContent: 'center', backgroundColor: '#090910', gap: 14 },
  header: { marginBottom: 20, gap: 5 },
  headerTitle: { color: '#f4e6b2', fontSize: 25, fontWeight: '800' },
  status: { color: '#aaa18d', fontSize: 12 },
  panel: { borderWidth: 1, borderColor: '#6f5f29', borderRadius: 18, padding: 18, gap: 14, backgroundColor: '#111018' },
  practice: { gap: 10 },
  eyebrow: { color: '#d9bd67', fontSize: 12, letterSpacing: 1.4 },
  title: { color: '#f4e6b2', fontSize: 22, fontWeight: '700' },
  text: { color: '#eee7d7', lineHeight: 21 },
  canon: { color: '#eee7d7', lineHeight: 24, fontSize: 15 },
  systemText: { color: '#cfc3a4', lineHeight: 21 },
  error: { color: '#ffb4ab' },
  scale: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderColor: '#6f5f29', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  activeChip: { backgroundColor: '#4b3e16' },
  button: { borderWidth: 1, borderColor: '#9a8240', borderRadius: 12, padding: 12, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#f4e6b2', fontWeight: '700' },
});
