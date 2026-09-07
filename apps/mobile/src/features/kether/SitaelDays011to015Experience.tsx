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
  SITAEL_DAY_011,
  SITAEL_DAY_012,
  SITAEL_DAY_013,
  SITAEL_DAY_014,
  SITAEL_DAY_015,
} from './day-definitions';
import {
  CanonicalText,
  RuntimeCard,
  RuntimeChoice,
  RuntimeCompletion,
  RuntimeCounter,
  RuntimeNotice,
  RuntimePrimary,
  RuntimeScale,
  RuntimeTimer,
  runtimeTextStyles,
} from './KetherRuntimePrimitives';
import { useHnkDayRuntime } from './useHnkDayRuntime';

type SitaelDay = 11 | 12 | 13 | 14 | 15;
type ClosureMethod = 'fire' | 'tear';

const DEFINITIONS: Record<SitaelDay, DayDefinition> = {
  11: SITAEL_DAY_011,
  12: SITAEL_DAY_012,
  13: SITAEL_DAY_013,
  14: SITAEL_DAY_014,
  15: SITAEL_DAY_015,
};

export function SitaelDays011to015Experience({ day }: { day: SitaelDay }) {
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

  const common = { canon, controller, setLocalError };
  return (
    <Frame day={day} canon={canon} controller={controller}>
      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O app não cria uma cópia substituta do texto; sincronize o `codex_days` para executar esta prática.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="SELO INTERROMPIDO">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? (
        <RuntimeCard label="GATE" title="Dia bloqueado pelo servidor">
          <Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia anterior. Revisitas de Dias já concluídos continuam independentes.</Text>
        </RuntimeCard>
      ) : null}
      {controller.runtime?.status !== 'locked' && day === 11 ? <Day011 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && day === 12 ? <Day012 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && day === 13 ? <Day013 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && day === 14 ? <Day014 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && day === 15 ? <Day015 {...common} /> : null}
    </Frame>
  );
}

type CommonProps = {
  canon: CanonicalDaySnapshot | null;
  controller: ReturnType<typeof useHnkDayRuntime>;
  setLocalError: (value: string | null) => void;
};

function Day011({ canon, controller, setLocalError }: CommonProps) {
  const [seconds, setSeconds] = useState(0);
  const [judgments, setJudgments] = useState(0);
  const [attention, setAttention] = useState(5);
  const [observations, setObservations] = useState(['', '', '']);
  const [interpretation, setInterpretation] = useState('');
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="SITAEL 1/5" title="Observar antes de julgar" />;
  if (phase === 'mirror') return (
    <RuntimeCard label="ESPELHO" title="Percepção antes de avaliação">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="SEM ANÁLISE FACIAL">O exercício usa espelho físico. O app não pontua beleza, não reconhece rosto e não aplica filtros.</RuntimeNotice>
      <RuntimeTimer value={seconds} target={300} onChange={setSeconds} />
      <RuntimeCounter label="JULGAMENTO AUTOMÁTICO PERCEBIDO" value={judgments} onPress={() => setJudgments((value) => value + 1)} />
      <RuntimeScale label="ESTABILIDADE DA ATENÇÃO" value={attention} onChange={setAttention} />
      <RuntimePrimary label="SEPARAR OBSERVAÇÃO E INTERPRETAÇÃO" disabled={seconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'split') return (
    <RuntimeCard label="TRÊS OBSERVAÇÕES" title="Descrever sem converter em identidade">
      {observations.map((value, index) => <TextInput key={index} value={value} onChangeText={(text) => setObservations((current) => current.map((item, i) => i === index ? text : item))} placeholder={`OBSERVAÇÃO ${index + 1} · Vault privado`} placeholderTextColor="#676970" style={runtimeTextStyles.input} />)}
      <TextInput value={interpretation} onChangeText={setInterpretation} placeholder="O que minha mente acrescentou · opcional · Vault" placeholderTextColor="#676970" multiline style={runtimeTextStyles.textArea} />
      <RuntimePrimary label="ENTRAR NO GROUNDING" disabled={observations.some((value) => value.trim().length === 0)} onPress={() => {
        controller.setEvidence({ observations_logged_count: 3, judgments_noticed: judgments, attention_stability: attention, practice_seconds: seconds });
        controller.nextPhase();
      }} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return <Grounding controller={controller} text="Pisque, mova os olhos e nomeie três objetos reais do ambiente. Distorsões visuais não são tratadas como revelação externa." />;
  if (phase === 'seal') return (
    <Seal
      controller={controller}
      onSeal={async () => {
        if (!controller.auth.client || !controller.auth.userId) return;
        setLocalError(null);
        try {
          const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 11, kind: 'mirror', plaintext: JSON.stringify({ schema: 'hnk-day011-mirror-v1', observations: observations.map((value) => value.trim()), interpretation: interpretation.trim() || null }) });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 11, payload: encrypted });
          await controller.seal({
            localRecordHash: encrypted.checksumSha256,
            durationSeconds: seconds,
            evidence: { protocol_completed: true, return_confirmed: true, practice_seconds: seconds, observations_logged_count: 3, judgments_noticed: judgments, attention_stability: attention },
            metrics: { practice_seconds: seconds, observations_logged_count: 3, judgments_noticed: judgments, attention_stability: attention },
          });
          setObservations(['', '', '']);
          setInterpretation('');
        } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day011_seal_failed'); }
      }}
    />
  );
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="SITAEL 1/5" />;
}

