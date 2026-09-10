import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimePrimary, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { HARIEL_DAY_074, HARIEL_DAY_075, HARIEL_DAY_076 } from './runtime-definitions/hariel';

type HarielLanguageDay = 74 | 75 | 76;
type Row = { a: string; b: string; c: string };

const DEFINITIONS = { 74: HARIEL_DAY_074, 75: HARIEL_DAY_075, 76: HARIEL_DAY_076 } as const;
const META = {
  74: { label: 'HARIEL 1/5 · DIA 074', title: 'Três auto-acusações sem falsa certeza', count: 3, a: 'Auto-acusação como aparece', b: 'Fonte/contexto/evidência e grau de certeza', c: 'Reformulação mais precisa' },
  75: { label: 'HARIEL 2/5 · DIA 075', title: 'Cinco verbos vagos viram processos observáveis', count: 5, a: 'Verbo/frase vaga', b: 'Como especificamente acontece?', c: 'Critério/contexto utilizado' },
  76: { label: 'HARIEL 3/5 · DIA 076', title: 'Cinco comparações com referência explícita', count: 5, a: 'Comparação recorrente', b: 'Em relação a quem/o quê + período', c: 'Critério e decisão: manter/revisar/abandonar' },
} as const;

export function HarielDays074to076Experience({ day }: { day: HarielLanguageDay }) {
  const definition = DEFINITIONS[day];
  const meta = META[day];
  const controller = useHnkDayRuntime(definition);
  const [canon,setCanon] = useState<CanonicalDaySnapshot|null>(null);
  const [error,setError] = useState<string|null>(null);
  const [rows,setRows] = useState<Row[]>(() => Array.from({ length: meta.count }, () => ({ a:'',b:'',c:'' })));
  const [nextAction,setNextAction] = useState('');
  const [vault,setVault] = useState(false);
  const [checksum,setChecksum] = useState<string|null>(null);
  const [factInference,setFactInference] = useState(false);
  const [uncertainty,setUncertainty] = useState(false);
  const [falseMemory,setFalseMemory] = useState(false);
  const [diagnosis,setDiagnosis] = useState(false);
  const [responsibility,setResponsibility] = useState(false);
  const [unknowns,setUnknowns] = useState(false);
  const [antiCompulsion,setAntiCompulsion] = useState(false);
  const [personalValue,setPersonalValue] = useState(false);
  const [usefulComparison,setUsefulComparison] = useState(false);
  const [abandonedComparison,setAbandonedComparison] = useState(false);
  const [thirdPartyInference,setThirdPartyInference] = useState(false);
  const [noRanking,setNoRanking] = useState(false);
  const [noIdentity,setNoIdentity] = useState(false);
  const [safety,setSafety] = useState(false);
  const [objects,setObjects] = useState(0);
  const [orientation,setOrientation] = useState(false);

  useEffect(() => {
    let active=true;
    if(!controller.auth.client||controller.auth.phase!=='signed-in') return () => { active=false; };
    void loadCanonicalDay(controller.auth.client,day).then(v=>{if(active)setCanon(v);}).catch(e=>{if(active)setError(e instanceof Error?e.message:'canonical_day_load_failed');});
    return () => { active=false; };
  },[controller.auth.client,controller.auth.phase,day]);

  const completeRows = useMemo(() => rows.filter(r => r.a.trim() && r.b.trim() && r.c.trim()).length,[rows]);
  const requiredReview = day===74
    ? factInference&&uncertainty&&falseMemory&&diagnosis&&responsibility
    : day===75
      ? unknowns&&antiCompulsion&&personalValue&&nextAction.trim().length>1
      : usefulComparison&&abandonedComparison&&thirdPartyInference&&noRanking&&noIdentity;

  const patchRow=(index:number,key:keyof Row,value:string)=>setRows(current=>current.map((row,i)=>i===index?{...row,[key]:value}:row));
  const saveVault=async()=>{
    if(!controller.auth.client||!controller.auth.userId||completeRows!==meta.count) return;
    if(day===75&&nextAction.trim().length<2) return;
    try{
      const enc=await encryptVaultText({userId:controller.auth.userId,day,kind:`hariel-day${day}-language`,plaintext:JSON.stringify({schema:`hnk-hariel-day${day}-v1`,rows,next_action:day===75?nextAction.trim():undefined})});
      await saveEncryptedVaultEntry(controller.auth.client,{day,payload:enc}); setChecksum(enc.checksumSha256); setVault(true); controller.nextPhase();
    }catch(e){setError(e instanceof Error?e.message:`day${day}_vault_failed`);}
  };
  const stop=()=>controller.interrupt({evidence:{safety_stop:true},metrics:{items_completed:completeRows}});
  const phase=controller.phase?.id;
  if(controller.loading) return <View style={s.loading}><Text style={s.meta}>ABRINDO {meta.label}</Text></View>;

  const evidence: Record<string, boolean | number> = day===74 ? {
    protocol_completed:true,return_confirmed:true,three_accusations_recorded:true,three_reformulations_recorded:true,fact_inference_separated:factInference,uncertainty_preserved:uncertainty,false_memory_not_claimed:falseMemory,diagnosis_not_claimed:diagnosis,responsibility_preserved:responsibility,vault_saved:vault,safety_clear:safety,accusations_count:3,reformulations_count:3,
  } : day===75 ? {
    protocol_completed:true,return_confirmed:true,five_verbs_recorded:true,five_operational_definitions_recorded:true,five_criteria_recorded:true,unknowns_allowed:unknowns,next_action_defined:nextAction.trim().length>1,productivity_compulsion_avoided:antiCompulsion,personal_value_not_scored:personalValue,vault_saved:vault,safety_clear:safety,verbs_count:5,operational_definitions_count:5,criteria_count:5,
  } : {
    protocol_completed:true,return_confirmed:true,five_comparisons_recorded:true,references_identified:true,criteria_identified:true,useful_comparison_defined:usefulComparison,one_comparison_abandoned:abandonedComparison,third_party_inner_state_not_inferred:thirdPartyInference,no_spiritual_ranking:noRanking,third_party_identity_not_sent:noIdentity,vault_saved:vault,safety_clear:safety,comparisons_count:5,references_count:5,criteria_count:5,
  };

  return <ScrollView style={s.screen} contentContainerStyle={s.content}>
    <View style={s.header}><Text style={s.eyebrow}>BINAH · {meta.label}</Text><Text style={s.title}>{canon?.title??meta.title}</Text><Text style={s.meta}>{canon?`${canon.sourcePath} · ${canon.sourceSha.slice(0,10)} · +${canon.xp} XP`:'CÂNONE SINCRONIZANDO'}</Text></View>
    {controller.error||error?<RuntimeNotice title="RUNTIME">{error??controller.error}</RuntimeNotice>:null}
    {controller.runtime?.status==='locked'?<RuntimeCard label="GATE" title={`Dia ${day} bloqueado pela sequência`}><Text style={runtimeTextStyles.body}>A primeira conclusão depende do Day anterior confirmado pelo servidor. O Portal 073 não é contornado por existir runtime Binah.</Text></RuntimeCard>:null}
    {phase==='threshold'?<RuntimeCard label={meta.label} title={meta.title}><CanonicalText>{canon?.blocks['jachin-kavanah']??''}</CanonicalText><RuntimeNotice title="VAULT-FIRST">Frases pessoais, fontes, nomes, critérios e contexto não entram na telemetria. O servidor recebe apenas estrutura mínima.</RuntimeNotice><RuntimePrimary label="INICIAR" disabled={!canon||controller.busy} onPress={()=>void controller.begin().then(controller.nextPhase)}/></RuntimeCard>:null}
    {phase==='vault'?<RuntimeCard label="VAULT" title={`${meta.count} registros privados`}>
      {rows.map((row,index)=><View key={index} style={s.rowCard}><Text style={s.rowTitle}>{index+1}/{meta.count}</Text><TextInput value={row.a} onChangeText={v=>patchRow(index,'a',v)} placeholder={meta.a} placeholderTextColor="#665f70" style={runtimeTextStyles.input}/><TextInput value={row.b} onChangeText={v=>patchRow(index,'b',v)} placeholder={meta.b} placeholderTextColor="#665f70" style={runtimeTextStyles.input}/><TextInput value={row.c} onChangeText={v=>patchRow(index,'c',v)} placeholder={meta.c} placeholderTextColor="#665f70" style={runtimeTextStyles.input}/></View>)}
      {day===75?<TextInput value={nextAction} onChangeText={setNextAction} placeholder="Próxima ação pequena e verificável" placeholderTextColor="#665f70" style={runtimeTextStyles.input}/>:null}
      <Text style={runtimeTextStyles.body}>Completos: {completeRows}/{meta.count}</Text><RuntimePrimary label="SAFETY STOP" onPress={stop}/><RuntimePrimary label="CIFRAR E SELAR PRÉ-REGISTRO" disabled={completeRows!==meta.count||(day===75&&nextAction.trim().length<2)} onPress={()=>void saveVault()}/>
    </RuntimeCard>:null}
    {phase==='review'?<RuntimeCard label="REVISÃO" title="Precisão com limite ético">
      {day===74?<><RuntimeChoice selected={factInference} label="SEPAREI FATO, LEMBRANÇA, INFERÊNCIA E AUTOJULGAMENTO" onPress={()=>setFactInference(v=>!v)}/><RuntimeChoice selected={uncertainty} label="PRESERVEI INCERTEZA EM VEZ DE INVENTAR ORIGEM" onPress={()=>setUncertainty(v=>!v)}/><RuntimeChoice selected={falseMemory} label="NÃO TRATEI O MÉTODO COMO RECUPERAÇÃO INFALÍVEL DE MEMÓRIA" onPress={()=>setFalseMemory(v=>!v)}/><RuntimeChoice selected={diagnosis} label="NÃO CONVERTI O EXERCÍCIO EM DIAGNÓSTICO" onPress={()=>setDiagnosis(v=>!v)}/><RuntimeChoice selected={responsibility} label="PRECISÃO NÃO FOI USADA PARA APAGAR RESPONSABILIDADE REAL" onPress={()=>setResponsibility(v=>!v)}/></>:null}
      {day===75?<><RuntimeChoice selected={unknowns} label="MARQUEI LACUNAS COMO NÃO ESPECIFICADAS EM VEZ DE INVENTAR" onPress={()=>setUnknowns(v=>!v)}/><RuntimeChoice selected={antiCompulsion} label="NÃO AUMENTEI METAS PARA PRODUZIR SENSAÇÃO DE RIGOR" onPress={()=>setAntiCompulsion(v=>!v)}/><RuntimeChoice selected={personalValue} label="NÃO TRANSFORMEI DESEMPENHO EM VALOR PESSOAL" onPress={()=>setPersonalValue(v=>!v)}/></>:null}
      {day===76?<><RuntimeChoice selected={usefulComparison} label="IDENTIFIQUEI PELO MENOS UMA COMPARAÇÃO ÚTIL" onPress={()=>setUsefulComparison(v=>!v)}/><RuntimeChoice selected={abandonedComparison} label="ABANDONEI PELO MENOS UMA COMPARAÇÃO INADEQUADA" onPress={()=>setAbandonedComparison(v=>!v)}/><RuntimeChoice selected={thirdPartyInference} label="NÃO ADIVINHEI O ESTADO INTERNO DE TERCEIROS" onPress={()=>setThirdPartyInference(v=>!v)}/><RuntimeChoice selected={noRanking} label="NÃO CRIEI RANKING ESPIRITUAL" onPress={()=>setNoRanking(v=>!v)}/><RuntimeChoice selected={noIdentity} label="NOME/IDENTIDADE DE TERCEIROS NÃO SERÃO ENVIADOS AO SERVIDOR" onPress={()=>setNoIdentity(v=>!v)}/></>:null}
      <RuntimeChoice selected={safety} label="ESTOU ORIENTADO E SEM SOFRIMENTO RELEVANTE PARA CONTINUAR" onPress={()=>setSafety(v=>!v)}/><RuntimePrimary label="GROUNDING" disabled={!requiredReview||!safety} onPress={controller.nextPhase}/>
    </RuntimeCard>:null}
    {phase==='grounding'?<RuntimeCard label="RETURN GATE" title="Voltar ao ambiente sem transformar precisão em punição"><RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objects} onPress={()=>setObjects(v=>Math.min(5,v+1))}/><RuntimeChoice selected={orientation} label="ORIENTAÇÃO RESTAURADA" onPress={()=>setOrientation(v=>!v)}/><RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects<3||!orientation} onPress={()=>{controller.setReturnConfirmed();controller.nextPhase();}}/></RuntimeCard>:null}
    {phase==='seal'?<RuntimeCard label="SELO SERVER-SIDE" title={meta.label}><RuntimePrimary label={controller.busy?'SELANDO…':`SELAR DIA ${day}`} disabled={controller.busy||!vault||!checksum||!safety} onPress={()=>void controller.seal({localRecordHash:checksum??undefined,evidence}).then(controller.nextPhase).catch(e=>setError(e instanceof Error?e.message:`day${day}_seal_failed`))}/></RuntimeCard>:null}
    {phase==='complete'?<RuntimeCompletion completion={controller.runtime?.serverCompletion} label={meta.label}/>:null}
  </ScrollView>;
}

const s=StyleSheet.create({screen:{flex:1,backgroundColor:'#08050b'},content:{padding:24,gap:18,paddingBottom:52},loading:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#08050b'},header:{gap:6},eyebrow:{color:'#9a78ad',fontSize:8,letterSpacing:1.5},title:{color:'#f4eafa',fontSize:25,lineHeight:31,fontWeight:'300'},meta:{color:'#806d8a',fontSize:8,letterSpacing:0.8},rowCard:{gap:8,padding:12,borderWidth:1,borderColor:'#2d2034',borderRadius:10},rowTitle:{color:'#ad91bb',fontSize:9,letterSpacing:1.2}});
