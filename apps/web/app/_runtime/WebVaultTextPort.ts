'use client';

import type { VaultEntryKind, VaultTextPort } from '@hnk/vault-contract';
import {
  createDeviceEnvelope,
  encryptNativeCompatibleVaultText,
  generateDeviceKek,
  generateVaultDataKey,
  unwrapDeviceVaultDataKey,
} from '@hnk/vault-web-crypto-lab';
import { loadDeviceEnrollment, persistDeviceEnrollment } from '@hnk/vault-web-crypto-lab/indexeddb';
import { saveEncryptedVaultEntry, type EncryptedVaultPayload, type HnkSupabaseClient } from '@hnk/supabase-client';

const KEY_VERSION = 1;
const DEVICE_ID_PREFIX = 'hnk.vault.web.device-id.v1';
const QUEUE_DB='hnk-vault-offline-v1';
const QUEUE_STORE='ciphertext-queues';

interface PendingVaultEntry { localRef:string;day:number|null;kind:VaultEntryKind;payload:EncryptedVaultPayload;clientCreatedAt:string }
interface QueueState { version:1;userId:string;pending:PendingVaultEntry[];resolved:Record<string,string> }
export interface WebVaultTextPort extends VaultTextPort {
  pendingCount(userId:string):Promise<number>;
  flushPending(userId:string):Promise<Array<{localRef:string;serverEntryId:string}>>;
  resolveEntryId(userId:string,entryId:string):Promise<string|null>;
}

function deviceId(userId: string): string {
  const key = `${DEVICE_ID_PREFIX}:${userId}`;
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = globalThis.crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
}

async function loadOrCreateVdk(userId: string): Promise<CryptoKey> {
  const id = deviceId(userId);
  const existing = await loadDeviceEnrollment(userId, KEY_VERSION, id);
  if (existing) return unwrapDeviceVaultDataKey(existing.envelope, existing.deviceKek);
  const extractableVdk = await generateVaultDataKey(undefined, true);
  const kek = await generateDeviceKek();
  const envelope = await createDeviceEnvelope({ userId, keyVersion: KEY_VERSION, deviceId: id, vdk: extractableVdk, deviceKek: kek });
  await persistDeviceEnrollment({ userId, keyVersion: KEY_VERSION, deviceId: id, deviceKek: kek, envelope });
  return unwrapDeviceVaultDataKey(envelope, kek);
}

function openQueueDb():Promise<IDBDatabase>{
  if(typeof indexedDB==='undefined')throw new Error('web_vault_indexeddb_unavailable');
  return new Promise((resolve,reject)=>{const req=indexedDB.open(QUEUE_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(QUEUE_STORE))db.createObjectStore(QUEUE_STORE,{keyPath:'userId'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error??new Error('web_vault_queue_open_failed'))});
}
async function readQueue(userId:string):Promise<QueueState>{const db=await openQueueDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(QUEUE_STORE,'readonly');const req=tx.objectStore(QUEUE_STORE).get(userId);req.onsuccess=()=>resolve((req.result as QueueState|undefined)??{version:1,userId,pending:[],resolved:{}});req.onerror=()=>reject(req.error??new Error('web_vault_queue_read_failed'))})}finally{db.close()}}
async function writeQueue(state:QueueState):Promise<void>{const db=await openQueueDb();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(QUEUE_STORE,'readwrite');tx.objectStore(QUEUE_STORE).put(state);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error??new Error('web_vault_queue_write_failed'));tx.onabort=()=>reject(tx.error??new Error('web_vault_queue_write_aborted'))})}finally{db.close()}}
function localRef(){return`local-vault:${Date.now().toString(36)}-${globalThis.crypto.randomUUID()}`}

export function createWebVaultTextPort(client?: HnkSupabaseClient|null): WebVaultTextPort {
  let lock:Promise<unknown>=Promise.resolve();
  const serial=<T>(fn:()=>Promise<T>):Promise<T>=>{const next=lock.then(fn,fn);lock=next.then(()=>undefined,()=>undefined);return next};
  async function queue(userId:string,entry:PendingVaultEntry){await serial(async()=>{const state=await readQueue(userId);state.pending.push(entry);await writeQueue(state)})}
  return {
    capability() {
      return { encryptedText: true, serverReceivesPlaintext: false, deviceBound: true, recoveryConfigured: false };
    },
    async saveText(input) {
      if (typeof window === 'undefined') throw new Error('web_vault_requires_browser');
      const key = await loadOrCreateVdk(input.userId);
      const payload = await encryptNativeCompatibleVaultText(key, { userId: input.userId, day: input.day, kind: input.kind, plaintext: input.plaintext });
      const createdAt=new Date().toISOString();
      if(client){try{const entry=await saveEncryptedVaultEntry(client,{day:input.day,payload,clientCreatedAt:createdAt});return{entryId:entry.id,day:input.day,kind:input.kind,cryptoAlg:'AES-256-GCM',cryptoVersion:1,recoveryState:'DEVICE_BOUND'}}catch{/* ciphertext is queued below */}}
      const ref=localRef();
      await queue(input.userId,{localRef:ref,day:input.day,kind:input.kind,payload,clientCreatedAt:createdAt});
      return { entryId:ref, day:input.day, kind:input.kind, cryptoAlg:'AES-256-GCM', cryptoVersion:1, recoveryState:'DEVICE_BOUND' };
    },
    pendingCount(userId){return serial(async()=>{const state=await readQueue(userId);return state.pending.length})},
    flushPending(userId){return serial(async()=>{if(!client)throw new Error('vault_sync_requires_connection');const state=await readQueue(userId);const resolved:Array<{localRef:string;serverEntryId:string}>=[];while(state.pending.length){const item=state.pending[0];const entry=await saveEncryptedVaultEntry(client,{day:item.day,payload:item.payload,clientCreatedAt:item.clientCreatedAt});state.resolved[item.localRef]=entry.id;state.pending.shift();await writeQueue(state);resolved.push({localRef:item.localRef,serverEntryId:entry.id})}return resolved})},
    resolveEntryId(userId,entryId){return serial(async()=>{if(!entryId.startsWith('local-vault:'))return entryId;const state=await readQueue(userId);return state.resolved[entryId]??null})},
  };
}
