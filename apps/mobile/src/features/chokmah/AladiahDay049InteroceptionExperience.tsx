import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
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
} from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { ALADIAH_DAY_049 } from './runtime-definitions/aladiah';

export function AladiahDay049InteroceptionExperience() {
  const controller = useHnkDayRuntime(ALADIAH_DAY_049);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [activeRest, setActiveRest] = useState(0);
  const [activeCountSeconds, setActiveCountSeconds] = useState(0);
  const [activePulseCount, setActivePulseCount] = useState(0);
  const [activeHeatPresent, setActiveHeatPresent] = useState(false);
  const [activeHeatRecorded, setActiveHeatRecorded] = useState(false);
  const [thermalCompleted, setThermalCompleted] = useState(false);
  const [controlRest, setControlRest] = useState(0);
  const [controlCountSeconds, setControlCountSeconds] = useState(0);
  const [controlPulseCount, setControlPulseCount] = useState(0);
  const [controlHeatPresent, setControlHeatPresent] = useState(false);
  const [controlHeatRecorded, setControlHeatRecorded] = useState(false);
  const [comfort, setComfort] = useState(5);
  const [anxiety, setAnxiety] = useState(0);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [noDiagnosisClaim, setNoDiagnosisClaim] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    setCanon(null);
    setCanonError(null);
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 49)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO ALADIAH · DIA 049</Text></View>;
  const phase = controller.phase?.id;
  const elapsed = activeRest + activeCountSeconds + controlRest + controlCountSeconds;
  const safetyStop = () => controller.interrupt({ durationSeconds: elapsed, evidence: { safety_stop: true }, metrics: { active_pulse_count: activePulseCount, control_pulse_count: controlPulseCount, comfort, anxiety } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · ALADIAH 3/5 · DIA 049</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não cria instruções substitutas de pulso ou saúde.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 049 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 048 confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">O Stop Gate encerrou a tentativa. O registro não diagnostica nem recomenda tratamento.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="ALADIAH 3/5" title="Interocepção como observação, nunca diagnóstico">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="STOP GATE">Não comprima o pescoço e não busque um número ideal. Dor no peito, desmaio, falta de ar importante ou palpitações persistentes encerram a prática.</RuntimeNotice>
          <RuntimePrimary label="INICIAR REPOUSO ATIVO" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'active-rest' ? (
        <RuntimeCard label="CONDIÇÃO A · REPOUSO" title="Repousar 5 minutos">
          <RuntimeTimer value={activeRest} target={300} onChange={setActiveRest} />
          <RuntimeScale label="CONFORTO" value={comfort} onChange={setComfort} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="ABRIR JANELA DE CONTAGEM" disabled={activeRest < 300} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'active-count' ? (
        <RuntimeCard label="E1 · CONTAGEM MANUAL" title="Punho ou percepção no peito · 30 s">
          <RuntimeNotice title="NÃO É MONITOR CARDÍACO">Conte manualmente o que percebe. O valor não é calibrado, não é diagnóstico e não deve ser perseguido.</RuntimeNotice>
          <RuntimeTimer value={activeCountSeconds} target={30} onChange={setActiveCountSeconds} />
          <RuntimeCounter label="BATIMENTOS PERCEBIDOS / CONTADOS" value={activePulseCount} onPress={() => setActivePulseCount((value) => value + 1)} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="VISUALIZAÇÃO TÉRMICA" disabled={activeCountSeconds < 30} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'thermal' ? (
        <RuntimeCard label="E3/E4 · IMAGEM" title="Imaginar calor chegando às extremidades">
          <Text style={runtimeTextStyles.body}>Use a imagem apenas como tarefa subjetiva. Calor percebido pode ter múltiplas explicações e não prova mecanismo externo.</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={activeHeatRecorded && activeHeatPresent} label="PERCEBI CALOR" onPress={() => { setActiveHeatPresent(true); setActiveHeatRecorded(true); }} />
            <RuntimeChoice selected={activeHeatRecorded && !activeHeatPresent} label="NÃO PERCEBI CALOR" onPress={() => { setActiveHeatPresent(false); setActiveHeatRecorded(true); }} />
          </View>
          <RuntimeChoice selected={thermalCompleted} label="CONCLUÍ A VISUALIZAÇÃO SEM BUSCAR EFEITO OBRIGATÓRIO" onPress={() => setThermalCompleted((value) => !value)} />
          <RuntimePrimary label="IR AO REPOUSO CONTROLE" disabled={!activeHeatRecorded || !thermalCompleted} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control-rest' ? (
        <RuntimeCard label="CONDIÇÃO B · REPOUSO" title="Repouso semelhante · 5 minutos · sem visualização térmica">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeTimer value={controlRest} target={300} onChange={setControlRest} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="ABRIR CONTAGEM CONTROLE" disabled={controlRest < 300} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control-count' ? (
        <RuntimeCard label="CONTROLE · 30 S" title="Mesma forma de contagem · sem visualização térmica">
          <RuntimeTimer value={controlCountSeconds} target={30} onChange={setControlCountSeconds} />
          <RuntimeCounter label="BATIMENTOS PERCEBIDOS / CONTADOS" value={controlPulseCount} onPress={() => setControlPulseCount((value) => value + 1)} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlHeatRecorded && controlHeatPresent} label="PERCEBI CALOR" onPress={() => { setControlHeatPresent(true); setControlHeatRecorded(true); }} />
            <RuntimeChoice selected={controlHeatRecorded && !controlHeatPresent} label="NÃO PERCEBI CALOR" onPress={() => { setControlHeatPresent(false); setControlHeatRecorded(true); }} />
          </View>
          <RuntimeScale label="ANSIEDADE PERCEBIDA" value={anxiety} onChange={setAnxiety} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="COMPARAR" disabled={controlCountSeconds < 30 || !controlHeatRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Contagem e calor não são diagnóstico">
          <Text style={runtimeTextStyles.body}>Ativo: {activePulseCount} em 30 s · calor {activeHeatPresent ? 'presente' : 'ausente'}. Controle: {controlPulseCount} em 30 s · calor {controlHeatPresent ? 'presente' : 'ausente'}.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI SEM BUSCAR NÚMERO IDEAL" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI CONTAGEM, SENSAÇÃO E INTERPRETAÇÃO" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={noDiagnosisClaim} label="NÃO USEI O PROTOCOLO COMO DIAGNÓSTICO, TRATAMENTO OU SUBSTITUTO CLÍNICO" onPress={() => setNoDiagnosisClaim((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM SINTOMA DE STOP GATE AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !noDiagnosisClaim || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Sair da atenção cardíaca e voltar ao ambiente">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Aladiah 3/5">
          <RuntimeNotice title="PRIVACIDADE">Nenhum diagnóstico ou narrativa médica entra no Practice Record.</RuntimeNotice>
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 049'} disabled={controller.busy} onPress={() => void controller.seal({
            durationSeconds: elapsed,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              active_rest_completed: true,
              active_count_completed: true,
              thermal_visualization_completed: thermalCompleted,
              control_rest_completed: true,
              control_count_completed: true,
              comparison_completed: comparisonCompleted,
              interpretation_separated: interpretationSeparated,
              no_diagnosis_claim: noDiagnosisClaim,
              safety_clear: safetyClear,
              active_pulse_count: activePulseCount,
              control_pulse_count: controlPulseCount,
              active_heat_present: activeHeatPresent,
              control_heat_present: controlHeatPresent,
              active_rest_seconds: activeRest,
              active_count_seconds: activeCountSeconds,
              control_rest_seconds: controlRest,
              control_count_seconds: controlCountSeconds,
            },
            metrics: { comfort, anxiety },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day049_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ALADIAH 3/5" /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  content: { padding: 24, gap: 18, paddingBottom: 52 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' },
  header: { gap: 6, marginBottom: 4 },
  eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 },
  title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' },
  meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 },
});
