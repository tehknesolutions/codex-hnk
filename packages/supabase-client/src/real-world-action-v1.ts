import type { Json } from '@hnk/database';
import {
  parseRealWorldActionSnapshot,
  type RealWorldActionPort,
  type RealWorldActionSnapshot,
} from '@hnk/real-world-action-contract';
import type { HnkSupabaseClient } from './index';

type RpcResult = Promise<{ data: Json; error: { message: string; code?: string } | null }>;

export function createSupabaseRealWorldActionPort(client: HnkSupabaseClient): RealWorldActionPort {
  const rpc = client.rpc.bind(client) as unknown as (name: string, args: Record<string, unknown>) => RpcResult;

  async function call(name: string, args: Record<string, unknown>): Promise<RealWorldActionSnapshot> {
    const { data, error } = await rpc(name, args);
    if (error) throw new Error(error.message || error.code || `${name}_failed`);
    return parseRealWorldActionSnapshot(data);
  }

  return {
    start(actionContractId, clientActionId) {
      if (!actionContractId.trim()) throw new Error('action_contract_id_required');
      if (!clientActionId.trim()) throw new Error('client_action_id_required');
      return call('start_real_world_action_v1', {
        p_action_contract_id: actionContractId,
        p_client_action_id: clientActionId,
      });
    },
    refresh(actionId) {
      if (!actionId.trim()) throw new Error('action_id_required');
      return call('refresh_real_world_action_v1', { p_action_id: actionId });
    },
    restart(actionId) {
      if (!actionId.trim()) throw new Error('action_id_required');
      return call('restart_real_world_action_v1', { p_action_id: actionId });
    },
    stop(actionId) {
      if (!actionId.trim()) throw new Error('action_id_required');
      return call('stop_real_world_action_v1', { p_action_id: actionId });
    },
  };
}

export function createDay003ClientActionId(sessionSeed: string): string {
  if (!sessionSeed.trim()) throw new Error('session_seed_required');
  return `hnk:d003:boaz24h:v1:${sessionSeed}`;
}

export function createDay029Observation24hClientActionId(sessionSeed:string):string {
  if(!sessionSeed.trim()) throw new Error('session_seed_required');
  return `hnk:d029:substitution24h:v1:${sessionSeed}`;
}

export function createDay029Review7dClientActionId(sessionSeed:string):string {
  if(!sessionSeed.trim()) throw new Error('session_seed_required');
  return `hnk:d029:review7d:v1:${sessionSeed}`;
}
