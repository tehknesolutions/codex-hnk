import { Day044GoldenV2Web } from './Day044GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day044Page() {
  return (
    <DayLivingBook
      day="044"
      sphere="KETHER"
      title="Day 044"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-043"
      nextHref="/day-045"
    >
      <Day044GoldenV2Web />
    </DayLivingBook>
  );
}
