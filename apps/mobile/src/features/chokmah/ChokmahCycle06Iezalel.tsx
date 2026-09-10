import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { IezalelDay062InnerListeningExperience } from './IezalelDay062InnerListeningExperience';
import { IezalelDay063CriticExperience } from './IezalelDay063CriticExperience';
import { IezalelDay064AutomaticWritingExperience } from './IezalelDay064AutomaticWritingExperience';
import { IezalelDay065IntercessionExperience } from './IezalelDay065IntercessionExperience';
import { IezalelDay066GneoGeoExperience } from './IezalelDay066GneoGeoExperience';

const DAYS = [62,63,64,65,66] as const;
type IezalelDay = (typeof DAYS)[number];

export function ChokmahCycle06Iezalel() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(62);
  const [xpTotal, setXpTotal] = useState(0);
  const [title, setTitle] = useState('Iniciado');
  const [displayDay, setDisplayDay] = useState<IezalelDay>(62);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!auth.client || auth.phase !== 'signed-in') { setLoading(false); return; }
    const { data, error } = await auth.client.from('user_progress').select('current_day,xp_total,initiatory_title').maybeSingle();
    if (!error && data) {
      setCurrentDay(data.current_day); setXpTotal(data.xp_total); setTitle(data.initiatory_title);
      if (data.current_day >= 62 && data.current_day <= 66) setDisplayDay(data.current_day as IezalelDay);
      if (data.current_day > 66) setDisplayDay(66);
    }
    setLoading(false);
  }, [auth.client, auth.phase]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!auth.client || auth.phase !== 'signed-in') return;
    const id = setInterval(() => void refresh(), 4000);
    return () => clearInterval(id);
  }, [auth.client, auth.phase, refresh]);

  if (loading && auth.phase === 'signed-in') return <View style={styles.loading}><ActivityIndicator color="#9fc6ff" /><Text style={styles.loadingText}>ABRINDO O CICLO DE IEZALEL</Text></View>;
  const completed = Math.max(0, Math.min(5, currentDay - 62));

  return <View style={styles.screen}>
    <View style={styles.rail}><View style={styles.railLine} />{DAYS.map((day,index) => {
      const done = index < completed; const available = day <= currentDay; const active = displayDay === day;
      return <Pressable key={day} disabled={!available} onPress={() => setDisplayDay(day)} style={styles.nodeWrap}><View style={[styles.node, done && styles.nodeDone, active && styles.nodeActive, !available && styles.nodeLocked]}><Text style={[styles.nodeText,(done||active)&&styles.nodeTextActive]}>{done ? '✓' : day}</Text></View><Text style={[styles.nodeLabel,active&&styles.nodeLabelActive]}>{day===62?'ESCUTA':day===63?'CRÍTICA':day===64?'ESCRITA':day===65?'CUIDADO':'GNEO'}</Text></Pressable>;
    })}</View>
    <View style={styles.header}><View><Text style={styles.eyebrow}>CHOKMAH · CICLO VI · ESCUTA E DISCERNIMENTO DE IEZALEL</Text><Text style={styles.heading}>DIA {String(displayDay).padStart(3,'0')}</Text></View><View style={styles.stats}><Text style={styles.stat}>{title.toUpperCase()}</Text><Text style={styles.stat}>{xpTotal} XP</Text><Text style={styles.stat}>LEVEL 2</Text></View></View>
    {displayDay===62?<IezalelDay062InnerListeningExperience/>:null}
    {displayDay===63?<IezalelDay063CriticExperience/>:null}
    {displayDay===64?<IezalelDay064AutomaticWritingExperience/>:null}
    {displayDay===65?<IezalelDay065IntercessionExperience/>:null}
    {displayDay===66?<IezalelDay066GneoGeoExperience/>:null}
  </View>;
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#02050a'}, loading:{flex:1,alignItems:'center',justifyContent:'center',gap:16,backgroundColor:'#02050a'}, loadingText:{color:'#6585a5',fontSize:9,letterSpacing:1.5},
  rail:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:18,paddingTop:18,paddingBottom:10,backgroundColor:'#030810',position:'relative'}, railLine:{position:'absolute',left:44,right:44,top:33,height:1,backgroundColor:'#1d3046'}, nodeWrap:{flex:1,alignItems:'center',gap:7}, node:{width:30,height:30,borderRadius:15,borderWidth:1,borderColor:'#334861',backgroundColor:'#07101a',alignItems:'center',justifyContent:'center'}, nodeDone:{borderColor:'#5f87b7',backgroundColor:'#0b2034'}, nodeActive:{borderColor:'#9fcfff',backgroundColor:'#17334d'}, nodeLocked:{opacity:0.3}, nodeText:{color:'#71879b',fontSize:8,fontWeight:'700'}, nodeTextActive:{color:'#e2f2ff'}, nodeLabel:{color:'#526b80',fontSize:6,letterSpacing:0.7}, nodeLabelActive:{color:'#8fb5d7'},
  header:{flexDirection:'row',justifyContent:'space-between',gap:16,paddingHorizontal:24,paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#12263a'}, eyebrow:{color:'#6f96ba',fontSize:8,letterSpacing:1.5}, heading:{color:'#e8f4ff',fontSize:14,letterSpacing:2.1,marginTop:5}, stats:{alignItems:'flex-end',gap:3}, stat:{color:'#72899c',fontSize:8,letterSpacing:1},
});
