import type { QuestDefinition, QuestRunState, SessionSnapshot } from "./types.js";
import { ExperienceDirector } from "./experience-director.js";

function isCheckpoint(definition: QuestDefinition, phaseId: string): boolean {
  return Boolean(
    definition.runtime.checkpoint_states?.some(
      (checkpointId) => checkpointId.toLowerCase() === phaseId.toLowerCase(),
    ),
  );
}

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

    const current = this.director.getPhase(phaseId);
    if (current.type === "COMPLETION") {
      throw new Error("COMPLETION is a server boundary; use confirmServerCompletion() after backend validation");
    }

    this.completed.add(phaseId);

    if (isCheckpoint(this.definition, phaseId)) {
      this.checkpointPhaseId = phaseId;
    }

    const next = this.director.getNextPhase(phaseId, this.snapshot());
    if (!next) {
      this.currentPhaseId = undefined;
      this.state = this.director.canRequestCompletion(this.snapshot()) ? "EVIDENCE_PENDING" : "ACTIVE";
      return this.snapshot();
    }

    this.currentPhaseId = next.id;
    this.state = next.type === "COMPLETION" ? "EVIDENCE_PENDING" : "ACTIVE";
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

  confirmServerCompletion(): SessionSnapshot {
    if (this.state !== "EVIDENCE_PENDING") {
      throw new Error(`Cannot confirm server completion while state=${this.state}`);
    }
    if (!this.currentPhaseId) throw new Error("No completion phase is active");

    const completionPhase = this.director.getPhase(this.currentPhaseId);
    if (completionPhase.type !== "COMPLETION") {
      throw new Error(`Expected COMPLETION phase, got ${completionPhase.type}`);
    }
    if (!this.director.canRequestCompletion(this.snapshot())) {
      const missing = this.director.getMissingRequiredPhases(this.snapshot()).map((phase) => phase.id);
      throw new Error(`Required phases still missing: ${missing.join(", ")}`);
    }

    this.completed.add(completionPhase.id);
    const next = this.director.getNextPhase(completionPhase.id, this.snapshot());

    if (!next) {
      this.currentPhaseId = undefined;
      this.state = "COMPLETE";
      return this.snapshot();
    }

    this.currentPhaseId = next.id;
    this.state = "ACTIVE";
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
