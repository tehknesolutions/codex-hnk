'use client';

import { HNK_THETA432_AUDIO_PRESET_V1 } from '@hnk/audio-contract/theta432';
import type { AudioRuntimePort, AudioRuntimeSnapshot } from '@hnk/quest-engine';

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export class Theta432WebAudioRuntime implements AudioRuntimePort {
  readonly profileId = HNK_THETA432_AUDIO_PRESET_V1.id;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private state: AudioRuntimeSnapshot['state'] = 'idle';
  private volume = 0.5;

  snapshot(): AudioRuntimeSnapshot {
    return { profileId: this.profileId, state: this.state, volume: this.volume };
  }

  async start(volume = this.volume): Promise<void> {
    this.volume = clampVolume(volume);
    if (this.context) {
      this.setVolume(this.volume);
      if (this.context.state === 'suspended') await this.context.resume();
      this.state = 'playing';
      return;
    }

    const binaural = HNK_THETA432_AUDIO_PRESET_V1.layers.find((layer) => layer.kind === 'binaural');
    if (!binaural || binaural.kind !== 'binaural') throw new Error('theta432_binaural_layer_missing');

    const context = new AudioContext();
    const merger = context.createChannelMerger(2);
    const master = context.createGain();
    const left = context.createOscillator();
    const right = context.createOscillator();
    const leftGain = context.createGain();
    const rightGain = context.createGain();

    left.type = right.type = 'sine';
    left.frequency.value = binaural.leftHz;
    right.frequency.value = binaural.rightHz;
    leftGain.gain.value = binaural.gain;
    rightGain.gain.value = binaural.gain;

    left.connect(leftGain).connect(merger, 0, 0);
    right.connect(rightGain).connect(merger, 0, 1);
    merger.connect(master).connect(context.destination);
    master.gain.value = this.volume;

    left.start();
    right.start();

    this.context = context;
    this.master = master;
    this.oscillators = [left, right];
    this.state = 'playing';
  }

  async pause(): Promise<void> {
    if (this.context?.state === 'running') await this.context.suspend();
    if (this.context) this.state = 'paused';
  }

  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') await this.context.resume();
    if (this.context) this.state = 'playing';
  }

  setVolume(volume: number): void {
    this.volume = clampVolume(volume);
    if (this.master) this.master.gain.value = this.volume;
  }

  async stop(): Promise<void> {
    const context = this.context;
    for (const oscillator of this.oscillators) {
      try { oscillator.stop(); } catch { /* already stopped */ }
    }
    this.oscillators = [];
    this.master = null;
    this.context = null;
    this.state = 'stopped';
    if (context && context.state !== 'closed') await context.close();
  }
}
