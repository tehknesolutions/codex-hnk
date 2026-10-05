import { Day042GoldenV2Web } from './Day042GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day042Page() {
  return (
    <DayLivingBook
      day="042"
      sphere="KETHER"
      title="Day 042"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-041"
      nextHref="/day-043"
    >
      <Day042GoldenV2Web />
    </DayLivingBook>
  );
}
