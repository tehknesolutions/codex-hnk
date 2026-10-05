import { Day015GoldenV1Web } from './Day015GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day015Page() {
  return (
    <DayLivingBook
      day="015"
      sphere="KETHER"
      title="Day 015"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-014"
      nextHref="/day-016"
    >
      <Day015GoldenV1Web />
    </DayLivingBook>
  );
}
