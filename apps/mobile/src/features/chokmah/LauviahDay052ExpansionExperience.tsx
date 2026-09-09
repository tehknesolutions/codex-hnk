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
import { LAUVIAH_DAY_052 } from './runtime-definitions/lauviah';

export function LauviahDay052ExpansionExperience() {
  const controller = useHnkDayRuntime(LAUVIAH_DAY_052);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [expansionSeconds, setExpansionSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [expansionPresent, setExpansionPresent] = useState(false);
  const [controlPresent, setControlPresent] = useState(false);
  const [expansionRecorded, setExpansionRecorded] = useState(false);
  const [controlRecorded, setControlRecorded] = useState(false);
  const [expansionIntensity, setExpansionIntensity] = useState(0);
  const [controlIntensity, setControlIntensity] = useState(0);
  const [comfort, setComfort] = useState(5);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [outsideBrainClaimNotMade, setOutsideBrainClaimNotMade] = useState(false);
  const [orientationPreserved, setOrientationPreserved] = useState(false);
  const [nullResultsPreserved, setNullResultsPreserved] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 52)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO LAUVIAH · DIA 052</Text></View>;
  const phase = controller.phase?.id;
  const safetyStop = () => controller.interrupt({ durationSeconds: expansionSeconds + controlSeconds, evidence: { safety_stop: true }, metrics: { comfort } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · LAUVIAH 1/5 · DIA 052</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não cria uma meditação substituta.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 052 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige Aladiah 5/5, Dia 051, confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Despersonalização, desrealização, ansiedade ou perda desconfortável de orientação encerram a tentativa.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="LAUVIAH 1/5" title="Expansão imaginativa com orientação preservada">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="HNK-EP-1.1">A experiência de expansão é imaginação/fenomenologia. Não prova consciência fisicamente fora do cérebro.</RuntimeNotice>
          <RuntimePrimary label="INICIAR EXPANSÃO · 10 MIN" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'expansion' ? (
        <RuntimeCard label="CONDIÇÃO A · EXPANSÃO" title="Atenção ampliando-se gradualmente até incluir a sala">
          <RuntimeTimer value={expansionSeconds} target={600} onChange={setExpansionSeconds} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={expansionRecorded && expansionPresent} label="HOUVE AMPLITUDE/LEVEZA/ESPACIALIDADE/QUIETUDE" onPress={() => { setExpansionPresent(true); setExpansionRecorded(true); }} />
            <RuntimeChoice selected={expansionRecorded && !expansionPresent} label="NENHUM EFEITO MARCANTE" onPress={() => { setExpansionPresent(false); setExpansionRecorded(true); }} />
          </View>
          <RuntimeScale label="INTENSIDADE PERCEBIDA" value={expansionIntensity} onChange={setExpansionIntensity} />
          <RuntimeScale label="CONFORTO" value={comfort} onChange={setComfort} />
          <RuntimeNotice title="STOP GATE">Mantenha os olhos abertos se necessário. Interrompa diante de estranheza desconfortável, ansiedade, despersonalização, desrealização ou perda de orientação.</RuntimeNotice>
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="IR AO CONTROLE" disabled={expansionSeconds < 600 || !expansionRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control' ? (
        <RuntimeCard label="CONDIÇÃO B · CONTROLE" title="Pontos de contato do corpo + respiração · 10 min">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeTimer value={controlSeconds} target={600} onChange={setControlSeconds} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlRecorded && controlPresent} label="HOUVE EFEITO SUBJETIVO MARCANTE" onPress={() => { setControlPresent(true); setControlRecorded(true); }} />
            <RuntimeChoice selected={controlRecorded && !controlPresent} label="NENHUM EFEITO MARCANTE" onPress={() => { setControlPresent(false); setControlRecorded(true); }} />
          </View>
          <RuntimeScale label="INTENSIDADE PERCEBIDA" value={controlIntensity} onChange={setControlIntensity} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="COMPARAR" disabled={controlSeconds < 600 || !controlRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Amplitude subjetiva não é localização física da consciência">
          <Text style={runtimeTextStyles.body}>Expansão {expansionIntensity}/10 · controle {controlIntensity}/10. Ausência de diferença continua válida.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI SEM ELEGER UMA CONDIÇÃO VENCEDORA" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI FENOMENOLOGIA DE INTERPRETAÇÃO" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={outsideBrainClaimNotMade} label="NÃO TRATEI EXPANSÃO COMO PROVA DE CONSCIÊNCIA FORA DO CÉREBRO" onPress={() => setOutsideBrainClaimNotMade((value) => !value)} />
          <RuntimeChoice selected={orientationPreserved} label="MINHA ORIENTAÇÃO AO AMBIENTE FOI PRESERVADA" onPress={() => setOrientationPreserved((value) => !value)} />
          <RuntimeChoice selected={nullResultsPreserved} label="PRESERVEI RESULTADO NULO OU CONTRADITÓRIO" onPress={() => setNullResultsPreserved((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM SINTOMA DE STOP GATE AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !outsideBrainClaimNotMade || !orientationPreserved || !nullResultsPreserved || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Corpo, sala e orientação comum">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(5, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 5} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Lauviah 1/5">
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 052'} disabled={controller.busy} onPress={() => void controller.seal({
            durationSeconds: expansionSeconds + controlSeconds,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              expansion_completed: true,
              control_completed: true,
              comparison_completed: comparisonCompleted,
              interpretation_separated: interpretationSeparated,
              outside_brain_claim_not_made: outsideBrainClaimNotMade,
              orientation_preserved: orientationPreserved,
              null_results_preserved: nullResultsPreserved,
              safety_clear: safetyClear,
              expansion_effect_present: expansionPresent,
              control_effect_present: controlPresent,
              expansion_seconds: expansionSeconds,
              control_seconds: controlSeconds,
            },
            metrics: { expansion_intensity: expansionIntensity, control_intensity: controlIntensity, comfort },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day052_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="LAUVIAH 1/5" /> : null}
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
