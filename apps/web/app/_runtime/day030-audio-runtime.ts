'use client';

import {
  DAY030_ASMR_AUDIO_PRESET_ID,
  DAY030_CONTROL_AUDIO_PRESET_ID,
  createDay030AudioLoopWavBase64,
  type Day030ProceduralCondition,
} from '@hnk/audio-contract/day030';
import type { AudioRuntimePort, AudioRuntimeSnapshot, AudioRuntimeStatus } from '@hnk/quest-engine';

const DATA_URIS = new Map<Day030ProceduralCondition, string>();

function sourceFor(condition: Day030ProceduralCondition): string {
  const cached = DATA_URIS.get(condition);
  if (cached) return cached;
  const uri = `data:audio/wav;base64,${createDay030AudioLoopWavBase64(condition)}`;
  DATA_URIS.set(condition, uri);
  return uri;
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

class Day030WebProceduralAudioRuntime implements AudioRuntimePort {
  private audio: HTMLAudioElement | null = null;
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
      let audio = this.audio;
      if (!audio) {
        audio = new Audio(sourceFor(this.condition));
        audio.loop = true;
        audio.preload = 'auto';
        this.audio = audio;
      }
      audio.volume = this.volume;
      await audio.play();
      this.started = true;
      this.status = 'PLAYING';
    } catch (error) {
      this.status = 'ERROR';
      throw error;
    }
  }

  pause(): void {
    this.audio?.pause();
    if (this.started) this.status = 'PAUSED';
  }

  async resume(): Promise<void> {
    if (this.audio) await this.audio.play();
    if (this.started) this.status = 'PLAYING';
  }

  setVolume(volume: number): void {
    this.volume = clampVolume(volume);
    if (this.audio) this.audio.volume = this.volume;
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
      this.audio.load();
      this.audio = null;
    }
    this.status = 'STOPPED';
  }
}

export class Day030AsmrWebAudioRuntime extends Day030WebProceduralAudioRuntime {
  constructor() { super(DAY030_ASMR_AUDIO_PRESET_ID, 'ACTIVE_ASMR'); }
}

export class Day030ControlWebAudioRuntime extends Day030WebProceduralAudioRuntime {
  constructor() { super(DAY030_CONTROL_AUDIO_PRESET_ID, 'NEUTRAL_CONTROL'); }
}
