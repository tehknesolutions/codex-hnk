import { Day037GoldenV1Web } from './Day037GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day037Page() {
  return (
    <DayLivingBook
      day="037"
      sphere="KETHER"
      title="Day 037"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-036"
      nextHref="/day-038"
    >
      <Day037GoldenV1Web />
    </DayLivingBook>
  );
}
