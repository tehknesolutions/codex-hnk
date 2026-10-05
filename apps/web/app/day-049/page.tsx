import { Day049GoldenV2Web } from './Day049GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day049Page() {
  return (
    <DayLivingBook
      day="049"
      sphere="KETHER"
      title="Day 049"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-048"
      nextHref="/day-050"
    >
      <Day049GoldenV2Web />
    </DayLivingBook>
  );
}
