import { Day006GoldenV1Web } from './Day006GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day006Page() {
  return (
    <DayLivingBook
      day="006"
      sphere="KETHER"
      title="Day 006"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-005"
      nextHref="/day-007"
    >
      <Day006GoldenV1Web />
    </DayLivingBook>
  );
}
