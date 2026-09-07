import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DayDefinition } from '@hnk/day-runtime';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import { DaiKoMyoCanonical, DAI_KO_MYO_CANONICAL_REFERENCE_ID, DAI_KO_MYO_CANONICAL_SHA256 } from './DaiKoMyoCanonical';
import {
  MAHASIAH_DAY_021,
  MAHASIAH_DAY_022,
  MAHASIAH_DAY_023,
  MAHASIAH_DAY_024,
} from './runtime-definitions/mahasiah';
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

type MahasiahDay = 21 | 22 | 23 | 24;
type SomaticKind = 'neutral' | 'heat' | 'cold' | 'tingling' | 'pressure' | 'pulsation' | 'light-heavy';
type CrownDistance = '5-7cm' | '8-10cm';

type DefinitionMap = Record<MahasiahDay, DayDefinition>;
const DEFINITIONS: DefinitionMap = {
  21: MAHASIAH_DAY_021,
  22: MAHASIAH_DAY_022,
  23: MAHASIAH_DAY_023,
  24: MAHASIAH_DAY_024,
};

export function MahasiahDays021to024Experience({ day }: { day: MahasiahDay }) {
  const definition = DEFINITIONS[day];
  const controller = useHnkDayRuntime(definition);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);

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

  if (controller.loading) return <View style={styles.loading}><Text style={styles.loadingText}>ABRINDO MAHASIAH · DIA {String(day).padStart(3, '0')}</Text></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>KETHER · MAHASIAH {day - 20}/5 · DIA {String(day).padStart(3, '0')}</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.source}>{canon ? `${canon.source} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O app não inventa o texto deste Dia. Sincronize o conteúdo canônico para iniciar.</RuntimeNotice> : null}
      {controller.error ? <RuntimeNotice title="RUNTIME">{controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia bloqueado"><Text style={runtimeTextStyles.body}>A conclusão canônica do Dia anterior é obrigatória.</Text></RuntimeCard> : null}

      {controller.runtime?.status !== 'locked' && controller.phase?.id === 'threshold' ? (
        <RuntimeCard label="LIMIAR" title={roleForDay(day)}>
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="CAMADAS HNK">Instrumental, comportamento, fenomenologia, tradição e teologia permanecem distinguíveis. Autorrelato não vira medição objetiva por mudança de rótulo.</RuntimeNotice>
          <RuntimePrimary label="INICIAR PRÁTICA" disabled={!canon || controller.busy} onPress={() => void (async () => { await controller.begin(); controller.nextPhase(); })()} />
        </RuntimeCard>
      ) : null}

      {day === 21 ? <Day021 controller={controller} /> : null}
      {day === 22 ? <Day022 controller={controller} /> : null}
      {day === 23 ? <Day023 controller={controller} /> : null}
      {day === 24 ? <Day024 controller={controller} /> : null}

      {controller.phase?.id === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label={`MAHASIAH ${day - 20}/5`} /> : null}
    </ScrollView>
  );
}

function Day021({ controller }: { controller: ReturnType<typeof useHnkDayRuntime> }) {
  const [seconds, setSeconds] = useState(0);
  const [presence, setPresence] = useState(5);
  const [presenceSet, setPresenceSet] = useState(false);
  const [breathingComfortable, setBreathingComfortable] = useState(false);
  const [axisCompleted, setAxisCompleted] = useState(false);
  const [regions, setRegions] = useState<SomaticKind[]>([]);

  if (controller.phase?.id === 'axis-breath') return (
    <RuntimeCard label="EIXO BRANCO" title="Respiração natural · Kether → Malkuth">
      <Text style={runtimeTextStyles.body}>Respire sem retenção obrigatória. Na inspiração, acompanhe mentalmente o eixo descendente; na expiração, integre a percepção do corpo inteiro. Pare se houver desconforto respiratório.</Text>
      <RuntimeTimer value={seconds} target={300} onChange={setSeconds} allowEarlyStop />
      <Pressable style={[styles.confirm, breathingComfortable && styles.confirmActive]} onPress={() => setBreathingComfortable((value) => !value)}><Text style={styles.confirmText}>{breathingComfortable ? '✓ ' : ''}RESPIRAÇÃO CONFORTÁVEL</Text></Pressable>
      <Pressable style={[styles.confirm, axisCompleted && styles.confirmActive]} onPress={() => setAxisCompleted((value) => !value)}><Text style={styles.confirmText}>{axisCompleted ? '✓ ' : ''}EIXO VISUALIZADO SEM FORÇAR SENSAÇÃO</Text></Pressable>
      <RuntimePrimary label="MAPEAR O CORPO" disabled={!breathingComfortable || !axisCompleted} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'somatic-map') return (
    <RuntimeCard label="SOMATIC MARKER" title="Três registros · ausência de sensação também vale">
      <Text style={runtimeTextStyles.body}>Escolha três marcadores percebidos durante/depois da prática. Eles descrevem experiência subjetiva; não diagnosticam circulação de energia.</Text>
      <View style={runtimeTextStyles.row}>{SOMATIC_OPTIONS.map(([key, label]) => <RuntimeChoice key={key} selected={regions.includes(key)} label={label} onPress={() => setRegions((current) => current.includes(key) ? current.filter((value) => value !== key) : current.length < 3 ? [...current, key] : current)} />)}</View>
      <RuntimeScale label="PRESENÇA" value={presence} onChange={(value) => { setPresence(value); setPresenceSet(true); }} />
      <RuntimePrimary label="SEPARAR INTERPRETAÇÃO" disabled={regions.length !== 3 || !presenceSet} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'interpretation-hold') return (
    <RuntimeCard label="INTERPRETATION HOLD" title="Percepção não é automaticamente explicação">
      <RuntimeNotice title="SEPARAÇÃO">O Practice Record guarda apenas categorias/ratings. Se quiser escrever “o que percebi / imaginei / interpretei”, use o Journal Vault; texto livre não entra neste selo.</RuntimeNotice>
      <RuntimePrimary label="RETORNAR" onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'grounding') return <Grounding controller={controller} />;

  if (controller.phase?.id === 'seal') return (
    <RuntimeCard label="SELO" title="Mahasiah 1/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 021'} disabled={controller.busy} onPress={() => void (async () => {
        await controller.seal({
          durationSeconds: seconds,
          evidence: {
            protocol_completed: true,
            return_confirmed: true,
            breathing_comfortable: breathingComfortable,
            axis_visualization_completed: axisCompleted,
            presence_rating: presence,
            somatic_regions_logged: regions.length,
          },
          metrics: {
            practice_seconds: seconds,
            presence_rating: presence,
            somatic_regions_logged: regions.length,
            neutral_reported: regions.includes('neutral'),
          },
        });
        controller.nextPhase();
      })()} />
    </RuntimeCard>
  );

  return null;
}

function Day022({ controller }: { controller: ReturnType<typeof useHnkDayRuntime> }) {
  const [referenceVisible, setReferenceVisible] = useState(true);
  const [referenceStudied, setReferenceStudied] = useState(false);
  const [memoryTraceSeconds, setMemoryTraceSeconds] = useState(0);
  const [referenceConsults, setReferenceConsults] = useState(0);
  const [hesitations, setHesitations] = useState(0);
  const [airTrace, setAirTrace] = useState(false);
  const [breaths, setBreaths] = useState(0);
  const [visualClarity, setVisualClarity] = useState(5);
  const [claritySet, setClaritySet] = useState(false);
  const [groundedItems, setGroundedItems] = useState(0);

  if (controller.phase?.id === 'symbol-study') return (
    <RuntimeCard label="SYMBOL STUDY" title="Dai Ko Myo Usui · 大光明">
      <View style={styles.symbolStage}><DaiKoMyoCanonical /></View>
      <Text style={styles.assetMeta}>REF · {DAI_KO_MYO_CANONICAL_REFERENCE_ID}</Text>
      <Text style={styles.assetMeta}>SHA256 · {DAI_KO_MYO_CANONICAL_SHA256.slice(0, 16)}…</Text>
      <RuntimeNotice title="PROVENANCE">HNK rendering da referência tradicional Usui 大光明, em ordem vertical 大 → 光 → 明. Não é um desenho histórico TW-DVF recuperado e não é variante Tibetan/Dumo.</RuntimeNotice>
      <RuntimePrimary label="ESTUDEI A REFERÊNCIA" onPress={() => { setReferenceStudied(true); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'memory-trace') return (
    <RuntimeCard label="MEMORY TRACE" title="Memória antes de velocidade">
      {referenceVisible ? <View style={styles.symbolStageSmall}><DaiKoMyoCanonical width={140} height={200} /></View> : <View style={styles.hiddenSymbol}><Text style={styles.hiddenSymbolText}>REFERÊNCIA OCULTA</Text></View>}
      <RuntimeTimer value={memoryTraceSeconds} target={300} onChange={setMemoryTraceSeconds} allowEarlyStop />
      <View style={runtimeTextStyles.row}>
        <RuntimeChoice selected={!referenceVisible} label="OCULTAR REFERÊNCIA" onPress={() => setReferenceVisible(false)} />
        <RuntimeChoice selected={referenceVisible} label="CONSULTAR" onPress={() => { setReferenceVisible(true); setReferenceConsults((value) => value + 1); }} />
      </View>
      <RuntimeCounter label="HESITAÇÕES AUTO-MARCADAS" value={hesitations} onPress={() => setHesitations((value) => value + 1)} />
      <RuntimePrimary label="TRAÇADO DE MEMÓRIA ENCERRADO" disabled={memoryTraceSeconds === 0} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'air-trace') return (
    <RuntimeCard label="AIR TRACE" title="Gesto voluntário · câmera não é requisito">
      <Text style={runtimeTextStyles.body}>Trace no ar respeitando a ordem vertical do master. O app não precisa rastrear sua mão para validar esta etapa.</Text>
      <Pressable style={[styles.confirm, airTrace && styles.confirmActive]} onPress={() => setAirTrace((value) => !value)}><Text style={styles.confirmText}>{airTrace ? '✓ ' : ''}TRAÇADO NO AR CONCLUÍDO</Text></Pressable>
      <RuntimePrimary label="SUSTENTAR A IMAGEM" disabled={!airTrace} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'visualization') return (
    <RuntimeCard label="VISUALIZATION HOLD" title="Três respirações · depois deixar desaparecer">
      <View style={styles.symbolStageSmall}><DaiKoMyoCanonical width={130} height={190} color="#fffdf2" /></View>
      <View style={runtimeTextStyles.row}>{[1, 2, 3].map((number) => <RuntimeChoice key={number} selected={breaths >= number} label={`RESPIRAÇÃO ${number}`} onPress={() => setBreaths((value) => Math.max(value, number))} />)}</View>
      <RuntimeScale label="CLAREZA VISUAL" value={visualClarity} onChange={(value) => { setVisualClarity(value); setClaritySet(true); }} />
      <RuntimePrimary label="DEIXAR A IMAGEM IR" disabled={breaths < 3 || !claritySet} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'grounding') return (
    <RuntimeCard label="GROUNDING" title="Três elementos concretos do ambiente">
      <RuntimeCounter label="ELEMENTOS NOMEADOS" value={groundedItems} onPress={() => setGroundedItems((value) => Math.min(3, value + 1))} />
      <RuntimePrimary label="ESTOU ORIENTADO E DE VOLTA" disabled={groundedItems < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'seal') return (
    <RuntimeCard label="SELO" title="Mahasiah 2/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 022'} disabled={controller.busy} onPress={() => void (async () => {
        await controller.seal({
          durationSeconds: memoryTraceSeconds,
          evidence: {
            protocol_completed: true,
            return_confirmed: true,
            reference_studied: referenceStudied,
            air_trace_completed: airTrace,
            visualization_hold_completed: breaths >= 3,
            visual_clarity: visualClarity,
          },
          metrics: {
            memory_trace_seconds: memoryTraceSeconds,
            reference_consults: referenceConsults,
            hesitations,
            visual_clarity: visualClarity,
            grounding_items: groundedItems,
          },
        });
        controller.nextPhase();
      })()} />
    </RuntimeCard>
  );

  return null;
}

function Day023({ controller }: { controller: ReturnType<typeof useHnkDayRuntime> }) {
  const [distance, setDistance] = useState<CrownDistance | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [activePresence, setActivePresence] = useState(5);
  const [controlPresence, setControlPresence] = useState(5);
  const [activeComfort, setActiveComfort] = useState(5);
  const [controlComfort, setControlComfort] = useState(5);
  const [ratingsSet, setRatingsSet] = useState(false);
  const [adjustmentDefined, setAdjustmentDefined] = useState(false);

  if (controller.phase?.id === 'active') return (
    <RuntimeCard label="CONDIÇÃO A · ATIVA" title="Coroa · 7 minutos canônicos">
      <Text style={runtimeTextStyles.body}>Mãos em concha aproximadamente 5–10 cm acima da Coroa. Pescoço neutro; abaixe/apoie braços se houver fadiga. A sessão incorpora o operador canônico conforme o texto do Dia.</Text>
      <View style={runtimeTextStyles.row}>
        <RuntimeChoice selected={distance === '5-7cm'} label="5–7 CM" onPress={() => setDistance('5-7cm')} />
        <RuntimeChoice selected={distance === '8-10cm'} label="8–10 CM" onPress={() => setDistance('8-10cm')} />
      </View>
      <RuntimeTimer value={activeSeconds} target={420} onChange={setActiveSeconds} />
      <RuntimePrimary label="ENCERRAR CONDIÇÃO A" disabled={!distance || activeSeconds < 420} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'neutral-reset') return (
    <RuntimeCard label="RETORNO NEUTRO" title="A condição controle não começa automaticamente">
      <Text style={runtimeTextStyles.body}>Abaixe os braços, mova mãos/pés e reoriente-se. A condição B usa a mesma distância/postura, mas sem símbolo, fórmula ou intenção explícita de condução.</Text>
      <RuntimePrimary label="ESTOU ORIENTADO PARA A CONDIÇÃO B" onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'control') return (
    <RuntimeCard label="CONDIÇÃO B · CONTROLE" title="Mesma postura · 5 minutos canônicos">
      <Text style={runtimeTextStyles.body}>Mantenha aproximadamente a mesma distância escolhida na condição A. Sem Dai Ko Myo, MEM-HE-SHIN ou intenção de condução. O objetivo é comparação, não “vencer”.</Text>
      <RuntimeTimer value={controlSeconds} target={300} onChange={setControlSeconds} />
      <RuntimePrimary label="COMPARAR" disabled={controlSeconds < 300} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'comparison') return (
    <RuntimeCard label="CROWN COMPARISON" title="Dois conjuntos de autorrelato · nenhum vencedor">
      <RuntimeScale label="A · PRESENÇA" value={activePresence} onChange={(value) => { setActivePresence(value); setRatingsSet(true); }} />
      <RuntimeScale label="B · PRESENÇA" value={controlPresence} onChange={(value) => { setControlPresence(value); setRatingsSet(true); }} />
      <RuntimeScale label="A · CONFORTO" value={activeComfort} onChange={(value) => { setActiveComfort(value); setRatingsSet(true); }} />
      <RuntimeScale label="B · CONFORTO" value={controlComfort} onChange={(value) => { setControlComfort(value); setRatingsSet(true); }} />
      <RuntimeNotice title="SEM CAUSALIDADE AUTOMÁTICA">Diferença entre A/B é dado dentro do protocolo, não prova automática de bioenergia ou causalidade externa.</RuntimeNotice>
      <Pressable style={[styles.confirm, adjustmentDefined && styles.confirmActive]} onPress={() => setAdjustmentDefined((value) => !value)}><Text style={styles.confirmText}>{adjustmentDefined ? '✓ ' : ''}DEFINI UM PARÂMETRO A MANTER CONSTANTE NA PRÓXIMA COMPARAÇÃO</Text></Pressable>
      <RuntimePrimary label="SELAR COMPARAÇÃO" disabled={!ratingsSet || !adjustmentDefined} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'seal') return (
    <RuntimeCard label="SELO" title="Mahasiah 3/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 023'} disabled={controller.busy} onPress={() => void (async () => {
        await controller.seal({
          durationSeconds: activeSeconds + controlSeconds,
          evidence: {
            protocol_completed: true,
            return_confirmed: true,
            active_condition_completed: activeSeconds >= 420,
            control_condition_completed: controlSeconds >= 300,
            comparison_logged: ratingsSet,
            protocol_adjustment_defined: adjustmentDefined,
          },
          metrics: {
            active_seconds: activeSeconds,
            control_seconds: controlSeconds,
            distance_band: distance === '5-7cm' ? 0 : 1,
            active_presence: activePresence,
            control_presence: controlPresence,
            active_comfort: activeComfort,
            control_comfort: controlComfort,
          },
        });
        controller.nextPhase();
      })()} />
    </RuntimeCard>
  );

  return null;
}

function Day024({ controller }: { controller: ReturnType<typeof useHnkDayRuntime> }) {
  const [activeRegions, setActiveRegions] = useState(0);
  const [controlRegions, setControlRegions] = useState(0);
  const [activeTimer, setActiveTimer] = useState(0);
  const [controlTimer, setControlTimer] = useState(0);
  const [comparisonDone, setComparisonDone] = useState(false);
  const activeRegionName = UPPER_REGIONS[Math.min(activeRegions, 4)];
  const controlRegionName = UPPER_REGIONS[Math.min(controlRegions, 4)];

  if (controller.phase?.id === 'active-circuit') return (
    <RuntimeCard label="CIRCUITO ATIVO" title={`${activeRegionName} · aproximadamente 1 minuto`}>
      <Text style={runtimeTextStyles.body}>Ordem fixa: Coroa → testa → entre sobrancelhas → laterais do rosto → garganta. Mãos sem pressão desconfortável; não comprima olhos, garganta ou pescoço.</Text>
      <RuntimeTimer value={activeTimer} target={60} onChange={setActiveTimer} />
      <RuntimePrimary label={activeRegions >= 4 ? 'FECHAR CIRCUITO ATIVO' : 'PRÓXIMA REGIÃO'} disabled={activeTimer < 60} onPress={() => {
        if (activeRegions >= 4) controller.nextPhase();
        else { setActiveRegions((value) => value + 1); setActiveTimer(0); }
      }} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'neutral-reset') return (
    <RuntimeCard label="RETORNO NEUTRO" title="Separar A de B">
      <RuntimePrimary label="ESTOU ORIENTADO PARA O CONTROLE" onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'control-circuit') return (
    <RuntimeCard label="CIRCUITO CONTROLE" title={`${controlRegionName} · mesma ordem/duração`}>
      <Text style={runtimeTextStyles.body}>Mesma sequência e duração, sem símbolo, MEM-HE-SHIN ou intenção de condução.</Text>
      <RuntimeTimer value={controlTimer} target={60} onChange={setControlTimer} />
      <RuntimePrimary label={controlRegions >= 4 ? 'COMPARAR MAPAS' : 'PRÓXIMA REGIÃO'} disabled={controlTimer < 60} onPress={() => {
        if (controlRegions >= 4) controller.nextPhase();
        else { setControlRegions((value) => value + 1); setControlTimer(0); }
      }} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'regional-map') return (
    <RuntimeCard label="REGIONAL MAP" title="Cinco regiões · comparação sem “chakra detectado”">
      <View style={styles.regionList}>{UPPER_REGIONS.map((region, index) => <Text key={region} style={styles.regionText}>{index + 1}. {region}</Text>)}</View>
      <RuntimeNotice title="LIMITE EPISTEMOLÓGICO">O mapa descreve ratings e transições relatadas. O celular não converte autorrelato em detecção direta de chakra ou bioenergia.</RuntimeNotice>
      <Pressable style={[styles.confirm, comparisonDone && styles.confirmActive]} onPress={() => setComparisonDone((value) => !value)}><Text style={styles.confirmText}>{comparisonDone ? '✓ ' : ''}COMPAREI AS CINCO REGIÕES SEM ELEGER “VENCEDOR”</Text></Pressable>
      <RuntimePrimary label="SELAR CIRCUITO" disabled={!comparisonDone} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );

  if (controller.phase?.id === 'seal') return (
    <RuntimeCard label="SELO" title="Mahasiah 4/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 024'} disabled={controller.busy} onPress={() => void (async () => {
        await controller.seal({
          durationSeconds: 600,
          evidence: {
            protocol_completed: true,
            return_confirmed: true,
            active_circuit_completed: activeRegions >= 4 && activeTimer >= 60,
            control_circuit_completed: controlRegions >= 4 && controlTimer >= 60,
            regions_logged: 5,
            regional_comparison_completed: comparisonDone,
          },
          metrics: {
            active_regions_completed: 5,
            control_regions_completed: 5,
            seconds_per_region: 60,
          },
        });
        controller.nextPhase();
      })()} />
    </RuntimeCard>
  );

  return null;
}

function Grounding({ controller }: { controller: ReturnType<typeof useHnkDayRuntime> }) {
  return (
    <RuntimeCard label="GROUNDING" title="Retorno ao ambiente concreto">
      <Text style={runtimeTextStyles.body}>Mova mãos e pés, respire normalmente, observe o espaço e confirme orientação antes do selo.</Text>
      <RuntimePrimary label="ESTOU ORIENTADO E DE VOLTA" onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
}

function roleForDay(day: MahasiahDay) {
  if (day === 21) return 'Conduzir atenção, respiração e imagem por um eixo escolhido';
  if (day === 22) return 'Transformar forma em memória, gesto e visualização';
  if (day === 23) return 'Comparar protocolo completo e postura equivalente';
  return 'Manter uma sequência e distinguir regiões';
}

const SOMATIC_OPTIONS: Array<[SomaticKind, string]> = [
  ['neutral', 'NEUTRA / NENHUMA'],
  ['heat', 'CALOR'],
  ['cold', 'FRIO'],
  ['tingling', 'FORMIGAMENTO'],
  ['pressure', 'PRESSÃO'],
  ['pulsation', 'PULSAÇÃO'],
  ['light-heavy', 'LEVEZA / PESO'],
];

const UPPER_REGIONS = ['COROA', 'TESTA', 'ENTRE SOBRANCELHAS', 'LATERAIS DO ROSTO', 'GARGANTA'] as const;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 100, gap: 16 },
  loading: { flex: 1, backgroundColor: '#030406', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.5 },
  header: { paddingVertical: 10 },
  eyebrow: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.6 },
  title: { color: '#f6eed4', fontSize: 28, fontWeight: '300', marginTop: 6 },
  source: { color: '#5f6168', fontSize: 8, letterSpacing: 1, marginTop: 6 },
  confirm: { borderWidth: 1, borderColor: '#34363a', borderRadius: 14, padding: 14, backgroundColor: '#08090d' },
  confirmActive: { borderColor: '#74663d', backgroundColor: '#151209' },
  confirmText: { color: '#a69d81', fontSize: 9, lineHeight: 15, letterSpacing: 0.7 },
  symbolStage: { minHeight: 350, borderWidth: 1, borderColor: '#3c3520', borderRadius: 24, backgroundColor: '#080806', alignItems: 'center', justifyContent: 'center', padding: 18 },
  symbolStageSmall: { minHeight: 230, borderWidth: 1, borderColor: '#302c1d', borderRadius: 18, backgroundColor: '#070706', alignItems: 'center', justifyContent: 'center', padding: 12 },
  hiddenSymbol: { height: 230, borderWidth: 1, borderStyle: 'dashed', borderColor: '#303137', borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hiddenSymbolText: { color: '#65676e', fontSize: 9, letterSpacing: 1.5 },
  assetMeta: { color: '#71694f', fontSize: 8, letterSpacing: 0.8 },
  regionList: { gap: 7 },
  regionText: { color: '#c7bea3', fontSize: 12, letterSpacing: 0.6 },
});
