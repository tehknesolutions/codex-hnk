import { Day016GoldenV1Web } from './Day016GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day016Page() {
  return (
    <DayLivingBook
      day="016"
      sphere="KETHER"
      title="Day 016"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-015"
      nextHref="/day-017"
    >
      <Day016GoldenV1Web />
    </DayLivingBook>
  );
}
