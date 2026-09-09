import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExperienceDirective } from '@hnk/quest-engine';

export interface CountdownPracticeResult {
  finalNumber:number;
  attentionReturns:number;
  durationSeconds:number;
  silentObservationSeconds:number;
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
  useEffect(()=>{if(!started||silentMode)return;const id=setInterval(()=>setSeconds(v=>v+1),1000);return()=>clearInterval(id)},[started,silentMode]);
  useEffect(()=>{if(!silentMode||silentSeconds>=silentTarget)return;const id=setInterval(()=>setSilentSeconds(v=>Math.min(v+1,silentTarget)),1000);return()=>clearInterval(id)},[silentMode,silentSeconds,silentTarget]);
  if(!safeBounds)return <Text style={styles.text}>Configuração de contagem inválida.</Text>;
  const canFinish=silentTarget===0?started:silentMode&&silentSeconds>=silentTarget;
  function finish(){if(!canFinish)return;onResult({finalNumber:current,attentionReturns,durationSeconds:seconds,silentObservationSeconds:silentSeconds});void onCompletePhase(directive.phase.id)}
  return <View style={styles.panel}>
    <Text style={styles.eyebrow}>CONTAGEM REGRESSIVA · RITMO DO PRATICANTE</Text>
    <Text style={styles.text}>Você não precisa chegar a 1. Perder a conta não é falha: retome do último número lembrado.</Text>
    <Text accessibilityLiveRegion="polite" style={styles.number}>{current}</Text>
    {!started?<Action label={`INICIAR EM ${start}`} onPress={()=>setStarted(true)}/>:null}
    {started&&!silentMode?<>
      <Action disabled={current<=min} label="EXPIRAR · DEIXAR O NÚMERO IR" onPress={()=>setCurrent(v=>Math.max(min,v-1))}/>
      <Action label="PERCEBI UMA DISTRAÇÃO · RETOMEI" onPress={()=>setAttentionReturns(v=>v+1)}/>
      <Text style={styles.text}>Retornos de atenção: {attentionReturns}</Text>
      {silentTarget>0?<Action label="PARAR A CONTAGEM AQUI · ENTRAR EM SILÊNCIO" onPress={()=>setSilentMode(true)}/>:<Action label="PARAR AQUI · CONCLUIR CONTAGEM" onPress={finish}/>} 
    </>:null}
    {silentMode?<><Text style={styles.text}>Silêncio de integração: {silentSeconds}s / {silentTarget}s</Text><Action disabled={silentSeconds<silentTarget} label="CONCLUIR APÓS O SILÊNCIO" onPress={finish}/></>:null}
    <Action label="ENCERRAR COM SEGURANÇA" onPress={()=>void onSafetyStop('countdown_safety_stop')}/>
  </View>;
}
function Action({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}){return <Pressable disabled={disabled} onPress={onPress} style={[styles.button,disabled&&styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>}
const styles=StyleSheet.create({panel:{gap:12,padding:18,borderRadius:18,borderWidth:1,borderColor:'#6f5f29',backgroundColor:'#111018'},eyebrow:{color:'#d9bd67',fontSize:12,letterSpacing:1.4},text:{color:'#eee7d7',lineHeight:21},number:{color:'#f4e6b2',fontSize:72,textAlign:'center',fontVariant:['tabular-nums']},button:{borderWidth:1,borderColor:'#9a8240',borderRadius:12,padding:12,alignItems:'center'},disabled:{opacity:.4},buttonText:{color:'#f4e6b2',fontWeight:'700'}});
