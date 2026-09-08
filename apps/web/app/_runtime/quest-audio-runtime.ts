'use client';

import { DAY002_AUDIO_PRESET_V1 } from '@hnk/audio-contract';
import { AudioRuntimeRegistry } from '@hnk/quest-engine';
import { Day002WebAudioRuntime } from '../day-002/day002-audio-runtime';

export function createWebQuestAudioRuntimeRegistry(): AudioRuntimeRegistry {
  return new AudioRuntimeRegistry()
    .register(DAY002_AUDIO_PRESET_V1.id, () => new Day002WebAudioRuntime());
}
