import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DayDefinition } from '@hnk/day-runtime';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import {
  ACHAIAH_DAY_031,
  ACHAIAH_DAY_032,
  ACHAIAH_DAY_033,
  ACHAIAH_DAY_034,
  ACHAIAH_DAY_035,
} from './runtime-definitions/achaiah';
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

type AchaiahDay = 31 | 32 | 33 | 34 | 35;
type Controller = ReturnType<typeof useHnkDayRuntime>;
type Prudence = 'more_prudent' | 'same' | 'more_impulsive';

const DEFINITIONS: Record<AchaiahDay, DayDefinition> = {
  31: ACHAIAH_DAY_031,
  32: ACHAIAH_DAY_032,
  33: ACHAIAH_DAY_033,
  34: ACHAIAH_DAY_034,
  35: ACHAIAH_DAY_035,
};

export function AchaiahDays031to035Experience({ day }: { day: AchaiahDay }) {
  const controller = useHnkDayRuntime(DEFINITIONS[day]);
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

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO ACHAIAH · DIA {String(day).padStart(3, '0')}</Text></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>KETHER · ACHAIAH {day - 30}/5 · DIA {String(day).padStart(3, '0')}</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O app não cria texto substituto. Sincronize `codex_days` para executar.</RuntimeNotice> : null}
      {controller.error ? <RuntimeNotice title="RUNTIME">{controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia bloqueado"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia anterior.</Text></RuntimeCard> : null}

      {controller.runtime?.status !== 'locked' && day === 31 ? <Day031 canon={canon} controller={controller} /> : null}
      {controller.runtime?.status !== 'locked' && day === 32 ? <Day032 canon={canon} controller={controller} /> : null}
      {controller.runtime?.status !== 'locked' && day === 33 ? <Day033 canon={canon} controller={controller} /> : null}
      {controller.runtime?.status !== 'locked' && day === 34 ? <Day034 canon={canon} controller={controller} /> : null}
      {controller.runtime?.status !== 'locked' && day === 35 ? <Day035 canon={canon} controller={controller} /> : null}
    </ScrollView>
  );
}

function Threshold({ canon, controller, label, title }: { canon: CanonicalDaySnapshot | null; controller: Controller; label: string; title: string }) {
  if (controller.phase?.id !== 'threshold') return null;
  return (
    <RuntimeCard label={label} title={title}>
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="ACHAIAH · INVARIANTE">Profundidade nunca significa perda de agência. Interromper por segurança é dado válido e não remove XP, completions ou Fragmentos já conquistados.</RuntimeNotice>
      <RuntimePrimary label="INICIAR PRÁTICA" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
    </RuntimeCard>
  );
}

