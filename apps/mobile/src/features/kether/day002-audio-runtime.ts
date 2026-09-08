import { Platform } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import {
  DAY002_AUDIO_PRESET_V1,
  createDay002AudioLoopWavBase64,
} from '@hnk/audio-contract';
import type { AudioRuntimePort, AudioRuntimeSnapshot, AudioRuntimeStatus } from '@hnk/quest-engine';

async function resolveDay002AudioSource(): Promise<string> {
  const base64 = createDay002AudioLoopWavBase64();
  if (Platform.OS === 'web') return `data:audio/wav;base64,${base64}`;
  if (!FileSystem.cacheDirectory) throw new Error('day002_audio_cache_unavailable');
  const uri = `${FileSystem.cacheDirectory}hnk-day002-audio-v1.wav`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export class Day002ExpoAudioRuntime implements AudioRuntimePort {
  private player: AudioPlayer | null = null;
  private started = false;
  private status: AudioRuntimeStatus = 'IDLE';
  private volume = 0.5;

  get profileId(): string {
    return DAY002_AUDIO_PRESET_V1.id;
  }

  snapshot(): AudioRuntimeSnapshot {
    return {
      profileId: this.profileId,
      status: this.status,
      started: this.started,
      volume: this.volume,
    };
  }

  async start(volume = 0.5): Promise<void> {
    this.volume = clampVolume(volume);
    try {
      let player = this.player;
      if (!player) {
        player = createAudioPlayer(await resolveDay002AudioSource());
        player.loop = true;
        this.player = player;
      }
      player.volume = this.volume;
      player.play();
      this.started = true;
      this.status = 'PLAYING';
    } catch (error) {
      this.status = 'ERROR';
      throw error;
    }
  }

  pause(): void {
    this.player?.pause();
    if (this.started) this.status = 'PAUSED';
  }

  resume(): void {
    this.player?.play();
    if (this.started) this.status = 'PLAYING';
  }

  setVolume(volume: number): void {
    this.volume = clampVolume(volume);
    if (this.player) this.player.volume = this.volume;
  }

  stop(): void {
    if (this.player) {
      try { this.player.pause(); } catch { /* noop */ }
      try { this.player.release(); } catch { /* noop */ }
      this.player = null;
    }
    this.status = 'STOPPED';
  }
}
