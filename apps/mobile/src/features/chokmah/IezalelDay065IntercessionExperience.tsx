import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimeOpenTimer, RuntimePrimary, RuntimeScale, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { IEZALEL_DAY_065 } from './runtime-definitions/iezalel';

export function IezalelDay065IntercessionExperience() {
  const controller = useHnkDayRuntime(IEZALEL_DAY_065);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [photoUsed, setPhotoUsed] = useState(false);
  const [photoRecorded, setPhotoRecorded] = useState(false);
  const [consentApplicable, setConsentApplicable] = useState(false);
  const [consentApplicableRecorded, setConsentApplicableRecorded] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [activeEffect, setActiveEffect] = useState(false);
  const [activeEffectRecorded, setActiveEffectRecorded] = useState(false);
  const [controlEffect, setControlEffect] = useState(false);
  const [controlEffectRecorded, setControlEffectRecorded] = useState(false);
  const [comparison, setComparison] = useState(false);
  const [photoNotUploaded, setPhotoNotUploaded] = useState(false);
  const [identityNotStored, setIdentityNotStored] = useState(false);
  const [symptomsNotCollected, setSymptomsNotCollected] = useState(false);
  const [cureNotClaimed, setCureNotClaimed] = useState(false);
  const [remoteEffectNotClaimed, setRemoteEffectNotClaimed] = useState(false);
  const [professionalCareNotReplaced, setProfessionalCareNotReplaced] = useState(false);
  const [concreteCareConsidered, setConcreteCareConsidered] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [activeCompassion, setActiveCompassion] = useState(5);
  const [controlCompassion, setControlCompassion] = useState(5);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 65).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO IEZALEL · DIA 065</Text></View>;
  const phase = controller.phase?.id;
  const consentReady = consentApplicableRecorded && (!consentApplicable || consentConfirmed);
  const safetyStop = () => controller.interrupt({ durationSeconds: activeSeconds + controlSeconds, evidence: { safety_stop: true }, metrics: { active_compassion: activeCompassion, control_compassion: controlCompassion } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · IEZALEL 4/5 · DIA 065</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || error ? <RuntimeNotice title="RUNTIME">{error ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 065 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 064 confirmado no servidor.</Text></RuntimeCard> : null}

    {phase === 'threshold' ? <RuntimeCard label="IEZALEL 4/5" title="Intercessão como oração e cuidado, não tratamento remoto"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><RuntimeNotice title="PRIVACIDADE">Se usar fotografia, ela permanece fora do app e do servidor. Nenhum sintoma, nome, rosto ou dado identificável de terceiro é solicitado.</RuntimeNotice><RuntimePrimary label="INICIAR" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}

    {phase === 'active' ? <RuntimeCard label="CONDIÇÃO A" title="Oração + visualização compassiva"><View style={runtimeTextStyles.row}><RuntimeChoice selected={photoRecorded && photoUsed} label="USEI FOTO APENAS LOCALMENTE" onPress={() => { setPhotoUsed(true); setPhotoRecorded(true); }} /><RuntimeChoice selected={photoRecorded && !photoUsed} label="NÃO USEI FOTO" onPress={() => { setPhotoUsed(false); setPhotoRecorded(true); }} /></View><View style={runtimeTextStyles.row}><RuntimeChoice selected={consentApplicableRecorded && consentApplicable} label="CONSENTIMENTO É APLICÁVEL NESTA RELAÇÃO" onPress={() => { setConsentApplicable(true); setConsentApplicableRecorded(true); }} /><RuntimeChoice selected={consentApplicableRecorded && !consentApplicable} label="PRÁTICA SILENCIOSA · SEM INTERVENÇÃO DIRETA" onPress={() => { setConsentApplicable(false); setConsentApplicableRecorded(true); setConsentConfirmed(false); }} /></View>{consentApplicable ? <RuntimeChoice selected={consentConfirmed} label="TENHO CONSENTIMENTO PARA ESTA ORAÇÃO/PRÁTICA RELACIONAL" onPress={() => setConsentConfirmed((v) => !v)} /> : null}<RuntimeOpenTimer value={activeSeconds} onChange={setActiveSeconds} /><View style={runtimeTextStyles.row}><RuntimeChoice selected={activeEffectRecorded && activeEffect} label="HOUVE EFEITO SUBJETIVO EM MIM" onPress={() => { setActiveEffect(true); setActiveEffectRecorded(true); }} /><RuntimeChoice selected={activeEffectRecorded && !activeEffect} label="NENHUM EFEITO SUBJETIVO MARCANTE" onPress={() => { setActiveEffect(false); setActiveEffectRecorded(true); }} /></View><RuntimeScale label="COMPAIXÃO / DISPOSIÇÃO DE CUIDADO" value={activeCompassion} onChange={setActiveCompassion} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="IR AO CONTROLE" disabled={activeSeconds < 1 || !photoRecorded || !consentReady || !activeEffectRecorded} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'control' ? <RuntimeCard label="CONDIÇÃO B" title="Oração simples sem foto nem visualização branca"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><RuntimeOpenTimer value={controlSeconds} onChange={setControlSeconds} /><View style={runtimeTextStyles.row}><RuntimeChoice selected={controlEffectRecorded && controlEffect} label="HOUVE EFEITO SUBJETIVO EM MIM" onPress={() => { setControlEffect(true); setControlEffectRecorded(true); }} /><RuntimeChoice selected={controlEffectRecorded && !controlEffect} label="NENHUM EFEITO SUBJETIVO MARCANTE" onPress={() => { setControlEffect(false); setControlEffectRecorded(true); }} /></View><RuntimeScale label="COMPAIXÃO / DISPOSIÇÃO DE CUIDADO" value={controlCompassion} onChange={setControlCompassion} /><RuntimePrimary label="COMPARAR" disabled={controlSeconds < 1 || !controlEffectRecorded} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'compare' ? <RuntimeCard label="REVISÃO" title="Comparar somente a própria experiência"><RuntimeChoice selected={comparison} label="COMPAREI SOMENTE MEU ESTADO, NÃO O ESTADO DA PESSOA DISTANTE" onPress={() => setComparison((v) => !v)} /><RuntimeChoice selected={photoNotUploaded} label="NENHUMA FOTO FOI ENVIADA AO HNK" onPress={() => setPhotoNotUploaded((v) => !v)} /><RuntimeChoice selected={identityNotStored} label="NENHUMA IDENTIDADE DE TERCEIRO FOI ARMAZENADA" onPress={() => setIdentityNotStored((v) => !v)} /><RuntimeChoice selected={symptomsNotCollected} label="NÃO COLETEI SINTOMAS DE TERCEIROS" onPress={() => setSymptomsNotCollected((v) => !v)} /><RuntimeChoice selected={cureNotClaimed} label="NÃO DECLAREI CURA OU TRATAMENTO" onPress={() => setCureNotClaimed((v) => !v)} /><RuntimeChoice selected={remoteEffectNotClaimed} label="NÃO TRATEI EMOÇÃO/CONEXÃO COMO PROVA DE EFEITO FÍSICO À DISTÂNCIA" onPress={() => setRemoteEffectNotClaimed((v) => !v)} /><RuntimeChoice selected={professionalCareNotReplaced} label="NÃO SUBSTITUÍ CUIDADO MÉDICO, PSICOLÓGICO, SOCIAL OU EMERGENCIAL" onPress={() => setProfessionalCareNotReplaced((v) => !v)} /><RuntimeChoice selected={concreteCareConsidered} label="CONSIDEREI UMA AÇÃO CONCRETA E RESPEITOSA DE CUIDADO, QUANDO APROPRIADA" onPress={() => setConcreteCareConsidered((v) => !v)} /><RuntimeChoice selected={safetyClear} label="A PRÁTICA TERMINOU SEM FANTASIA DE CONTROLE SOBRE O OUTRO" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!comparison || !photoNotUploaded || !identityNotStored || !symptomsNotCollected || !cureNotClaimed || !remoteEffectNotClaimed || !professionalCareNotReplaced || !concreteCareConsidered || !safetyClear} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Entregar o resultado a Deus e retornar"><RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(3, v + 1))} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}
    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Iezalel 4/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 065'} disabled={controller.busy} onPress={() => void controller.seal({ durationSeconds: activeSeconds + controlSeconds, evidence: { protocol_completed: true, return_confirmed: true, active_completed: true, control_completed: true, comparison_completed: comparison, photo_not_uploaded: photoNotUploaded, third_party_identity_not_stored: identityNotStored, third_party_symptoms_not_collected: symptomsNotCollected, cure_not_claimed: cureNotClaimed, remote_effect_not_claimed: remoteEffectNotClaimed, professional_care_not_replaced: professionalCareNotReplaced, concrete_care_considered: concreteCareConsidered, safety_clear: safetyClear, photo_used_locally: photoUsed, consent_applicable: consentApplicable, consent_confirmed_if_applicable: consentConfirmed, active_effect_present: activeEffect, control_effect_present: controlEffect, active_seconds: activeSeconds, control_seconds: controlSeconds }, metrics: { active_compassion: activeCompassion, control_compassion: controlCompassion } }).then(controller.nextPhase).catch((e) => setError(e instanceof Error ? e.message : 'day065_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="IEZALEL 4/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
