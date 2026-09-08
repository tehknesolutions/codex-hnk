import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { createDay001RitualTone528WavBase64 } from '@hnk/ritual-tone';
import {
  saveEncryptedVaultEntry,
  sealDay001V2,
  startDay001PracticeSessionV2,
} from '@hnk/supabase-client';
import { ketherTokens } from '@hnk/ui';
import { useHnkAuth } from '../auth/AuthContext';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadDay001Snapshot, type Day001Snapshot } from './day001-data';
import { KetherOriginRelicNative } from './KetherOriginRelicNative';

type Step = 'portal' | 'anchor' | 'kether' | 'jachin' | 'boaz' | 'middle' | 'mirror' | 'seal';
type Session = Awaited<ReturnType<typeof startDay001PracticeSessionV2>>;
type SuccessfulSeal = Extract<Awaited<ReturnType<typeof sealDay001V2>>, { ok: true }>['response'];
type Durations = { jachin: number; boaz: number; middle: number };

const C = ketherTokens.color;
const STEPS: Step[] = ['portal', 'anchor', 'kether', 'jachin', 'boaz', 'middle', 'mirror', 'seal'];
const ANCHORS = [
  'Tenho uma referência clara',
  'Sinto isso, mas não sei definir',
  'Ainda estou procurando',
  'Prefiro apenas experimentar',
] as const;

