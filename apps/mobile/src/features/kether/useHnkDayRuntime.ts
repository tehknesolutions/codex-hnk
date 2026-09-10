import { useCallback, useEffect, useState } from 'react';
import {
  advancePhase,
  applyServerCompletion,
  confirmReturn,
  createClientSessionId,
  createDayRuntimeState,
  currentPhase,
  interruptDayRuntime,
  markEvidencePending,
  mergeEvidence,
  startDayRuntime,
  type DayDefinition,
  type DayRuntimeState,
  type RuntimeProgressSnapshot,
  type SafeEvidence,
  type SafeEvidenceValue,
} from '@hnk/day-runtime';
import {
  completeCodexDay,
  interruptPracticeSession,
  savePortalPracticeRecord,
  savePracticeRecord,
  startPracticeSession,
  type PortalSafeEvidence,
  type PracticeSessionRecord,
} from '@hnk/supabase-client';
import { useHnkAuth } from '../auth/AuthContext';

type RemoteSafeRecord = Record<string, number | boolean | null>;

function remoteSafeEvidence(evidence: SafeEvidence): RemoteSafeRecord {
  const safe: RemoteSafeRecord = {};
  for (const [key, value] of Object.entries(evidence)) {
    if (typeof value === 'string') {
      throw new Error(`categorical_evidence_adapter_required:${key}`);
    }
    safe[key] = value;
  }
  return safe;
}

export interface SealDayInput {
  evidence?: SafeEvidence;
  remoteEvidence?: RemoteSafeRecord;
  portalRemoteEvidence?: PortalSafeEvidence;
  metrics?: RemoteSafeRecord;
  durationSeconds?: number | null;
  localRecordHash?: string | null;
}

export interface InterruptDayInput {
  evidence?: RemoteSafeRecord;
  metrics?: RemoteSafeRecord;
  durationSeconds?: number | null;
  localRecordHash?: string | null;
}