function Day031({ canon, controller }: { canon: CanonicalDaySnapshot | null; controller: Controller }) {
  const [analysisSeconds, setAnalysisSeconds] = useState(0);
  const [surrenderSeconds, setSurrenderSeconds] = useState(0);
  const [analysisTension, setAnalysisTension] = useState(5);
  const [surrenderTension, setSurrenderTension] = useState(5);
  const [analysisClarity, setAnalysisClarity] = useState(5);
  const [surrenderClarity, setSurrenderClarity] = useState(5);
  const [comparison, setComparison] = useState(false);
  const [objects, setObjects] = useState(0);
  const [responsibilityResumed, setResponsibilityResumed] = useState(false);
  const [safetyStop, setSafetyStop] = useState(false);
  const phase = controller.phase?.id;

  if (safetyStop) return (
    <RuntimeCard label="SAFETY STOP" title="Tentativa encerrada sem perda de progresso">
      <Text style={runtimeTextStyles.body}>Oriente-se ao ambiente e retome somente em uma nova tentativa quando estiver estável. Nenhum avanço espiritual é atribuído ao desconforto.</Text>
    </RuntimeCard>
  );

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ACHAIAH 1/5" title="Entregar sem abandonar discernimento" />;
  if (phase === 'analysis') return (
    <RuntimeCard label="A · ANALYSIS" title="Questão simples e não urgente · 10 min">
      <RuntimeTimer value={analysisSeconds} target={600} onChange={setAnalysisSeconds} />
      <RuntimeScale label="TENSÃO" value={analysisTension} onChange={setAnalysisTension} />
      <RuntimeScale label="CLAREZA" value={analysisClarity} onChange={setAnalysisClarity} />
      <SafetyStop onPress={() => { setSafetyStop(true); controller.interrupt(); }} />
      <RuntimePrimary label="RETORNO NEUTRO" disabled={analysisSeconds < 600} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'neutral-reset') return <SimpleReturn controller={controller} label="INTERROMPER A ANÁLISE E ORIENTAR-SE" />;
  if (phase === 'surrender') return (
    <RuntimeCard label="B · SURRENDER" title="Entrega silenciosa · 10 min">
      <Text style={runtimeTextStyles.body}>Reconheça pensamentos sem disputar com eles. O objetivo não é desaparecer nem perder identidade.</Text>
      <RuntimeTimer value={surrenderSeconds} target={600} onChange={setSurrenderSeconds} />
      <RuntimeScale label="TENSÃO" value={surrenderTension} onChange={setSurrenderTension} />
      <RuntimeScale label="CLAREZA" value={surrenderClarity} onChange={setSurrenderClarity} />
      <SafetyStop onPress={() => { setSafetyStop(true); controller.interrupt(); }} />
      <RuntimePrimary label="COMPARAR" disabled={surrenderSeconds < 600} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'comparison') return (
    <RuntimeCard label="COMPARAÇÃO" title="Entrega não é superioridade">
      <Text style={styles.delta}>TENSÃO · A {analysisTension}/10 · B {surrenderTension}/10</Text>
      <Text style={styles.delta}>CLAREZA · A {analysisClarity}/10 · B {surrenderClarity}/10</Text>
      <RuntimePrimary label="REGISTRAR" onPress={() => { setComparison(true); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'return-gate') return (
    <RuntimeCard label="RETURN GATE" title="Orientação + responsabilidade">
      <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objects} onPress={() => setObjects((value) => Math.min(5, value + 1))} />
      <RuntimeChoice selected={responsibilityResumed} label="RETOMEI UMA RESPONSABILIDADE CONCRETA" onPress={() => setResponsibilityResumed((value) => !value)} />
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects < 5 || !responsibilityResumed} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Achaiah 1/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 031'} disabled={controller.busy || !comparison || !responsibilityResumed} onPress={() => void controller.seal({
        durationSeconds: analysisSeconds + surrenderSeconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          analysis_condition_completed: analysisSeconds >= 600,
          surrender_condition_completed: surrenderSeconds >= 600,
          comparison_logged: comparison,
          responsibility_resumed: responsibilityResumed,
          safety_stop: false,
          safety_clear: true,
        },
        metrics: {
          analysis_seconds: analysisSeconds,
          surrender_seconds: surrenderSeconds,
          analysis_tension: analysisTension,
          surrender_tension: surrenderTension,
          analysis_clarity: analysisClarity,
          surrender_clarity: surrenderClarity,
        },
      }).then(controller.nextPhase)} />
    </RuntimeCard>
  );
  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ACHAIAH 1/5" />;
  return null;
}

