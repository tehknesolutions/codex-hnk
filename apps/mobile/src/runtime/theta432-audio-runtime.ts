import { Platform } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import {
  HNK_THETA432_AUDIO_PRESET_V1,
  createTheta432AudioLoopWavBase64,
} from '@hnk/audio-contract/theta432';
import type { AudioRuntimePort, AudioRuntimeSnapshot } from '@hnk/quest-engine';

async function resolveTheta432AudioSource(): Promise<string> {
  const base64 = createTheta432AudioLoopWavBase64();
  if (Platform.OS === 'web') return `data:audio/wav;base64,${base64}`;
  if (!FileSystem.cacheDirectory) throw new Error('theta432_audio_cache_unavailable');
  const uri = `${FileSystem.cacheDirectory}hnk-theta432-binaural-v1.wav`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export class Theta432ExpoAudioRuntime implements AudioRuntimePort {
  readonly profileId = HNK_THETA432_AUDIO_PRESET_V1.id;
  private player: AudioPlayer | null = null;
  private state: AudioRuntimeSnapshot['state'] = 'idle';
  private volume = 0.5;

  snapshot(): AudioRuntimeSnapshot {
    return { profileId: this.profileId, state: this.state, volume: this.volume };
  }

  async start(volume = this.volume): Promise<void> {
    this.volume = clampVolume(volume);
    let player = this.player;
    if (!player) {
      player = createAudioPlayer(await resolveTheta432AudioSource());
      player.loop = true;
      this.player = player;
    }
    player.volume = this.volume;
    player.play();
    this.state = 'playing';
  }

  pause(): void {
    this.player?.pause();
    if (this.player) this.state = 'paused';
  }

  resume(): void {
    this.player?.play();
    if (this.player) this.state = 'playing';
  }

  setVolume(volume: number): void {
    this.volume = clampVolume(volume);
    if (this.player) this.player.volume = this.volume;
  }

  stop(): void {
    if (!this.player) {
      this.state = 'stopped';
      return;
    }
    try { this.player.pause(); } catch { /* noop */ }
    try { this.player.release(); } catch { /* noop */ }
    this.player = null;
    this.state = 'stopped';
  }
}
