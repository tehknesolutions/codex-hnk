import { Day013GoldenV1Web } from './Day013GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day013Page() {
  return (
    <DayLivingBook
      day="013"
      sphere="KETHER"
      title="Day 013"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-012"
      nextHref="/day-014"
    >
      <Day013GoldenV1Web />
    </DayLivingBook>
  );
}
