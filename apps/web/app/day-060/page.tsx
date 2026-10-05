import { Day060GoldenV2Web } from './Day060GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day060Page() {
  return (
    <DayLivingBook
      day="060"
      sphere="KETHER"
      title="Day 060"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-059"
      nextHref="/day-061"
    >
      <Day060GoldenV2Web />
    </DayLivingBook>
  );
}
