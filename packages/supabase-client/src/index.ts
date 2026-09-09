import {
  createClient,
  processLock,
  type SupabaseClient,
} from '@supabase/supabase-js';
import type { Database } from '@hnk/database';

export * from './auth-callback';
export * from './day001-v2';
export * from './day002-v1';
export * from './day003-v1';
export * from './day004-v1';
export * from './day005-v1';
export * from './day006-v1';
export * from './day007-v1';
export * from './day008-v1';
export * from './day009-v1';
export * from './day010-v1';
export * from './day011-v1';
export * from './day012-v1';
export * from './day013-v1';
export * from './day014-v1';
export * from './day015-v1';
export * from './day016-v1';
export * from './kether-cycle01';
export * from './kether-cycle02';
export * from './kether-cycle03';
export * from './kether-cycle04';
export * from './practice-record';
export * from './promotion-sync';
export * from './real-world-action-v1';
export * from './vault';
export * from './vault-key-envelopes';

export type HnkSupabaseClient = SupabaseClient<Database>;

export interface HnkAuthStorage {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

export interface HnkClientOptions {
  auth?: {
    storage?: HnkAuthStorage;
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
  };
}

export function createHnkSupabaseClient(
  url: string,
  publishableKey: string,
  options: HnkClientOptions = {},
): HnkSupabaseClient {
  if (!url) throw new Error('Supabase URL is required');
  if (!publishableKey) throw new Error('Supabase publishable key is required');

  return createClient<Database>(url, publishableKey, {
    auth: {
      ...(options.auth?.storage ? { storage: options.auth.storage } : {}),
      autoRefreshToken: options.auth?.autoRefreshToken ?? true,
      persistSession: options.auth?.persistSession ?? true,
      detectSessionInUrl: options.auth?.detectSessionInUrl ?? true,
      lock: processLock,
    },
  });
}
