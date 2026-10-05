import { Day053GoldenV2Web } from './Day053GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day053Page() {
  return (
    <DayLivingBook
      day="053"
      sphere="KETHER"
      title="Day 053"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-052"
      nextHref="/day-054"
    >
      <Day053GoldenV2Web />
    </DayLivingBook>
  );
}
