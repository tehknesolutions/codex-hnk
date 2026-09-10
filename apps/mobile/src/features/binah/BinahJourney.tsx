import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { BinahCycle01Hariel } from './BinahCycle01Hariel';
import { BinahCycle02Hakamiah } from './BinahCycle02Hakamiah';
import { BinahCycle03Lauviah } from './BinahCycle03Lauviah';
import { BinahCycle04Caliel } from './BinahCycle04Caliel';
import { BinahCycle05Leuviah } from './BinahCycle05Leuviah';

export function BinahJourney(){
 const auth=useHnkAuth(); const [currentDay,setCurrentDay]=useState(74); const [loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{if(!auth.client||auth.phase!=='signed-in'){setCurrentDay(74);setLoading(false);return;}const {data,error}=await auth.client.from('user_progress').select('current_day').maybeSingle();if(!error)setCurrentDay(data?.current_day??74);setLoading(false);},[auth.client,auth.phase]);
 useEffect(()=>{void refresh();},[refresh]); useEffect(()=>{if(!auth.client||auth.phase!=='signed-in')return;const id=setInterval(()=>void refresh(),4000);return()=>clearInterval(id);},[auth.client,auth.phase,refresh]);
 if(loading&&auth.phase==='signed-in')return <View style={s.loading}><ActivityIndicator color="#d9b8e8"/><Text style={s.loadingText}>LENDO A ROTA DE BINAH</Text></View>;
 if(currentDay<=78)return <BinahCycle01Hariel/>;
 if(currentDay<=83)return <BinahCycle02Hakamiah/>;
 if(currentDay<=88)return <BinahCycle03Lauviah/>;
 if(currentDay<=93)return <BinahCycle04Caliel/>;
 if(currentDay<=98)return <BinahCycle05Leuviah/>;
 return <View style={s.threshold}><Text style={s.eyebrow}>BINAH · FRONTEIRA G7</Text><Text style={s.title}>DIA {String(Math.min(currentDay,109)).padStart(3,'0')}</Text><Text style={s.body}>Hariel 074–078, Hakamiah 079–083, Lauviah 084–088, Caliel 089–093 e Leuviah 094–098 estão conectados à autoridade server-side. Os ciclos posteriores permanecem canônicos no armazenamento e só entram na experiência quando recebem runtime e evidence contracts próprios.</Text></View>;
}
const s=StyleSheet.create({loading:{flex:1,alignItems:'center',justifyContent:'center',gap:16,backgroundColor:'#08050b'},loadingText:{color:'#9277a0',fontSize:9,letterSpacing:1.5},threshold:{flex:1,backgroundColor:'#08050b',padding:28,justifyContent:'center'},eyebrow:{color:'#9a78ad',fontSize:9,letterSpacing:1.5},title:{color:'#f4eafa',fontSize:34,fontWeight:'300',marginTop:10},body:{color:'#a18ca9',fontSize:14,lineHeight:22,marginTop:14,maxWidth:620}});
