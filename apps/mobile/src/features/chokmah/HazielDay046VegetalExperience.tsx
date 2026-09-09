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
import { HAZIEL_DAY_046 } from './runtime-definitions/haziel';

const CONDITION_SECONDS = 420;

export function HazielDay046VegetalExperience() {
  const controller = useHnkDayRuntime(HAZIEL_DAY_046);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [plantSeconds, setPlantSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [plantPresent, setPlantPresent] = useState(false);
  const [controlPresent, setControlPresent] = useState(false);
  const [plantRecorded, setPlantRecorded] = useState(false);
  const [controlRecorded, setControlRecorded] = useState(false);
  const [plantIntensity, setPlantIntensity] = useState(0);
  const [controlIntensity, setControlIntensity] = useState(0);
  const [plantExpectation, setPlantExpectation] = useState(5);
  const [controlExpectation, setControlExpectation] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [restConfirmed, setRestConfirmed] = useState(false);
  const [blindAssistUsed, setBlindAssistUsed] = useState(false);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [nullResultsPreserved, setNullResultsPreserved] = useState(false);
  const [alternativesConsidered, setAlternativesConsidered] = useState(false);
  const [auraNotClaimed, setAuraNotClaimed] = useState(false);
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
    void loadCanonicalDay(controller.auth.client, 46)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) {
    return <View style={styles.loading}><Text style={styles.meta}>ABRINDO HAZIEL · DIA 046</Text></View>;
  }

  const phase = controller.phase?.id;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · HAZIEL 5/5 · DIA 046</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">Haziel só executa conteúdo `canon` sincronizado. Nenhum texto genérico substitui o Dia 046.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 046 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 045 concluído no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">A interrupção por segurança preserva o progresso anterior e não concede XP. Retorne ao ambiente antes de tentar novamente.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="HAZIEL 5/5" title="Leitura vegetal como comparação corporal, não detector de aura">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="HNK-EP-1.1">Calor, frio, formigamento, pressão ou pulsação são experiências registráveis. O app não transforma essas sensações em prova de campo etérico externo.</RuntimeNotice>
          <RuntimePrimary label="INICIAR CONDIÇÃO PLANTA" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'plant' ? (
        <RuntimeCard label="CONDIÇÃO A · PLANTA" title="Mão dominante · cerca de 3 cm · 7 minutos">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="SEM CONTATO">Não toque folhas ou caule. Mantenha mão e braço relaxados, respiração natural e distância aproximada. Dor, dormência persistente, tontura ou desconforto relevante encerram a sessão.</RuntimeNotice>
          <RuntimeTimer value={plantSeconds} target={CONDITION_SECONDS} onChange={setPlantSeconds} />
          <Text style={styles.fieldLabel}>REGISTRO DE PRESENÇA / AUSÊNCIA</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={plantRecorded && plantPresent} label="HOUVE ALGUMA SENSAÇÃO" onPress={() => { setPlantPresent(true); setPlantRecorded(true); }} />
            <RuntimeChoice selected={plantRecorded && !plantPresent} label="NENHUMA SENSAÇÃO" onPress={() => { setPlantPresent(false); setPlantRecorded(true); }} />
          </View>
          <RuntimeScale label="INTENSIDADE PERCEBIDA" value={plantIntensity} onChange={setPlantIntensity} />
          <RuntimeScale label="EXPECTATIVA ANTES DE INTERPRETAR" value={plantExpectation} onChange={setPlantExpectation} />
          <RuntimeScale label="CONFORTO" value={comfort} onChange={setComfort} />
          <RuntimePrimary label="SAFETY STOP" onPress={() => controller.interrupt({ durationSeconds: plantSeconds, evidence: { safety_stop: true }, metrics: { plant_seconds: plantSeconds, comfort } })} />
          <RuntimePrimary label="DESCANSAR ANTES DO CONTROLE" disabled={plantSeconds < CONDITION_SECONDS || !plantRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'rest' ? (
        <RuntimeCard label="INTERVALO" title="Afaste a mão e neutralize a comparação">
          <Text style={runtimeTextStyles.body}>Abra os olhos, mova mão e ombro e permita que postura e circulação retornem ao habitual. O protocolo não exige sensação na planta para continuar.</Text>
          <RuntimeChoice selected={restConfirmed} label="DESCANSO CONFIRMADO" onPress={() => setRestConfirmed((value) => !value)} />
          <RuntimePrimary label="ABRIR OBJETO CONTROLE" disabled={!restConfirmed} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control' ? (
        <RuntimeCard label="CONDIÇÃO B · OBJETO INERTE" title="Mesma mão, distância, postura e 7 minutos">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="CONTROLE">Use um objeto estável de tamanho semelhante quando possível. Um ajudante pode alternar planta/objeto fora da sua visão; isso reduz expectativa, mas não transforma a prática em teste científico conclusivo.</RuntimeNotice>
          <RuntimeChoice selected={blindAssistUsed} label="HOUVE ALTERNÂNCIA/CEGAMENTO SIMPLES COM AJUDANTE" onPress={() => setBlindAssistUsed((value) => !value)} />
          <RuntimeTimer value={controlSeconds} target={CONDITION_SECONDS} onChange={setControlSeconds} />
          <Text style={styles.fieldLabel}>REGISTRO DE PRESENÇA / AUSÊNCIA</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlRecorded && controlPresent} label="HOUVE ALGUMA SENSAÇÃO" onPress={() => { setControlPresent(true); setControlRecorded(true); }} />
            <RuntimeChoice selected={controlRecorded && !controlPresent} label="NENHUMA SENSAÇÃO" onPress={() => { setControlPresent(false); setControlRecorded(true); }} />
          </View>
          <RuntimeScale label="INTENSIDADE PERCEBIDA" value={controlIntensity} onChange={setControlIntensity} />
          <RuntimeScale label="EXPECTATIVA ANTES DE INTERPRETAR" value={controlExpectation} onChange={setControlExpectation} />
          <RuntimePrimary label="SAFETY STOP" onPress={() => controller.interrupt({ durationSeconds: plantSeconds + controlSeconds, evidence: { safety_stop: true }, metrics: { plant_seconds: plantSeconds, control_seconds: controlSeconds, comfort } })} />
          <RuntimePrimary label="COMPARAR CONDIÇÕES" disabled={controlSeconds < CONDITION_SECONDS || !controlRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Sensação, ambiente e interpretação permanecem separados">
          <Text style={runtimeTextStyles.body}>Planta {plantPresent ? 'sensação presente' : 'nenhuma sensação'} · intensidade {plantIntensity}/10. Controle {controlPresent ? 'sensação presente' : 'nenhuma sensação'} · intensidade {controlIntensity}/10.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI PLANTA E CONTROLE SEM ESCOLHER VENCEDOR" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI SENSAÇÃO CORPORAL DE INTERPRETAÇÃO ETÉRICA" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={nullResultsPreserved} label="PRESERVEI RESULTADO NULO OU CONTRÁRIO À EXPECTATIVA" onPress={() => setNullResultsPreserved((value) => !value)} />
          <RuntimeChoice selected={alternativesConsidered} label="CONSIDEREI CIRCULAÇÃO, POSTURA, TEMPERATURA E MOVIMENTO DE AR" onPress={() => setAlternativesConsidered((value) => !value)} />
          <RuntimeChoice selected={auraNotClaimed} label="NÃO TRATEI A SENSAÇÃO COMO DETECÇÃO CONFIRMADA DE AURA" onPress={() => setAuraNotClaimed((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM SINTOMA DE STOP GATE AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !nullResultsPreserved || !alternativesConsidered || !auraNotClaimed || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Abrir os olhos e retornar ao ambiente">
          <Text style={runtimeTextStyles.body}>Afaste-se das duas condições, mova mãos e ombros e localize objetos reais ao redor. O retorno vale independentemente do resultado.</Text>
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Haziel 5/5 · Leitura vegetal">
          <RuntimeNotice title="EVIDÊNCIA E1–E3">O Practice Record recebe apenas tempos, flags e escalas estruturadas. Nenhum percentual de aura ou conclusão espiritual é calculado.</RuntimeNotice>
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 046'} disabled={controller.busy} onPress={() => void controller.seal({
            durationSeconds: plantSeconds + controlSeconds,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              plant_completed: true,
              rest_confirmed: restConfirmed,
              control_completed: true,
              comparison_completed: comparisonCompleted,
              interpretation_separated: interpretationSeparated,
              null_results_preserved: nullResultsPreserved,
              alternatives_considered: alternativesConsidered,
              aura_not_claimed: auraNotClaimed,
              safety_clear: safetyClear,
              plant_sensation_present: plantPresent,
              control_sensation_present: controlPresent,
              plant_seconds: plantSeconds,
              control_seconds: controlSeconds,
            },
            metrics: {
              approximate_distance_cm: 3,
              plant_intensity: plantIntensity,
              control_intensity: controlIntensity,
              plant_expectation: plantExpectation,
              control_expectation: controlExpectation,
              comfort,
              blind_assist_used: blindAssistUsed,
            },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day046_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAZIEL 5/5" /> : null}
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
  fieldLabel: { color: '#72899c', fontSize: 8, letterSpacing: 1.1 },
});
