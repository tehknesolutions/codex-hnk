import { Day018GoldenV1Web } from './Day018GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day018Page() {
  return (
    <DayLivingBook
      day="018"
      sphere="KETHER"
      title="Day 018"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-017"
      nextHref="/day-019"
    >
      <Day018GoldenV1Web />
    </DayLivingBook>
  );
}
