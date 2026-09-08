import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { DayDefinition } from '@hnk/day-runtime';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import {
  LELAHEL_DAY_026,
  LELAHEL_DAY_027,
  LELAHEL_DAY_029,
} from './runtime-definitions/lelahel';
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

type LelahelExecutableDay = 26 | 27 | 29;
type Controller = ReturnType<typeof useHnkDayRuntime>;
type ClosureMethod = 'tear' | 'clay' | 'erase';

const DEFINITIONS: Record<LelahelExecutableDay, DayDefinition> = {
  26: LELAHEL_DAY_026,
  27: LELAHEL_DAY_027,
  29: LELAHEL_DAY_029,
};

export function LelahelExecutableExperience({ day }: { day: LelahelExecutableDay }) {
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

  if (controller.loading) {
    return <View style={styles.loading}><Text style={styles.meta}>ABRINDO LELAHEL · DIA {String(day).padStart(3, '0')}</Text></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>KETHER · LELAHEL {day - 25}/5 · DIA {String(day).padStart(3, '0')}</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O app não cria uma cópia substituta do texto. Sincronize `codex_days` para executar esta prática.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="SELO INTERROMPIDO">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia bloqueado"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia imediatamente anterior.</Text></RuntimeCard> : null}

      {controller.runtime?.status !== 'locked' && day === 26 ? <Day026 canon={canon} controller={controller} /> : null}
      {controller.runtime?.status !== 'locked' && day === 27 ? <Day027 canon={canon} controller={controller} /> : null}
      {controller.runtime?.status !== 'locked' && day === 29 ? <Day029 canon={canon} controller={controller} setLocalError={setLocalError} /> : null}
    </ScrollView>
  );
}

function Threshold({ canon, controller, label, title }: { canon: CanonicalDaySnapshot | null; controller: Controller; label: string; title: string }) {
  if (controller.phase?.id !== 'threshold') return null;
  return (
    <RuntimeCard label={label} title={title}>
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="DISCRIMINAÇÃO HNK">Sinal, corpo, fenomenologia e interpretação permanecem separados. Intensidade não funciona como score espiritual.</RuntimeNotice>
      <RuntimePrimary label="INICIAR PRÁTICA" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
    </RuntimeCard>
  );
}

