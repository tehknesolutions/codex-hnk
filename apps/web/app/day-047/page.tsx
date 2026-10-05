import { Day047GoldenV2Web } from './Day047GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day047Page() {
  return (
    <DayLivingBook
      day="047"
      sphere="KETHER"
      title="Day 047"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-046"
      nextHref="/day-048"
    >
      <Day047GoldenV2Web />
    </DayLivingBook>
  );
}
