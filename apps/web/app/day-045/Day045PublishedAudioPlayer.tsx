'use client';

import {useEffect,useRef,useState} from 'react';

const PRACTICE_SECONDS=600;
const MAX_GAIN=0.08;
const FADE_IN_SECONDS=5;
const FADE_OUT_SECONDS=10;

type Props={activePath:string;controlPath:string};
type Mode='ACTIVE'|'CONTROL';

function publicUrl(storagePath:string):string|null{
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'');
  if(!base)return null;
  const slash=storagePath.indexOf('/');
  if(slash<1)return null;
  const bucket=storagePath.slice(0,slash);
  const objectPath=storagePath.slice(slash+1).split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath}`;
}

export function Day045PublishedAudioPlayer({activePath,controlPath}:Props){
  const audioRef=useRef<HTMLAudioElement|null>(null);
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const fadeRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const gainRef=useRef(0.04);
  const playingRef=useRef(false);
  const [mode,setMode]=useState<Mode>('ACTIVE');
  const [playing,setPlaying]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [gain,setGain]=useState(0.04);
  const [error,setError]=useState<string|null>(null);
  const src=publicUrl(mode==='ACTIVE'?activePath:controlPath);

  function clearTimers(){if(timerRef.current)clearInterval(timerRef.current);if(fadeRef.current)clearInterval(fadeRef.current);timerRef.current=null;fadeRef.current=null}
  function stop(){clearTimers();playingRef.current=false;const audio=audioRef.current;if(audio){audio.pause();audio.currentTime=0;audio.volume=0}setPlaying(false);setElapsed(0)}
  useEffect(()=>{gainRef.current=gain},[gain]);
  useEffect(()=>{playingRef.current=playing},[playing]);
  useEffect(()=>()=>stop(),[]);
  useEffect(()=>{const halt=()=>{if(playingRef.current)stop()};const visibility=()=>{if(document.visibilityState!=='visible')halt()};window.addEventListener('pagehide',halt);document.addEventListener('visibilitychange',visibility);return()=>{window.removeEventListener('pagehide',halt);document.removeEventListener('visibilitychange',visibility)}},[]);
  useEffect(()=>{if(audioRef.current&&!playing)audioRef.current.volume=Math.min(gain,MAX_GAIN)},[gain,playing]);

  async function start(){
    if(!src||playingRef.current)return;
    setError(null);clearTimers();setElapsed(0);
    const audio=audioRef.current;if(!audio)return;
    audio.src=src;audio.loop=true;audio.currentTime=0;audio.volume=0;
    try{await audio.play()}catch(e){setError(e instanceof Error?e.message:'Falha ao iniciar master publicado.');return}
    playingRef.current=true;setPlaying(true);
    const fadeStarted=Date.now();
    fadeRef.current=setInterval(()=>{const target=Math.min(gainRef.current,MAX_GAIN);const ratio=Math.min(1,(Date.now()-fadeStarted)/(FADE_IN_SECONDS*1000));audio.volume=target*ratio;if(ratio>=1&&fadeRef.current){clearInterval(fadeRef.current);fadeRef.current=null}},100);
    const started=Date.now();
    timerRef.current=setInterval(()=>{const seconds=Math.min(PRACTICE_SECONDS,Math.floor((Date.now()-started)/1000));setElapsed(seconds);if(seconds>=PRACTICE_SECONDS-FADE_OUT_SECONDS){const target=Math.min(gainRef.current,MAX_GAIN);audio.volume=Math.min(audio.volume,target*Math.max(0,(PRACTICE_SECONDS-seconds)/FADE_OUT_SECONDS))}if(seconds>=PRACTICE_SECONDS){stop()}},250);
  }

  function changeGain(nextValue:number){const next=Math.min(MAX_GAIN,Math.max(0,nextValue));gainRef.current=next;setGain(next);const audio=audioRef.current;if(audio&&playingRef.current&&elapsed< PRACTICE_SECONDS-FADE_OUT_SECONDS&&fadeRef.current===null)audio.volume=next}
  function changeMode(next:Mode){if(playingRef.current)stop();setMode(next)}
  const remaining=PRACTICE_SECONDS-elapsed;
  return <section data-day045-published-player="true" style={{background:'#171223',border:'1px solid #655184',borderRadius:18,padding:20,margin:'18px 0'}}>
    <h2>Runtime Web · masters publicados</h2>
    <p>Reprodução exclusiva dos WAVs verificados no Storage. Sem oscillator, sem síntese no navegador e sem autoplay.</p>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
      <button type="button" disabled={playing} aria-pressed={mode==='ACTIVE'} onClick={()=>changeMode('ACTIVE')}>ACTIVE · 432/444</button>
      <button type="button" disabled={playing} aria-pressed={mode==='CONTROL'} onClick={()=>changeMode('CONTROL')}>CONTROL · 432/432</button>
      <button type="button" disabled={playing||!src} onClick={()=>void start()}>INICIAR 10 MIN</button>
      <button type="button" disabled={!playing} onClick={stop}>PARAR AGORA</button>
    </div>
    <label style={{display:'block',marginTop:16}}>Volume seguro · {gain.toFixed(2)} / {MAX_GAIN.toFixed(2)}<input aria-label="Volume Day 045" style={{display:'block',width:'100%',maxWidth:420}} type="range" min="0" max={MAX_GAIN} step="0.01" value={gain} onChange={e=>changeGain(Number(e.target.value))}/></label>
    <p>Modo: <strong>{mode}</strong> · restante: <strong>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</strong></p>
    <p>Fade-in: 5 s · fade-out final: 10 s · parada manual: imediata. Fones são necessários apenas para perceber a diferença estéreo do ACTIVE.</p>
    <p>Interrompa em caso de desconforto, dor, irritação, zumbido ou mal-estar. Aumentar o volume não representa prática mais profunda.</p>
    {error?<p role="alert">Playback indisponível: {error}</p>:null}
    <audio ref={audioRef} preload="metadata" playsInline onError={()=>setError('O master publicado não pôde ser carregado pelo navegador.')}/>
  </section>
}
