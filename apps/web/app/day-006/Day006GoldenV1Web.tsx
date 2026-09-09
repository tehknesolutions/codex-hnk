'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ExperienceDirector, QuestRuntime, createQuestCatalog, type ExperienceDirective, type PlayerContext, type SessionSnapshot } from '@hnk/quest-engine';
import { createBundledQuestLibrary, type RuntimeQuestBundle } from '@hnk/quest-library';
import { sealDay006V1, startDay006PracticeSessionV1 } from '@hnk/supabase-client';
import { QuestVoicePhase, type VoicePracticeResult } from '../_runtime/QuestVoicePhase';
import { useWebHnkRuntime } from '../_runtime/WebHnkRuntime';

type Session = Awaited<ReturnType<typeof startDay006PracticeSessionV1>>;
type Seal = Extract<Awaited<ReturnType<typeof sealDay006V1>>, { ok: true }>['response'];
function canon(bundle:RuntimeQuestBundle,d:ExperienceDirective){return(d.phase.source.block_ids??[]).map(id=>{const b=bundle.canon.blocks.find(x=>x.id===id);if(!b)throw new Error(`canonical_block_missing:${id}`);return b.text})}
function key(userId:string){return `hnk-web-d006-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}

export function Day006GoldenV1Web(){
  const auth=useWebHnkRuntime(); const live=Boolean(auth.configured&&auth.phase==='signed-in'&&auth.client&&auth.userId);
  const runtimeRef=useRef<QuestRuntime|null>(null); const[bundle,setBundle]=useState<RuntimeQuestBundle|null>(null); const[snapshot,setSnapshot]=useState<SessionSnapshot|null>(null); const[session,setSession]=useState<Session|null>(null);
  const[listeningSeconds,setListeningSeconds]=useState(0); const[soundsNoted,setSoundsNoted]=useState(0); const[boazSeconds,setBoazSeconds]=useState(0); const[thoughtReturns,setThoughtReturns]=useState(0); const[difficultiesRecorded,setDifficultiesRecorded]=useState(false); const[voice,setVoice]=useState<VoicePracticeResult|null>(null); const[difficulty,setDifficulty]=useState<number|null>(null); const[voluntary,setVoluntary]=useState(false); const[safetyStopped,setSafetyStopped]=useState(false); const[sealed,setSealed]=useState<Seal|null>(null); const[busy,setBusy]=useState(false); const[error,setError]=useState<string|null>(null);
  const context=useMemo<PlayerContext>(()=>({mediationMode:'HNK_CANONICAL',accessibility:{reducedMotion:typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true,audioEnabled:true,microphoneAvailable:false},offline:!live}),[live]);
  useEffect(()=>{let active=true;const library=createBundledQuestLibrary();const catalog=createQuestCatalog(library);void Promise.all([catalog.requireDay(6),library.loadBundle(6)]).then(([definition,loaded])=>{if(!active||!loaded)return;const runtime=new QuestRuntime(definition);runtimeRef.current=runtime;setBundle(loaded);setSnapshot(runtime.start())}).catch(c=>active&&setError(c instanceof Error?c.message:'day006_bundle_load_failed'));return()=>{active=false}},[]);
  const director=useMemo(()=>bundle?new ExperienceDirector(bundle.quest):null,[bundle]); const directive=useMemo(()=>director&&snapshot?.currentPhaseId?director.resolvePhase(snapshot.currentPhaseId,context,snapshot):null,[director,context,snapshot]);
  async function ensureSession(){if(session)return session;if(!live||!auth.client||!auth.userId)return null;const created=await startDay006PracticeSessionV1(auth.client,{clientSessionId:key(auth.userId),appVersion:'0.1.0-web-day006-golden-v1'});setSession(created);return created}
  async function completePhase(id:string){const r=runtimeRef.current;if(!r)return;if(id==='jachin_reading')await ensureSession();setSnapshot(r.completePhase(id));window.scrollTo({top:0,behavior:'smooth'})}
  function safetyStop(reason?:string){setSafetyStopped(true);setError(reason??'safety_stop');if(runtimeRef.current)setSnapshot(runtimeRef.current.safetyStop())}
  function resume(){if(runtimeRef.current){setError(null);setSnapshot(runtimeRef.current.resume())}}
  async function seal(){if(!auth.client||!session||!runtimeRef.current||!voice||!difficultiesRecorded||!voluntary)return;if(listeningSeconds<=0||boazSeconds<=0){setError('day006_required_duration_missing');return}setBusy(true);setError(null);try{const result=await sealDay006V1(auth.client,{evidence:{sessionId:session.id,mode:'first_completion',jachin:{durationSeconds:listeningSeconds,soundsNotedCount:soundsNoted},boaz:{durationSeconds:boazSeconds,thoughtReturns,difficultiesRecordedCount:3},middle:{voiceRecorded:voice.voiceRecorded},soulMirror:{difficultyRating:difficulty},safetyStopOccurred:safetyStopped},totalDurationSeconds:listeningSeconds+boazSeconds,soundsNotedCount:soundsNoted,thoughtReturns});if(!result.ok)throw new Error(result.code);setSealed(result.response);setSnapshot(runtimeRef.current.confirmServerCompletion())}catch(c){setError(c instanceof Error?c.message:'day006_completion_failed')}finally{setBusy(false)}}
  const shell:CSSProperties={maxWidth:860,margin:'0 auto',padding:'28px 20px 80px',color:'#eee7d7',background:'#090910',minHeight:'100vh',fontFamily:'system-ui'}; const panel:CSSProperties={border:'1px solid #6f5f29',borderRadius:18,padding:22,display:'grid',gap:14,background:'#111018'};
  if(!bundle||!snapshot||!director)return <main style={shell}>CARREGANDO DAY 006…{error?<p>{error}</p>:null}</main>;
  if(snapshot.runState==='SAFETY_STOP')return <main style={shell}><h1>Prática pausada com segurança.</h1><button onClick={resume}>RETOMAR</button></main>;
  if(snapshot.runState==='COMPLETE')return <main style={shell}><p>DIA 006 · JELIEL 1/5</p><h1>O SILÊNCIO DA PSUCHE · REGISTRADO</h1><p>{sealed?.first_completion?`+${sealed.xp_awarded} XP canônicos.`:'Revisita sem novo XP.'}</p><p>+1 PER é aplicado apenas pelo servidor na primeira conclusão. A Coroa permanece 1/7 até Jeliel 5/5.</p></main>;
  if(!directive)return <main style={shell}>FASE INDISPONÍVEL.</main>;
  const p=directive.phase;const texts=directive.requiresCanonicalContent?canon(bundle,directive):[];
  return <main style={shell}><header><small>DIA 006 · KETHER · JELIEL 1/5</small><h1>O SILÊNCIO DA PSUCHE</h1><span>{live?'BACKEND':'OFFLINE'}</span></header>{error?<p style={{color:'#ffb4ab'}}>{error}</p>:null}<section style={panel}><small>{p.type} · {p.id}</small>
    {p.type==='NARRATIVE'?<><h2>Do fazer ao escutar.</h2><p>Silêncio perfeito não é requisito. Perceba e retorne.</p></>:null}
    {p.type==='TERM_REVEAL'?<p>{(p.terms??[]).join(' · ')}</p>:null}
    {p.type==='READ'?texts.map((t,i)=><p key={i} style={{lineHeight:1.75}}>{t}</p>):null}
    {p.type==='INSTRUCTION'?(p.content_intent??[]).map(x=><p key={x}>{x}</p>):null}
    {p.type==='FOCUS'&&p.id==='listening_practice'?<Timer target={600} counterLabel="SOM PERCEBIDO" counter={soundsNoted} onCount={()=>setSoundsNoted(v=>v+1)} onFinish={s=>{setListeningSeconds(s);void completePhase(p.id)}} onSafetyStop={()=>safetyStop('listening_safety_stop')}/>:null}
    {p.type==='FOCUS'&&p.id==='boaz_silence'?<Timer target={600} counterLabel="PENSAMENTO PERCEBIDO · VOLTAR" counter={thoughtReturns} onCount={()=>setThoughtReturns(v=>v+1)} onFinish={s=>{setBoazSeconds(s);void completePhase(p.id)}} onSafetyStop={()=>safetyStop('silence_safety_stop')}/>:null}
    {p.type==='JOURNAL'?<><p>Registre três dificuldades no Vault. O servidor recebe apenas a contagem.</p><label><input type="checkbox" checked={difficultiesRecorded} onChange={e=>setDifficultiesRecorded(e.target.checked)}/> Registrei três dificuldades.</label><button disabled={!difficultiesRecorded} onClick={()=>void completePhase(p.id)}>CONTINUAR</button></>:null}
    {p.type==='VOICE'?<QuestVoicePhase directive={directive} onResult={setVoice} onCompletePhase={completePhase} onSafetyStop={safetyStop}/>:null}
    {p.type==='RETURN'?<><p>Respire naturalmente, movimente-se e confirme orientação.</p><button onClick={()=>void completePhase(p.id)}>ESTOU ORIENTADO · CONTINUAR</button></>:null}
    {p.type==='STRUCTURED_JOURNAL'?<><p>Espelho da Alma · dificuldade percebida.</p>{[0,2,4,6,8,10].map(v=><button key={v} onClick={()=>setDifficulty(v)} style={{marginRight:6}}>{v}</button>)}<button onClick={()=>void completePhase(p.id)}>CONCLUIR ESPELHO</button></>:null}
    {p.type==='COMPLETION'?<><h2>Selo canônico</h2><p>Gravação de voz não é exigida. XP e PER vêm do servidor.</p><label><input type="checkbox" checked={voluntary} onChange={e=>setVoluntary(e.target.checked)}/> Confirmo conclusão voluntária</label><button disabled={busy||!voluntary} onClick={()=>void seal()}>{busy?'SELANDO…':'SELAR DAY 006'}</button></>:null}
    {['NARRATIVE','TERM_REVEAL','READ','INSTRUCTION','UNLOCK'].includes(p.type)?<button onClick={()=>void completePhase(p.id)}>CONTINUAR</button>:null}
  </section></main>;
}
function Timer({target,counterLabel,counter,onCount,onFinish,onSafetyStop}:{target:number;counterLabel:string;counter:number;onCount:()=>void;onFinish:(s:number)=>void;onSafetyStop:()=>void}){const[s,setS]=useState(0);const[running,setRunning]=useState(false);useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setS(v=>v+1),1000);return()=>window.clearInterval(id)},[running]);return <div style={{display:'grid',gap:10}}><p>{s}s / {target}s canônicos</p><button onClick={()=>setRunning(v=>!v)}>{running?'PAUSAR':'INICIAR / RETOMAR'}</button><button onClick={onCount}>{counterLabel} · {counter}</button><button disabled={s<=0} onClick={()=>onFinish(s)}>CONCLUIR PRÁTICA</button><button onClick={onSafetyStop}>SAFETY STOP</button></div>}
