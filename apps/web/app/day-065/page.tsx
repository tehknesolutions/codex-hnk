import { Day065GoldenV2Web } from './Day065GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day065Page() {
  return (
    <DayLivingBook
      day="065"
      sphere="KETHER"
      title="Day 065"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-064"
      nextHref="/day-066"
    >
      <Day065GoldenV2Web />
    </DayLivingBook>
  );
}
