'use client';
import {useMemo,useState} from 'react';
import {buildDay074EvidenceV1} from '@hnk/practice-contract';

type Entry={statement:string;specificityAnswer:string};
const empty=():Entry=>({statement:'',specificityAnswer:''});
const card={background:'#101016',border:'1px solid #353341',borderRadius:18,padding:18,margin:'14px 0'} as const;
const input={width:'100%',boxSizing:'border-box' as const,background:'#17171f',color:'#eee',border:'1px solid #454452',borderRadius:10,padding:10,marginTop:6};
export function Day074Web(){
 const[entries,setEntries]=useState<Entry[]>([empty(),empty(),empty()]);
 const[reviewed,setReviewed]=useState(false),[separated,setSeparated]=useState(false),[voluntary,setVoluntary]=useState(false),[noAuto,setNoAuto]=useState(false),[error,setError]=useState<string|null>(null);
 const complete=useMemo(()=>entries.every(x=>x.statement.trim()&&x.specificityAnswer.trim())&&reviewed&&separated&&voluntary&&noAuto,[entries,reviewed,separated,voluntary,noAuto]);
 function patch(i:number,key:keyof Entry,value:string){setEntries(xs=>xs.map((x,n)=>n===i?{...x,[key]:value}:x))}
 function validate(){setError(null);try{buildDay074EvidenceV1({sessionId:'00000000-0000-4000-8000-000000000074',entries,omissionsReviewedConfirmed:reviewed,observationInterpretationBeliefSeparatedConfirmed:separated,privateVaultEntryRef:'00000000-0000-4000-8000-000000000074',privateVaultE2eeConfirmed:true,practiceRecordNoPrivateProseConfirmed:true,voluntaryCompletionConfirmed:voluntary,nextDayNotAutoStartedConfirmed:noAuto});setError('Rascunho válido. Conclusão permanece bloqueada até Vault E2EE + backend server-authoritative do Day 074.') }catch(e){setError(e instanceof Error?e.message:'day074_invalid')}}
 return <main style={{maxWidth:900,margin:'0 auto',padding:'28px 18px 72px',fontFamily:'Inter,system-ui,sans-serif',color:'#eee'}}>
  <p style={{letterSpacing:2,opacity:.7}}>BINAH · ATZILUTH · DAY 074</p><h1>O Bisturi da Sacerdotisa</h1>
  <p>Identifique omissões simples e comparativas nas frases recorrentes. Registre três autoacusações e aplique a pergunta de especificidade do plano-fonte.</p>
  <section style={card}><h2>Kavanah · três registros privados</h2>{entries.map((e,i)=><div key={i} style={{margin:'18px 0'}}><strong>{i+1}. Autoacusação</strong><textarea aria-label={`Autoacusação ${i+1}`} value={e.statement} onChange={x=>patch(i,'statement',x.target.value)} style={input}/><label>Quem especificamente disse isso?<textarea value={e.specificityAnswer} onChange={x=>patch(i,'specificityAnswer',x.target.value)} style={input}/></label></div>)}</section>
  <section style={card}><h2>Discernimento</h2><Check label="Revisei as omissões/referentes das três frases" value={reviewed} set={setReviewed}/><Check label="Separei observação, interpretação e crença" value={separated} set={setSeparated}/><Check label="Conclusão voluntária" value={voluntary} set={setVoluntary}/><Check label="O próximo dia não será iniciado automaticamente" value={noAuto} set={setNoAuto}/></section>
  <section style={card}><h2>Gate de runtime</h2><p>+100 XP está definido no cânone, mas esta superfície não concede XP localmente. Texto privado deverá ser persistido somente no Vault E2EE; o backend autoritativo/idempotente ainda é requisito de release.</p><button disabled={!complete} onClick={validate}>Validar rascunho</button>{error&&<p role="status">{error}</p>}</section>
 </main>
}
function Check({label,value,set}:{label:string;value:boolean;set:(v:boolean)=>void}){return <label style={{display:'block',margin:'10px 0'}}><input type="checkbox" checked={value} onChange={e=>set(e.target.checked)}/> {label}</label>}
