'use client';

import type { VaultMediaPort, VaultMediaReference } from '@hnk/vault-contract';

const DB_NAME='hnk-media-vault-v1';
const DB_VERSION=1;
const KEY_STORE='keys';
const MEDIA_STORE='media';
const MAX_MEDIA_BYTES=12*1024*1024;

interface KeyRecord{userId:string;key:CryptoKey}
interface MediaRecord{localRef:string;userId:string;day:number|null;kind:'audio';mimeType:string;byteLength:number;durationSeconds:number;nonce:string;aad:string;ciphertext:string;checksumSha256:string;createdAt:string}

function openDb():Promise<IDBDatabase>{
 if(typeof indexedDB==='undefined')throw new Error('web_media_vault_indexeddb_unavailable');
 return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(KEY_STORE))db.createObjectStore(KEY_STORE,{keyPath:'userId'});if(!db.objectStoreNames.contains(MEDIA_STORE))db.createObjectStore(MEDIA_STORE,{keyPath:'localRef'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error??new Error('web_media_vault_open_failed'))});
}
function b64(bytes:Uint8Array):string{let s='';const step=0x8000;for(let i=0;i<bytes.length;i+=step)s+=String.fromCharCode(...bytes.subarray(i,Math.min(bytes.length,i+step)));return btoa(s)}
function unb64(value:string):Uint8Array{const s=atob(value),out=new Uint8Array(s.length);for(let i=0;i<s.length;i+=1)out[i]=s.charCodeAt(i);return out}
function hex(bytes:Uint8Array):string{return[...bytes].map(v=>v.toString(16).padStart(2,'0')).join('')}
async function checksum(input:{nonce:string;ciphertext:string;aad:string}){const bytes=new TextEncoder().encode(`${input.nonce}.${input.ciphertext}.${input.aad}`);return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)))}
function validate(input:{userId:string;day:number|null;mimeType:string;bytes:Uint8Array;durationSeconds:number}){if(!input.userId.trim())throw new Error('media_vault_user_required');if(input.day!==null&&(!Number.isInteger(input.day)||input.day<1||input.day>365))throw new Error('media_vault_day_invalid');if(!input.mimeType.trim())throw new Error('media_vault_mime_required');if(!(input.bytes instanceof Uint8Array)||input.bytes.byteLength<1||input.bytes.byteLength>MAX_MEDIA_BYTES)throw new Error('media_vault_bytes_invalid');if(!Number.isFinite(input.durationSeconds)||input.durationSeconds<=0||input.durationSeconds>180.5)throw new Error('media_vault_duration_invalid')}
async function getKey(userId:string):Promise<CryptoKey>{const db=await openDb();try{const existing=await new Promise<KeyRecord|undefined>((resolve,reject)=>{const tx=db.transaction(KEY_STORE,'readonly');const req=tx.objectStore(KEY_STORE).get(userId);req.onsuccess=()=>resolve(req.result as KeyRecord|undefined);req.onerror=()=>reject(req.error)});if(existing?.key)return existing.key;const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await new Promise<void>((resolve,reject)=>{const tx=db.transaction(KEY_STORE,'readwrite');tx.objectStore(KEY_STORE).put({userId,key} satisfies KeyRecord);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)});return key}finally{db.close()}}
async function putMedia(record:MediaRecord){const db=await openDb();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(MEDIA_STORE,'readwrite');tx.objectStore(MEDIA_STORE).put(record);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}finally{db.close()}}
async function getMedia(localRef:string):Promise<MediaRecord|null>{const db=await openDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(MEDIA_STORE,'readonly');const req=tx.objectStore(MEDIA_STORE).get(localRef);req.onsuccess=()=>resolve((req.result as MediaRecord|undefined)??null);req.onerror=()=>reject(req.error)})}finally{db.close()}}
async function removeMedia(localRef:string){const db=await openDb();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction(MEDIA_STORE,'readwrite');tx.objectStore(MEDIA_STORE).delete(localRef);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}finally{db.close()}}
function mediaRef(record:MediaRecord):VaultMediaReference{return{localRef:record.localRef,day:record.day,kind:'audio',mimeType:record.mimeType,byteLength:record.byteLength,durationSeconds:record.durationSeconds,cryptoAlg:'AES-256-GCM',cryptoVersion:1,ciphertextChecksumSha256:record.checksumSha256,recoveryState:'DEVICE_BOUND'}}

export function createWebMediaVaultPort():VaultMediaPort{return{
 capability(){return{encryptedMedia:true,serverReceivesRawMedia:false,deviceBound:true,recoveryConfigured:false}},
 async saveMedia(input){if(input.kind!=='audio')throw new Error('media_vault_kind_unsupported');validate(input);const key=await getKey(input.userId);const nonce=crypto.getRandomValues(new Uint8Array(12));const aad=JSON.stringify({schema:'hnk-media-vault-v1',user:input.userId,day:input.day,kind:'audio',mimeType:input.mimeType,durationSeconds:Number(input.durationSeconds.toFixed(3))});const sealed=await crypto.subtle.encrypt({name:'AES-GCM',iv:nonce,additionalData:new TextEncoder().encode(aad),tagLength:128},key,new Uint8Array(input.bytes));const payload={nonce:b64(nonce),ciphertext:b64(new Uint8Array(sealed)),aad};const localRef=`local-media-vault:${crypto.randomUUID()}`;const record:MediaRecord={localRef,userId:input.userId,day:input.day,kind:'audio',mimeType:input.mimeType,byteLength:input.bytes.byteLength,durationSeconds:Number(input.durationSeconds.toFixed(3)),...payload,checksumSha256:await checksum(payload),createdAt:new Date().toISOString()};await putMedia(record);return mediaRef(record)},
 async loadMedia(userId,localRef){const record=await getMedia(localRef);if(!record||record.userId!==userId)throw new Error('media_vault_entry_not_found');if(await checksum(record)!==record.checksumSha256)throw new Error('media_vault_checksum_mismatch');const key=await getKey(userId);const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(record.nonce),additionalData:new TextEncoder().encode(record.aad),tagLength:128},key,unb64(record.ciphertext));return{mimeType:record.mimeType,bytes:new Uint8Array(plain),durationSeconds:record.durationSeconds}},
 async deleteMedia(userId,localRef){const record=await getMedia(localRef);if(record&&record.userId!==userId)throw new Error('media_vault_entry_not_owned');await removeMedia(localRef)},
}}
