import { Day062GoldenV2Web } from './Day062GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day062Page() {
  return (
    <DayLivingBook
      day="062"
      sphere="KETHER"
      title="Day 062"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-061"
      nextHref="/day-063"
    >
      <Day062GoldenV2Web />
    </DayLivingBook>
  );
}
