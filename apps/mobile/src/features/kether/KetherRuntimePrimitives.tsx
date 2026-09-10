import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompletionResult } from '@hnk/supabase-client';

export function RuntimeCard({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <View style={styles.card}><Text style={styles.cardLabel}>{label}</Text><Text style={styles.cardTitle}>{title}</Text><View style={styles.divider} />{children}</View>;
}

export function CanonicalText({ children }: { children: ReactNode }) {
  return <Text style={styles.canonical}>{children}</Text>;
}

export function RuntimeNotice({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.notice}><Text style={styles.noticeTitle}>{title}</Text><Text style={styles.noticeText}>{children}</Text></View>;
}

export function RuntimePrimary({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.primary, disabled && styles.primaryDisabled]}><Text style={[styles.primaryText, disabled && styles.primaryTextDisabled]}>{label}</Text></Pressable>;
}

export function RuntimeTimer({ value, target, onChange, allowEarlyStop = false }: { value: number; target: number; onChange: (value: number) => void; allowEarlyStop?: boolean }) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || value >= target) return;
    const id = setInterval(() => onChange(Math.min(target, value + 1)), 1000);
    return () => clearInterval(id);
  }, [onChange, running, target, value]);

  useEffect(() => { if (value >= target) setRunning(false); }, [target, value]);

  return (
    <View style={styles.timer}>
      <View>
        <Text style={styles.timerLabel}>TEMPO REAL</Text>
        <Text style={styles.timerValue}>{formatSeconds(value)}</Text>
        <Text style={styles.timerTarget}>{allowEarlyStop ? `LIMITE · ${formatSeconds(target)}` : `ALVO · ${formatSeconds(target)}`}</Text>
      </View>
      <Pressable style={styles.timerButton} disabled={value >= target} onPress={() => setRunning((state) => !state)}>
        <Text style={styles.timerButtonText}>{value >= target ? 'CONCLUÍDO' : running ? 'PAUSAR' : value > 0 ? 'CONTINUAR' : 'INICIAR'}</Text>
      </Pressable>
    </View>
  );
}

export function RuntimeOpenTimer({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => onChange(value + 1), 1000);
    return () => clearInterval(id);
  }, [onChange, running, value]);

  return (
    <View style={styles.timer}>
      <View>
        <Text style={styles.timerLabel}>TEMPO REAL</Text>
        <Text style={styles.timerValue}>{formatSeconds(value)}</Text>
        <Text style={styles.timerTarget}>SEM META NUMÉRICA CANÔNICA</Text>
      </View>
      <Pressable style={styles.timerButton} onPress={() => setRunning((state) => !state)}>
        <Text style={styles.timerButtonText}>{running ? 'PAUSAR' : value > 0 ? 'CONTINUAR' : 'INICIAR'}</Text>
      </Pressable>
    </View>
  );
}

export function RuntimeScale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.scale}>
      <Text style={styles.scaleLabel}>{label} · {value}/10</Text>
      <View style={styles.scaleRow}>{Array.from({ length: 11 }, (_, index) => <Pressable key={index} onPress={() => onChange(index)} style={[styles.scaleDot, value === index && styles.scaleDotActive]}><Text style={[styles.scaleDotText, value === index && styles.scaleDotTextActive]}>{index}</Text></Pressable>)}</View>
    </View>
  );
}