function Day032({ canon, controller }: { canon: CanonicalDaySnapshot | null; controller: Controller }) {
  const [level, setLevel] = useState(0);
  const [deepSeconds, setDeepSeconds] = useState(0);
  const [returnSteps, setReturnSteps] = useState(0);
  const [controlSteps, setControlSteps] = useState(0);
  const [criticalFloor, setCriticalFloor] = useState<number | null>(null);
  const [depth, setDepth] = useState(5);
  const [orientation, setOrientation] = useState(false);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ACHAIAH 2/5" title="Descer por etapas e retornar pelo mesmo eixo" />;
  if (phase === 'elevator') return (
    <RuntimeCard label="A · ELEVATOR" title="Sete níveis · sem competição de profundidade">
      <RuntimeNotice title="SEM TESTE DE DOR">A prática não mede anestesia e não pede que você ignore sintomas ou cuidado médico.</RuntimeNotice>
      <Text style={styles.level}>NÍVEL {Math.max(1, level)}/7</Text>
      <RuntimePrimary label={level >= 7 ? 'NÍVEL 7 ALCANÇADO' : 'DESCER UM NÍVEL'} disabled={level >= 7} onPress={() => setLevel((value) => Math.min(7, value + 1))} />
      <RuntimePrimary label="OBSERVAR NO NÍVEL 7" disabled={level < 7} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'deep-observation') return (
    <RuntimeCard label="NÍVEL 7" title="Três minutos de observação">
      <RuntimeTimer value={deepSeconds} target={180} onChange={setDeepSeconds} />
      <RuntimeScale label="PROFUNDIDADE AUTORRELATADA" value={depth} onChange={setDepth} />
      <Text style={runtimeTextStyles.body}>Profundidade é autorrelato fenomenológico, não leitura objetiva do cérebro.</Text>
      <RuntimePrimary label="RETORNAR 7 → 1" disabled={deepSeconds < 180} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'return-up') return (
    <RuntimeCard label="RETORNO" title="Sete → um">
      <Text style={styles.level}>{returnSteps}/7 PASSOS DE RETORNO</Text>
      <RuntimePrimary label="SUBIR UM NÍVEL" disabled={returnSteps >= 7} onPress={() => setReturnSteps((value) => Math.min(7, value + 1))} />
      <RuntimePrimary label="INICIAR CONTROLE" disabled={returnSteps < 7} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'control') return (
    <RuntimeCard label="B · COUNTDOWN" title="Sete → um sem elevador">
      <Text style={styles.level}>{controlSteps}/7 ETAPAS</Text>
      <RuntimePrimary label="AVANÇAR CONTAGEM" disabled={controlSteps >= 7} onPress={() => setControlSteps((value) => Math.min(7, value + 1))} />
      <RuntimePrimary label="COMPARAR" disabled={controlSteps < 7} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'comparison') return (
    <RuntimeCard label="COMPARAÇÃO" title="Qual foi o nível crítico de mudança percebida?">
      <View style={runtimeTextStyles.row}>{[1,2,3,4,5,6,7].map((value) => <RuntimeChoice key={value} selected={criticalFloor === value} label={`NÍVEL ${value}`} onPress={() => setCriticalFloor(value)} />)}</View>
      <RuntimePrimary label="RETURN GATE" disabled={criticalFloor === null} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'return-gate') return (
    <RuntimeCard label="RETURN GATE" title="Orientação preservada">
      <RuntimeChoice selected={orientation} label="ESTOU ORIENTADO E FUNCIONAL" onPress={() => setOrientation((value) => !value)} />
      <RuntimePrimary label="CONFIRMAR RETORNO" disabled={!orientation} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Achaiah 2/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 032'} disabled={controller.busy || criticalFloor === null || !orientation} onPress={() => void controller.seal({
        durationSeconds: deepSeconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          elevator_condition_completed: level >= 7 && returnSteps >= 7,
          countdown_control_completed: controlSteps >= 7,
          critical_floor_logged: criticalFloor !== null,
          orientation_preserved: orientation,
        },
        metrics: { deep_observation_seconds: deepSeconds, depth_rating: depth, critical_floor: criticalFloor ?? 0 },
      }).then(controller.nextPhase)} />
    </RuntimeCard>
  );
  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ACHAIAH 2/5" />;
  return null;
}

