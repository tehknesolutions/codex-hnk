import { Day066GoldenV2Web } from './Day066GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day066Page() {
  return (
    <DayLivingBook
      day="066"
      sphere="KETHER"
      title="Day 066"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-065"
      nextHref="/day-067"
    >
      <Day066GoldenV2Web />
    </DayLivingBook>
  );
}
