'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ExperienceDirector, QuestRuntime, createQuestCatalog, type ExperienceDirective, type PlayerContext, type SessionSnapshot } from '@hnk/quest-engine';
import { createBundledQuestLibrary, type RuntimeQuestBundle } from '@hnk/quest-library';
import { sealDay005V1, startDay005PracticeSessionV1 } from '@hnk/supabase-client';
import { QuestAudioPhase } from '../_runtime/QuestAudioPhase';
import { QuestBehavioralExperimentPhase, type BehavioralExperimentResult } from '../_runtime/QuestBehavioralExperimentPhase';
import { useWebHnkRuntime } from '../_runtime/WebHnkRuntime';

type Session = Awaited<ReturnType<typeof startDay005PracticeSessionV1>>;
type Seal = Extract<Awaited<ReturnType<typeof sealDay005V1>>, { ok: true }>['response'];

function canon(bundle: RuntimeQuestBundle, directive: ExperienceDirective): string[] {
  return (directive.phase.source.block_ids ?? []).map((id) => {
    const block = bundle.canon.blocks.find((entry) => entry.id === id);
    if (!block) throw new Error(`canonical_block_missing:${id}`);
    return block.text;
  });
}
function key(userId: string): string { return `hnk-web-d005-v1-${userId}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

export function Day005GoldenV1Web() {
  const auth = useWebHnkRuntime();
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

  const context=useMemo<PlayerContext>(()=>({ mediationMode:'HNK_CANONICAL', accessibility:{ reducedMotion:typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true,audioEnabled:true,microphoneAvailable:false },offline:!live }),[live]);

  useEffect(()=>{ let active=true; const library=createBundledQuestLibrary(); const catalog=createQuestCatalog(library); void Promise.all([catalog.requireDay(5),library.loadBundle(5)]).then(([definition,loaded])=>{ if(!active||!loaded)return; const runtime=new QuestRuntime(definition); runtimeRef.current=runtime; setBundle(loaded); setSnapshot(runtime.start()); }).catch((cause)=>active&&setError(cause instanceof Error?cause.message:'day005_bundle_load_failed')); return()=>{active=false}; },[]);

  const director=useMemo(()=>bundle?new ExperienceDirector(bundle.quest):null,[bundle]);
  const directive=useMemo(()=>director&&snapshot?.currentPhaseId?director.resolvePhase(snapshot.currentPhaseId,context,snapshot):null,[director,context,snapshot]);

  async function ensureSession():Promise<Session|null>{ if(session)return session; if(!live||!auth.client||!auth.userId)return null; const created=await startDay005PracticeSessionV1(auth.client,{clientSessionId:key(auth.userId),appVersion:'0.1.0-web-day005-golden-v1'}); setSession(created); return created; }
  async function completePhase(id:string){ const runtime=runtimeRef.current; if(!runtime)return; if(id==='jachin_reading'||id==='breath_baseline')await ensureSession(); if(id==='theta432_audio')setAudioCompleted(true); setSnapshot(runtime.completePhase(id)); window.scrollTo({top:0,behavior:'smooth'}); }
  function safetyStop(reason?:string){ setSafetyStopped(true); setError(reason??'safety_stop'); if(runtimeRef.current)setSnapshot(runtimeRef.current.safetyStop()); }
  function resume(){ if(runtimeRef.current){setError(null);setSnapshot(runtimeRef.current.resume());} }

  async function seal(){
    if(!auth.client||!session||!runtimeRef.current||!baseline||!audioCompleted||!gestureConfirmed||!journalRecorded||!voluntary)return;
    if(breathSeconds<=0||middleSeconds<=0){setError('day005_required_duration_missing');return;}
    setBusy(true);setError(null);
    try{
      const result=await sealDay005V1(auth.client,{ evidence:{ sessionId:session.id,mode:'first_completion', baseline:{ tensionBefore:baseline.before.tension_rating??5,tensionAfter:baseline.after.tension_rating_after??5 }, jachin:{durationSeconds:breathSeconds,cameraQrUsed:false}, audio:{started:true}, boaz:{}, middle:{durationSeconds:middleSeconds}, soulMirror:{difficultyRating:difficulty}, safetyStopOccurred:safetyStopped }, totalDurationSeconds:breathSeconds+middleSeconds });
      if(!result.ok)throw new Error(result.code);
      setSealed(result.response); setSnapshot(runtimeRef.current.confirmServerCompletion());
    }catch(cause){setError(cause instanceof Error?cause.message:'day005_completion_failed');}finally{setBusy(false);}
  }

  const shell:CSSProperties={maxWidth:860,margin:'0 auto',padding:'28px 20px 80px',color:'#eee7d7',background:'#090910',minHeight:'100vh',fontFamily:'system-ui'};
  const panel:CSSProperties={border:'1px solid #6f5f29',borderRadius:18,padding:22,display:'grid',gap:14,background:'#111018'};
  if(!bundle||!snapshot||!director)return <main style={shell}>CARREGANDO DAY 005…{error?<p>{error}</p>:null}</main>;
  if(snapshot.runState==='SAFETY_STOP')return <main style={shell}><h1>Prática pausada com segurança.</h1><button onClick={resume}>RETOMAR</button></main>;
  if(snapshot.runState==='COMPLETE'){
    const fragmentLit=sealed?.progression_events?.includes('KETHER_FRAGMENT_LIT')===true;
    return <main style={shell}><p>DIA 005 · CICLO VEHUIAH 5/5</p><h1>{fragmentLit?'FRAGMENTO I DA COROA ACESO':'CICLO REGISTRADO'}</h1><p>{sealed?.first_completion?`+${sealed.xp_awarded} XP canônicos.`:'Revisita sem novo XP.'}</p><p>Progressão de VNT é aplicada exclusivamente pelo servidor na primeira conclusão.</p><div style={{fontSize:72,marginTop:24}}>{fragmentLit?'◉':'○'}</div></main>;
  }
  if(!directive)return <main style={shell}>FASE INDISPONÍVEL.</main>;
  const phase=directive.phase; const texts=directive.requiresCanonicalContent?canon(bundle,directive):[];
  return <main style={shell} data-hnk-theme="kether"><header style={{display:'flex',justifyContent:'space-between',gap:20,marginBottom:24}}><div><small>DIA 005 · KETHER · VEHUIAH 5/5</small><h1>BANIMENTO INICIAL POR INTENÇÃO</h1></div><span>{live?'BACKEND':'OFFLINE'}</span></header>{error?<p style={{color:'#ffb4ab'}}>{error}</p>:null}<section style={panel} data-phase={phase.type}>
    <small>{phase.type} · {phase.id}</small>
    {phase.type==='NARRATIVE'?<><h2>Fechamento do primeiro ciclo.</h2><p>Presença, limite simbólico e retorno — sem exigir sensação extraordinária.</p></>:null}
    {phase.type==='TERM_REVEAL'?<p>{(phase.terms??[]).join(' · ')}</p>:null}
    {phase.type==='READ'?texts.map((text,i)=><p key={i} style={{lineHeight:1.75}}>{text}</p>):null}
    {phase.type==='INSTRUCTION'?(phase.content_intent??[]).map((item)=><p key={item}>{item}</p>):null}
    {phase.id==='altar_qr'?<p>Câmera opcional. Se não estiver disponível, inicie o áudio manualmente na próxima fase.</p>:null}
    {phase.type==='EXPERIMENT'?<QuestBehavioralExperimentPhase directive={directive} onResult={setBaseline} onCompletePhase={completePhase} onSafetyStop={safetyStop}/>:null}
    {phase.type==='FOCUS'&&phase.id==='jachin_breath'?<Timer label="RESPIRAÇÃO NATURAL · SEM FORÇAR" target={600} onFinish={(s)=>{setBreathSeconds(s);void completePhase(phase.id)}} onSafetyStop={()=>safetyStop('breath_safety_stop')}/>:null}
    {phase.type==='FOCUS'&&phase.id==='boaz_gesture'?<><p>Use apenas a mão vazia. Nenhuma lâmina, ferramenta ou objeto cortante.</p><label><input type="checkbox" checked={gestureConfirmed} onChange={(e)=>setGestureConfirmed(e.target.checked)}/> Executei o gesto simbolicamente, com mão vazia e respiração confortável.</label><button disabled={!gestureConfirmed} onClick={()=>void completePhase(phase.id)}>CONTINUAR</button><button onClick={()=>safetyStop('gesture_safety_stop')}>SAFETY STOP</button></>:null}
    {phase.type==='FOCUS'&&phase.id==='dai_koo_myo_focus'?<><img src="/assets/kether/dai-koo-myo-usui-hnk-master-v1.svg" alt="Dai Koo Myo Usui — HNK Master V1" style={{width:'min(260px,70vw)',maxHeight:420,margin:'0 auto',color:'#e4c870'}}/><Timer label="DAI KOO MYO · ASSET CANÔNICO" target={300} onFinish={(s)=>{setMiddleSeconds(s);void completePhase(phase.id)}} onSafetyStop={()=>safetyStop('symbol_focus_safety_stop')}/></>:null}
    {phase.type==='AUDIO'?<QuestAudioPhase directive={directive} onCompletePhase={completePhase} onSafetyStop={safetyStop}/>:null}
    {phase.type==='RETURN'?<><p>Respire normalmente, movimente mãos e pés e oriente-se ao ambiente.</p><button onClick={()=>void completePhase(phase.id)}>ESTOU ORIENTADO · CONTINUAR</button></>:null}
    {phase.type==='JOURNAL'?<><p>O texto permanece no Vault; o servidor recebe apenas que houve registro.</p><label><input type="checkbox" checked={journalRecorded} onChange={(e)=>setJournalRecorded(e.target.checked)}/> Registrei no meu espaço privado.</label><button disabled={!journalRecorded} onClick={()=>void completePhase(phase.id)}>CONTINUAR</button></>:null}
    {phase.type==='STRUCTURED_JOURNAL'?<><p>Espelho da Alma · dificuldade percebida.</p><div>{[0,2,4,6,8,10].map(v=><button key={v} onClick={()=>setDifficulty(v)} style={{marginRight:6}}>{v}</button>)}</div><button onClick={()=>void completePhase(phase.id)}>CONCLUIR ESPELHO</button></>:null}
    {phase.type==='COMPLETION'?<><h2>Selo de Vehuiah</h2><p>O servidor valida Day 005, concede +100 XP, aplica +1 VNT se elegível e deriva o Fragmento I.</p><label><input type="checkbox" checked={voluntary} onChange={(e)=>setVoluntary(e.target.checked)}/> Confirmo conclusão voluntária</label><button disabled={busy||!voluntary} onClick={()=>void seal()}>{busy?'SELANDO…':'SELAR DAY 005'}</button></>:null}
    {['NARRATIVE','TERM_REVEAL','READ','INSTRUCTION','UNLOCK'].includes(phase.type)?<button onClick={()=>void completePhase(phase.id)}>CONTINUAR</button>:null}
  </section></main>;
}

function Timer({label,target,onFinish,onSafetyStop}:{label:string;target:number;onFinish:(seconds:number)=>void;onSafetyStop:()=>void}){
  const [seconds,setSeconds]=useState(0);const [running,setRunning]=useState(false);
  useEffect(()=>{if(!running)return;const id=window.setInterval(()=>setSeconds(v=>v+1),1000);return()=>window.clearInterval(id)},[running]);
  return <div style={{display:'grid',gap:10}}><strong>{label}</strong><p>{seconds}s / {target}s canônicos</p><button onClick={()=>setRunning(v=>!v)}>{running?'PAUSAR':'INICIAR / RETOMAR'}</button><button disabled={seconds<=0} onClick={()=>onFinish(seconds)}>CONCLUIR PRÁTICA</button><button onClick={onSafetyStop}>SAFETY STOP</button></div>;
}
