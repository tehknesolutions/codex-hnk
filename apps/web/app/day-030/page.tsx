import { Day030GoldenV1Web } from './Day030GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day030Page() {
  return (
    <DayLivingBook
      day="030"
      sphere="KETHER"
      title="Day 030"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-029"
      nextHref="/day-031"
    >
      <Day030GoldenV1Web />
    </DayLivingBook>
  );
}
