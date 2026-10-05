import { Day051GoldenV2Web } from './Day051GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day051Page() {
  return (
    <DayLivingBook
      day="051"
      sphere="KETHER"
      title="Day 051"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-050"
      nextHref="/day-052"
    >
      <Day051GoldenV2Web />
    </DayLivingBook>
  );
}
