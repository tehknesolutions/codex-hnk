import { bindAudioPhase, type AudioRuntimePort, type AudioRuntimeRegistry, type AudioRuntimeSnapshot } from "./audio-runtime.js";
import type { ExperienceDirective } from "./types.js";

export class QuestAudioController {
  readonly phaseId: string;
  readonly profileId: string;
  private readonly runtime: AudioRuntimePort;

  constructor(directive: ExperienceDirective, registry: AudioRuntimeRegistry) {
    const bound = bindAudioPhase(directive, registry);
    this.phaseId = bound.phaseId;
    this.profileId = bound.profileId;
    this.runtime = bound.runtime;
  }

  snapshot(): AudioRuntimeSnapshot {
    return this.runtime.snapshot();
  }

  start(volume?: number): Promise<void> {
    return Promise.resolve(this.runtime.start(volume));
  }

  pause(): Promise<void> {
    return Promise.resolve(this.runtime.pause());
  }

  resume(): Promise<void> {
    return Promise.resolve(this.runtime.resume());
  }

  setVolume(volume: number): Promise<void> {
    return Promise.resolve(this.runtime.setVolume(volume));
  }

  stop(): Promise<void> {
    return Promise.resolve(this.runtime.stop());
  }
}

export function createQuestAudioController(
  directive: ExperienceDirective,
  registry: AudioRuntimeRegistry,
): QuestAudioController {
  return new QuestAudioController(directive, registry);
}
