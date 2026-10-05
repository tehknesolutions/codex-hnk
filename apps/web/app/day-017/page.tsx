import { Day017GoldenV1Web } from './Day017GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day017Page() {
  return (
    <DayLivingBook
      day="017"
      sphere="KETHER"
      title="Day 017"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-016"
      nextHref="/day-018"
    >
      <Day017GoldenV1Web />
    </DayLivingBook>
  );
}
