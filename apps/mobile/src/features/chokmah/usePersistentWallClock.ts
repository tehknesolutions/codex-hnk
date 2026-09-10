import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export function usePersistentWallClock(key: string, capSeconds: number) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshElapsed = useCallback((start: number | null) => {
    if (start == null) { setElapsedSeconds(0); return; }
    setElapsedSeconds(Math.min(capSeconds, Math.max(0, Math.floor((Date.now() - start) / 1000))));
  }, [capSeconds]);

  useEffect(() => {
    let active = true;
    void SecureStore.getItemAsync(key).then((raw) => {
      if (!active) return;
      const parsed = raw ? Number(raw) : NaN;
      const start = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
      setStartedAt(start); refreshElapsed(start); setLoading(false);
    });
    return () => { active = false; };
  }, [key, refreshElapsed]);

  useEffect(() => {
    if (startedAt == null || elapsedSeconds >= capSeconds) return;
    const id = setInterval(() => refreshElapsed(startedAt), 1000);
    return () => clearInterval(id);
  }, [capSeconds, elapsedSeconds, refreshElapsed, startedAt]);

  const start = useCallback(async () => {
    const now = Date.now();
    await SecureStore.setItemAsync(key, String(now));
    setStartedAt(now); setElapsedSeconds(0);
  }, [key]);

  const finish = useCallback(async () => {
    refreshElapsed(startedAt);
    await SecureStore.deleteItemAsync(key);
    setStartedAt(null);
  }, [key, refreshElapsed, startedAt]);

  const reset = useCallback(async () => {
    await SecureStore.deleteItemAsync(key);
    setStartedAt(null); setElapsedSeconds(0);
  }, [key]);

  return { startedAt, elapsedSeconds, loading, start, finish, reset, atCap: elapsedSeconds >= capSeconds };
}
