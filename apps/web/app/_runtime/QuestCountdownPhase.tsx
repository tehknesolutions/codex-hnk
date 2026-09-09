'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ExperienceDirective } from '@hnk/quest-engine';

export interface CountdownPracticeResult {
  finalNumber: number;
  attentionReturns: number;
  durationSeconds: number;
  silentObservationSeconds: number;
}

export function QuestCountdownPhase({directive,onResult,onCompletePhase,onSafetyStop}:{directive:ExperienceDirective;onResult:(result:CountdownPracticeResult)=>void;onCompletePhase:(phaseId:string)=>void|Promise<void>;onSafetyStop:(reason?:string)=>void|Promise<void>}){
  const start=Number(directive.phase.interaction?.starting_number??100);
  const min=Number(directive.phase.interaction?.minimum_number??1);
  const silentTarget=Number(directive.phase.interaction?.silent_observation_seconds??0);
  const [current,setCurrent]=useState(start);
  const [started,setStarted]=useState(false);
  const [attentionReturns,setAttentionReturns]=useState(0);
  const [seconds,setSeconds]=useState(0);
  const [silentMode,setSilentMode]=useState(false);
  const [silentSeconds,setSilentSeconds]=useState(0);
  const safeBounds=useMemo(()=>Number.isInteger(start)&&Number.isInteger(min)&&start>=min&&min>=1,[start,min]);

  useEffect(()=>{if(!started||silentMode)return;const id=window.setInterval(()=>setSeconds(v=>v+1),1000);return()=>window.clearInterval(id)},[started,silentMode]);
  useEffect(()=>{if(!silentMode||silentSeconds>=silentTarget)return;const id=window.setInterval(()=>setSilentSeconds(v=>Math.min(v+1,silentTarget)),1000);return()=>window.clearInterval(id)},[silentMode,silentSeconds,silentTarget]);

  if(!safeBounds)return <p>Configuração de contagem inválida.</p>;
  const canFinish=silentTarget===0 ? started : silentMode&&silentSeconds>=silentTarget;
  function finish(){if(!canFinish)return;onResult({finalNumber:current,attentionReturns,durationSeconds:seconds,silentObservationSeconds:silentSeconds});void onCompletePhase(directive.phase.id)}

  return <section style={{display:'grid',gap:14}} data-countdown-user-paced="true">
    <strong>CONTAGEM REGRESSIVA · RITMO DO PRATICANTE</strong>
    <p>Você não precisa chegar a 1. Perder a conta não é falha: retome do último número lembrado.</p>
    <div aria-live="polite" style={{fontSize:72,textAlign:'center',fontVariantNumeric:'tabular-nums'}}>{current}</div>
    {!started?<button type="button" onClick={()=>setStarted(true)}>INICIAR EM {start}</button>:null}
    {started&&!silentMode?<>
      <button type="button" disabled={current<=min} onClick={()=>setCurrent(v=>Math.max(min,v-1))}>EXPIRAR · DEIXAR O NÚMERO IR</button>
      <button type="button" onClick={()=>setAttentionReturns(v=>v+1)}>PERCEBI UMA DISTRAÇÃO · RETOMEI</button>
      <p>Retornos de atenção: {attentionReturns}</p>
      {silentTarget>0?<button type="button" onClick={()=>setSilentMode(true)}>PARAR A CONTAGEM AQUI · ENTRAR EM SILÊNCIO</button>:<button type="button" onClick={finish}>PARAR AQUI · CONCLUIR CONTAGEM</button>}
    </>:null}
    {silentMode?<><p>Silêncio de integração: {silentSeconds}s / {silentTarget}s</p><button type="button" disabled={silentSeconds<silentTarget} onClick={finish}>CONCLUIR APÓS O SILÊNCIO</button></>:null}
    <button type="button" onClick={()=>void onSafetyStop('countdown_safety_stop')}>ENCERRAR COM SEGURANÇA</button>
  </section>;
}
