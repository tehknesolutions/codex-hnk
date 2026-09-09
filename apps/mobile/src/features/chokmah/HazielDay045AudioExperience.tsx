import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import {
  HNK_HAZIEL_D045_ACTIVE_PRESET_V1,
  HNK_HAZIEL_D045_CONTROL_PRESET_V1,
  createHazielD045ActiveLoopWavBytes,
  createHazielD045ControlLoopWavBytes,
} from '@hnk/audio-contract';
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
  RuntimeTimer,
  runtimeTextStyles,
} from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { HAZIEL_DAY_045 } from './runtime-definitions/haziel';

const TARGET_SECONDS = 600;
const POST_SILENCE_SECONDS = 60;
const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBase64(bytes: Uint8Array): string {
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index] ?? 0;
    const hasB = index + 1 < bytes.length;
    const hasC = index + 2 < bytes.length;
    const b = hasB ? bytes[index + 1]! : 0;
    const c = hasC ? bytes[index + 2]! : 0;
    const value = (a << 16) | (b << 8) | c;
    output += BASE64[(value >> 18) & 63];
    output += BASE64[(value >> 12) & 63];
    output += hasB ? BASE64[(value >> 6) & 63] : '=';
    output += hasC ? BASE64[value & 63] : '=';
  }
  return output;
}

