'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ExperienceDirector, QuestRuntime, createQuestCatalog, type ExperienceDirective, type PlayerContext, type SessionSnapshot } from '@hnk/quest-engine';
import { createBundledQuestLibrary, type RuntimeQuestBundle } from '@hnk/quest-library';
import { sealDay008V1, startDay008PracticeSessionV1 } from '@hnk/supabase-client';
import { QuestCountdownPhase, type CountdownPracticeResult } from '../_runtime/QuestCountdownPhase';
import { useWebHnkRuntime } from '../_runtime/WebHnkRuntime';

type Session=Awaited<ReturnType<typeof startDay008PracticeSessionV1>>;
type Seal=Extract<Awaited<ReturnType<typeof sealDay008V1>>,{ok:true}>['response'];
function canon(bundle:RuntimeQuestBundle,d:ExperienceDirective){return(d.phase.source.block_ids??[]).map(id=>{const b=bundle.canon.blocks.find(x=>x.id===id);if(!b)throw new Error(`canonical_block_missing:${id}`);return b.text})}
function key(userId:string){return`hnk-web-d008-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}

export function Day008GoldenV1Web(){
 const auth=useWebHnkRuntime();const live=Boolean(auth.configured&&auth.phase==='signed-in'&&auth.client&&auth.userId);const runtimeRef=useRef<QuestRuntime|null>(null);
 const[bundle,setBundle]=useState<RuntimeQuestBundle|null>(null);const[snapshot,setSnapshot]=useState<SessionSnapshot|null>(null);const[session,setSession]=useState<Session|null>(null);
 const[jachin,setJachin]=useState<CountdownPracticeResult|null>(null);const[jachinRecorded,setJachinRecorded]=useState(false);const[boaz,setBoaz]=useState<CountdownPracticeResult|null>(null);const[boazRecorded,setBoazRecorded]=useState(false);const[middle,setMiddle]=useState<CountdownPracticeResult|null>(null);
 const[relaxation,setRelaxation]=useState(5);const[attention,setAttention]=useState(5);const[forcing,setForcing]=useState(5);const[voluntary,setVoluntary]=useState(false);const[safetyStopped,setSafetyStopped]=useState(false);const[sealed,setSealed]=useState<Seal|null>(null);const[busy,setBusy]=useState(false);const[error,setError]=useState<string|null>(null);
 const context=useMemo<PlayerContext>(()=>({mediationMode:'HNK_CANONICAL',accessibility:{reducedMotion:typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true,audioEnabled:true,microphoneAvailable:false},offline:!live}),[live]);
 useEffect(()=>{let active=true;const library=createBundledQuestLibrary();const catalog=createQuestCatalog(library);void Promise.all([catalog.requireDay(8),library.loadBundle(8)]).then(([definition,loaded])=>{if(!active||!loaded)return;const r=new QuestRuntime(definition);runtimeRef.current=r;setBundle(loaded);setSnapshot(r.start())}).catch(c=>active&&setError(c instanceof Error?c.message:'day008_bundle_load_failed'));return()=>{active=false}},[]);
 const director=useMemo(()=>bundle?new ExperienceDirector(bundle.quest):null,[bundle]);const directive=useMemo(()=>director&&snapshot?.currentPhaseId?director.resolvePhase(snapshot.currentPhaseId,context,snapshot):null,[director,context,snapshot]);
 async function ensureSession(){if(session)return session;if(!live||!auth.client||!auth.userId)return null;const created=await startDay008PracticeSessionV1(auth.client,{clientSessionId:key(auth.userId),appVersion:'0.1.0-web-day008-golden-v1'});setSession(created);return created}
 async function completePhase(id:string){const r=runtimeRef.current;if(!r)return;if(id==='jachin_reading')await ensureSession();setSnapshot(r.completePhase(id));window.scrollTo({top:0,behavior:'smooth'})}
 function safetyStop(reason?:string){setSafetyStopped(true);setError(reason??'safety_stop');if(runtimeRef.current)setSnapshot(runtimeRef.current.safetyStop())}
 function resume(){if(runtimeRef.current){setError(null);setSnapshot(runtimeRef.current.resume())}}
 async function seal(){if(!auth.client||!session||!runtimeRef.current||!jachin||!boaz||!middle||!jachinRecorded||!boazRecorded||!voluntary)return;setBusy(true);setError(null);try{const total=jachin.durationSeconds+boaz.durationSeconds+middle.durationSeconds+middle.silentObservationSeconds;const result=await sealDay008V1(auth.client,{evidence:{sessionId:session.id,mode:'first_completion',jachin:{finalNumber:jachin.finalNumber,attentionReturns:jachin.attentionReturns},boaz:{finalNumber:boaz.finalNumber,distractionsNotedCount:boaz.attentionReturns},middle:{finalNumber:middle.finalNumber,silentObservationSeconds:middle.silentObservationSeconds},soulMirror:{relaxationRating:relaxation,attentionStabilityRating:attention,forcingRating:forcing},safetyStopOccurred:safetyStopped},totalDurationSeconds:total,attentionReturns:jachin.attentionReturns,distractionsNotedCount:boaz.attentionReturns});if(!result.ok)throw new Error(result.code);setSealed(result.response);setSnapshot(runtimeRef.current.confirmServerCompletion())}catch(c){setError(c instanceof Error?c.message:'day008_completion_failed')}finally{setBusy(false)}}
 const shell:CSSProperties={maxWidth:860,margin:'0 auto',padding:'28px 20px 80px',color:'#eee7d7',background:'#090910',minHeight:'100vh',fontFamily:'system-ui'};const panel:CSSProperties={border:'1px solid #6f5f29',borderRadius:18,padding:22,display:'grid',gap:14,background:'#111018'};
 if(!bundle||!snapshot||!director)return <main style={shell}>CARREGANDO DAY 008…{error?<p>{error}</p>:null}</main>;
 if(snapshot.runState==='SAFETY_STOP')return <main style={shell}><h1>Prática pausada com segurança.</h1><button onClick={resume}>RETOMAR</button></main>;
 if(snapshot.runState==='COMPLETE')return <main style={shell}><p>DIA 008 · JELIEL 3/5</p><h1>DAVE ELMAN II · REGISTRADO</h1><p>{sealed?.first_completion?`+${sealed.xp_awarded} XP canônicos.`:'Revisita sem novo XP.'}</p><p>Nenhum ganho de atributo é aplicado no Day 008.</p></main>;
 if(!directive)return <main style={shell}>FASE INDISPONÍVEL.</main>;const p=directive.phase;const texts=directive.requiresCanonicalContent?canon(bundle,directive):[];
 return <main style={shell}><header><small>DIA 008 · KETHER · JELIEL 3/5</small><h1>DAVE ELMAN II</h1><span>{live?'BACKEND':'OFFLINE'}</span></header>{error?<p style={{color:'#ffb4ab'}}>{error}</p>:null}<section style={panel}><small>{p.type} · {p.id}</small>
  {p.type==='NARRATIVE'?<><h2>Relaxar e contar sem competir.</h2><p>Você pode parar longe do número 1. Perder a conta não é fracasso.</p></>:null}
  {p.type==='TERM_REVEAL'?<p>{(p.terms??[]).join(' · ')}</p>:null}
  {p.type==='READ'?texts.map((t,i)=><p key={i} style={{lineHeight:1.75}}>{t}</p>):null}
  {p.type==='FOCUS'&&['jachin_countdown','boaz_countdown','middle_countdown'].includes(p.id)?<QuestCountdownPhase directive={directive} onResult={r=>{if(p.id==='jachin_countdown')setJachin(r);else if(p.id==='boaz_countdown')setBoaz(r);else setMiddle(r)}} onCompletePhase={completePhase} onSafetyStop={safetyStop}/>:null}
  {p.type==='RETURN'?<><p>Abra os olhos quando quiser, mova mãos e pés, respire normalmente e oriente-se.</p><button onClick={()=>void completePhase(p.id)}>ESTOU ORIENTADO · CONTINUAR</button></>:null}
  {p.type==='JOURNAL'&&p.id==='jachin_record'?<><p>Número final: {jachin?.finalNumber??'—'} · retornos: {jachin?.attentionReturns??0}. A região corporal percebida fica apenas no Vault.</p><label><input type="checkbox" checked={jachinRecorded} onChange={e=>setJachinRecorded(e.target.checked)}/> Registrei a observação privada.</label><button disabled={!jachinRecorded} onClick={()=>void completePhase(p.id)}>CONTINUAR</button></>:null}
  {p.type==='JOURNAL'&&p.id==='boaz_record'?<><p>Distrações percebidas: {boaz?.attentionReturns??0}. O ajuste que ajudou fica apenas no Vault.</p><label><input type="checkbox" checked={boazRecorded} onChange={e=>setBoazRecorded(e.target.checked)}/> Registrei o ajuste privado.</label><button disabled={!boazRecorded} onClick={()=>void completePhase(p.id)}>CONTINUAR</button></>:null}
  {p.type==='STRUCTURED_JOURNAL'?<><Rating label="RELAXAMENTO" value={relaxation} setValue={setRelaxation}/><Rating label="ATENÇÃO ESTÁVEL" value={attention} setValue={setAttention}/><Rating label="QUANTO FORCEI" value={forcing} setValue={setForcing}/><button onClick={()=>void completePhase(p.id)}>CONCLUIR ESPELHO</button></>:null}
  {p.type==='COMPLETION'?<><h2>Selo canônico</h2><p>O servidor valida execução; chegar ao número 1 não é requisito.</p><label><input type="checkbox" checked={voluntary} onChange={e=>setVoluntary(e.target.checked)}/> Confirmo conclusão voluntária</label><button disabled={busy||!voluntary} onClick={()=>void seal()}>{busy?'SELANDO…':'SELAR DAY 008'}</button></>:null}
  {['NARRATIVE','TERM_REVEAL','READ','UNLOCK'].includes(p.type)?<button onClick={()=>void completePhase(p.id)}>CONTINUAR</button>:null}
 </section></main>;
}
function Rating({label,value,setValue}:{label:string;value:number;setValue:(v:number)=>void}){return <label>{label} · {value}<input type="range" min="0" max="10" step="1" value={value} onChange={e=>setValue(Number(e.target.value))}/></label>}
