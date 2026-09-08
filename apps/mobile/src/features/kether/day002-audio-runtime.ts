import { Platform } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import {
  DAY002_AUDIO_PRESET_V1,
  createDay002AudioLoopWavBase64,
} from '@hnk/audio-contract';

async function resolveDay002AudioSource(): Promise<string> {
  const base64 = createDay002AudioLoopWavBase64();
  if (Platform.OS === 'web') return `data:audio/wav;base64,${base64}`;
  if (!FileSystem.cacheDirectory) throw new Error('day002_audio_cache_unavailable');
  const uri = `${FileSystem.cacheDirectory}hnk-day002-audio-v1.wav`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

export class Day002ExpoAudioRuntime {
  private player: AudioPlayer | null = null;
  private started = false;

  get profileId(): string {
    return DAY002_AUDIO_PRESET_V1.id;
  }

  get isStarted(): boolean {
    return this.started;
  }

  async start(volume = 0.5): Promise<void> {
    let player = this.player;
    if (!player) {
      player = createAudioPlayer(await resolveDay002AudioSource());
      player.loop = true;
      this.player = player;
    }
    player.volume = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0));
    player.play();
    this.started = true;
  }

  pause(): void {
    this.player?.pause();
  }

  resume(): void {
    this.player?.play();
  }

  setVolume(volume: number): void {
    if (this.player) this.player.volume = Math.max(0, Math.min(1, Number.isFinite(volume) ? volume : 0));
  }

  stop(): void {
    if (!this.player) return;
    try { this.player.pause(); } catch { /* noop */ }
    try { this.player.release(); } catch { /* noop */ }
    this.player = null;
  }
}
