import { Day070GoldenV2Web } from './Day070GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day070Page() {
  return (
    <DayLivingBook
      day="070"
      sphere="KETHER"
      title="Day 070"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-069"
      nextHref="/day-071"
    >
      <Day070GoldenV2Web />
    </DayLivingBook>
  );
}
