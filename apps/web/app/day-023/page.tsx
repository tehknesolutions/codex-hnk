import { Day023GoldenV1Web } from './Day023GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day023Page() {
  return (
    <DayLivingBook
      day="023"
      sphere="KETHER"
      title="Day 023"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-022"
      nextHref="/day-024"
    >
      <Day023GoldenV1Web />
    </DayLivingBook>
  );
}
