import { Day024GoldenV1Web } from './Day024GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day024Page() {
  return (
    <DayLivingBook
      day="024"
      sphere="KETHER"
      title="Day 024"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-023"
      nextHref="/day-025"
    >
      <Day024GoldenV1Web />
    </DayLivingBook>
  );
}
