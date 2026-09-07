import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { DayDefinition } from '@hnk/day-runtime';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import {
  ELEMIAH_DAY_016,
  ELEMIAH_DAY_017,
  ELEMIAH_DAY_018,
  ELEMIAH_DAY_019,
  ELEMIAH_DAY_020,
} from './runtime-definitions/elemiah';
import {
  CanonicalText,
  RuntimeCard,
  RuntimeChoice,
  RuntimeCompletion,
  RuntimeNotice,
  RuntimePrimary,
  RuntimeScale,
  RuntimeTimer,
  runtimeTextStyles,
} from './KetherRuntimePrimitives';
import { useHnkDayRuntime } from './useHnkDayRuntime';

type ElemiahDay = 16 | 17 | 18 | 19 | 20;
type Variation = 'timbre' | 'pitch' | 'posture';

const DEFINITIONS: Record<ElemiahDay, DayDefinition> = {
  16: ELEMIAH_DAY_016,
  17: ELEMIAH_DAY_017,
  18: ELEMIAH_DAY_018,
  19: ELEMIAH_DAY_019,
  20: ELEMIAH_DAY_020,
};

export function ElemiahDays016to020Experience({ day }: { day: ElemiahDay }) {
  const controller = useHnkDayRuntime(DEFINITIONS[day]);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setCanon(null);
    setCanonError(null);
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, day)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase, day]);

  if (controller.loading) return <Loading />;

  return (
    <Frame day={day} canon={canon} controller={controller}>
      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime aguarda o conteúdo sincronizado e não cria uma versão substituta.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="SELO INTERROMPIDO">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia bloqueado"><Text style={runtimeTextStyles.body}>A primeira conclusão depende do Dia anterior no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status !== 'locked' && day === 16 ? <Day016 canon={canon} controller={controller} setLocalError={setLocalError} /> : null}
      {controller.runtime?.status !== 'locked' && day === 17 ? <Day017 canon={canon} controller={controller} setLocalError={setLocalError} /> : null}
      {controller.runtime?.status !== 'locked' && day === 18 ? <Day018 canon={canon} controller={controller} setLocalError={setLocalError} /> : null}
      {controller.runtime?.status !== 'locked' && day === 19 ? <Day019Blocker canon={canon} /> : null}
      {controller.runtime?.status !== 'locked' && day === 20 ? <Day020 canon={canon} controller={controller} setLocalError={setLocalError} /> : null}
    </Frame>
  );
}

type Common = {
  canon: CanonicalDaySnapshot | null;
  controller: ReturnType<typeof useHnkDayRuntime>;
  setLocalError: (value: string | null) => void;
};

