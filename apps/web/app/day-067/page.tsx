import { Day067GoldenV2Web } from './Day067GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day067Page() {
  return (
    <DayLivingBook
      day="067"
      sphere="KETHER"
      title="Day 067"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-066"
      nextHref="/day-068"
    >
      <Day067GoldenV2Web />
    </DayLivingBook>
  );
}
