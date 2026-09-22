import type { Metadata } from 'next';
import { Day001GoldenV2Web } from './Day001GoldenV2Web';
import { LucidityPanel } from './LucidityPanel';
import { WebAtriumBoundary, WebDay001RuntimeProvider } from './WebDay001Runtime';

// Validation sentinel: intentionally no runtime effect; this path triggers the Day 001 Golden Gate.
export const metadata: Metadata = {
  title: 'Dia 001 · Kether · HNK Codex',
  description: 'A Coroa Antes da Forma — Golden Day 001 do HNK Codex.',
};

export default function Day001Page() {
  return (
    <WebDay001RuntimeProvider>
      <WebAtriumBoundary>
        <Day001GoldenV2Web />
        <LucidityPanel state="LEGACY_UNCLASSIFIED" />
      </WebAtriumBoundary>
    </WebDay001RuntimeProvider>
  );
}