function Day026({ canon, controller }: { canon: CanonicalDaySnapshot | null; controller: Controller }) {
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [activeDispersions, setActiveDispersions] = useState(0);
  const [controlDispersions, setControlDispersions] = useState(0);
  const [activeIntensity, setActiveIntensity] = useState(5);
  const [controlIntensity, setControlIntensity] = useState(5);
  const [activePresence, setActivePresence] = useState(5);
  const [controlPresence, setControlPresence] = useState(5);
  const [comparisonViewed, setComparisonViewed] = useState(false);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="LELAHEL 1/5" title="Localizar sem confundir mapas" />;

  if (phase === 'active') return (
    <RuntimeCard label="A · FOCO FRONTAL" title="7 minutos · olhos e face relaxados">
      <RuntimeNotice title="SEGURANÇA OCULAR">Não pressione os olhos e não franza a testa para fabricar resposta. Dor ocular, cefaleia intensa, tontura ou alteração visual relevante encerram a etapa.</RuntimeNotice>
      <RuntimeTimer value={activeSeconds} target={420} onChange={setActiveSeconds} />
      <RuntimeCounter label="DISPERSÃO / RETORNO" value={activeDispersions} onPress={() => setActiveDispersions((value) => value + 1)} />
      <RuntimeScale label="INTENSIDADE PERCEBIDA" value={activeIntensity} onChange={setActiveIntensity} />
      <RuntimeScale label="PRESENÇA" value={activePresence} onChange={setActivePresence} />
      <RuntimePrimary label="RETORNO NEUTRO" disabled={activeSeconds < 420} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'neutral-reset') return (
    <RuntimeCard label="RESET" title="Soltar o foco antes do controle">
      <Text style={runtimeTextStyles.body}>Abra os olhos, mova-os naturalmente e reconheça o ambiente antes de iniciar a condição controle.</Text>
      <RuntimePrimary label="ESTOU ORIENTADO" onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'control') return (
    <RuntimeCard label="B · PONTO NEUTRO" title="Mesma duração · sem fórmula teúrgica">
      <Text style={runtimeTextStyles.body}>Use o ponto corporal neutro indicado pelo cânone, como a ponta do nariz, preservando postura e respiração comparáveis.</Text>
      <RuntimeTimer value={controlSeconds} target={420} onChange={setControlSeconds} />
      <RuntimeCounter label="DISPERSÃO / RETORNO" value={controlDispersions} onPress={() => setControlDispersions((value) => value + 1)} />
      <RuntimeScale label="INTENSIDADE PERCEBIDA" value={controlIntensity} onChange={setControlIntensity} />
      <RuntimeScale label="PRESENÇA" value={controlPresence} onChange={setControlPresence} />
      <RuntimePrimary label="COMPARAR" disabled={controlSeconds < 420} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'comparison') return (
    <RuntimeCard label="COMPARAÇÃO" title="Diferença observada não é diagnóstico">
      <Text style={styles.delta}>INTENSIDADE · A {activeIntensity}/10 · B {controlIntensity}/10 · Δ {activeIntensity - controlIntensity}</Text>
      <Text style={styles.delta}>PRESENÇA · A {activePresence}/10 · B {controlPresence}/10 · Δ {activePresence - controlPresence}</Text>
      <Text style={styles.delta}>DISPERSÕES · A {activeDispersions} · B {controlDispersions}</Text>
      <RuntimeNotice title="EPISTEMOLOGIA">A comparação descreve o protocolo HNK. Ela não declara Ajna, Brodmann 10 ou qualquer mecanismo externo como comprovado.</RuntimeNotice>
      <RuntimePrimary label={comparisonViewed ? 'COMPARAÇÃO REGISTRADA' : 'REGISTRAR COMPARAÇÃO'} onPress={() => { setComparisonViewed(true); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (phase === 'grounding') return <Grounding controller={controller} />;

  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Lelahel 1/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 026'} disabled={controller.busy || !comparisonViewed} onPress={() => void controller.seal({
        durationSeconds: activeSeconds + controlSeconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          active_condition_completed: activeSeconds >= 420,
          control_condition_completed: controlSeconds >= 420,
          comparison_logged: comparisonViewed,
          dispersions_logged: true,
        },
        metrics: {
          active_seconds: activeSeconds,
          control_seconds: controlSeconds,
          active_dispersions: activeDispersions,
          control_dispersions: controlDispersions,
          active_intensity: activeIntensity,
          control_intensity: controlIntensity,
          active_presence: activePresence,
          control_presence: controlPresence,
        },
      }).then(controller.nextPhase)} />
    </RuntimeCard>
  );

  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="LELAHEL 1/5" />;
  return null;
}

