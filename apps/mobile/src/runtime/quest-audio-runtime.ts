import { DAY002_AUDIO_PRESET_V1 } from '@hnk/audio-contract';
import { HNK_THETA432_AUDIO_PRESET_V1 } from '@hnk/audio-contract/theta432';
import { DAY030_ASMR_AUDIO_PRESET_V1, DAY030_CONTROL_AUDIO_PRESET_V1 } from '@hnk/audio-contract/day030';
import { AudioRuntimeRegistry } from '@hnk/quest-engine';
import { Day002ExpoAudioRuntime } from '../features/kether/day002-audio-runtime';
import { Day030AsmrExpoAudioRuntime, Day030ControlExpoAudioRuntime } from './day030-audio-runtime';
import { Theta432ExpoAudioRuntime } from './theta432-audio-runtime';

export function createMobileQuestAudioRuntimeRegistry(): AudioRuntimeRegistry {
  return new AudioRuntimeRegistry()
    .register(DAY002_AUDIO_PRESET_V1.id, () => new Day002ExpoAudioRuntime())
    .register(HNK_THETA432_AUDIO_PRESET_V1.id, () => new Theta432ExpoAudioRuntime())
    .register(DAY030_ASMR_AUDIO_PRESET_V1.id, () => new Day030AsmrExpoAudioRuntime())
    .register(DAY030_CONTROL_AUDIO_PRESET_V1.id, () => new Day030ControlExpoAudioRuntime());
}
