import type { CompleteDayRequestV1 } from './types.js';

export const DAY030_COMPLETION = {
  day: 30,
  completionContractId: 'HNK-KETHER-D030-COMP-V1',
  questDefinitionId: 'HNK-KETHER-D030-V1',
  canonicalSourceSha: 'a9bea648b20595579ef70c11ba3f319e477845dd',
  canonicalXp: 100,
  attributeProgression: {
    matrixVersion: '1.0.0',
    primaryAttribute: null,
    secondaryAttribute: null,
    requestedGain: 0,
    application: 'NO_EXECUTABLE_GAIN_RULE',
  },
  cycleSeal: {
    cycle: 'Lelahel',
    expectedCompletedDays: 5,
    fragment: 6,
    expectedLit: true,
    crownFragmentsLitAfter: 6,
    nextDay: 31,
    nextCycle: 'Achaiah',
    application: 'SERVER_CROWN_STATE_ONLY',
  },
  deploymentState: 'active',
} as const;

export function buildDay030CompletionRequest(input: {
  sessionId: string;
  clientCompletionId: string;
  localRecordHash?: string;
  clientCompletedAt?: string;
}): CompleteDayRequestV1 {
  return {
    day: 30,
    sessionId: input.sessionId,
    completionContractId: DAY030_COMPLETION.completionContractId,
    questDefinitionId: DAY030_COMPLETION.questDefinitionId,
    canonicalSourceSha: DAY030_COMPLETION.canonicalSourceSha,
    clientCompletionId: input.clientCompletionId,
    ...(input.clientCompletedAt ? { clientCompletedAt: input.clientCompletedAt } : {}),
    ...(input.localRecordHash ? { localRecordHash: input.localRecordHash } : {}),
    mode: 'first_completion',
  };
}
