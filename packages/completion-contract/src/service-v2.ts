import { asCompletionFailure } from "./errors.js";
import type {
  CompleteDayRequestV1,
  CompletionRpcArgsV2,
} from "./types.js";
import type {
  CompleteDayResponseV2,
  CompletionResultV2,
} from "./progression-v2.js";

export interface CompletionTransportErrorV2 {
  code?: string;
  message?: string;
  transportUnavailable?: boolean;
}

export interface CompletionTransportV2 {
  completeCodexDayV2(args: CompletionRpcArgsV2): Promise<CompleteDayResponseV2>;
}

export interface CompletionRuntimePortV2 {
  confirmServerCompletion(): unknown;
}

export function toCompletionRpcArgsV2(request: CompleteDayRequestV1): CompletionRpcArgsV2 {
  return {
    p_day: request.day,
    p_session_id: request.sessionId,
    p_completion_contract_id: request.completionContractId,
    p_quest_definition_id: request.questDefinitionId,
    p_canonical_source_sha: request.canonicalSourceSha,
    p_client_completion_id: request.clientCompletionId,
    p_local_record_hash: request.localRecordHash,
    p_client_completed_at: request.clientCompletedAt,
  };
}

function validateAuthoritativeEchoV2(
  request: CompleteDayRequestV1,
  response: CompleteDayResponseV2,
): void {
  if (response.day !== request.day) throw new Error("server_state_conflict");
  if (response.completion_contract_id !== request.completionContractId) {
    throw new Error("completion_contract_mismatch");
  }
  if (response.quest_definition_id !== request.questDefinitionId) {
    throw new Error("quest_definition_mismatch");
  }
  if (response.canonical_source_sha !== request.canonicalSourceSha) {
    throw new Error("canonical_source_sha_mismatch");
  }
  if (response.xp_awarded < 0 || response.xp_total < 0) {
    throw new Error("server_state_conflict");
  }
  if (response.sephirah_state.sephira !== response.progress.current_sephira) {
    throw new Error("server_state_conflict");
  }
}

export class CompletionServiceV2 {
  constructor(private readonly transport: CompletionTransportV2) {}

  async complete(
    request: CompleteDayRequestV1,
    runtime?: CompletionRuntimePortV2,
  ): Promise<CompletionResultV2> {
    try {
      const response = await this.transport.completeCodexDayV2(toCompletionRpcArgsV2(request));
      validateAuthoritativeEchoV2(request, response);
      runtime?.confirmServerCompletion();
      return { ok: true, response };
    } catch (error) {
      const transportError = error as CompletionTransportErrorV2;
      if (transportError.transportUnavailable) {
        return asCompletionFailure("transport_unavailable", transportError.message);
      }
      const code = error instanceof Error
        ? error.message
        : transportError.code ?? "unknown_completion_error";
      return asCompletionFailure(code, transportError.message);
    }
  }
}
