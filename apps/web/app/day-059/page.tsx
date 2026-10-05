import { Day059GoldenV2Web } from './Day059GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day059Page() {
  return (
    <DayLivingBook
      day="059"
      sphere="KETHER"
      title="Day 059"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-058"
      nextHref="/day-060"
    >
      <Day059GoldenV2Web />
    </DayLivingBook>
  );
}