function Day016({ canon, controller, setLocalError }: Common) {
  const [preverbalSeconds, setPreverbalSeconds] = useState(0);
  const [wordSilenceSeconds, setWordSilenceSeconds] = useState(0);
  const [perception, setPerception] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [belief, setBelief] = useState('');
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ELEMIAH 1/5" title="A palavra aponta; não contém toda a experiência" />;
  if (phase === 'preverbal') return (
    <RuntimeCard label="OBSERVAÇÃO PRÉ-VERBAL" title="Cinco minutos antes da descrição">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={preverbalSeconds} target={300} onChange={setPreverbalSeconds} />
      <RuntimePrimary label="SEPARAR CAMADAS" disabled={preverbalSeconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'layers') return (
    <RuntimeCard label="TRÊS CAMADAS" title="Percepção · interpretação · crença">
      <TextInput value={perception} onChangeText={setPerception} placeholder="PERCEPÇÃO · Vault privado" placeholderTextColor="#676970" multiline style={runtimeTextStyles.textArea} />
      <TextInput value={interpretation} onChangeText={setInterpretation} placeholder="INTERPRETAÇÃO · Vault privado" placeholderTextColor="#676970" multiline style={runtimeTextStyles.textArea} />
      <TextInput value={belief} onChangeText={setBelief} placeholder="CRENÇA · Vault privado" placeholderTextColor="#676970" multiline style={runtimeTextStyles.textArea} />
      <RuntimePrimary label="SILÊNCIO · PALAVRA · SILÊNCIO" disabled={[perception, interpretation, belief].some((value) => value.trim().length === 0)} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'word-silence') return (
    <RuntimeCard label="INTEGRAÇÃO" title="2 min silêncio · 2 min palavra · 1 min repouso">
      <CanonicalText>{canon?.blocks['middle-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={wordSilenceSeconds} target={300} onChange={setWordSilenceSeconds} />
      <RuntimePrimary label="RETORNAR" disabled={wordSilenceSeconds < 300} onPress={() => {
        controller.setEvidence({ preverbal_observation_seconds: preverbalSeconds, layers_separated: true, prayer_completed: true });
        controller.nextPhase();
      }} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return <Grounding controller={controller} text="Abra os olhos, nomeie objetos concretos e retorne à linguagem sem apagar a distinção entre experiência e interpretação." />;
  if (phase === 'seal') return <Seal controller={controller} onSeal={async () => {
    if (!controller.auth.client || !controller.auth.userId) return;
    setLocalError(null);
    try {
      const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 16, kind: 'journal', plaintext: JSON.stringify({ schema: 'hnk-day016-layers-v1', perception: perception.trim(), interpretation: interpretation.trim(), belief: belief.trim() }) });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 16, payload: encrypted });
      await controller.seal({ localRecordHash: encrypted.checksumSha256, durationSeconds: preverbalSeconds + wordSilenceSeconds, evidence: { protocol_completed: true, return_confirmed: true, preverbal_observation_seconds: preverbalSeconds, layers_separated: true, prayer_completed: true }, metrics: { preverbal_observation_seconds: preverbalSeconds, integration_seconds: wordSilenceSeconds } });
      setPerception(''); setInterpretation(''); setBelief('');
    } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day016_seal_failed'); }
  }} />;
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ELEMIAH 1/5" />;
}

