import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimePrimary, RuntimeScale, RuntimeTimer, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { IEZALEL_DAY_064 } from './runtime-definitions/iezalel';

export function IezalelDay064AutomaticWritingExperience() {
  const controller = useHnkDayRuntime(IEZALEL_DAY_064);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [vocalSeconds, setVocalSeconds] = useState(0);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [activeText, setActiveText] = useState('');
  const [controlText, setControlText] = useState('');
  const [vocalCompleted, setVocalCompleted] = useState(false);
  const [classificationMarked, setClassificationMarked] = useState(false);
  const [comparison, setComparison] = useState(false);
  const [automaticAuthorityNotClaimed, setAutomaticAuthorityNotClaimed] = useState(false);
  const [highImpactSuspended, setHighImpactSuspended] = useState(false);
  const [threateningNotReinforced, setThreateningNotReinforced] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [objectsNamed, setObjectsNamed] = useState(0);
  const [fluencyActive, setFluencyActive] = useState(5);
  const [fluencyControl, setFluencyControl] = useState(5);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 64).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO IEZALEL · DIA 064</Text></View>;
  const phase = controller.phase?.id;
  const saveVault = async () => {
    if (!controller.auth.client || !controller.auth.userId || activeText.trim().length < 2 || controlText.trim().length < 2) return;
    try {
      const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 64, kind: 'automatic-writing-pair', plaintext: JSON.stringify({ schema: 'hnk-day064-writing-v1', after_glossolalia: activeText.trim(), control: controlText.trim() }) });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 64, payload: encrypted });
      setChecksum(encrypted.checksumSha256); setVaultSaved(true); controller.nextPhase();
    } catch (e) { setError(e instanceof Error ? e.message : 'day064_vault_failed'); }
  };
  const safetyStop = () => controller.interrupt({ durationSeconds: vocalSeconds + activeSeconds + controlSeconds, evidence: { safety_stop: true }, metrics: { fluency_active: fluencyActive, fluency_control: fluencyControl } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · IEZALEL 3/5 · DIA 064</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || error ? <RuntimeNotice title="RUNTIME">{error ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 064 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 063 confirmado no servidor.</Text></RuntimeCard> : null}

    {phase === 'threshold' ? <RuntimeCard label="IEZALEL 3/5" title="Fluência criativa seguida de crítica consciente"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><RuntimeNotice title="LIMITE">Vocalização é de até 10 minutos, em volume confortável. Texto espontâneo não recebe autoridade automática, profética, clínica ou decisória.</RuntimeNotice><RuntimePrimary label="INICIAR" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}

    {phase === 'vocalize' ? <RuntimeCard label="VOCALIZAÇÃO" title="Glossolália confortável · limite 10 min"><RuntimeTimer value={vocalSeconds} target={600} allowEarlyStop onChange={setVocalSeconds} /><RuntimeChoice selected={vocalCompleted} label="ENCERREI VOLUNTARIAMENTE A VOCALIZAÇÃO SEM FORÇAR RESPIRAÇÃO OU VOZ" onPress={() => setVocalCompleted((v) => !v)} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="ESCRITA IMEDIATA" disabled={vocalSeconds < 1 || !vocalCompleted} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'write-active' ? <RuntimeCard label="ESCRITA A" title="5 minutos contínuos após a vocalização"><RuntimeTimer value={activeSeconds} target={300} onChange={setActiveSeconds} /><TextInput value={activeText} onChangeText={setActiveText} multiline placeholder="Escrita contínua · conteúdo ficará cifrado no Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} /><RuntimeScale label="FLUIDEZ PERCEBIDA" value={fluencyActive} onChange={setFluencyActive} /><RuntimePrimary label="IR AO CONTROLE" disabled={activeSeconds < 300 || activeText.trim().length < 2} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'control' ? <RuntimeCard label="CONTROLE" title="5 minutos de escrita livre sem vocalização"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><RuntimeTimer value={controlSeconds} target={300} onChange={setControlSeconds} /><TextInput value={controlText} onChangeText={setControlText} multiline placeholder="Escrita controle · também ficará cifrada" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} /><RuntimeScale label="FLUIDEZ PERCEBIDA" value={fluencyControl} onChange={setFluencyControl} /><RuntimePrimary label="REVISAR" disabled={controlSeconds < 300 || controlText.trim().length < 2} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'review' ? <RuntimeCard label="REVISÃO" title="Classificar sem transformar fluência em origem externa"><RuntimeChoice selected={classificationMarked} label="CLASSIFIQUEI AO MENOS UM TRECHO COMO IMAGEM, EMOÇÃO, HIPÓTESE, AÇÃO OU FATO" onPress={() => setClassificationMarked((v) => !v)} /><RuntimeChoice selected={comparison} label="COMPAREI FLUIDEZ, SURPRESA E CARGA EMOCIONAL DAS DUAS CONDIÇÕES" onPress={() => setComparison((v) => !v)} /><RuntimeChoice selected={automaticAuthorityNotClaimed} label="NÃO ATRIBUÍ AUTORIDADE AUTOMÁTICA AO TEXTO" onPress={() => setAutomaticAuthorityNotClaimed((v) => !v)} /><RuntimeChoice selected={highImpactSuspended} label="QUALQUER INSTRUÇÃO DE ALTO IMPACTO PERMANECE SUSPENSA ATÉ VERIFICAÇÃO INDEPENDENTE" onPress={() => setHighImpactSuspended((v) => !v)} /><RuntimeChoice selected={threateningNotReinforced} label="CONTEÚDO AMEAÇADOR/PERSECUTÓRIO SERIA ENCERRADO E NÃO REFORÇADO COMO ORIGEM SOBRENATURAL" onPress={() => setThreateningNotReinforced((v) => !v)} /><RuntimeChoice selected={safetyClear} label="A SESSÃO TERMINOU COM DISCERNIMENTO E ORIENTAÇÃO" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!classificationMarked || !comparison || !automaticAuthorityNotClaimed || !highImpactSuspended || !threateningNotReinforced || !safetyClear} onPress={controller.nextPhase} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /></RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Afastar o texto antes de qualquer decisão"><RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(3, v + 1))} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}
    {phase === 'vault' ? <RuntimeCard label="VAULT" title="Os dois textos permanecem cifrados"><RuntimePrimary label={vaultSaved ? 'VAULT SALVO' : 'CIFRAR E SALVAR TEXTOS'} disabled={vaultSaved || activeText.trim().length < 2 || controlText.trim().length < 2} onPress={() => void saveVault()} /></RuntimeCard> : null}
    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Iezalel 3/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 064'} disabled={controller.busy || !vaultSaved || !checksum} onPress={() => void controller.seal({ localRecordHash: checksum ?? undefined, durationSeconds: vocalSeconds + activeSeconds + controlSeconds, evidence: { protocol_completed: true, return_confirmed: true, vocalization_completed: vocalCompleted, active_writing_completed: activeSeconds >= 300, control_writing_completed: controlSeconds >= 300, comparison_completed: comparison, content_classified: classificationMarked, automatic_authority_not_claimed: automaticAuthorityNotClaimed, high_impact_decision_suspended: highImpactSuspended, threatening_content_not_reinforced: threateningNotReinforced, vault_saved: vaultSaved, safety_clear: safetyClear, vocal_seconds: vocalSeconds, active_write_seconds: activeSeconds, control_write_seconds: controlSeconds }, metrics: { fluency_active: fluencyActive, fluency_control: fluencyControl } }).then(controller.nextPhase).catch((e) => setError(e instanceof Error ? e.message : 'day064_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="IEZALEL 3/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
