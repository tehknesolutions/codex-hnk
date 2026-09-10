import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimePrimary, RuntimeScale, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { HAHAIAH_DAY_057 } from './runtime-definitions/hahaiah';

export function HahaiahDay057PartnerExperiment() {
  const controller = useHnkDayRuntime(HAHAIAH_DAY_057);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [partnerConsent, setPartnerConsent] = useState(false);
  const [setSize, setSetSize] = useState(2);
  const [activeTarget, setActiveTarget] = useState('');
  const [activeResponse, setActiveResponse] = useState('');
  const [controlTarget, setControlTarget] = useState('');
  const [controlResponse, setControlResponse] = useState('');
  const [activeTargetSaved, setActiveTargetSaved] = useState(false);
  const [activeResponseSaved, setActiveResponseSaved] = useState(false);
  const [controlSaved, setControlSaved] = useState(false);
  const [activeMatch, setActiveMatch] = useState(false);
  const [controlMatch, setControlMatch] = useState(false);
  const [activeMatchRecorded, setActiveMatchRecorded] = useState(false);
  const [controlMatchRecorded, setControlMatchRecorded] = useState(false);
  const [errorsIncluded, setErrorsIncluded] = useState(false);
  const [cuesLogged, setCuesLogged] = useState(false);
  const [telepathyNotClaimed, setTelepathyNotClaimed] = useState(false);
  const [highImpactNotUsed, setHighImpactNotUsed] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [confidence, setConfidence] = useState(5);
  const [lastChecksum, setLastChecksum] = useState<string | null>(null);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 57).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setLocalError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO HAHAIAH · DIA 057</Text></View>;
  const phase = controller.phase?.id;

  const saveVault = async (kind: string, payload: unknown) => {
    if (!controller.auth.client || !controller.auth.userId) throw new Error('authentication_required');
    const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 57, kind, plaintext: JSON.stringify(payload) });
    await saveEncryptedVaultEntry(controller.auth.client, { day: 57, payload: encrypted });
    setLastChecksum(encrypted.checksumSha256);
  };

  const saveActiveTarget = async () => {
    if (activeTarget.trim().length < 1) return;
    try { await saveVault('hahaiah-active-target', { schema: 'hnk-day057-active-target-v1', target: activeTarget.trim(), set_size: setSize }); setActiveTargetSaved(true); controller.nextPhase(); } catch (e) { setLocalError(e instanceof Error ? e.message : 'active_target_save_failed'); }
  };
  const saveActiveResponse = async () => {
    if (activeResponse.trim().length < 1) return;
    try { await saveVault('hahaiah-active-response', { schema: 'hnk-day057-active-response-v1', response: activeResponse.trim(), confidence }); setActiveResponseSaved(true); controller.nextPhase(); } catch (e) { setLocalError(e instanceof Error ? e.message : 'active_response_save_failed'); }
  };
  const saveControl = async () => {
    if (controlTarget.trim().length < 1 || controlResponse.trim().length < 1) return;
    try {
      await saveVault('hahaiah-control-target', { schema: 'hnk-day057-control-target-v1', target: controlTarget.trim(), set_size: setSize });
      await saveVault('hahaiah-control-response', { schema: 'hnk-day057-control-response-v1', response: controlResponse.trim() });
      setControlSaved(true);
    } catch (e) { setLocalError(e instanceof Error ? e.message : 'control_save_failed'); }
  };
  const safetyStop = () => controller.interrupt({ evidence: { safety_stop: true }, metrics: { confidence } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · HAHAIAH 1/5 · DIA 057</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 057 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige Lauviah 5/5, Dia 056, confirmado no servidor.</Text></RuntimeCard> : null}
    {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Pressão, conflito de consentimento ou impulso de usar o teste em decisão real encerram a tentativa.</RuntimeNotice> : null}

    {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? <RuntimeCard label="HAHAIAH 1/5" title="Teste relacional pré-registrado"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><RuntimeNotice title="LIMITE">Coincidência não é prova de telepatia. Nenhum resultado autoriza vigilância, diagnóstico ou leitura mental cotidiana.</RuntimeNotice><RuntimePrimary label="INICIAR" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}

    {phase === 'setup' ? <RuntimeCard label="SETUP" title="Consentimento + conjunto fechado"><RuntimeChoice selected={partnerConsent} label="O PARCEIRO CONSENTIU LIVREMENTE E PODE ENCERRAR A QUALQUER MOMENTO" onPress={() => setPartnerConsent((v) => !v)} /><RuntimeCounter label="TAMANHO DO CONJUNTO FECHADO" value={setSize} onPress={() => setSetSize((v) => Math.min(12, v + 1))} /><RuntimeNotice title="PRÉ-REGISTRO">Definam antes quais cores/formas pertencem ao conjunto. Não acrescentem categorias depois de conhecer o resultado.</RuntimeNotice><RuntimePrimary label="SELAR ALVO ACTIVE" disabled={!partnerConsent || setSize < 2} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'target-seal' ? <RuntimeCard label="EMISSOR · ACTIVE" title="Registrar alvo sem revelar"><TextInput value={activeTarget} onChangeText={setActiveTarget} placeholder="Alvo sorteado · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.input} /><RuntimePrimary label={activeTargetSaved ? 'ALVO SELADO' : 'CIFRAR ALVO'} disabled={activeTargetSaved || activeTarget.trim().length < 1} onPress={() => void saveActiveTarget()} /></RuntimeCard> : null}

    {phase === 'receiver-seal' ? <RuntimeCard label="RECEPTOR · ACTIVE" title="Resposta antes do feedback"><RuntimeNotice title="SEM PISTAS">O emissor não envia mensagens, gestos, dicas ou confirmação durante esta etapa.</RuntimeNotice><TextInput value={activeResponse} onChangeText={setActiveResponse} placeholder="Cor/forma percebida · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.input} /><RuntimeScale label="CONFIANÇA PRÉ-FEEDBACK" value={confidence} onChange={setConfidence} /><RuntimePrimary label={activeResponseSaved ? 'RESPOSTA SELADA' : 'CIFRAR RESPOSTA'} disabled={activeResponseSaved || activeResponse.trim().length < 1} onPress={() => void saveActiveResponse()} /></RuntimeCard> : null}

    {phase === 'reveal' ? <RuntimeCard label="FEEDBACK ACTIVE" title="Só agora comparar alvo e resposta"><View style={runtimeTextStyles.row}><RuntimeChoice selected={activeMatchRecorded && activeMatch} label="CORRESPONDEU PELO CRITÉRIO PRÉVIO" onPress={() => { setActiveMatch(true); setActiveMatchRecorded(true); }} /><RuntimeChoice selected={activeMatchRecorded && !activeMatch} label="NÃO CORRESPONDEU" onPress={() => { setActiveMatch(false); setActiveMatchRecorded(true); }} /></View><RuntimePrimary label="IR AO CONTROLE" disabled={!activeTargetSaved || !activeResponseSaved || !activeMatchRecorded} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'control' ? <RuntimeCard label="CONTROL" title="Mesma tarefa em outro momento · sem ritual"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><TextInput value={controlTarget} onChangeText={setControlTarget} placeholder="Alvo controle · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.input} /><TextInput value={controlResponse} onChangeText={setControlResponse} placeholder="Resposta controle pré-feedback · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.input} /><RuntimePrimary label={controlSaved ? 'CONTROL SELADO' : 'CIFRAR ALVO + RESPOSTA CONTROL'} disabled={controlSaved || controlTarget.trim().length < 1 || controlResponse.trim().length < 1} onPress={() => void saveControl()} /><View style={runtimeTextStyles.row}><RuntimeChoice selected={controlMatchRecorded && controlMatch} label="CONTROL CORRESPONDEU" onPress={() => { if (controlSaved) { setControlMatch(true); setControlMatchRecorded(true); } }} /><RuntimeChoice selected={controlMatchRecorded && !controlMatch} label="CONTROL NÃO CORRESPONDEU" onPress={() => { if (controlSaved) { setControlMatch(false); setControlMatchRecorded(true); } }} /></View><RuntimePrimary label="REVISAR" disabled={!controlSaved || !controlMatchRecorded} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'compare' ? <RuntimeCard label="REVISÃO" title="Acertos e falhas no mesmo registro"><RuntimeChoice selected={errorsIncluded} label="INCLUÍ ERROS E FALHAS SEM SELEÇÃO FAVORÁVEL" onPress={() => setErrorsIncluded((v) => !v)} /><RuntimeChoice selected={cuesLogged} label="REGISTREI PISTAS OU CONTAMINAÇÕES POSSÍVEIS" onPress={() => setCuesLogged((v) => !v)} /><RuntimeChoice selected={telepathyNotClaimed} label="NÃO TRATEI O RESULTADO COMO PROVA DE TELEPATIA" onPress={() => setTelepathyNotClaimed((v) => !v)} /><RuntimeChoice selected={highImpactNotUsed} label="NÃO USEI O TESTE EM DECISÃO DE ALTO IMPACTO" onPress={() => setHighImpactNotUsed((v) => !v)} /><RuntimeChoice selected={safetyClear} label="CONSENTIMENTO E AUTONOMIA PERMANECERAM ÍNTEGROS" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!errorsIncluded || !cuesLogged || !telepathyNotClaimed || !highImpactNotUsed || !safetyClear} onPress={controller.nextPhase} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /></RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Encerrar expectativa de continuação"><RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(3, v + 1))} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}

    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Hahaiah 1/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 057'} disabled={controller.busy || !lastChecksum} onPress={() => void controller.seal({ localRecordHash: lastChecksum ?? undefined, evidence: { protocol_completed: true, return_confirmed: true, partner_consent: partnerConsent, closed_set_defined: true, target_preregistered: activeTargetSaved, receiver_response_preregistered: activeResponseSaved, feedback_after_response: true, control_completed: controlSaved, errors_included: errorsIncluded, possible_cues_logged: cuesLogged, telepathy_not_claimed: telepathyNotClaimed, high_impact_not_used: highImpactNotUsed, vault_saved: activeTargetSaved && activeResponseSaved && controlSaved, safety_clear: safetyClear, active_match: activeMatch, control_match: controlMatch, target_set_size: setSize }, metrics: { confidence } }).then(controller.nextPhase).catch((e) => setLocalError(e instanceof Error ? e.message : 'day057_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAHAIAH 1/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6, marginBottom: 4 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
