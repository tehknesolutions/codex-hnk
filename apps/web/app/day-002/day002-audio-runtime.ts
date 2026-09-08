'use client';

import { DAY002_AUDIO_PRESET_V1 } from '@hnk/audio-contract';

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export class Day002WebAudioRuntime {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private started = false;

  get profileId(): string {
    return DAY002_AUDIO_PRESET_V1.id;
  }

  get isStarted(): boolean {
    return this.started;
  }

  async start(volume = 0.5): Promise<void> {
    if (this.context) {
      if (this.context.state === 'suspended') await this.context.resume();
      return;
    }

    const context = new AudioContext();
    const merger = context.createChannelMerger(2);
    const leftMix = context.createGain();
    const rightMix = context.createGain();
    const master = context.createGain();
    const binaural = DAY002_AUDIO_PRESET_V1.layers.find((layer) => layer.kind === 'binaural');
    const ritual = DAY002_AUDIO_PRESET_V1.layers.find((layer) => layer.kind === 'ritual-tone');
    if (!binaural || binaural.kind !== 'binaural' || !ritual || ritual.kind !== 'ritual-tone') {
      throw new Error('day002_audio_layers_missing');
    }

    const leftCarrier = context.createOscillator();
    const rightCarrier = context.createOscillator();
    const leftRitual = context.createOscillator();
    const rightRitual = context.createOscillator();
    const leftCarrierGain = context.createGain();
    const rightCarrierGain = context.createGain();
    const leftRitualGain = context.createGain();
    const rightRitualGain = context.createGain();

    leftCarrier.type = rightCarrier.type = leftRitual.type = rightRitual.type = 'sine';
    leftCarrier.frequency.value = binaural.leftHz;
    rightCarrier.frequency.value = binaural.rightHz;
    leftRitual.frequency.value = rightRitual.frequency.value = ritual.hz;
    leftCarrierGain.gain.value = rightCarrierGain.gain.value = binaural.gain;
    leftRitualGain.gain.value = rightRitualGain.gain.value = ritual.gain;

    leftCarrier.connect(leftCarrierGain).connect(leftMix);
    leftRitual.connect(leftRitualGain).connect(leftMix);
    rightCarrier.connect(rightCarrierGain).connect(rightMix);
    rightRitual.connect(rightRitualGain).connect(rightMix);
    leftMix.connect(merger, 0, 0);
    rightMix.connect(merger, 0, 1);
    merger.connect(master).connect(context.destination);
    master.gain.value = clampVolume(volume);

    for (const oscillator of [leftCarrier, rightCarrier, leftRitual, rightRitual]) oscillator.start();

    this.context = context;
    this.master = master;
    this.oscillators = [leftCarrier, rightCarrier, leftRitual, rightRitual];
    this.started = true;
  }

  async pause(): Promise<void> {
    if (this.context?.state === 'running') await this.context.suspend();
  }

  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') await this.context.resume();
  }

  setVolume(volume: number): void {
    if (this.master) this.master.gain.value = clampVolume(volume);
  }

  async stop(): Promise<void> {
    const context = this.context;
    for (const oscillator of this.oscillators) {
      try { oscillator.stop(); } catch { /* already stopped */ }
    }
    this.oscillators = [];
    this.master = null;
    this.context = null;
    if (context && context.state !== 'closed') await context.close();
  }
}
