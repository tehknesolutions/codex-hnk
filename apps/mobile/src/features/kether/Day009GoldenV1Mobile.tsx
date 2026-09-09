import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { ExperienceDirector, QuestRuntime, createQuestCatalog, type ExperienceDirective, type PlayerContext, type SessionSnapshot } from '@hnk/quest-engine';
import { createBundledQuestLibrary, type RuntimeQuestBundle } from '@hnk/quest-library';
import { loadDay009PracticeSessionV1, sealDay009V1, startDay009PracticeSessionV1 } from '@hnk/supabase-client';
import { useHnkAuth } from '../auth/AuthContext';
import { QuestDreamJournalPhase, type DreamJournalResult, type DreamRecallStatus } from '../../runtime/QuestDreamJournalPhase';
import { createMobileVaultTextPort } from '../../runtime/MobileVaultTextPort';

type Session=NonNullable<Awaited<ReturnType<typeof loadDay009PracticeSessionV1>>>;
type Seal=Extract<Awaited<ReturnType<typeof sealDay009V1>>,{ok:true}>['response'];

function canon(bundle:RuntimeQuestBundle,d:ExperienceDirective){return(d.phase.source.block_ids??[]).map(id=>{const b=bundle.canon.blocks.find(x=>x.id===id);if(!b)throw new Error(`canonical_block_missing:${id}`);return b.text})}
function clientId(userId:string){return`hnk-mobile-d009-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function keys(userId:string){return{snapshot:`hnk.quest.d009.${userId}.snapshot.v1`,session:`hnk.quest.d009.${userId}.practice-session.v1`}}
async function loadSnapshot(key:string):Promise<SessionSnapshot|null>{try{const raw=await SecureStore.getItemAsync(key);return raw?JSON.parse(raw) as SessionSnapshot:null}catch{return null}}
async function saveSnapshot(key:string,snapshot:SessionSnapshot){await SecureStore.setItemAsync(key,JSON.stringify(snapshot))}

export function Day009GoldenV1Mobile(){
 const auth=useHnkAuth();
 const live=Boolean(auth.configured&&auth.phase==='signed-in'&&auth.client&&auth.userId);
 const runtimeRef=useRef<QuestRuntime|null>(null);
 const[bundle,setBundle]=useState<RuntimeQuestBundle|null>(null);
 const[snapshot,setSnapshot]=useState<SessionSnapshot|null>(null);
 const[session,setSession]=useState<Session|null>(null);
 const[sleepConfirmed,setSleepConfirmed]=useState(false);
 const[capture,setCapture]=useState<Extract<DreamJournalResult,{mode:'CAPTURE'}>|null>(null);
 const[separated,setSeparated]=useState(false);
 const[reflection,setReflection]=useState<Extract<DreamJournalResult,{mode:'REFLECT'}>|null>(null);
 const[wakeTime,setWakeTime]=useState('');
 const[sleepQuality,setSleepQuality]=useState(5);
 const[keyword,setKeyword]=useState('');
 const[mirrorSaved,setMirrorSaved]=useState(false);
 const[voluntary,setVoluntary]=useState(false);
 const[safetyStopped,setSafetyStopped]=useState(false);
 const[sealed,setSealed]=useState<Seal|null>(null);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState<string|null>(null);
 const context=useMemo<PlayerContext>(()=>({mediationMode:'HNK_CANONICAL',accessibility:{reducedMotion:false,audioEnabled:false,microphoneAvailable:false},offline:!live}),[live]);

 useEffect(()=>{if(!auth.userId)return;let active=true;const library=createBundledQuestLibrary();const catalog=createQuestCatalog(library);const k=keys(auth.userId).snapshot;void Promise.all([catalog.requireDay(9),library.loadBundle(9),loadSnapshot(k)]).then(([definition,loaded,saved])=>{if(!active||!loaded)return;const r=new QuestRuntime(definition);runtimeRef.current=r;setBundle(loaded);setSnapshot(saved?r.restore(saved):r.start())}).catch(e=>active&&setError(e instanceof Error?e.message:'day009_bundle_load_failed'));return()=>{active=false}},[auth.userId]);
 useEffect(()=>{if(!auth.userId||!snapshot)return;const k=keys(auth.userId).snapshot;if(snapshot.runState==='COMPLETE')void SecureStore.deleteItemAsync(k);else void saveSnapshot(k,snapshot)},[auth.userId,snapshot]);
 useEffect(()=>{if(!live||!auth.client||!auth.userId||session)return;const k=keys(auth.userId).session;void SecureStore.getItemAsync(k).then(id=>{if(!id)return;return loadDay009PracticeSessionV1(auth.client!,id).then(s=>{if(s)setSession(s);else void SecureStore.deleteItemAsync(k)}).catch(()=>void SecureStore.deleteItemAsync(k))})},[auth.client,auth.userId,live,session]);

 const director=useMemo(()=>bundle?new ExperienceDirector(bundle.quest):null,[bundle]);
 const directive=useMemo(()=>director&&snapshot?.currentPhaseId?director.resolvePhase(snapshot.currentPhaseId,context,snapshot):null,[director,context,snapshot]);
 const vault=useMemo(()=>live&&auth.client?createMobileVaultTextPort(auth.client):null,[auth.client,live]);

 async function ensureSession(){if(session)return session;if(!live||!auth.client||!auth.userId)return null;const created=await startDay009PracticeSessionV1(auth.client,{clientSessionId:clientId(auth.userId),appVersion:'0.1.0-mobile-day009-golden-v1'});setSession(created);await SecureStore.setItemAsync(keys(auth.userId).session,created.id);return created}
 async function completePhase(id:string){const r=runtimeRef.current;if(!r)return;setError(null);try{if(id==='jachin_reading'||id==='pre_sleep_prepare')await ensureSession();setSnapshot(r.completePhase(id))}catch(e){setError(e instanceof Error?e.message:'phase_completion_failed')}}
 function stop(reason?:string){setSafetyStopped(true);setError(reason??'safety_stop');if(runtimeRef.current)setSnapshot(runtimeRef.current.safetyStop())}
 function resume(){if(runtimeRef.current){setError(null);setSnapshot(runtimeRef.current.resume())}}
 async function saveMirror(){if(!vault||!auth.userId)throw new Error('vault_connection_required');if(!wakeTime.trim())throw new Error('wake_time_required');await vault.saveText({userId:auth.userId,day:9,kind:'journal',plaintext:JSON.stringify({schema:'hnk-dream-mirror-v1',wakeTimeApprox:wakeTime,sleepQuality,keyword:keyword.trim()||null})});setMirrorSaved(true)}
 async function seal(){if(!auth.client||!auth.userId||!session||!runtimeRef.current||!capture||!reflection||!separated||!mirrorSaved||!sleepConfirmed||!voluntary)return;setBusy(true);setError(null);try{const elapsed=Math.max(0,Math.floor((Date.now()-new Date(session.started_at).getTime())/1000));const result=await sealDay009V1(auth.client,{evidence:{sessionId:session.id,mode:'first_completion',sleepEpisodeConfirmed:true,recallStatus:capture.recallStatus,dreamVaultEntryRef:capture.dreamVaultEntryRef,emotionRecorded:capture.emotionRecorded,scenarioRecorded:capture.scenarioRecorded,firstDetailRecorded:capture.firstDetailRecorded,separationCompleted:true,interpretationIsHypothesisConfirmed:true,sleepProtectionConfirmed:true,associationsCount:reflection.associationsCount,reflectionVaultEntryRef:reflection.reflectionVaultEntryRef,analysisStoppedConfirmed:true,wakeTimeRecorded:true,sleepQualityRecorded:true,keywordRecorded:Boolean(keyword.trim()),safetyStopOccurred:safetyStopped},totalDurationSeconds:elapsed});if(!result.ok)throw new Error(result.code);setSealed(result.response);setSnapshot(runtimeRef.current.confirmServerCompletion());await SecureStore.deleteItemAsync(keys(auth.userId).session)}catch(e){setError(e instanceof Error?e.message:'day009_completion_failed')}finally{setBusy(false)}}

 if(!auth.userId)return <View style={styles.center}><Text style={styles.text}>ENTRE NO ÁTRIO PARA INICIAR O DIA 009.</Text></View>;
 if(!bundle||!snapshot||!director)return <View style={styles.center}><Text style={styles.text}>CARREGANDO DAY 009…</Text>{error?<Text style={styles.error}>{error}</Text>:null}</View>;
 if(snapshot.runState==='SAFETY_STOP')return <View style={styles.center}><Text style={styles.title}>Jornada pausada.</Text><Action label="RETOMAR" onPress={resume}/></View>;
 if(snapshot.runState==='COMPLETE')return <View style={styles.center}><Text style={styles.eyebrow}>DIA 009 · JELIEL 4/5</Text><Text style={styles.title}>DIÁRIO ONÍRICO REGISTRADO</Text><Text style={styles.text}>{sealed?.first_completion?`+${sealed.xp_awarded} XP canônicos.`:'Revisita sem novo XP.'}</Text><Text style={styles.text}>0 ganho de atributo. Conteúdo do sonho permaneceu cifrado.</Text></View>;
 if(!directive)return <View style={styles.center}><Text style={styles.text}>FASE INDISPONÍVEL.</Text></View>;
 const p=directive.phase;const texts=directive.requiresCanonicalContent?canon(bundle,directive):[];const recall:DreamRecallStatus|undefined=capture?.recallStatus;
 return <ScrollView contentContainerStyle={styles.shell}><Text style={styles.eyebrow}>DIA 009 · KETHER · JELIEL 4/5</Text><Text style={styles.headerTitle}>DIÁRIO DE SONHOS PSICONÁUTICO</Text><Text style={styles.status}>{live?'VAULT E2EE · ONLINE':'OFFLINE · SYNC NECESSÁRIO PARA SALVAR'}</Text>{error?<Text style={styles.error}>{error}</Text>:null}<View style={styles.panel}><Text style={styles.eyebrow}>{p.type} · {p.id}</Text>
  {p.type==='NARRATIVE'?<><Text style={styles.title}>Recorde antes de interpretar.</Text><Text style={styles.text}>Não lembrar também é dado válido. Não force revelações.</Text></>:null}
  {p.type==='TERM_REVEAL'?<Text style={styles.text}>{(p.terms??[]).join(' · ')}</Text>:null}
  {p.type==='READ'?texts.map((t,i)=><Text key={i} style={styles.canon}>{t}</Text>):null}
  {p.type==='INSTRUCTION'?<><Text style={styles.text}>Prepare o diário antes de dormir. Não sacrifique seu sono nem induza despertares desconfortáveis.</Text><Action label="PREPAREI · PAUSAR ATÉ O DESPERTAR" onPress={()=>void completePhase(p.id)}/></>:null}
  {p.type==='JOURNAL'&&p.id==='wake_capture'?<>{!sleepConfirmed?<Action label="CONFIRMAR QUE ESTOU RETOMANDO APÓS SONO" onPress={()=>setSleepConfirmed(true)}/>:null}{sleepConfirmed&&vault?<QuestDreamJournalPhase directive={directive} port={vault} userId={auth.userId} onResult={r=>{if(r.mode==='CAPTURE')setCapture(r)}} onCompletePhase={completePhase} onSafetyStop={stop}/>:<Text style={styles.text}>Conexão autenticada é necessária para persistir ciphertext no Vault.</Text>}</>:null}
  {p.type==='JOURNAL'&&p.id==='boaz_separation'&&capture&&vault?<QuestDreamJournalPhase directive={directive} port={vault} userId={auth.userId} recallStatus={recall} onResult={r=>{if(r.mode==='SEPARATE')setSeparated(true)}} onCompletePhase={completePhase} onSafetyStop={stop}/>:null}
  {p.type==='JOURNAL'&&p.id==='middle_reflection'&&capture&&vault?<QuestDreamJournalPhase directive={directive} port={vault} userId={auth.userId} recallStatus={recall} onResult={r=>{if(r.mode==='REFLECT')setReflection(r)}} onCompletePhase={completePhase} onSafetyStop={stop}/>:null}
  {p.type==='RETURN'?<><Text style={styles.text}>Encerre a análise, respire e volte ao dia desperto.</Text><Action label="ESTOU ORIENTADO · CONTINUAR" onPress={()=>void completePhase(p.id)}/></>:null}
  {p.type==='STRUCTURED_JOURNAL'?<><TextInput value={wakeTime} onChangeText={setWakeTime} placeholder="Horário aproximado do despertar" placeholderTextColor="#817967" style={styles.input}/><Text style={styles.text}>QUALIDADE PERCEBIDA DO SONO · {sleepQuality}</Text><View style={styles.row}>{[0,2,4,6,8,10].map(v=><Action key={v} compact label={String(v)} onPress={()=>setSleepQuality(v)}/>)}</View><TextInput value={keyword} onChangeText={setKeyword} placeholder="Palavra-chave (opcional se sem lembrança)" placeholderTextColor="#817967" style={styles.input}/><Action disabled={!vault} label={mirrorSaved?'SALVO NO VAULT ✓':'CIFRAR ESPELHO · CONTINUAR'} onPress={()=>void saveMirror().then(()=>completePhase(p.id)).catch(e=>setError(e instanceof Error?e.message:'mirror_save_failed'))}/></>:null}
  {p.type==='COMPLETION'?<><Text style={styles.title}>Selo canônico</Text><Text style={styles.text}>O servidor recebe somente Evidence estruturada e refs opacas; nunca o sonho.</Text><Action label={voluntary?'CONCLUSÃO VOLUNTÁRIA ✓':'CONFIRMAR CONCLUSÃO VOLUNTÁRIA'} onPress={()=>setVoluntary(v=>!v)}/><Action disabled={busy||!voluntary||!mirrorSaved} label={busy?'SELANDO…':'SELAR DAY 009'} onPress={()=>void seal()}/></>:null}
  {['NARRATIVE','TERM_REVEAL','READ','UNLOCK'].includes(p.type)?<Action label="CONTINUAR" onPress={()=>void completePhase(p.id)}/>:null}
 </View></ScrollView>;
}

function Action({label,onPress,disabled=false,compact=false}:{label:string;onPress:()=>void;disabled?:boolean;compact?:boolean}){return <Pressable disabled={disabled} onPress={onPress} style={[styles.button,compact&&styles.compact,disabled&&styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>}
const styles=StyleSheet.create({shell:{padding:20,paddingBottom:80,backgroundColor:'#090910',minHeight:'100%',gap:14},center:{flex:1,padding:28,justifyContent:'center',backgroundColor:'#090910',gap:14},panel:{borderWidth:1,borderColor:'#6f5f29',borderRadius:18,padding:18,gap:14,backgroundColor:'#111018'},row:{flexDirection:'row',flexWrap:'wrap',gap:6},eyebrow:{color:'#d9bd67',fontSize:12,letterSpacing:1.4},status:{color:'#b6aa87',fontSize:12},headerTitle:{color:'#f4e6b2',fontSize:25,fontWeight:'800'},title:{color:'#f4e6b2',fontSize:22,fontWeight:'700'},text:{color:'#eee7d7',lineHeight:21},canon:{color:'#eee7d7',lineHeight:24,fontSize:15},input:{borderWidth:1,borderColor:'#6f5f29',borderRadius:10,padding:12,color:'#eee7d7'},error:{color:'#ffb4ab'},button:{borderWidth:1,borderColor:'#9a8240',borderRadius:12,padding:12,alignItems:'center'},compact:{minWidth:42,paddingHorizontal:10,paddingVertical:8},disabled:{opacity:.4},buttonText:{color:'#f4e6b2',fontWeight:'700'}});
