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
export * from './day017-v1';
export * from './day018-v1';
export * from './day019-v1';
export * from './day020-v1';
export * from './day021-v1';
export * from './day022-v1';
export * from './day023-v1';
export * from './day024-v1';
export * from './day025-v1';
export * from './day026-v1';
export * from './day027-v1';
export * from './day028-v1';
export * from './day029-v1';
export * from './day030-v1';
export * from './day031-v1';
export * from './day032-v1';
export * from './day033-v1';
export * from './day034-v1';
export * from './day035-v1';
export * from './day036-v1';
export * from './day037-v1';
export * from './day038-v1';
export * from './day039-v1';
export * from './day040-v2';
export * from './day041-v2';
export * from './day042-v2';
export * from './kether-cycle01';
export * from './kether-cycle02';
export * from './kether-cycle03';
export * from './kether-cycle04';
export * from './kether-cycle05';
export * from './kether-cycle06';
export * from './kether-cycle07';
export * from './practice-record';
export * from './promotion-sync';
export * from './real-world-action-v1';
export * from './vault';
export * from './vault-key-envelopes';

export type HnkSupabaseClient = SupabaseClient<Database>;
export interface HnkAuthStorage{getItem(key:string):Promise<string|null>|string|null;setItem(key:string,value:string):Promise<void>|void;removeItem(key:string):Promise<void>|void}
export interface HnkClientOptions{auth?:{storage?:HnkAuthStorage;autoRefreshToken?:boolean;persistSession?:boolean;detectSessionInUrl?:boolean}}
export function createHnkSupabaseClient(url:string,publishableKey:string,options:HnkClientOptions={}):HnkSupabaseClient{if(!url)throw new Error('Supabase URL is required');if(!publishableKey)throw new Error('Supabase publishable key is required');return createClient<Database>(url,publishableKey,{auth:{...(options.auth?.storage?{storage:options.auth.storage}:{}),autoRefreshToken:options.auth?.autoRefreshToken??true,persistSession:options.auth?.persistSession??true,detectSessionInUrl:options.auth?.detectSessionInUrl??true,lock:processLock}})}
