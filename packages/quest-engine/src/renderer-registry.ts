import type { ExperienceDirective, QuestPhaseType } from "./types.js";

export interface QuestRenderContext<TEnvironment = unknown> {
  environment: TEnvironment;
  onCompletePhase: (phaseId: string) => void | Promise<void>;
  onPause: () => void | Promise<void>;
  onStop: (reason?: string) => void | Promise<void>;
}

export type QuestPhaseRenderer<TOutput = unknown, TEnvironment = unknown> = (
  directive: ExperienceDirective,
  context: QuestRenderContext<TEnvironment>,
) => TOutput;

export type QuestRendererRegistry<TOutput = unknown, TEnvironment = unknown> = Partial<
  Record<QuestPhaseType, QuestPhaseRenderer<TOutput, TEnvironment>>
>;

export class MissingQuestRendererError extends Error {
  constructor(type: QuestPhaseType) {
    super(`No QuestRenderer registered for phase type ${type}`);
    this.name = "MissingQuestRendererError";
  }
}

export function renderQuestPhase<TOutput, TEnvironment>(
  registry: QuestRendererRegistry<TOutput, TEnvironment>,
  directive: ExperienceDirective,
  context: QuestRenderContext<TEnvironment>,
): TOutput {
  const renderer = registry[directive.rendererKey];
  if (!renderer) throw new MissingQuestRendererError(directive.rendererKey);
  return renderer(directive, context);
}
