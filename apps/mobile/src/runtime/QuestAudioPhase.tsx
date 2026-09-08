import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  createQuestAudioController,
  type AudioRuntimeSnapshot,
  type ExperienceDirective,
} from '@hnk/quest-engine';
import { createMobileQuestAudioRuntimeRegistry } from './quest-audio-runtime';

export interface QuestAudioPhaseProps {
  directive: ExperienceDirective;
  onCompletePhase: (phaseId: string) => void | Promise<void>;
  onSafetyStop: (reason?: string) => void | Promise<void>;
}

const VOLUME_STEPS = [0.2, 0.35, 0.5, 0.7] as const;

export function QuestAudioPhase({ directive, onCompletePhase, onSafetyStop }: QuestAudioPhaseProps) {
  const registry = useMemo(() => createMobileQuestAudioRuntimeRegistry(), []);
  const controller = useMemo(() => createQuestAudioController(directive, registry), [directive, registry]);
  const [snapshot, setSnapshot] = useState<AudioRuntimeSnapshot>(() => controller.snapshot());
  const [volume, setVolumeState] = useState(0.5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headphonesRequired = directive.phase.audio?.headphones_required_for_binaural_difference === true;

  useEffect(() => () => { void controller.stop(); }, [controller]);

  function refresh() {
    setSnapshot(controller.snapshot());
  }

  async function run(action: () => Promise<void>) {
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

  async function setVolume(next: number) {
    setVolumeState(next);
    await run(() => controller.setVolume(next));
  }

  async function stopForSafety() {
    await run(() => controller.stop());
    await onSafetyStop('audio_safety_stop');
  }

  const started = snapshot.started;
  const playing = snapshot.status === 'PLAYING';
  const paused = snapshot.status === 'PAUSED';

  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>AUDIO · PERFIL VERSIONADO</Text>
      <Text style={styles.title}>Prática sonora</Text>
      <Text style={styles.profile}>{controller.profileId}</Text>

      {headphonesRequired ? (
        <Text style={styles.notice}>
          Use fones de ouvido se quiser perceber a diferença binaural entre os canais. O HNK não apresenta este áudio como prova de indução de um estado neurológico específico.
        </Text>
      ) : null}

      <Text style={styles.label}>VOLUME</Text>
      <View style={styles.row}>
        {VOLUME_STEPS.map((step) => (
          <Pressable
            key={step}
            disabled={busy}
            onPress={() => void setVolume(step)}
            style={[styles.chip, volume === step && styles.chipActive]}
          >
            <Text style={styles.chipText}>{Math.round(step * 100)}%</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        {!started || snapshot.status === 'STOPPED' ? (
          <Pressable disabled={busy} onPress={() => void run(() => controller.start(volume))} style={styles.button}>
            <Text style={styles.buttonText}>INICIAR ÁUDIO</Text>
          </Pressable>
        ) : null}
        {playing ? (
          <Pressable disabled={busy} onPress={() => void run(() => controller.pause())} style={styles.button}>
            <Text style={styles.buttonText}>PAUSAR</Text>
          </Pressable>
        ) : null}
        {paused ? (
          <Pressable disabled={busy} onPress={() => void run(() => controller.resume())} style={styles.button}>
            <Text style={styles.buttonText}>RETOMAR</Text>
          </Pressable>
        ) : null}
        {started && snapshot.status !== 'STOPPED' ? (
          <Pressable disabled={busy} onPress={() => void run(() => controller.stop())} style={styles.button}>
            <Text style={styles.buttonText}>PARAR</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.status}>STATUS · {snapshot.status}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable onPress={() => void stopForSafety()} style={[styles.button, styles.safety]}>
        <Text style={styles.buttonText}>ENCERRAR COM SEGURANÇA</Text>
      </Pressable>
      <Pressable
        disabled={!snapshot.started || snapshot.status === 'ERROR'}
        onPress={() => void onCompletePhase(directive.phase.id)}
        style={[styles.button, styles.complete, (!snapshot.started || snapshot.status === 'ERROR') && styles.disabled]}
      >
        <Text style={styles.buttonText}>CONCLUIR FASE DE ÁUDIO</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: 12, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 18 },
  eyebrow: { fontSize: 11, letterSpacing: 1.8, opacity: 0.7 },
  title: { fontSize: 22, fontWeight: '700' },
  profile: { fontSize: 12, opacity: 0.7 },
  notice: { lineHeight: 20, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)' },
  label: { fontSize: 11, letterSpacing: 1.4, opacity: 0.7 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', borderRadius: 999 },
  chipActive: { backgroundColor: 'rgba(255,255,255,0.12)' },
  chipText: { color: 'white', fontSize: 12 },
  button: { minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', borderRadius: 999 },
  buttonText: { color: 'white', fontWeight: '700', fontSize: 12, letterSpacing: 0.8 },
  status: { fontSize: 11, letterSpacing: 1.2, opacity: 0.7 },
  error: { color: '#ffb4b4' },
  safety: { opacity: 0.85 },
  complete: { borderColor: 'rgba(255,255,255,0.75)' },
  disabled: { opacity: 0.4 },
});
