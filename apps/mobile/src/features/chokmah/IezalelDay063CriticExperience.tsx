import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimePrimary, RuntimeScale, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { IEZALEL_DAY_063 } from './runtime-definitions/iezalel';

export function IezalelDay063CriticExperience() {
  const controller = useHnkDayRuntime(IEZALEL_DAY_063);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [criticism, setCriticism] = useState('');
  const [fact, setFact] = useState('');
  const [judgment, setJudgment] = useState('');
  const [action, setAction] = useState('');
  const [respectfulPhrase, setRespectfulPhrase] = useState('');
  const [beforeIntensity, setBeforeIntensity] = useState(5);
  const [afterIntensity, setAfterIntensity] = useState(5);
  const [credibilityBefore, setCredibilityBefore] = useState(5);
  const [credibilityAfter, setCredibilityAfter] = useState(5);
  const [caricatureCompleted, setCaricatureCompleted] = useState(false);
  const [neutralCompleted, setNeutralCompleted] = useState(false);
  const [comparison, setComparison] = useState(false);
  const [actionNeeded, setActionNeeded] = useState(false);
  const [actionRecorded, setActionRecorded] = useState(false);
  const [externalVoiceNotReinforced, setExternalVoiceNotReinforced] = useState(false);
  const [selfInsultNotAdded, setSelfInsultNotAdded] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 63).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO IEZALEL · DIA 063</Text></View>;
  const phase = controller.phase?.id;
  const preregReady = criticism.trim().length >= 3;
  const neutralReady = fact.trim().length >= 3 && judgment.trim().length >= 3 && respectfulPhrase.trim().length >= 3;
  const saveVault = async () => {
    if (!controller.auth.client || !controller.auth.userId || !preregReady || !neutralReady) return;
    try {
      const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 63, kind: 'inner-critic-reframe', plaintext: JSON.stringify({ schema: 'hnk-day063-critic-v1', criticism: criticism.trim(), fact: fact.trim(), judgment: judgment.trim(), action: action.trim(), respectful_phrase: respectfulPhrase.trim() }) });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 63, payload: encrypted });
      setChecksum(encrypted.checksumSha256); setVaultSaved(true); controller.nextPhase();
    } catch (e) { setError(e instanceof Error ? e.message : 'day063_vault_failed'); }
  };
  const safetyStop = () => controller.interrupt({ evidence: { safety_stop: true }, metrics: { before_intensity: beforeIntensity, after_intensity: afterIntensity } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · IEZALEL 2/5 · DIA 063</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || error ? <RuntimeNotice title="RUNTIME">{error ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 063 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 062 confirmado no servidor.</Text></RuntimeCard> : null}

    {phase === 'threshold' ? <RuntimeCard label="IEZALEL 2/5" title="Modificar representação sem fugir do conteúdo"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><RuntimeNotice title="LIMITE">Se a voz for percebida como externa, involuntária ou persistentemente perturbadora, não a trate como entidade. Faça grounding e procure apoio apropriado.</RuntimeNotice><RuntimePrimary label="INICIAR" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}

    {phase === 'preregister' ? <RuntimeCard label="PRÉ-REGISTRO · VAULT" title="Registrar a crítica e seu peso antes da mudança"><TextInput value={criticism} onChangeText={setCriticism} multiline placeholder="Frase de crítica interna · ficará cifrada" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} /><RuntimeScale label="INTENSIDADE ANTES" value={beforeIntensity} onChange={setBeforeIntensity} /><RuntimeScale label="CREDIBILIDADE ANTES" value={credibilityBefore} onChange={setCredibilityBefore} /><RuntimePrimary label="APLICAR SUBMODALIDADES" disabled={!preregReady} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'caricature' ? <RuntimeCard label="SUBMODALIDADES" title="Timbre caricatural · ritmo mais rápido · origem no pé esquerdo"><RuntimeChoice selected={caricatureCompleted} label="ALTEREI SOMENTE A REPRESENTAÇÃO IMAGINADA E REPETI UMA VEZ" onPress={() => setCaricatureCompleted((v) => !v)} /><RuntimeChoice selected={selfInsultNotAdded} label="NÃO ADICIONEI INSULTOS OU HUMILHAÇÃO CONTRA MIM" onPress={() => setSelfInsultNotAdded((v) => !v)} /><RuntimeScale label="INTENSIDADE APÓS A CARICATURA" value={afterIntensity} onChange={setAfterIntensity} /><RuntimeScale label="CREDIBILIDADE APÓS A CARICATURA" value={credibilityAfter} onChange={setCredibilityAfter} /><RuntimePrimary label="REFORMULAR NEUTRALMENTE" disabled={!caricatureCompleted || !selfInsultNotAdded} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'neutral' ? <RuntimeCard label="CONTROLE · FATO/JULGAMENTO/AÇÃO" title="Examinar o conteúdo sem caricatura"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><TextInput value={fact} onChangeText={setFact} placeholder="Fato observável" placeholderTextColor="#666971" style={runtimeTextStyles.input} /><TextInput value={judgment} onChangeText={setJudgment} placeholder="Julgamento/interpretação" placeholderTextColor="#666971" style={runtimeTextStyles.input} /><TextInput value={action} onChangeText={setAction} placeholder="Ação possível, se houver" placeholderTextColor="#666971" style={runtimeTextStyles.input} /><TextInput value={respectfulPhrase} onChangeText={setRespectfulPhrase} placeholder="Frase direta, realista e respeitosa" placeholderTextColor="#666971" style={runtimeTextStyles.input} /><View style={runtimeTextStyles.row}><RuntimeChoice selected={actionRecorded && actionNeeded} label="HÁ AÇÃO NECESSÁRIA" onPress={() => { setActionNeeded(true); setActionRecorded(true); }} /><RuntimeChoice selected={actionRecorded && !actionNeeded} label="NENHUMA AÇÃO É NECESSÁRIA AGORA" onPress={() => { setActionNeeded(false); setActionRecorded(true); }} /></View><RuntimeChoice selected={neutralCompleted} label="CONCLUÍ A REFORMULAÇÃO NEUTRA" onPress={() => setNeutralCompleted((v) => !v)} /><RuntimePrimary label="COMPARAR" disabled={!neutralReady || !actionRecorded || !neutralCompleted} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'compare' ? <RuntimeCard label="REVISÃO" title="Alívio não substitui responsabilidade"><RuntimeChoice selected={comparison} label="COMPAREI INTENSIDADE, CREDIBILIDADE, CLAREZA E UTILIDADE" onPress={() => setComparison((v) => !v)} /><RuntimeChoice selected={externalVoiceNotReinforced} label="NÃO REFORCEI ORIGEM EXTERNA/ENTIDADE PARA VOZ INVOLUNTÁRIA" onPress={() => setExternalVoiceNotReinforced((v) => !v)} /><RuntimeChoice selected={safetyClear} label="A PRÁTICA NÃO AUMENTOU SOFRIMENTO OU RISCO" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!comparison || !externalVoiceNotReinforced || !safetyClear} onPress={controller.nextPhase} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /></RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Escolher resposta proporcional e retornar"><RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(3, v + 1))} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}
    {phase === 'vault' ? <RuntimeCard label="VAULT" title="Frase e reformulação permanecem privadas"><RuntimePrimary label={vaultSaved ? 'VAULT SALVO' : 'CIFRAR E SALVAR'} disabled={vaultSaved || !preregReady || !neutralReady} onPress={() => void saveVault()} /></RuntimeCard> : null}
    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Iezalel 2/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 063'} disabled={controller.busy || !vaultSaved || !checksum} onPress={() => void controller.seal({ localRecordHash: checksum ?? undefined, evidence: { protocol_completed: true, return_confirmed: true, criticism_preregistered: true, caricature_completed: caricatureCompleted, neutral_reframe_completed: neutralCompleted, comparison_completed: comparison, action_reviewed: actionRecorded, external_voice_not_reinforced: externalVoiceNotReinforced, self_insult_not_added: selfInsultNotAdded, vault_saved: vaultSaved, safety_clear: safetyClear, action_needed: actionNeeded }, metrics: { before_intensity: beforeIntensity, after_intensity: afterIntensity, credibility_before: credibilityBefore, credibility_after: credibilityAfter } }).then(controller.nextPhase).catch((e) => setError(e instanceof Error ? e.message : 'day063_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="IEZALEL 2/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
