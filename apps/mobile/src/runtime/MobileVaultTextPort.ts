import { File, Paths } from 'expo-file-system';
import type { VaultEntryKind, VaultTextPort } from '@hnk/vault-contract';
import { saveEncryptedVaultEntry, type EncryptedVaultPayload, type HnkSupabaseClient } from '@hnk/supabase-client';
import { encryptVaultText } from '../features/vault/vault-crypto';

interface PendingVaultEntry {
  localRef: string;
  day: number | null;
  kind: VaultEntryKind;
  payload: EncryptedVaultPayload;
  clientCreatedAt: string;
}
interface QueueState { version: 1; pending: PendingVaultEntry[]; resolved: Record<string,string> }
export interface MobileVaultTextPort extends VaultTextPort {
  pendingCount(userId:string):Promise<number>;
  flushPending(userId:string):Promise<Array<{localRef:string;serverEntryId:string}>>;
  resolveEntryId(userId:string,entryId:string):Promise<string|null>;
}

const empty=():QueueState=>({version:1,pending:[],resolved:{}});
function queueFile(userId:string){const safe=userId.replace(/[^a-zA-Z0-9-]/g,'_');return new File(Paths.document,`hnk-vault-ciphertext-queue-v1-${safe}.json`)}
async function readQueue(userId:string):Promise<QueueState>{const file=queueFile(userId);if(!file.exists)return empty();try{const parsed=JSON.parse(await file.text()) as Partial<QueueState>;if(parsed.version!==1||!Array.isArray(parsed.pending)||typeof parsed.resolved!=='object'||parsed.resolved===null)return empty();return parsed as QueueState}catch{return empty()}}
async function writeQueue(userId:string,state:QueueState){const file=queueFile(userId);if(!file.exists)file.create({intermediates:true});file.write(JSON.stringify(state))}
function localRef(){return`local-vault:${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`}

export function createMobileVaultTextPort(client?: HnkSupabaseClient|null): MobileVaultTextPort {
  let lock:Promise<unknown>=Promise.resolve();
  const serial=<T>(fn:()=>Promise<T>):Promise<T>=>{const next=lock.then(fn,fn);lock=next.then(()=>undefined,()=>undefined);return next};
  async function queue(userId:string,entry:PendingVaultEntry){await serial(async()=>{const state=await readQueue(userId);state.pending.push(entry);await writeQueue(userId,state)})}
  return {
    capability() {
      return { encryptedText: true, serverReceivesPlaintext: false, deviceBound: true, recoveryConfigured: false };
    },
    async saveText(input) {
      const payload = await encryptVaultText({ userId: input.userId, day: input.day, kind: input.kind, plaintext: input.plaintext });
      const createdAt=new Date().toISOString();
      if(client){try{const entry=await saveEncryptedVaultEntry(client,{day:input.day,payload,clientCreatedAt:createdAt});return{entryId:entry.id,day:input.day,kind:input.kind,cryptoAlg:'AES-256-GCM',cryptoVersion:1,recoveryState:'DEVICE_BOUND'}}catch{/* ciphertext is queued below */}}
      const ref=localRef();
      await queue(input.userId,{localRef:ref,day:input.day,kind:input.kind,payload,clientCreatedAt:createdAt});
      return { entryId:ref, day:input.day, kind:input.kind, cryptoAlg:'AES-256-GCM', cryptoVersion:1, recoveryState:'DEVICE_BOUND' };
    },
    pendingCount(userId){return serial(async()=>{const state=await readQueue(userId);return state.pending.length})},
    flushPending(userId){return serial(async()=>{if(!client)throw new Error('vault_sync_requires_connection');const state=await readQueue(userId);const resolved:Array<{localRef:string;serverEntryId:string}>=[];while(state.pending.length){const item=state.pending[0];const entry=await saveEncryptedVaultEntry(client,{day:item.day,payload:item.payload,clientCreatedAt:item.clientCreatedAt});state.resolved[item.localRef]=entry.id;state.pending.shift();await writeQueue(userId,state);resolved.push({localRef:item.localRef,serverEntryId:entry.id})}return resolved})},
    resolveEntryId(userId,entryId){return serial(async()=>{if(!entryId.startsWith('local-vault:'))return entryId;const state=await readQueue(userId);return state.resolved[entryId]??null})},
  };
}
