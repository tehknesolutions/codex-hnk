import { Day026GoldenV1Web } from './Day026GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day026Page() {
  return (
    <DayLivingBook
      day="026"
      sphere="KETHER"
      title="Day 026"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-025"
      nextHref="/day-027"
    >
      <Day026GoldenV1Web />
    </DayLivingBook>
  );
}
