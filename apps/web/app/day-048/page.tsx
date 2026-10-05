import { Day048GoldenV2Web } from './Day048GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day048Page() {
  return (
    <DayLivingBook
      day="048"
      sphere="KETHER"
      title="Day 048"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-047"
      nextHref="/day-049"
    >
      <Day048GoldenV2Web />
    </DayLivingBook>
  );
}
