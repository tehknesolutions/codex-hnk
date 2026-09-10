import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useHnkAuth } from '../auth/AuthContext';
import { ChokmahCycle01Cahetel } from './ChokmahCycle01Cahetel';
import { ChokmahCycle02Haziel } from './ChokmahCycle02Haziel';
import { ChokmahCycle03Aladiah } from './ChokmahCycle03Aladiah';
import { ChokmahCycle04Lauviah } from './ChokmahCycle04Lauviah';
import { ChokmahCycle05Hahaiah } from './ChokmahCycle05Hahaiah';
import { ChokmahCycle06Iezalel } from './ChokmahCycle06Iezalel';
import { ChokmahCycle07Mebahel } from './ChokmahCycle07Mebahel';
import { ChokmahDay072BlackMirrorExperience } from './ChokmahDay072BlackMirrorExperience';

export function ChokmahJourney() {
  const auth = useHnkAuth();
  const [currentDay, setCurrentDay] = useState(37);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!auth.client || auth.phase !== 'signed-in') {
      setCurrentDay(37);
      setLoading(false);
      return;
    }
    const { data, error } = await auth.client.from('user_progress').select('current_day').maybeSingle();
    if (!error) setCurrentDay(data?.current_day ?? 37);
    setLoading(false);
  }, [auth.client, auth.phase]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!auth.client || auth.phase !== 'signed-in') return;
    const id = setInterval(() => void refresh(), 4000);
    return () => clearInterval(id);
  }, [auth.client, auth.phase, refresh]);

  if (loading && auth.phase === 'signed-in') {
    return <View style={styles.loading}><ActivityIndicator color="#8ed7ff" /><Text style={styles.loadingText}>LENDO A ROTA DE CHOKMAH</Text></View>;
  }

  if (currentDay <= 41) return <ChokmahCycle01Cahetel />;
  if (currentDay <= 46) return <ChokmahCycle02Haziel />;
  if (currentDay <= 51) return <ChokmahCycle03Aladiah />;
  if (currentDay <= 56) return <ChokmahCycle04Lauviah />;
  if (currentDay <= 61) return <ChokmahCycle05Hahaiah />;
  if (currentDay <= 66) return <ChokmahCycle06Iezalel />;
  if (currentDay <= 71) return <ChokmahCycle07Mebahel />;
  if (currentDay === 72) return <ChokmahDay072BlackMirrorExperience />;

  return (
    <View style={styles.threshold}>
      <Text style={styles.eyebrow}>CHOKMAH · PORTAL 073</Text>
      <Text style={styles.title}>DIA {String(Math.min(currentDay, 73)).padStart(3, '0')}</Text>
      <Text style={styles.body}>O Portal 073 permanece fail-closed até o runtime vincular os operadores canônicos, o Vault cifrado e o Return Gate e o conjunto do servidor ser publicado após QA.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#02050a' },
  loadingText: { color: '#5a89a1', fontSize: 9, letterSpacing: 1.5 },
  threshold: { flex: 1, backgroundColor: '#02050a', padding: 28, justifyContent: 'center' },
  eyebrow: { color: '#5f94aa', fontSize: 9, letterSpacing: 1.5 },
  title: { color: '#e6f7ff', fontSize: 34, fontWeight: '300', marginTop: 10 },
  body: { color: '#89a0aa', fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 620 },
});
