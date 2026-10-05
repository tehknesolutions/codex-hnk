import type { Metadata } from 'next';
import { WebAtriumBoundary, WebHnkRuntimeProvider } from '../_runtime/WebHnkRuntime';
import { Day003GoldenV1Web } from './Day003GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export const metadata: Metadata = {
  title: 'Dia 003 · Kether · HNK Codex',
  description: 'Despolarização do Ego — Day 003 executado pelo Quest Engine do HNK Codex.',
};

export default function Day003Page() {
  return (
    <WebHnkRuntimeProvider redirectPath="/day-003">
      <WebAtriumBoundary>
        <DayLivingBook
          day="003"
          sphere="KETHER"
          title="Despolarização do Ego"
          subtitle="Day 003 executado pelo Quest Engine do HNK Codex."
          previousHref="/day-002"
          nextHref="/day-004"
        >
          <Day003GoldenV1Web />
        </DayLivingBook>
      </WebAtriumBoundary>
    </WebHnkRuntimeProvider>
  );
}
