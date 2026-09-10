import { Platform } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import {
  DAY030_ASMR_AUDIO_PRESET_ID,
  DAY030_CONTROL_AUDIO_PRESET_ID,
  createDay030AudioLoopWavBase64,
  type Day030ProceduralCondition,
} from '@hnk/audio-contract/day030';
import type { AudioRuntimePort, AudioRuntimeSnapshot, AudioRuntimeStatus } from '@hnk/quest-engine';

const SOURCE_CACHE = new Map<Day030ProceduralCondition, string>();

async function resolveSource(condition: Day030ProceduralCondition): Promise<string> {
  const cached = SOURCE_CACHE.get(condition);
  if (cached) return cached;
  const base64 = createDay030AudioLoopWavBase64(condition);
  if (Platform.OS === 'web') {
    const uri = `data:audio/wav;base64,${base64}`;
    SOURCE_CACHE.set(condition, uri);
    return uri;
  }
  if (!FileSystem.cacheDirectory) throw new Error('day030_audio_cache_unavailable');
  const suffix = condition === 'ACTIVE_ASMR' ? 'asmr' : 'control';
  const uri = `${FileSystem.cacheDirectory}hnk-day030-${suffix}-v1.wav`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  SOURCE_CACHE.set(condition, uri);
  return uri;
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

class Day030ExpoProceduralAudioRuntime implements AudioRuntimePort {
  private player: AudioPlayer | null = null;
  private started = false;
  private status: AudioRuntimeStatus = 'IDLE';
  private volume = 0.5;

  constructor(
    readonly profileId: string,
    private readonly condition: Day030ProceduralCondition,
  ) {}

  snapshot(): AudioRuntimeSnapshot {
    return { profileId: this.profileId, status: this.status, started: this.started, volume: this.volume };
  }

  async start(volume = 0.5): Promise<void> {
    this.volume = clampVolume(volume);
    try {
      let player = this.player;
      if (!player) {
        player = createAudioPlayer(await resolveSource(this.condition));
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

export class Day030AsmrExpoAudioRuntime extends Day030ExpoProceduralAudioRuntime {
  constructor() { super(DAY030_ASMR_AUDIO_PRESET_ID, 'ACTIVE_ASMR'); }
}

export class Day030ControlExpoAudioRuntime extends Day030ExpoProceduralAudioRuntime {
  constructor() { super(DAY030_CONTROL_AUDIO_PRESET_ID, 'NEUTRAL_CONTROL'); }
}
