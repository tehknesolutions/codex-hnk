import { Day011GoldenV1Web } from './Day011GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day011Page() {
  return (
    <DayLivingBook
      day="011"
      sphere="KETHER"
      title="Day 011"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-010"
      nextHref="/day-012"
    >
      <Day011GoldenV1Web />
    </DayLivingBook>
  );
}
