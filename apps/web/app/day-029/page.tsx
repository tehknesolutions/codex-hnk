import { Day029GoldenV1Web } from './Day029GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day029Page() {
  return (
    <DayLivingBook
      day="029"
      sphere="KETHER"
      title="Day 029"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-028"
      nextHref="/day-030"
    >
      <Day029GoldenV1Web />
    </DayLivingBook>
  );
}
