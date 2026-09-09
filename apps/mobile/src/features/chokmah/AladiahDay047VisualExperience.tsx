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
import { ALADIAH_DAY_047 } from './runtime-definitions/aladiah';

const CONDITION_SECONDS = 300;

export function AladiahDay047VisualExperience() {
  const controller = useHnkDayRuntime(ALADIAH_DAY_047);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [blackSeconds, setBlackSeconds] = useState(0);
  const [whiteSeconds, setWhiteSeconds] = useState(0);
  const [brightBlackSeconds, setBrightBlackSeconds] = useState(0);
  const [brightWhiteSeconds, setBrightWhiteSeconds] = useState(0);
  const [primaryPresent, setPrimaryPresent] = useState(false);
  const [controlPresent, setControlPresent] = useState(false);
  const [primaryRecorded, setPrimaryRecorded] = useState(false);
  const [controlRecorded, setControlRecorded] = useState(false);
  const [primaryIntensity, setPrimaryIntensity] = useState(0);
  const [controlIntensity, setControlIntensity] = useState(0);
  const [comfort, setComfort] = useState(5);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [nullResultsPreserved, setNullResultsPreserved] = useState(false);
  const [diagnosisNotMade, setDiagnosisNotMade] = useState(false);
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
    void loadCanonicalDay(controller.auth.client, 47)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO ALADIAH · DIA 047</Text></View>;

  const phase = controller.phase?.id;
  const safetyStop = (durationSeconds: number) => controller.interrupt({ durationSeconds, evidence: { safety_stop: true }, metrics: { comfort } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · ALADIAH 1/5 · DIA 047</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não substitui o Dia 047 por instrução genérica.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 047 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige Haziel 5/5, Dia 046, confirmado pelo servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Dor ocular, cefaleia, visão alterada ou ansiedade encerram a tentativa sem perda do progresso anterior.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="ALADIAH 1/5" title="Percepção periférica sem diagnóstico visual">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="SEGURANÇA VISUAL">Piscar normalmente, usar luz indireta confortável e não encarar fonte luminosa. Halo, brilho ou ausência de efeito permanecem experiência perceptiva, não diagnóstico ou medição de aura.</RuntimeNotice>
          <RuntimePrimary label="INICIAR FUNDO PRETO" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'black' ? (
        <RuntimeCard label="CONDIÇÃO A1" title="Mãos · fundo preto · luz indireta · 5 min">
          <RuntimeTimer value={blackSeconds} target={CONDITION_SECONDS} onChange={setBlackSeconds} />
          <RuntimeScale label="CONFORTO VISUAL" value={comfort} onChange={setComfort} />
          <RuntimePrimary label="SAFETY STOP" onPress={() => safetyStop(blackSeconds)} />
          <RuntimePrimary label="IR AO FUNDO BRANCO" disabled={blackSeconds < CONDITION_SECONDS} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'white' ? (
        <RuntimeCard label="CONDIÇÃO A2" title="Mãos · fundo branco · luz indireta · 5 min">
          <RuntimeTimer value={whiteSeconds} target={CONDITION_SECONDS} onChange={setWhiteSeconds} />
          <Text style={styles.fieldLabel}>RESULTADO DA CONDIÇÃO PRINCIPAL</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={primaryRecorded && primaryPresent} label="HOUVE HALO, CONTRASTE, COR, BRILHO OU NÉVOA" onPress={() => { setPrimaryPresent(true); setPrimaryRecorded(true); }} />
            <RuntimeChoice selected={primaryRecorded && !primaryPresent} label="NENHUM EFEITO VISUAL" onPress={() => { setPrimaryPresent(false); setPrimaryRecorded(true); }} />
          </View>
          <RuntimeScale label="INTENSIDADE PERCEBIDA" value={primaryIntensity} onChange={setPrimaryIntensity} />
          <RuntimePrimary label="SAFETY STOP" onPress={() => safetyStop(blackSeconds + whiteSeconds)} />
          <RuntimePrimary label="ABRIR CONTROLE COM LUZ MAIS CLARA" disabled={whiteSeconds < CONDITION_SECONDS || !primaryRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'bright-black' ? (
        <RuntimeCard label="CONTROLE B1" title="Fundo preto · iluminação mais clara · 5 min">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeTimer value={brightBlackSeconds} target={CONDITION_SECONDS} onChange={setBrightBlackSeconds} />
          <RuntimePrimary label="SAFETY STOP" onPress={() => safetyStop(blackSeconds + whiteSeconds + brightBlackSeconds)} />
          <RuntimePrimary label="IR AO CONTROLE BRANCO" disabled={brightBlackSeconds < CONDITION_SECONDS} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'bright-white' ? (
        <RuntimeCard label="CONTROLE B2" title="Fundo branco · iluminação mais clara · 5 min">
          <RuntimeTimer value={brightWhiteSeconds} target={CONDITION_SECONDS} onChange={setBrightWhiteSeconds} />
          <Text style={styles.fieldLabel}>RESULTADO DO CONTROLE</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlRecorded && controlPresent} label="HOUVE ALGUM EFEITO VISUAL" onPress={() => { setControlPresent(true); setControlRecorded(true); }} />
            <RuntimeChoice selected={controlRecorded && !controlPresent} label="NENHUM EFEITO VISUAL" onPress={() => { setControlPresent(false); setControlRecorded(true); }} />
          </View>
          <RuntimeScale label="INTENSIDADE PERCEBIDA" value={controlIntensity} onChange={setControlIntensity} />
          <RuntimePrimary label="SAFETY STOP" onPress={() => safetyStop(blackSeconds + whiteSeconds + brightBlackSeconds + brightWhiteSeconds)} />
          <RuntimePrimary label="COMPARAR" disabled={brightWhiteSeconds < CONDITION_SECONDS || !controlRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Contexto visual antes de interpretação">
          <Text style={runtimeTextStyles.body}>Luz indireta: {primaryPresent ? 'efeito presente' : 'nenhum efeito'} · {primaryIntensity}/10. Luz mais clara: {controlPresent ? 'efeito presente' : 'nenhum efeito'} · {controlIntensity}/10.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI AS CONDIÇÕES SEM ELEGER VENCEDOR" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI PERCEPÇÃO DE INTERPRETAÇÃO TRADICIONAL" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={nullResultsPreserved} label="PRESERVEI AUSÊNCIA OU CONTRADIÇÃO COMO RESULTADO VÁLIDO" onPress={() => setNullResultsPreserved((value) => !value)} />
          <RuntimeChoice selected={diagnosisNotMade} label="NÃO USEI COR/HALO PARA DIAGNOSTICAR HUMOR, SAÚDE OU CARÁTER" onPress={() => setDiagnosisNotMade((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM SINTOMA DE STOP GATE AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !nullResultsPreserved || !diagnosisNotMade || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Voltar ao foco comum">
          <Text style={runtimeTextStyles.body}>Pisque normalmente, mova mãos e pés e nomeie elementos reais do ambiente antes de fechar a sessão.</Text>
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Aladiah 1/5">
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 047'} disabled={controller.busy} onPress={() => void controller.seal({
            durationSeconds: blackSeconds + whiteSeconds + brightBlackSeconds + brightWhiteSeconds,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              black_completed: true,
              white_completed: true,
              bright_black_completed: true,
              bright_white_completed: true,
              comparison_completed: comparisonCompleted,
              interpretation_separated: interpretationSeparated,
              null_results_preserved: nullResultsPreserved,
              diagnosis_not_made: diagnosisNotMade,
              safety_clear: safetyClear,
              primary_effect_present: primaryPresent,
              control_effect_present: controlPresent,
              black_seconds: blackSeconds,
              white_seconds: whiteSeconds,
              bright_black_seconds: brightBlackSeconds,
              bright_white_seconds: brightWhiteSeconds,
            },
            metrics: { primary_intensity: primaryIntensity, control_intensity: controlIntensity, comfort },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day047_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ALADIAH 1/5" /> : null}
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
