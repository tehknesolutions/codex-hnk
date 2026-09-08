import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ExperienceDirector, QuestRuntime, createQuestCatalog, type ExperienceDirective, type PlayerContext, type SessionSnapshot } from '@hnk/quest-engine';
import { createBundledQuestLibrary, type RuntimeQuestBundle } from '@hnk/quest-library';
import { sealDay005V1, startDay005PracticeSessionV1 } from '@hnk/supabase-client';
import { useHnkAuth } from '../auth/AuthContext';
import { QuestAudioPhase } from '../../runtime/QuestAudioPhase';
import { QuestBehavioralExperimentPhase, type BehavioralExperimentResult } from '../../runtime/QuestBehavioralExperimentPhase';

type Session = Awaited<ReturnType<typeof startDay005PracticeSessionV1>>;
type Seal = Extract<Awaited<ReturnType<typeof sealDay005V1>>, { ok: true }>['response'];

function canon(bundle: RuntimeQuestBundle, directive: ExperienceDirective): string[] {
  return (directive.phase.source.block_ids ?? []).map((id) => {
    const block = bundle.canon.blocks.find((entry) => entry.id === id);
    if (!block) throw new Error(`canonical_block_missing:${id}`);
    return block.text;
  });
}
function sessionKey(userId: string): string { return `hnk-mobile-d005-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

export function Day005GoldenV1Mobile() {
  const auth = useHnkAuth();
  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);
  const runtimeRef = useRef<QuestRuntime | null>(null);
  const [bundle,setBundle]=useState<RuntimeQuestBundle|null>(null);
  const [snapshot,setSnapshot]=useState<SessionSnapshot|null>(null);
  const [session,setSession]=useState<Session|null>(null);
  const [baseline,setBaseline]=useState<BehavioralExperimentResult|null>(null);
  const [breathSeconds,setBreathSeconds]=useState(0);
  const [audioCompleted,setAudioCompleted]=useState(false);
  const [gestureConfirmed,setGestureConfirmed]=useState(false);
  const [journalRecorded,setJournalRecorded]=useState(false);
  const [middleSeconds,setMiddleSeconds]=useState(0);
  const [difficulty,setDifficulty]=useState<number|null>(null);
  const [voluntary,setVoluntary]=useState(false);
  const [safetyStopped,setSafetyStopped]=useState(false);
  const [sealed,setSealed]=useState<Seal|null>(null);
  const [error,setError]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const context=useMemo<PlayerContext>(()=>({mediationMode:'HNK_CANONICAL',accessibility:{reducedMotion:false,audioEnabled:true,microphoneAvailable:false},offline:!live}),[live]);

  useEffect(()=>{let active=true;const library=createBundledQuestLibrary();const catalog=createQuestCatalog(library);void Promise.all([catalog.requireDay(5),library.loadBundle(5)]).then(([definition,loaded])=>{if(!active||!loaded)return;const runtime=new QuestRuntime(definition);runtimeRef.current=runtime;setBundle(loaded);setSnapshot(runtime.start());}).catch((cause)=>active&&setError(cause instanceof Error?cause.message:'day005_bundle_load_failed'));return()=>{active=false};},[]);
  const director=useMemo(()=>bundle?new ExperienceDirector(bundle.quest):null,[bundle]);
  const directive=useMemo(()=>director&&snapshot?.currentPhaseId?director.resolvePhase(snapshot.currentPhaseId,context,snapshot):null,[director,context,snapshot]);

  async function ensureSession():Promise<Session|null>{if(session)return session;if(!live||!auth.client||!auth.userId)return null;const created=await startDay005PracticeSessionV1(auth.client,{clientSessionId:sessionKey(auth.userId),appVersion:'0.1.0-mobile-day005-golden-v1'});setSession(created);return created;}
  async function completePhase(id:string){const runtime=runtimeRef.current;if(!runtime)return;if(id==='jachin_reading'||id==='breath_baseline')await ensureSession();if(id==='theta432_audio')setAudioCompleted(true);setSnapshot(runtime.completePhase(id));}
  async function safetyStop(reason?:string){setSafetyStopped(true);setError(reason??'safety_stop');if(runtimeRef.current)setSnapshot(runtimeRef.current.safetyStop());}
  function resume(){if(runtimeRef.current){setError(null);setSnapshot(runtimeRef.current.resume());}}

  async function seal(){
    if(!auth.client||!session||!runtimeRef.current||!baseline||!audioCompleted||!gestureConfirmed||!journalRecorded||!voluntary)return;
    if(breathSeconds<=0||middleSeconds<=0){setError('day005_required_duration_missing');return;}
    setBusy(true);setError(null);
    try{
      const result=await sealDay005V1(auth.client,{evidence:{sessionId:session.id,mode:'first_completion',baseline:{tensionBefore:baseline.before.tension_rating??5,tensionAfter:baseline.after.tension_rating_after??5},jachin:{durationSeconds:breathSeconds,cameraQrUsed:false},audio:{started:true},boaz:{},middle:{durationSeconds:middleSeconds},soulMirror:{difficultyRating:difficulty},safetyStopOccurred:safetyStopped},totalDurationSeconds:breathSeconds+middleSeconds});
      if(!result.ok)throw new Error(result.code);setSealed(result.response);setSnapshot(runtimeRef.current.confirmServerCompletion());
    }catch(cause){setError(cause instanceof Error?cause.message:'day005_completion_failed');}finally{setBusy(false);}
  }

  if(!bundle||!snapshot||!director)return <View style={styles.center}><Text style={styles.text}>CARREGANDO DAY 005…</Text>{error?<Text style={styles.error}>{error}</Text>:null}</View>;
  if(snapshot.runState==='SAFETY_STOP')return <View style={styles.center}><Text style={styles.title}>Prática pausada com segurança.</Text><Action label="RETOMAR" onPress={resume}/></View>;
  if(snapshot.runState==='COMPLETE'){const lit=sealed?.progression_events?.includes('KETHER_FRAGMENT_LIT')===true;return <View style={styles.center}><Text style={styles.eyebrow}>VEHUIAH · 5/5</Text><Text style={styles.title}>{lit?'FRAGMENTO I DA COROA ACESO':'CICLO REGISTRADO'}</Text><Text style={styles.big}>{lit?'◉':'○'}</Text><Text style={styles.text}>{sealed?.first_completion?`+${sealed.xp_awarded} XP canônicos.`:'Revisita sem novo XP.'}</Text><Text style={styles.text}>+1 VNT, quando elegível, é aplicado exclusivamente pelo servidor.</Text></View>}
  if(!directive)return <View style={styles.center}><Text style={styles.text}>FASE INDISPONÍVEL.</Text></View>;
  const phase=directive.phase;const texts=directive.requiresCanonicalContent?canon(bundle,directive):[];
  return <ScrollView contentContainerStyle={styles.shell}><View style={styles.header}><Text style={styles.eyebrow}>DIA 005 · KETHER · VEHUIAH 5/5</Text><Text style={styles.headerTitle}>BANIMENTO INICIAL POR INTENÇÃO</Text><Text style={styles.status}>{live?'BACKEND':'OFFLINE'}</Text></View>{error?<Text style={styles.error}>{error}</Text>:null}<View style={styles.panel}>
    <Text style={styles.eyebrow}>{phase.type} · {phase.id}</Text>
    {phase.type==='NARRATIVE'?<><Text style={styles.title}>Fechamento do primeiro ciclo.</Text><Text style={styles.text}>Presença e limite simbólico; nenhuma sensação extraordinária é exigida.</Text></>:null}
    {phase.type==='TERM_REVEAL'?<Text style={styles.text}>{(phase.terms??[]).join(' · ')}</Text>:null}
    {phase.type==='READ'?texts.map((text,i)=><Text style={styles.canon} key={i}>{text}</Text>):null}
    {phase.type==='INSTRUCTION'?(phase.content_intent??[]).map(item=><Text style={styles.systemText} key={item}>{item}</Text>):null}
    {phase.id==='altar_qr'?<Text style={styles.systemText}>Câmera opcional; se indisponível, inicie o áudio manualmente na próxima fase.</Text>:null}
    {phase.type==='EXPERIMENT'?<QuestBehavioralExperimentPhase directive={directive} onResult={setBaseline} onCompletePhase={completePhase} onSafetyStop={safetyStop}/>:null}
    {phase.type==='FOCUS'&&phase.id==='jachin_breath'?<TimedPractice label="RESPIRAÇÃO NATURAL · SEM FORÇAR" target={600} onFinish={(s)=>{setBreathSeconds(s);void completePhase(phase.id)}} onSafetyStop={()=>void safetyStop('breath_safety_stop')}/>:null}
    {phase.type==='FOCUS'&&phase.id==='boaz_gesture'?<><Text style={styles.systemText}>Somente mão vazia. Não use lâmina, ferramenta ou objeto cortante. Respire sem forçar.</Text><Action label={gestureConfirmed?'GESTO SEGURO REGISTRADO ✓':'CONFIRMAR GESTO SIMBÓLICO SEGURO'} onPress={()=>setGestureConfirmed(v=>!v)}/><Action disabled={!gestureConfirmed} label="CONTINUAR" onPress={()=>void completePhase(phase.id)}/><Action label="SAFETY STOP" onPress={()=>void safetyStop('gesture_safety_stop')}/></>:null}
    {phase.type==='FOCUS'&&phase.id==='dai_koo_myo_focus'?<><Text style={styles.glyph}>大光明</Text><Text style={styles.systemText}>Fallback textual do asset canônico HNK-KETHER-DAI-KOO-MYO-USUI-MASTER-V1. O renderer SVG nativo permanece uma tarefa visual separada; o símbolo não é redesenhado.</Text><TimedPractice label="DAI KOO MYO · FOCO" target={300} onFinish={(s)=>{setMiddleSeconds(s);void completePhase(phase.id)}} onSafetyStop={()=>void safetyStop('symbol_focus_safety_stop')}/></>:null}
    {phase.type==='AUDIO'?<QuestAudioPhase directive={directive} onCompletePhase={completePhase} onSafetyStop={safetyStop}/>:null}
    {phase.type==='RETURN'?<><Text style={styles.systemText}>Respire normalmente, movimente mãos e pés e oriente-se ao ambiente.</Text><Action label="ESTOU ORIENTADO · CONTINUAR" onPress={()=>void completePhase(phase.id)}/></>:null}
    {phase.type==='JOURNAL'?<><Text style={styles.systemText}>O texto fica no Vault. O servidor recebe apenas que houve registro.</Text><Action label={journalRecorded?'REGISTRO PRIVADO ✓':'CONFIRMAR REGISTRO PRIVADO'} onPress={()=>setJournalRecorded(v=>!v)}/><Action disabled={!journalRecorded} label="CONTINUAR" onPress={()=>void completePhase(phase.id)}/></>:null}
    {phase.type==='STRUCTURED_JOURNAL'?<><Text style={styles.systemText}>Espelho da Alma · dificuldade percebida.</Text><View style={styles.scale}>{[0,2,4,6,8,10].map(v=><Pressable key={v} onPress={()=>setDifficulty(v)} style={[styles.chip,difficulty===v&&styles.activeChip]}><Text style={styles.text}>{v}</Text></Pressable>)}</View><Action label="CONCLUIR ESPELHO" onPress={()=>void completePhase(phase.id)}/></>:null}
    {phase.type==='COMPLETION'?<><Text style={styles.title}>Selo de Vehuiah</Text><Text style={styles.systemText}>Servidor: +100 XP, +1 VNT se elegível e Fragmento I em 5/5.</Text><Action label={voluntary?'CONCLUSÃO VOLUNTÁRIA ✓':'CONFIRMAR CONCLUSÃO VOLUNTÁRIA'} onPress={()=>setVoluntary(v=>!v)}/><Action disabled={busy||!voluntary} label={busy?'SELANDO…':'SELAR DAY 005'} onPress={()=>void seal()}/></>:null}
    {['NARRATIVE','TERM_REVEAL','READ','INSTRUCTION','UNLOCK'].includes(phase.type)?<Action label="CONTINUAR" onPress={()=>void completePhase(phase.id)}/>:null}
  </View></ScrollView>;
}

function TimedPractice({label,target,onFinish,onSafetyStop}:{label:string;target:number;onFinish:(seconds:number)=>void;onSafetyStop:()=>void}){const[seconds,setSeconds]=useState(0);const[running,setRunning]=useState(false);useEffect(()=>{if(!running)return;const id=setInterval(()=>setSeconds(v=>v+1),1000);return()=>clearInterval(id)},[running]);return <View style={styles.practice}><Text style={styles.text}>{label}</Text><Text style={styles.text}>{seconds}s / {target}s canônicos</Text><Action label={running?'PAUSAR':'INICIAR / RETOMAR'} onPress={()=>setRunning(v=>!v)}/><Action disabled={seconds<=0} label="CONCLUIR PRÁTICA" onPress={()=>onFinish(seconds)}/><Action label="SAFETY STOP" onPress={onSafetyStop}/></View>}
function Action({label,onPress,disabled=false}:{label:string;onPress:()=>void;disabled?:boolean}){return <Pressable disabled={disabled} onPress={onPress} style={[styles.button,disabled&&styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>}

const styles=StyleSheet.create({shell:{padding:20,paddingBottom:80,backgroundColor:'#090910',minHeight:'100%'},center:{flex:1,padding:28,justifyContent:'center',backgroundColor:'#090910',gap:14},header:{marginBottom:20,gap:5},headerTitle:{color:'#f4e6b2',fontSize:25,fontWeight:'800'},status:{color:'#aaa18d',fontSize:12},panel:{borderWidth:1,borderColor:'#6f5f29',borderRadius:18,padding:18,gap:14,backgroundColor:'#111018'},practice:{gap:10},eyebrow:{color:'#d9bd67',fontSize:12,letterSpacing:1.4},title:{color:'#f4e6b2',fontSize:22,fontWeight:'700'},big:{color:'#e4c870',fontSize:72,textAlign:'center'},glyph:{color:'#e4c870',fontSize:64,textAlign:'center'},text:{color:'#eee7d7',lineHeight:21},canon:{color:'#eee7d7',lineHeight:24,fontSize:15},systemText:{color:'#cfc3a4',lineHeight:21},error:{color:'#ffb4ab'},scale:{flexDirection:'row',flexWrap:'wrap',gap:6},chip:{borderWidth:1,borderColor:'#6f5f29',borderRadius:999,paddingHorizontal:10,paddingVertical:7},activeChip:{backgroundColor:'#4b3e16'},button:{borderWidth:1,borderColor:'#9a8240',borderRadius:12,padding:12,alignItems:'center'},disabled:{opacity:0.4},buttonText:{color:'#f4e6b2',fontWeight:'700'}});