function Day033({ canon, controller }: { canon: CanonicalDaySnapshot | null; controller: Controller }) {
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [activeImpulses, setActiveImpulses] = useState(0);
  const [controlImpulses, setControlImpulses] = useState(0);
  const [safetyMovements, setSafetyMovements] = useState(0);
  const [comfort, setComfort] = useState(5);
  const [movementReturn, setMovementReturn] = useState(false);
  const [comparison, setComparison] = useState(false);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ACHAIAH 3/5" title="Imobilidade confortável, voluntária e reversível" />;
  if (phase === 'active') return (
    <RuntimeCard label="A · ESDAILE STILLNESS" title="15 minutos · sem recorde de imobilidade">
      <RuntimeNotice title="NÃO É DIAGNÓSTICO">Neste protocolo, “catatonia corporal” significa imobilidade confortável, voluntária e reversível. Dor, dormência persistente, falta de ar, vertigem ou desconforto crescente autorizam movimento/interrupção.</RuntimeNotice>
      <RuntimeTimer value={activeSeconds} target={900} onChange={setActiveSeconds} />
      <RuntimeCounter label="IMPULSOS MOTORES" value={activeImpulses} onPress={() => setActiveImpulses((value) => value + 1)} />
      <RuntimeCounter label="MOVIMENTOS POR SEGURANÇA/CONFORTO" value={safetyMovements} onPress={() => setSafetyMovements((value) => value + 1)} />
      <RuntimeScale label="CONFORTO" value={comfort} onChange={setComfort} />
      <RuntimePrimary label="RETORNO MOTOR" disabled={activeSeconds < 900} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'neutral-reset') return (
    <RuntimeCard label="RETORNO MOTOR" title="Mover por decisão própria">
      <RuntimeChoice selected={movementReturn} label="MOVIMENTO VOLUNTÁRIO CONFIRMADO" onPress={() => setMovementReturn((value) => !value)} />
      <RuntimePrimary label="INICIAR QUIET CONTROL" disabled={!movementReturn} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'control') return (
    <RuntimeCard label="B · QUIET CONTROL" title="Mesma duração aproximada · ajustes permitidos">
      <RuntimeTimer value={controlSeconds} target={900} onChange={setControlSeconds} />
      <RuntimeCounter label="IMPULSOS MOTORES" value={controlImpulses} onPress={() => setControlImpulses((value) => value + 1)} />
      <RuntimePrimary label="COMPARAR" disabled={controlSeconds < 900} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'comparison') return (
    <RuntimeCard label="COMPARAÇÃO" title="Impulso não é falha">
      <Text style={styles.delta}>A · {activeImpulses} impulsos · B · {controlImpulses} impulsos</Text>
      <Text style={styles.delta}>MOVIMENTOS POR SEGURANÇA · {safetyMovements}</Text>
      <RuntimePrimary label="REGISTRAR" onPress={() => { setComparison(true); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'return-gate') return <ReturnGate controller={controller} />;
  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Achaiah 3/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 033'} disabled={controller.busy || !comparison || !movementReturn} onPress={() => void controller.seal({
        durationSeconds: activeSeconds + controlSeconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          esdaile_condition_completed: activeSeconds >= 900,
          quiet_control_completed: controlSeconds >= 900,
          motor_impulses_logged: true,
          voluntary_movement_return_confirmed: movementReturn,
        },
        metrics: {
          active_seconds: activeSeconds,
          control_seconds: controlSeconds,
          active_motor_impulses: activeImpulses,
          control_motor_impulses: controlImpulses,
          safety_movements: safetyMovements,
          comfort_rating: comfort,
        },
      }).then(controller.nextPhase)} />
    </RuntimeCard>
  );
  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ACHAIAH 3/5" />;
  return null;
}

function Day034({ canon, controller }: { canon: CanonicalDaySnapshot | null; controller: Controller }) {
  const [repetitions, setRepetitions] = useState(0);
  const [repSeconds, setRepSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [testSeconds, setTestSeconds] = useState(0);
  const [cancel, setCancel] = useState(false);
  const [presence, setPresence] = useState(5);
  const [expectation, setExpectation] = useState(5);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ACHAIAH 4/5" title="Instalar, testar e cancelar uma chave de estado" />;
  if (phase === 'installation') return (
    <RuntimeCard label="INSTALLATION" title="Três repetições · voluntárias">
      <Text style={runtimeTextStyles.body}>Cada repetição combina três respirações, frase canônica, polegar+indicador por cinco segundos e um minuto de silêncio.</Text>
      <RuntimeTimer value={repSeconds} target={65} onChange={setRepSeconds} />
      <Text style={styles.level}>REPETIÇÕES · {repetitions}/3</Text>
      <RuntimePrimary label="REGISTRAR REPETIÇÃO" disabled={repSeconds < 65 || repetitions >= 3} onPress={() => { setRepetitions((value) => Math.min(3, value + 1)); setRepSeconds(0); }} />
      <RuntimePrimary label="RETORNAR AO ESTADO COMUM" disabled={repetitions < 3} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'neutral-reset') return <SimpleReturn controller={controller} label="ESTADO COMUM CONFIRMADO" />;
  if (phase === 'control') return (
    <RuntimeCard label="CONTROL GESTURE" title="Polegar + dedo médio · 5 s · sem fórmula">
      <RuntimeTimer value={controlSeconds} target={5} onChange={setControlSeconds} />
      <RuntimePrimary label="TESTAR ÂNCORA" disabled={controlSeconds < 5} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'anchor-test') return (
    <RuntimeCard label="ANCHOR TEST" title="Polegar + indicador sem reindução">
      <RuntimeNotice title="LATÊNCIA AUTORRELATADA">Inicie o timer e pause quando perceber a primeira resposta clara; ausência ou resposta fraca continuam dados válidos.</RuntimeNotice>
      <RuntimeTimer value={testSeconds} target={60} onChange={setTestSeconds} allowEarlyStop />
      <RuntimeScale label="PRESENÇA" value={presence} onChange={setPresence} />
      <RuntimeScale label="EXPECTATIVA PERCEBIDA" value={expectation} onChange={setExpectation} />
      <RuntimePrimary label="CANCELAR ESTADO" disabled={testSeconds === 0} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'cancel') return (
    <RuntimeCard label="CANCEL" title="Abrir as mãos · respirar · encerrar">
      <RuntimeNotice title="REVERSIBILIDADE">A UI não trata a âncora como irresistível, permanente ou infalível.</RuntimeNotice>
      <RuntimeChoice selected={cancel} label="ESTADO ENCERRADO VOLUNTARIAMENTE" onPress={() => setCancel((value) => !value)} />
      <RuntimePrimary label="SELO" disabled={!cancel} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Achaiah 4/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 034'} disabled={controller.busy || repetitions < 3 || controlSeconds < 5 || testSeconds === 0 || !cancel} onPress={() => void controller.seal({
        durationSeconds: repetitions * 65 + controlSeconds + testSeconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          installation_repetitions: repetitions,
          control_gesture_completed: controlSeconds >= 5,
          anchor_test_completed: testSeconds > 0,
          cancel_confirmed: cancel,
        },
        metrics: { test_latency_seconds: testSeconds, presence_rating: presence, expectation_rating: expectation },
      }).then(controller.nextPhase)} />
    </RuntimeCard>
  );
  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ACHAIAH 4/5" />;
  return null;
}

