import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimePrimary, RuntimeScale, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { HAHAIAH_DAY_060 } from './runtime-definitions/hahaiah';

export function HahaiahDay060SocialObservationExperience() {
  const controller = useHnkDayRuntime(HAHAIAH_DAY_060);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [publicCount, setPublicCount] = useState(0);
  const [interpretations, setInterpretations] = useState('');
  const [cameraNotUsed, setCameraNotUsed] = useState(false);
  const [identityNotStored, setIdentityNotStored] = useState(false);
  const [vulnerableNotTargeted, setVulnerableNotTargeted] = useState(false);
  const [partnerConsent, setPartnerConsent] = useState(false);
  const [partnerCompleted, setPartnerCompleted] = useState(false);
  const [inferencesCorrect, setInferencesCorrect] = useState(0);
  const [inferencesIncorrect, setInferencesIncorrect] = useState(0);
  const [inferencesUnknown, setInferencesUnknown] = useState(0);
  const [diagnosisNotClaimed, setDiagnosisNotClaimed] = useState(false);
  const [mindReadingNotClaimed, setMindReadingNotClaimed] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [objectsNamed, setObjectsNamed] = useState(0);
  const [comfort, setComfort] = useState(5);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 60).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setLocalError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO HAHAIAH · DIA 060</Text></View>;
  const phase = controller.phase?.id;
  const saveVault = async () => {
    if (!controller.auth.client || !controller.auth.userId || interpretations.trim().length < 8) return;
    try {
      const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 60, kind: 'discarded-social-interpretations', plaintext: JSON.stringify({ schema: 'hnk-day060-interpretations-v1', text: interpretations.trim() }) });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 60, payload: encrypted });
      setChecksum(encrypted.checksumSha256); setVaultSaved(true); controller.nextPhase();
    } catch (e) { setLocalError(e instanceof Error ? e.message : 'day060_vault_failed'); }
  };
  const safetyStop = () => controller.interrupt({ evidence: { safety_stop: true }, metrics: { comfort } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · HAHAIAH 4/5 · DIA 060</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 060 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 059 confirmado no servidor.</Text></RuntimeCard> : null}

    {phase === 'threshold' ? <RuntimeCard label="HAHAIAH 4/5" title="Descrição social sem leitura de mente"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><RuntimeNotice title="PRIVACIDADE">Sem câmera, zoom, gravação, rosto, nome ou identificação. Crianças, pessoas vulneráveis e situações íntimas não são alvo de treino.</RuntimeNotice><RuntimePrimary label="INICIAR" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}

    {phase === 'public' ? <RuntimeCard label="OBSERVAÇÃO PÚBLICA" title="Cinco descrições puramente observáveis"><RuntimeCounter label="OBSERVAÇÕES NÃO IDENTIFICÁVEIS" value={publicCount} onPress={() => setPublicCount((v) => Math.min(5, v + 1))} /><RuntimeChoice selected={cameraNotUsed} label="NÃO USEI CÂMERA, ZOOM, FOTO OU VÍDEO" onPress={() => setCameraNotUsed((v) => !v)} /><RuntimeChoice selected={identityNotStored} label="NÃO REGISTREI NOME, ROSTO OU IDENTIDADE" onPress={() => setIdentityNotStored((v) => !v)} /><RuntimeChoice selected={vulnerableNotTargeted} label="NÃO OBSERVEI CRIANÇAS, PESSOAS VULNERÁVEIS OU SITUAÇÕES ÍNTIMAS" onPress={() => setVulnerableNotTargeted((v) => !v)} /><TextInput value={interpretations} onChangeText={setInterpretations} multiline placeholder="Interpretações que sua mente tentou acrescentar · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} /><RuntimeScale label="CONFORTO / NÃO-INTRUSIVIDADE" value={comfort} onChange={setComfort} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="IR AO PARCEIRO CONSENTIDO" disabled={publicCount < 5 || !cameraNotUsed || !identityNotStored || !vulnerableNotTargeted || interpretations.trim().length < 8} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'partner' ? <RuntimeCard label="CONTROL · PARCEIRO" title="Conversa neutra com consentimento"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><RuntimeChoice selected={partnerConsent} label="PARCEIRO CONSENTIU E ESCOLHE O QUE DESEJA COMPARTILHAR" onPress={() => setPartnerConsent((v) => !v)} /><RuntimeChoice selected={partnerCompleted} label="COMPAREI DESCRIÇÕES COM O QUE O PARCEIRO DECIDIU RELATAR" onPress={() => setPartnerCompleted((v) => !v)} /><RuntimeCounter label="INFERÊNCIAS CORRETAS" value={inferencesCorrect} onPress={() => setInferencesCorrect((v) => v + 1)} /><RuntimeCounter label="INFERÊNCIAS INCORRETAS" value={inferencesIncorrect} onPress={() => setInferencesIncorrect((v) => v + 1)} /><RuntimeCounter label="IMPOSSÍVEIS DE VERIFICAR" value={inferencesUnknown} onPress={() => setInferencesUnknown((v) => v + 1)} /><RuntimePrimary label="REVISAR" disabled={!partnerConsent || !partnerCompleted} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'compare' ? <RuntimeCard label="REVISÃO" title="Visto, inferido e desconhecido"><RuntimeChoice selected={diagnosisNotClaimed} label="NÃO DIAGNOSTIQUEI HUMOR, SAÚDE, TRAUMA, ATRAÇÃO OU MENTIRA" onPress={() => setDiagnosisNotClaimed((v) => !v)} /><RuntimeChoice selected={mindReadingNotClaimed} label="NÃO TRATEI MICRO-MOVIMENTO COMO ACESSO À MENTE ALHEIA" onPress={() => setMindReadingNotClaimed((v) => !v)} /><RuntimeChoice selected={safetyClear} label="ENCERREI O EXERCÍCIO SEM CONTINUAR MONITORANDO PESSOAS" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!diagnosisNotClaimed || !mindReadingNotClaimed || !safetyClear} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Encerrar monitoramento"><RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(3, v + 1))} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}
    {phase === 'vault' ? <RuntimeCard label="VAULT" title="Interpretações descartadas ficam privadas"><RuntimePrimary label={vaultSaved ? 'VAULT SALVO' : 'CIFRAR E SALVAR'} disabled={vaultSaved || interpretations.trim().length < 8} onPress={() => void saveVault()} /></RuntimeCard> : null}
    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Hahaiah 4/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 060'} disabled={controller.busy || !vaultSaved || !checksum} onPress={() => void controller.seal({ localRecordHash: checksum ?? undefined, evidence: { protocol_completed: true, return_confirmed: true, five_public_observations_completed: publicCount >= 5, camera_not_used: cameraNotUsed, identity_not_stored: identityNotStored, partner_consent: partnerConsent, partner_comparison_completed: partnerCompleted, diagnosis_not_claimed: diagnosisNotClaimed, mind_reading_not_claimed: mindReadingNotClaimed, vulnerable_people_not_targeted: vulnerableNotTargeted, vault_saved: vaultSaved, safety_clear: safetyClear, public_observations_count: publicCount }, metrics: { inferences_correct: inferencesCorrect, inferences_incorrect: inferencesIncorrect, inferences_unknown: inferencesUnknown, comfort } }).then(controller.nextPhase).catch((e) => setLocalError(e instanceof Error ? e.message : 'day060_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAHAIAH 4/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6, marginBottom: 4 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
