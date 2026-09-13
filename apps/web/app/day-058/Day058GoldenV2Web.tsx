'use client';

import {useEffect,useMemo,useState,type ReactNode} from 'react';
import {loadDay058PracticeSessionV2,sealDay058V2,startDay058PracticeSessionV2} from '@hnk/supabase-client';
import {createWebVaultTextPort} from '../_runtime/WebVaultTextPort';
import {useWebHnkRuntime} from '../_runtime/WebHnkRuntime';

type Session=NonNullable<Awaited<ReturnType<typeof loadDay058PracticeSessionV2>>>;
type Safety='NONE'|'PRESSURE_INCREASED'|'DISCOMFORT'|'AUTONOMY_CONCERN'|'OTHER';
type Metrics={relaxation:number;clarity:number;pressure:number;autonomy:number};
type ScriptDraft=Metrics&{ref:string|null;twoBenign:boolean;realRefusal:boolean;selfUseOnly:boolean;noClinicalPromise:boolean;noCovertCommand:boolean;choicePreserved:boolean};
type ControlDraft=Metrics&{ref:string|null;selectedScriptIndex:1|2|3;sameGoal:boolean;separateMoment:boolean;textLocked:boolean;directFormulation:boolean;discomfortAllowsAbandonment:boolean};
type Draft={scripts:[ScriptDraft,ScriptDraft,ScriptDraft];control:ControlDraft;comparisonDone:boolean;autonomyPreserved:boolean;pressureIsData:boolean;obedienceNotSuccess:boolean;noConsentBypass:boolean;noAffectiveCommercialSexualAdvantage:boolean;noHighImpact:boolean;noClinicalPromise:boolean;noCovertCommand:boolean;prudenceRule:boolean;psalm:boolean;formula:boolean;transparentRewrite:boolean;refusalPreserved:boolean;layersSeparated:boolean;consciousReturn:boolean;personalNoConsentBypassRule:boolean;voluntary:boolean;finalSafety:boolean;safetyStop:boolean;safetyReason:Safety};

