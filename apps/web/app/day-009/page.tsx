import { Day009GoldenV1Web } from './Day009GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day009Page() {
  return (
    <DayLivingBook
      day="009"
      sphere="KETHER"
      title="Day 009"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-008"
      nextHref="/day-010"
    >
      <Day009GoldenV1Web />
    </DayLivingBook>
  );
}