function sessionKey(userId: string): string {
  return `hnk-d001-v2-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function resolveToneSource(): Promise<string> {
  const base64 = createDay001RitualTone528WavBase64();
  if (Platform.OS === 'web') return `data:audio/wav;base64,${base64}`;
  if (!FileSystem.cacheDirectory) throw new Error('ritual_tone_cache_unavailable');
  const uri = `${FileSystem.cacheDirectory}hnk-day001-528-v1.wav`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

export function Day001GoldenV2Mobile() {
  const auth = useHnkAuth();
  const [day, setDay] = useState<Day001Snapshot | null>(null);
  const [step, setStep] = useState<Step>('portal');
  const [anchor, setAnchor] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [durations, setDurations] = useState<Durations>({ jachin: 0, boaz: 0, middle: 0 });
  const [returns, setReturns] = useState({ jachin: false, boaz: false, middle: false });
  const [attentionReturns, setAttentionReturns] = useState(0);
  const [toneStarted, setToneStarted] = useState(false);
  const [tonePlaying, setTonePlaying] = useState(false);
  const [toneError, setToneError] = useState<string | null>(null);
  const tonePlayer = useRef<AudioPlayer | null>(null);
  const [distractions, setDistractions] = useState(['', '', '']);
  const [intention, setIntention] = useState('');
  const [mirror, setMirror] = useState('');
  const [voluntary, setVoluntary] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sealed, setSealed] = useState<SuccessfulSeal | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    void loadDay001Snapshot(auth.accessToken ?? undefined).then((snapshot) => {
      if (active) setDay(snapshot);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReduceMotion(value);
    });
    return () => {
      active = false;
      try { tonePlayer.current?.pause(); tonePlayer.current?.release(); } catch { /* noop */ }
      tonePlayer.current = null;
    };
  }, [auth.accessToken]);

  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);
  const current = STEPS.indexOf(step);
  const distractionCount = distractions.filter((value) => value.trim().length > 0).length;
  const totalDuration = durations.jachin + durations.boaz + durations.middle;
  const canSeal = Boolean(
    session && toneStarted && returns.jachin && returns.boaz && returns.middle &&
    durations.jachin > 0 && durations.boaz > 0 && durations.middle > 0 &&
    distractionCount >= 3 && mirror.trim() && voluntary,
  );

  async function ensureSession(): Promise<Session | null> {
    if (session) return session;
    if (!live || !auth.client || !auth.userId) return null;
    const created = await startDay001PracticeSessionV2(auth.client, {
      clientSessionId: sessionKey(auth.userId),
      appVersion: '0.3.0-mobile-golden-v2',
    });
    setSession(created);
    return created;
  }

  async function advance(next: Step) {
    setError(null);
    try {
      if (next === 'jachin') await ensureSession();
      setStep(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'practice_session_start_failed');
    }
  }

  async function toggleTone() {
    setToneError(null);
    try {
      let player = tonePlayer.current;
      if (!player) {
        player = createAudioPlayer(await resolveToneSource());
        player.loop = true;
        player.volume = 0.12;
        tonePlayer.current = player;
      }
      if (tonePlaying) {
        player.pause();
        setTonePlaying(false);
        return;
      }
      player.play();
      setToneStarted(true);
      setTonePlaying(true);
    } catch (cause) {
      setTonePlaying(false);
      setToneError(cause instanceof Error ? cause.message : 'ritual_tone_failed');
    }
  }

  function safetyStop() {
    try { tonePlayer.current?.pause(); } catch { /* noop */ }
    setTonePlaying(false);
    setError('Prática interrompida com segurança. Seu progresso local foi preservado; retome quando desejar.');
  }

  async function seal() {
    if (!auth.client || !auth.userId || !session || !canSeal) return;
    setBusy(true);
    setError(null);
    try {
      try { tonePlayer.current?.pause(); } catch { /* noop */ }
      setTonePlaying(false);

      const privatePayload = await encryptVaultText({
        userId: auth.userId,
        day: 1,
        kind: 'journal',
        plaintext: JSON.stringify({
          schema: 'hnk-day001-private-v4',
          intention: intention.trim(),
          mirror: mirror.trim(),
          distractions: distractions.map((value) => value.trim()),
          meaning_anchor: anchor,
        }),
      });
      const vaultEntry = await saveEncryptedVaultEntry(auth.client, { day: 1, payload: privatePayload });

      const result = await sealDay001V2(auth.client, {
        evidence: {
          sessionId: session.id,
          mode: 'first_completion',
          jachin: { durationSeconds: durations.jachin, attentionReturns },
          ritualTone528: { stoppedForDiscomfort: false },
          boaz: {
            durationSeconds: durations.boaz,
            environmentDistractionsCount: distractionCount,
            vaultEntryRef: vaultEntry.id,
          },
          middle: {
            durationSeconds: durations.middle,
            voiceRecorded: false,
          },
          soulMirror: { vaultEntryRef: vaultEntry.id },
        },
        totalDurationSeconds: totalDuration,
        attentionReturns,
        localRecordHash: privatePayload.checksumSha256,
      });

      if (!result.ok) throw new Error(result.code);
      setSealed(result.response);
      setStep('seal');
      setIntention('');
      setMirror('');
      setDistractions(['', '', '']);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'day001_completion_failed');
    } finally {
      setBusy(false);
    }
  }

  if (!day) return <View style={styles.center}><Text style={styles.gold}>Abrindo Kether…</Text></View>;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>HNK CODEX · DIA 001</Text><Text style={styles.logo}>KETHER</Text></View>
          <Text style={styles.live}>{live ? 'CANON LIVE' : 'OFFLINE / DEMO'}</Text>
        </View>
        <View style={styles.progress}>{STEPS.map((id, index) => <View key={id} style={[styles.dot, index <= current && styles.dotOn]} />)}</View>
        {error ? <Notice text={error} /> : null}

        {step === 'portal' ? <Card>
          <Text style={styles.eyebrow}>O PRIMEIRO LIMIAR</Text>
          <Text style={styles.hero}>A Coroa antes da forma.</Text>
          <Text style={styles.body}>Antes da primeira forma, existe um ponto. Antes da primeira palavra, existe atenção.</Text>
          <Text style={styles.system}>Não precisa saber. Não precisa sentir algo especial. Você mantém o controle. Observe antes de interpretar.</Text>
          <Action label="ACEITO EXPERIMENTAR" onPress={() => void advance('anchor')} />
        </Card> : null}

        {step === 'anchor' ? <Card>
          <Text style={styles.eyebrow}>ÂNCORA DE SIGNIFICADO · PRIVADA</Text>
          <Text style={styles.title}>Existe algo que represente para você aquilo que é maior, verdadeiro ou sagrado?</Text>
          {ANCHORS.map((choice) => <Choice key={choice} label={choice} active={anchor === choice} onPress={() => setAnchor(choice)} />)}
          <Text style={styles.system}>Isto não altera XP, Grade, protocolo ou acesso. Serve apenas para mediação futura.</Text>
          <Action label="CONTINUAR" disabled={!anchor} onPress={() => void advance('kether')} />
        </Card> : null}

        {step === 'kether' ? <Card>
          <KetherOriginRelicNative reduceMotion={reduceMotion} />
          <Text style={styles.eyebrow}>COROA → KETHER</Text>
          <Text style={styles.hero}>O ponto anterior à forma.</Text>
          <Text style={styles.body}>Kether é apresentado aqui como a Coroa: origem, possibilidade e atenção antes da definição.</Text>
          <View style={styles.meta}><Meta k="MUNDO" v={day.world} /><Meta k="ANJO" v={day.angel} /><Meta k="GRAU" v="Neófito" /></View>
          <Action label="ENTRAR EM JACHIN" onPress={() => void advance('jachin')} />
        </Card> : null}

        {step === 'jachin' ? <Card>
          <Text style={styles.eyebrow}>JACHIN · EXPANSÃO</Text>
          <Text style={styles.title}>Doutrina</Text><Text style={styles.canon}>{day.jachinDoctrine}</Text>
          <Text style={styles.title}>Kavanah</Text><Text style={styles.canon}>{day.jachinKavanah}</Text>
          <View style={styles.instrument}>
            <Text style={styles.title}>Tom ritual · 528 Hz</Text>
            <Text style={styles.system}>Início manual, volume baixo e controlado. Theta/432 não é usado enquanto o mapeamento canônico estiver pendente.</Text>
            <Action label={tonePlaying ? 'PAUSAR TOM 528' : toneStarted ? 'RETOMAR TOM 528' : 'INICIAR TOM 528'} onPress={() => void toggleTone()} />
            {toneError ? <Text style={styles.error}>{toneError}</Text> : null}
          </View>
          <PracticeTimer target={600} label="FOCO · 10 MIN" onCommit={(seconds) => setDurations((v) => ({ ...v, jachin: seconds }))} />
          <Pressable style={styles.returnButton} onPress={() => setAttentionReturns((v) => v + 1)}><Text style={styles.returnText}>PERCEBI E VOLTEI · {attentionReturns}</Text></Pressable>
          {durations.jachin > 0 ? <ReturnGate confirmed={returns.jachin} onConfirm={() => setReturns((v) => ({ ...v, jachin: true }))} /> : null}
          <Action label="ENTRAR EM BOAZ" disabled={!toneStarted || !returns.jachin} onPress={() => void advance('boaz')} />
          <Safety onStop={safetyStop} />
        </Card> : null}

        {step === 'boaz' ? <Card>
          <Text style={styles.eyebrow}>BOAZ · ESTRUTURA</Text>
          <Text style={styles.title}>Doutrina</Text><Text style={styles.canon}>{day.boazDoctrine}</Text>
          <Text style={styles.system}>Prática voluntária de relaxamento e atenção. Não force os olhos nem tente provar incapacidade de abri-los.</Text>
          <PracticeTimer target={300} label="RELAXAMENTO · 5 MIN" onCommit={(seconds) => setDurations((v) => ({ ...v, boaz: seconds }))} />
          <Text style={styles.title}>Três distrações para retirar do ambiente</Text>
          {distractions.map((value, index) => <TextInput key={index} value={value} onChangeText={(text) => setDistractions((items) => items.map((item, i) => i === index ? text : item))} placeholder={`Distração ${index + 1}`} placeholderTextColor="#756e83" style={styles.input} />)}
          {durations.boaz > 0 ? <ReturnGate confirmed={returns.boaz} onConfirm={() => setReturns((v) => ({ ...v, boaz: true }))} /> : null}
          <Action label="CONVERGIR OS PILARES" disabled={!returns.boaz || distractionCount < 3} onPress={() => void advance('middle')} />
          <Safety onStop={safetyStop} />
        </Card> : null}

        {step === 'middle' ? <Card>
          <Text style={styles.eyebrow}>PILAR DO MEIO · CONVERGÊNCIA</Text>
          <Text style={styles.title}>Integração</Text><Text style={styles.canon}>{day.middleDoctrine}</Text>
          <Text style={styles.system}>Primeiro: vocalização livre. Depois: Glossolália. Nenhuma gravação é necessária, analisada ou enviada.</Text>
          <PracticeTimer target={180} label="VOCALIZAÇÃO · 3 MIN" onCommit={(seconds) => setDurations((v) => ({ ...v, middle: seconds }))} />
          {durations.middle > 0 ? <ReturnGate confirmed={returns.middle} onConfirm={() => setReturns((v) => ({ ...v, middle: true }))} /> : null}
          <Action label="ABRIR O ESPELHO" disabled={!returns.middle} onPress={() => void advance('mirror')} />
          <Safety onStop={safetyStop} />
        </Card> : null}

        {step === 'mirror' ? <Card>
          <Text style={styles.eyebrow}>ESPELHO DA ALMA</Text>
          <Text style={styles.title}>O que você traz para esta travessia?</Text>
          <TextInput value={intention} onChangeText={setIntention} multiline placeholder="Intenção privada…" placeholderTextColor="#756e83" style={[styles.input, styles.area]} />
          <Text style={styles.title}>No silêncio eu percebi…</Text>
          <TextInput value={mirror} onChangeText={setMirror} multiline placeholder="Registro privado…" placeholderTextColor="#756e83" style={[styles.input, styles.area]} />
          <Text style={styles.system}>Estes textos e as três distrações são cifrados localmente antes do sync. O servidor recebe apenas ciphertext e evidence estruturada.</Text>
          <Choice label="CONFIRMO A CONCLUSÃO VOLUNTÁRIA" active={voluntary} onPress={() => setVoluntary((v) => !v)} />
          <Action label={busy ? 'CIFRANDO E SELANDO…' : 'SELAR DIA 001'} disabled={!canSeal || busy || !live} onPress={() => void seal()} />
          {!live ? <Text style={styles.system}>Modo offline/demo: pratique livremente; o selo canônico será habilitado após autenticação e sync.</Text> : null}
        </Card> : null}

        {step === 'seal' ? <Card>
          <Text style={styles.eyebrow}>PRIMEIRA CENTELHA</Text>
          <View style={styles.spark}><Text style={styles.sparkText}>●</Text></View>
          <Text style={styles.hero}>Agora existe uma luz.</Text>
          <Text style={styles.reward}>{sealed?.first_completion ? `+${sealed.xp_awarded} XP` : 'XP JÁ SELADO'}</Text>
          <Text style={styles.body}>1 de 36 travessias de Kether registrada. Vehuiah: 1/5. O primeiro fragmento da Coroa permanece reservado ao Dia 005.</Text>
          <Text style={styles.system}>Estado recebido do servidor · {sealed?.server_completed_at ?? '—'}</Text>
        </Card> : null}
      </ScrollView>
    </View>
  );
}

function PracticeTimer({ target, label, onCommit }: { target: number; label: string; onCommit: (seconds: number) => void }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [committed, setCommitted] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const remaining = Math.max(0, target - seconds);
  return <View style={styles.timer}>
    <Text style={styles.eyebrow}>{label}</Text>
    <Text style={styles.timerValue}>{Math.floor(remaining / 60).toString().padStart(2, '0')}:{(remaining % 60).toString().padStart(2, '0')}</Text>
    <Text style={styles.system}>Meta canônica {Math.round(target / 60)} min · evidence registra o tempo realmente praticado.</Text>
    <View style={styles.row}>
      <Small label={running ? 'PAUSAR' : seconds ? 'RETOMAR' : 'INICIAR'} onPress={() => setRunning((v) => !v)} />
      <Small label={committed ? 'REGISTRADO' : 'CONCLUIR PRÁTICA'} disabled={!seconds || committed} onPress={() => { setRunning(false); setCommitted(true); onCommit(seconds); }} />
    </View>
  </View>;
}

function ReturnGate({ confirmed, onConfirm }: { confirmed: boolean; onConfirm: () => void }) {
  return <View style={styles.returnGate}><Text style={styles.title}>Retorno</Text><Text style={styles.system}>Respire normalmente. Mova mãos e pés. Abra os olhos quando desejar e oriente-se ao ambiente.</Text><Choice label={confirmed ? 'RETORNO CONFIRMADO' : 'ESTOU PRESENTE E QUERO CONTINUAR'} active={confirmed} onPress={onConfirm} /></View>;
}

function Safety({ onStop }: { onStop: () => void }) { return <Pressable onPress={onStop} style={styles.safety}><Text style={styles.safetyText}>PAUSAR / ENCERRAR COM SEGURANÇA</Text></Pressable>; }
function Card({ children }: { children: React.ReactNode }) { return <View style={styles.card}>{children}</View>; }
function Notice({ text }: { text: string }) { return <View style={styles.notice}><Text style={styles.error}>{text}</Text></View>; }
function Meta({ k, v }: { k: string; v: string }) { return <View style={styles.metaItem}><Text style={styles.eyebrow}>{k}</Text><Text style={styles.metaValue}>{v}</Text></View>; }
function Action({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.action, disabled && styles.disabled]}><Text style={styles.actionText}>{label}</Text></Pressable>; }
function Small({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.small, disabled && styles.disabled]}><Text style={styles.smallText}>{label}</Text></Pressable>; }
function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.choice, active && styles.choiceOn]}><Text style={[styles.choiceText, active && styles.gold]}>{active ? '● ' : '○ '}{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07060b' }, center: { flex: 1, backgroundColor: '#07060b', alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 18, paddingBottom: 64, gap: 14 }, header: { paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { color: '#9b8ea8', fontSize: 10, letterSpacing: 2.2, fontWeight: '700' }, logo: { color: '#fff8e8', fontSize: 28, letterSpacing: 5, fontWeight: '300' }, live: { color: '#d9b85c', fontSize: 10, letterSpacing: 1.5 },
  progress: { flexDirection: 'row', gap: 6 }, dot: { height: 2, flex: 1, backgroundColor: '#27202e' }, dotOn: { backgroundColor: '#c7a34d' },
  card: { borderWidth: 1, borderColor: '#332840', backgroundColor: '#0d0a12', borderRadius: 24, padding: 20, gap: 16, overflow: 'hidden' },
  hero: { color: '#fff8e8', fontSize: 34, lineHeight: 39, fontWeight: '300' }, title: { color: '#f2dfb0', fontSize: 18, lineHeight: 24, fontWeight: '600' }, body: { color: '#cec5d4', fontSize: 16, lineHeight: 25 }, canon: { color: '#d8d0dc', fontSize: 15, lineHeight: 24 }, system: { color: '#8e8498', fontSize: 12, lineHeight: 18 }, gold: { color: '#d9b85c' }, error: { color: '#f1b4a7', fontSize: 12, lineHeight: 18 },
  action: { borderRadius: 999, backgroundColor: '#d8b85f', minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 }, actionText: { color: '#161019', fontWeight: '900', letterSpacing: 1.2, fontSize: 12 }, disabled: { opacity: 0.35 },
  choice: { borderWidth: 1, borderColor: '#372c40', backgroundColor: '#100c15', borderRadius: 16, padding: 14 }, choiceOn: { borderColor: '#8f7640', backgroundColor: '#17110e' }, choiceText: { color: '#bbb1c2', fontSize: 14 },
  meta: { flexDirection: 'row', gap: 8 }, metaItem: { flex: 1, borderTopWidth: 1, borderColor: '#32283a', paddingTop: 10 }, metaValue: { color: '#eee5f2', marginTop: 4, fontSize: 12 },
  instrument: { padding: 14, borderWidth: 1, borderColor: '#594728', borderRadius: 16, gap: 10, backgroundColor: '#120f0b' },
  timer: { padding: 16, borderWidth: 1, borderColor: '#34293e', borderRadius: 18, alignItems: 'center', gap: 10 }, timerValue: { color: '#fff7df', fontSize: 48, fontWeight: '200', letterSpacing: 3 }, row: { flexDirection: 'row', gap: 8, width: '100%' }, small: { flex: 1, borderWidth: 1, borderColor: '#5c4d70', borderRadius: 999, padding: 11, alignItems: 'center' }, smallText: { color: '#dcd3e4', fontSize: 10, letterSpacing: 1 },
  returnButton: { padding: 15, alignItems: 'center', borderRadius: 999, backgroundColor: '#171020' }, returnText: { color: '#d9b85c', fontWeight: '700', letterSpacing: 1 }, returnGate: { borderLeftWidth: 2, borderLeftColor: '#d9b85c', paddingLeft: 14, gap: 10 },
  input: { borderWidth: 1, borderColor: '#382e41', borderRadius: 14, backgroundColor: '#09070d', color: '#f4edf7', padding: 14, fontSize: 14 }, area: { minHeight: 100, textAlignVertical: 'top' },
  safety: { padding: 12, alignItems: 'center' }, safetyText: { color: '#93899b', fontSize: 10, letterSpacing: 1.2 }, notice: { padding: 12, borderRadius: 12, backgroundColor: '#251313' },
  spark: { width: 120, height: 120, borderRadius: 60, borderWidth: 1, borderColor: '#d9b85c', alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }, sparkText: { color: '#fff2bc', fontSize: 52, textShadowColor: '#e9c95e', textShadowRadius: 24 }, reward: { color: '#ffe184', fontSize: 30, fontWeight: '800', textAlign: 'center' },
});
