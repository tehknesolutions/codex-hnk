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
import { ALADIAH_DAY_050 } from './runtime-definitions/aladiah';

export function AladiahDay050ContourExperience() {
  const controller = useHnkDayRuntime(ALADIAH_DAY_050);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [primarySeconds, setPrimarySeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [subjectSelected, setSubjectSelected] = useState(false);
  const [thirdPartyUsed, setThirdPartyUsed] = useState(false);
  const [thirdPartyConsent, setThirdPartyConsent] = useState(false);
  const [primaryPresent, setPrimaryPresent] = useState(false);
  const [controlPresent, setControlPresent] = useState(false);
  const [primaryRecorded, setPrimaryRecorded] = useState(false);
  const [controlRecorded, setControlRecorded] = useState(false);
  const [primaryIntensity, setPrimaryIntensity] = useState(0);
  const [controlIntensity, setControlIntensity] = useState(0);
  const [comfort, setComfort] = useState(5);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [privacyPreserved, setPrivacyPreserved] = useState(false);
  const [diagnosisNotMade, setDiagnosisNotMade] = useState(false);
  const [nullResultsPreserved, setNullResultsPreserved] = useState(false);
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
    void loadCanonicalDay(controller.auth.client, 50)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO ALADIAH · DIA 050</Text></View>;
  const phase = controller.phase?.id;
  const consentReady = subjectSelected && (!thirdPartyUsed || thirdPartyConsent);
  const consentRuleRespected = !thirdPartyUsed || thirdPartyConsent;
  const safetyStop = () => controller.interrupt({ durationSeconds: primarySeconds + controlSeconds, evidence: { safety_stop: true }, metrics: { comfort } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · ALADIAH 4/5 · DIA 050</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não cria uma prática visual substituta.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 050 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 049 confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Fadiga, dor ocular, ansiedade ou desconforto social encerram a tentativa.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="ALADIAH 4/5" title="Contorno visual sob consentimento e privacidade">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="PRIVACIDADE">O app não pede nome, foto, rosto nem interpretação pessoal de terceiros. A opção mais simples é o próprio reflexo.</RuntimeNotice>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={subjectSelected && !thirdPartyUsed} label="USAR MEU PRÓPRIO REFLEXO" onPress={() => { setSubjectSelected(true); setThirdPartyUsed(false); setThirdPartyConsent(false); }} />
            <RuntimeChoice selected={subjectSelected && thirdPartyUsed} label="USAR PESSOA CONSENTIDA" onPress={() => { setSubjectSelected(true); setThirdPartyUsed(true); }} />
          </View>
          {thirdPartyUsed ? <RuntimeChoice selected={thirdPartyConsent} label="A PESSOA DEU CONSENTIMENTO EXPLÍCITO" onPress={() => setThirdPartyConsent((value) => !value)} /> : null}
          <RuntimePrimary label="INICIAR CONDIÇÃO PRINCIPAL" disabled={!canon || !consentReady || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'primary' ? (
        <RuntimeCard label="CONDIÇÃO A" title="Região acima da cabeça/ombros · fundo simples · luz indireta · 5 min">
          <RuntimeTimer value={primarySeconds} target={300} onChange={setPrimarySeconds} />
          <RuntimeNotice title="REGRA ÉTICA">Piscar normalmente. Cor, halo ou movimento percebido não autorizam julgamento sobre humor, saúde ou caráter.</RuntimeNotice>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={primaryRecorded && primaryPresent} label="HOUVE COR/HALO/CONTRASTE/MOVIMENTO" onPress={() => { setPrimaryPresent(true); setPrimaryRecorded(true); }} />
            <RuntimeChoice selected={primaryRecorded && !primaryPresent} label="NENHUM EFEITO VISUAL" onPress={() => { setPrimaryPresent(false); setPrimaryRecorded(true); }} />
          </View>
          <RuntimeScale label="INTENSIDADE PERCEBIDA" value={primaryIntensity} onChange={setPrimaryIntensity} />
          <RuntimeScale label="CONFORTO" value={comfort} onChange={setComfort} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="IR AO CONTROLE" disabled={primarySeconds < 300 || !primaryRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control' ? (
        <RuntimeCard label="CONDIÇÃO B · CONTROLE" title="Espelho, silhueta neutra ou mudança controlada de fundo/luz · 5 min">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeTimer value={controlSeconds} target={300} onChange={setControlSeconds} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlRecorded && controlPresent} label="HOUVE ALGUM EFEITO VISUAL" onPress={() => { setControlPresent(true); setControlRecorded(true); }} />
            <RuntimeChoice selected={controlRecorded && !controlPresent} label="NENHUM EFEITO VISUAL" onPress={() => { setControlPresent(false); setControlRecorded(true); }} />
          </View>
          <RuntimeScale label="INTENSIDADE PERCEBIDA" value={controlIntensity} onChange={setControlIntensity} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="COMPARAR" disabled={controlSeconds < 300 || !controlRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Percepção visual ambígua não autoriza julgamento">
          <Text style={runtimeTextStyles.body}>Principal: {primaryPresent ? 'efeito presente' : 'nenhum efeito'} · {primaryIntensity}/10. Controle: {controlPresent ? 'efeito presente' : 'nenhum efeito'} · {controlIntensity}/10.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI AS CONDIÇÕES" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI PERCEPÇÃO DE INTERPRETAÇÃO TRADICIONAL" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={privacyPreserved} label="NÃO REGISTREI IDENTIDADE, ROSTO, IMAGEM OU DADOS PESSOAIS DE TERCEIRO" onPress={() => setPrivacyPreserved((value) => !value)} />
          <RuntimeChoice selected={diagnosisNotMade} label="NÃO DIAGNOSTIQUEI HUMOR, SAÚDE OU CARÁTER" onPress={() => setDiagnosisNotMade((value) => !value)} />
          <RuntimeChoice selected={nullResultsPreserved} label="PRESERVEI AUSÊNCIA OU CONTRADIÇÃO COMO RESULTADO VÁLIDO" onPress={() => setNullResultsPreserved((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM FADIGA, DOR OCULAR, ANSIEDADE OU DESCONFORTO SOCIAL RELEVANTE" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !privacyPreserved || !diagnosisNotMade || !nullResultsPreserved || !safetyClear || !consentRuleRespected} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Retorno visual e social">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Aladiah 4/5">
          <RuntimeNotice title="MINIMIZAÇÃO">Somente flags, tempos e escalas seguem ao servidor. Nenhum identificador, imagem ou descrição de terceiro é enviado.</RuntimeNotice>
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 050'} disabled={controller.busy} onPress={() => void controller.seal({
            durationSeconds: primarySeconds + controlSeconds,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              primary_completed: true,
              control_completed: true,
              comparison_completed: comparisonCompleted,
              interpretation_separated: interpretationSeparated,
              consent_rule_respected: consentRuleRespected,
              privacy_preserved: privacyPreserved,
              diagnosis_not_made: diagnosisNotMade,
              null_results_preserved: nullResultsPreserved,
              safety_clear: safetyClear,
              primary_effect_present: primaryPresent,
              control_effect_present: controlPresent,
              third_party_used: thirdPartyUsed,
              third_party_consent: thirdPartyConsent,
              primary_seconds: primarySeconds,
              control_seconds: controlSeconds,
            },
            metrics: { primary_intensity: primaryIntensity, control_intensity: controlIntensity, comfort },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day050_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ALADIAH 4/5" /> : null}
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
