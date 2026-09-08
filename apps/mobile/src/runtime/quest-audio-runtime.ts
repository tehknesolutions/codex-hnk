import { DAY002_AUDIO_PRESET_V1 } from '@hnk/audio-contract';
import { HNK_THETA432_AUDIO_PRESET_V1 } from '@hnk/audio-contract/theta432';
import { AudioRuntimeRegistry } from '@hnk/quest-engine';
import { Day002ExpoAudioRuntime } from '../features/kether/day002-audio-runtime';
import { Theta432ExpoAudioRuntime } from './theta432-audio-runtime';

export function createMobileQuestAudioRuntimeRegistry(): AudioRuntimeRegistry {
  return new AudioRuntimeRegistry()
    .register(DAY002_AUDIO_PRESET_V1.id, () => new Day002ExpoAudioRuntime())
    .register(HNK_THETA432_AUDIO_PRESET_V1.id, () => new Theta432ExpoAudioRuntime());
}