function Day012({ canon, controller, setLocalError }: CommonProps) {
  const [checks, setChecks] = useState([false, false, false, false, false]);
  const [seconds, setSeconds] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [attention, setAttention] = useState(5);
  const phase = controller.phase?.id;
  const safe = checks.every(Boolean);

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="SITAEL 2/5" title="Sustentar sem sofrimento" />;
  if (phase === 'safety') {
    const labels = ['Vela em superfície firme', 'Materiais inflamáveis afastados', 'Chama supervisionada', 'Estou alerta e confortável', 'Posso encerrar a qualquer momento'];
    return (
      <RuntimeCard label="FIRE SAFETY GATE" title="Antes de acender a chama">
        {labels.map((label, index) => <Checklist key={label} label={label} checked={checks[index]} onPress={() => setChecks((current) => current.map((value, i) => i === index ? !value : value))} />)}
        <RuntimePrimary label="ABRIR TRATAKA" disabled={!safe} onPress={controller.nextPhase} />
      </RuntimeCard>
    );
  }
  if (phase === 'trataka') return (
    <RuntimeCard label="TRATAKA" title="Foco vivo, piscar permitido">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="LIMITE, NÃO META">A sessão pode durar até 10 minutos. Piscar e encerrar por desconforto ocular são válidos; o tempo não vira ranking.</RuntimeNotice>
      <RuntimeTimer value={seconds} target={600} onChange={setSeconds} allowEarlyStop />
      <RuntimeCounter label="DISTRAÇÃO / RETORNO" value={distractions} onPress={() => setDistractions((value) => value + 1)} />
      <RuntimeScale label="ESTABILIDADE" value={attention} onChange={setAttention} />
      <RuntimePrimary label="ENCERRAR A PRÁTICA" disabled={seconds === 0} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return <Grounding controller={controller} text="Afaste o olhar da chama, pisque normalmente e confirme conforto ocular e orientação ao ambiente." />;
  if (phase === 'seal') return (
    <Seal controller={controller} onSeal={async () => {
      setLocalError(null);
      try {
        await controller.seal({
          durationSeconds: seconds,
          evidence: { protocol_completed: true, return_confirmed: true, safety_check_completed: safe, practice_seconds: seconds, distractions, attention_stability: attention },
          metrics: { practice_seconds: seconds, distractions, attention_stability: attention },
        });
      } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day012_seal_failed'); }
    }} />
  );
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="SITAEL 2/5" />;
}

function Day013({ canon, controller, setLocalError }: CommonProps) {
  const [lastCorrect, setLastCorrect] = useState('1000');
  const [errors, setErrors] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [attention, setAttention] = useState(5);
  const [effort, setEffort] = useState(5);
  const phase = controller.phase?.id;
  const last = Number(lastCorrect);
  const valid = Number.isInteger(last);

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="SITAEL 3/5" title="Corrigir sem se punir" />;
  if (phase === 'crusher') return (
    <RuntimeCard label="TRITURADOR" title="1000 − 7 · sem resposta na tela">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="SEM SPEEDRUN">O app não revela o próximo número, não cria combo e não mede valor pessoal por velocidade.</RuntimeNotice>
      <RuntimeCounter label="ERRO PERCEBIDO" value={errors} onPress={() => setErrors((value) => value + 1)} />
      <RuntimeCounter label="DISTRAÇÃO PERCEBIDA" value={distractions} onPress={() => setDistractions((value) => value + 1)} />
      <TextInput value={lastCorrect} onChangeText={setLastCorrect} keyboardType="number-pad" placeholder="Último número correto" placeholderTextColor="#676970" style={runtimeTextStyles.input} />
      <RuntimePrimary label="REVISAR A RECUPERAÇÃO" disabled={!valid} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'recovery') return (
    <RuntimeCard label="RETORNO" title="Erro → último ponto confiável → continuidade">
      <RuntimeScale label="ESTABILIDADE" value={attention} onChange={setAttention} />
      <RuntimeScale label="ESFORÇO PERCEBIDO" value={effort} onChange={setEffort} />
      <RuntimePrimary label="ENCERRAR CARGA COGNITIVA" onPress={() => {
        controller.setEvidence({ start_number: 1000, last_correct_number: last, errors, distractions, attention_stability: attention });
        controller.nextPhase();
      }} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return <Grounding controller={controller} text="Pare a sequência, observe o ambiente e encerre se houver fadiga relevante ou dor de cabeça." />;
  if (phase === 'seal') return (
    <Seal controller={controller} onSeal={async () => {
      setLocalError(null);
      try {
        await controller.seal({
          evidence: { protocol_completed: true, return_confirmed: true, start_number: 1000, last_correct_number: last, errors, distractions, attention_stability: attention },
          metrics: { last_correct_number: last, errors, distractions, attention_stability: attention, effort_rating: effort },
        });
      } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day013_seal_failed'); }
    }} />
  );
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="SITAEL 3/5" />;
}

function Day014({ canon, controller, setLocalError }: CommonProps) {
  const [seconds, setSeconds] = useState(0);
  const [returns, setReturns] = useState(0);
  const [reconstructions, setReconstructions] = useState(0);
  const [attention, setAttention] = useState(5);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="SITAEL 4/5" title="Dirigir um único objeto interno" />;
  if (phase === 'reference') return (
    <RuntimeCard label="REFERÊNCIA" title="Círculo azul · estudo breve">
      <View style={styles.blueCircle} />
      <RuntimeNotice title="REFERÊNCIA, NÃO GABARITO">A forma é apresentada antes da prática. Durante o foco interno a tela deixa de ser o objeto da concentração.</RuntimeNotice>
      <RuntimePrimary label="APAGAR A REFERÊNCIA" onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'internal-focus') return (
    <RuntimeCard label="FOCO INTERNO" title="Cinco minutos · reconstruir quando necessário">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={seconds} target={300} onChange={setSeconds} />
      <RuntimeCounter label="RETORNO AO OBJETO" value={returns} onPress={() => setReturns((value) => value + 1)} />
      <RuntimeCounter label="RECONSTRUÇÃO CONSCIENTE" value={reconstructions} onPress={() => setReconstructions((value) => value + 1)} />
      <RuntimePrimary label="REGISTRAR" disabled={seconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'reconstruction') return (
    <RuntimeCard label="REGISTRO" title="Estabilidade, não perfeição">
      <RuntimeScale label="ESTABILIDADE DA ATENÇÃO" value={attention} onChange={setAttention} />
      <RuntimePrimary label="VOLTAR AOS OBJETOS REAIS" onPress={() => {
        controller.setEvidence({ practice_seconds: seconds, returns, reconstructions, attention_stability: attention });
        controller.nextPhase();
      }} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return <Grounding controller={controller} text="Deixe a imagem desaparecer voluntariamente, abra os olhos e identifique três objetos reais. Imaginar, perceber e interpretar continuam distintos." />;
  if (phase === 'seal') return (
    <Seal controller={controller} onSeal={async () => {
      setLocalError(null);
      try {
        await controller.seal({
          durationSeconds: seconds,
          evidence: { protocol_completed: true, return_confirmed: true, practice_seconds: seconds, returns, reconstructions, attention_stability: attention },
          metrics: { practice_seconds: seconds, returns, reconstructions, attention_stability: attention },
        });
      } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day014_seal_failed'); }
    }} />
  );
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="SITAEL 4/5" />;
}

function Day015({ canon, controller, setLocalError }: CommonProps) {
  const [patterns, setPatterns] = useState(['', '', '']);
  const [method, setMethod] = useState<ClosureMethod | null>(null);
  const [fireChecks, setFireChecks] = useState([false, false, false, false, false, false]);
  const [closureCompleted, setClosureCompleted] = useState(false);
  const [commitment, setCommitment] = useState('');
  const [discipline, setDiscipline] = useState(5);
  const phase = controller.phase?.id;
  const fireSafe = fireChecks.every(Boolean);
  const methodReady = method === 'tear' || (method === 'fire' && fireSafe);

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="SITAEL 5/5" title="Nomear, encerrar, retornar" />;
  if (phase === 'externalize') return (
    <RuntimeCard label="EXTERNALIZAR" title="Três padrões, sem confundir padrão com identidade">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      {patterns.map((value, index) => <TextInput key={index} value={value} onChangeText={(text) => setPatterns((current) => current.map((item, i) => i === index ? text : item))} placeholder={`PADRÃO ${index + 1} · Vault privado`} placeholderTextColor="#676970" style={runtimeTextStyles.input} />)}
      <RuntimePrimary label="ESCOLHER MÉTODO DE ENCERRAMENTO" disabled={patterns.some((value) => value.trim().length === 0)} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'method') {
    const fireLabels = ['Superfície estável', 'Recipiente resistente ao calor', 'Inflamáveis afastados', 'Água disponível', 'Material seguro/conhecido', 'Chama supervisionada até apagar'];
    return (
      <RuntimeCard label="MÉTODO" title="Rasgar e fogo têm igual validade canônica">
        <View style={runtimeTextStyles.row}>
          <RuntimeChoice selected={method === 'tear'} label="RASGAR PAPEL" onPress={() => setMethod('tear')} />
          <RuntimeChoice selected={method === 'fire'} label="FOGO · COM GATE" onPress={() => setMethod('fire')} />
        </View>
        {method === 'fire' ? <View style={styles.checkGroup}>{fireLabels.map((label, index) => <Checklist key={label} label={label} checked={fireChecks[index]} onPress={() => setFireChecks((current) => current.map((value, i) => i === index ? !value : value))} />)}</View> : null}
        <RuntimeNotice title="SEGURANÇA ACIMA DA TEATRALIDADE">Escolher `tear` não reduz XP nem qualidade da conclusão. Fogo só segue quando o gate inteiro estiver confirmado.</RuntimeNotice>
        <RuntimePrimary label="REALIZAR ENCERRAMENTO" disabled={!methodReady} onPress={controller.nextPhase} />
      </RuntimeCard>
    );
  }
  if (phase === 'closure') return (
    <RuntimeCard label="ENCERRAMENTO" title="A representação termina; você continua responsável">
      <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
      <Checklist label="ENCERRAMENTO MATERIAL CONCLUÍDO COM SEGURANÇA" checked={closureCompleted} onPress={() => setClosureCompleted((value) => !value)} />
      <RuntimePrimary label="DEFINIR AÇÃO DE AMANHÃ" disabled={!closureCompleted} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'commitment') return (
    <RuntimeCard label="RETORNO DISCIPLINADO" title="Uma ação concreta para amanhã">
      <TextInput value={commitment} onChangeText={setCommitment} placeholder="DISCIPLINA CONCRETA · Vault privado" placeholderTextColor="#676970" multiline style={runtimeTextStyles.textArea} />
      <RuntimeScale label="DISPOSIÇÃO / DISCIPLINA" value={discipline} onChange={setDiscipline} />
      <RuntimePrimary label="RETORNAR" disabled={commitment.trim().length === 0} onPress={() => {
        controller.setEvidence({ patterns_externalized_count: 3, action_commitment_created: true, discipline_rating: discipline, destruction_method: method ?? 'tear', closure_completed: closureCompleted });
        controller.nextPhase();
      }} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return <Grounding controller={controller} text="Confirme que o rito terminou e que a decisão será provada por comportamento, não por intensidade do gesto simbólico." />;
  if (phase === 'seal') {
    const methodOrdinal = method === 'fire' ? 1 : 0;
    return (
      <Seal controller={controller} onSeal={async () => {
        if (!method || !controller.auth.client || !controller.auth.userId) return;
        setLocalError(null);
        try {
          const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 15, kind: 'journal', plaintext: JSON.stringify({ schema: 'hnk-day015-release-v1', patterns: patterns.map((value) => value.trim()), commitment: commitment.trim(), method }) });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 15, payload: encrypted });
          await controller.seal({
            localRecordHash: encrypted.checksumSha256,
            evidence: { protocol_completed: true, return_confirmed: true, patterns_externalized_count: 3, action_commitment_created: true, discipline_rating: discipline, destruction_method: method, closure_completed: closureCompleted },
            remoteEvidence: { protocol_completed: true, return_confirmed: true, patterns_externalized_count: 3, action_commitment_created: true, discipline_rating: discipline, destruction_method_ordinal: methodOrdinal, closure_completed: closureCompleted, fire_safety_gate_completed: method === 'fire' ? fireSafe : null },
            metrics: { discipline_rating: discipline, destruction_method_ordinal: methodOrdinal },
          });
          setPatterns(['', '', '']);
          setCommitment('');
        } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day015_seal_failed'); }
      }} />
    );
  }
  return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="SITAEL 5/5 · FRAGMENTO III" />;
}

function Threshold({ canon, controller, label, title }: { canon: CanonicalDaySnapshot | null; controller: ReturnType<typeof useHnkDayRuntime>; label: string; title: string }) {
  return (
    <RuntimeCard label={label} title={canon?.title ?? title}>
      <CanonicalText>{canon?.blocks['jachin-doctrine'] ?? 'Conteúdo canônico aguardando sincronização.'}</CanonicalText>
      <RuntimeNotice title="DISCIPLINA ≠ VIOLÊNCIA CONTRA SI">Distração, erro e necessidade legítima de interromper são dados. O HNK Product não transforma sofrimento em score.</RuntimeNotice>
      <RuntimePrimary label={controller.busy ? 'CRIANDO SESSÃO…' : controller.runtime?.mode === 'revisit' ? 'REVISITAR' : 'INICIAR'} disabled={controller.busy || !canon} onPress={() => void controller.begin().then(() => controller.nextPhase()).catch(() => undefined)} />
    </RuntimeCard>
  );
}

function Grounding({ controller, text }: { controller: ReturnType<typeof useHnkDayRuntime>; text: string }) {
  return <RuntimeCard label="GROUNDING" title="Retorno voluntário"><Text style={runtimeTextStyles.body}>{text}</Text><RuntimePrimary label="CONFIRMAR RETORNO" onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard>;
}

function Seal({ controller, onSeal }: { controller: ReturnType<typeof useHnkDayRuntime>; onSeal: () => Promise<void> }) {
  return <RuntimeCard label="SELO" title="Confirmar pelo backend"><Text style={runtimeTextStyles.body}>O cliente envia somente evidência estruturada e hashes privados. XP e fragmento permanecem server-derived.</Text><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA'} disabled={controller.busy} onPress={() => void onSeal()} /></RuntimeCard>;
}

function Checklist({ label, checked, onPress }: { label: string; checked: boolean; onPress: () => void }) {
  return <Pressable style={[styles.check, checked && styles.checkDone]} onPress={onPress}><Text style={styles.checkMark}>{checked ? '✓' : '○'}</Text><Text style={styles.checkText}>{label}</Text></Pressable>;
}

function Frame({ day, canon, controller, children }: { day: SitaelDay; canon: CanonicalDaySnapshot | null; controller: ReturnType<typeof useHnkDayRuntime>; children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>KETHER · CICLO III · SITAEL · {day - 10}/5</Text><Text style={styles.title}>{canon?.title ?? `DIA ${String(day).padStart(3, '0')}`}</Text></View>
          <View style={styles.account}><Text style={styles.accountText}>{controller.progress?.initiatoryTitle?.toUpperCase() ?? 'NEÓFITO'}</Text><Text style={styles.accountText}>{controller.progress?.xpTotal ?? 0} XP</Text></View>
        </View>
        <View style={styles.source}><Text style={styles.sourceText}>CÂNONE · {canon?.sourceSha.slice(0, 10) ?? 'AGUARDANDO SYNC'}</Text><Text style={styles.sourceText}>XP · {canon?.xp ?? '—'}</Text><Text style={styles.sourceText}>STATE · {controller.runtime?.status ?? 'LOADING'}</Text></View>
        {children}
      </ScrollView>
    </View>
  );
}

function Loading() { return <View style={styles.loading}><ActivityIndicator color="#efe0a2" /><Text style={styles.loadingText}>LENDO SITAEL</Text></View>; }

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
  checkGroup: { gap: 8 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#303137', borderRadius: 13, padding: 12, backgroundColor: '#08090d' },
  checkDone: { borderColor: '#6b5e36', backgroundColor: '#151207' },
  checkMark: { color: '#dec77b', fontSize: 17 },
  checkText: { flex: 1, color: '#b8b19b', fontSize: 11, lineHeight: 17 },
  blueCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#4b73d7', backgroundColor: '#102454', alignSelf: 'center' },
});
