import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import { JELIEL_DAY_006 } from './day-definitions';
import { useHnkDayRuntime } from './useHnkDayRuntime';
import { encryptVaultText } from '../vault/vault-crypto';

const LISTENING_SECONDS = 180;
const SILENCE_SECONDS = 600;

export function JelielDay006Experience() {
  const controller = useHnkDayRuntime(JELIEL_DAY_006);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [listeningSeconds, setListeningSeconds] = useState(0);
  const [silenceSeconds, setSilenceSeconds] = useState(0);
  const [chatterReturns, setChatterReturns] = useState(0);
  const [vocalizationComplete, setVocalizationComplete] = useState(false);
  const [reflection, setReflection] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanon(null);
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }

    void loadCanonicalDay(controller.auth.client, 6)
      .then((snapshot) => {
        if (!active) return;
        setCanon(snapshot);
        setCanonError(null);
      })
      .catch((cause) => {
        if (!active) return;
        setCanon(null);
        setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed');
      });

    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  const phase = controller.phase?.id ?? 'loading';
  const canBegin = controller.runtime?.status === 'available' || controller.runtime?.status === 'complete';
  const cycleProgress = useMemo(() => `${JELIEL_DAY_006.cycleDay}/${JELIEL_DAY_006.cycleLength}`, []);

  async function sealDay() {
    if (!controller.auth.client || !controller.auth.userId) return;
    if (!reflection.trim()) {
      setLocalError('Registre no Vault as dificuldades percebidas antes de selar o Dia 006.');
      return;
    }

    setLocalError(null);
    try {
      const encrypted = await encryptVaultText({
        userId: controller.auth.userId,
        day: 6,
        kind: 'journal',
        plaintext: JSON.stringify({
          schema: 'hnk-day006-private-v1',
          reflection: reflection.trim(),
        }),
      });

      await saveEncryptedVaultEntry(controller.auth.client, {
        day: 6,
        payload: encrypted,
      });

      await controller.seal({
        durationSeconds: listeningSeconds + silenceSeconds,
        localRecordHash: encrypted.checksumSha256,
        metrics: {
          listening_seconds: listeningSeconds,
          silence_seconds: silenceSeconds,
          internal_chatter_returns: chatterReturns,
        },
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          jeliel_vocalization_completed: vocalizationComplete,
          listening_minutes: Math.floor(listeningSeconds / 60),
          silence_practice_minutes: Math.floor(silenceSeconds / 60),
          internal_chatter_returns: chatterReturns,
        },
      });
      setReflection('');
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'day006_seal_failed');
    }
  }

  if (controller.loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#efe0a2" />
        <Text style={styles.loadingText}>LENDO O ESTADO CANÔNICO DE JELIEL</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>KETHER · CICLO II · JELIEL · {cycleProgress}</Text>
            <Text style={styles.title}>{canon?.title ?? 'DIA 006 · SILÊNCIO VERBAL'}</Text>
            <Text style={styles.subtitle}>ESCUTAR ANTES DE NOMEAR.</Text>
          </View>
          <View style={styles.accountBox}>
            <Text style={styles.accountText}>{controller.progress?.initiatoryTitle?.toUpperCase() ?? 'NEÓFITO'}</Text>
            <Text style={styles.accountText}>{controller.progress?.xpTotal ?? 0} XP</Text>
          </View>
        </View>

        <View style={styles.sourceStrip}>
          <Text style={styles.sourceText}>CÂNONE · {canon?.sourceSha.slice(0, 10) ?? 'AGUARDANDO SYNC'}</Text>
          <Text style={styles.sourceText}>XP · {canon?.xp ?? 100}</Text>
          <Text style={styles.sourceText}>ÁUDIO · PRESET_PENDING</Text>
        </View>

        {canonError ? (
          <Notice title="CÂNONE INDISPONÍVEL NESTE ESTADO">
            O runtime não substitui o conteúdo sincronizado por texto inventado. Entre no Átrio e sincronize o Dia 006 para executar a experiência canônica.
          </Notice>
        ) : null}

        {controller.error || localError ? (
          <Notice title="SELO INTERROMPIDO">
            {localError ?? controller.error}
          </Notice>
        ) : null}

        {controller.runtime?.status === 'locked' ? (
          <Card label="GATE" title="Jeliel ainda está fechado">
            <Text style={styles.body}>O Dia 006 só fica disponível depois da conclusão canônica do Dia 005. O cliente não força esse desbloqueio localmente.</Text>
          </Card>
        ) : null}

        {phase === 'threshold' && controller.runtime?.status !== 'locked' ? (
          <Card label="LIMIAR" title={canon?.title ?? 'O Silêncio de Jeliel'}>
            <Canonical>{canon?.blocks['jachin-doctrine'] ?? 'Conteúdo canônico aguardando sincronização.'}</Canonical>
            <Text style={styles.body}>O objetivo do produto é perceber ruído e retorno. Pensamentos não geram penalidade, e o conteúdo deles não é coletado.</Text>
            <Primary
              label={controller.busy ? 'CRIANDO PRACTICE SESSION…' : controller.runtime?.mode === 'revisit' ? 'REVISITAR DIA 006' : 'INICIAR DIA 006'}
              disabled={!canBegin || !canon || controller.busy}
              onPress={() => void controller.begin().then(() => controller.nextPhase()).catch(() => undefined)}
            />
          </Card>
        ) : null}

        {phase === 'listening' ? (
          <Card label="JACHIN · ESCUTA" title="Respirar e abrir o campo auditivo">
            <Canonical>{canon?.blocks['jachin-kavanah'] ?? ''}</Canonical>
            <PracticeTimer value={listeningSeconds} target={LISTENING_SECONDS} onChange={setListeningSeconds} />
            <Primary label="ENTRAR NO SILÊNCIO" disabled={listeningSeconds < LISTENING_SECONDS} onPress={() => {
              controller.setEvidence({ listening_minutes: 3 });
              controller.nextPhase();
            }} />
          </Card>
        ) : null}

        {phase === 'silence' ? (
          <Card label="BOAZ · RESTRIÇÃO" title="Observar o retorno da tagarelice">
            <Canonical>{canon?.blocks['boaz-kavanah'] ?? ''}</Canonical>
            <Text style={styles.body}>Use o marcador quando perceber o retorno do diálogo interno. Ele registra atenção recuperada — não falha.</Text>
            <PracticeTimer value={silenceSeconds} target={SILENCE_SECONDS} onChange={setSilenceSeconds} />
            <Pressable style={styles.counter} onPress={() => setChatterReturns((value) => value + 1)}>
              <Text style={styles.counterLabel}>RETORNO DA TAGARELICE PERCEBIDO</Text>
              <Text style={styles.counterValue}>+ {chatterReturns}</Text>
            </Pressable>
            <Primary label="SEGUIR PARA A VOCALIZAÇÃO" disabled={silenceSeconds < SILENCE_SECONDS} onPress={() => {
              controller.setEvidence({ silence_practice_minutes: 10, internal_chatter_returns: chatterReturns });
              controller.nextPhase();
            }} />
          </Card>
        ) : null}

        {phase === 'vocalization' ? (
          <Card label="PILAR DO MEIO" title="IOD-LAMED-IOD">
            <Canonical>{canon?.blocks['middle-kavanah'] ?? ''}</Canonical>
            <Notice title="PRIVACIDADE VOCAL">
              A gravação de voz é opcional. A conclusão registra apenas que a vocalização foi realizada; áudio bruto não é necessário para conceder o XP canônico.
            </Notice>
            <Pressable style={[styles.check, vocalizationComplete && styles.checkDone]} onPress={() => setVocalizationComplete((value) => !value)}>
              <Text style={styles.checkMark}>{vocalizationComplete ? '✓' : '○'}</Text>
              <Text style={styles.checkText}>VOCALIZAÇÃO REALIZADA VOLUNTARIAMENTE</Text>
            </Pressable>
            <Primary label="RETORNAR AO AMBIENTE" disabled={!vocalizationComplete} onPress={() => {
              controller.setEvidence({ jeliel_vocalization_completed: true });
              controller.nextPhase();
            }} />
          </Card>
        ) : null}

        {phase === 'grounding' ? (
          <Card label="RETORNO" title="A prática termina por decisão sua">
            <Text style={styles.body}>Abra os olhos, mova mãos e pés e confirme que está orientado ao ambiente antes de seguir ao registro privado.</Text>
            <Primary label="CONFIRMAR RETORNO" onPress={() => {
              controller.setReturnConfirmed();
              controller.nextPhase();
            }} />
          </Card>
        ) : null}

        {phase === 'seal' ? (
          <Card label="BOAZ · VAULT" title="Registrar dificuldades sem expor plaintext">
            <Canonical>{canon?.blocks['boaz-ordalia'] ?? ''}</Canonical>
            <TextInput
              value={reflection}
              onChangeText={setReflection}
              placeholder="Registro privado — será cifrado no dispositivo antes de sair do app"
              placeholderTextColor="#676970"
              multiline
              style={styles.textArea}
            />
            <Primary label={controller.busy ? 'CIFRANDO E SELANDO…' : 'CIFRAR · SELAR DIA 006'} disabled={controller.busy || reflection.trim().length === 0} onPress={() => void sealDay()} />
          </Card>
        ) : null}

        {controller.runtime?.status === 'complete' && controller.runtime.serverCompletion ? (
          <Card label="PASSAGEM" title="Jeliel 1/5 confirmado">
            <View style={styles.reward}>
              <Text style={styles.rewardLabel}>{controller.runtime.serverCompletion.firstCompletion ? 'RECOMPENSA CANÔNICA' : 'REVISITA'}</Text>
              <Text style={styles.rewardXp}>{controller.runtime.serverCompletion.firstCompletion ? `+${controller.runtime.serverCompletion.xpAwarded} XP` : 'XP JÁ SELADO'}</Text>
              <Text style={styles.rewardTotal}>XP TOTAL · {controller.runtime.serverCompletion.xpTotal}</Text>
            </View>
            <Text style={styles.body}>O servidor confirmou o estado. O Fragmento II só acende quando os Dias 006–010 estiverem todos concluídos.</Text>
          </Card>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>DAY · 006</Text>
          <Text style={styles.footerText}>CYCLE · JELIEL 1/5</Text>
          <Text style={styles.footerText}>SESSION · {controller.practice?.id.slice(0, 8) ?? '—'}</Text>
          <Text style={styles.footerText}>SERVER · {controller.runtime?.status ?? 'LOADING'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function PracticeTimer({ value, target, onChange }: { value: number; target: number; onChange: (value: number) => void }) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || value >= target) return;
    const id = setInterval(() => onChange(Math.min(target, value + 1)), 1000);
    return () => clearInterval(id);
  }, [onChange, running, target, value]);

  useEffect(() => {
    if (value >= target) setRunning(false);
  }, [target, value]);

  return (
    <View style={styles.timer}>
      <View>
        <Text style={styles.timerLabel}>TEMPO REAL</Text>
        <Text style={styles.timerValue}>{formatSeconds(value)}</Text>
        <Text style={styles.timerTarget}>ALVO · {formatSeconds(target)}</Text>
      </View>
      <Pressable style={styles.timerButton} onPress={() => setRunning((state) => !state)} disabled={value >= target}>
        <Text style={styles.timerButtonText}>{value >= target ? 'CONCLUÍDO' : running ? 'PAUSAR' : value > 0 ? 'CONTINUAR' : 'INICIAR'}</Text>
      </Pressable>
    </View>
  );
}

