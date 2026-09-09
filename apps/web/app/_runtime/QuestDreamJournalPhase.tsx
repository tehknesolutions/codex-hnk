'use client';

import { useState } from 'react';
import type { ExperienceDirective } from '@hnk/quest-engine';
import type { VaultTextPort } from '@hnk/vault-contract';

export type DreamRecallStatus='REMEMBERED'|'NO_RECALL';
export type DreamJournalResult=
 |{mode:'CAPTURE';recallStatus:DreamRecallStatus;dreamVaultEntryRef?:string;emotionRecorded:boolean;scenarioRecorded:boolean;firstDetailRecorded:boolean}
 |{mode:'SEPARATE';separationCompleted:true;interpretationIsHypothesisConfirmed:true;sleepProtectionConfirmed:true}
 |{mode:'REFLECT';associationsCount:number;reflectionVaultEntryRef?:string;analysisStoppedConfirmed:true};

export interface QuestDreamJournalPhaseProps{directive:ExperienceDirective;port:VaultTextPort;userId:string;recallStatus?:DreamRecallStatus;onResult:(result:DreamJournalResult)=>void;onCompletePhase:(phaseId:string)=>void|Promise<void>;onSafetyStop:(reason?:string)=>void|Promise<void>}

export function QuestDreamJournalPhase({directive,port,userId,recallStatus:externalRecall,onResult,onCompletePhase,onSafetyStop}:QuestDreamJournalPhaseProps){
 const mode=String(directive.phase.interaction?.mode??'CAPTURE') as 'CAPTURE'|'SEPARATE'|'REFLECT';
 const[recall,setRecall]=useState<DreamRecallStatus>(externalRecall??'REMEMBERED');const[a,setA]=useState('');const[b,setB]=useState('');const[c,setC]=useState('');const[d,setD]=useState('');const[busy,setBusy]=useState(false);const[error,setError]=useState<string|null>(null);
 const cap=port.capability();
 async function finish(){setBusy(true);setError(null);try{
  if(mode==='CAPTURE'){
   if(recall==='NO_RECALL'){onResult({mode:'CAPTURE',recallStatus:'NO_RECALL',emotionRecorded:false,scenarioRecorded:false,firstDetailRecorded:false});await onCompletePhase(directive.phase.id);return}
   if(!a.trim()||!b.trim()||!c.trim()||!d.trim())throw new Error('dream_capture_fields_required');
   const saved=await port.saveText({userId,day:9,kind:'dream',plaintext:JSON.stringify({schema:'hnk-dream-capture-v1',description:a,emotion:b,scenario:c,firstDetail:d})});
   onResult({mode:'CAPTURE',recallStatus:'REMEMBERED',dreamVaultEntryRef:saved.entryId,emotionRecorded:true,scenarioRecorded:true,firstDetailRecorded:true});await onCompletePhase(directive.phase.id);return;
  }
  if(mode==='SEPARATE'){
   if(externalRecall==='REMEMBERED'){
    if(!a.trim()||!b.trim()||!c.trim())throw new Error('dream_separation_fields_required');
    await port.saveText({userId,day:9,kind:'journal',plaintext:JSON.stringify({schema:'hnk-dream-separation-v1',whatIDreamed:a,whatIFelt:b,whatIThink:c,interpretationStatus:'PERSONAL_HYPOTHESIS'})});
   }
   onResult({mode:'SEPARATE',separationCompleted:true,interpretationIsHypothesisConfirmed:true,sleepProtectionConfirmed:true});await onCompletePhase(directive.phase.id);return;
  }
  if(externalRecall==='REMEMBERED'){
   if(!a.trim()||!b.trim()||!c.trim())throw new Error('three_associations_required');
   const saved=await port.saveText({userId,day:9,kind:'journal',plaintext:JSON.stringify({schema:'hnk-dream-reflection-v1',associations:[a,b,c],universalMeaningClaimed:false})});
   onResult({mode:'REFLECT',associationsCount:3,reflectionVaultEntryRef:saved.entryId,analysisStoppedConfirmed:true});await onCompletePhase(directive.phase.id);return;
  }
  onResult({mode:'REFLECT',associationsCount:0,analysisStoppedConfirmed:true});await onCompletePhase(directive.phase.id);
 }catch(e){setError(e instanceof Error?e.message:'dream_journal_failed')}finally{setBusy(false)}}
 return <div style={{display:'grid',gap:12,border:'1px solid #6f5f29',borderRadius:18,padding:18}}>
  <small>DIÁRIO ONÍRICO · {mode}</small>
  <p>O conteúdo é cifrado no seu dispositivo antes do envio. O servidor recebe apenas ciphertext e uma referência opaca.</p>
  {cap.deviceBound&&!cap.recoveryConfigured?<p style={{color:'#d9bd67'}}>Vault V1 é ligado a este dispositivo. Sem recovery configurado, perder os dados locais de chave pode tornar registros antigos irrecuperáveis.</p>:null}
  <p>Captura de áudio criptografada ainda não está disponível nesta V1; texto criptografado ou “sem lembrança” são caminhos completos.</p>
  {mode==='CAPTURE'?<><label><input type="radio" checked={recall==='REMEMBERED'} onChange={()=>setRecall('REMEMBERED')}/> Lembrei de algo</label><label><input type="radio" checked={recall==='NO_RECALL'} onChange={()=>setRecall('NO_RECALL')}/> Sem lembrança hoje</label>{recall==='REMEMBERED'?<><textarea placeholder="O que aconteceu no sonho?" value={a} onChange={e=>setA(e.target.value)}/><input placeholder="Emoção predominante" value={b} onChange={e=>setB(e.target.value)}/><input placeholder="Cenário principal" value={c} onChange={e=>setC(e.target.value)}/><input placeholder="Primeiro detalhe lembrado" value={d} onChange={e=>setD(e.target.value)}/></>:null}</>:null}
  {mode==='SEPARATE'&&externalRecall==='REMEMBERED'?<><textarea placeholder="O que sonhei — descrição" value={a} onChange={e=>setA(e.target.value)}/><textarea placeholder="O que senti" value={b} onChange={e=>setB(e.target.value)}/><textarea placeholder="O que penso — hipótese pessoal" value={c} onChange={e=>setC(e.target.value)}/></>:null}
  {mode==='SEPARATE'&&externalRecall==='NO_RECALL'?<p>“Sem lembrança hoje” permanece um dado válido. Não invente conteúdo.</p>:null}
  {mode==='REFLECT'&&externalRecall==='REMEMBERED'?<><input placeholder="Associação pessoal 1" value={a} onChange={e=>setA(e.target.value)}/><input placeholder="Associação pessoal 2" value={b} onChange={e=>setB(e.target.value)}/><input placeholder="Associação pessoal 3" value={c} onChange={e=>setC(e.target.value)}/><p>Associações são pessoais; não são significado universal nem previsão.</p></>:null}
  {mode==='REFLECT'&&externalRecall==='NO_RECALL'?<p>Sem imagem lembrada, não há associações a fabricar. Siga adiante.</p>:null}
  {error?<p style={{color:'#ffb4ab'}}>{error}</p>:null}<button disabled={busy} onClick={()=>void finish()}>{busy?'CIFRANDO…':'SALVAR COM SEGURANÇA · CONTINUAR'}</button><button onClick={()=>void onSafetyStop('dream_journal_stop')}>ENCERRAR POR AGORA</button>
 </div>
}
