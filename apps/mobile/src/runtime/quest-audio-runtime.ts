import { DAY002_AUDIO_PRESET_V1 } from '@hnk/audio-contract';
import { AudioRuntimeRegistry } from '@hnk/quest-engine';
import { Day002ExpoAudioRuntime } from '../features/kether/day002-audio-runtime';

export function createMobileQuestAudioRuntimeRegistry(): AudioRuntimeRegistry {
  return new AudioRuntimeRegistry()
    .register(DAY002_AUDIO_PRESET_V1.id, () => new Day002ExpoAudioRuntime());
}
