import {ScrollView,StyleSheet,Text,View,type ReactNode} from 'react-native';
import {PORTAL073_PRODUCTION_ENABLED,PORTAL073_SIGIL_ID,PORTAL073_TRANSITION_PRESET_ID,PORTAL073_TUNER_ID} from './runtime-definitions/portal073';
import {MAGICIAN_MERCURY_SIGIL_SHA256,MagicianMercurySigilV1} from './MagicianMercurySigilV1';
import {PORTAL073_VAULT_SCHEMA} from './portal073-vault';

/** Fail-closed Day073 surface: inspectable operators, no begin/seal/XP action. */
export function Day073PortalReadinessMobile(){
  const productionEnabled=Boolean(PORTAL073_PRODUCTION_ENABLED);
  return <ScrollView contentContainerStyle={s.shell}>
    <Text style={s.kicker}>CHOKMAH → BINAH · PORTAL 073</Text><Text style={s.title}>O Voo do Mago</Text>
    <Text style={s.text}>Operadores canônicos materializados. Execução, conclusão autoritativa, +500 XP, promoção Teurgo/Binah e Day 074 permanecem bloqueados até os gates G7/G8.</Text>
    <Card title="Release gate"><Text style={s.lock}>{productionEnabled?'CONFIGURAÇÃO INCONSISTENTE: revisão obrigatória':'FAIL-CLOSED · APPROVED_NOT_PUBLISHED'}</Text></Card>
    <Card title="Operadores V1"><Text style={s.text}>Tuner · {PORTAL073_TUNER_ID}</Text><Text style={s.text}>ACTIVE · {PORTAL073_TRANSITION_PRESET_ID} · 528/532 Hz · 600 s</Text><Text style={s.text}>Sigilo · {PORTAL073_SIGIL_ID}</Text><Text style={s.mono}>SHA-256 {MAGICIAN_MERCURY_SIGIL_SHA256}</Text><MagicianMercurySigilV1/></Card>
    <Card title="Vault boundary"><Text style={s.text}>Schema interno criptografado · {PORTAL073_VAULT_SCHEMA}</Text><Text style={s.text}>O adaptador de persistência recebe somente ciphertext e metadados criptográficos. Nenhuma prosa privada é exibida ou coletada nesta superfície.</Text></Card>
    <Card title="Gates ainda pendentes"><Text style={s.text}>Áudio ACTIVE real 600 s · Dave Elman apenas como checkpoint canônico · Return Gate antes do Vault · receipt autenticado · decrypt round-trip · concorrência/exactly-once · QA de dispositivo.</Text></Card>
    <Text style={s.footer}>Nenhum botão de iniciar ou concluir é exposto enquanto o operador estiver não publicado.</Text>
  </ScrollView>
}
function Card({title,children}:{title:string;children:ReactNode}){return <View style={s.card}><Text style={s.cardTitle}>{title}</Text>{children}</View>}
const s=StyleSheet.create({shell:{padding:24,paddingBottom:56,backgroundColor:'#02050a',gap:16},kicker:{color:'#5f94aa',fontSize:10,letterSpacing:1.5},title:{color:'#e6f7ff',fontSize:34,fontWeight:'300'},text:{color:'#9bb0ba',fontSize:14,lineHeight:21},card:{borderWidth:1,borderColor:'#173342',borderRadius:14,padding:16,gap:10,backgroundColor:'#061018'},cardTitle:{color:'#d8f3ff',fontSize:17,fontWeight:'600'},lock:{color:'#ffd7a1',fontSize:13,fontWeight:'700'},mono:{color:'#7396a6',fontSize:10,lineHeight:15},footer:{color:'#6f8791',fontSize:12,lineHeight:18}});
