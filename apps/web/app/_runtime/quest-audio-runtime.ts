'use client';

import { DAY002_AUDIO_PRESET_V1 } from '@hnk/audio-contract';
import { HNK_THETA432_AUDIO_PRESET_V1 } from '@hnk/audio-contract/theta432';
import { DAY030_ASMR_AUDIO_PRESET_V1, DAY030_CONTROL_AUDIO_PRESET_V1 } from '@hnk/audio-contract/day030';
import { AudioRuntimeRegistry } from '@hnk/quest-engine';
import { Day002WebAudioRuntime } from '../day-002/day002-audio-runtime';
import { Day030AsmrWebAudioRuntime, Day030ControlWebAudioRuntime } from './day030-audio-runtime';
import { Theta432WebAudioRuntime } from './theta432-audio-runtime';

export function createWebQuestAudioRuntimeRegistry(): AudioRuntimeRegistry {
  return new AudioRuntimeRegistry()
    .register(DAY002_AUDIO_PRESET_V1.id, () => new Day002WebAudioRuntime())
    .register(HNK_THETA432_AUDIO_PRESET_V1.id, () => new Theta432WebAudioRuntime())
    .register(DAY030_ASMR_AUDIO_PRESET_V1.id, () => new Day030AsmrWebAudioRuntime())
    .register(DAY030_CONTROL_AUDIO_PRESET_V1.id, () => new Day030ControlWebAudioRuntime());
}
