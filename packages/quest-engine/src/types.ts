export type QuestPhaseType =
  | "NARRATIVE"
  | "INSTRUCTION"
  | "TERM_REVEAL"
  | "READ"
  | "FOCUS"
  | "AUDIO"
  | "RETURN"
  | "RELAXATION"
  | "JOURNAL"
  | "VOICE"
  | "PHENOMENOLOGY_CAPTURE"
  | "STRUCTURED_JOURNAL"
  | "EXPERIMENT"
  | "REAL_WORLD_ACTION"
  | "CORRESPONDENCE_REVEAL"
  | "COMPLETION"
  | "UNLOCK";

export type QuestSourceKind =
  | "CANON"
  | "PLATFORM_MICROCOPY"
  | "PLATFORM_EXPERIENCE"
  | "GUIDE_SAFETY"
  | "SYSTEM"
  | "USER";

export type MediationMode = "HNK_CANONICAL" | "COMPARATIVE" | "EXPERIMENTAL";

export type MeaningAnchorState =
  | "CLEAR_ANCHOR"
  | "UNDEFINED_ANCHOR"
  | "SEEKING"
  | "EXPERIMENTAL";

export type EpistemicDomain = "E1" | "E2" | "E3" | "E4" | "E5";

export type QuestRunState =
  | "IDLE"
  | "ACTIVE"
  | "PAUSED"
  | "INTERRUPTED"
  | "SAFETY_STOP"
  | "EVIDENCE_PENDING"
  | "COMPLETE";

export interface EpistemicOverlay {
  domain?: EpistemicDomain;
  status?: "OPERATIONAL_HYPOTHESIS" | string;
  scope: string;
}

export interface QuestSource {
  kind: QuestSourceKind;
  block_ids?: string[];
}

export interface QuestPhase {
  id: string;
  type: QuestPhaseType;
  source: QuestSource;
  required_for_completion: boolean;
  presentation?: Record<string, unknown>;
  interaction?: Record<string, unknown>;
  safety?: Record<string, unknown>;
  privacy?: Record<string, unknown>;
  audio?: Record<string, unknown>;
  unlock?: Record<string, unknown>;
  terms?: string[];
  items?: string[];
  options?: string[];
  content_intent?: string[];
  epistemic_overlays?: EpistemicOverlay[];
  completion_contract_id?: string;
  canonical_xp?: number;
  canonical_alignment?: string;
  label?: string;
}

export interface QuestDefinition {
  id: string;
  kind: "hnk.quest_definition";
  version: string;
  status: string;
  day: number;
  title: string;
  canonical: {
    source_sha: string;
    xp: number;
    sephira: string;
    world: string;
    angel: string;
    tracks: string[];
    [key: string]: unknown;
  };
  global_context?: {
    meaning_anchor_scope?: string;
    meaning_anchor_states?: MeaningAnchorState[];
    mediation_modes?: MediationMode[];
    default_mediation_mode?: MediationMode;
    [key: string]: unknown;
  };
  runtime: {
    entry_state: string;
    completion_state: string;
    resumable: boolean;
    offline_first: boolean;
    checkpoint_states?: string[];
    interrupt_states?: string[];
  };
  phases: QuestPhase[];
  release_blockers?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface AccessibilityContext {
  reducedMotion: boolean;
  audioEnabled: boolean;
  microphoneAvailable: boolean;
}

export interface PlayerContext {
  mediationMode: MediationMode;
  meaningAnchorState?: MeaningAnchorState;
  accessibility: AccessibilityContext;
  offline: boolean;
}

export interface SessionSnapshot {
  runState: QuestRunState;
  currentPhaseId?: string;
  completedPhaseIds: string[];
  checkpointPhaseId?: string;
}

export type DirectiveStatus = "READY" | "BLOCKED" | "OPTIONAL_UNAVAILABLE" | "COMPLETE";

export interface ExperienceDirective {
  phase: QuestPhase;
  status: DirectiveStatus;
  reason?: string;
  effectiveMotion?: string;
  rendererKey: QuestPhaseType;
  requiresCanonicalContent: boolean;
  canSkip: boolean;
  fallback?: {
    rendererKey: QuestPhaseType;
    reason: string;
  };
}
