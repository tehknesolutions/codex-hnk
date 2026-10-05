import { Day012GoldenV1Web } from './Day012GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day012Page() {
  return (
    <DayLivingBook
      day="012"
      sphere="KETHER"
      title="Day 012"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-011"
      nextHref="/day-013"
    >
      <Day012GoldenV1Web />
    </DayLivingBook>
  );
}
