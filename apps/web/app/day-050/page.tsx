import { Day050GoldenV2Web } from './Day050GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day050Page() {
  return (
    <DayLivingBook
      day="050"
      sphere="KETHER"
      title="Day 050"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-049"
      nextHref="/day-051"
    >
      <Day050GoldenV2Web />
    </DayLivingBook>
  );
}
