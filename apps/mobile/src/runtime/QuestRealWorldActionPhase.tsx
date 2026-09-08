import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExperienceDirective } from '@hnk/quest-engine';
import type { RealWorldActionPort, RealWorldActionSnapshot } from '@hnk/real-world-action-contract';

export function QuestRealWorldActionPhase({ directive, port, clientActionId, onCompletePhase, onSafetyStop, onSnapshotChange }: {
  directive: ExperienceDirective;
  port: RealWorldActionPort;
  clientActionId: string;
  onCompletePhase: (phaseId: string) => void | Promise<void>;
  onSafetyStop: (reason?: string) => void | Promise<void>;
  onSnapshotChange?: (snapshot: RealWorldActionSnapshot) => void;
}) {
  const contractId = directive.phase.interaction?.action_contract_id;
  if (typeof contractId !== 'string' || !contractId.trim()) throw new Error('real_world_action_contract_id_missing');

  const [snapshot, setSnapshot] = useState<RealWorldActionSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<RealWorldActionSnapshot>) {
    setBusy(true); setError(null);
    try {
      const next = await action();
      setSnapshot(next);
      onSnapshotChange?.(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'real_world_action_failed');
    } finally { setBusy(false); }
  }

  const qualified = snapshot?.state === 'qualified';
  const remaining = snapshot?.remaining_seconds ?? Number(directive.phase.interaction?.target_elapsed_seconds ?? 0);
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <View style={styles.panel}>
      <Text style={styles.eyebrow}>AÇÃO NO MUNDO REAL · RELÓGIO DO SERVIDOR</Text>
      <Text style={styles.title}>Janela consecutiva</Text>
      <Text style={styles.copy}>O aplicativo não decide sozinho quando o período terminou. O estado vem do servidor.</Text>
      <Text style={styles.time}>{String(hours).padStart(2,'0')}:{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</Text>
      <Text style={styles.copy}>Estado: {snapshot?.state ?? 'não iniciada'} · reinícios: {snapshot?.restart_count ?? 0}</Text>
      <Text style={styles.notice}>Se perceber uma ocorrência que reinicia a janela, registre o reinício sem culpa ou punição. O objetivo é observação honesta, não perfeição.</Text>

      {!snapshot ? <ActionButton disabled={busy} label="INICIAR JANELA" onPress={() => void run(() => port.start(contractId, clientActionId))} /> : null}
      {snapshot?.state === 'active' ? <ActionButton disabled={busy} label="VERIFICAR NO SERVIDOR" onPress={() => void run(() => port.refresh(snapshot.id))} /> : null}
      {snapshot && snapshot.state !== 'qualified' ? <ActionButton disabled={busy} label="PERCEBI UMA OCORRÊNCIA · REINICIAR" onPress={() => void run(() => port.restart(snapshot.id))} /> : null}
      {snapshot && snapshot.state !== 'qualified' ? <ActionButton disabled={busy} label="ENCERRAR POR AGORA" onPress={() => void run(() => port.stop(snapshot.id))} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ActionButton label="SAFETY STOP" onPress={() => void onSafetyStop('real_world_action_safety_stop')} />
      <ActionButton disabled={!qualified} label="JANELA QUALIFICADA · CONTINUAR" onPress={() => void onCompletePhase(directive.phase.id)} />
    </View>
  );
}

function ActionButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}><Text style={styles.buttonText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  panel:{gap:12,padding:18,borderWidth:1,borderColor:'rgba(255,255,255,0.18)',borderRadius:18},
  eyebrow:{fontSize:11,letterSpacing:1.5,opacity:0.7},title:{fontSize:22,fontWeight:'700'},copy:{lineHeight:20},
  time:{fontSize:34,fontWeight:'700',fontVariant:['tabular-nums']},notice:{lineHeight:20,padding:12,borderRadius:12,backgroundColor:'rgba(255,255,255,0.06)'},
  button:{minHeight:44,justifyContent:'center',alignItems:'center',paddingHorizontal:16,borderWidth:1,borderColor:'rgba(255,255,255,0.4)',borderRadius:999},
  buttonText:{color:'white',fontWeight:'700',fontSize:12,letterSpacing:0.7},disabled:{opacity:0.4},error:{color:'#ffb4b4'}
});
