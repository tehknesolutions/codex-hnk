import { Day058GoldenV2Web } from './Day058GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day058Page() {
  return (
    <DayLivingBook
      day="058"
      sphere="KETHER"
      title="Day 058"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-057"
      nextHref="/day-059"
    >
      <Day058GoldenV2Web />
    </DayLivingBook>
  );
}
