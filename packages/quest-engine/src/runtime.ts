import type { QuestDefinition, QuestRunState, SessionSnapshot } from "./types.js";
import { ExperienceDirector } from "./experience-director.js";

export class QuestRuntime {
  private state: QuestRunState = "IDLE";
  private currentPhaseId?: string;
  private checkpointPhaseId?: string;
  private readonly completed = new Set<string>();
  private readonly director: ExperienceDirector;

  constructor(private readonly definition: QuestDefinition) {
    this.director = new ExperienceDirector(definition);
  }

  start(): SessionSnapshot {
    if (this.state === "COMPLETE") return this.snapshot();
    this.state = "ACTIVE";
    this.currentPhaseId = this.director.getResumePhase(this.snapshot()).id;
    return this.snapshot();
  }

  completePhase(phaseId: string): SessionSnapshot {
    if (this.state !== "ACTIVE") throw new Error(`Cannot complete phase while state=${this.state}`);
    if (this.currentPhaseId !== phaseId) {
      throw new Error(`Cannot complete ${phaseId}; current phase is ${this.currentPhaseId ?? "none"}`);
    }

    this.completed.add(phaseId);

    if (this.definition.runtime.checkpoint_states?.includes(phaseId)) {
      this.checkpointPhaseId = phaseId;
    }

    const next = this.director.getNextPhase(phaseId, this.snapshot());
    if (!next) {
      this.currentPhaseId = undefined;
      this.state = this.director.canRequestCompletion(this.snapshot()) ? "EVIDENCE_PENDING" : "ACTIVE";
      return this.snapshot();
    }

    this.currentPhaseId = next.id;
    return this.snapshot();
  }

  pause(): SessionSnapshot {
    if (this.state !== "ACTIVE") return this.snapshot();
    this.state = "PAUSED";
    return this.snapshot();
  }

  interrupt(): SessionSnapshot {
    if (this.state === "COMPLETE") return this.snapshot();
    this.state = "INTERRUPTED";
    return this.snapshot();
  }

  safetyStop(): SessionSnapshot {
    if (this.state === "COMPLETE") return this.snapshot();
    this.state = "SAFETY_STOP";
    return this.snapshot();
  }

  resume(): SessionSnapshot {
    if (!["PAUSED", "INTERRUPTED", "SAFETY_STOP"].includes(this.state)) return this.snapshot();
    this.state = "ACTIVE";
    this.currentPhaseId = this.director.getResumePhase(this.snapshot()).id;
    return this.snapshot();
  }

  markComplete(): SessionSnapshot {
    if (!this.director.canRequestCompletion(this.snapshot())) {
      const missing = this.director.getMissingRequiredPhases(this.snapshot()).map((phase) => phase.id);
      throw new Error(`Required phases still missing: ${missing.join(", ")}`);
    }
    this.state = "COMPLETE";
    return this.snapshot();
  }

  snapshot(): SessionSnapshot {
    return {
      runState: this.state,
      currentPhaseId: this.currentPhaseId,
      completedPhaseIds: [...this.completed],
      checkpointPhaseId: this.checkpointPhaseId,
    };
  }
}
