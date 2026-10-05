import { Day061GoldenV2Web } from './Day061GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day061Page() {
  return (
    <DayLivingBook
      day="061"
      sphere="KETHER"
      title="Day 061"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-060"
      nextHref="/day-062"
    >
      <Day061GoldenV2Web />
    </DayLivingBook>
  );
}
