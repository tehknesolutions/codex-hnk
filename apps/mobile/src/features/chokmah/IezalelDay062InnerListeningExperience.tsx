import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimeOpenTimer, RuntimePrimary, RuntimeScale, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { IEZALEL_DAY_062 } from './runtime-definitions/iezalel';

export function IezalelDay062InnerListeningExperience() {
  const controller = useHnkDayRuntime(IEZALEL_DAY_062);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [earplugsUsed, setEarplugsUsed] = useState(false);
  const [earplugsRecorded, setEarplugsRecorded] = useState(false);
  const [activeSound, setActiveSound] = useState(false);
  const [activeRecorded, setActiveRecorded] = useState(false);
  const [controlSound, setControlSound] = useState(false);
  const [controlRecorded, setControlRecorded] = useState(false);
  const [activeIntensity, setActiveIntensity] = useState(0);
  const [controlIntensity, setControlIntensity] = useState(0);
  const [comparison, setComparison] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [externalMessageNotClaimed, setExternalMessageNotClaimed] = useState(false);
  const [earSafety, setEarSafety] = useState(false);
  const [riskContextAvoided, setRiskContextAvoided] = useState(false);
  const [persistentVoiceNotReinforced, setPersistentVoiceNotReinforced] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [externalSounds, setExternalSounds] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 62).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO IEZALEL · DIA 062</Text></View>;
  const phase = controller.phase?.id;
  const safetyStop = () => controller.interrupt({ durationSeconds: activeSeconds + controlSeconds, evidence: { safety_stop: true }, metrics: { active_intensity: activeIntensity, control_intensity: controlIntensity } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · IEZALEL 1/5 · DIA 062</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || error ? <RuntimeNotice title="RUNTIME">{error ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 062 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige Hahaiah 5/5, Dia 061, confirmado no servidor.</Text></RuntimeCard> : null}
    {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Retire qualquer tampão, escute o ambiente e encerre. Nenhuma impressão auditiva é tratada como ordem ou mensagem externa.</RuntimeNotice> : null}

    {phase === 'threshold' ? <RuntimeCard label="IEZALEL 1/5" title="Escuta interior sem privação sensorial extrema"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><RuntimeNotice title="SEGURANÇA">Tampões são opcionais, próprios para ouvido e nunca inseridos profundamente. Não use em trânsito, sono inseguro ou onde sinais externos precisem ser ouvidos.</RuntimeNotice><RuntimePrimary label="INICIAR" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}

    {phase === 'active' ? <RuntimeCard label="CONDIÇÃO A" title="Observar o campo auditivo interno"><View style={runtimeTextStyles.row}><RuntimeChoice selected={earplugsRecorded && earplugsUsed} label="USEI TAMPÕES ADEQUADOS" onPress={() => { setEarplugsUsed(true); setEarplugsRecorded(true); }} /><RuntimeChoice selected={earplugsRecorded && !earplugsUsed} label="NÃO USEI TAMPÕES" onPress={() => { setEarplugsUsed(false); setEarplugsRecorded(true); }} /></View><RuntimeOpenTimer value={activeSeconds} onChange={setActiveSeconds} /><View style={runtimeTextStyles.row}><RuntimeChoice selected={activeRecorded && activeSound} label="PERCEBI SOM/RUÍDO/PULSAÇÃO" onPress={() => { setActiveSound(true); setActiveRecorded(true); }} /><RuntimeChoice selected={activeRecorded && !activeSound} label="NENHUM SOM INTERNO MARCANTE" onPress={() => { setActiveSound(false); setActiveRecorded(true); }} /></View><RuntimeScale label="INTENSIDADE PERCEBIDA" value={activeIntensity} onChange={setActiveIntensity} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="IR AO CONTROLE" disabled={!earplugsRecorded || !activeRecorded || activeSeconds < 1} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'control' ? <RuntimeCard label="CONDIÇÃO B" title="Mesma escuta sem tampões"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><RuntimeOpenTimer value={controlSeconds} onChange={setControlSeconds} /><View style={runtimeTextStyles.row}><RuntimeChoice selected={controlRecorded && controlSound} label="PERCEBI SOM/RUÍDO/PULSAÇÃO" onPress={() => { setControlSound(true); setControlRecorded(true); }} /><RuntimeChoice selected={controlRecorded && !controlSound} label="NENHUM SOM INTERNO MARCANTE" onPress={() => { setControlSound(false); setControlRecorded(true); }} /></View><RuntimeScale label="INTENSIDADE PERCEBIDA" value={controlIntensity} onChange={setControlIntensity} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="COMPARAR" disabled={!controlRecorded || controlSeconds < 1} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'compare' ? <RuntimeCard label="REVISÃO" title="Som, pensamento e interpretação permanecem separados"><RuntimeChoice selected={comparison} label="COMPAREI AS DUAS CONDIÇÕES SEM ELEGER UMA COMO MAIS ESPIRITUAL" onPress={() => setComparison((v) => !v)} /><RuntimeChoice selected={interpretationSeparated} label="SEPAREI CARACTERÍSTICA ACÚSTICA, PENSAMENTO E SIGNIFICADO" onPress={() => setInterpretationSeparated((v) => !v)} /><RuntimeChoice selected={externalMessageNotClaimed} label="NÃO CLASSIFIQUEI RUÍDO COMO VOZ, PROFECIA OU MENSAGEM EXTERNA" onPress={() => setExternalMessageNotClaimed((v) => !v)} /><RuntimeChoice selected={earSafety} label="PRESERVEI CONFORTO E SEGURANÇA AUDITIVA" onPress={() => setEarSafety((v) => !v)} /><RuntimeChoice selected={riskContextAvoided} label="NÃO USEI TAMPÕES EM CONTEXTO DE RISCO" onPress={() => setRiskContextAvoided((v) => !v)} /><RuntimeChoice selected={persistentVoiceNotReinforced} label="SE HOUVESSE FALA CLARA, RECORRENTE E PERTURBADORA, EU FARIA GROUNDING/APOIO SEM REFORÇAR ORIGEM SOBRENATURAL" onPress={() => setPersistentVoiceNotReinforced((v) => !v)} /><RuntimeChoice selected={safetyClear} label="SEM DOR, PERDA AUDITIVA OU ALTERAÇÃO SÚBITA AO FINAL" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!comparison || !interpretationSeparated || !externalMessageNotClaimed || !earSafety || !riskContextAvoided || !persistentVoiceNotReinforced || !safetyClear} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Reabrir completamente a atenção externa"><RuntimeCounter label="SONS EXTERNOS RECONHECIDOS" value={externalSounds} onPress={() => setExternalSounds((v) => Math.min(3, v + 1))} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={externalSounds < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}

    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Iezalel 1/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 062'} disabled={controller.busy} onPress={() => void controller.seal({ durationSeconds: activeSeconds + controlSeconds, evidence: { protocol_completed: true, return_confirmed: true, active_completed: true, control_completed: true, comparison_completed: comparison, interpretation_separated: interpretationSeparated, external_message_not_claimed: externalMessageNotClaimed, ear_safety_respected: earSafety, risk_context_avoided: riskContextAvoided, persistent_voice_not_reinforced: persistentVoiceNotReinforced, safety_clear: safetyClear, earplugs_used: earplugsUsed, active_sound_present: activeSound, control_sound_present: controlSound, active_seconds: activeSeconds, control_seconds: controlSeconds }, metrics: { active_intensity: activeIntensity, control_intensity: controlIntensity } }).then(controller.nextPhase).catch((e) => setError(e instanceof Error ? e.message : 'day062_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="IEZALEL 1/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
