import type { Metadata } from 'next';
import { Day002GoldenV1Web } from './Day002GoldenV1Web';
import { WebAtriumBoundary, WebHnkRuntimeProvider } from '../_runtime/WebHnkRuntime';
import { DayLivingBook } from '../_components/DayLivingBook';

export const metadata: Metadata = {
  title: 'Dia 002 · Kether · HNK Codex',
  description: 'Asana do Louco — Day 002 executado pelo Quest Engine do HNK Codex.',
};

export default function Day002Page() {
  return (
    <WebHnkRuntimeProvider redirectPath="/day-002">
      <WebAtriumBoundary>
        <DayLivingBook day="002" sphere="KETHER" title="Asana do Louco" subtitle="Day 002 executado pelo Quest Engine do HNK Codex." previousHref="/day-001" nextHref="/day-003">
          <Day002GoldenV1Web />
        </DayLivingBook>
      </WebAtriumBoundary>
    </WebHnkRuntimeProvider>
  );
}
