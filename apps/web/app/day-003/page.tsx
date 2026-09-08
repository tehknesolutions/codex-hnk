import type { Metadata } from 'next';
import { WebAtriumBoundary, WebHnkRuntimeProvider } from '../_runtime/WebHnkRuntime';
import { Day003GoldenV1Web } from './Day003GoldenV1Web';

export const metadata: Metadata = {
  title: 'Dia 003 · Kether · HNK Codex',
  description: 'Despolarização do Ego — Day 003 executado pelo Quest Engine do HNK Codex.',
};

export default function Day003Page() {
  return (
    <WebHnkRuntimeProvider redirectPath="/day-003">
      <WebAtriumBoundary>
        <Day003GoldenV1Web />
      </WebAtriumBoundary>
    </WebHnkRuntimeProvider>
  );
}
