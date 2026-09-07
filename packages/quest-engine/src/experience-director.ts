import type {
  ExperienceDirective,
  PlayerContext,
  QuestDefinition,
  QuestPhase,
  SessionSnapshot,
} from "./types.js";

function isAudioProductionBlocked(phase: QuestPhase): boolean {
  return phase.type === "AUDIO" && phase.audio?.production_enabled === false;
}

function isRequiredAudioUnavailable(phase: QuestPhase, context: PlayerContext): boolean {
  return phase.type === "AUDIO" && phase.required_for_completion && !context.accessibility.audioEnabled;
}

function resolveFallback(phase: QuestPhase, context: PlayerContext): ExperienceDirective["fallback"] {
  if (phase.type === "VOICE" && !context.accessibility.microphoneAvailable) {
    return {
      rendererKey: "VOICE",
      reason: "Microphone unavailable: execute vocal practice without capture.",
    };
  }
  return undefined;
}

export class ExperienceDirector {
  constructor(private readonly quest: QuestDefinition) {
    this.assertDefinition();
  }

  getDefinition(): QuestDefinition {
    return this.quest;
  }

  getPhase(phaseId: string): QuestPhase {
    const phase = this.quest.phases.find((candidate) => candidate.id === phaseId);
    if (!phase) throw new Error(`Unknown quest phase: ${phaseId}`);
    return phase;
  }

  resolvePhase(phaseId: string, context: PlayerContext, session: SessionSnapshot): ExperienceDirective {
    const phase = this.getPhase(phaseId);

    if (session.completedPhaseIds.includes(phase.id)) {
      return this.directive(phase, "COMPLETE", context);
    }

    if (isAudioProductionBlocked(phase)) {
      return this.directive(
        phase,
        phase.required_for_completion ? "BLOCKED" : "OPTIONAL_UNAVAILABLE",
        context,
        "Canonical audio mapping is not published for production.",
      );
    }

    if (isRequiredAudioUnavailable(phase, context)) {
      return this.directive(
        phase,
        "BLOCKED",
        context,
        "This canonical phase currently requires audio; do not auto-complete or invent a fallback.",
      );
    }

    return this.directive(phase, "READY", context);
  }

  getResumePhase(session: SessionSnapshot): QuestPhase {
    if (session.checkpointPhaseId) return this.getPhase(session.checkpointPhaseId);
    if (session.currentPhaseId) return this.getPhase(session.currentPhaseId);

    const firstIncomplete = this.quest.phases.find(
      (phase) => !session.completedPhaseIds.includes(phase.id),
    );
    if (!firstIncomplete) return this.quest.phases[this.quest.phases.length - 1]!;
    return firstIncomplete;
  }

  getNextPhase(currentPhaseId: string, session: SessionSnapshot): QuestPhase | null {
    const index = this.quest.phases.findIndex((phase) => phase.id === currentPhaseId);
    if (index < 0) throw new Error(`Unknown quest phase: ${currentPhaseId}`);

    for (let cursor = index + 1; cursor < this.quest.phases.length; cursor += 1) {
      const candidate = this.quest.phases[cursor]!;
      if (!session.completedPhaseIds.includes(candidate.id)) return candidate;
    }
    return null;
  }

  getMissingRequiredPhases(session: SessionSnapshot): QuestPhase[] {
    return this.quest.phases.filter(
      (phase) => phase.required_for_completion && !session.completedPhaseIds.includes(phase.id),
    );
  }

  canRequestCompletion(session: SessionSnapshot): boolean {
    return this.getMissingRequiredPhases(session).length === 0;
  }

  private directive(
    phase: QuestPhase,
    status: ExperienceDirective["status"],
    context: PlayerContext,
    reason?: string,
  ): ExperienceDirective {
    const configuredMotion =
      typeof phase.presentation?.motion === "string" ? phase.presentation.motion : undefined;

    return {
      phase,
      status,
      reason,
      effectiveMotion: context.accessibility.reducedMotion ? "REDUCED" : configuredMotion,
      rendererKey: phase.type,
      requiresCanonicalContent: phase.source.kind === "CANON",
      canSkip: !phase.required_for_completion,
      fallback: resolveFallback(phase, context),
    };
  }

  private assertDefinition(): void {
    if (this.quest.kind !== "hnk.quest_definition") {
      throw new Error("Invalid quest kind");
    }
    if (!this.quest.phases.length) throw new Error("Quest must contain at least one phase");

    const ids = new Set<string>();
    for (const phase of this.quest.phases) {
      if (ids.has(phase.id)) throw new Error(`Duplicate phase id: ${phase.id}`);
      ids.add(phase.id);
    }
  }
}
