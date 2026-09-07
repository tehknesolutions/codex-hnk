import { asCompletionFailure } from "./errors.js";
import type {
  CompleteDayRequestV1,
  CompleteDayResponseV1,
  CompletionResult,
  CompletionRpcArgsV2,
} from "./types.js";

export interface CompletionTransportError {
  code?: string;
  message?: string;
  transportUnavailable?: boolean;
}

export interface CompletionTransport {
  completeCodexDayV2(args: CompletionRpcArgsV2): Promise<CompleteDayResponseV1>;
}

export interface CompletionRuntimePort {
  confirmServerCompletion(): unknown;
}

export function toCompletionRpcArgs(request: CompleteDayRequestV1): CompletionRpcArgsV2 {
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

function validateAuthoritativeEcho(request: CompleteDayRequestV1, response: CompleteDayResponseV1): void {
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
  if (response.xp_awarded < 0 || response.xp_total < 0) throw new Error("server_state_conflict");
}

export class CompletionService {
  constructor(private readonly transport: CompletionTransport) {}

  async complete(
    request: CompleteDayRequestV1,
    runtime?: CompletionRuntimePort,
  ): Promise<CompletionResult> {
    try {
      const response = await this.transport.completeCodexDayV2(toCompletionRpcArgs(request));
      validateAuthoritativeEcho(request, response);
      runtime?.confirmServerCompletion();
      return { ok: true, response };
    } catch (error) {
      const transportError = error as CompletionTransportError;
      if (transportError.transportUnavailable) {
        return asCompletionFailure("transport_unavailable", transportError.message);
      }
      const code = error instanceof Error ? error.message : transportError.code ?? "unknown_completion_error";
      return asCompletionFailure(code, transportError.message);
    }
  }
}