async function materializeWav(id: string, bytes: Uint8Array): Promise<string> {
  const base64 = bytesToBase64(bytes);
  if (Platform.OS === 'web') return `data:audio/wav;base64,${base64}`;
  if (!FileSystem.cacheDirectory) throw new Error('audio_cache_directory_unavailable');
  const uri = `${FileSystem.cacheDirectory}${id}.wav`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

function formatClock(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function HazielDay045AudioExperience() {
  const controller = useHnkDayRuntime(HAZIEL_DAY_045);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [volume, setVolume] = useState(4);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [postSilenceSeconds, setPostSilenceSeconds] = useState(0);
  const [activeCompleted, setActiveCompleted] = useState(false);
  const [controlCompleted, setControlCompleted] = useState(false);
  const [restConfirmed, setRestConfirmed] = useState(false);
  const [activeDistractions, setActiveDistractions] = useState(0);
  const [controlDistractions, setControlDistractions] = useState(0);
  const [activeFocus, setActiveFocus] = useState(5);
  const [controlFocus, setControlFocus] = useState(5);
  const [activeComfort, setActiveComfort] = useState(5);
  const [controlComfort, setControlComfort] = useState(5);
  const [activeSleepiness, setActiveSleepiness] = useState(5);
  const [controlSleepiness, setControlSleepiness] = useState(5);
  const [expectation, setExpectation] = useState(5);
  const [preferenceCode, setPreferenceCode] = useState<number | null>(null);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [groundingObjects, setGroundingObjects] = useState(0);

  const activePlayer = useAudioPlayer(null, { updateInterval: 250 });
  const controlPlayer = useAudioPlayer(null, { updateInterval: 250 });
  const activeStatus = useAudioPlayerStatus(activePlayer);
  const controlStatus = useAudioPlayerStatus(controlPlayer);
  const phase = controller.phase?.id;

  useEffect(() => {
    let mounted = true;
    setCanon(null);
    setCanonError(null);
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { mounted = false; };
    }
    void loadCanonicalDay(controller.auth.client, 45)
      .then((snapshot) => { if (mounted) setCanon(snapshot); })
      .catch((cause) => { if (mounted) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { mounted = false; };
  }, [controller.auth.client, controller.auth.phase]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        const [activeUri, controlUri] = await Promise.all([
          materializeWav(HNK_HAZIEL_D045_ACTIVE_PRESET_V1.id, createHazielD045ActiveLoopWavBytes()),
          materializeWav(HNK_HAZIEL_D045_CONTROL_PRESET_V1.id, createHazielD045ControlLoopWavBytes()),
        ]);
        if (!mounted) return;
        activePlayer.replace({ uri: activeUri, name: HNK_HAZIEL_D045_ACTIVE_PRESET_V1.id });
        controlPlayer.replace({ uri: controlUri, name: HNK_HAZIEL_D045_CONTROL_PRESET_V1.id });
        activePlayer.loop = true;
        controlPlayer.loop = true;
        setAudioReady(true);
      } catch (cause) {
        if (mounted) setLocalError(cause instanceof Error ? cause.message : 'haziel_audio_materialization_failed');
      }
    })();
    return () => {
      mounted = false;
      activePlayer.pause();
      controlPlayer.pause();
    };
  }, [activePlayer, controlPlayer]);

  useEffect(() => {
    const normalized = Math.max(0, Math.min(1, volume / 10));
    activePlayer.volume = normalized;
    controlPlayer.volume = normalized;
  }, [activePlayer, controlPlayer, volume]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        activePlayer.pause();
        controlPlayer.pause();
      }
    });
    return () => subscription.remove();
  }, [activePlayer, controlPlayer]);

  useEffect(() => {
    if (phase !== 'active-audio' || !activeStatus.playing || activeSeconds >= TARGET_SECONDS) return;
    const id = setInterval(() => setActiveSeconds((value) => Math.min(TARGET_SECONDS, value + 1)), 1000);
    return () => clearInterval(id);
  }, [activeSeconds, activeStatus.playing, phase]);

  useEffect(() => {
    if (activeSeconds < TARGET_SECONDS || activeCompleted) return;
    activePlayer.pause();
    setActiveCompleted(true);
  }, [activeCompleted, activePlayer, activeSeconds]);

  useEffect(() => {
    if (phase !== 'control-audio' || !controlStatus.playing || controlSeconds >= TARGET_SECONDS) return;
    const id = setInterval(() => setControlSeconds((value) => Math.min(TARGET_SECONDS, value + 1)), 1000);
    return () => clearInterval(id);
  }, [controlSeconds, controlStatus.playing, phase]);

  useEffect(() => {
    if (controlSeconds < TARGET_SECONDS || controlCompleted) return;
    controlPlayer.pause();
    setControlCompleted(true);
  }, [controlCompleted, controlPlayer, controlSeconds]);

  const stopPlayers = useCallback(() => {
    activePlayer.pause();
    controlPlayer.pause();
  }, [activePlayer, controlPlayer]);

  const safetyStop = useCallback(() => {
    stopPlayers();
    controller.interrupt({
      durationSeconds: activeSeconds + controlSeconds,
      evidence: { safety_stop: true },
      metrics: { active_seconds: activeSeconds, control_seconds: controlSeconds, volume_setting: volume },
    });
  }, [activeSeconds, controlSeconds, controller, stopPlayers, volume]);

  if (controller.loading) {
    return <View style={styles.loading}><Text style={styles.meta}>ABRINDO HAZIEL · DIA 045</Text></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · HAZIEL 4/5 · DIA 045</Text>
        <Text style={styles.title}>{canon?.title ?? 'SINTONIZADOR DIGITAL'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'CÂNONE SINCRONIZANDO'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O player não usa draft nem texto substituto. Sincronize o Dia 045 canônico para iniciar.</RuntimeNotice> : null}
      {controller.error || localError || activeStatus.error || controlStatus.error ? <RuntimeNotice title="ÁUDIO / RUNTIME">{localError ?? controller.error ?? activeStatus.error ?? controlStatus.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 045 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 044 canonicamente concluído no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="SAFETY STOP">A reprodução foi interrompida. O progresso anterior permanece; esta tentativa não concede XP. Retome somente quando estiver confortável.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="HAZIEL 4/5 · LIMIAR" title="Áudio como estímulo reproduzível, não medição cerebral">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="PRESET CANÔNICO">ACTIVE 432/444 Hz · diferença 12 Hz. CONTROL 432/432 Hz. Ambos usam WAV determinístico do `@hnk/audio-contract`. Nada aqui mede ou garante sincronização neural.</RuntimeNotice>
          <RuntimeScale label="VOLUME DO PLAYER" value={volume} onChange={setVolume} />
          <RuntimeNotice title="SEGURANÇA">Use volume confortável. Dor, irritação, zumbido persistente ou mal-estar encerram a sessão imediatamente. Fones são necessários apenas para perceber a diferença estéreo ACTIVE.</RuntimeNotice>
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label={audioReady ? 'INICIAR PRACTICE SESSION' : 'PREPARANDO WAV CANÔNICO…'} disabled={!canon || !audioReady || volume === 0 || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'active-audio' ? (
        <RuntimeCard label="ACTIVE · HNK-HAZIEL-D045-ACTIVE-V1" title="432 Hz esquerdo · 444 Hz direito · 12 Hz de diferença">
          <Text style={runtimeTextStyles.body}>Tempo reproduzido: {formatClock(activeSeconds)} / 10:00. O relógio só avança enquanto o player reporta playback ativo.</Text>
          <RuntimeScale label="VOLUME DO PLAYER" value={volume} onChange={setVolume} />
          <RuntimeCounter label="DISTRAÇÕES / RETORNOS MARCADOS" value={activeDistractions} onPress={() => setActiveDistractions((value) => value + 1)} />
          <RuntimeScale label="FOCO PERCEBIDO · ACTIVE" value={activeFocus} onChange={setActiveFocus} />
          <RuntimeScale label="CONFORTO · ACTIVE" value={activeComfort} onChange={setActiveComfort} />
          <RuntimeScale label="SONOLÊNCIA · ACTIVE" value={activeSleepiness} onChange={setActiveSleepiness} />
          <RuntimePrimary label={activeStatus.playing ? 'PAUSAR ACTIVE' : activeSeconds > 0 ? 'CONTINUAR ACTIVE' : 'INICIAR ACTIVE'} disabled={!audioReady || activeCompleted || volume === 0} onPress={() => activeStatus.playing ? activePlayer.pause() : activePlayer.play()} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="ENCERRAR ACTIVE E DESCANSAR" disabled={!activeCompleted} onPress={() => { stopPlayers(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'rest' ? (
        <RuntimeCard label="INTERVALO" title="Retirar os fones e interromper o estímulo">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="SEM CRONÔMETRO INVENTADO">O plano pede descanso antes do controle, mas não fixa uma duração. V1 exige confirmação consciente do intervalo sem fabricar um número canônico.</RuntimeNotice>
          <RuntimeChoice selected={restConfirmed} label="PAREI O ÁUDIO, RETIREI OS FONES E ESTOU CONFORTÁVEL PARA COMPARAR" onPress={() => setRestConfirmed((value) => !value)} />
          <RuntimePrimary label="ABRIR CONTROL" disabled={!restConfirmed} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control-audio' ? (
        <RuntimeCard label="CONTROL · HNK-HAZIEL-D045-CONTROL-V1" title="432 Hz esquerdo · 432 Hz direito · sem diferença ativa">
          <Text style={runtimeTextStyles.body}>Tempo reproduzido: {formatClock(controlSeconds)} / 10:00. Duração, carrier-base e envelope permanecem comparáveis ao ACTIVE.</Text>
          <RuntimeScale label="VOLUME DO PLAYER" value={volume} onChange={setVolume} />
          <RuntimeCounter label="DISTRAÇÕES / RETORNOS MARCADOS" value={controlDistractions} onPress={() => setControlDistractions((value) => value + 1)} />
          <RuntimeScale label="FOCO PERCEBIDO · CONTROL" value={controlFocus} onChange={setControlFocus} />
          <RuntimeScale label="CONFORTO · CONTROL" value={controlComfort} onChange={setControlComfort} />
          <RuntimeScale label="SONOLÊNCIA · CONTROL" value={controlSleepiness} onChange={setControlSleepiness} />
          <RuntimePrimary label={controlStatus.playing ? 'PAUSAR CONTROL' : controlSeconds > 0 ? 'CONTINUAR CONTROL' : 'INICIAR CONTROL'} disabled={!audioReady || controlCompleted || volume === 0} onPress={() => controlStatus.playing ? controlPlayer.pause() : controlPlayer.play()} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="ENCERRAR CONTROL" disabled={!controlCompleted} onPress={() => { stopPlayers(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'silence' ? (
        <RuntimeCard label="SILÊNCIO POSTERIOR" title="Um minuto sem áudio">
          <RuntimeTimer value={postSilenceSeconds} target={POST_SILENCE_SECONDS} onChange={setPostSilenceSeconds} />
          <RuntimeNotice title="E1 ≠ E3">O player está parado. O que surgir agora é experiência subjetiva/observação, não continuação técnica da frequência.</RuntimeNotice>
          <RuntimePrimary label="COMPARAR AS CONDIÇÕES" disabled={postSilenceSeconds < POST_SILENCE_SECONDS} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="COMPARAÇÃO" title="ACTIVE e CONTROL sem escolher uma explicação automática">
          <Text style={runtimeTextStyles.body}>ACTIVE: foco {activeFocus}/10 · conforto {activeComfort}/10 · sonolência {activeSleepiness}/10 · distrações {activeDistractions}.</Text>
          <Text style={runtimeTextStyles.body}>CONTROL: foco {controlFocus}/10 · conforto {controlComfort}/10 · sonolência {controlSleepiness}/10 · distrações {controlDistractions}.</Text>
          <RuntimeScale label="EXPECTATIVA ANTES/NA COMPARAÇÃO" value={expectation} onChange={setExpectation} />
          <Text style={styles.fieldLabel}>PREFERÊNCIA SUBJETIVA</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={preferenceCode === 1} label="ACTIVE" onPress={() => setPreferenceCode(1)} />
            <RuntimeChoice selected={preferenceCode === -1} label="CONTROL" onPress={() => setPreferenceCode(-1)} />
            <RuntimeChoice selected={preferenceCode === 0} label="SEM PREFERÊNCIA" onPress={() => setPreferenceCode(0)} />
          </View>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI AS DUAS CONDIÇÕES SEM TRATAR UMA COMO VENCEDORA OBJETIVA" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI PLAYBACK, EXPERIÊNCIA E HIPÓTESE NEUROLÓGICA/TEÚRGICA" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM SINTOMA DE SAFETY STOP AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={preferenceCode === null || !comparisonCompleted || !interpretationSeparated || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="RETURN GATE" title="Retirar os fones e localizar o ambiente">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={groundingObjects} onPress={() => setGroundingObjects((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="ESTOU ORIENTADO E DE VOLTA" disabled={groundingObjects < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Haziel 4/5 · Dia 045">
          <RuntimeNotice title="O QUE O SERVIDOR RECEBE">Somente evidência estrutural e métricas comparativas. O selo registra o que foi reproduzido e percebido; não registra uma conclusão sobre ondas cerebrais.</RuntimeNotice>
          <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 045 · +100 XP'} disabled={controller.busy} onPress={() => void controller.seal({
            durationSeconds: activeSeconds + controlSeconds + postSilenceSeconds,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              active_completed: activeCompleted,
              control_completed: controlCompleted,
              rest_confirmed: restConfirmed,
              post_silence_completed: postSilenceSeconds >= POST_SILENCE_SECONDS,
              comparison_completed: comparisonCompleted,
              interpretation_separated: interpretationSeparated,
              safety_clear: safetyClear,
              active_seconds: activeSeconds,
              control_seconds: controlSeconds,
              post_silence_seconds: postSilenceSeconds,
            },
            metrics: {
              active_left_hz: 432,
              active_right_hz: 444,
              active_difference_hz: 12,
              control_left_hz: 432,
              control_right_hz: 432,
              volume_setting: volume,
              active_focus: activeFocus,
              control_focus: controlFocus,
              active_comfort: activeComfort,
              control_comfort: controlComfort,
              active_sleepiness: activeSleepiness,
              control_sleepiness: controlSleepiness,
              active_distractions: activeDistractions,
              control_distractions: controlDistractions,
              expectation_rating: expectation,
              preference_code: preferenceCode ?? 0,
            },
          }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day045_seal_failed'))} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAZIEL 4/5" /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  content: { padding: 18, paddingBottom: 80, gap: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' },
  header: { gap: 7, paddingVertical: 8 },
  eyebrow: { color: '#7d9fbd', fontSize: 8, letterSpacing: 1.4, fontWeight: '700' },
  title: { color: '#edf6ff', fontSize: 25, lineHeight: 31, fontWeight: '300' },
  meta: { color: '#63798e', fontSize: 8, letterSpacing: 0.8 },
  fieldLabel: { color: '#8a9dad', fontSize: 8, letterSpacing: 1.1, marginTop: 4 },
});
