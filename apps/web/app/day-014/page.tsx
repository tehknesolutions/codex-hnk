import { Day014GoldenV1Web } from './Day014GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day014Page() {
  return (
    <DayLivingBook
      day="014"
      sphere="KETHER"
      title="Day 014"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-013"
      nextHref="/day-015"
    >
      <Day014GoldenV1Web />
    </DayLivingBook>
  );
}