function Card({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

function Canonical({ children }: { children: React.ReactNode }) {
  return <Text style={styles.canonical}>{children}</Text>;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeTitle}>{title}</Text>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

function Primary({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable style={[styles.primary, disabled && styles.primaryDisabled]} disabled={disabled} onPress={onPress}>
      <Text style={[styles.primaryText, disabled && styles.primaryTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

function formatSeconds(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#030406' },
  loadingText: { color: '#786d49', fontSize: 9, letterSpacing: 1.5 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 90, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start' },
  eyebrow: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.6 },
  title: { color: '#fffaf0', fontSize: 28, lineHeight: 34, fontWeight: '300', marginTop: 7 },
  subtitle: { color: '#8f918d', fontSize: 10, letterSpacing: 1.5, marginTop: 7 },
  accountBox: { alignItems: 'flex-end', gap: 4 },
  accountText: { color: '#73756f', fontSize: 8, letterSpacing: 1.1 },
  sourceStrip: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#202126', paddingVertical: 10 },
  sourceText: { color: '#5f6167', fontSize: 8, letterSpacing: 1 },
  card: { borderWidth: 1, borderColor: '#292a2f', borderRadius: 24, padding: 22, backgroundColor: '#08090d', gap: 15 },
  cardLabel: { color: '#9b8953', fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  cardTitle: { color: '#f8f1db', fontSize: 24, lineHeight: 30, fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#27282c' },
  body: { color: '#a7a89f', fontSize: 13, lineHeight: 21 },
  canonical: { color: '#ddd5bf', fontSize: 15, lineHeight: 25 },
  notice: { borderWidth: 1, borderColor: '#343b3d', borderRadius: 15, padding: 14, backgroundColor: '#090d0f' },
  noticeTitle: { color: '#8fa4aa', fontSize: 8, letterSpacing: 1.2, fontWeight: '700' },
  noticeText: { color: '#aab7b9', fontSize: 12, lineHeight: 19, marginTop: 6 },
  timer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#39331e', borderRadius: 17, padding: 16, backgroundColor: '#0b0b08' },
  timerLabel: { color: '#81754f', fontSize: 8, letterSpacing: 1.2 },
  timerValue: { color: '#f3df98', fontSize: 30, fontVariant: ['tabular-nums'], marginTop: 4 },
  timerTarget: { color: '#5d5843', fontSize: 8, letterSpacing: 1, marginTop: 3 },
  timerButton: { borderWidth: 1, borderColor: '#655a32', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  timerButtonText: { color: '#cfbd79', fontSize: 8, letterSpacing: 1.1, fontWeight: '700' },
  counter: { borderWidth: 1, borderColor: '#303137', borderRadius: 15, padding: 15, backgroundColor: '#0a0b0e' },
  counterLabel: { color: '#73757c', fontSize: 8, letterSpacing: 1.1 },
  counterValue: { color: '#e8dab0', fontSize: 22, marginTop: 5 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#303137', borderRadius: 15, padding: 15 },
  checkDone: { borderColor: '#685b32', backgroundColor: '#121007' },
  checkMark: { color: '#dec77b', fontSize: 18 },
  checkText: { flex: 1, color: '#b8b19b', fontSize: 11, letterSpacing: 0.8 },
  textArea: { minHeight: 160, borderWidth: 1, borderColor: '#303137', borderRadius: 16, padding: 14, backgroundColor: '#050609', color: '#fffaf0', fontSize: 14, lineHeight: 21, textAlignVertical: 'top' },
  primary: { minHeight: 54, borderRadius: 15, backgroundColor: '#dcc879', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  primaryDisabled: { backgroundColor: '#25251f' },
  primaryText: { color: '#10100d', fontSize: 9, letterSpacing: 1.4, fontWeight: '800', textAlign: 'center' },
  primaryTextDisabled: { color: '#65655b' },
  reward: { minHeight: 155, borderWidth: 1, borderColor: '#534827', borderRadius: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0d08' },
  rewardLabel: { color: '#887a4f', fontSize: 8, letterSpacing: 1.3 },
  rewardXp: { color: '#fff0ad', fontSize: 28, fontWeight: '300', marginTop: 6 },
  rewardTotal: { color: '#8f825a', fontSize: 9, letterSpacing: 1.1, marginTop: 5 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingHorizontal: 4, marginTop: 4 },
  footerText: { color: '#4f5158', fontSize: 8, letterSpacing: 0.9 },
});
