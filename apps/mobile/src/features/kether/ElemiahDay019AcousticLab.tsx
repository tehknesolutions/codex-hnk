import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  useAudioStream,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { analyzeFloat32Pcm, decodeFloat32Pcm, type AcousticAnalysis } from '@hnk/day-runtime/audio-analysis';
import type { Json } from '@hnk/database';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import { ELEMIAH_DAY_019 } from './runtime-definitions/elemiah';
import {
  CanonicalText,
  RuntimeCard,
  RuntimeChoice,
  RuntimeCompletion,
  RuntimeNotice,
  RuntimePrimary,
  RuntimeScale,
  runtimeTextStyles,
} from './KetherRuntimePrimitives';
import { useHnkDayRuntime } from './useHnkDayRuntime';

type PermissionState = 'idle' | 'granted' | 'denied';
type DistanceBand = 'near' | 'medium' | 'far';
type EnvironmentBand = 'quiet' | 'normal' | 'reverberant';

type Aggregate = {
  samples: number;
  sumSquares: number;
  peak: number;
  loudestRms: number;
  dominantHz: number;
  centroidWeighted: number;
  centroidWeight: number;
  sampleRateHz: number;
};

type PreviousSession = {
  rmsDbfs: number | null;
  dominantFrequencyHz: number | null;
  spectralCentroidHz: number | null;
  durationSeconds: number | null;
};

const EMPTY_AGGREGATE: Aggregate = {
  samples: 0,
  sumSquares: 0,
  peak: 0,
  loudestRms: 0,
  dominantHz: 0,
  centroidWeighted: 0,
  centroidWeight: 0,
  sampleRateHz: 48_000,
};

function toDbfs(amplitude: number): number {
  if (amplitude <= 1e-12) return -120;
  return Math.max(-120, 20 * Math.log10(Math.min(1, amplitude)));
}

