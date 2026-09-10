import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimePrimary, RuntimeScale, RuntimeTimer, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { HAHAIAH_DAY_059 } from './runtime-definitions/hahaiah';

export function HahaiahDay059BluePearlExperience() {
  const controller = useHnkDayRuntime(HAHAIAH_DAY_059);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [blueSeconds, setBlueSeconds] = useState(0);
  const [graySeconds, setGraySeconds] = useState(0);
  const [blueImagePresent, setBlueImagePresent] = useState(false);
  const [grayImagePresent, setGrayImagePresent] = useState(false);
  const [blueRecorded, setBlueRecorded] = useState(false);
  const [grayRecorded, setGrayRecorded] = useState(false);
  const [blueReturns, setBlueReturns] = useState(0);
  const [grayReturns, setGrayReturns] = useState(0);
  const [blueEffort, setBlueEffort] = useState(5);
  const [grayEffort, setGrayEffort] = useState(5);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [clarivoyanceNotClaimed, setClarivoyanceNotClaimed] = useState(false);
  const [reasonPreserved, setReasonPreserved] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 59).then((v) => { if (active) setCanon(v); }).catch((e) => { if (active) setLocalError(e instanceof Error ? e.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO HAHAIAH · DIA 059</Text></View>;
  const phase = controller.phase?.id;
  const safetyStop = () => controller.interrupt({ durationSeconds: blueSeconds + graySeconds, evidence: { safety_stop: true }, metrics: { blue_effort: blueEffort, gray_effort: grayEffort } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}><Text style={styles.eyebrow}>CHOKMAH · HAHAIAH 3/5 · DIA 059</Text><Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text><Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text></View>
    {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 059 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 058 confirmado no servidor.</Text></RuntimeCard> : null}
    {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Dor ocular, cefaleia, vertigem ou ansiedade crescente encerram a tentativa.</RuntimeNotice> : null}

    {phase === 'threshold' ? <RuntimeCard label="HAHAIAH 3/5" title="Pérola Azul sem guerra contra pensamentos"><CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText><RuntimeNotice title="ATÉ 15 MIN">O timer tem teto de 900 s. O protocolo aceita encerrar antes por conforto; XP não depende de imagem nítida nem de silêncio mental.</RuntimeNotice><RuntimePrimary label="INICIAR PÉROLA AZUL" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} /></RuntimeCard> : null}

    {phase === 'blue' ? <RuntimeCard label="ACTIVE · AZUL" title="Construir e soltar a imagem com voluntariedade"><RuntimeTimer value={blueSeconds} target={900} onChange={setBlueSeconds} /><RuntimeCounter label="RETORNOS À IMAGEM" value={blueReturns} onPress={() => setBlueReturns((v) => v + 1)} /><RuntimeScale label="ESFORÇO OCULAR/PERCEPTIVO" value={blueEffort} onChange={setBlueEffort} /><View style={runtimeTextStyles.row}><RuntimeChoice selected={blueRecorded && blueImagePresent} label="FORMEI/NOTEI IMAGEM" onPress={() => { setBlueImagePresent(true); setBlueRecorded(true); }} /><RuntimeChoice selected={blueRecorded && !blueImagePresent} label="SEM IMAGEM DEFINIDA" onPress={() => { setBlueImagePresent(false); setBlueRecorded(true); }} /></View><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="ENCERRAR AZUL E IR AO CONTROLE" disabled={blueSeconds < 1 || !blueRecorded} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'gray' ? <RuntimeCard label="CONTROL · CINZA" title="Mesmo tamanho, posição, postura e ambiente"><CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText><RuntimeTimer value={graySeconds} target={900} onChange={setGraySeconds} /><RuntimeCounter label="RETORNOS AO PONTO CINZA" value={grayReturns} onPress={() => setGrayReturns((v) => v + 1)} /><RuntimeScale label="ESFORÇO OCULAR/PERCEPTIVO" value={grayEffort} onChange={setGrayEffort} /><View style={runtimeTextStyles.row}><RuntimeChoice selected={grayRecorded && grayImagePresent} label="FORMEI/NOTEI IMAGEM" onPress={() => { setGrayImagePresent(true); setGrayRecorded(true); }} /><RuntimeChoice selected={grayRecorded && !grayImagePresent} label="SEM IMAGEM DEFINIDA" onPress={() => { setGrayImagePresent(false); setGrayRecorded(true); }} /></View><RuntimePrimary label="SAFETY STOP" onPress={safetyStop} /><RuntimePrimary label="COMPARAR" disabled={graySeconds < 1 || !grayRecorded} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'compare' ? <RuntimeCard label="REVISÃO" title="Contemplação e razão continuam disponíveis"><Text style={runtimeTextStyles.body}>Azul: {blueSeconds}s, {blueReturns} retornos, esforço {blueEffort}/10. Cinza: {graySeconds}s, {grayReturns} retornos, esforço {grayEffort}/10.</Text><RuntimeChoice selected={comparisonCompleted} label="COMPAREI SEM ELEGER COR VENCEDORA" onPress={() => setComparisonCompleted((v) => !v)} /><RuntimeChoice selected={interpretationSeparated} label="SEPAREI IMAGEM CONSTRUÍDA, FENÔMENO ESPONTÂNEO E INTERPRETAÇÃO" onPress={() => setInterpretationSeparated((v) => !v)} /><RuntimeChoice selected={clarivoyanceNotClaimed} label="NÃO TRATEI FLASHES, CORES OU PRESENÇA COMO PROVA DE CLARIVIDÊNCIA" onPress={() => setClarivoyanceNotClaimed((v) => !v)} /><RuntimeChoice selected={reasonPreserved} label="RAZÃO E ANÁLISE CONTINUAM DISPONÍVEIS" onPress={() => setReasonPreserved((v) => !v)} /><RuntimeChoice selected={safetyClear} label="SEM DOR OCULAR, CEFaleia, VERTIGEM OU ANSIEDADE AO FINAL" onPress={() => setSafetyClear((v) => !v)} /><RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !clarivoyanceNotClaimed || !reasonPreserved || !safetyClear} onPress={controller.nextPhase} /></RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="GROUNDING" title="Deixar a imagem desaparecer voluntariamente"><RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((v) => Math.min(3, v + 1))} /><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} /></RuntimeCard> : null}

    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Hahaiah 3/5"><RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 059'} disabled={controller.busy} onPress={() => void controller.seal({ durationSeconds: blueSeconds + graySeconds, evidence: { protocol_completed: true, return_confirmed: true, blue_completed: blueSeconds > 0, gray_completed: graySeconds > 0, comparison_completed: comparisonCompleted, interpretation_separated: interpretationSeparated, clarivoyance_not_claimed: clarivoyanceNotClaimed, reason_preserved: reasonPreserved, safety_clear: safetyClear, blue_image_present: blueImagePresent, gray_image_present: grayImagePresent, blue_seconds: blueSeconds, gray_seconds: graySeconds }, metrics: { blue_returns: blueReturns, gray_returns: grayReturns, blue_effort: blueEffort, gray_effort: grayEffort } }).then(controller.nextPhase).catch((e) => setLocalError(e instanceof Error ? e.message : 'day059_seal_failed'))} /></RuntimeCard> : null}
    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAHAIAH 3/5" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#02050a' }, content: { padding: 24, gap: 18, paddingBottom: 52 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' }, header: { gap: 6, marginBottom: 4 }, eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 }, title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' }, meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 } });
