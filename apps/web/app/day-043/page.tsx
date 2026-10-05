import { Day043GoldenV2Web } from './Day043GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day043Page() {
  return (
    <DayLivingBook
      day="043"
      sphere="KETHER"
      title="Day 043"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-042"
      nextHref="/day-044"
    >
      <Day043GoldenV2Web />
    </DayLivingBook>
  );
}
