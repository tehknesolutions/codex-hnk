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
  const [mode,setMode]=useState<Mode>('ACTIVE');
  const [playing,setPlaying]=useState(false);
  const [elapsed,setElapsed]=useState(0);
  const [gain,setGain]=useState(0.04);
  const [error,setError]=useState<string|null>(null);
  const src=publicUrl(mode==='ACTIVE'?activePath:controlPath);

  function clearTimers(){if(timerRef.current)clearInterval(timerRef.current);if(fadeRef.current)clearInterval(fadeRef.current);timerRef.current=null;fadeRef.current=null}
  function stop(){clearTimers();const audio=audioRef.current;if(audio){audio.pause();audio.currentTime=0;audio.volume=0}setPlaying(false);setElapsed(0)}
  useEffect(()=>()=>stop(),[]);
  useEffect(()=>{if(audioRef.current&&!playing)audioRef.current.volume=Math.min(gain,MAX_GAIN)},[gain,playing]);

  async function start(){
    if(!src||playing)return;
    setError(null);clearTimers();setElapsed(0);
    const audio=audioRef.current;if(!audio)return;
    audio.src=src;audio.loop=true;audio.currentTime=0;audio.volume=0;
    try{await audio.play()}catch(e){setError(e instanceof Error?e.message:'Falha ao iniciar master publicado.');return}
    setPlaying(true);
    const fadeStarted=Date.now();
    fadeRef.current=setInterval(()=>{const ratio=Math.min(1,(Date.now()-fadeStarted)/(FADE_IN_SECONDS*1000));audio.volume=Math.min(gain,MAX_GAIN)*ratio;if(ratio>=1&&fadeRef.current){clearInterval(fadeRef.current);fadeRef.current=null}},100);
    const started=Date.now();
    timerRef.current=setInterval(()=>{const seconds=Math.min(PRACTICE_SECONDS,Math.floor((Date.now()-started)/1000));setElapsed(seconds);if(seconds>=PRACTICE_SECONDS-FADE_OUT_SECONDS){audio.volume=Math.min(audio.volume,Math.min(gain,MAX_GAIN)*Math.max(0,(PRACTICE_SECONDS-seconds)/FADE_OUT_SECONDS))}if(seconds>=PRACTICE_SECONDS){stop()}},250);
  }

  function changeMode(next:Mode){if(playing)stop();setMode(next)}
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
    <label style={{display:'block',marginTop:16}}>Volume seguro · {gain.toFixed(2)} / {MAX_GAIN.toFixed(2)}<input aria-label="Volume Day 045" style={{display:'block',width:'100%',maxWidth:420}} type="range" min="0" max={MAX_GAIN} step="0.01" value={gain} onChange={e=>setGain(Math.min(MAX_GAIN,Number(e.target.value)))}/></label>
    <p>Modo: <strong>{mode}</strong> · restante: <strong>{Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}</strong></p>
    <p>Fade-in: 5 s · fade-out final: 10 s · parada manual: imediata. Fones são necessários apenas para perceber a diferença estéreo do ACTIVE.</p>
    <p>Interrompa em caso de desconforto, dor, irritação, zumbido ou mal-estar. Aumentar o volume não representa prática mais profunda.</p>
    {error?<p role="alert">Playback indisponível: {error}</p>:null}
    <audio ref={audioRef} preload="metadata" playsInline onError={()=>setError('O master publicado não pôde ser carregado pelo navegador.')}/>
  </section>
}
