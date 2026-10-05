import { Day004GoldenV1Web } from './Day004GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day004Page() {
  return (
    <DayLivingBook
      day="004"
      sphere="KETHER"
      title="Day 004"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-003"
      nextHref="/day-005"
    >
      <Day004GoldenV1Web />
    </DayLivingBook>
  );
}