function numberFromJson(value: Json | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function previousFromMetrics(metrics: Json): PreviousSession | null {
  if (typeof metrics !== 'object' || metrics === null || Array.isArray(metrics)) return null;
  const row = metrics as Record<string, Json | undefined>;
  return {
    rmsDbfs: numberFromJson(row.rms_dbfs),
    dominantFrequencyHz: numberFromJson(row.dominant_frequency_hz),
    spectralCentroidHz: numberFromJson(row.spectral_centroid_hz),
    durationSeconds: numberFromJson(row.duration_seconds),
  };
}

function aggregateResult(aggregate: Aggregate, durationSeconds: number, latest: AcousticAnalysis | null) {
  const rms = aggregate.samples > 0 ? Math.sqrt(aggregate.sumSquares / aggregate.samples) : 0;
  return {
    durationSeconds,
    sampleRateHz: aggregate.sampleRateHz || latest?.sampleRateHz || 48_000,
    rmsDbfs: toDbfs(rms),
    peakDbfs: toDbfs(aggregate.peak),
    dominantFrequencyHz: aggregate.dominantHz || latest?.dominantFrequencyHz || 0,
    spectralCentroidHz: aggregate.centroidWeight > 0
      ? aggregate.centroidWeighted / aggregate.centroidWeight
      : latest?.spectralCentroidHz ?? 0,
  };
}

export function ElemiahDay019AcousticLab() {
  const controller = useHnkDayRuntime(ELEMIAH_DAY_019);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState>('idle');
  const [distance, setDistance] = useState<DistanceBand | null>(null);
  const [environment, setEnvironment] = useState<EnvironmentBand | null>(null);
  const [intendedSeconds, setIntendedSeconds] = useState(60);
  const [selfIntensity, setSelfIntensity] = useState(5);
  const [intensitySet, setIntensitySet] = useState(false);
  const [latest, setLatest] = useState<AcousticAnalysis | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingCreated, setRecordingCreated] = useState(false);
  const [recordingDeleted, setRecordingDeleted] = useState(false);
  const [captureActive, setCaptureActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseMarkers, setPauseMarkers] = useState(0);
  const [segmentMarkers, setSegmentMarkers] = useState(0);
  const [finalDurationSeconds, setFinalDurationSeconds] = useState(0);
  const [stability, setStability] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [stabilitySet, setStabilitySet] = useState(false);
  const [comfortSet, setComfortSet] = useState(false);
  const [analysisAcknowledged, setAnalysisAcknowledged] = useState(false);
  const [previous, setPrevious] = useState<PreviousSession | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);
  const aggregateRef = useRef<Aggregate>({ ...EMPTY_AGGREGATE });
  const lastUiUpdateRef = useRef(0);

  const streamResult = useAudioStream({
    sampleRate: 48_000,
    channels: 1,
    encoding: 'float32',
    onBuffer: (buffer) => {
      const mono = decodeFloat32Pcm(buffer.data, buffer.channels);
      if (mono.length === 0) return;
      const analysis = analyzeFloat32Pcm(mono, buffer.sampleRate);
      const aggregate = aggregateRef.current;
      let sumSquares = aggregate.sumSquares;
      let peak = aggregate.peak;
      for (const sample of mono) {
        sumSquares += sample * sample;
        peak = Math.max(peak, Math.abs(sample));
      }
      aggregateRef.current = {
        samples: aggregate.samples + mono.length,
        sumSquares,
        peak,
        loudestRms: analysis.rms > aggregate.loudestRms ? analysis.rms : aggregate.loudestRms,
        dominantHz: analysis.rms > aggregate.loudestRms ? analysis.dominantFrequencyHz : aggregate.dominantHz,
        centroidWeighted: aggregate.centroidWeighted + analysis.spectralCentroidHz * mono.length,
        centroidWeight: aggregate.centroidWeight + mono.length,
        sampleRateHz: buffer.sampleRate,
      };
      const now = Date.now();
      if (now - lastUiUpdateRef.current >= 100) {
        lastUiUpdateRef.current = now;
        setLatest(analysis);
      }
    },
  });

  useEffect(() => {
    let active = true;
    setCanon(null);
    setCanonError(null);
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 19)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  const loadPrevious = useCallback(async () => {
    if (!controller.auth.client || !controller.practice?.id) return;
    const { data, error } = await controller.auth.client
      .from('practice_sessions')
      .select('metrics,started_at')
      .eq('day', 19)
      .neq('id', controller.practice.id)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) setPrevious(previousFromMetrics(data.metrics));
  }, [controller.auth.client, controller.practice?.id]);

  const stopCapture = useCallback(async () => {
    if (!captureActive && !paused) return;
    setLocalError(null);
    try {
      const duration = Math.min(180, Math.max(recorder.currentTime, recorderState.durationMillis / 1000));
      streamResult.stream.stop();
      if (recorder.isRecording || paused) await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const uri = recorder.uri;
      if (!uri) throw new Error('recording_uri_missing');
      setFinalDurationSeconds(duration);
      setRecordingUri(uri);
      setRecordingCreated(true);
      setCaptureActive(false);
      setPaused(false);
      await loadPrevious();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'acoustic_capture_stop_failed');
    }
  }, [captureActive, loadPrevious, paused, recorder, recorderState.durationMillis, streamResult.stream]);

  useEffect(() => {
    if (captureActive && !paused && recorderState.durationMillis >= 180_000) void stopCapture();
  }, [captureActive, paused, recorderState.durationMillis, stopCapture]);

  useEffect(() => () => {
    try { streamResult.stream.stop(); } catch { /* best-effort release */ }
    if (recorder.isRecording) void recorder.stop();
  }, [recorder, streamResult.stream]);

  const startCapture = async () => {
    setLocalError(null);
    try {
      const status = await requestRecordingPermissionsAsync();
      if (!status.granted) {
        setPermission('denied');
        return;
      }
      setPermission('granted');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      aggregateRef.current = { ...EMPTY_AGGREGATE };
      setLatest(null);
      setRecordingUri(null);
      setRecordingDeleted(false);
      setRecordingCreated(false);
      setFinalDurationSeconds(0);
      setPauseMarkers(0);
      setSegmentMarkers(0);
      await recorder.prepareToRecordAsync();
      recorder.record();
      await streamResult.stream.start();
      setCaptureActive(true);
      setPaused(false);
    } catch (cause) {
      setCaptureActive(false);
      setLocalError(cause instanceof Error ? cause.message : 'acoustic_capture_start_failed');
    }
  };

  const togglePause = async () => {
    if (!captureActive) return;
    setLocalError(null);
    try {
      if (paused) {
        if (recorder.currentTime >= 180) {
          await stopCapture();
          return;
        }
        recorder.record();
        await streamResult.stream.start();
        setPaused(false);
      } else {
        recorder.pause();
        streamResult.stream.stop();
        setPauseMarkers((value) => value + 1);
        setPaused(true);
      }
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'acoustic_pause_failed');
    }
  };

  const deleteRecording = async () => {
    if (!recordingUri) return;
    setLocalError(null);
    try {
      if (Platform.OS === 'web') {
        const urlApi = (globalThis as { URL?: { revokeObjectURL?: (value: string) => void } }).URL;
        if (recordingUri.startsWith('blob:')) urlApi?.revokeObjectURL?.(recordingUri);
      } else {
        await FileSystem.deleteAsync(recordingUri, { idempotent: true });
      }
      setRecordingUri(null);
      setRecordingDeleted(true);
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'recording_delete_failed');
    }
  };

  if (controller.loading) return <View style={styles.loading}><Text style={styles.loadingText}>ABRINDO O LABORATÓRIO ACÚSTICO</Text></View>;

  const phase = controller.phase?.id;
  const liveDuration = Math.min(180, recorderState.durationMillis / 1000);
  const aggregate = aggregateResult(aggregateRef.current, recordingCreated ? finalDurationSeconds : liveDuration, latest);
  const controlsReady = distance !== null && environment !== null && intensitySet;
  const observationsReady = stabilitySet && comfortSet;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>KETHER · ELEMIAH 4/5 · DIA 019</Text>
        <Text style={styles.title}>{canon?.title ?? 'LABORATÓRIO ACÚSTICO'}</Text>
        <Text style={styles.source}>{canon ? `${canon.source} · ${canon.sourceSha.slice(0, 10)}` : 'CÂNONE SINCRONIZANDO'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">A prática não fabrica texto substituto; sincronize o Dia 019 para começar.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="LAB INTERROMPIDO">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia bloqueado"><Text style={runtimeTextStyles.body}>O Dia 018 precisa estar canonicamente concluído no servidor.</Text></RuntimeCard> : null}

      {controller.runtime?.status !== 'locked' && phase === 'threshold' ? (
        <RuntimeCard label="LIMIAR" title="Observar tecnicamente sem transformar gráfico em oráculo">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="QUATRO CAMADAS">Sinal acústico, percepção corporal, relato subjetivo e interpretação permanecem separados. O analisador não diagnostica estado cerebral nem comprova origem espiritual.</RuntimeNotice>
          <RuntimePrimary label="ABRIR A PRÁTICA" disabled={!canon || controller.busy} onPress={() => void (async () => { await controller.begin(); controller.nextPhase(); })()} />
        </RuntimeCard>
      ) : null}

      {phase === 'acoustic-lab' ? (
        <RuntimeCard label="ACOUSTIC LAB · LOCAL" title="Gravação de até três minutos">
          <Text style={runtimeTextStyles.body}>Registre as condições que afetam comparabilidade. A duração pretendida é contexto, não cronômetro compulsório; você pode encerrar antes e o hard-stop é 180 s.</Text>
          <Text style={styles.fieldLabel}>DISTÂNCIA APROXIMADA DO MICROFONE</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={distance === 'near'} label="< 10 CM" onPress={() => setDistance('near')} />
            <RuntimeChoice selected={distance === 'medium'} label="10–30 CM" onPress={() => setDistance('medium')} />
            <RuntimeChoice selected={distance === 'far'} label="> 30 CM" onPress={() => setDistance('far')} />
          </View>
          <Text style={styles.fieldLabel}>AMBIENTE</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={environment === 'quiet'} label="SILENCIOSO" onPress={() => setEnvironment('quiet')} />
            <RuntimeChoice selected={environment === 'normal'} label="NORMAL" onPress={() => setEnvironment('normal')} />
            <RuntimeChoice selected={environment === 'reverberant'} label="REVERBERANTE" onPress={() => setEnvironment('reverberant')} />
          </View>
          <Text style={styles.fieldLabel}>DURAÇÃO PRETENDIDA</Text>
          <View style={runtimeTextStyles.row}>{[30, 60, 120, 180].map((seconds) => <RuntimeChoice key={seconds} selected={intendedSeconds === seconds} label={`${seconds}s`} onPress={() => setIntendedSeconds(seconds)} />)}</View>
          <RuntimeScale label="INTENSIDADE VOCAL AUTOAVALIADA" value={selfIntensity} onChange={(value) => { setSelfIntensity(value); setIntensitySet(true); }} />
          {permission === 'denied' ? <RuntimeNotice title="MICROFONE RECUSADO">A leitura continua disponível e não há punição. A subatividade de gravação pode ser retomada depois.</RuntimeNotice> : null}
          {!captureActive && !recordingCreated ? <RuntimePrimary label="INICIAR CAPTURA LOCAL" disabled={!controlsReady} onPress={() => void startCapture()} /> : null}
          {captureActive ? (
            <View style={styles.capturePanel}>
              <Text style={styles.timer}>{Math.floor(liveDuration)}s / 180s</Text>
              <Text style={styles.captureMeta}>PCM · {aggregate.sampleRateHz} Hz · dBFS RELATIVO {aggregate.rmsDbfs.toFixed(1)}</Text>
              <SignalBars values={latest?.waveform ?? []} kind="waveform" />
              <View style={styles.controlRow}>
                <Pressable style={styles.controlButton} onPress={() => void togglePause()}><Text style={styles.controlText}>{paused ? 'CONTINUAR' : 'PAUSAR'}</Text></Pressable>
                <Pressable style={styles.controlButton} onPress={() => setSegmentMarkers((value) => value + 1)}><Text style={styles.controlText}>MARCAR TRECHO · {segmentMarkers}</Text></Pressable>
                <Pressable style={styles.stopButton} onPress={() => void stopCapture()}><Text style={styles.stopText}>ENCERRAR</Text></Pressable>
              </View>
            </View>
          ) : null}
          {recordingCreated ? (
            <>
              <RuntimeNotice title="ARQUIVO LOCAL">A gravação bruta permanece no cache local. O Practice Record não recebe URI nem áudio bruto.</RuntimeNotice>
              {recordingUri ? <AudioReplay key={recordingUri} uri={recordingUri} onDelete={() => void deleteRecording()} /> : <Text style={runtimeTextStyles.body}>Arquivo bruto apagado. As métricas acústicas estruturadas permanecem disponíveis para o selo.</Text>}
              <RuntimePrimary label="VER ANÁLISE" disabled={!latest} onPress={() => controller.nextPhase()} />
            </>
          ) : null}
        </RuntimeCard>
      ) : null}

      {phase === 'analysis' ? (
        <RuntimeCard label="ANÁLISE ACÚSTICA" title="Sinal mensurável · interpretação em aberto">
          <MetricGrid aggregate={aggregate} />
          <Text style={styles.fieldLabel}>WAVEFORM REAL · ÚLTIMA JANELA PCM</Text>
          <SignalBars values={latest?.waveform ?? []} kind="waveform" />
          <Text style={styles.fieldLabel}>ESPECTRO REAL · MAGNITUDE RELATIVA</Text>
          <SignalBars values={latest?.spectrum ?? []} kind="spectrum" />
          <RuntimeNotice title="LEITURA CORRETA">dBFS aqui é relativo ao ganho/dispositivo, não SPL calibrado. “Bin dominante” e “centroide espectral” descrevem o sinal; não detectam frequência espiritual, entidade, diagnóstico ou estado cerebral.</RuntimeNotice>
          {previous ? <Comparison current={aggregate} previous={previous} /> : <RuntimeNotice title="COMPARAÇÃO LONGITUDINAL">Nenhuma sessão anterior estruturada do Dia 019 foi encontrada. Revisitas poderão ser comparadas sem ranking.</RuntimeNotice>}
          <RuntimeScale label="OBSERVAÇÃO 1 · ESTABILIDADE PERCEBIDA" value={stability} onChange={(value) => { setStability(value); setStabilitySet(true); }} />
          <RuntimeScale label="OBSERVAÇÃO 2 · CONFORTO VOCAL" value={comfort} onChange={(value) => { setComfort(value); setComfortSet(true); }} />
          <Pressable style={[styles.ack, analysisAcknowledged && styles.ackSelected]} onPress={() => setAnalysisAcknowledged((value) => !value)}>
            <Text style={[styles.ackText, analysisAcknowledged && styles.ackTextSelected]}>{analysisAcknowledged ? '✓ ' : ''}LI A ANÁLISE COMO MEDIÇÃO ACÚSTICA, NÃO COMO PROVA ESPIRITUAL</Text>
          </Pressable>
          <RuntimePrimary label="RETORNAR AO AMBIENTE" disabled={!observationsReady || !analysisAcknowledged} onPress={() => {
            controller.setEvidence({ recording_created: true, analysis_viewed: true, observations_logged_count: 2, interpretation_held_open: true });
            controller.nextPhase();
          }} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="RETORNO" title="Fechar o laboratório antes do selo">
          <Text style={runtimeTextStyles.body}>Pare qualquer vocalização, mova mãos e pés, respire normalmente, olhe ao redor e confirme que a sessão terminou. Dor, falta de ar, vertigem, pânico, zumbido forte ou desconforto relevante encerram a prática.</Text>
          <RuntimePrimary label="ESTOU ORIENTADO E DE VOLTA" onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Somente métricas estruturadas saem do dispositivo">
          <RuntimeNotice title="PRIVACIDADE">O URI local e o áudio bruto não fazem parte de evidence/metrics. Apagar o arquivo não apaga o Practice Record.</RuntimeNotice>
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR ELEMIAH 4/5'} disabled={controller.busy} onPress={() => void (async () => {
            setLocalError(null);
            try {
              const distanceOrdinal = distance === 'near' ? 0 : distance === 'medium' ? 1 : 2;
              const environmentOrdinal = environment === 'quiet' ? 0 : environment === 'normal' ? 1 : 2;
              await controller.seal({
                durationSeconds: Math.round(aggregate.durationSeconds),
                evidence: { protocol_completed: true, return_confirmed: true, recording_created: true, analysis_viewed: true, observations_logged_count: 2, interpretation_held_open: true },
                metrics: {
                  duration_seconds: Math.round(aggregate.durationSeconds),
                  sample_rate_hz: aggregate.sampleRateHz,
                  rms_dbfs: Number(aggregate.rmsDbfs.toFixed(3)),
                  peak_dbfs: Number(aggregate.peakDbfs.toFixed(3)),
                  dominant_frequency_hz: Number(aggregate.dominantFrequencyHz.toFixed(3)),
                  spectral_centroid_hz: Number(aggregate.spectralCentroidHz.toFixed(3)),
                  distance_band_ordinal: distanceOrdinal,
                  environment_band_ordinal: environmentOrdinal,
                  intended_duration_seconds: intendedSeconds,
                  self_intensity_rating: selfIntensity,
                  stability_rating: stability,
                  vocal_comfort: comfort,
                  pause_markers: pauseMarkers,
                  segment_markers: segmentMarkers,
                  recording_deleted_before_seal: recordingDeleted,
                },
              });
              controller.nextPhase();
            } catch (cause) {
              setLocalError(cause instanceof Error ? cause.message : 'day019_seal_failed');
            }
          })()} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ELEMIAH 4/5" /> : null}
    </ScrollView>
  );
}

