import { Day027GoldenV1Web } from './Day027GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day027Page() {
  return (
    <DayLivingBook
      day="027"
      sphere="KETHER"
      title="Day 027"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-026"
      nextHref="/day-028"
    >
      <Day027GoldenV1Web />
    </DayLivingBook>
  );
}