export function RuntimeCounter({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return <Pressable style={styles.counter} onPress={onPress}><Text style={styles.counterLabel}>{label}</Text><Text style={styles.counterValue}>+ {value}</Text></Pressable>;
}

export function RuntimeChoice({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) {
  return <Pressable style={[styles.choice, selected && styles.choiceSelected]} onPress={onPress}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>;
}

export function RuntimeCompletion({ completion, label }: { completion: CompletionResult | null | undefined; label: string }) {
  if (!completion) return null;
  return (
    <RuntimeCard label="PASSAGEM" title={`${label} confirmado`}>
      <View style={styles.reward}>
        <Text style={styles.rewardLabel}>{completion.firstCompletion ? 'RECOMPENSA CANÔNICA' : 'REVISITA'}</Text>
        <Text style={styles.rewardXp}>{completion.firstCompletion ? `+${completion.xpAwarded} XP` : 'XP JÁ SELADO'}</Text>
        <Text style={styles.rewardTotal}>XP TOTAL · {completion.xpTotal}</Text>
      </View>
      <Text style={styles.body}>Grau · {completion.initiatoryTitle}. Coroa e progressão são derivadas do estado canônico do servidor.</Text>
    </RuntimeCard>
  );
}

export const runtimeTextStyles = StyleSheet.create({
  body: { color: '#a7a89f', fontSize: 13, lineHeight: 21 },
  private: { color: '#a99a6a', fontSize: 10, letterSpacing: 0.7 },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#303137', borderRadius: 14, padding: 13, backgroundColor: '#050609', color: '#fffaf0', fontSize: 14 },
  textArea: { minHeight: 135, borderWidth: 1, borderColor: '#303137', borderRadius: 15, padding: 14, backgroundColor: '#050609', color: '#fffaf0', fontSize: 14, lineHeight: 21, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

function formatSeconds(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#292a2f', borderRadius: 24, padding: 22, backgroundColor: '#08090d', gap: 15 },
  cardLabel: { color: '#9b8953', fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  cardTitle: { color: '#f8f1db', fontSize: 23, lineHeight: 29, fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#27282c' },
  canonical: { color: '#ddd5bf', fontSize: 15, lineHeight: 25 },
  body: { color: '#a7a89f', fontSize: 13, lineHeight: 21 },
  notice: { borderWidth: 1, borderColor: '#343b3d', borderRadius: 15, padding: 14, backgroundColor: '#090d0f' },
  noticeTitle: { color: '#8fa4aa', fontSize: 8, letterSpacing: 1.2, fontWeight: '700' },
  noticeText: { color: '#aab7b9', fontSize: 12, lineHeight: 19, marginTop: 6 },
  primary: { minHeight: 54, borderRadius: 15, backgroundColor: '#dcc879', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  primaryDisabled: { backgroundColor: '#25251f' },
  primaryText: { color: '#10100d', fontSize: 9, letterSpacing: 1.4, fontWeight: '800', textAlign: 'center' },
  primaryTextDisabled: { color: '#65655b' },
  timer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#39331e', borderRadius: 17, padding: 16, backgroundColor: '#0b0b08' },
  timerLabel: { color: '#81754f', fontSize: 8, letterSpacing: 1.2 },
  timerValue: { color: '#f3df98', fontSize: 30, fontVariant: ['tabular-nums'], marginTop: 4 },
  timerTarget: { color: '#5d5843', fontSize: 8, letterSpacing: 1, marginTop: 3 },
  timerButton: { borderWidth: 1, borderColor: '#655a32', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  timerButtonText: { color: '#cfbd79', fontSize: 8, letterSpacing: 1.1, fontWeight: '700' },
  scale: { gap: 8 },
  scaleLabel: { color: '#a39b7d', fontSize: 9, letterSpacing: 1 },
  scaleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  scaleDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#303137', alignItems: 'center', justifyContent: 'center' },
  scaleDotActive: { borderColor: '#d6c277', backgroundColor: '#2a2513' },
  scaleDotText: { color: '#676970', fontSize: 9 },
  scaleDotTextActive: { color: '#f7e9a7' },
  counter: { borderWidth: 1, borderColor: '#303137', borderRadius: 15, padding: 15, backgroundColor: '#0a0b0e' },
  counterLabel: { color: '#73757c', fontSize: 8, letterSpacing: 1.1 },
  counterValue: { color: '#e8dab0', fontSize: 22, marginTop: 5 },
  choice: { borderWidth: 1, borderColor: '#303137', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#08090d' },
  choiceSelected: { borderColor: '#70623a', backgroundColor: '#171309' },
  choiceText: { color: '#777980', fontSize: 9, letterSpacing: 0.8 },
  choiceTextSelected: { color: '#e2d39d' },
  reward: { minHeight: 150, borderWidth: 1, borderColor: '#534827', borderRadius: 75, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0d08' },
  rewardLabel: { color: '#887a4f', fontSize: 8, letterSpacing: 1.3 },
  rewardXp: { color: '#fff0ad', fontSize: 28, fontWeight: '300', marginTop: 6 },
  rewardTotal: { color: '#8f825a', fontSize: 9, letterSpacing: 1.1, marginTop: 5 },
});
