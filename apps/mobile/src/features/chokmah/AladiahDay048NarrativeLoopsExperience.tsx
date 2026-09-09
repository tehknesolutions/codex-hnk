import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
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
import { ALADIAH_DAY_048 } from './runtime-definitions/aladiah';

export function AladiahDay048NarrativeLoopsExperience() {
  const controller = useHnkDayRuntime(ALADIAH_DAY_048);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [loops, setLoops] = useState(['', '', '']);
  const [linear, setLinear] = useState(['', '', '']);
  const [loopStep, setLoopStep] = useState(0);
  const [loopEffectPresent, setLoopEffectPresent] = useState(false);
  const [linearEffectPresent, setLinearEffectPresent] = useState(false);
  const [loopEffectRecorded, setLoopEffectRecorded] = useState(false);
  const [linearEffectRecorded, setLinearEffectRecorded] = useState(false);
  const [loopAbsorption, setLoopAbsorption] = useState(5);
  const [linearAbsorption, setLinearAbsorption] = useState(5);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [consentOnly, setConsentOnly] = useState(false);
  const [coercionNotUsed, setCoercionNotUsed] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [vaultAcknowledged, setVaultAcknowledged] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    setCanon(null);
    setCanonError(null);
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 48)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO ALADIAH · DIA 048</Text></View>;
  const phase = controller.phase?.id;
  const allLoopsHaveText = loops.every((value) => value.trim().length >= 12);
  const allLinearHaveText = linear.every((value) => value.trim().length >= 12);
  const allThreadsClosed = loopStep >= 6;

  const updateLoop = (index: number, value: string) => setLoops((current) => current.map((item, i) => i === index ? value : item));
  const updateLinear = (index: number, value: string) => setLinear((current) => current.map((item, i) => i === index ? value : item));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · ALADIAH 2/5 · DIA 048</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não cria um exercício narrativo substituto.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 048 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 047 confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Sobrecarga ou ansiedade encerram a tentativa. Feche mentalmente os fios narrativos antes de retomar outra atividade.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="ALADIAH 2/5" title="Loops narrativos apenas em autoestudo, criação ou interação consentida">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="PRIVACIDADE">O texto integral das histórias ficará apenas no Vault cifrado. Evidence operacional não recebe prosa.</RuntimeNotice>
          <RuntimePrimary label="INICIAR E ABRIR HISTÓRIA 1" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(() => { setLoopStep(1); controller.nextPhase(); })} />
        </RuntimeCard>
      ) : null}

      {phase === 'loops' ? (
        <RuntimeCard label="CONDIÇÃO A · LOOPS" title="Abrir 1→2→3 · fechar 3→2→1">
          <RuntimeNotice title="ORDEM CANÔNICA">Não deixe fios deliberadamente abertos ao finalizar. O runtime acompanha a ordem de abertura e fechamento.</RuntimeNotice>
          <Text style={styles.step}>ETAPA {loopStep}/6</Text>
          <TextInput value={loops[0]} onChangeText={(value) => updateLoop(0, value)} multiline placeholder="História 1 · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
          {loopStep >= 2 ? <TextInput value={loops[1]} onChangeText={(value) => updateLoop(1, value)} multiline placeholder="História 2 · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} /> : null}
          {loopStep >= 3 ? <TextInput value={loops[2]} onChangeText={(value) => updateLoop(2, value)} multiline placeholder="História 3 · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} /> : null}
          {loopStep === 1 ? <RuntimePrimary label="SUSPENDER 1 · ABRIR 2" disabled={loops[0].trim().length < 12} onPress={() => setLoopStep(2)} /> : null}
          {loopStep === 2 ? <RuntimePrimary label="SUSPENDER 2 · ABRIR 3" disabled={loops[1].trim().length < 12} onPress={() => setLoopStep(3)} /> : null}
          {loopStep === 3 ? <RuntimePrimary label="FECHAR HISTÓRIA 3" disabled={loops[2].trim().length < 12} onPress={() => setLoopStep(4)} /> : null}
          {loopStep === 4 ? <RuntimePrimary label="FECHAR HISTÓRIA 2" onPress={() => setLoopStep(5)} /> : null}
          {loopStep === 5 ? <RuntimePrimary label="FECHAR HISTÓRIA 1" onPress={() => setLoopStep(6)} /> : null}
          {loopStep >= 6 ? (
            <>
              <View style={runtimeTextStyles.row}>
                <RuntimeChoice selected={loopEffectRecorded && loopEffectPresent} label="HOUVE CURIOSIDADE/ABSORÇÃO/CONFUSÃO/MEMÓRIA" onPress={() => { setLoopEffectPresent(true); setLoopEffectRecorded(true); }} />
                <RuntimeChoice selected={loopEffectRecorded && !loopEffectPresent} label="NENHUM EFEITO MARCANTE" onPress={() => { setLoopEffectPresent(false); setLoopEffectRecorded(true); }} />
              </View>
              <RuntimeScale label="ABSORÇÃO PERCEBIDA" value={loopAbsorption} onChange={setLoopAbsorption} />
              <RuntimePrimary label="IR AO CONTROLE LINEAR" disabled={!allLoopsHaveText || !loopEffectRecorded} onPress={controller.nextPhase} />
            </>
          ) : null}
          <RuntimePrimary label="ENCERRAR POR SOBRECARGA" onPress={() => controller.interrupt({ evidence: { safety_stop: true }, metrics: { loop_step: loopStep } })} />
        </RuntimeCard>
      ) : null}

      {phase === 'linear' ? (
        <RuntimeCard label="CONDIÇÃO B · LINEAR" title="Três histórias independentes de tamanho semelhante">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          {linear.map((value, index) => <TextInput key={index} value={value} onChangeText={(next) => updateLinear(index, next)} multiline placeholder={`História linear ${index + 1} · Vault`} placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />)}
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={linearEffectRecorded && linearEffectPresent} label="HOUVE EFEITO MARCANTE" onPress={() => { setLinearEffectPresent(true); setLinearEffectRecorded(true); }} />
            <RuntimeChoice selected={linearEffectRecorded && !linearEffectPresent} label="NENHUM EFEITO MARCANTE" onPress={() => { setLinearEffectPresent(false); setLinearEffectRecorded(true); }} />
          </View>
          <RuntimeScale label="ABSORÇÃO PERCEBIDA" value={linearAbsorption} onChange={setLinearAbsorption} />
          <RuntimePrimary label="COMPARAR" disabled={!allLinearHaveText || !linearEffectRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Loop não é coerção">
          <Text style={runtimeTextStyles.body}>Loops: absorção {loopAbsorption}/10 · linear: {linearAbsorption}/10. Diferença não demonstra poder hipnótico universal.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI LOOP E CONTROLE LINEAR" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI EXPERIÊNCIA SUBJETIVA DE ALEGAÇÃO CAUSAL" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={consentOnly} label="USO RESTRITO A AUTOESTUDO, CRIAÇÃO OU INTERAÇÃO CONSENTIDA" onPress={() => setConsentOnly((value) => !value)} />
          <RuntimeChoice selected={coercionNotUsed} label="NÃO USEI LOOPS PARA COERÇÃO DISFARÇADA" onPress={() => setCoercionNotUsed((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM ANSIEDADE OU SOBRECARGA RELEVANTE AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !consentOnly || !coercionNotUsed || !safetyClear || !allThreadsClosed} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Todos os fios explicitamente fechados">
          <RuntimeNotice title="FECHAMENTO">3 histórias abertas e 3 fechadas em ordem inversa. Nenhum fio deliberado permanece pendente.</RuntimeNotice>
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'vault' ? (
        <RuntimeCard label="VAULT" title="Histórias não pertencem ao Practice Record">
          <RuntimeChoice selected={vaultAcknowledged} label="CONFIRMO QUE O TEXTO INTEGRAL SERÁ CIFRADO NO VAULT" onPress={() => setVaultAcknowledged((value) => !value)} />
          <RuntimePrimary label="PREPARAR SELO" disabled={!vaultAcknowledged} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Aladiah 2/5">
          <RuntimePrimary label={controller.busy ? 'CIFRANDO E SELANDO…' : 'CIFRAR VAULT E SELAR DIA 048'} disabled={controller.busy || !controller.auth.client || !controller.auth.userId} onPress={() => void (async () => {
            setLocalError(null);
            try {
              if (!controller.auth.client || !controller.auth.userId) return;
              const encrypted = await encryptVaultText({
                userId: controller.auth.userId,
                day: 48,
                kind: 'narrative-loops',
                plaintext: JSON.stringify({ schema: 'hnk-day048-narrative-loops-v1', loops: loops.map((value) => value.trim()), linear: linear.map((value) => value.trim()) }),
              });
              await saveEncryptedVaultEntry(controller.auth.client, { day: 48, payload: encrypted });
              await controller.seal({
                localRecordHash: encrypted.checksumSha256,
                evidence: {
                  protocol_completed: true,
                  return_confirmed: true,
                  loop_structure_completed: true,
                  linear_control_completed: true,
                  all_threads_closed: allThreadsClosed,
                  comparison_completed: comparisonCompleted,
                  interpretation_separated: interpretationSeparated,
                  consent_only: consentOnly,
                  coercion_not_used: coercionNotUsed,
                  vault_saved: true,
                  safety_clear: safetyClear,
                  loop_effect_present: loopEffectPresent,
                  linear_effect_present: linearEffectPresent,
                  loops_opened: 3,
                  loops_closed: 3,
                  linear_stories_completed: 3,
                },
                metrics: { loop_absorption: loopAbsorption, linear_absorption: linearAbsorption },
              });
              controller.nextPhase();
            } catch (cause) {
              setLocalError(cause instanceof Error ? cause.message : 'day048_seal_failed');
            }
          })()} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ALADIAH 2/5" /> : null}
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
  step: { color: '#d8c982', fontSize: 12, letterSpacing: 1.2 },
});