function Day027({ canon, controller }: { canon: CanonicalDaySnapshot | null; controller: Controller }) {
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [activeDisappearances, setActiveDisappearances] = useState(0);
  const [controlDisappearances, setControlDisappearances] = useState(0);
  const [activeReconstructions, setActiveReconstructions] = useState(0);
  const [controlReconstructions, setControlReconstructions] = useState(0);
  const [activeClarity, setActiveClarity] = useState(5);
  const [controlClarity, setControlClarity] = useState(5);
  const [groundingItems, setGroundingItems] = useState(0);
  const [comparisonViewed, setComparisonViewed] = useState(false);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="LELAHEL 2/5" title="Construir, perder e recuperar uma imagem" />;

  if (phase === 'reference') return (
    <RuntimeCard label="REFERÊNCIA" title="Pérola Azul · estudo antes da prática">
      <View style={styles.pearlStage}><View style={styles.bluePearl} /></View>
      <RuntimeNotice title="REFERÊNCIA, NÃO FENÔMENO">Este ponto cobalto serve apenas como referência deliberada. Flashes espontâneos posteriores são registrados separadamente e não viram badge.</RuntimeNotice>
      <RuntimePrimary label="APAGAR REFERÊNCIA" onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'active') return (
    <RuntimeCard label="A · BLUE PEARL" title="10 minutos · reconstrução consciente">
      <Text style={runtimeTextStyles.body}>Durante a etapa principal, use a imagem interna. Pisque/relaxe quando necessário; desconforto ocular relevante encerra a prática.</Text>
      <RuntimeTimer value={activeSeconds} target={600} onChange={setActiveSeconds} />
      <RuntimeCounter label="DESAPARECIMENTOS" value={activeDisappearances} onPress={() => setActiveDisappearances((value) => value + 1)} />
      <RuntimeCounter label="RECONSTRUÇÕES" value={activeReconstructions} onPress={() => setActiveReconstructions((value) => value + 1)} />
      <RuntimeScale label="NITIDEZ" value={activeClarity} onChange={setActiveClarity} />
      <RuntimePrimary label="RETORNO NEUTRO" disabled={activeSeconds < 600} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'neutral-reset') return (
    <RuntimeCard label="RESET" title="Olhos abertos · ambiente real">
      <Text style={runtimeTextStyles.body}>Abra os olhos gradualmente e interrompa a continuidade da imagem antes da condição cinza.</Text>
      <RuntimePrimary label="INICIAR CONTROLE" onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'control') return (
    <RuntimeCard label="B · GREY POINT" title="Mesmo tamanho, posição e duração">
      <Text style={runtimeTextStyles.body}>Construa um ponto cinza neutro sem tentar torná-lo pior que a condição ativa.</Text>
      <RuntimeTimer value={controlSeconds} target={600} onChange={setControlSeconds} />
      <RuntimeCounter label="DESAPARECIMENTOS" value={controlDisappearances} onPress={() => setControlDisappearances((value) => value + 1)} />
      <RuntimeCounter label="RECONSTRUÇÕES" value={controlReconstructions} onPress={() => setControlReconstructions((value) => value + 1)} />
      <RuntimeScale label="NITIDEZ" value={controlClarity} onChange={setControlClarity} />
      <RuntimePrimary label="COMPARAR" disabled={controlSeconds < 600} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'comparison') return (
    <RuntimeCard label="VISUAL STABILITY" title="Imagem deliberada ≠ evento espontâneo">
      <Text style={styles.delta}>NITIDEZ · AZUL {activeClarity}/10 · CINZA {controlClarity}/10</Text>
      <Text style={styles.delta}>DESAPARECIMENTOS · AZUL {activeDisappearances} · CINZA {controlDisappearances}</Text>
      <Text style={styles.delta}>RECONSTRUÇÕES · AZUL {activeReconstructions} · CINZA {controlReconstructions}</Text>
      <RuntimePrimary label="REGISTRAR COMPARAÇÃO" onPress={() => { setComparisonViewed(true); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (phase === 'grounding') return (
    <RuntimeCard label="GROUNDING VISUAL" title="Três objetos reais">
      <RuntimeCounter label="OBJETOS IDENTIFICADOS" value={groundingItems} onPress={() => setGroundingItems((value) => Math.min(3, value + 1))} />
      <RuntimePrimary label="ESTOU ORIENTADO" disabled={groundingItems < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Lelahel 2/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 027'} disabled={controller.busy || !comparisonViewed || groundingItems < 3} onPress={() => void controller.seal({
        durationSeconds: activeSeconds + controlSeconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          blue_condition_completed: activeSeconds >= 600,
          grey_control_completed: controlSeconds >= 600,
          visual_comparison_logged: comparisonViewed,
          grounding_completed: groundingItems >= 3,
        },
        metrics: {
          active_seconds: activeSeconds,
          control_seconds: controlSeconds,
          active_disappearances: activeDisappearances,
          control_disappearances: controlDisappearances,
          active_reconstructions: activeReconstructions,
          control_reconstructions: controlReconstructions,
          active_clarity: activeClarity,
          control_clarity: controlClarity,
        },
      }).then(controller.nextPhase)} />
    </RuntimeCard>
  );

  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="LELAHEL 2/5" />;
  return null;
}

