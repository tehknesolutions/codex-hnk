import { Day056GoldenV2Web } from './Day056GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day056Page() {
  return (
    <DayLivingBook
      day="056"
      sphere="KETHER"
      title="Day 056"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-055"
      nextHref="/day-057"
    >
      <Day056GoldenV2Web />
    </DayLivingBook>
  );
}
