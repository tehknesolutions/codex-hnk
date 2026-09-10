import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimeOpenTimer, RuntimePrimary, RuntimeScale, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { GneoGeoMasterV1, GNEO_GEO_MASTER_ID, GNEO_GEO_MASTER_SHA256 } from './GneoGeoMasterV1';
import { IEZALEL_DAY_066 } from './runtime-definitions/iezalel';

export function IezalelDay066GneoGeoExperience() {
  const controller = useHnkDayRuntime(IEZALEL_DAY_066);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [masterVerified, setMasterVerified] = useState(false);
  const [pearlCentered, setPearlCentered] = useState(false);
  const [eightNodes, setEightNodes] = useState(false);
  const [nodesCircuitsDistinct, setNodesCircuitsDistinct] = useState(false);
  const [noRouteInvented, setNoRouteInvented] = useState(false);
  const [activeDepth, setActiveDepth] = useState(5);
  const [controlDepth, setControlDepth] = useState(5);
  const [comparison, setComparison] = useState(false);
  const [externalTravelNotClaimed, setExternalTravelNotClaimed] = useState(false);
  const [orientationRestored, setOrientationRestored] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [timeConfirmed, setTimeConfirmed] = useState(false);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 66).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO IEZALEL · DIA 066</Text></View>;
  const phase = controller.phase?.id;
  const safetyStop = () => controller.interrupt({ durationSeconds: activeSeconds + controlSeconds, evidence: { safety_stop: true }, metrics: { active_depth: activeDepth, control_depth: controlDepth } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · IEZALEL 5/5 · DIA 066</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || error ? <RuntimeNotice title="RUNTIME">{error ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 066 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 065 confirmado no servidor.</Text></RuntimeCard> : null}

    {phase === 'threshold' ? <RuntimeCard label="IEZALEL 5/5" title="Cockpit Gneo Geo · master canônico"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><GneoGeoMasterV1 /><RuntimeNotice title="MASTER IMUTÁVEL">{GNEO_GEO_MASTER_ID} · SHA-256 {GNEO_GEO_MASTER_SHA256.slice(0, 16)}…</RuntimeNotice><RuntimeChoice selected={masterVerified} label="CONFIRMEI O MASTER CANÔNICO HNK V1" onPress={() => setMasterVerified((v) => !v)} /><RuntimeChoice selected={pearlCentered} label="A PÉROLA AZUL ESTÁ NO CENTRO GEOMÉTRICO" onPress={() => setPearlCentered((v) => !v)} /><RuntimeChoice selected={eightNodes} label="O CAMPO PRESERVA OS OITO NÓS DO COCKPIT" onPress={() => setEightNodes((v) => !v)} /><RuntimeChoice selected={nodesCircuitsDistinct} label="NÓS DO COCKPIT E OITO CIRCUITOS DA CONSCIÊNCIA PERMANECEM ESTRUTURAS DISTINTAS" onPress={() => setNodesCircuitsDistinct((v) => !v)} /><RuntimeChoice selected={noRouteInvented} label="NÃO ATRIBUÍ ORDEM RITUAL OU CAMINHO ENTRE OS NÓS" onPress={() => setNoRouteInvented((v) => !v)} /><RuntimePrimary label="INICIAR VISUALIZAÇÃO" disabled={!canon || !masterVerified || !pearlCentered || !eightNodes || !nodesCircuitsDistinct || !noRouteInvented || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}

    {phase === 'active' ? <RuntimeCard label="CONDIÇÃO A" title="Campo Gneo Geo simultâneo"><GneoGeoMasterV1 /><RuntimeOpenTimer value={activeSeconds} onChange={setActiveSeconds} /><RuntimeScale label="PROFUNDIDADE SUBJETIVA" value={activeDepth} onChange={setActiveDepth} /><RuntimeNotice title="LIMITE">Sensação de voo, presença ou deslocamento permanece fenomenologia. Não mede viagem astral, distância ou acesso externo.</RuntimeNotice><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="DESFAZER O CAMPO E IR AO CONTROLE" disabled={activeSeconds < 1} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'control' ? <RuntimeCard label="CONDIÇÃO B" title="Auto-hipnose em espaço mental neutro"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><RuntimeOpenTimer value={controlSeconds} onChange={setControlSeconds} /><RuntimeScale label="PROFUNDIDADE SUBJETIVA" value={controlDepth} onChange={setControlDepth} /><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="COMPARAR" disabled={controlSeconds < 1} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'compare' ? <RuntimeCard label="REVISÃO" title="Comparar estados internos, não destinos externos"><RuntimeChoice selected={comparison} label="COMPAREI PROFUNDIDADE, ESTABILIDADE, ORIENTAÇÃO E RETORNO" onPress={() => setComparison((v) => !v)} /><RuntimeChoice selected={externalTravelNotClaimed} label="NÃO TRATEI A EXPERIÊNCIA COMO VIAGEM OBJETIVA OU PERCEPÇÃO REMOTA COMPROVADA" onPress={() => setExternalTravelNotClaimed((v) => !v)} /><RuntimeChoice selected={safetyClear} label="SEM DESORIENTAÇÃO, MEDO INTENSO OU DEREALIZAÇÃO PERSISTENTE AO FINAL" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!comparison || !externalTravelNotClaimed || !safetyClear} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Localização, horário e mundo compartilhado"><RuntimeCounter label="ELEMENTOS REAIS DO AMBIENTE" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(5, v + 1))} /><RuntimeChoice selected={locationConfirmed} label="CONFIRMEI MINHA LOCALIZAÇÃO REAL" onPress={() => setLocationConfirmed((v) => !v)} /><RuntimeChoice selected={timeConfirmed} label="CONFIRMEI O HORÁRIO/APROXIMAÇÃO TEMPORAL ATUAL" onPress={() => setTimeConfirmed((v) => !v)} /><RuntimeChoice selected={orientationRestored} label="ORIENTAÇÃO COMUM TOTALMENTE RESTAURADA" onPress={() => setOrientationRestored((v) => !v)} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 5 || !locationConfirmed || !timeConfirmed || !orientationRestored} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}

    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Iezalel 5/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 066'} disabled={controller.busy} onPress={() => void controller.seal({ durationSeconds: activeSeconds + controlSeconds, evidence: { protocol_completed: true, return_confirmed: true, active_completed: true, control_completed: true, comparison_completed: comparison, master_verified: masterVerified, pearl_centered: pearlCentered, eight_nodes_preserved: eightNodes, nodes_circuits_kept_distinct: nodesCircuitsDistinct, no_route_invented: noRouteInvented, external_travel_not_claimed: externalTravelNotClaimed, orientation_restored: orientationRestored, safety_clear: safetyClear, gneo_master_id: GNEO_GEO_MASTER_ID, active_seconds: activeSeconds, control_seconds: controlSeconds }, metrics: { active_depth: activeDepth, control_depth: controlDepth } }).then(controller.nextPhase).catch((e) => setError(e instanceof Error ? e.message : 'day066_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="IEZALEL 5/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
