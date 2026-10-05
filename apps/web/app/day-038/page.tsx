import { Day038GoldenV1Web } from './Day038GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day038Page() {
  return (
    <DayLivingBook
      day="038"
      sphere="KETHER"
      title="Day 038"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-037"
      nextHref="/day-039"
    >
      <Day038GoldenV1Web />
    </DayLivingBook>
  );
}
