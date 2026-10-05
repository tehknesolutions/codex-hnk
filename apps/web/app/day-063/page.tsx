import { Day063GoldenV2Web } from './Day063GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day063Page() {
  return (
    <DayLivingBook
      day="063"
      sphere="KETHER"
      title="Day 063"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-062"
      nextHref="/day-064"
    >
      <Day063GoldenV2Web />
    </DayLivingBook>
  );
}