function Day017({ canon, controller, setLocalError }: Common) {
  const [checks, setChecks] = useState([false, false, false, false]);
  const [seconds, setSeconds] = useState(0);
  const [comfort, setComfort] = useState(5);
  const [spontaneity, setSpontaneity] = useState(5);
  const phase = controller.phase?.id;
  const safe = checks.every(Boolean);

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ELEMIAH 2/5" title="Som sem perda de agência" />;
  if (phase === 'safety') {
    const labels = ['Voz confortável', 'Garganta sem dor', 'Respiração livre', 'Desejo continuar'];
    return <RuntimeCard label="VOICE SAFETY" title="Vocalização é voluntária">{labels.map((label, index) => <Checklist key={label} label={label} checked={checks[index]} onPress={() => setChecks((current) => current.map((value, i) => i === index ? !value : value))} />)}<RuntimePrimary label="INICIAR FLUXO" disabled={!safe} onPress={controller.nextPhase} /></RuntimeCard>;
  }
  if (phase === 'flow') return (
    <RuntimeCard label="FLUXO NÃO SEMÂNTICO" title="Até dez minutos · volume confortável">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="GRAVAÇÃO OPCIONAL">O Dia pode ser concluído sem enviar áudio bruto. O Practice Record guarda apenas métricas estruturadas.</RuntimeNotice>
      <RuntimeTimer value={seconds} target={600} onChange={setSeconds} allowEarlyStop />
      <RuntimePrimary label="ENTRAR NO SILÊNCIO GRADUAL" disabled={seconds === 0} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'silence') return <Grounding controller={controller} text="Reduza a vocalização gradualmente, pare, respire e confirme que o estado foi encerrado voluntariamente." onBeforeReturn={() => controller.setEvidence({ vocalization_completed: true, agency_preserved: true })} />;
  if (phase === 'evidence') return (
    <RuntimeCard label="EVIDÊNCIA" title="Conforto e espontaneidade">
      <RuntimeScale label="CONFORTO VOCAL" value={comfort} onChange={setComfort} />
      <RuntimeScale label="ESPONTANEIDADE" value={spontaneity} onChange={setSpontaneity} />
      <RuntimePrimary label="PREPARAR SELO" onPress={() => { controller.setEvidence({ duration_seconds: seconds, vocal_comfort: comfort, spontaneity_rating: spontaneity }); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'seal') return <Seal controller={controller} onSeal={async () => {
    setLocalError(null);
    try {
      await controller.seal({ durationSeconds: seconds, evidence: { protocol_completed: true, return_confirmed: true, vocalization_completed: true, duration_seconds: seconds, vocal_comfort: comfort, spontaneity_rating: spontaneity, agency_preserved: true }, metrics: { duration_seconds: seconds, vocal_comfort: comfort, spontaneity_rating: spontaneity } });
    } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day017_seal_failed'); }
  }} />;
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ELEMIAH 2/5" />;
}

function Day018({ canon, controller, setLocalError }: Common) {
  const [zones, setZones] = useState([0, 0, 0]);
  const [checked, setChecked] = useState([false, false, false]);
  const [comfort, setComfort] = useState(5);
  const [variation, setVariation] = useState<Variation | null>(null);
  const phase = controller.phase?.id;
  const allZones = checked.every(Boolean);

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ELEMIAH 3/5" title="Perceber vibração sem convertê-la em diagnóstico" />;
  if (phase === 'zones') {
    const names = ['BASE DO CRÂNIO', 'CENTRO DO PEITO', 'REGIÃO UMBILICAL'];
    return (
      <RuntimeCard label="MAPA DE RESSONÂNCIA" title="Três zonas · sensação zero é válida">
        <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
        {names.map((name, index) => <View key={name} style={styles.zone}><Checklist label={`${name} · OBSERVADO`} checked={checked[index]} onPress={() => setChecked((current) => current.map((value, i) => i === index ? !value : value))} /><RuntimeScale label={`${name} · INTENSIDADE`} value={zones[index]} onChange={(value) => setZones((current) => current.map((item, i) => i === index ? value : item))} /></View>)}
        <RuntimeScale label="CONFORTO VOCAL" value={comfort} onChange={setComfort} />
        <RuntimePrimary label="VARIAÇÃO CONTROLADA" disabled={!allZones} onPress={controller.nextPhase} />
      </RuntimeCard>
    );
  }
  if (phase === 'variation') return (
    <RuntimeCard label="UMA VARIÁVEL" title="Variar uma dimensão por vez">
      <View style={runtimeTextStyles.row}>
        <RuntimeChoice selected={variation === 'timbre'} label="TIMBRE" onPress={() => setVariation('timbre')} />
        <RuntimeChoice selected={variation === 'pitch'} label="ALTURA" onPress={() => setVariation('pitch')} />
        <RuntimeChoice selected={variation === 'posture'} label="POSTURA" onPress={() => setVariation('posture')} />
      </View>
      <RuntimeNotice title="SEM FORÇAR SENSAÇÃO">Não sentir vibração em qualquer região continua sendo um resultado válido.</RuntimeNotice>
      <RuntimePrimary label="RETORNAR" disabled={!variation} onPress={() => { controller.setEvidence({ zones_checked: 3, vocal_comfort: comfort, no_forced_sensation: true }); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return <Grounding controller={controller} text="Pare a vocalização, respire normalmente e retorne ao ambiente sem atribuir significado automático às sensações." />;
  if (phase === 'seal') {
    const variationOrdinal = variation === 'timbre' ? 0 : variation === 'pitch' ? 1 : variation === 'posture' ? 2 : null;
    return <Seal controller={controller} onSeal={async () => {
      if (variationOrdinal === null) return;
      setLocalError(null);
      try {
        await controller.seal({ evidence: { protocol_completed: true, return_confirmed: true, zones_checked: 3, vocal_comfort: comfort, no_forced_sensation: true }, metrics: { zone_1_intensity: zones[0], zone_2_intensity: zones[1], zone_3_intensity: zones[2], vocal_comfort: comfort, variation_ordinal: variationOrdinal } });
      } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day018_seal_failed'); }
    }} />;
  }
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ELEMIAH 3/5" />;
}

function Day019Blocker({ canon }: { canon: CanonicalDaySnapshot | null }) {
  return (
    <RuntimeCard label="P0 BLOCKER · ACOUSTIC LAB" title={canon?.title ?? 'Dia 019 · Análise Vocal no App'}>
      <CanonicalText>{canon?.blocks['jachin-doctrine'] ?? 'Conteúdo canônico aguardando sincronização.'}</CanonicalText>
      <RuntimeNotice title="NÃO PUBLICAR MOCK COMO LAB">A QA exige gravação real, waveform real e espectro/spectrograma derivados do áudio capturado. Uma animação decorativa não pode selar este Dia.</RuntimeNotice>
      <Text style={runtimeTextStyles.body}>Estado atual: contrato, banco e gate prontos; captura/análise acústica mobile ainda precisa ser implementada e testada em dispositivo antes de habilitar `INICIAR DIA 019`.</Text>
      <View style={styles.blockerBadge}><Text style={styles.blockerText}>ACOUSTIC_LAB_REQUIRED</Text></View>
    </RuntimeCard>
  );
}

function Day020({ canon, controller, setLocalError }: Common) {
  const [seconds, setSeconds] = useState(0);
  const [firstThought, setFirstThought] = useState<number | null>(null);
  const [presence, setPresence] = useState(5);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ELEMIAH 5/5" title="Terminar o som e retornar ao silêncio" />;
  if (phase === 'quiet') return (
    <RuntimeCard label="PÓS-VOCAL" title="Cinco minutos de repouso">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={seconds} target={300} onChange={setSeconds} />
      <Pressable style={styles.marker} disabled={firstThought !== null} onPress={() => setFirstThought(seconds)}><Text style={styles.markerText}>{firstThought === null ? 'MARCAR PRIMEIRO PENSAMENTO VERBAL' : `PRIMEIRO PENSAMENTO · ${firstThought}s`}</Text></Pressable>
      <RuntimePrimary label="REGISTRAR CONTRASTE" disabled={seconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'record') return (
    <RuntimeCard label="REGISTRO" title="Presença sem exigir vazio perfeito">
      <RuntimeScale label="PRESENÇA" value={presence} onChange={setPresence} />
      <RuntimeNotice title="COMPARAÇÃO LONGITUDINAL">A primeira conclusão usa a condição pós-vocal. A condição controle pode ser realizada em revisitas sem conceder XP novamente.</RuntimeNotice>
      <RuntimePrimary label="RETORNAR" onPress={() => { controller.setEvidence({ quiet_seconds: seconds, presence_rating: presence, comparison_condition: 'post_vocal' }); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return <Grounding controller={controller} text="Mova mãos e pés, abra os olhos quando apropriado e confirme orientação ao ambiente antes do selo." />;
  if (phase === 'seal') return <Seal controller={controller} onSeal={async () => {
    setLocalError(null);
    try {
      await controller.seal({
        durationSeconds: seconds,
        evidence: { protocol_completed: true, return_confirmed: true, quiet_seconds: seconds, presence_rating: presence, comparison_condition: 'post_vocal' },
        remoteEvidence: { protocol_completed: true, return_confirmed: true, quiet_seconds: seconds, presence_rating: presence, post_vocal_condition: true, first_verbal_thought_latency_seconds: firstThought },
        metrics: { quiet_seconds: seconds, presence_rating: presence, first_verbal_thought_latency_seconds: firstThought },
      });
    } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day020_seal_failed'); }
  }} />;
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ELEMIAH 5/5 · FRAGMENTO IV" />;
}

function Threshold({ canon, controller, label, title }: { canon: CanonicalDaySnapshot | null; controller: ReturnType<typeof useHnkDayRuntime>; label: string; title: string }) {
  return <RuntimeCard label={label} title={canon?.title ?? title}><CanonicalText>{canon?.blocks['jachin-doctrine'] ?? 'Conteúdo canônico aguardando sincronização.'}</CanonicalText><RuntimeNotice title="SINAL · CORPO · FENOMENOLOGIA · INTERPRETAÇÃO">Elemiah mantém essas camadas distintas. A UI não converte sensação ou gráfico em prova espiritual/biomédica.</RuntimeNotice><RuntimePrimary label={controller.busy ? 'CRIANDO SESSÃO…' : controller.runtime?.mode === 'revisit' ? 'REVISITAR' : 'INICIAR'} disabled={controller.busy || !canon} onPress={() => void controller.begin().then(() => controller.nextPhase()).catch(() => undefined)} /></RuntimeCard>;
}

function Grounding({ controller, text, onBeforeReturn }: { controller: ReturnType<typeof useHnkDayRuntime>; text: string; onBeforeReturn?: () => void }) {
  return <RuntimeCard label="RETORNO" title="Estado reversível"><Text style={runtimeTextStyles.body}>{text}</Text><RuntimePrimary label="CONFIRMAR RETORNO" onPress={() => { onBeforeReturn?.(); controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard>;
}

function Seal({ controller, onSeal }: { controller: ReturnType<typeof useHnkDayRuntime>; onSeal: () => Promise<void> }) {
  return <RuntimeCard label="SELO" title="Confirmar pelo servidor"><Text style={runtimeTextStyles.body}>Somente evidência estruturada atravessa esta fronteira. XP e fragmento permanecem server-derived.</Text><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA'} disabled={controller.busy} onPress={() => void onSeal()} /></RuntimeCard>;
}

function Checklist({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return <Pressable style={[styles.check, checked && styles.checkDone]} onPress={onPress}><Text style={styles.checkMark}>{checked ? '✓' : '○'}</Text><Text style={styles.checkText}>{label}</Text></Pressable>;
}

function Frame({ day, canon, controller, children }: { day: ElemiahDay; canon: CanonicalDaySnapshot | null; controller: ReturnType<typeof useHnkDayRuntime>; children: ReactNode }) {
  return <View style={styles.screen}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.header}><View><Text style={styles.eyebrow}>KETHER · CICLO IV · ELEMIAH · {day - 15}/5</Text><Text style={styles.title}>{canon?.title ?? `DIA ${String(day).padStart(3, '0')}`}</Text></View><View style={styles.account}><Text style={styles.accountText}>{controller.progress?.initiatoryTitle?.toUpperCase() ?? 'NEÓFITO'}</Text><Text style={styles.accountText}>{controller.progress?.xpTotal ?? 0} XP</Text></View></View><View style={styles.source}><Text style={styles.sourceText}>CÂNONE · {canon?.sourceSha.slice(0, 10) ?? 'AGUARDANDO SYNC'}</Text><Text style={styles.sourceText}>XP · {canon?.xp ?? '—'}</Text><Text style={styles.sourceText}>STATE · {controller.runtime?.status ?? 'LOADING'}</Text></View>{children}</ScrollView></View>;
}

function Loading() { return <View style={styles.loading}><ActivityIndicator color="#efe0a2" /><Text style={styles.loadingText}>LENDO ELEMIAH</Text></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#030406' },
  loadingText: { color: '#786d49', fontSize: 9, letterSpacing: 1.5 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 90, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start' },
  eyebrow: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.6 },
  title: { color: '#fffaf0', fontSize: 27, lineHeight: 33, fontWeight: '300', marginTop: 7 },
  account: { alignItems: 'flex-end', gap: 4 },
  accountText: { color: '#73756f', fontSize: 8, letterSpacing: 1.1 },
  source: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#202126', paddingVertical: 10 },
  sourceText: { color: '#5f6167', fontSize: 8, letterSpacing: 1 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#303137', borderRadius: 13, padding: 12, backgroundColor: '#08090d' },
  checkDone: { borderColor: '#6b5e36', backgroundColor: '#151207' },
  checkMark: { color: '#dec77b', fontSize: 17 },
  checkText: { flex: 1, color: '#b8b19b', fontSize: 11, lineHeight: 17 },
  zone: { borderWidth: 1, borderColor: '#27282c', borderRadius: 16, padding: 12, gap: 10 },
  blockerBadge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: '#65413b', backgroundColor: '#160c0b', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  blockerText: { color: '#d39a91', fontSize: 9, letterSpacing: 1.1, fontWeight: '700' },
  marker: { borderWidth: 1, borderColor: '#4a4430', borderRadius: 13, padding: 13, backgroundColor: '#0d0c08' },
  markerText: { color: '#c8b97e', fontSize: 9, letterSpacing: 1 },
});
