import { Redirect } from 'expo-router';
import { AtriumGate } from '../features/auth/AtriumGate';
import { KetherCycle01 } from '../features/kether/KetherCycle01';

const NATIVE_INTEROP_AUTORUN = process.env.EXPO_PUBLIC_HNK_NATIVE_INTEROP_AUTORUN === '1';

export default function HomeScreen() {
  if (NATIVE_INTEROP_AUTORUN) {
    return <Redirect href="/labs/vault-interop" />;
  }

  return (
    <AtriumGate>
      <KetherCycle01 />
    </AtriumGate>
  );
}
