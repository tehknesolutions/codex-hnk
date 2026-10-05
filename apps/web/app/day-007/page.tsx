import { Day007GoldenV1Web } from './Day007GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day007Page() {
  return (
    <DayLivingBook
      day="007"
      sphere="KETHER"
      title="Day 007"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-006"
      nextHref="/day-008"
    >
      <Day007GoldenV1Web />
    </DayLivingBook>
  );
}
