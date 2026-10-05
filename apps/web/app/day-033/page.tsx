import { Day033GoldenV1Web } from './Day033GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day033Page() {
  return (
    <DayLivingBook
      day="033"
      sphere="KETHER"
      title="Day 033"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-032"
      nextHref="/day-034"
    >
      <Day033GoldenV1Web />
    </DayLivingBook>
  );
}
