import type { Metadata } from 'next';
import { Day002GoldenV1Web } from './Day002GoldenV1Web';
import { WebAtriumBoundary, WebHnkRuntimeProvider } from '../_runtime/WebHnkRuntime';

export const metadata: Metadata = {
  title: 'Dia 002 · Kether · HNK Codex',
  description: 'Asana do Louco — Day 002 executado pelo Quest Engine do HNK Codex.',
};

export default function Day002Page() {
  return (
    <WebHnkRuntimeProvider redirectPath="/day-002">
      <WebAtriumBoundary>
        <Day002GoldenV1Web />
      </WebAtriumBoundary>
    </WebHnkRuntimeProvider>
  );
}
