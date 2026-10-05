import { Day031GoldenV1Web } from './Day031GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day031Page() {
  return (
    <DayLivingBook
      day="031"
      sphere="KETHER"
      title="Day 031"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-030"
      nextHref="/day-032"
    >
      <Day031GoldenV1Web />
    </DayLivingBook>
  );
}
