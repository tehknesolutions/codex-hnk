import { Day034GoldenV2Web } from './Day034GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day034Page() {
  return (
    <DayLivingBook
      day="034"
      sphere="KETHER"
      title="Day 034"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-033"
      nextHref="/day-035"
    >
      <Day034GoldenV2Web />
    </DayLivingBook>
  );
}
