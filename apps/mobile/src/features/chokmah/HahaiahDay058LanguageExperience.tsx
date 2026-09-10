import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimePrimary, RuntimeScale, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { HAHAIAH_DAY_058 } from './runtime-definitions/hahaiah';

export function HahaiahDay058LanguageExperience() {
  const controller = useHnkDayRuntime(HAHAIAH_DAY_058);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [scripts, setScripts] = useState(['', '', '']);
  const [directText, setDirectText] = useState('');
  const [refusalPresent, setRefusalPresent] = useState(false);
  const [doublePressure, setDoublePressure] = useState(5);
  const [directPressure, setDirectPressure] = useState(5);
  const [doubleClarity, setDoubleClarity] = useState(5);
  const [directClarity, setDirectClarity] = useState(5);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [autonomyPreserved, setAutonomyPreserved] = useState(false);
  const [noClinicalPromise, setNoClinicalPromise] = useState(false);
  const [noCovertCommand, setNoCovertCommand] = useState(false);
  const [noHighImpactUse, setNoHighImpactUse] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [vaultSaved, setVaultSaved] = useState(false);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 58).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setLocalError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO HAHAIAH · DIA 058</Text></View>;
  const phase = controller.phase?.id;
  const scriptsReady = scripts.every((v) => v.trim().length >= 12);

  const saveVault = async () => {
    if (!controller.auth.client || !controller.auth.userId || !scriptsReady || directText.trim().length < 8) return;
    try {
      const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 58, kind: 'ethical-double-bind-self-study', plaintext: JSON.stringify({ schema: 'hnk-day058-self-language-v1', scripts: scripts.map((v) => v.trim()), direct_text: directText.trim() }) });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 58, payload: encrypted });
      setChecksum(encrypted.checksumSha256); setVaultSaved(true); controller.nextPhase();
    } catch (e) { setLocalError(e instanceof Error ? e.message : 'day058_vault_failed'); }
  };

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · HAHAIAH 2/5 · DIA 058</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 058 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 057 confirmado no servidor.</Text></RuntimeCard> : null}
    {phase === 'threshold' ? <RuntimeCard label="HAHAIAH 2/5" title="Linguagem com escolha real"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><RuntimeNotice title="V1 AUTOAPLICADA">Este runtime não oferece modo para persuadir terceiros. O treino é sobre sua própria resposta, clareza e liberdade de recusa.</RuntimeNotice><RuntimePrimary label="INICIAR" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}
    {phase === 'scripts' ? <RuntimeCard label="TRÊS ROTEIROS" title="Duas opções benignas + terceira opção real de recusa">{scripts.map((value, i) => <TextInput key={i} value={value} onChangeText={(next) => setScripts((items) => items.map((item, index) => index === i ? next : item))} multiline placeholder={`Roteiro ${i + 1} · somente autoaplicação`} placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />)}<RuntimeChoice selected={refusalPresent} label="TODOS EXPLICITAM QUE POSSO NÃO SEGUIR, PAUSAR OU ENCERRAR" onPress={() => setRefusalPresent((v) => !v)} /><RuntimeScale label="PRESSÃO PERCEBIDA · DOUBLE BIND" value={doublePressure} onChange={setDoublePressure} /><RuntimeScale label="CLAREZA · DOUBLE BIND" value={doubleClarity} onChange={setDoubleClarity} /><RuntimePrimary label="IR À FRASE DIRETA" disabled={!scriptsReady || !refusalPresent} onPress={controller.nextPhase} /></RuntimeCard> : null}
    {phase === 'direct' ? <RuntimeCard label="CONTROL" title="Formulação direta equivalente"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><TextInput value={directText} onChangeText={setDirectText} multiline placeholder="Formulação direta equivalente" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} /><RuntimeScale label="PRESSÃO PERCEBIDA · DIRETA" value={directPressure} onChange={setDirectPressure} /><RuntimeScale label="CLAREZA · DIRETA" value={directClarity} onChange={setDirectClarity} /><RuntimePrimary label="COMPARAR" disabled={directText.trim().length < 8} onPress={controller.nextPhase} /></RuntimeCard> : null}
    {phase === 'compare' ? <RuntimeCard label="REVISÃO" title="Eficiência persuasiva não supera autonomia"><RuntimeChoice selected={comparisonCompleted} label="COMPAREI PRESSÃO, CLAREZA E LIBERDADE" onPress={() => setComparisonCompleted((v) => !v)} /><RuntimeChoice selected={autonomyPreserved} label="MINHA CAPACIDADE DE RECUSAR E MUDAR DE DECISÃO PERMANECEU INTACTA" onPress={() => setAutonomyPreserved((v) => !v)} /><RuntimeChoice selected={noClinicalPromise} label="NÃO USEI PROMESSA DE CURA OU RESULTADO CLÍNICO" onPress={() => setNoClinicalPromise((v) => !v)} /><RuntimeChoice selected={noCovertCommand} label="NÃO USEI COMANDOS OCULTOS OU RETIRADA DE ESCOLHA" onPress={() => setNoCovertCommand((v) => !v)} /><RuntimeChoice selected={noHighImpactUse} label="NÃO USEI EM DECISÃO AFETIVA, COMERCIAL, SEXUAL OU DE ALTO IMPACTO" onPress={() => setNoHighImpactUse((v) => !v)} /><RuntimeChoice selected={safetyClear} label="SEM SENSAÇÃO DE COERÇÃO OU SOBRECARGA AO FINAL" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !autonomyPreserved || !noClinicalPromise || !noCovertCommand || !noHighImpactUse || !safetyClear} onPress={controller.nextPhase} /></RuntimeCard> : null}
    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Recuperar linguagem comum e escolha"><RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(3, v + 1))} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}
    {phase === 'vault' ? <RuntimeCard label="VAULT" title="Roteiros privados"><RuntimeNotice title="PRIVACIDADE">Os textos completos ficam cifrados. O servidor recebe apenas contagens e flags.</RuntimeNotice><RuntimePrimary label={vaultSaved ? 'ROTEIROS SALVOS' : 'CIFRAR E SALVAR'} disabled={vaultSaved} onPress={() => void saveVault()} /></RuntimeCard> : null}
    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Hahaiah 2/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 058'} disabled={controller.busy || !vaultSaved || !checksum} onPress={() => void controller.seal({ localRecordHash: checksum ?? undefined, evidence: { protocol_completed: true, return_confirmed: true, self_use_only: true, three_scripts_completed: scriptsReady, real_refusal_option_present: refusalPresent, direct_comparison_completed: directText.trim().length >= 8, comparison_completed: comparisonCompleted, autonomy_preserved: autonomyPreserved, no_clinical_promise: noClinicalPromise, no_covert_command: noCovertCommand, no_high_impact_use: noHighImpactUse, vault_saved: vaultSaved, safety_clear: safetyClear, scripts_logged: 3 }, metrics: { double_pressure: doublePressure, direct_pressure: directPressure, double_clarity: doubleClarity, direct_clarity: directClarity } }).then(controller.nextPhase).catch((e) => setLocalError(e instanceof Error ? e.message : 'day058_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAHAIAH 2/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6, marginBottom: 4 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
