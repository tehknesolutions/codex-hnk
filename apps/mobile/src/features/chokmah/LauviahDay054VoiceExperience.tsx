import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import {
  CanonicalText,
  RuntimeCard,
  RuntimeChoice,
  RuntimeCompletion,
  RuntimeCounter,
  RuntimeNotice,
  RuntimePrimary,
  RuntimeScale,
  runtimeTextStyles,
} from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { LAUVIAH_DAY_054 } from './runtime-definitions/lauviah';

const recordingOptions = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

type RecordingMode = 'idle' | 'active' | 'control';

function summarize(samples: number[]) {
  if (!samples.length) return { meanDb: null as number | null, peakDb: null as number | null };
  return {
    meanDb: Math.round((samples.reduce((sum, value) => sum + value, 0) / samples.length) * 10) / 10,
    peakDb: Math.round(Math.max(...samples) * 10) / 10,
  };
}

export function LauviahDay054VoiceExperience() {
  const controller = useHnkDayRuntime(LAUVIAH_DAY_054);
  const recorder = useAudioRecorder(recordingOptions);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [script, setScript] = useState('');
  const [targets, setTargets] = useState(['']);
  const [mode, setMode] = useState<RecordingMode>('idle');
  const [activeSamples, setActiveSamples] = useState<number[]>([]);
  const [controlSamples, setControlSamples] = useState<number[]>([]);
  const [activeUri, setActiveUri] = useState<string | null>(null);
  const [controlUri, setControlUri] = useState<string | null>(null);
  const [activeCompleted, setActiveCompleted] = useState(false);
  const [controlCompleted, setControlCompleted] = useState(false);
  const [inflexionCompared, setInflexionCompared] = useState(false);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [consentOnly, setConsentOnly] = useState(false);
  const [subconsciousNotClaimed, setSubconsciousNotClaimed] = useState(false);
  const [rawAudioDeleted, setRawAudioDeleted] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [comfort, setComfort] = useState(5);
  const [objectsNamed, setObjectsNamed] = useState(0);

  const activeMetrics = useMemo(() => summarize(activeSamples), [activeSamples]);
  const controlMetrics = useMemo(() => summarize(controlSamples), [controlSamples]);
  const targetCount = targets.filter((value) => value.trim().length > 0).length;

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 54)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  useEffect(() => {
    void (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        setPermissionGranted(status.granted);
        if (status.granted) await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      } catch {
        setPermissionGranted(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!recorderState.isRecording || typeof recorderState.metering !== 'number') return;
    if (mode === 'active') setActiveSamples((values) => [...values, recorderState.metering as number]);
    if (mode === 'control') setControlSamples((values) => [...values, recorderState.metering as number]);
  }, [recorderState.isRecording, recorderState.metering, mode]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO LAUVIAH · DIA 054</Text></View>;
  const phase = controller.phase?.id;

  const startRecording = async (nextMode: Exclude<RecordingMode, 'idle'>) => {
    if (!permissionGranted || recorderState.isRecording) return;
    setLocalError(null);
    try {
      if (nextMode === 'active') setActiveSamples([]);
      else setControlSamples([]);
      setMode(nextMode);
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (cause) {
      setMode('idle');
      setLocalError(cause instanceof Error ? cause.message : 'day054_record_start_failed');
    }
  };

  const stopRecording = async () => {
    if (!recorderState.isRecording || mode === 'idle') return;
    setLocalError(null);
    try {
      const completedMode = mode;
      await recorder.stop();
      const uri = recorder.uri;
      if (!uri) throw new Error('day054_recording_uri_missing');
      if (completedMode === 'active') {
        setActiveUri(uri);
        setActiveCompleted(true);
      } else {
        setControlUri(uri);
        setControlCompleted(true);
      }
      setMode('idle');
      controller.nextPhase();
    } catch (cause) {
      setMode('idle');
      setLocalError(cause instanceof Error ? cause.message : 'day054_record_stop_failed');
    }
  };

  const deleteRawAudio = async () => {
    setLocalError(null);
    try {
      for (const uri of [activeUri, controlUri]) {
        if (uri) await FileSystem.deleteAsync(uri, { idempotent: true });
      }
      setRawAudioDeleted(true);
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'day054_audio_delete_failed');
    }
  };

  const safetyStop = () => {
    if (recorderState.isRecording) void recorder.stop().catch(() => undefined);
    setMode('idle');
    return controller.interrupt({ durationSeconds: 0, evidence: { safety_stop: true }, metrics: { comfort } });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · LAUVIAH 3/5 · DIA 054</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não inventa script, marcação ou técnica vocal substituta.</RuntimeNotice> : null}
      {permissionGranted === false ? <RuntimeNotice title="MICROFONE NEGADO">O Dia 054 permanece fechado. Nenhum XP é concedido sem a gravação local consentida.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 054 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 053 confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Dor, rouquidão, tontura ou esforço laríngeo encerram a tentativa.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="LAUVIAH 3/5" title="Voz local · consentida · sem promessa subliminar">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="PRIVACIDADE">O áudio bruto permanece no dispositivo e será apagado antes do selo. O servidor recebe somente flags e métricas numéricas.</RuntimeNotice>
          <RuntimePrimary label="INICIAR" disabled={!canon || !permissionGranted || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'script' ? (
        <RuntimeCard label="PRÉ-REGISTRO" title="Script curto + palavras-alvo declaradas antes de gravar">
          <TextInput value={script} onChangeText={setScript} multiline placeholder="Script curto · permanece apenas nesta sessão local" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
          {targets.map((value, index) => <TextInput key={index} value={value} onChangeText={(next) => setTargets((items) => items.map((item, i) => i === index ? next : item))} placeholder={`Palavra-alvo ${index + 1}`} placeholderTextColor="#666971" style={runtimeTextStyles.input} />)}
          <RuntimeCounter label="ADICIONAR PALAVRA-ALVO" value={targetCount} onPress={() => setTargets((items) => items.length < 6 ? [...items, ''] : items)} />
          <RuntimeChoice selected={consentOnly} label="ESTA É MINHA PRÓPRIA VOZ OU HÁ CONSENTIMENTO EXPLÍCITO" onPress={() => setConsentOnly((value) => !value)} />
          <RuntimePrimary label="GRAVAR CONDIÇÃO ACTIVE" disabled={script.trim().length < 12 || targetCount < 1 || !consentOnly} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'active-record' ? (
        <RuntimeCard label="ACTIVE" title="Script com ênfase tonal discreta nas palavras-alvo">
          <RuntimeScale label="CONFORTO VOCAL" value={comfort} onChange={setComfort} />
          <Text style={runtimeTextStyles.body}>Metering local: {typeof recorderState.metering === 'number' ? `${recorderState.metering.toFixed(1)} dB` : 'aguardando sinal'}.</Text>
          <RuntimePrimary label={recorderState.isRecording && mode === 'active' ? 'PARAR ACTIVE' : 'INICIAR ACTIVE'} onPress={() => recorderState.isRecording ? void stopRecording() : void startRecording('active')} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
        </RuntimeCard>
      ) : null}

      {phase === 'control-record' ? (
        <RuntimeCard label="CONTROL" title="Mesmo script · prosódia neutra">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <Text style={runtimeTextStyles.body}>Metering local: {typeof recorderState.metering === 'number' ? `${recorderState.metering.toFixed(1)} dB` : 'aguardando sinal'}.</Text>
          <RuntimePrimary label={recorderState.isRecording && mode === 'control' ? 'PARAR CONTROL' : 'INICIAR CONTROL'} onPress={() => recorderState.isRecording ? void stopRecording() : void startRecording('control')} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="ANÁLISE LOCAL" title="Envelope acústico + escuta crítica da própria execução">
          <Text style={runtimeTextStyles.body}>ACTIVE: média {activeMetrics.meanDb ?? 'n/a'} dB · pico {activeMetrics.peakDb ?? 'n/a'} dB. CONTROL: média {controlMetrics.meanDb ?? 'n/a'} dB · pico {controlMetrics.peakDb ?? 'n/a'} dB.</Text>
          <RuntimeNotice title="LIMITE DA MÉTRICA">V1 mede envelope/nível do microfone. Não é análise de pitch, emoção, intenção nem acesso ao subconsciente.</RuntimeNotice>
          <RuntimeChoice selected={inflexionCompared} label="COMPAREI INFLEXÃO E NATURALIDADE SEM TRATAR ISSO COMO MÉTRICA OBJETIVA" onPress={() => setInflexionCompared((value) => !value)} />
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI ACTIVE E CONTROL" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI DIFERENÇA ACÚSTICA DE INTERPRETAÇÃO" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={subconsciousNotClaimed} label="NÃO AFIRMEI ACESSO GARANTIDO AO SUBCONSCIENTE" onPress={() => setSubconsciousNotClaimed((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM DOR, ROUQUIDÃO, TONTURA OU ESFORÇO AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label={rawAudioDeleted ? 'ÁUDIO BRUTO APAGADO' : 'APAGAR ÁUDIO BRUTO LOCAL'} disabled={!activeCompleted || !controlCompleted || rawAudioDeleted} onPress={() => void deleteRawAudio()} />
          <RuntimePrimary label="GROUNDING" disabled={!inflexionCompared || !comparisonCompleted || !interpretationSeparated || !subconsciousNotClaimed || !safetyClear || !rawAudioDeleted || activeMetrics.meanDb == null || controlMetrics.meanDb == null} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Descansar voz e retornar ao ambiente">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Lauviah 3/5">
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 054'} disabled={controller.busy || !rawAudioDeleted} onPress={() => void controller.seal({
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              script_prepared: script.trim().length >= 12,
              targets_predeclared: targetCount >= 1,
              active_recording_completed: activeCompleted,
              control_recording_completed: controlCompleted,
              local_analysis_completed: activeMetrics.meanDb != null && controlMetrics.meanDb != null,
              raw_audio_not_uploaded: true,
              comparison_completed: comparisonCompleted,
              interpretation_separated: interpretationSeparated,
              consent_only: consentOnly,
              subconscious_access_not_claimed: subconsciousNotClaimed,
              safety_clear: safetyClear,
              target_words_marked: targetCount,
            },
            metrics: {
              active_mean_db: activeMetrics.meanDb,
              active_peak_db: activeMetrics.peakDb,
              control_mean_db: controlMetrics.meanDb,
              control_peak_db: controlMetrics.peakDb,
              raw_audio_deleted: rawAudioDeleted,
              comfort,
            },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day054_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="LAUVIAH 3/5" /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  content: { padding: 24, gap: 18, paddingBottom: 52 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' },
  header: { gap: 6, marginBottom: 4 },
  eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 },
  title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' },
  meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 },
});
