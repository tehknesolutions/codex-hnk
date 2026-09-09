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
import { LAUVIAH_DAY_053 } from './runtime-definitions/lauviah';

const sixDigit = /^\d{6}$/;

export function LauviahDay053BlindTargetExperience() {
  const controller = useHnkDayRuntime(LAUVIAH_DAY_053);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [targetId, setTargetId] = useState('');
  const [controlId, setControlId] = useState('');
  const [targetNotes, setTargetNotes] = useState({ forms: '', colors: '', textures: '', impressions: '' });
  const [controlNotes, setControlNotes] = useState({ forms: '', colors: '', textures: '', impressions: '' });
  const [targetConfidence, setTargetConfidence] = useState(5);
  const [controlConfidence, setControlConfidence] = useState(5);
  const [targetVaultSaved, setTargetVaultSaved] = useState(false);
  const [controlVaultSaved, setControlVaultSaved] = useState(false);
  const [targetChecksum, setTargetChecksum] = useState<string | null>(null);
  const [targetEffectPresent, setTargetEffectPresent] = useState(false);
  const [controlEffectPresent, setControlEffectPresent] = useState(false);
  const [targetEffectRecorded, setTargetEffectRecorded] = useState(false);
  const [controlEffectRecorded, setControlEffectRecorded] = useState(false);
  const [feedbackRevealed, setFeedbackRevealed] = useState(false);
  const [controlModeTargetless, setControlModeTargetless] = useState(true);
  const [errorsIncluded, setErrorsIncluded] = useState(false);
  const [coincidencesIncluded, setCoincidencesIncluded] = useState(false);
  const [riskDecisionNotUsed, setRiskDecisionNotUsed] = useState(false);
  const [paranormalNotClaimed, setParanormalNotClaimed] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 53)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO LAUVIAH · DIA 053</Text></View>;
  const phase = controller.phase?.id;
  const targetReady = sixDigit.test(targetId) && Object.values(targetNotes).every((value) => value.trim().length >= 2);
  const controlReady = sixDigit.test(controlId) && controlId !== targetId && Object.values(controlNotes).every((value) => value.trim().length >= 2);

  const saveTargetPreregister = async () => {
    if (!controller.auth.client || !controller.auth.userId || !targetReady) return;
    setLocalError(null);
    try {
      const encrypted = await encryptVaultText({
        userId: controller.auth.userId,
        day: 53,
        kind: 'blind-target-preregister',
        plaintext: JSON.stringify({ schema: 'hnk-day053-target-preregister-v1', identifier: targetId, ...targetNotes, confidence: targetConfidence }),
      });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 53, payload: encrypted });
      setTargetChecksum(encrypted.checksumSha256);
      setTargetVaultSaved(true);
      controller.nextPhase();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'day053_preregister_save_failed');
    }
  };

  const saveControlPreregister = async () => {
    if (!controller.auth.client || !controller.auth.userId || !controlReady) return;
    setLocalError(null);
    try {
      const encrypted = await encryptVaultText({
        userId: controller.auth.userId,
        day: 53,
        kind: 'blind-control-preregister',
        plaintext: JSON.stringify({ schema: 'hnk-day053-control-preregister-v1', identifier: controlId, mode: controlModeTargetless ? 'targetless-id' : 'shuffled-envelopes', ...controlNotes, confidence: controlConfidence }),
      });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 53, payload: encrypted });
      setControlVaultSaved(true);
      controller.nextPhase();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'day053_control_preregister_save_failed');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · LAUVIAH 2/5 · DIA 053</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não inventa alvo nem fotografia de teste.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 053 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 052 confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Ansiedade, obsessão por acerto ou impulso de usar o exercício para decisão de risco encerram a tentativa.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="LAUVIAH 2/5" title="Pré-registro antes do feedback">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="MÉTODO">Prepare externamente uma fotografia lacrada com ID aleatório de seis dígitos. O app recebe apenas o ID e suas impressões; não fornece nem conhece o alvo.</RuntimeNotice>
          <RuntimePrimary label="INICIAR PRÉ-REGISTRO" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'preregister' ? (
        <RuntimeCard label="ALVO A · CEGO" title="Somente ID · nada de feedback ainda">
          <Text style={styles.fieldLabel}>IDENTIFICADOR DE 6 DÍGITOS</Text>
          <TextInput value={targetId} onChangeText={(value) => setTargetId(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" placeholder="000000" placeholderTextColor="#666971" style={runtimeTextStyles.input} />
          <VaultField label="FORMAS" value={targetNotes.forms} onChange={(value) => setTargetNotes((n) => ({ ...n, forms: value }))} />
          <VaultField label="CORES" value={targetNotes.colors} onChange={(value) => setTargetNotes((n) => ({ ...n, colors: value }))} />
          <VaultField label="TEXTURAS" value={targetNotes.textures} onChange={(value) => setTargetNotes((n) => ({ ...n, textures: value }))} />
          <VaultField label="OUTRAS IMPRESSÕES" value={targetNotes.impressions} onChange={(value) => setTargetNotes((n) => ({ ...n, impressions: value }))} />
          <RuntimeScale label="CONFIANÇA PRÉ-FEEDBACK" value={targetConfidence} onChange={setTargetConfidence} />
          <RuntimeNotice title="VAULT">Estas descrições serão cifradas antes de qualquer revelação.</RuntimeNotice>
          <RuntimePrimary label="IR AO SELAMENTO CRIPTOGRÁFICO" disabled={!targetReady} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal-preregister' ? (
        <RuntimeCard label="SELO PRÉ-FEEDBACK" title="Criar registro imutável antes de abrir o envelope">
          <RuntimePrimary label={targetVaultSaved ? 'PRÉ-REGISTRO SALVO' : 'CIFRAR E SALVAR PRÉ-REGISTRO'} disabled={targetVaultSaved || !targetReady} onPress={() => void saveTargetPreregister()} />
        </RuntimeCard>
      ) : null}

      {phase === 'reveal' ? (
        <RuntimeCard label="FEEDBACK" title="Somente agora abra o envelope externamente">
          <RuntimeNotice title="ORDEM PROVADA">O pré-registro já foi cifrado e persistido no Vault. O alvo não é enviado ao servidor nem alterado pelo app.</RuntimeNotice>
          <RuntimeChoice selected={feedbackRevealed} label="ABRI A FOTOGRAFIA SOMENTE APÓS O SELAMENTO" onPress={() => setFeedbackRevealed((value) => !value)} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={targetEffectRecorded && targetEffectPresent} label="HOUVE ALGUMA CORRESPONDÊNCIA APARENTE" onPress={() => { setTargetEffectPresent(true); setTargetEffectRecorded(true); }} />
            <RuntimeChoice selected={targetEffectRecorded && !targetEffectPresent} label="NÃO HOUVE CORRESPONDÊNCIA APARENTE" onPress={() => { setTargetEffectPresent(false); setTargetEffectRecorded(true); }} />
          </View>
          <RuntimePrimary label="ABRIR CONDIÇÃO CONTROLE" disabled={!feedbackRevealed || !targetEffectRecorded || !targetVaultSaved} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control' ? (
        <RuntimeCard label="CONTROLE" title="Segundo ID sem feedback antecipado">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlModeTargetless} label="ID SEM ALVO ASSOCIADO" onPress={() => setControlModeTargetless(true)} />
            <RuntimeChoice selected={!controlModeTargetless} label="DOIS ENVELOPES EMBARALHADOS" onPress={() => setControlModeTargetless(false)} />
          </View>
          <TextInput value={controlId} onChangeText={(value) => setControlId(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" placeholder="Segundo ID de 6 dígitos" placeholderTextColor="#666971" style={runtimeTextStyles.input} />
          <VaultField label="FORMAS" value={controlNotes.forms} onChange={(value) => setControlNotes((n) => ({ ...n, forms: value }))} />
          <VaultField label="CORES" value={controlNotes.colors} onChange={(value) => setControlNotes((n) => ({ ...n, colors: value }))} />
          <VaultField label="TEXTURAS" value={controlNotes.textures} onChange={(value) => setControlNotes((n) => ({ ...n, textures: value }))} />
          <VaultField label="OUTRAS IMPRESSÕES" value={controlNotes.impressions} onChange={(value) => setControlNotes((n) => ({ ...n, impressions: value }))} />
          <RuntimeScale label="CONFIANÇA DO CONTROLE" value={controlConfidence} onChange={setControlConfidence} />
          <RuntimePrimary label={controlVaultSaved ? 'CONTROLE SELADO' : 'CIFRAR E SELAR CONTROLE'} disabled={controlVaultSaved || !controlReady} onPress={() => void saveControlPreregister()} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Acertos, erros e coincidências permanecem juntos">
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlEffectRecorded && controlEffectPresent} label="CONTROLE TEVE CORRESPONDÊNCIA APARENTE" onPress={() => { setControlEffectPresent(true); setControlEffectRecorded(true); }} />
            <RuntimeChoice selected={controlEffectRecorded && !controlEffectPresent} label="CONTROLE SEM CORRESPONDÊNCIA APARENTE" onPress={() => { setControlEffectPresent(false); setControlEffectRecorded(true); }} />
          </View>
          <RuntimeChoice selected={errorsIncluded} label="INCLUÍ ERROS E DIVERGÊNCIAS NA AVALIAÇÃO" onPress={() => setErrorsIncluded((value) => !value)} />
          <RuntimeChoice selected={coincidencesIncluded} label="MANTIVE COINCIDÊNCIAS COMO HIPÓTESE CONCORRENTE" onPress={() => setCoincidencesIncluded((value) => !value)} />
          <RuntimeChoice selected={riskDecisionNotUsed} label="NÃO USEI O EXERCÍCIO PARA DECISÃO DE RISCO" onPress={() => setRiskDecisionNotUsed((value) => !value)} />
          <RuntimeChoice selected={paranormalNotClaimed} label="NÃO TRATEI PONTUAÇÃO OU ACERTO COMO PROVA DE FACULDADE PARANORMAL" onPress={() => setParanormalNotClaimed((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM ANSIEDADE OU OBSESSÃO POR ACERTO AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!controlVaultSaved || !controlEffectRecorded || !errorsIncluded || !coincidencesIncluded || !riskDecisionNotUsed || !paranormalNotClaimed || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Voltar do feedback ao ambiente comum">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'vault' ? (
        <RuntimeCard label="VAULT" title="Dois pré-registros cifrados confirmados">
          <RuntimeNotice title="PRIVACIDADE">Descrições livres permanecem nos dois envelopes Vault. O servidor operacional recebe apenas IDs, booleans e escalas.</RuntimeNotice>
          <RuntimePrimary label="PREPARAR SELO" disabled={!targetVaultSaved || !controlVaultSaved} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Lauviah 2/5">
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 053'} disabled={controller.busy || !targetChecksum} onPress={() => void controller.seal({
            localRecordHash: targetChecksum,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              six_digit_id_used: true,
              preregistered_before_feedback: true,
              preregister_sealed: targetVaultSaved,
              feedback_after_preregister: feedbackRevealed,
              control_completed: controlVaultSaved,
              errors_included: errorsIncluded,
              coincidences_included: coincidencesIncluded,
              risk_decision_not_used: riskDecisionNotUsed,
              paranormal_not_claimed: paranormalNotClaimed,
              vault_saved: targetVaultSaved && controlVaultSaved,
              safety_clear: safetyClear,
              target_identifier: Number(targetId),
              control_identifier: Number(controlId),
              target_effect_present: targetEffectPresent,
              control_effect_present: controlEffectPresent,
            },
            metrics: { target_confidence: targetConfidence, control_confidence: controlConfidence, control_mode_targetless: controlModeTargetless },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day053_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="LAUVIAH 2/5" /> : null}
    </ScrollView>
  );
}

function VaultField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label} · VAULT</Text><TextInput value={value} onChangeText={onChange} multiline placeholder="Pré-registro privado" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  content: { padding: 24, gap: 18, paddingBottom: 52 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' },
  header: { gap: 6, marginBottom: 4 },
  eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 },
  title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' },
  meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 },
  field: { gap: 6 },
  fieldLabel: { color: '#72899c', fontSize: 8, letterSpacing: 1.1 },
});
