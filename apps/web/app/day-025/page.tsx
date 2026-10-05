import { Day025GoldenV1Web } from './Day025GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day025Page() {
  return (
    <DayLivingBook
      day="025"
      sphere="KETHER"
      title="Day 025"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-024"
      nextHref="/day-026"
    >
      <Day025GoldenV1Web />
    </DayLivingBook>
  );
}
