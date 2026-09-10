'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createQuestAudioController,
  type AudioRuntimeSnapshot,
  type ExperienceDirective,
} from '@hnk/quest-engine';
import { createWebQuestAudioRuntimeRegistry } from './quest-audio-runtime';
import styles from './quest-timed-audio-phase.module.css';

export interface TimedAudioCompletion {
  effectiveSeconds: number;
  averageVolumePermille: number;
  headphonesConfirmed: boolean;
}

export interface QuestTimedAudioPhaseProps {
  directive: ExperienceDirective;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onCompletePhase: (phaseId: string, result: TimedAudioCompletion) => void | Promise<void>;
  onSafetyStop: (reason?: string) => void | Promise<void>;
  onInvalidated?: (reason: string) => void;
}

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0.05;
  return Math.max(0.05, Math.min(1, value));
}

function formatSeconds(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function QuestTimedAudioPhase({ directive, volume, onVolumeChange, onCompletePhase, onSafetyStop, onInvalidated }: QuestTimedAudioPhaseProps) {
  const registry = useMemo(() => createWebQuestAudioRuntimeRegistry(), []);
  const controller = useMemo(() => createQuestAudioController(directive, registry), [directive, registry]);
  const requiredSecondsRaw = directive.phase.audio?.required_effective_seconds;
  const requiredSeconds = typeof requiredSecondsRaw === 'number' && Number.isInteger(requiredSecondsRaw) && requiredSecondsRaw > 0 ? requiredSecondsRaw : 0;
  if (!requiredSeconds) throw new Error(`timed_audio_required_seconds_invalid:${directive.phase.id}`);
  const targetMs = requiredSeconds * 1000;
  const headphonesNeeded = directive.phase.audio?.headphones_required_for_binaural_difference === true || directive.phase.audio?.headphones_match_active === true;

  const [snapshot, setSnapshot] = useState<AudioRuntimeSnapshot>(() => controller.snapshot());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [ready, setReady] = useState(false);
  const [headphonesConfirmed, setHeadphonesConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const effectiveMsRef = useRef(0);
  const weightedVolumeMsRef = useRef(0);
  const segmentStartedAtRef = useRef<number | null>(null);
  const segmentVolumeRef = useRef(clampVolume(volume));
  const finishingRef = useRef(false);
  const volumeRef = useRef(clampVolume(volume));
  volumeRef.current = clampVolume(volume);

  function refresh(): void { setSnapshot(controller.snapshot()); }
  function resetTiming(): void {
    effectiveMsRef.current = 0;
    weightedVolumeMsRef.current = 0;
    segmentStartedAtRef.current = null;
    segmentVolumeRef.current = volumeRef.current;
    finishingRef.current = false;
    setElapsedMs(0);
    setReady(false);
  }
  function commitSegment(now: number): number {
    const started = segmentStartedAtRef.current;
    if (started === null) return effectiveMsRef.current;
    const delta = Math.min(Math.max(0, targetMs - effectiveMsRef.current), Math.max(0, now - started));
    effectiveMsRef.current += delta;
    weightedVolumeMsRef.current += delta * segmentVolumeRef.current;
    segmentStartedAtRef.current = null;
    setElapsedMs(effectiveMsRef.current);
    return effectiveMsRef.current;
  }
  async function finishTiming(): Promise<void> {
    if (finishingRef.current || effectiveMsRef.current < targetMs) return;
    finishingRef.current = true;
    effectiveMsRef.current = targetMs;
    setElapsedMs(targetMs);
    await controller.stop();
    refresh();
    setReady(true);
  }
  async function start(): Promise<void> {
    if (headphonesNeeded && !headphonesConfirmed) { setError('Confirme os fones antes de iniciar este bloco.'); return; }
    setBusy(true); setError(null);
    try {
      if (ready || snapshot.status === 'STOPPED') resetTiming();
      const nextVolume = clampVolume(volumeRef.current);
      await controller.start(nextVolume);
      segmentVolumeRef.current = nextVolume;
      segmentStartedAtRef.current = performance.now();
      refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'timed_audio_start_failed'); refresh(); }
    finally { setBusy(false); }
  }
  async function pause(): Promise<void> {
    setBusy(true); setError(null);
    try { commitSegment(performance.now()); await controller.pause(); refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'timed_audio_pause_failed'); refresh(); }
    finally { setBusy(false); }
  }
  async function resume(): Promise<void> {
    setBusy(true); setError(null);
    try {
      await controller.resume();
      segmentVolumeRef.current = volumeRef.current;
      segmentStartedAtRef.current = performance.now();
      refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'timed_audio_resume_failed'); refresh(); }
    finally { setBusy(false); }
  }
  async function changeVolume(nextRaw: number): Promise<void> {
    const next = clampVolume(nextRaw);
    setError(null);
    try {
      const wasPlaying = snapshot.status === 'PLAYING';
      if (wasPlaying) commitSegment(performance.now());
      await controller.setVolume(next);
      onVolumeChange(next);
      volumeRef.current = next;
      segmentVolumeRef.current = next;
      if (wasPlaying && effectiveMsRef.current < targetMs) segmentStartedAtRef.current = performance.now();
      refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'timed_audio_volume_failed'); refresh(); }
  }
  async function discard(reason = 'audio_block_discarded'): Promise<void> {
    try { commitSegment(performance.now()); await controller.stop(); } catch { /* stop best effort */ }
    resetTiming();
    refresh();
    setError('Bloco corrente descartado. Reinicie os 10 minutos quando estiver pronto.');
    onInvalidated?.(reason);
  }
  async function safetyStop(): Promise<void> {
    try { await controller.stop(); } catch { /* stop best effort */ }
    resetTiming();
    refresh();
    await onSafetyStop('audio_safety_stop');
  }
  async function complete(): Promise<void> {
    if (!ready || effectiveMsRef.current !== targetMs) return;
    const average = Math.round((weightedVolumeMsRef.current / targetMs) * 1000);
    await onCompletePhase(directive.phase.id, { effectiveSeconds: requiredSeconds, averageVolumePermille: Math.max(1, Math.min(1000, average)), headphonesConfirmed: !headphonesNeeded || headphonesConfirmed });
  }

  useEffect(() => {
    if (snapshot.status !== 'PLAYING' || ready) return;
    const id = window.setInterval(() => {
      const now = performance.now();
      const total = commitSegment(now);
      if (total >= targetMs) { void finishTiming(); return; }
      segmentVolumeRef.current = volumeRef.current;
      segmentStartedAtRef.current = now;
    }, 250);
    return () => window.clearInterval(id);
  }, [snapshot.status, ready, targetMs]);

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState !== 'hidden' || ready) return;
      if (segmentStartedAtRef.current !== null || effectiveMsRef.current > 0) void discard('audio_background_invalidation');
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [ready]);

  useEffect(() => () => { void controller.stop(); }, [controller]);

  const remainingSeconds = Math.max(0, Math.ceil((targetMs - elapsedMs) / 1000));
  const playing = snapshot.status === 'PLAYING';
  const paused = snapshot.status === 'PAUSED';
  const started = snapshot.started && snapshot.status !== 'STOPPED';

  return (
    <section className={styles.panel} data-audio-profile={controller.profileId}>
      <div><span className={styles.eyebrow}>ÁUDIO CRONOMETRADO · TEMPO EFETIVO</span><h3>{controller.profileId}</h3></div>
      <div className={styles.timer}>{formatSeconds(remainingSeconds)}</div>
      <p className={styles.notice}>O cronômetro só avança enquanto o áudio toca em primeiro plano. Pausa não conta. Ocultar a aba descarta o bloco corrente. Volume maior não representa maior profundidade.</p>
      {headphonesNeeded ? <label className={styles.checks}><span><input type="checkbox" checked={headphonesConfirmed} onChange={(e)=>setHeadphonesConfirmed(e.target.checked)} disabled={started||ready}/> {directive.phase.audio?.headphones_match_active===true?'Estou usando os mesmos fones da condição ativa':'Estou usando fones de ouvido'}</span></label> : null}
      <label className={styles.volume}>VOLUME · {Math.round(volumeRef.current*100)}%<input type="range" min="0.05" max="1" step="0.05" value={volume} disabled={ready} onChange={(e)=>void changeVolume(Number(e.target.value))}/></label>
      <div className={styles.controls}>
        {!started && !ready ? <button disabled={busy||Boolean(headphonesNeeded&&!headphonesConfirmed)} onClick={()=>void start()}>INICIAR BLOCO</button> : null}
        {playing ? <button disabled={busy} onClick={()=>void pause()}>PAUSAR</button> : null}
        {paused ? <button disabled={busy} onClick={()=>void resume()}>RETOMAR</button> : null}
        {started ? <button disabled={busy} onClick={()=>void discard()}>PARAR · DESCARTAR BLOCO</button> : null}
      </div>
      <div className={styles.status}>STATUS · {ready?'TEMPO COMPLETO':snapshot.status} · EFETIVO {Math.floor(elapsedMs/1000)} / {requiredSeconds}s</div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button className={styles.safety} onClick={()=>void safetyStop()}>ENCERRAR COM SEGURANÇA</button>
        <button className={styles.complete} disabled={!ready||busy} onClick={()=>void complete()}>CONCLUIR BLOCO DE ÁUDIO</button>
      </div>
    </section>
  );
}
