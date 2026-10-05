import { Day035GoldenV1Web } from './Day035GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day035Page() {
  return (
    <DayLivingBook
      day="035"
      sphere="KETHER"
      title="Day 035"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-034"
      nextHref="/day-036"
    >
      <Day035GoldenV1Web />
    </DayLivingBook>
  );
}
