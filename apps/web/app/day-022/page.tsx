import { Day022GoldenV1Web } from './Day022GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day022Page() {
  return (
    <DayLivingBook
      day="022"
      sphere="KETHER"
      title="Day 022"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-021"
      nextHref="/day-023"
    >
      <Day022GoldenV1Web />
    </DayLivingBook>
  );
}
