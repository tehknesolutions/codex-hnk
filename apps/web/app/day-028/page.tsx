import { Day028GoldenV1Web } from './Day028GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day028Page() {
  return (
    <DayLivingBook
      day="028"
      sphere="KETHER"
      title="Day 028"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-027"
      nextHref="/day-029"
    >
      <Day028GoldenV1Web />
    </DayLivingBook>
  );
}
