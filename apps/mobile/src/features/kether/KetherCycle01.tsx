import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getKetherCrownState,
  parseVehuiahFragment,
  resolveVehuiahRoute,
  type VehuiahDay,
  type VehuiahFragmentState,
} from '@hnk/supabase-client';
import { useHnkAuth } from '../auth/AuthContext';
import { Day001LiveVerticalSlice } from './Day001LiveVerticalSlice';
import { VehuiahDayExperience } from './VehuiahDayExperience';

type ProgressState = {
  currentDay: number;
  xpTotal: number;
  initiatoryTitle: string;
};

const DEFAULT_PROGRESS: ProgressState = {
  currentDay: 1,
  xpTotal: 0,
  initiatoryTitle: 'Neófito',
};

export function KetherCycle01() {
  const auth = useHnkAuth();
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [displayDay, setDisplayDay] = useState<VehuiahDay | null>(1);
  const [fragment, setFragment] = useState<VehuiahFragmentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoDay, setDemoDay] = useState<VehuiahDay>(1);

  const live = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);

  const refreshProgress = useCallback(async () => {
    if (!auth.client || auth.phase !== 'signed-in') {
      setProgress(DEFAULT_PROGRESS);
      setLoading(false);
      return;
    }

    const { data, error } = await auth.client
      .from('user_progress')
      .select('current_day,xp_total,initiatory_title')
      .maybeSingle();

    if (error) {
      setLoading(false);
      return;
    }

    const next: ProgressState = data
      ? {
          currentDay: data.current_day,
          xpTotal: data.xp_total,
          initiatoryTitle: data.initiatory_title,
        }
      : DEFAULT_PROGRESS;

    setProgress(next);

    if (next.currentDay >= 6) {
      try {
        const crown = await getKetherCrownState(auth.client);
        setFragment(parseVehuiahFragment(crown));
      } catch {
        setFragment(null);
      }
    }

    setLoading(false);
  }, [auth.client, auth.phase]);

  useEffect(() => {
    void refreshProgress();
  }, [refreshProgress]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => void refreshProgress(), 6000);
    return () => clearInterval(id);
  }, [live, refreshProgress]);

  useEffect(() => {
    if (!live) {
      setDisplayDay(demoDay);
      return;
    }
    if (loading) return;
    const route = resolveVehuiahRoute(progress.currentDay);
    setDisplayDay((current) => {
      if (route.cycleComplete) return current && current <= 5 ? current : null;
      if (current == null) return route.activeDay;
      if (current > (route.activeDay ?? 1)) return route.activeDay;
      return current;
    });
  }, [demoDay, live, loading, progress.currentDay]);

  const completedDays = live ? Math.max(0, Math.min(5, progress.currentDay - 1)) : Math.max(0, demoDay - 1);
  const serverNextAvailable = live && displayDay != null && progress.currentDay > displayDay;
  const cycleComplete = live && progress.currentDay >= 6 && displayDay == null;

  const headerLabel = useMemo(() => {
    if (cycleComplete) return 'FRAGMENTO I';
    return displayDay ? `DIA ${String(displayDay).padStart(3, '0')}` : 'CICLO I';
  }, [cycleComplete, displayDay]);

  if (loading && live) {
    return (
      <View style={styles.loading}>
        <View style={styles.loadingCrown}><View style={styles.loadingPoint} /></View>
        <ActivityIndicator color="#fff4bd" />
        <Text style={styles.loadingText}>LENDO O ESTADO DE VEHUIAH</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CycleRail
        activeDay={displayDay}
        completedDays={completedDays}
        live={live}
        currentDay={progress.currentDay}
        onDemoSelect={(day) => {
          if (!live) setDemoDay(day);
        }}
      />

      <View style={styles.cycleHeader}>
        <View>
          <Text style={styles.cycleEyebrow}>KETHER · CICLO I · A FAÍSCA DE VEHUIAH</Text>
          <Text style={styles.cycleCurrent}>{headerLabel}</Text>
        </View>
        <View style={styles.cycleAccount}>
          <Text style={styles.cycleAccountText}>{live ? `${progress.initiatoryTitle.toUpperCase()} · ${progress.xpTotal} XP` : 'DEMONSTRAÇÃO'}</Text>
          {live ? (
            <Pressable onPress={() => void auth.signOut()}>
              <Text style={styles.signOut}>SAIR DO ÁTRIO</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {serverNextAvailable ? (
        <Pressable
          style={styles.nextBanner}
          onPress={() => {
            if (progress.currentDay >= 6) setDisplayDay(null);
            else setDisplayDay(progress.currentDay as VehuiahDay);
          }}
        >
          <View>
            <Text style={styles.nextEyebrow}>SELO RECEBIDO PELO SERVIDOR</Text>
            <Text style={styles.nextTitle}>{progress.currentDay >= 6 ? 'VER O FRAGMENTO I' : `CONTINUAR A EMANAÇÃO · DIA ${String(progress.currentDay).padStart(3, '0')}`}</Text>
          </View>
          <Text style={styles.nextArrow}>→</Text>
        </Pressable>
      ) : null}

      {cycleComplete ? (
        <FragmentOneScene fragment={fragment} xpTotal={progress.xpTotal} />
      ) : displayDay === 1 ? (
        <Day001LiveVerticalSlice />
      ) : displayDay && displayDay >= 2 && displayDay <= 5 ? (
        <VehuiahDayExperience
          dayNumber={displayDay}
          onServerProgress={() => void refreshProgress()}
        />
      ) : null}
    </View>
  );
}

function CycleRail({
  activeDay,
  completedDays,
  live,
  currentDay,
  onDemoSelect,
}: {
  activeDay: VehuiahDay | null;
  completedDays: number;
  live: boolean;
  currentDay: number;
  onDemoSelect: (day: VehuiahDay) => void;
}) {
  return (
    <View style={styles.railWrap}>
      <View style={styles.railLine} />
      {([1, 2, 3, 4, 5] as VehuiahDay[]).map((day) => {
        const done = day <= completedDays;
        const active = activeDay === day;
        const available = live ? day <= currentDay : true;
        return (
          <Pressable
            key={day}
            disabled={live || !available}
            onPress={() => onDemoSelect(day)}
            style={styles.railNodeWrap}
          >
            <View style={[styles.railNode, done && styles.railNodeDone, active && styles.railNodeActive, !available && styles.railNodeLocked]}>
              <Text style={[styles.railNodeText, (done || active) && styles.railNodeTextActive]}>{done ? '✓' : day}</Text>
            </View>
            <Text style={[styles.railLabel, active && styles.railLabelActive]}>{day === 1 ? 'ENTRAR' : day === 2 ? 'PERMANECER' : day === 3 ? 'OBSERVAR' : day === 4 ? 'RECONFIGURAR' : 'DELIMITAR'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FragmentOneScene({ fragment, xpTotal }: { fragment: VehuiahFragmentState | null; xpTotal: number }) {
  const lit = fragment?.lit === true && fragment.completedDays === 5;
  return (
    <View style={styles.fragmentScreen}>
      <View style={[styles.crownCircle, lit && styles.crownCircleLit]}>
        <View style={styles.crownInner}>
          <View style={[styles.crownPoint, lit && styles.crownPointLit]} />
        </View>
        <View style={styles.fragmentBars}>
          {Array.from({ length: 5 }, (_, index) => (
            <View key={index} style={[styles.fragmentBar, lit && styles.fragmentBarLit]} />
          ))}
        </View>
      </View>
      <Text style={styles.fragmentEyebrow}>COROA · FRAGMENTO I</Text>
      <Text style={styles.fragmentTitle}>{lit ? 'VEHUIAH ACESO' : 'AGUARDANDO CONFIRMAÇÃO CANÔNICA'}</Text>
      <Text style={styles.fragmentBody}>
        {lit
          ? 'As cinco práticas convergiram. O servidor confirmou Vehuiah 5/5 e acendeu o primeiro traço da Coroa. O Grau permanece Neófito.'
          : 'A interface não acende o fragmento por cálculo local. Somente o estado canônico do servidor pode confirmar 5/5.'}
      </Text>
      <View style={styles.fragmentStats}>
        <Stat label="PRÁTICAS" value={fragment ? `${fragment.completedDays}/5` : '—'} />
        <Stat label="FRAGMENTO" value={lit ? 'ACESO' : 'PENDENTE'} />
        <Stat label="XP TOTAL" value={String(xpTotal)} />
        <Stat label="GRAU" value="NEÓFITO" />
      </View>
      <View style={styles.jelielGate}>
        <Text style={styles.jelielEyebrow}>PRÓXIMO ARCO</Text>
        <Text style={styles.jelielTitle}>JELIEL · O SILÊNCIO · DIA 006</Text>
        <Text style={styles.jelielBody}>O próximo ciclo já existe no cânone. A experiência de produto será implementada somente depois do fechamento técnico deste primeiro arco.</Text>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  loading: { flex: 1, backgroundColor: '#030406', alignItems: 'center', justifyContent: 'center', gap: 20 },
  loadingCrown: { width: 130, height: 130, borderRadius: 65, borderWidth: 1, borderColor: '#39321d', alignItems: 'center', justifyContent: 'center' },
  loadingPoint: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff8d7' },
  loadingText: { color: '#807550', fontSize: 9, letterSpacing: 1.8 },
  railWrap: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 18, paddingBottom: 10, backgroundColor: '#050609', position: 'relative' },
  railLine: { position: 'absolute', left: 44, right: 44, top: 33, height: 1, backgroundColor: '#25262a' },
  railNodeWrap: { flex: 1, alignItems: 'center', gap: 7 },
  railNode: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#35363a', backgroundColor: '#08090d', alignItems: 'center', justifyContent: 'center' },
  railNodeDone: { borderColor: '#776838', backgroundColor: '#171308' },
  railNodeActive: { borderColor: '#ddc97a', backgroundColor: '#2b2512', shadowColor: '#f0dc8b', shadowOpacity: 0.5, shadowRadius: 10 },
  railNodeLocked: { opacity: 0.3 },
  railNodeText: { color: '#696b72', fontSize: 9, fontWeight: '700' },
  railNodeTextActive: { color: '#f1dda0' },
  railLabel: { color: '#51535a', fontSize: 6, letterSpacing: 0.8, textAlign: 'center' },
  railLabelActive: { color: '#a99864' },
  cycleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, paddingHorizontal: 24, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#17181b' },
  cycleEyebrow: { color: '#786d49', fontSize: 8, letterSpacing: 1.5 },
  cycleCurrent: { color: '#e8dfc2', fontSize: 14, letterSpacing: 2.1, marginTop: 5 },
  cycleAccount: { alignItems: 'flex-end' },
  cycleAccountText: { color: '#777970', fontSize: 8, letterSpacing: 1.1 },
  signOut: { color: '#685e42', fontSize: 7, letterSpacing: 1, marginTop: 5 },
  nextBanner: { marginHorizontal: 24, marginTop: 12, borderWidth: 1, borderColor: '#655a32', backgroundColor: '#121007', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextEyebrow: { color: '#81754f', fontSize: 7, letterSpacing: 1.2 },
  nextTitle: { color: '#dfcf91', fontSize: 10, letterSpacing: 1.1, marginTop: 4, fontWeight: '700' },
  nextArrow: { color: '#e3d291', fontSize: 22 },
  fragmentScreen: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', alignItems: 'center', paddingHorizontal: 28, paddingTop: 54, paddingBottom: 90 },
  crownCircle: { width: 230, height: 230, borderRadius: 115, borderWidth: 1, borderColor: '#34353a', alignItems: 'center', justifyContent: 'center', backgroundColor: '#07080b' },
  crownCircleLit: { borderColor: '#7f6e39', backgroundColor: '#0f0d07', shadowColor: '#ecd681', shadowOpacity: 0.3, shadowRadius: 34 },
  crownInner: { width: 124, height: 124, borderRadius: 62, borderWidth: 1, borderColor: '#47412b', alignItems: 'center', justifyContent: 'center' },
  crownPoint: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#5f5c50' },
  crownPointLit: { backgroundColor: '#fff4bd', shadowColor: '#fff0a5', shadowOpacity: 0.9, shadowRadius: 18 },
  fragmentBars: { position: 'absolute', bottom: 34, flexDirection: 'row', gap: 7 },
  fragmentBar: { width: 24, height: 3, borderRadius: 2, backgroundColor: '#292a2f' },
  fragmentBarLit: { backgroundColor: '#d6c173' },
  fragmentEyebrow: { color: '#8f8051', fontSize: 9, letterSpacing: 2, marginTop: 30 },
  fragmentTitle: { color: '#fff3b6', fontSize: 29, fontWeight: '300', letterSpacing: 1.8, textAlign: 'center', marginTop: 9 },
  fragmentBody: { color: '#aaa693', fontSize: 14, lineHeight: 22, textAlign: 'center', maxWidth: 560, marginTop: 13 },
  fragmentStats: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 28 },
  stat: { flexGrow: 1, minWidth: 130, borderWidth: 1, borderColor: '#292a2f', borderRadius: 15, padding: 14, backgroundColor: '#090a0d' },
  statLabel: { color: '#65676e', fontSize: 7, letterSpacing: 1.2 },
  statValue: { color: '#ddd3b1', fontSize: 13, marginTop: 5 },
  jelielGate: { width: '100%', marginTop: 28, borderTopWidth: 1, borderTopColor: '#24252a', paddingTop: 22, alignItems: 'center' },
  jelielEyebrow: { color: '#5f6168', fontSize: 8, letterSpacing: 1.5 },
  jelielTitle: { color: '#a7a18d', fontSize: 15, letterSpacing: 1.4, marginTop: 7 },
  jelielBody: { color: '#65676f', fontSize: 12, lineHeight: 19, textAlign: 'center', maxWidth: 520, marginTop: 9 },
});
