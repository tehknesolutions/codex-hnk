'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  createQuestAudioController,
  type AudioRuntimeSnapshot,
  type ExperienceDirective,
} from '@hnk/quest-engine';
import { createWebQuestAudioRuntimeRegistry } from './quest-audio-runtime';
import styles from './quest-audio-phase.module.css';

export interface QuestAudioPhaseProps {
  directive: ExperienceDirective;
  onCompletePhase: (phaseId: string) => void | Promise<void>;
  onSafetyStop: (reason?: string) => void | Promise<void>;
}

export function QuestAudioPhase({ directive, onCompletePhase, onSafetyStop }: QuestAudioPhaseProps) {
  const registry = useMemo(() => createWebQuestAudioRuntimeRegistry(), []);
  const controller = useMemo(
    () => createQuestAudioController(directive, registry),
    [directive, registry],
  );
  const [snapshot, setSnapshot] = useState<AudioRuntimeSnapshot>(() => controller.snapshot());
  const [volume, setVolume] = useState(0.5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headphonesRequired = directive.phase.audio?.headphones_required_for_binaural_difference === true;

  useEffect(() => () => { void controller.stop(); }, [controller]);

  function refresh(): void {
    setSnapshot(controller.snapshot());
  }

  async function run(action: () => Promise<void>): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      await action();
      refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'audio_runtime_failed');
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function stopForSafety(): Promise<void> {
    await run(() => controller.stop());
    await onSafetyStop('audio_safety_stop');
  }

  const started = snapshot.started;
  const playing = snapshot.status === 'PLAYING';
  const paused = snapshot.status === 'PAUSED';

  return (
    <section className={styles.panel} data-audio-profile={controller.profileId}>
      <header>
        <span className={styles.eyebrow}>AUDIO · PERFIL VERSIONADO</span>
        <h3>Prática sonora</h3>
        <p>Perfil: <code>{controller.profileId}</code></p>
      </header>

      {headphonesRequired ? (
        <p className={styles.notice}>
          Use fones de ouvido apenas se quiser perceber a diferença binaural entre os canais. O HNK não apresenta este áudio como prova de indução de um estado neurológico específico.
        </p>
      ) : null}

      <label className={styles.volume}>
        VOLUME
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(event) => {
            const next = Number(event.target.value);
            setVolume(next);
            void run(() => controller.setVolume(next));
          }}
        />
      </label>

      <div className={styles.controls}>
        {!started || snapshot.status === 'STOPPED' ? (
          <button disabled={busy} type="button" onClick={() => void run(() => controller.start(volume))}>INICIAR ÁUDIO</button>
        ) : null}
        {playing ? <button disabled={busy} type="button" onClick={() => void run(() => controller.pause())}>PAUSAR</button> : null}
        {paused ? <button disabled={busy} type="button" onClick={() => void run(() => controller.resume())}>RETOMAR</button> : null}
        {started && snapshot.status !== 'STOPPED' ? <button disabled={busy} type="button" onClick={() => void run(() => controller.stop())}>PARAR</button> : null}
      </div>

      <div className={styles.status}>STATUS · {snapshot.status}</div>
      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.actions}>
        <button className={styles.safety} type="button" onClick={() => void stopForSafety()}>ENCERRAR COM SEGURANÇA</button>
        <button
          className={styles.complete}
          type="button"
          disabled={!snapshot.started || snapshot.status === 'ERROR'}
          onClick={() => void onCompletePhase(directive.phase.id)}
        >
          CONCLUIR FASE DE ÁUDIO
        </button>
      </div>
    </section>
  );
}