function Day029({ canon, controller, setLocalError }: { canon: CanonicalDaySnapshot | null; controller: Controller; setLocalError: (value: string | null) => void }) {
  const [patterns, setPatterns] = useState(['', '', '']);
  const [costs, setCosts] = useState(['', '', '']);
  const [replacements, setReplacements] = useState(['', '', '']);
  const [controlRead, setControlRead] = useState([false, false, false]);
  const [closureMethod, setClosureMethod] = useState<ClosureMethod | null>(null);
  const [closureDone, setClosureDone] = useState(false);
  const [firstActionIndex, setFirstActionIndex] = useState<number | null>(null);
  const [decision, setDecision] = useState(5);
  const phase = controller.phase?.id;
  const completeRows = patterns.every((value) => value.trim()) && costs.every((value) => value.trim()) && replacements.every((value) => value.trim());

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="LELAHEL 4/5" title="O padrão não é a identidade" />;

  if (phase === 'patterns') return (
    <RuntimeCard label="PATTERN SEPARATION" title="Três padrões · três respostas substitutas">
      <RuntimeNotice title="VAULT PRIVADO">Nomes, custos e respostas ficam cifrados no Journal Vault. A evidência operacional recebe somente contagens e flags.</RuntimeNotice>
      {[0, 1, 2].map((index) => (
        <View key={index} style={styles.patternBlock}>
          <Text style={styles.meta}>PADRÃO {index + 1}</Text>
          <TextInput value={patterns[index]} onChangeText={(text) => setPatterns((rows) => rows.map((value, i) => i === index ? text : value))} placeholder="Nome curto · Vault" placeholderTextColor="#656871" style={runtimeTextStyles.input} />
          <TextInput value={costs[index]} onChangeText={(text) => setCosts((rows) => rows.map((value, i) => i === index ? text : value))} placeholder="Custo percebido · Vault" placeholderTextColor="#656871" style={runtimeTextStyles.input} />
          <TextInput value={replacements[index]} onChangeText={(text) => setReplacements((rows) => rows.map((value, i) => i === index ? text : value))} placeholder="Resposta substituta concreta · Vault" placeholderTextColor="#656871" style={runtimeTextStyles.input} />
        </View>
      ))}
      <RuntimeScale label="DECISÃO" value={decision} onChange={setDecision} />
      <RuntimePrimary label="CONDIÇÃO DE LEITURA" disabled={!completeRows} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'control-read') return (
    <RuntimeCard label="CONTROL · READ ONLY" title="Ler sem alterar o objeto">
      <Text style={runtimeTextStyles.body}>Leia cada padrão e a resposta substituta correspondente. Nesta condição, não rasgue, apague nem desfaça nada.</Text>
      {[0, 1, 2].map((index) => <RuntimeChoice key={index} selected={controlRead[index]} label={`ITEM ${index + 1} LIDO`} onPress={() => setControlRead((rows) => rows.map((value, i) => i === index ? !value : value))} />)}
      <RuntimePrimary label="ENCERRAMENTO REPRESENTACIONAL" disabled={!controlRead.every(Boolean)} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'closure') return (
    <RuntimeCard label="CLOSURE" title="Encerrar a representação, não atacar a si mesmo">
      <RuntimeNotice title="REGRA DE SENTIDO">Você está encerrando a representação de um padrão. Não existe requisito de dor, fogo ou dano corporal.</RuntimeNotice>
      <View style={runtimeTextStyles.row}>
        <RuntimeChoice selected={closureMethod === 'tear'} label="RASGAR PAPEL" onPress={() => setClosureMethod('tear')} />
        <RuntimeChoice selected={closureMethod === 'clay'} label="DESFAZER ARGILA" onPress={() => setClosureMethod('clay')} />
        <RuntimeChoice selected={closureMethod === 'erase'} label="APAGAR MARCA" onPress={() => setClosureMethod('erase')} />
      </View>
      <RuntimeChoice selected={closureDone} label="ENCERRAMENTO CONCLUÍDO" onPress={() => setClosureDone((value) => !value)} />
      <RuntimePrimary label="DEFINIR PRIMEIRA AÇÃO" disabled={!closureMethod || !closureDone} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'first-action') return (
    <RuntimeCard label="BEHAVIOR FOLLOW-UP" title="A próxima prova é comportamental">
      <Text style={runtimeTextStyles.body}>Escolha qual das três respostas substitutas será a primeira ação observável. Check-ins de 24h/7d podem existir depois, mas nunca concedem XP canônico novamente.</Text>
      <View style={runtimeTextStyles.row}>{[0, 1, 2].map((index) => <RuntimeChoice key={index} selected={firstActionIndex === index} label={`RESPOSTA ${index + 1}`} onPress={() => setFirstActionIndex(index)} />)}</View>
      <RuntimePrimary label="RETORNAR" disabled={firstActionIndex === null} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'grounding') return <Grounding controller={controller} />;

  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Lelahel 4/5">
      <RuntimePrimary label={controller.busy ? 'CIFRANDO E SELANDO…' : 'CIFRAR E SELAR DIA 029'} disabled={controller.busy || firstActionIndex === null || !closureMethod || !closureDone} onPress={() => void (async () => {
        if (!controller.auth.client || !controller.auth.userId) return;
        setLocalError(null);
        try {
          const encrypted = await encryptVaultText({
            userId: controller.auth.userId,
            day: 29,
            kind: 'journal',
            plaintext: JSON.stringify({
              schema: 'hnk-day029-pattern-separation-v1',
              patterns: patterns.map((value) => value.trim()),
              costs: costs.map((value) => value.trim()),
              replacements: replacements.map((value) => value.trim()),
              closureMethod,
              firstActionIndex,
            }),
          });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 29, payload: encrypted });
          const methodOrdinal = closureMethod === 'tear' ? 1 : closureMethod === 'clay' ? 2 : 3;
          await controller.seal({
            localRecordHash: encrypted.checksumSha256,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              patterns_defined: 3,
              replacement_behaviors_defined: 3,
              control_read_completed: controlRead.every(Boolean),
              closure_completed: closureDone,
              first_action_defined: firstActionIndex !== null,
            },
            metrics: {
              patterns_defined: 3,
              replacement_behaviors_defined: 3,
              decision_rating: decision,
              closure_method_ordinal: methodOrdinal,
              first_action_index: firstActionIndex ?? -1,
              private_text_saved_to_vault: true,
            },
          });
          setPatterns(['', '', '']);
          setCosts(['', '', '']);
          setReplacements(['', '', '']);
          controller.nextPhase();
        } catch (cause) {
          setLocalError(cause instanceof Error ? cause.message : 'day029_seal_failed');
        }
      })()} />
    </RuntimeCard>
  );

  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="LELAHEL 4/5" />;
  return null;
}