function AudioReplay({ uri, onDelete }: { uri: string; onDelete: () => void }) {
  const player = useAudioPlayer(uri, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  return (
    <View style={styles.replay}>
      <Text style={styles.replayTitle}>REPLAY LOCAL · {Math.floor(status.currentTime)}s / {Math.floor(status.duration || 0)}s</Text>
      <View style={styles.controlRow}>
        <Pressable style={styles.controlButton} onPress={() => status.playing ? player.pause() : player.play()}><Text style={styles.controlText}>{status.playing ? 'PAUSAR REPLAY' : 'OUVIR REPLAY'}</Text></Pressable>
        <Pressable style={styles.deleteButton} onPress={onDelete}><Text style={styles.deleteText}>APAGAR ÁUDIO BRUTO</Text></Pressable>
      </View>
    </View>
  );
}

function SignalBars({ values, kind }: { values: number[]; kind: 'waveform' | 'spectrum' }) {
  const fallback = Array.from({ length: kind === 'waveform' ? 48 : 36 }, () => 0);
  return (
    <View style={styles.bars} accessibilityLabel={`${kind} acústico medido`}>
      {(values.length ? values : fallback).map((value, index) => <View key={index} style={[styles.bar, { height: Math.max(2, 6 + Math.min(1, Math.abs(value)) * (kind === 'waveform' ? 54 : 72)) }]} />)}
    </View>
  );
}

function MetricGrid({ aggregate }: { aggregate: ReturnType<typeof aggregateResult> }) {
  const rows = [
    ['DURAÇÃO', `${aggregate.durationSeconds.toFixed(1)} s`],
    ['SAMPLE RATE', `${aggregate.sampleRateHz} Hz`],
    ['RMS RELATIVO', `${aggregate.rmsDbfs.toFixed(1)} dBFS`],
    ['PICO RELATIVO', `${aggregate.peakDbfs.toFixed(1)} dBFS`],
    ['BIN DOMINANTE', `${aggregate.dominantFrequencyHz.toFixed(1)} Hz`],
    ['CENTROIDE', `${aggregate.spectralCentroidHz.toFixed(1)} Hz`],
  ];
  return <View style={styles.metricGrid}>{rows.map(([label, value]) => <View key={label} style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>)}</View>;
}

function Comparison({ current, previous }: { current: ReturnType<typeof aggregateResult>; previous: PreviousSession }) {
  const delta = (now: number, before: number | null, unit: string) => before == null ? '—' : `${now - before >= 0 ? '+' : ''}${(now - before).toFixed(1)} ${unit}`;
  return (
    <RuntimeCard label="SESSÃO ANTERIOR" title="Comparação sem ranking">
      <Text style={runtimeTextStyles.body}>RMS relativo · Δ {delta(current.rmsDbfs, previous.rmsDbfs, 'dBFS')}</Text>
      <Text style={runtimeTextStyles.body}>Bin dominante · Δ {delta(current.dominantFrequencyHz, previous.dominantFrequencyHz, 'Hz')}</Text>
      <Text style={runtimeTextStyles.body}>Centroide · Δ {delta(current.spectralCentroidHz, previous.spectralCentroidHz, 'Hz')}</Text>
      <Text style={runtimeTextStyles.body}>Duração · Δ {delta(current.durationSeconds, previous.durationSeconds, 's')}</Text>
      <Text style={styles.compareFoot}>Diferença não significa melhora ou piora; ambiente, distância, dispositivo e intensidade vocal alteram comparabilidade.</Text>
    </RuntimeCard>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 100, gap: 16 },
  loading: { flex: 1, backgroundColor: '#030406', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.5 },
  header: { paddingVertical: 10 },
  eyebrow: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.6 },
  title: { color: '#f6eed4', fontSize: 29, fontWeight: '300', marginTop: 6 },
  source: { color: '#5f6168', fontSize: 8, letterSpacing: 1, marginTop: 6 },
  fieldLabel: { color: '#918666', fontSize: 8, letterSpacing: 1.2, marginTop: 4 },
  capturePanel: { borderWidth: 1, borderColor: '#3b3524', borderRadius: 18, padding: 15, gap: 12, backgroundColor: '#0b0b08' },
  timer: { color: '#f0dea1', fontSize: 26, fontVariant: ['tabular-nums'] },
  captureMeta: { color: '#7e765e', fontSize: 8, letterSpacing: 0.9 },
  controlRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  controlButton: { borderWidth: 1, borderColor: '#58513a', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 },
  controlText: { color: '#cbbd8d', fontSize: 8, letterSpacing: 0.9, fontWeight: '700' },
  stopButton: { borderWidth: 1, borderColor: '#744840', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 },
  stopText: { color: '#d9a59d', fontSize: 8, letterSpacing: 0.9, fontWeight: '700' },
  bars: { height: 86, flexDirection: 'row', alignItems: 'flex-end', gap: 2, borderWidth: 1, borderColor: '#24262a', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: '#050609', overflow: 'hidden' },
  bar: { flex: 1, minWidth: 2, borderRadius: 2, backgroundColor: '#cbb773', opacity: 0.82 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { flexGrow: 1, minWidth: 130, borderWidth: 1, borderColor: '#292a2f', borderRadius: 13, padding: 12, backgroundColor: '#06070a' },
  metricLabel: { color: '#696b72', fontSize: 7, letterSpacing: 1 },
  metricValue: { color: '#e3d7ae', fontSize: 13, marginTop: 4 },
  ack: { borderWidth: 1, borderColor: '#384449', borderRadius: 14, padding: 14, backgroundColor: '#080d0f' },
  ackSelected: { borderColor: '#687d75', backgroundColor: '#0c1512' },
  ackText: { color: '#87999e', fontSize: 9, lineHeight: 15, letterSpacing: 0.7 },
  ackTextSelected: { color: '#b8cec6' },
  replay: { borderWidth: 1, borderColor: '#313238', borderRadius: 15, padding: 14, gap: 10 },
  replayTitle: { color: '#a8a185', fontSize: 9, letterSpacing: 1 },
  deleteButton: { borderWidth: 1, borderColor: '#673e3a', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 },
  deleteText: { color: '#d0968e', fontSize: 8, letterSpacing: 0.9, fontWeight: '700' },
  compareFoot: { color: '#73767a', fontSize: 11, lineHeight: 18, marginTop: 4 },
});
