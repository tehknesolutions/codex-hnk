import {useEffect,useState} from 'react';
import {AppState,Pressable,StyleSheet,Switch,Text,View} from 'react-native';
import {useAudioPlayer,useAudioPlayerStatus} from 'expo-audio';
import type {PublishedDay036PortalAudioAsset} from '@hnk/audio-contract/day036';

export interface KetherPortalTunerV1MobileProps{
  asset:PublishedDay036PortalAudioAsset|null;
  reducedSensory?:boolean;
  onSafetyStop?:(reason:string)=>void;
  onInterrupted?:(reason:string)=>void;
}

function clock(value:number){const seconds=Math.max(0,Math.floor(value));return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`}
function clampVolume(value:number){return Math.max(0.05,Math.min(1,value))}

export function KetherPortalTunerV1Mobile({asset,reducedSensory=false,onSafetyStop,onInterrupted}:KetherPortalTunerV1MobileProps){
  const player=useAudioPlayer(asset?.uri??null,{updateInterval:250});
  const status=useAudioPlayerStatus(player);
  const[volume,setVolume]=useState(reducedSensory?0.2:0.35);
  const[headphones,setHeadphones]=useState(false);
  const[error,setError]=useState<string|null>(null);
  const locked=!asset;

  useEffect(()=>{player.volume=clampVolume(volume)},[player,volume]);
  useEffect(()=>{const sub=AppState.addEventListener('change',state=>{if(state==='active'||!status.playing)return;player.pause();onInterrupted?.('day036_tuner_background_interruption')});return()=>sub.remove()},[onInterrupted,player,status.playing]);

  function play(){if(!asset){setError('day036_audio_not_published');return}if(!headphones){setError('Confirme os fones antes de iniciar o preset stereo do Portal.');return}setError(null);player.play()}
  function pause(){player.pause()}
  async function stop(){player.pause();await player.seekTo(0)}
  async function restart(){if(!asset){setError('day036_audio_not_published');return}if(!headphones){setError('Confirme os fones antes de reiniciar o preset stereo do Portal.');return}setError(null);player.pause();await player.seekTo(0);player.play()}
  async function safety(){await stop();onSafetyStop?.('day036_tuner_safety_stop')}
  function adjustVolume(delta:number){setVolume(current=>clampVolume(Math.round((current+delta)*20)/20))}

  const shownDuration=asset?.durationSeconds??(status.duration||720);
  return <View accessibilityLabel="Sintonizador Angelical HNK Kether V1" style={styles.card}>
    <Text style={styles.heading}>Sintonizador Angelical HNK — Kether V1</Text>
    <Text style={styles.text}>{locked?'LOCKED — aguarda asset publicado e listening QA.':'Published-asset mode. Nenhuma frequência é sintetizada em runtime.'}</Text>
    <Text style={styles.timer}>{clock(status.currentTime)} / {clock(shownDuration)}</Text>
    <View style={styles.row}><Switch value={headphones} onValueChange={setHeadphones} disabled={locked}/><Text style={styles.text}>Confirmo fones em volume confortável.</Text></View>
    <Text style={styles.text}>Volume: {Math.round(volume*100)}%</Text>
    <View style={styles.row}><Control label="−" disabled={locked||volume<=0.05} onPress={()=>adjustVolume(-0.05)}/><Control label="+" disabled={locked||volume>=1} onPress={()=>adjustVolume(0.05)}/></View>
    <View style={styles.controls}>
      <Control label="Play" disabled={locked||status.playing} onPress={play}/>
      <Control label="Pause" disabled={locked||!status.playing} onPress={pause}/>
      <Control label="Stop" disabled={locked} onPress={()=>{void stop()}}/>
      <Control label="Reiniciar fase" disabled={locked} onPress={()=>{void restart()}}/>
      <Control label="Retorno / Safety Stop" disabled={locked} onPress={()=>{void safety()}}/>
    </View>
    {reducedSensory&&<Text style={styles.text}>Modo sensorial reduzido: volume inicial limitado a 20%; sem flashes ou strobe.</Text>}
    {error&&<Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </View>
}

function Control({label,disabled,onPress}:{label:string;disabled:boolean;onPress:()=>void}){return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button,disabled&&styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>}
const styles=StyleSheet.create({card:{backgroundColor:'#101116',borderWidth:1,borderColor:'#363845',borderRadius:16,padding:16,marginTop:16},heading:{color:'#fff',fontSize:19,fontWeight:'800',marginBottom:8},text:{color:'#e8e8ea',fontSize:15,lineHeight:22,marginBottom:8,flexShrink:1},timer:{color:'#fff',fontSize:24,fontVariant:['tabular-nums'],fontWeight:'700',marginVertical:10},row:{flexDirection:'row',alignItems:'center',gap:10,marginVertical:4},controls:{flexDirection:'row',flexWrap:'wrap',gap:8,marginVertical:8},button:{backgroundColor:'#d9b86c',borderRadius:10,paddingHorizontal:12,paddingVertical:10},disabled:{opacity:.35},buttonText:{color:'#17120a',fontWeight:'800'},error:{color:'#ff9da8',fontSize:15,lineHeight:22,marginTop:8}});
