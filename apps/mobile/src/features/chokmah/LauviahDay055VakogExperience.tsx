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
  RuntimeTimer,
  runtimeTextStyles,
} from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { LAUVIAH_DAY_055 } from './runtime-definitions/lauviah';

export function LauviahDay055VakogExperience() {
  const controller = useHnkDayRuntime(LAUVIAH_DAY_055);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [targetLabel, setTargetLabel] = useState('');
  const [primarySeconds, setPrimarySeconds] = useState(0);
  const [primaryNotes, setPrimaryNotes] = useState({ visual: '', auditory: '', kinesthetic: '', olfactory: '', gustatory: '', context: '' });
  const [primaryVaultSaved, setPrimaryVaultSaved] = useState(false);
  const [primaryChecksum, setPrimaryChecksum] = useState<string | null>(null);
  const [verificationDone, setVerificationDone] = useState(false);
  const [primaryCorrespondence, setPrimaryCorrespondence] = useState(false);
  const [primaryCorrespondenceRecorded, setPrimaryCorrespondenceRecorded] = useState(false);
  const [controlNotes, setControlNotes] = useState({ visual: '', auditory: '', kinesthetic: '', olfactory: '', gustatory: '', context: '' });
  const [controlVaultSaved, setControlVaultSaved] = useState(false);
  const [controlCorrespondence, setControlCorrespondence] = useState(false);
  const [controlCorrespondenceRecorded, setControlCorrespondenceRecorded] = useState(false);
  const [memoryPriorRecognized, setMemoryPriorRecognized] = useState(false);
  const [coincidenceKeptOpen, setCoincidenceKeptOpen] = useState(false);
  const [nonlocalNotClaimed, setNonlocalNotClaimed] = useState(false);
  const [riskDecisionNotUsed, setRiskDecisionNotUsed] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [confidence, setConfidence] = useState(5);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 55)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO LAUVIAH · DIA 055</Text></View>;
  const phase = controller.phase?.id;
  const primaryReady = targetLabel.trim().length >= 3 && Object.values(primaryNotes).every((value) => value.trim().length >= 2) && primarySeconds >= 600;
  const controlReady = Object.values(controlNotes).every((value) => value.trim().length >= 2);

  const savePrimary = async () => {
    if (!controller.auth.client || !controller.auth.userId || !primaryReady) return;
    setLocalError(null);
    try {
      const encrypted = await encryptVaultText({
        userId: controller.auth.userId,
        day: 55,
        kind: 'vakog-primary-preregister',
        plaintext: JSON.stringify({ schema: 'hnk-day055-vakog-primary-v1', target: targetLabel.trim(), seconds: primarySeconds, ...primaryNotes, confidence }),
      });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 55, payload: encrypted });
      setPrimaryVaultSaved(true);
      setPrimaryChecksum(encrypted.checksumSha256);
      controller.nextPhase();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'day055_primary_vault_failed');
    }
  };

  const saveControl = async () => {
    if (!controller.auth.client || !controller.auth.userId || !controlReady) return;
    setLocalError(null);
    try {
      const encrypted = await encryptVaultText({
        userId: controller.auth.userId,
        day: 55,
        kind: 'vakog-control-preregister',
        plaintext: JSON.stringify({ schema: 'hnk-day055-vakog-control-v1', ...controlNotes }),
      });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 55, payload: encrypted });
      setControlVaultSaved(true);
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'day055_control_vault_failed');
    }
  };

  const safetyStop = () => controller.interrupt({ durationSeconds: primarySeconds, evidence: { safety_stop: true }, metrics: { confidence } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · LAUVIAH 4/5 · DIA 055</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não inventa alvo, referência ou interpretação substituta.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 055 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 054 confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Ansiedade, obsessão por acerto ou intenção de usar impressões em decisões de risco encerram a tentativa.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="LAUVIAH 4/5" title="VAKOG antes do feedback">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="REGRA">Escolha o monumento antes. Não consulte imagens, mapas ou referências durante os 10 minutos de pré-registro.</RuntimeNotice>
          <RuntimePrimary label="INICIAR PRÉ-REGISTRO" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'preregister' ? (
        <RuntimeCard label="ALVO PRINCIPAL" title="10 minutos sem referência externa">
          <TextInput value={targetLabel} onChangeText={setTargetLabel} placeholder="Monumento escolhido previamente" placeholderTextColor="#666971" style={runtimeTextStyles.input} />
          <RuntimeTimer value={primarySeconds} target={600} onChange={setPrimarySeconds} />
          <VaultField label="VISUAL · formas/luz/cores" value={primaryNotes.visual} onChange={(value) => setPrimaryNotes((n) => ({ ...n, visual: value }))} />
          <VaultField label="AUDITIVO · sons imaginados" value={primaryNotes.auditory} onChange={(value) => setPrimaryNotes((n) => ({ ...n, auditory: value }))} />
          <VaultField label="CINESTÉSICO · temperatura/textura" value={primaryNotes.kinesthetic} onChange={(value) => setPrimaryNotes((n) => ({ ...n, kinesthetic: value }))} />
          <VaultField label="OLFATIVO" value={primaryNotes.olfactory} onChange={(value) => setPrimaryNotes((n) => ({ ...n, olfactory: value }))} />
          <VaultField label="GUSTATIVO" value={primaryNotes.gustatory} onChange={(value) => setPrimaryNotes((n) => ({ ...n, gustatory: value }))} />
          <VaultField label="CONTEXTO / MEMÓRIA PRÉVIA RECONHECIDA" value={primaryNotes.context} onChange={(value) => setPrimaryNotes((n) => ({ ...n, context: value }))} />
          <RuntimeScale label="CONFIANÇA PRÉ-FEEDBACK" value={confidence} onChange={setConfidence} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="SELAR PRÉ-REGISTRO" disabled={!primaryReady} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal-preregister' ? (
        <RuntimeCard label="VAULT PRÉ-FEEDBACK" title="Cifrar antes de verificar">
          <RuntimePrimary label={primaryVaultSaved ? 'PRÉ-REGISTRO SELADO' : 'CIFRAR E SALVAR'} disabled={primaryVaultSaved || !primaryReady} onPress={() => void savePrimary()} />
        </RuntimeCard>
      ) : null}

      {phase === 'verify' ? (
        <RuntimeCard label="VERIFICAÇÃO" title="Agora consulte referências fixas do monumento">
          <RuntimeChoice selected={verificationDone} label="CONSULTEI REFERÊNCIAS SOMENTE APÓS O SELAMENTO" onPress={() => setVerificationDone((value) => !value)} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={primaryCorrespondenceRecorded && primaryCorrespondence} label="HOUVE CORRESPONDÊNCIA APARENTE" onPress={() => { setPrimaryCorrespondence(true); setPrimaryCorrespondenceRecorded(true); }} />
            <RuntimeChoice selected={primaryCorrespondenceRecorded && !primaryCorrespondence} label="NÃO HOUVE CORRESPONDÊNCIA APARENTE" onPress={() => { setPrimaryCorrespondence(false); setPrimaryCorrespondenceRecorded(true); }} />
          </View>
          <RuntimePrimary label="ABRIR CONTROLE" disabled={!verificationDone || !primaryCorrespondenceRecorded || !primaryVaultSaved} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control' ? (
        <RuntimeCard label="CONTROLE" title="Alvo escolhido por outra pessoa ou fotografia lacrada">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="SEM DECISÃO DE RISCO">Não use impressões para navegação, emergência, viagem, investimento ou outra decisão que exija informação confiável.</RuntimeNotice>
          <VaultField label="VISUAL" value={controlNotes.visual} onChange={(value) => setControlNotes((n) => ({ ...n, visual: value }))} />
          <VaultField label="AUDITIVO" value={controlNotes.auditory} onChange={(value) => setControlNotes((n) => ({ ...n, auditory: value }))} />
          <VaultField label="CINESTÉSICO" value={controlNotes.kinesthetic} onChange={(value) => setControlNotes((n) => ({ ...n, kinesthetic: value }))} />
          <VaultField label="OLFATIVO" value={controlNotes.olfactory} onChange={(value) => setControlNotes((n) => ({ ...n, olfactory: value }))} />
          <VaultField label="GUSTATIVO" value={controlNotes.gustatory} onChange={(value) => setControlNotes((n) => ({ ...n, gustatory: value }))} />
          <VaultField label="CONTEXTO" value={controlNotes.context} onChange={(value) => setControlNotes((n) => ({ ...n, context: value }))} />
          <RuntimePrimary label={controlVaultSaved ? 'CONTROLE SELADO' : 'CIFRAR CONTROLE ANTES DO FEEDBACK'} disabled={controlVaultSaved || !controlReady} onPress={() => void saveControl()} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={controlCorrespondenceRecorded && controlCorrespondence} label="CONTROLE TEVE CORRESPONDÊNCIA APARENTE" onPress={() => { if (controlVaultSaved) { setControlCorrespondence(true); setControlCorrespondenceRecorded(true); } }} />
            <RuntimeChoice selected={controlCorrespondenceRecorded && !controlCorrespondence} label="CONTROLE SEM CORRESPONDÊNCIA APARENTE" onPress={() => { if (controlVaultSaved) { setControlCorrespondence(false); setControlCorrespondenceRecorded(true); } }} />
          </View>
          <RuntimePrimary label="COMPARAR" disabled={!controlVaultSaved || !controlCorrespondenceRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Correspondência pós-hoc não é prova de percepção não-local">
          <RuntimeChoice selected={memoryPriorRecognized} label="AVALIEI MEMÓRIA E CONHECIMENTO PRÉVIO COMO HIPÓTESES CONCORRENTES" onPress={() => setMemoryPriorRecognized((value) => !value)} />
          <RuntimeChoice selected={coincidenceKeptOpen} label="MANTIVE COINCIDÊNCIA COMO POSSIBILIDADE" onPress={() => setCoincidenceKeptOpen((value) => !value)} />
          <RuntimeChoice selected={nonlocalNotClaimed} label="NÃO TRATEI CORRESPONDÊNCIA COMO PROVA DE PERCEPÇÃO NÃO-LOCAL" onPress={() => setNonlocalNotClaimed((value) => !value)} />
          <RuntimeChoice selected={riskDecisionNotUsed} label="NÃO USEI A PRÁTICA EM DECISÃO DE RISCO" onPress={() => setRiskDecisionNotUsed((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM ANSIEDADE OU OBSESSÃO POR ACERTO AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!memoryPriorRecognized || !coincidenceKeptOpen || !nonlocalNotClaimed || !riskDecisionNotUsed || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Sair do alvo e voltar ao ambiente comum">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'vault' ? (
        <RuntimeCard label="VAULT" title="Pré-registros cifrados confirmados">
          <RuntimeNotice title="PRIVACIDADE">Narrativas VAKOG e associações pessoais ficam no Vault. O Practice Record recebe apenas flags e métricas.</RuntimeNotice>
          <RuntimePrimary label="PREPARAR SELO" disabled={!primaryVaultSaved || !controlVaultSaved} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Lauviah 4/5">
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 055'} disabled={controller.busy || !primaryChecksum} onPress={() => void controller.seal({
            localRecordHash: primaryChecksum ?? undefined,
            durationSeconds: primarySeconds,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              target_selected_before_practice: true,
              vakog_preregistered: primaryReady,
              preregister_sealed: primaryVaultSaved,
              verification_after_preregister: verificationDone,
              control_completed: controlVaultSaved,
              memory_prior_recognized: memoryPriorRecognized,
              coincidence_kept_open: coincidenceKeptOpen,
              nonlocal_perception_not_claimed: nonlocalNotClaimed,
              risk_decision_not_used: riskDecisionNotUsed,
              vault_saved: primaryVaultSaved && controlVaultSaved,
              safety_clear: safetyClear,
              primary_correspondence_present: primaryCorrespondence,
              control_correspondence_present: controlCorrespondence,
              primary_seconds: primarySeconds,
            },
            metrics: { confidence },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day055_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="LAUVIAH 4/5" /> : null}
    </ScrollView>
  );
}

function VaultField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <TextInput value={value} onChangeText={onChange} multiline placeholder={`${label} · Vault`} placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />;
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
