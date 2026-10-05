import { Day057GoldenV2Web } from './Day057GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day057Page() {
  return (
    <DayLivingBook
      day="057"
      sphere="KETHER"
      title="Day 057"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-056"
      nextHref="/day-058"
    >
      <Day057GoldenV2Web />
    </DayLivingBook>
  );
}
