import { Day020GoldenV1Web } from './Day020GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day020Page() {
  return (
    <DayLivingBook
      day="020"
      sphere="KETHER"
      title="Day 020"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-019"
      nextHref="/day-021"
    >
      <Day020GoldenV1Web />
    </DayLivingBook>
  );
}
