import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExperienceDirective } from '@hnk/quest-engine';

export interface BehavioralExperimentResult {
  before: Record<string, number>;
  after: Record<string, number>;
  observationRecorded: true;
}

export interface QuestBehavioralExperimentPhaseProps {
  directive: ExperienceDirective;
  onResult: (result: BehavioralExperimentResult) => void;
  onCompletePhase: (phaseId: string) => void | Promise<void>;
  onSafetyStop: (reason?: string) => void | Promise<void>;
}

function initialRatings(fields: string[]): Record<string, number> {
  return Object.fromEntries(fields.map((field) => [field, 5]));
}
function stringFields(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}
function label(field: string): string { return field.replaceAll('_', ' ').toUpperCase(); }

export function QuestBehavioralExperimentPhase({ directive, onResult, onCompletePhase, onSafetyStop }: QuestBehavioralExperimentPhaseProps) {
  const beforeFields = useMemo(() => stringFields(directive.phase.interaction?.before_fields), [directive]);
  const afterFields = useMemo(() => stringFields(directive.phase.interaction?.after_fields), [directive]);
  const [before, setBefore] = useState<Record<string, number>>(() => initialRatings(beforeFields));
  const [after, setAfter] = useState<Record<string, number>>(() => initialRatings(afterFields));
  const [started, setStarted] = useState(false);
  const [observed, setObserved] = useState(false);
  const technique = typeof directive.phase.interaction?.technique === 'string' ? directive.phase.interaction.technique : null;
  const canComplete = started && observed;

  const ratings = (fields: string[], values: Record<string, number>, update: (field: string, value: number) => void) => fields.map((field) => (
    <View key={field} style={styles.ratingBlock}>
      <Text style={styles.label}>{label(field)} · {values[field] ?? 5}</Text>
      <View style={styles.scale}>
        {[0,2,4,6,8,10].map((value) => (
          <Pressable key={value} onPress={() => update(field, value)} style={[styles.chip, values[field] === value && styles.activeChip]}>
            <Text style={styles.text}>{value}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  ));

  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>EXPERIMENTO · ANTES/DEPOIS</Text>
      {technique ? <Text style={styles.text}>Técnica: {technique}</Text> : null}
      <Text style={styles.text}>Registre expectativa e experiência percebida. Nenhuma mudança perceptível continua sendo um resultado válido.</Text>
      {directive.phase.interaction?.causality_claim_allowed === false ? <Text style={styles.notice}>A observação não prova causalidade médica, bioquímica, energética ou metafísica.</Text> : null}

      <Text style={styles.section}>ANTES</Text>
      {ratings(beforeFields, before, (field, value) => setBefore((current) => ({ ...current, [field]: value }))}
      {!started ? <Action label="INICIAR EXPERIMENTO" onPress={() => setStarted(true)} /> : null}

      {started ? <>
        <Text style={styles.section}>DEPOIS</Text>
        {ratings(afterFields, after, (field, value) => setAfter((current) => ({ ...current, [field]: value }))}
        <Action label={observed ? 'OBSERVAÇÃO REGISTRADA ✓' : 'REGISTRAR OBSERVAÇÃO HONESTA'} onPress={() => setObserved((value) => !value)} />
      </> : null}

      <Action label="ENCERRAR COM SEGURANÇA" onPress={() => void onSafetyStop('experiment_safety_stop')} />
      <Action disabled={!canComplete} label="CONTINUAR" onPress={() => {
        onResult({ before, after, observationRecorded: true });
        void onCompletePhase(directive.phase.id);
      }} />
    </View>
  );
}

function Action({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  panel: { gap: 12, padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#6f5f29', backgroundColor: '#111018' },
  eyebrow: { color: '#d9bd67', fontSize: 12, letterSpacing: 1.6 },
  section: { color: '#f4e6b2', fontSize: 16, fontWeight: '700', marginTop: 6 },
  text: { color: '#eee7d7', lineHeight: 21 },
  notice: { color: '#cfc3a4', lineHeight: 20 },
  label: { color: '#d9d0bd', fontSize: 12 },
  ratingBlock: { gap: 8 },
  scale: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { borderWidth: 1, borderColor: '#6f5f29', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  activeChip: { backgroundColor: '#4b3e16' },
  button: { borderWidth: 1, borderColor: '#9a8240', borderRadius: 12, padding: 12, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#f4e6b2', fontWeight: '700' },
});
