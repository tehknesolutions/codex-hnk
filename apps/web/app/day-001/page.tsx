import type { Metadata } from 'next';
import { Day001GoldenV2Web } from './Day001GoldenV2Web';
import { LucidityPanel } from './LucidityPanel';
import { DayChamber } from './DayChamber';
import { Day001VisualContractLayer } from './Day001VisualContractLayer';
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
        <DayChamber day="001" title="A Coroa Antes da Forma" subtitle="Primeira câmara navegável do Kether.">
          <Day001VisualContractLayer />
          <Day001GoldenV2Web />
          <LucidityPanel state="LEGACY_UNCLASSIFIED" />
        </DayChamber>
      </WebAtriumBoundary>
    </WebDay001RuntimeProvider>
  );
}
