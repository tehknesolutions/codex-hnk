import { Day069GoldenV2Web } from './Day069GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day069Page() {
  return (
    <DayLivingBook
      day="069"
      sphere="KETHER"
      title="Day 069"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-068"
      nextHref="/day-070"
    >
      <Day069GoldenV2Web />
    </DayLivingBook>
  );
}
