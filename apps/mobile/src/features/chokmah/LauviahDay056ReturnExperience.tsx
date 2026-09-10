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
  runtimeTextStyles,
} from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { LAUVIAH_DAY_056 } from './runtime-definitions/lauviah';

export function LauviahDay056ReturnExperience() {
  const controller = useHnkDayRuntime(LAUVIAH_DAY_056);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [activeCompleted, setActiveCompleted] = useState(false);
  const [controlCompleted, setControlCompleted] = useState(false);
  const [activeEffect, setActiveEffect] = useState(false);
  const [controlEffect, setControlEffect] = useState(false);
  const [activeRecorded, setActiveRecorded] = useState(false);
  const [controlRecorded, setControlRecorded] = useState(false);
  const [activeTension, setActiveTension] = useState(5);
  const [controlTension, setControlTension] = useState(5);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [noHyperventilation, setNoHyperventilation] = useState(false);
  const [noRetention, setNoRetention] = useState(false);
  const [clinicalNotClaimed, setClinicalNotClaimed] = useState(false);
  const [entityNotReinforced, setEntityNotReinforced] = useState(false);
  const [nullResultsPreserved, setNullResultsPreserved] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 56)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO LAUVIAH · DIA 056</Text></View>;
  const phase = controller.phase?.id;
  const safetyStop = () => controller.interrupt({ durationSeconds: 0, evidence: { safety_stop: true }, metrics: { active_tension: activeTension, control_tension: controlTension } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · LAUVIAH 5/5 · DIA 056</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não inventa respiração, retenção ou repetição substituta.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 056 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 055 confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Tontura, dor, falta de ar ou mal-estar encerram a tentativa.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="LAUVIAH 5/5" title="Encerramento simbólico sem hiperventilação">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="SAFETY">Uma inspiração confortável, uma expiração com gargalhada breve. Sem retenção prolongada, sem séries rápidas e sem buscar tontura.</RuntimeNotice>
          <RuntimePrimary label="INICIAR ACTIVE" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'active' ? (
        <RuntimeCard label="ACTIVE" title="Expiração + gargalhada breve">
          <Text style={runtimeTextStyles.body}>Imagine a descarga simbólica e faça a expiração de modo confortável. Não repita para aumentar intensidade.</Text>
          <RuntimeScale label="TENSÃO / RUMINAÇÃO PERCEBIDA" value={activeTension} onChange={setActiveTension} />
          <RuntimeChoice selected={activeCompleted} label="CONCLUÍ UMA EXPIRAÇÃO CONFORTÁVEL COM GARGALHADA BREVE" onPress={() => setActiveCompleted((value) => !value)} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={activeRecorded && activeEffect} label="HOUVE EFEITO SUBJETIVO" onPress={() => { setActiveEffect(true); setActiveRecorded(true); }} />
            <RuntimeChoice selected={activeRecorded && !activeEffect} label="NÃO HOUVE EFEITO MARCANTE" onPress={() => { setActiveEffect(false); setActiveRecorded(true); }} />
          </View>
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="IR AO CONTROLE" disabled={!activeCompleted || !activeRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control' ? (
        <RuntimeCard label="CONTROL" title="Expiração confortável sem gargalhada">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeScale label="TENSÃO / RUMINAÇÃO PERCEBIDA" value={controlTension} onChange={setControlTension} />
          <RuntimeChoice selected={controlCompleted} label="CONCLUÍ UMA EXPIRAÇÃO CONFORTÁVEL SEM GARGALHADA" onPress={() => setControlCompleted((value) => !value)} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlRecorded && controlEffect} label="HOUVE EFEITO SUBJETIVO" onPress={() => { setControlEffect(true); setControlRecorded(true); }} />
            <RuntimeChoice selected={controlRecorded && !controlEffect} label="NÃO HOUVE EFEITO MARCANTE" onPress={() => { setControlEffect(false); setControlRecorded(true); }} />
          </View>
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="COMPARAR" disabled={!controlCompleted || !controlRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Ritual de encerramento, não expulsão literal">
          <Text style={runtimeTextStyles.body}>ACTIVE tensão {activeTension}/10 · CONTROL tensão {controlTension}/10. Diferença ou ausência de diferença permanecem válidas.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI HUMOR, TENSÃO E SENSAÇÃO DE ENCERRAMENTO" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI EFEITO SUBJETIVO DE INTERPRETAÇÃO RITUAL" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={noHyperventilation} label="NÃO HIPERVENTILEI" onPress={() => setNoHyperventilation((value) => !value)} />
          <RuntimeChoice selected={noRetention} label="NÃO FIZ RETENÇÃO PROLONGADA" onPress={() => setNoRetention((value) => !value)} />
          <RuntimeChoice selected={clinicalNotClaimed} label="NÃO TRATEI A PRÁTICA COMO SUBSTITUTO DE CUIDADO CLÍNICO" onPress={() => setClinicalNotClaimed((value) => !value)} />
          <RuntimeChoice selected={entityNotReinforced} label="NÃO INTERPRETEI CONFUSÃO COMO CONTAMINAÇÃO POR ENTIDADES" onPress={() => setEntityNotReinforced((value) => !value)} />
          <RuntimeChoice selected={nullResultsPreserved} label="PRESERVEI RESULTADO NULO OU CONTRADITÓRIO" onPress={() => setNullResultsPreserved((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM TONTURA, DOR, FALTA DE AR OU MAL-ESTAR AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !noHyperventilation || !noRetention || !clinicalNotClaimed || !entityNotReinforced || !nullResultsPreserved || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Respiração natural e retorno ao ambiente">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Lauviah 5/5">
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 056'} disabled={controller.busy} onPress={() => void controller.seal({
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              active_completed: activeCompleted,
              control_completed: controlCompleted,
              comparison_completed: comparisonCompleted,
              interpretation_separated: interpretationSeparated,
              no_hyperventilation: noHyperventilation,
              no_prolonged_retention: noRetention,
              clinical_substitute_not_claimed: clinicalNotClaimed,
              entity_contamination_not_reinforced: entityNotReinforced,
              null_results_preserved: nullResultsPreserved,
              safety_clear: safetyClear,
              active_effect_present: activeEffect,
              control_effect_present: controlEffect,
            },
            metrics: { active_tension: activeTension, control_tension: controlTension },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day056_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="LAUVIAH 5/5" /> : null}
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
