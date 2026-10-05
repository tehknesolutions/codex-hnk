import { Day041GoldenV2Web } from './Day041GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day041Page() {
  return (
    <DayLivingBook
      day="041"
      sphere="KETHER"
      title="Day 041"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-040"
      nextHref="/day-042"
    >
      <Day041GoldenV2Web />
    </DayLivingBook>
  );
}
