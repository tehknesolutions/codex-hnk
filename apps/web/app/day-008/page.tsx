import { Day008GoldenV1Web } from './Day008GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day008Page() {
  return (
    <DayLivingBook
      day="008"
      sphere="KETHER"
      title="Day 008"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-007"
      nextHref="/day-009"
    >
      <Day008GoldenV1Web />
    </DayLivingBook>
  );
}
