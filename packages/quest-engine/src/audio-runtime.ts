import type { ExperienceDirective, QuestPhase } from "./types.js";

export type AudioRuntimeStatus = "IDLE" | "PLAYING" | "PAUSED" | "STOPPED" | "ERROR";

export interface AudioRuntimeSnapshot {
  profileId: string;
  status: AudioRuntimeStatus;
  started: boolean;
  volume: number;
}

export interface AudioRuntimePort {
  readonly profileId: string;
  snapshot(): AudioRuntimeSnapshot;
  start(volume?: number): void | Promise<void>;
  pause(): void | Promise<void>;
  resume(): void | Promise<void>;
  setVolume(volume: number): void | Promise<void>;
  stop(): void | Promise<void>;
}

export type AudioRuntimeFactory = () => AudioRuntimePort;

function assertProfileId(profileId: string): string {
  const value = profileId.trim();
  if (!value) throw new Error("audio_profile_id_required");
  return value;
}

export function getAudioProfileId(phase: QuestPhase): string {
  if (phase.type !== "AUDIO") throw new Error(`phase_is_not_audio:${phase.id}`);
  const value = phase.audio?.profile_id;
  if (typeof value !== "string") throw new Error(`audio_profile_id_missing:${phase.id}`);
  return assertProfileId(value);
}

export class AudioRuntimeRegistry {
  private readonly factories = new Map<string, AudioRuntimeFactory>();

  register(profileId: string, factory: AudioRuntimeFactory): this {
    const id = assertProfileId(profileId);
    if (this.factories.has(id)) throw new Error(`audio_runtime_duplicate_profile:${id}`);
    this.factories.set(id, factory);
    return this;
  }

  has(profileId: string): boolean {
    return this.factories.has(profileId.trim());
  }

  create(profileId: string): AudioRuntimePort {
    const id = assertProfileId(profileId);
    const factory = this.factories.get(id);
    if (!factory) throw new Error(`audio_runtime_not_registered:${id}`);
    const runtime = factory();
    if (runtime.profileId !== id) {
      throw new Error(`audio_runtime_profile_mismatch:${id}:${runtime.profileId}`);
    }
    return runtime;
  }

  listProfiles(): string[] {
    return [...this.factories.keys()].sort();
  }
}

export interface BoundAudioPhase {
  phaseId: string;
  profileId: string;
  runtime: AudioRuntimePort;
}

/**
 * Binds one AUDIO directive to a platform runtime exclusively by profile id.
 * No Day number, frequency or HNK-specific audio semantics are interpreted by
 * the Quest Engine here. Those belong to the versioned audio profile.
 */
export function bindAudioPhase(
  directive: ExperienceDirective,
  registry: AudioRuntimeRegistry,
): BoundAudioPhase {
  if (directive.rendererKey !== "AUDIO" || directive.phase.type !== "AUDIO") {
    throw new Error(`directive_is_not_audio:${directive.phase.id}`);
  }
  if (directive.status === "BLOCKED") {
    throw new Error(`audio_directive_blocked:${directive.phase.id}:${directive.reason ?? "unknown"}`);
  }
  const profileId = getAudioProfileId(directive.phase);
  return {
    phaseId: directive.phase.id,
    profileId,
    runtime: registry.create(profileId),
  };
}
