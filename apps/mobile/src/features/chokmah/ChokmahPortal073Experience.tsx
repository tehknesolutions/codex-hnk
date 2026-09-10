import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import {
  HNK_PORTAL073_ACTIVE_PRESET_V1,
  createPortal073ActiveLoopWavBytes,
} from '@hnk/audio-contract';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import {
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
import { MagicianMercurySigilV1, MAGICIAN_MERCURY_SIGIL_SHA256 } from './MagicianMercurySigilV1';
import {
  CHOKMAH_PORTAL_073,
  PORTAL073_PRODUCTION_ENABLED,
  PORTAL073_SCHEMA_VERSION,
  PORTAL073_SIGIL_ID,
  PORTAL073_TRANSITION_PRESET_ID,
  PORTAL073_TUNER_ID,
} from './runtime-definitions/portal073';

const TARGET_SECONDS = 600;
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

async function materializePortal073Wav(): Promise<string> {
  const base64 = bytesToBase64(createPortal073ActiveLoopWavBytes());
  if (Platform.OS === 'web') return `data:audio/wav;base64,${base64}`;
  if (!FileSystem.cacheDirectory) throw new Error('audio_cache_directory_unavailable');
  const uri = `${FileSystem.cacheDirectory}${HNK_PORTAL073_ACTIVE_PRESET_V1.id}.wav`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

function formatClock(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function ChokmahPortal073Experience() {
  const controller = useHnkDayRuntime(CHOKMAH_PORTAL_073);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [volume, setVolume] = useState(4);
  const [audioSeconds, setAudioSeconds] = useState(0);
  const [tunerCompleted, setTunerCompleted] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState(false);
  const [inductionCompleted, setInductionCompleted] = useState(false);
  const [sigilCompleted, setSigilCompleted] = useState(false);
  const [orientationRestored, setOrientationRestored] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [groundingObjects, setGroundingObjects] = useState(0);
  const [diary, setDiary] = useState('');
  const [vaultReceipt, setVaultReceipt] = useState<string | null>(null);
  const [vaultChecksum, setVaultChecksum] = useState<string | null>(null);

  const player = useAudioPlayer(null, { updateInterval: 250 });
  const playerStatus = useAudioPlayerStatus(player);
  const phase = controller.phase?.id;
  const productionEnabled = Boolean(PORTAL073_PRODUCTION_ENABLED);
  const operatorIdsVerified = useMemo(() => (
    PORTAL073_TUNER_ID === 'HNK-ANGELIC-TUNER-D073-V1'
    && PORTAL073_TRANSITION_PRESET_ID === HNK_PORTAL073_ACTIVE_PRESET_V1.id
    && PORTAL073_SIGIL_ID === 'HNK-REF-MAGICIAN-MERCURY-V1'
  ), []);

  useEffect(() => {
    let mounted = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { mounted = false; };
    void loadCanonicalDay(controller.auth.client, 73)
      .then((snapshot) => { if (mounted) setCanon(snapshot); })
      .catch((cause) => { if (mounted) setLocalError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { mounted = false; };
  }, [controller.auth.client, controller.auth.phase]);

  useEffect(() => {
    let mounted = true;
    if (!productionEnabled) return () => { mounted = false; };
    void (async () => {
      try {
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
        const uri = await materializePortal073Wav();
        if (!mounted) return;
        player.replace({ uri, name: HNK_PORTAL073_ACTIVE_PRESET_V1.id });
        player.loop = true;
        setAudioReady(true);
      } catch (cause) {
        if (mounted) setLocalError(cause instanceof Error ? cause.message : 'portal073_audio_materialization_failed');
      }
    })();
    return () => {
      mounted = false;
      player.pause();
    };
  }, [player, productionEnabled]);

  useEffect(() => {
    player.volume = Math.max(0, Math.min(1, volume / 10));
  }, [player, volume]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') player.pause();
    });
    return () => subscription.remove();
  }, [player]);

  useEffect(() => {
    if (phase !== 'audio' || !playerStatus.playing || audioSeconds >= TARGET_SECONDS) return;
    const id = setInterval(() => setAudioSeconds((value) => Math.min(TARGET_SECONDS, value + 1)), 1000);
    return () => clearInterval(id);
  }, [audioSeconds, phase, playerStatus.playing]);

  useEffect(() => {
    if (audioSeconds < TARGET_SECONDS || audioCompleted) return;
    player.pause();
    setTunerCompleted(true);
    setAudioCompleted(true);
  }, [audioCompleted, audioSeconds, player]);

  const safetyStop = useCallback(() => {
    player.pause();
    controller.interrupt({
      durationSeconds: audioSeconds,
      evidence: { safety_stop: true },
      metrics: { audio_seconds: audioSeconds, volume_setting: volume },
    });
  }, [audioSeconds, controller, player, volume]);

  const saveVault = async () => {
    if (!controller.auth.client || !controller.auth.userId || diary.trim().length < 2) return;
    try {
      const encrypted = await encryptVaultText({
        userId: controller.auth.userId,
        day: 73,
        kind: 'portal073-synchronicity-diary',
        plaintext: JSON.stringify({ schema: 'hnk-portal073-vault-v1', diary: diary.trim() }),
      });
      const entry = await saveEncryptedVaultEntry(controller.auth.client, { day: 73, payload: encrypted });
      setVaultReceipt(entry.id);
      setVaultChecksum(encrypted.checksumSha256);
      setDiary('');
      controller.nextPhase();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'portal073_vault_failed');
    }
  };

  const sealPortal = async () => {
    if (!vaultReceipt || !vaultChecksum) return;
    try {
      await controller.seal({
        durationSeconds: audioSeconds,
        localRecordHash: vaultChecksum,
        evidence: {
          protocol_completed: true,
          tuner_completed: tunerCompleted,
          transition_audio_completed: audioCompleted,
          induction_completed: inductionCompleted,
          sigil_completed: sigilCompleted,
          operator_ids_verified: operatorIdsVerified,
          volume_control_available: true,
          immediate_stop_available: true,
          return_confirmed: orientationRestored,
          vault_saved: Boolean(vaultReceipt),
          safety_clear: safetyClear,
          audio_seconds: audioSeconds,
        },
        portalRemoteEvidence: {
          schema_version: PORTAL073_SCHEMA_VERSION,
          tuner_preset_id: PORTAL073_TUNER_ID,
          transition_preset_id: PORTAL073_TRANSITION_PRESET_ID,
          sigil_asset_id: PORTAL073_SIGIL_ID,
          induction_completed: inductionCompleted,
          return_gate_confirmed: orientationRestored,
          vault_receipt: vaultReceipt,
          tuner_completed: tunerCompleted,
          transition_audio_completed: audioCompleted,
          sigil_completed: sigilCompleted,
          operator_ids_verified: operatorIdsVerified,
          volume_control_available: true,
          immediate_stop_available: true,
          safety_clear: safetyClear,
          audio_seconds: audioSeconds,
        },
        metrics: { audio_seconds: audioSeconds, volume_setting: volume },
      });
      controller.nextPhase();
    } catch (cause) {
      setLocalError(cause instanceof Error ? cause.message : 'portal073_seal_failed');
    }
  };

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO PORTAL 073</Text></View>;

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.eyebrow}>CHOKMAH · PORTAL 2/2 · DIA 073</Text>
      <Text style={styles.title}>{canon?.title ?? 'O VOO DO MAGO'}</Text>
      <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)} · +${canon.xp} XP` : 'CÂNONE SINCRONIZANDO'}</Text>
    </View>

    {controller.error || localError || playerStatus.error ? <RuntimeNotice title="PORTAL / RUNTIME">{localError ?? controller.error ?? playerStatus.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="SEQUÊNCIA" title="Portal bloqueado"><Text style={runtimeTextStyles.body}>A primeira conclusão exige os 36 Days 037–072 confirmados pelo servidor.</Text></RuntimeCard> : null}

    {!productionEnabled ? <RuntimeCard label="G7/G8 · FAIL-CLOSED" title="Operadores aprovados; publicação ainda bloqueada">
      <RuntimeNotice title="NENHUM XP / NENHUMA PROMOÇÃO">A arquitetura final está vinculada aos operadores canônicos, mas `begin()` permanece inacessível enquanto o server operator set estiver apenas `approved`. Isso impede uma promoção teatral antes do E2E.</RuntimeNotice>
      <Text style={runtimeTextStyles.body}>Tuner · {PORTAL073_TUNER_ID}</Text>
      <Text style={runtimeTextStyles.body}>ACTIVE · {PORTAL073_TRANSITION_PRESET_ID} · 528/532 Hz · 600 s</Text>
      <Text style={runtimeTextStyles.body}>Sigilo · {PORTAL073_SIGIL_ID} · SHA-256 {MAGICIAN_MERCURY_SIGIL_SHA256.slice(0, 16)}…</Text>
      <Text style={runtimeTextStyles.body}>Dave Elman · checkpoint obrigatório; nenhum roteiro novo foi inventado.</Text>
      <MagicianMercurySigilV1 />
    </RuntimeCard> : null}

    {productionEnabled && controller.runtime?.status !== 'locked' && phase === 'threshold' ? <RuntimeCard label="PRE-FLIGHT" title="O Portal só inicia com os operadores canônicos">
      <RuntimeNotice title="OPERADORES V1">Tuner {PORTAL073_TUNER_ID}. ACTIVE 528/532 Hz. Sigilo {PORTAL073_SIGIL_ID}. Sem autoplay; volume e stop permanecem sob controle do usuário.</RuntimeNotice>
      <RuntimeScale label="VOLUME DO PLAYER" value={volume} onChange={setVolume} />
      <RuntimeChoice selected={operatorIdsVerified} label="IDS CANÔNICOS V1 VINCULADOS AO RUNTIME" onPress={() => undefined} />
      <RuntimePrimary label={audioReady ? 'INICIAR PORTAL' : 'PREPARANDO ÁUDIO CANÔNICO…'} disabled={!canon || !audioReady || !operatorIdsVerified || volume === 0 || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
    </RuntimeCard> : null}

    {productionEnabled && phase === 'audio' ? <RuntimeCard label={`SINTONIZADOR · ${PORTAL073_TUNER_ID}`} title="Chokmah → Binah · ACTIVE 528/532 Hz">
      <Text style={runtimeTextStyles.body}>Playback real: {formatClock(audioSeconds)} / 10:00. O contador avança somente enquanto `expo-audio` reporta reprodução ativa.</Text>
      <RuntimeScale label="VOLUME DO PLAYER" value={volume} onChange={setVolume} />
      <RuntimePrimary label={playerStatus.playing ? 'PAUSAR' : audioSeconds > 0 ? 'CONTINUAR' : 'INICIAR ÁUDIO'} disabled={!audioReady || audioCompleted || volume === 0} onPress={() => playerStatus.playing ? player.pause() : player.play()} />
      <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
      <RuntimePrimary label="DAVE ELMAN" disabled={!tunerCompleted || !audioCompleted || audioSeconds !== 600} onPress={controller.nextPhase} />
    </RuntimeCard> : null}

    {productionEnabled && phase === 'induction' ? <RuntimeCard label="CHECKPOINT" title="Autoindução Dave Elman">
      <RuntimeNotice title="SEM TEXTO INVENTADO">O cânone exige Dave Elman, mas o freeze atual não fornece um roteiro textual canônico. Execute apenas a técnica já conhecida/aprovada; este runtime registra o checkpoint sem fabricar palavras.</RuntimeNotice>
      <RuntimeChoice selected={inductionCompleted} label="EXECUTEI E ENCERREI A AUTOINDUÇÃO DAVE ELMAN COM CONTROLE VOLUNTÁRIO" onPress={() => setInductionCompleted((value) => !value)} />
      <RuntimePrimary label="SIGILO DO MAGO" disabled={!inductionCompleted} onPress={controller.nextPhase} />
    </RuntimeCard> : null}

    {productionEnabled && phase === 'sigil' ? <RuntimeCard label={PORTAL073_SIGIL_ID} title="Mago = Mercúrio · master HNK V1">
      <MagicianMercurySigilV1 />
      <RuntimeNotice title="ORIENTAÇÃO">Upright. Não espelhar. A imagem é operador simbólico; intensidade subjetiva não prova mecanismo externo.</RuntimeNotice>
      <RuntimeChoice selected={sigilCompleted} label="CONTEMPLEI / ATIVEI O SIGILO CANÔNICO E ENCERREI A ETAPA" onPress={() => setSigilCompleted((value) => !value)} />
      <RuntimePrimary label="RETURN GATE" disabled={!sigilCompleted} onPress={() => { player.pause(); controller.nextPhase(); }} />
    </RuntimeCard> : null}

    {productionEnabled && phase === 'return' ? <RuntimeCard label="RETURN GATE" title="Encerrar a prática antes do Vault">
      <RuntimeCounter label="ELEMENTOS REAIS NOMEADOS" value={groundingObjects} onPress={() => setGroundingObjects((value) => Math.min(5, value + 1))} />
      <RuntimeChoice selected={orientationRestored} label="ÁUDIO PARADO, INDUÇÃO ENCERRADA, LOCALIZAÇÃO E ORIENTAÇÃO RESTAURADAS" onPress={() => setOrientationRestored((value) => !value)} />
      <RuntimeChoice selected={safetyClear} label="SEM ESTADO DE SEGURANÇA BLOQUEANTE" onPress={() => setSafetyClear((value) => !value)} />
      <RuntimePrimary label="CONFIRMAR RETORNO" disabled={groundingObjects < 5 || !orientationRestored || !safetyClear} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard> : null}

    {productionEnabled && phase === 'vault' ? <RuntimeCard label="VAULT CIFRADO" title="Diário de sincronicidades">
      <RuntimeNotice title="PRIVACIDADE">O plaintext é cifrado no cliente antes do upload. O evidence recebe somente o `vault_receipt` da linha cifrada; nenhuma anotação entra em analytics, metrics ou logs.</RuntimeNotice>
      <TextInput value={diary} onChangeText={setDiary} placeholder="Anotações privadas · serão cifradas antes da persistência" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} multiline />
      <RuntimePrimary label={vaultReceipt ? 'VAULT RECEBIDO' : 'CIFRAR E ENVIAR'} disabled={Boolean(vaultReceipt) || diary.trim().length < 2} onPress={() => void saveVault()} />
    </RuntimeCard> : null}

    {productionEnabled && phase === 'seal' ? <RuntimeCard label="AUTORIDADE SERVER-SIDE" title="+500 XP · Iniciado → Teurgo">
      <RuntimeNotice title="ATÔMICO E IDEMPOTENTE">O cliente não fornece XP nem Grau. O backend só confirma Teurgo depois de validar sequência 037–072, operator set published, evidence V1, Vault receipt e Return Gate.</RuntimeNotice>
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR PORTAL 073'} disabled={controller.busy || !vaultReceipt || !vaultChecksum || !tunerCompleted || !audioCompleted || !inductionCompleted || !sigilCompleted || !orientationRestored || !safetyClear || audioSeconds !== 600} onPress={() => void sealPortal()} />
    </RuntimeCard> : null}

    {productionEnabled && phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="CHOKMAH → BINAH · TEURGO" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020308' },
  content: { padding: 24, gap: 18, paddingBottom: 52 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020308' },
  header: { gap: 6 },
  eyebrow: { color: '#a289a9', fontSize: 8, letterSpacing: 1.5 },
  title: { color: '#fff2fb', fontSize: 25, lineHeight: 31, fontWeight: '300' },
  meta: { color: '#8c7890', fontSize: 8, letterSpacing: 0.8 },
});
