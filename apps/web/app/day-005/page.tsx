import { Day005GoldenV1Web } from './Day005GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day005Page() {
  return (
    <DayLivingBook
      day="005"
      sphere="KETHER"
      title="Day 005"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-004"
      nextHref="/day-006"
    >
      <Day005GoldenV1Web />
    </DayLivingBook>
  );
}
