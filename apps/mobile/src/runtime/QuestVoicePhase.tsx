import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExperienceDirective } from '@hnk/quest-engine';

export interface VoicePracticeResult { durationSeconds:number; voiceRecorded:false; }
export function QuestVoicePhase({directive,onResult,onCompletePhase,onSafetyStop}:{directive:ExperienceDirective;onResult:(result:VoicePracticeResult)=>void;onCompletePhase:(id:string)=>void|Promise<void>;onSafetyStop:(reason?:string)=>void|Promise<void>}){
  const[seconds,setSeconds]=useState(0);const[running,setRunning]=useState(false);const vocalization=String(directive.phase.interaction?.vocalization??'VOCALIZAÇÃO LIVRE');
  useEffect(()=>{if(!running)return;const id=setInterval(()=>setSeconds(v=>v+1),1000);return()=>clearInterval(id)},[running]);
  return <View style={styles.panel}>
    <Text style={styles.eyebrow}>PRÁTICA VOCAL VOLUNTÁRIA</Text><Text style={styles.title}>{vocalization}</Text>
    <Text style={styles.text}>Você pode praticar sem gravar. Gravação nunca é requisito de conclusão ou XP.</Text>
    <Text style={styles.notice}>O botão de gravação só será habilitado quando houver adapter de mídia para Vault local criptografado; não há upload/transcrição automática.</Text>
    <Text style={styles.text}>{seconds}s</Text>
    <Action label={running?'PAUSAR':'INICIAR / RETOMAR'} onPress={()=>setRunning(v=>!v)}/>
    <Action disabled={seconds<=0} label="CONCLUIR SEM GRAVAR" onPress={()=>{onResult({durationSeconds:seconds,voiceRecorded:false});void onCompletePhase(directive.phase.id)}}/>
    <Action label="ENCERRAR COM SEGURANÇA" onPress={()=>void onSafetyStop('voice_safety_stop')}/>
  </View>;
}
function Action({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}){return <Pressable disabled={disabled} onPress={onPress} style={[styles.button,disabled&&styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>}
const styles=StyleSheet.create({panel:{gap:12,padding:18,borderRadius:18,borderWidth:1,borderColor:'#6f5f29',backgroundColor:'#111018'},eyebrow:{color:'#d9bd67',fontSize:12,letterSpacing:1.4},title:{color:'#f4e6b2',fontSize:20,fontWeight:'700'},text:{color:'#eee7d7',lineHeight:21},notice:{color:'#cfc3a4',lineHeight:20},button:{borderWidth:1,borderColor:'#9a8240',borderRadius:12,padding:12,alignItems:'center'},disabled:{opacity:.4},buttonText:{color:'#f4e6b2',fontWeight:'700'}});
