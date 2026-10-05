import { Day052GoldenV2Web } from './Day052GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day052Page() {
  return (
    <DayLivingBook
      day="052"
      sphere="KETHER"
      title="Day 052"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-051"
      nextHref="/day-053"
    >
      <Day052GoldenV2Web />
    </DayLivingBook>
  );
}
