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
import { HAHAIAH_DAY_061 } from './runtime-definitions/hahaiah';

export function HahaiahDay061DigitalGovernanceExperience() {
  const controller = useHnkDayRuntime(HAHAIAH_DAY_061);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const [interruptionsBefore, setInterruptionsBefore] = useState(0);
  const [unlocksBefore, setUnlocksBefore] = useState(0);
  const [urgencyBefore, setUrgencyBefore] = useState(5);
  const [baselineCompleted, setBaselineCompleted] = useState(false);

  const [homeReorganized, setHomeReorganized] = useState(false);
  const [promotionalReduced, setPromotionalReduced] = useState(false);
  const [criticalAlertsPreserved, setCriticalAlertsPreserved] = useState(false);
  const [securityAuthPreserved, setSecurityAuthPreserved] = useState(false);
  const [familyEmergencyPreserved, setFamilyEmergencyPreserved] = useState(false);
  const [noAutomaticCriticalChange, setNoAutomaticCriticalChange] = useState(false);
  const [focusPeriodsDefined, setFocusPeriodsDefined] = useState(0);

  const [interruptionsAfter, setInterruptionsAfter] = useState(0);
  const [unlocksAfter, setUnlocksAfter] = useState(0);
  const [urgencyAfter, setUrgencyAfter] = useState(5);
  const [afterWindowCompleted, setAfterWindowCompleted] = useState(false);

  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [usefulAlertsReviewed, setUsefulAlertsReviewed] = useState(false);
  const [sustainableConfigurationSelected, setSustainableConfigurationSelected] = useState(false);
  const [reviewTimeSelected, setReviewTimeSelected] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 61)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setLocalError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO HAHAIAH · DIA 061</Text></View>;
  const phase = controller.phase?.id;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · HAHAIAH 5/5 · DIA 061</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? (
        <RuntimeCard label="GATE" title="Dia 061 bloqueado pela sequência">
          <Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 060 confirmado no servidor.</Text>
        </RuntimeCard>
      ) : null}

      {phase === 'threshold' ? (
        <RuntimeCard label="HAHAIAH 5/5" title="Governança digital sem apagão indiscriminado">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="AÇÃO MANUAL">O HNK não altera notificações críticas nem configurações do sistema automaticamente. Você decide e confirma cada mudança no próprio aparelho.</RuntimeNotice>
          <RuntimePrimary label="INICIAR INVENTÁRIO" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'baseline' ? (
        <RuntimeCard label="BASELINE" title="Janela habitual antes de reorganizar">
          <RuntimeCounter label="INTERRUPÇÕES PERCEBIDAS" value={interruptionsBefore} onPress={() => setInterruptionsBefore((v) => v + 1)} />
          <RuntimeCounter label="DESBLOQUEIOS / CHECAGENS" value={unlocksBefore} onPress={() => setUnlocksBefore((v) => v + 1)} />
          <RuntimeScale label="URGÊNCIA PERCEBIDA" value={urgencyBefore} onChange={setUrgencyBefore} />
          <RuntimeChoice selected={baselineCompleted} label="CONCLUÍ UMA JANELA HABITUAL E REGISTREI O BASELINE" onPress={() => setBaselineCompleted((v) => !v)} />
          <RuntimePrimary label="REORGANIZAR MANUALMENTE" disabled={!baselineCompleted} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'reorganize' ? (
        <RuntimeCard label="REORGANIZAÇÃO" title="Reduzir ruído sem reduzir segurança">
          <RuntimeChoice selected={homeReorganized} label="REORGANIZEI A TELA INICIAL MANUALMENTE" onPress={() => setHomeReorganized((v) => !v)} />
          <RuntimeChoice selected={promotionalReduced} label="REDUZI SOMENTE ALERTAS PROMOCIONAIS OU REPETITIVOS QUE JULGUEI DISPENSÁVEIS" onPress={() => setPromotionalReduced((v) => !v)} />
          <RuntimeChoice selected={criticalAlertsPreserved} label="PRESERVEI ALERTAS CRÍTICOS DE SEGURANÇA/EMERGÊNCIA/SAÚDE" onPress={() => setCriticalAlertsPreserved((v) => !v)} />
          <RuntimeChoice selected={securityAuthPreserved} label="PRESERVEI AUTENTICAÇÃO E ALERTAS DE SEGURANÇA DE CONTA" onPress={() => setSecurityAuthPreserved((v) => !v)} />
          <RuntimeChoice selected={familyEmergencyPreserved} label="PRESERVEI CONTATOS IMPORTANTES, FAMÍLIA E EMERGÊNCIAS" onPress={() => setFamilyEmergencyPreserved((v) => !v)} />
          <RuntimeChoice selected={noAutomaticCriticalChange} label="CONFIRMO QUE O APP NÃO FEZ ALTERAÇÃO CRÍTICA AUTOMÁTICA" onPress={() => setNoAutomaticCriticalChange((v) => !v)} />
          <RuntimeCounter label="PERÍODOS DE FOCO DEFINIDOS" value={focusPeriodsDefined} onPress={() => setFocusPeriodsDefined((v) => Math.min(2, v + 1))} />
          <RuntimePrimary
            label="ABRIR JANELA PÓS-MUDANÇA"
            disabled={!homeReorganized || !criticalAlertsPreserved || !securityAuthPreserved || !familyEmergencyPreserved || !noAutomaticCriticalChange || focusPeriodsDefined < 2}
            onPress={controller.nextPhase}
          />
        </RuntimeCard>
      ) : null}

      {phase === 'after' ? (
        <RuntimeCard label="PÓS-MUDANÇA" title="Usar normalmente e observar a atenção">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeCounter label="INTERRUPÇÕES APÓS" value={interruptionsAfter} onPress={() => setInterruptionsAfter((v) => v + 1)} />
          <RuntimeCounter label="DESBLOQUEIOS / CHECAGENS APÓS" value={unlocksAfter} onPress={() => setUnlocksAfter((v) => v + 1)} />
          <RuntimeScale label="URGÊNCIA PERCEBIDA APÓS" value={urgencyAfter} onChange={setUrgencyAfter} />
          <RuntimeChoice selected={afterWindowCompleted} label="CONCLUÍ UMA JANELA COMPARÁVEL SEM REAJUSTAR NO MEIO" onPress={() => setAfterWindowCompleted((v) => !v)} />
          <RuntimePrimary label="COMPARAR" disabled={!afterWindowCompleted} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Menos notificações não é score moral">
          <Text style={runtimeTextStyles.body}>Antes: {interruptionsBefore} interrupções, {unlocksBefore} checagens, urgência {urgencyBefore}/10. Depois: {interruptionsAfter}, {unlocksAfter}, urgência {urgencyAfter}/10.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI ANTES/DEPOIS SEM EXIGIR MELHORA" onPress={() => setComparisonCompleted((v) => !v)} />
          <RuntimeChoice selected={usefulAlertsReviewed} label="REVI QUAIS ALERTAS ERAM REALMENTE ÚTEIS E RESTAURARIA QUALQUER ALERTA IMPORTANTE" onPress={() => setUsefulAlertsReviewed((v) => !v)} />
          <RuntimeChoice selected={safetyClear} label="A CONFIGURAÇÃO FINAL NÃO REDUZ SEGURANÇA, CUIDADO OU RESPONSABILIDADE" onPress={() => setSafetyClear((v) => !v)} />
          <RuntimePrimary label="GROUNDING / CONFIGURAÇÃO FINAL" disabled={!comparisonCompleted || !usefulAlertsReviewed || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Escolher uma configuração sustentável">
          <RuntimeChoice selected={sustainableConfigurationSelected} label="ESCOLHI UMA CONFIGURAÇÃO SUSTENTÁVEL PARA OS PRÓXIMOS SETE DIAS" onPress={() => setSustainableConfigurationSelected((v) => !v)} />
          <RuntimeChoice selected={reviewTimeSelected} label="DEFINI UM HORÁRIO/DIA REAL PARA REVISAR ESSA CONFIGURAÇÃO" onPress={() => setReviewTimeSelected((v) => !v)} />
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(3, v + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={!sustainableConfigurationSelected || !reviewTimeSelected || objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Hahaiah 5/5">
          <RuntimePrimary
            label={controller.busy ? 'SELANDO…' : 'SELAR DIA 061'}
            disabled={controller.busy}
            onPress={() => void controller.seal({
              evidence: {
                protocol_completed: true,
                return_confirmed: true,
                baseline_completed: baselineCompleted,
                manual_reorganization_completed: homeReorganized,
                after_window_completed: afterWindowCompleted,
                comparison_completed: comparisonCompleted,
                critical_alerts_preserved: criticalAlertsPreserved,
                security_auth_preserved: securityAuthPreserved,
                family_emergency_preserved: familyEmergencyPreserved,
                no_automatic_critical_change: noAutomaticCriticalChange,
                sustainable_configuration_selected: sustainableConfigurationSelected,
                review_time_selected: reviewTimeSelected,
                safety_clear: safetyClear,
                interruptions_before: interruptionsBefore,
                interruptions_after: interruptionsAfter,
                unlocks_before: unlocksBefore,
                unlocks_after: unlocksAfter,
              },
              metrics: { urgency_before: urgencyBefore, urgency_after: urgencyAfter, focus_periods_defined: focusPeriodsDefined, promotional_reduced: promotionalReduced, useful_alerts_reviewed: usefulAlertsReviewed },
            }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day061_seal_failed'))}
          />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAHAIAH 5/5" /> : null}
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