function Day035({ canon, controller }: { canon: CanonicalDaySnapshot | null; controller: Controller }) {
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [activePresence, setActivePresence] = useState(5);
  const [controlPresence, setControlPresence] = useState(5);
  const [activeBoundary, setActiveBoundary] = useState(5);
  const [controlBoundary, setControlBoundary] = useState(5);
  const [comparison, setComparison] = useState(false);
  const [prudence, setPrudence] = useState<Prudence | null>(null);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="ACHAIAH 5/5" title="Delimitar e retornar com prudência" />;
  if (phase === 'geometry-review') return (
    <RuntimeCard label="RITUAL_GEOMETRY_EDITORIAL_REVIEW" title="Três círculos descritos · nenhum pentagrama inventado">
      <ThreeCircles active />
      <RuntimeNotice title="ISSUE #6">O título canônico menciona Pentagrama Primal, mas o procedimento recuperado não fixa seu traçado. Esta implementação não acrescenta geometria ausente.</RuntimeNotice>
      <RuntimePrimary label="USAR SOMENTE O PROCEDIMENTO DESCRITO" onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'active') return (
    <RuntimeCard label="A · FULL RITUAL DESCRITO" title="Três círculos · 5 min no centro">
      <ThreeCircles active />
      <RuntimeNotice title="PROTEÇÃO ≠ INVULNERABILIDADE">A linguagem tradicional do cânone não substitui prudência física nem torna o usuário imune a risco.</RuntimeNotice>
      <RuntimeTimer value={activeSeconds} target={300} onChange={setActiveSeconds} />
      <RuntimeScale label="SENSAÇÃO DE LIMITE" value={activeBoundary} onChange={setActiveBoundary} />
      <RuntimeScale label="PRESENÇA" value={activePresence} onChange={setActivePresence} />
      <RuntimePrimary label="RETORNO NEUTRO" disabled={activeSeconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'neutral-reset') return <SimpleReturn controller={controller} label="ENCERRAR CONDIÇÃO ATIVA" />;
  if (phase === 'control') return (
    <RuntimeCard label="B · GEOMETRIC CONTROL" title="Mesmos três círculos · cinza neutro">
      <ThreeCircles active={false} />
      <RuntimeTimer value={controlSeconds} target={300} onChange={setControlSeconds} />
      <RuntimeScale label="SENSAÇÃO DE LIMITE" value={controlBoundary} onChange={setControlBoundary} />
      <RuntimeScale label="PRESENÇA" value={controlPresence} onChange={setControlPresence} />
      <RuntimePrimary label="COMPARAR" disabled={controlSeconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'comparison') return (
    <RuntimeCard label="BOUNDARY RECORD" title="Comparação sem declarar causalidade">
      <Text style={styles.delta}>LIMITE · A {activeBoundary}/10 · B {controlBoundary}/10</Text>
      <Text style={styles.delta}>PRESENÇA · A {activePresence}/10 · B {controlPresence}/10</Text>
      <RuntimePrimary label="REGISTRAR" onPress={() => { setComparison(true); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'prudence') return (
    <RuntimeCard label="PRUDENCE CHECK" title="A experiência aumentou prudência ou impulsividade?">
      <View style={runtimeTextStyles.row}>
        <RuntimeChoice selected={prudence === 'more_prudent'} label="MAIS PRUDÊNCIA" onPress={() => setPrudence('more_prudent')} />
        <RuntimeChoice selected={prudence === 'same'} label="SEM MUDANÇA CLARA" onPress={() => setPrudence('same')} />
        <RuntimeChoice selected={prudence === 'more_impulsive'} label="MAIS IMPULSIVIDADE" onPress={() => setPrudence('more_impulsive')} />
      </View>
      <RuntimePrimary label="RETURN GATE" disabled={!prudence} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'return-gate') return <ReturnGate controller={controller} />;
  if (phase === 'seal') {
    const prudenceOrdinal = prudence === 'more_prudent' ? 2 : prudence === 'same' ? 1 : 0;
    return (
      <RuntimeCard label="SELO" title="Achaiah 5/5 · Fragmento VII">
        <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 035'} disabled={controller.busy || !comparison || !prudence} onPress={() => void controller.seal({
          durationSeconds: activeSeconds + controlSeconds,
          evidence: {
            protocol_completed: true,
            return_confirmed: true,
            full_ritual_completed: activeSeconds >= 300,
            geometric_control_completed: controlSeconds >= 300,
            boundary_comparison_logged: comparison,
            prudence_check_completed: Boolean(prudence),
          },
          metrics: {
            active_seconds: activeSeconds,
            control_seconds: controlSeconds,
            active_boundary: activeBoundary,
            control_boundary: controlBoundary,
            active_presence: activePresence,
            control_presence: controlPresence,
            prudence_ordinal: prudenceOrdinal,
            invented_pentagram_rendered: false,
          },
        }).then(controller.nextPhase)} />
      </RuntimeCard>
    );
  }
  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ACHAIAH 5/5 · COROA 7/7" />;
  return null;
}

function SimpleReturn({ controller, label }: { controller: Controller; label: string }) {
  return <RuntimeCard label="RETORNO" title="Orientação ao estado comum"><Text style={runtimeTextStyles.body}>Abra os olhos quando apropriado, mova-se voluntariamente e reconheça o ambiente antes de continuar.</Text><RuntimePrimary label={label} onPress={controller.nextPhase} /></RuntimeCard>;
}

function ReturnGate({ controller }: { controller: Controller }) {
  const [ready, setReady] = useState(false);
  return <RuntimeCard label="RETURN GATE" title="Movimento, orientação e clareza"><RuntimeChoice selected={ready} label="ESTOU ORIENTADO E FUNCIONAL" onPress={() => setReady((value) => !value)} /><RuntimePrimary label="CONFIRMAR RETORNO" disabled={!ready} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard>;
}

function SafetyStop({ onPress }: { onPress: () => void }) {
  return <Pressable style={styles.safetyStop} onPress={onPress}><Text style={styles.safetyStopText}>SAFETY STOP · ENCERRAR TENTATIVA</Text></Pressable>;
}

function ThreeCircles({ active }: { active: boolean }) {
  return (
    <View style={styles.circleStage}>
      <View style={[styles.circleOuter, active ? styles.circleActive : styles.circleControl]}>
        <View style={[styles.circleMiddle, active ? styles.circleActive : styles.circleControl]}>
          <View style={[styles.circleInner, active ? styles.circleActive : styles.circleControl]} />
        </View>
      </View>
    </View>
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
  level: { color: '#efe0a1', fontSize: 20, letterSpacing: 1.5, textAlign: 'center' },
  safetyStop: { borderWidth: 1, borderColor: '#623a39', borderRadius: 13, padding: 13, backgroundColor: '#160b0b' },
  safetyStopText: { color: '#dca39e', fontSize: 9, letterSpacing: 1.1, textAlign: 'center', fontWeight: '700' },
  circleStage: { minHeight: 220, alignItems: 'center', justifyContent: 'center', backgroundColor: '#050609', borderRadius: 20 },
  circleOuter: { width: 180, height: 180, borderRadius: 90, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  circleMiddle: { width: 125, height: 125, borderRadius: 63, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  circleInner: { width: 68, height: 68, borderRadius: 34, borderWidth: 2 },
  circleActive: { borderColor: '#4779d6' },
  circleControl: { borderColor: '#666970' },
});
