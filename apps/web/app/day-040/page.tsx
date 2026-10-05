import { Day040GoldenV2Web } from './Day040GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day040Page() {
  return (
    <DayLivingBook
      day="040"
      sphere="KETHER"
      title="Day 040"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-039"
      nextHref="/day-041"
    >
      <Day040GoldenV2Web />
    </DayLivingBook>
  );
}
