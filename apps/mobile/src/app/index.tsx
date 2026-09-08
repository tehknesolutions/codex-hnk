import { AtriumGate } from '../features/auth/AtriumGate';
import { Day001LiveVerticalSlice } from '../features/kether/Day001LiveVerticalSlice';

export default function HomeScreen() {
  return (
    <AtriumGate>
      <Day001LiveVerticalSlice />
    </AtriumGate>
  );
}
