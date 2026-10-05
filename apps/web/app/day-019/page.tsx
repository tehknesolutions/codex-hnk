import { Day019GoldenV2Web } from './Day019GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day019Page() {
  return (
    <DayLivingBook
      day="019"
      sphere="KETHER"
      title="Day 019"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-018"
      nextHref="/day-020"
    >
      <Day019GoldenV2Web />
    </DayLivingBook>
  );
}
