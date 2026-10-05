import { Day021GoldenV1Web } from './Day021GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day021Page() {
  return (
    <DayLivingBook
      day="021"
      sphere="KETHER"
      title="Day 021"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-020"
      nextHref="/day-022"
    >
      <Day021GoldenV1Web />
    </DayLivingBook>
  );
}