function Grounding({ controller }: { controller: Controller }) {
  return (
    <RuntimeCard label="GROUNDING" title="Orientação antes do selo">
      <Text style={runtimeTextStyles.body}>Abra os olhos quando apropriado, mova mãos e pés, reconheça o ambiente e confirme que a prática terminou.</Text>
      <RuntimePrimary label="ESTOU ORIENTADO E DE VOLTA" onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, gap: 18, paddingBottom: 80 },
  loading: { flex: 1, minHeight: 360, alignItems: 'center', justifyContent: 'center', backgroundColor: '#030406' },
  header: { gap: 6 },
  eyebrow: { color: '#847748', fontSize: 9, letterSpacing: 1.5 },
  title: { color: '#f2ead1', fontSize: 28, lineHeight: 34, fontWeight: '300' },
  meta: { color: '#64666c', fontSize: 8, letterSpacing: 0.9 },
  delta: { color: '#c4b88d', fontSize: 12, lineHeight: 19 },
  pearlStage: { minHeight: 210, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#242733', borderRadius: 22, backgroundColor: '#05060a' },
  bluePearl: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#1646d8', shadowColor: '#2f65ff', shadowOpacity: 0.8, shadowRadius: 20 },
  patternBlock: { borderWidth: 1, borderColor: '#292a2f', borderRadius: 15, padding: 13, gap: 9, backgroundColor: '#07080b' },
});
