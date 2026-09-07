import {
  createClient,
  processLock,
  type SupabaseClient,
} from '@supabase/supabase-js';
import type { Database } from '@hnk/database';

export * from './auth-callback';
export * from './kether-cycle01';
export * from './practice-record';
export * from './promotion-sync';
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