export function useHnkDayRuntime(definition: DayDefinition) {
  const auth = useHnkAuth();
  const [runtime, setRuntime] = useState<DayRuntimeState | null>(null);
  const [progress, setProgress] = useState<RuntimeProgressSnapshot | null>(null);
  const [practice, setPractice] = useState<PracticeSessionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!auth.client || auth.phase !== 'signed-in') {
      const localProgress: RuntimeProgressSnapshot = {
        completedDays: [],
        currentDay: 1,
        xpTotal: 0,
        initiatoryGrade: 1,
        initiatoryTitle: 'Neófito',
      };
      setProgress(localProgress);
      setRuntime(createDayRuntimeState(definition, localProgress));
      setPractice(null);
      setLoading(false);
      return;
    }

    try {
      const [progressResult, completionResult] = await Promise.all([
        auth.client
          .from('user_progress')
          .select('current_day,xp_total,initiatory_grade,initiatory_title')
          .maybeSingle(),
        auth.client.from('day_completions').select('day').order('day', { ascending: true }),
      ]);

      if (progressResult.error) throw progressResult.error;
      if (completionResult.error) throw completionResult.error;

      const snapshot: RuntimeProgressSnapshot = {
        completedDays: (completionResult.data ?? []).map((row) => row.day),
        currentDay: progressResult.data?.current_day ?? 1,
        xpTotal: progressResult.data?.xp_total ?? 0,
        initiatoryGrade: progressResult.data?.initiatory_grade ?? 1,
        initiatoryTitle: progressResult.data?.initiatory_title ?? 'Neófito',
      };

      setProgress(snapshot);
      setRuntime(createDayRuntimeState(definition, snapshot));
      setPractice(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'runtime_refresh_failed');
    } finally {
      setLoading(false);
    }
  }, [auth.client, auth.phase, definition]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const begin = useCallback(async () => {
    if (!runtime) throw new Error('runtime_not_ready');
    if (runtime.status === 'locked') throw new Error('day_locked');
    if (!auth.client || !auth.userId || auth.phase !== 'signed-in') throw new Error('authentication_required');

    setBusy(true);
    setError(null);
    try {
      const clientSessionId = createClientSessionId(definition.day, auth.userId);
      const next = startDayRuntime(runtime, clientSessionId);
      const session = await startPracticeSession(auth.client, {
        day: definition.day,
        clientSessionId,
        mode: next.mode === 'revisit' ? 'revisit' : 'canonical',
        appVersion: '0.1.0',
      });
      setPractice(session);
      setRuntime(next);
      return session;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'practice_start_failed');
      throw cause;
    } finally {
      setBusy(false);
    }
  }, [auth.client, auth.phase, auth.userId, definition.day, runtime]);

  const nextPhase = useCallback(() => {
    setRuntime((current) => current ? advancePhase(current, definition) : current);
  }, [definition]);

  const setEvidence = useCallback((patch: Record<string, SafeEvidenceValue>) => {
    setRuntime((current) => current ? mergeEvidence(current, patch) : current);
  }, []);

  const setReturnConfirmed = useCallback(() => {
    setRuntime((current) => current ? mergeEvidence(confirmReturn(current), { return_confirmed: true }) : current);
  }, []);

  const persistInterruption = useCallback(async (input: InterruptDayInput = {}) => {
    if (!practice) return null;
    if (!auth.client || auth.phase !== 'signed-in') return null;

    const session = await interruptPracticeSession(auth.client, {
      sessionId: practice.id,
      durationSeconds: input.durationSeconds ?? null,
      metrics: input.metrics ?? {},
      evidence: input.evidence ?? {},
      endedAt: new Date().toISOString(),
      localRecordHash: input.localRecordHash ?? null,
    });
    setPractice(session);
    return session;
  }, [auth.client, auth.phase, practice]);

  /**
   * Default safety/agency stop. It is deliberately local-first: the runtime
   * becomes interrupted immediately. When online, server persistence follows
   * best-effort and never blocks the user's ability to stop.
   */
  const interrupt = useCallback((input: InterruptDayInput = {}) => {
    setRuntime((current) => current ? interruptDayRuntime(current) : current);
    void persistInterruption(input).catch((cause) => {
      setError(cause instanceof Error ? cause.message : 'practice_interrupt_persist_failed');
    });
  }, [persistInterruption]);

  /** Awaitable variant for flows that need to know server persistence finished. */
  const interruptPersisted = useCallback(async (input: InterruptDayInput = {}) => {
    setRuntime((current) => current ? interruptDayRuntime(current) : current);
    setError(null);
    try {
      return await persistInterruption(input);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'practice_interrupt_persist_failed');
      throw cause;
    }
  }, [persistInterruption]);

  const seal = useCallback(async (input: SealDayInput = {}) => {
    if (!runtime || !practice) throw new Error('practice_session_required');
    if (!auth.client || auth.phase !== 'signed-in') throw new Error('authentication_required');
    if (input.remoteEvidence && input.portalRemoteEvidence) throw new Error('multiple_remote_evidence_adapters_forbidden');

    setBusy(true);
    setError(null);
    try {
      const withPatch = input.evidence ? mergeEvidence(runtime, input.evidence) : runtime;
      const pending = markEvidencePending(withPatch, definition);
      const evidence = input.remoteEvidence ?? remoteSafeEvidence(pending.evidence);

      if (input.portalRemoteEvidence) {
        await savePortalPracticeRecord(auth.client, {
          sessionId: practice.id,
          durationSeconds: input.durationSeconds ?? null,
          metrics: input.metrics ?? {},
          evidence: input.portalRemoteEvidence,
          endedAt: new Date().toISOString(),
          localRecordHash: input.localRecordHash ?? null,
        });
      } else {
        await savePracticeRecord(auth.client, {
          sessionId: practice.id,
          durationSeconds: input.durationSeconds ?? null,
          metrics: input.metrics ?? {},
          evidence,
          readyForCompletion: true,
          endedAt: new Date().toISOString(),
          localRecordHash: input.localRecordHash ?? null,
        });
      }

      const completion = await completeCodexDay(auth.client, {
        day: definition.day,
        sessionId: practice.id,
        localRecordHash: input.localRecordHash ?? null,
      });

      const complete = applyServerCompletion(pending, completion);
      setRuntime(complete);
      setProgress((current) => current ? {
        ...current,
        completedDays: current.completedDays.includes(definition.day)
          ? current.completedDays
          : [...current.completedDays, definition.day],
        xpTotal: completion.xpTotal,
        initiatoryGrade: completion.initiatoryGrade,
        initiatoryTitle: completion.initiatoryTitle,
        currentDay: Math.max(current.currentDay, definition.day + 1),
      } : current);
      return completion;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'day_seal_failed');
      throw cause;
    } finally {
      setBusy(false);
    }
  }, [auth.client, auth.phase, definition, practice, runtime]);

  return {
    auth,
    live,
    loading,
    busy,
    error,
    runtime,
    progress,
    practice,
    phase: runtime ? currentPhase(runtime, definition) : null,
    refresh,
    begin,
    nextPhase,
    setEvidence,
    setReturnConfirmed,
    interrupt,
    interruptPersisted,
    seal,
  };
}
