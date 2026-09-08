import type {
  EpistemicOverlay,
  ExperienceDirective,
  PlayerContext,
  QuestSourceKind,
} from "./types.js";

export type RenderVoice = "CANON" | "GUIDE" | "GUIDE_SAFETY" | "SYSTEM" | "USER";

export type RenderControl =
  | "CONTINUE"
  | "COMPLETE_PHASE"
  | "PAUSE"
  | "STOP"
  | "SKIP"
  | "START_AUDIO"
  | "STOP_AUDIO"
  | "START_EXPERIMENT"
  | "RECORD_OBSERVATION"
  | "START_ACTION"
  | "CHECK_IN"
  | "CONFIRM_RETURN"
  | "OPEN_VAULT"
  | "RECORD_OPTIONAL"
  | "REQUEST_SERVER_COMPLETION";

export interface RenderBadge {
  key: string;
  label: string;
  scope?: string;
}

export interface RenderSurface {
  phaseId: string;
  phaseType: ExperienceDirective["rendererKey"];
  status: ExperienceDirective["status"];
  required: boolean;
  canSkip: boolean;
  voice: RenderVoice;
  sourceBlockIds: string[];
  controls: RenderControl[];
  badges: RenderBadge[];
  motion?: string;
  privacy: {
    vaultOnly: boolean;
    optionalPrivateMedia: boolean;
  };
  fallback?: ExperienceDirective["fallback"];
  reason?: string;
}

function resolveVoice(kind: QuestSourceKind): RenderVoice {
  switch (kind) {
    case "CANON": return "CANON";
    case "GUIDE_SAFETY": return "GUIDE_SAFETY";
    case "SYSTEM": return "SYSTEM";
    case "USER": return "USER";
    case "PLATFORM_MICROCOPY":
    case "PLATFORM_EXPERIENCE": return "GUIDE";
  }
}

function toBadges(overlays: EpistemicOverlay[] | undefined): RenderBadge[] {
  return (overlays ?? []).map((overlay) => ({
    key: overlay.status ?? overlay.domain ?? "EPISTEMIC",
    label: overlay.status ?? overlay.domain ?? "EPISTEMIC",
    scope: overlay.scope,
  }));
}

function controlsFor(directive: ExperienceDirective): RenderControl[] {
  if (directive.status === "BLOCKED") return ["STOP"];
  if (directive.status === "OPTIONAL_UNAVAILABLE") return ["SKIP", "CONTINUE"];
  if (directive.status === "COMPLETE") return ["CONTINUE"];

  const phase = directive.phase;
  switch (phase.type) {
    case "FOCUS":
    case "RELAXATION":
      return ["PAUSE", "STOP", "COMPLETE_PHASE"];
    case "AUDIO":
      return directive.canSkip
        ? ["START_AUDIO", "STOP_AUDIO", "SKIP", "COMPLETE_PHASE"]
        : ["START_AUDIO", "STOP_AUDIO", "COMPLETE_PHASE"];
    case "EXPERIMENT":
      return ["START_EXPERIMENT", "RECORD_OBSERVATION", "STOP", "COMPLETE_PHASE"];
    case "REAL_WORLD_ACTION":
      return ["START_ACTION", "CHECK_IN", "STOP", "COMPLETE_PHASE"];
    case "RETURN":
      return ["CONFIRM_RETURN", "STOP"];
    case "JOURNAL":
    case "STRUCTURED_JOURNAL":
      return ["OPEN_VAULT", "COMPLETE_PHASE"];
    case "VOICE": {
      const recordingOptional = phase.interaction?.recording_optional === true;
      return recordingOptional
        ? ["PAUSE", "STOP", "RECORD_OPTIONAL", "COMPLETE_PHASE"]
        : ["PAUSE", "STOP", "COMPLETE_PHASE"];
    }
    case "COMPLETION":
      return ["REQUEST_SERVER_COMPLETION"];
    default:
      return directive.canSkip ? ["SKIP", "CONTINUE"] : ["COMPLETE_PHASE"];
  }
}

export function buildRenderSurface(
  directive: ExperienceDirective,
  context: PlayerContext,
): RenderSurface {
  const privacy = directive.phase.privacy ?? {};
  const vaultOnly = privacy.free_text_destination === "VAULT_ONLY";
  const optionalPrivateMedia =
    directive.phase.type === "VOICE" && directive.phase.interaction?.recording_optional === true;

  return {
    phaseId: directive.phase.id,
    phaseType: directive.rendererKey,
    status: directive.status,
    required: directive.phase.required_for_completion,
    canSkip: directive.canSkip,
    voice: resolveVoice(directive.phase.source.kind),
    sourceBlockIds: directive.phase.source.block_ids ?? [],
    controls: controlsFor(directive),
    badges: toBadges(directive.phase.epistemic_overlays),
    motion: context.accessibility.reducedMotion ? "REDUCED" : directive.effectiveMotion,
    privacy: { vaultOnly, optionalPrivateMedia },
    fallback: directive.fallback,
    reason: directive.reason,
  };
}
