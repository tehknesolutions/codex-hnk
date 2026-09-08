'use client';

import { useEffect, useState } from 'react';
import type { ExperienceDirective } from '@hnk/quest-engine';

export interface VoicePracticeResult { durationSeconds:number; voiceRecorded:false; }
export function QuestVoicePhase({directive,onResult,onCompletePhase,onSafetyStop}:{directive:ExperienceDirective;onResult:(result:VoicePracticeResult)=>void;onCompletePhase:(id:string)=>void|Promise<void>;onSafetyStop:(reason?:string)=>void|Promise<void>}){
  const[seconds,setSeconds]=useState(0);const[running,setRunning]=useState(false);const vocalization=String(directive.phase.interaction?.vocalization??'VOCALIZAÇÃO LIVRE');
  useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSeconds(v=>v+1),1000);return()=>window.clearInterval(id)},[running]);
  return <section style={{display:'grid',gap:12}} data-voice-recording="optional-disabled-until-vault-media-adapter">
    <strong>PRÁTICA VOCAL VOLUNTÁRIA</strong><p>{vocalization}</p>
    <p>Você pode realizar a prática sem gravar. Nenhuma gravação é exigida para conclusão ou XP.</p>
    <p>Gravação opcional só será oferecida quando puder permanecer no Vault criptografado local; não há upload nem transcrição automática.</p>
    <p>{seconds}s</p><button type="button" onClick={()=>setRunning(v=>!v)}>{running?'PAUSAR':'INICIAR / RETOMAR'}</button>
    <button type="button" disabled={seconds<=0} onClick={()=>{onResult({durationSeconds:seconds,voiceRecorded:false});void onCompletePhase(directive.phase.id)}}>CONCLUIR PRÁTICA SEM GRAVAR</button>
    <button type="button" onClick={()=>void onSafetyStop('voice_safety_stop')}>ENCERRAR COM SEGURANÇA</button>
  </section>;
}
