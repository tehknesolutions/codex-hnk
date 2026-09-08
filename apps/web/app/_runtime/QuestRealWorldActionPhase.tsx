'use client';

import { useState } from 'react';
import type { ExperienceDirective } from '@hnk/quest-engine';
import type { RealWorldActionPort, RealWorldActionSnapshot } from '@hnk/real-world-action-contract';
import styles from './quest-real-world-action.module.css';

export function QuestRealWorldActionPhase({ directive, port, clientActionId, onCompletePhase, onSafetyStop }: {
  directive: ExperienceDirective;
  port: RealWorldActionPort;
  clientActionId: string;
  onCompletePhase: (phaseId: string) => void | Promise<void>;
  onSafetyStop: (reason?: string) => void | Promise<void>;
}) {
  const contractId = directive.phase.interaction?.action_contract_id;
  if (typeof contractId !== 'string' || !contractId.trim()) throw new Error('real_world_action_contract_id_missing');

  const [snapshot, setSnapshot] = useState<RealWorldActionSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<RealWorldActionSnapshot>): Promise<void> {
    setBusy(true); setError(null);
    try { setSnapshot(await action()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'real_world_action_failed'); }
    finally { setBusy(false); }
  }

  const qualified = snapshot?.state === 'qualified';
  const remaining = snapshot?.remaining_seconds ?? Number(directive.phase.interaction?.target_elapsed_seconds ?? 0);
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <section className={styles.panel} data-action-contract={contractId}>
      <p className={styles.eyebrow}>AÇÃO NO MUNDO REAL · RELÓGIO DO SERVIDOR</p>
      <h3>Janela consecutiva</h3>
      <p>O aplicativo não decide sozinho quando o período terminou. O estado abaixo vem do servidor.</p>
      <div className={styles.time}>{String(hours).padStart(2,'0')}:{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</div>
      <p>Estado: <strong>{snapshot?.state ?? 'não iniciada'}</strong> · reinícios: {snapshot?.restart_count ?? 0}</p>
      <p className={styles.notice}>Se perceber uma ocorrência que reinicia a janela, registre o reinício sem culpa ou punição. O objetivo é observação honesta, não perfeição.</p>

      <div className={styles.controls}>
        {!snapshot ? <button disabled={busy} type="button" onClick={() => void run(() => port.start(contractId, clientActionId))}>INICIAR JANELA</button> : null}
        {snapshot?.state === 'active' ? <button disabled={busy} type="button" onClick={() => void run(() => port.refresh(snapshot.id))}>VERIFICAR NO SERVIDOR</button> : null}
        {snapshot && snapshot.state !== 'qualified' ? <button disabled={busy} type="button" onClick={() => void run(() => port.restart(snapshot.id))}>PERCEBI UMA OCORRÊNCIA · REINICIAR</button> : null}
        {snapshot && snapshot.state !== 'qualified' ? <button disabled={busy} type="button" onClick={() => void run(() => port.stop(snapshot.id))}>ENCERRAR POR AGORA</button> : null}
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.actions}>
        <button type="button" className={styles.safety} onClick={() => void onSafetyStop('real_world_action_safety_stop')}>SAFETY STOP</button>
        <button type="button" className={styles.complete} disabled={!qualified} onClick={() => void onCompletePhase(directive.phase.id)}>JANELA QUALIFICADA · CONTINUAR</button>
      </div>
    </section>
  );
}
