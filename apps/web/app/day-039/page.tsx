import { Day039GoldenV1Web } from './Day039GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day039Page() {
  return (
    <DayLivingBook
      day="039"
      sphere="KETHER"
      title="Day 039"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-038"
      nextHref="/day-040"
    >
      <Day039GoldenV1Web />
    </DayLivingBook>
  );
}
