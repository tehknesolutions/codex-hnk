import { Day032GoldenV1Web } from './Day032GoldenV1Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day032Page() {
  return (
    <DayLivingBook
      day="032"
      sphere="KETHER"
      title="Day 032"
      subtitle="Conteúdo executado pela implementação Golden V1 do HNK Codex."
      previousHref="/day-031"
      nextHref="/day-033"
    >
      <Day032GoldenV1Web />
    </DayLivingBook>
  );
}