const M=():Metrics=>({relaxation:0,clarity:0,pressure:0,autonomy:0});
const S=():ScriptDraft=>({...M(),ref:null,twoBenign:false,realRefusal:false,selfUseOnly:false,noClinicalPromise:false,noCovertCommand:false,choicePreserved:false});
const empty:Draft={scripts:[S(),S(),S()],control:{...M(),ref:null,selectedScriptIndex:1,sameGoal:false,separateMoment:false,textLocked:false,directFormulation:false,discomfortAllowsAbandonment:false},comparisonDone:false,autonomyPreserved:false,pressureIsData:false,obedienceNotSuccess:false,noConsentBypass:false,noAffectiveCommercialSexualAdvantage:false,noHighImpact:false,noClinicalPromise:false,noCovertCommand:false,prudenceRule:false,psalm:false,formula:false,transparentRewrite:false,refusalPreserved:false,layersSeparated:false,consciousReturn:false,personalNoConsentBypassRule:false,voluntary:false,finalSafety:false,safetyStop:false,safetyReason:'NONE'};
const card={background:'#121217',border:'1px solid #34313f',borderRadius:18,padding:18,margin:'14px 0'} as const;
const button={background:'#d9b86c',color:'#17120a',border:0,borderRadius:10,padding:'10px 13px',fontWeight:800,cursor:'pointer'} as const;
function dk(u:string){return`hnk:day058:${u}:draft:v2`}
function sk(u:string){return`hnk:day058:${u}:session:v2`}
function parse<T>(v:string|null):T|null{try{return v?JSON.parse(v)as T:null}catch{return null}}
function cid(u:string){return`hnk-web-d058-v2-${u}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function clamp(v:number){return Number.isFinite(v)?Math.max(0,Math.min(10,Math.trunc(v))):0}

export function Day058GoldenV2Web(){
  const auth=useWebHnkRuntime();
  const live=Boolean(auth.configured&&auth.phase==='signed-in'&&auth.client&&auth.userId);
  const vault=useMemo(()=>auth.userId?createWebVaultTextPort(auth.client??null):null,[auth.client,auth.userId]);
  const[session,setSession]=useState<Session|null>(null);
  const[d,setD]=useState<Draft>(empty);
  const[loaded,setLoaded]=useState(false);
  const[scriptText,setScriptText]=useState<[string,string,string]>(['','','']);
  const[controlText,setControlText]=useState('');
  const[error,setError]=useState<string|null>(null);
  const[busy,setBusy]=useState(false);
  const[complete,setComplete]=useState(false);

  useEffect(()=>{if(!auth.userId)return;setD(parse<Draft>(localStorage.getItem(dk(auth.userId)))??empty);setLoaded(true);const id=localStorage.getItem(sk(auth.userId));if(id&&auth.client)void loadDay058PracticeSessionV2(auth.client,id).then(s=>s?setSession(s):localStorage.removeItem(sk(auth.userId!))).catch(()=>undefined)},[auth.client,auth.userId]);
  useEffect(()=>{if(auth.userId&&loaded&&!complete)localStorage.setItem(dk(auth.userId),JSON.stringify(d))},[auth.userId,d,loaded,complete]);
  useEffect(()=>{const h=()=>{if(document.visibilityState==='visible')return;setScriptText(['','','']);setControlText('');setError('conteudo_privado_nao_cifrado_descartado')};document.addEventListener('visibilitychange',h);return()=>document.removeEventListener('visibilitychange',h)},[]);

  function patch(p:Partial<Draft>){setD(x=>({...x,...p}))}
  function patchScript(index:number,p:Partial<ScriptDraft>){setD(x=>{const scripts=[...x.scripts] as [ScriptDraft,ScriptDraft,ScriptDraft];scripts[index]={...scripts[index],...p};return{...x,scripts}})}
  function patchControl(p:Partial<ControlDraft>){setD(x=>({...x,control:{...x.control,...p}}))}

  async function ensureSession(){if(session)return session;if(!live||!auth.client||!auth.userId)throw new Error('online_session_required_before_day058_practice');const s=await startDay058PracticeSessionV2(auth.client,{clientSessionId:cid(auth.userId),appVersion:'0.1.0-web-day058-v2'});setSession(s);localStorage.setItem(sk(auth.userId),s.id);return s}
  async function saveScript(index:number){const text=scriptText[index];if(!text.trim())throw new Error(`script_${index+1}_text_required`);if(!vault||!auth.userId)throw new Error('vault_unavailable');await ensureSession();const e=await vault.saveText({userId:auth.userId,day:58,kind:'journal',plaintext:JSON.stringify({schema:'hnk-day058-self-script-v2',script_index:index+1,text:text.trim()})});patchScript(index,{ref:e.entryId});setScriptText(x=>{const y=[...x] as [string,string,string];y[index]='';return y})}
  async function saveControl(){if(!controlText.trim())throw new Error('direct_control_text_required');if(!vault||!auth.userId)throw new Error('vault_unavailable');await ensureSession();const e=await vault.saveText({userId:auth.userId,day:58,kind:'journal',plaintext:JSON.stringify({schema:'hnk-day058-direct-control-v2',selected_script_index:d.control.selectedScriptIndex,text:controlText.trim()})});patchControl({ref:e.entryId});setControlText('')}
  async function resolveRequired(ref:string|null,n:string){if(!ref||!vault||!auth.userId)throw new Error(n);await vault.flushPending(auth.userId);const x=await vault.resolveEntryId(auth.userId,ref);if(!x)throw new Error(n);return x}
  function safetyStop(){if(d.safetyReason==='NONE'){setError('selecione_motivo_de_seguranca');return}patch({safetyStop:true,finalSafety:false});setScriptText(['','','']);setControlText('');setError('safety_stop_registrado__interrompa_a_pratica_e_retorne_ao_estado_comum')}

  async function seal(){if(!auth.client||!auth.userId)return;setBusy(true);setError(null);try{
    const s=await ensureSession();
    const refs=await Promise.all(d.scripts.map((x,n)=>resolveRequired(x.ref,`script_${n+1}_vault_required`)));
    const controlRef=await resolveRequired(d.control.ref,'direct_control_vault_required');
    if(new Set([...refs,controlRef].map(x=>x.toLowerCase())).size!==4)throw new Error('day058_four_distinct_vault_refs_required');
    const r=await sealDay058V2(auth.client,{evidence:{
      sessionId:s.id,
      scripts:d.scripts.map((x,n)=>({vaultEntryRef:refs[n],relaxation:x.relaxation,clarity:x.clarity,pressure:x.pressure,autonomy:x.autonomy,twoBenignOptionsConfirmed:x.twoBenign,realRefusalOptionConfirmed:x.realRefusal,selfUseOnlyConfirmed:x.selfUseOnly,noClinicalPromiseConfirmed:x.noClinicalPromise,noCovertCommandConfirmed:x.noCovertCommand,choicePreservedConfirmed:x.choicePreserved})) as [any,any,any],
      directControl:{selectedScriptIndex:d.control.selectedScriptIndex,vaultEntryRef:controlRef,relaxation:d.control.relaxation,clarity:d.control.clarity,pressure:d.control.pressure,autonomy:d.control.autonomy,sameGoalConfirmed:d.control.sameGoal,separateMomentConfirmed:d.control.separateMoment,textLockedBeforeResultConfirmed:d.control.textLocked,directFormulationConfirmed:d.control.directFormulation,discomfortAllowsAbandonmentConfirmed:d.control.discomfortAllowsAbandonment},
      comparisonCompletedConfirmed:d.comparisonDone,autonomyPreservedConfirmed:d.autonomyPreserved,pressureAcceptedAsDataConfirmed:d.pressureIsData,obedienceNotSuccessMetricConfirmed:d.obedienceNotSuccess,consentBypassNotUsedConfirmed:d.noConsentBypass,affectiveCommercialSexualAdvantageNotUsedConfirmed:d.noAffectiveCommercialSexualAdvantage,highImpactNotUsedConfirmed:d.noHighImpact,clinicalPromiseNotUsedConfirmed:d.noClinicalPromise,covertCommandNotUsedConfirmed:d.noCovertCommand,prudenceRuleDefinedConfirmed:d.prudenceRule,
      psalm101Confirmed:d.psalm,heHeAlephConfirmed:d.formula,transparentRewriteCompletedConfirmed:d.transparentRewrite,refusalPreservedConfirmed:d.refusalPreserved,languageSensationInterpretationSeparatedConfirmed:d.layersSeparated,consciousReturnConfirmed:d.consciousReturn,personalNoConsentBypassRuleDefinedConfirmed:d.personalNoConsentBypassRule,voluntaryCompletionConfirmed:d.voluntary,finalSafetyClearConfirmed:d.finalSafety,safetyStopOccurred:d.safetyStop,safetyStopReason:d.safetyReason,
    }});
    if(!r.ok)throw new Error(r.code);
    setComplete(true);localStorage.removeItem(dk(auth.userId));localStorage.removeItem(sk(auth.userId));
  }catch(e){setError(e instanceof Error?e.message:'day058_completion_failed')}finally{setBusy(false)}}

  if(!auth.userId)return <main style={{padding:32,color:'#eee'}}>ENTRE NO ÁTRIO PARA INICIAR O DAY 058.</main>;
  if(complete)return <main style={{padding:32,color:'#eee'}}><h1>Day 058 concluído</h1><p>Hahaiah II registrado. Próximo: Day 059.</p></main>;

  const scriptReady=d.scripts.every(x=>Boolean(x.ref)&&x.twoBenign&&x.realRefusal&&x.selfUseOnly&&x.noClinicalPromise&&x.noCovertCommand&&x.choicePreserved);
  const controlReady=Boolean(d.control.ref)&&d.control.sameGoal&&d.control.separateMoment&&d.control.textLocked&&d.control.directFormulation&&d.control.discomfortAllowsAbandonment;
  const comparisonReady=[d.comparisonDone,d.autonomyPreserved,d.pressureIsData,d.obedienceNotSuccess,d.noConsentBypass,d.noAffectiveCommercialSexualAdvantage,d.noHighImpact,d.noClinicalPromise,d.noCovertCommand,d.prudenceRule].every(Boolean);
  const middleReady=[d.psalm,d.formula,d.transparentRewrite,d.refusalPreserved,d.layersSeparated,d.consciousReturn,d.personalNoConsentBypassRule].every(Boolean);
  const ready=scriptReady&&controlReady&&comparisonReady&&middleReady&&d.voluntary&&d.finalSafety;

  return <main style={{maxWidth:920,margin:'0 auto',padding:'28px 18px 72px',fontFamily:'Inter,system-ui,sans-serif',color:'#eee'}}>
    <p style={{letterSpacing:2,opacity:.7}}>CHOKMAH · HAHAIAH II · DAY 058</p>
    <h1>Linguagem de escolha — auto-uso com controle direto</h1>
    <p>Prática estritamente de auto-uso. O texto integral dos três roteiros e do controle direto só é selado no Vault E2EE. Obediência não é métrica de sucesso; autonomia, clareza, pressão e relaxamento são registradas como dados.</p>
    {error&&<p role="alert" style={{color:'#ff9da8'}}>{error}</p>}
    {d.scripts.map((x,n)=><ScriptCard key={n} index={n} data={x} text={scriptText[n]} setText={v=>setScriptText(a=>{const b=[...a] as [string,string,string];b[n]=v;return b})} patch={p=>patchScript(n,p)} save={()=>void saveScript(n).catch(e=>setError(e instanceof Error?e.message:String(e)))}/>) }
    <Card title="Controle direto equivalente">
      <label>Roteiro comparado <select value={d.control.selectedScriptIndex} onChange={e=>patchControl({selectedScriptIndex:Number(e.target.value) as 1|2|3})}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></label>
      <textarea value={controlText} onChange={e=>setControlText(e.target.value)} placeholder="Frase direta equivalente — memória volátil até selar no Vault" style={{width:'100%',minHeight:90,marginTop:10}}/>
      <button style={button} disabled={Boolean(d.control.ref)} onClick={()=>void saveControl().catch(e=>setError(e instanceof Error?e.message:String(e)))}>Selar controle no Vault e limpar</button>
      <Check l="Mesmo objetivo do roteiro selecionado" v={d.control.sameGoal} set={v=>patchControl({sameGoal:v})}/><Check l="Executado em momento separado" v={d.control.separateMoment} set={v=>patchControl({separateMoment:v})}/><Check l="Texto travado antes de observar o resultado" v={d.control.textLocked} set={v=>patchControl({textLocked:v})}/><Check l="Formulação direta confirmada" v={d.control.directFormulation} set={v=>patchControl({directFormulation:v})}/><Check l="Desconforto autoriza abandono imediato" v={d.control.discomfortAllowsAbandonment} set={v=>patchControl({discomfortAllowsAbandonment:v})}/><MetricEditor value={d.control} set={patchControl}/>
    </Card>
    <Card title="Comparação e limites"><Check l="Comparação concluída" v={d.comparisonDone} set={v=>patch({comparisonDone:v})}/><Check l="Autonomia preservada" v={d.autonomyPreserved} set={v=>patch({autonomyPreserved:v})}/><Check l="Pressão tratada como dado, não falha" v={d.pressureIsData} set={v=>patch({pressureIsData:v})}/><Check l="Obediência não é sucesso" v={d.obedienceNotSuccess} set={v=>patch({obedienceNotSuccess:v})}/><Check l="Nenhum bypass de consentimento" v={d.noConsentBypass} set={v=>patch({noConsentBypass:v})}/><Check l="Nenhuma vantagem afetiva, comercial ou sexual" v={d.noAffectiveCommercialSexualAdvantage} set={v=>patch({noAffectiveCommercialSexualAdvantage:v})}/><Check l="Nenhum uso de alto impacto" v={d.noHighImpact} set={v=>patch({noHighImpact:v})}/><Check l="Nenhuma promessa clínica" v={d.noClinicalPromise} set={v=>patch({noClinicalPromise:v})}/><Check l="Nenhum comando encoberto" v={d.noCovertCommand} set={v=>patch({noCovertCommand:v})}/><Check l="Regra de prudência definida" v={d.prudenceRule} set={v=>patch({prudenceRule:v})}/></Card>
    <Card title="Coluna do Meio"><Check l="Salmo 10:1 confirmado" v={d.psalm} set={v=>patch({psalm:v})}/><Check l="HE–HE–ALEPH confirmado" v={d.formula} set={v=>patch({formula:v})}/><Check l="Reescrita transparente concluída" v={d.transparentRewrite} set={v=>patch({transparentRewrite:v})}/><Check l="Recusa permaneceu real" v={d.refusalPreserved} set={v=>patch({refusalPreserved:v})}/><Check l="Linguagem, sensação e interpretação separadas" v={d.layersSeparated} set={v=>patch({layersSeparated:v})}/><Check l="Retorno consciente ao estado comum" v={d.consciousReturn} set={v=>patch({consciousReturn:v})}/><Check l="Regra pessoal de não contornar consentimento definida" v={d.personalNoConsentBypassRule} set={v=>patch({personalNoConsentBypassRule:v})}/></Card>
    <Card title="Fechamento e segurança"><Check l="Conclusão voluntária" v={d.voluntary} set={v=>patch({voluntary:v})}/><Check l="Estado final seguro e claro" v={d.finalSafety} set={v=>patch({finalSafety:v})}/><label>Motivo de safety stop <select value={d.safetyReason} onChange={e=>patch({safetyReason:e.target.value as Safety})}><option value="NONE">Nenhum</option><option value="PRESSURE_INCREASED">Pressão aumentou</option><option value="DISCOMFORT">Desconforto</option><option value="AUTONOMY_CONCERN">Preocupação com autonomia</option><option value="OTHER">Outro</option></select></label><div style={{marginTop:10}}><button style={{...button,background:'#ff9da8'}} onClick={safetyStop}>Safety stop</button></div></Card>
    <button style={{...button,marginTop:18,fontSize:16}} disabled={!ready||busy} onClick={()=>void seal()}>{busy?'Selando…':'Concluir Day 058'}</button>
    {!ready&&<p style={{opacity:.7}}>A conclusão exige 3 roteiros + 1 controle no Vault, todas as fronteiras éticas e o retorno consciente.</p>}
  </main>;
}

function Card({title,children}:{title:string;children:ReactNode}){return <section style={card}><h2 style={{marginTop:0}}>{title}</h2>{children}</section>}
function Check({l,v,set}:{l:string;v:boolean;set:(v:boolean)=>void}){return <label style={{display:'flex',gap:8,alignItems:'flex-start',margin:'8px 0'}}><input type="checkbox" checked={v} onChange={e=>set(e.target.checked)}/><span>{l}</span></label>}
function MetricEditor({value,set}:{value:Metrics;set:(p:Partial<Metrics>)=>void}){return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:10,marginTop:12}}>{(['relaxation','clarity','pressure','autonomy'] as const).map(k=><label key={k}>{k}<input style={{display:'block',width:'100%'}} type="number" min={0} max={10} step={1} value={value[k]} onChange={e=>set({[k]:clamp(Number(e.target.value))})}/></label>)}</div>}
function ScriptCard({index,data,text,setText,patch,save}:{index:number;data:ScriptDraft;text:string;setText:(v:string)=>void;patch:(p:Partial<ScriptDraft>)=>void;save:()=>void}){return <Card title={`Roteiro ${index+1} — auto-uso`}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Texto privado — não será salvo no draft local" style={{width:'100%',minHeight:110}}/><button style={button} disabled={Boolean(data.ref)} onClick={save}>Selar roteiro no Vault e limpar</button>{data.ref&&<p style={{opacity:.7}}>Artefato privado selado.</p>}<Check l="Duas opções benignas presentes" v={data.twoBenign} set={v=>patch({twoBenign:v})}/><Check l="Uma opção real de recusa presente" v={data.realRefusal} set={v=>patch({realRefusal:v})}/><Check l="Somente auto-uso" v={data.selfUseOnly} set={v=>patch({selfUseOnly:v})}/><Check l="Sem promessa clínica" v={data.noClinicalPromise} set={v=>patch({noClinicalPromise:v})}/><Check l="Sem comando encoberto" v={data.noCovertCommand} set={v=>patch({noCovertCommand:v})}/><Check l="Escolha preservada" v={data.choicePreserved} set={v=>patch({choicePreserved:v})}/><MetricEditor value={data} set={patch}/></Card>}
