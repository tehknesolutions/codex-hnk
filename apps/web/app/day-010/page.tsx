import { Day010GoldenV1Web } from './Day010GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day010Page() {
  return (
    <DayLivingBook
      day="010"
      sphere="KETHER"
      title="Day 010"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-009"
      nextHref="/day-011"
    >
      <Day010GoldenV1Web />
    </DayLivingBook>
  );
}
