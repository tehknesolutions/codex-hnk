import { Day055GoldenV2Web } from './Day055GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day055Page() {
  return (
    <DayLivingBook
      day="055"
      sphere="KETHER"
      title="Day 055"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-054"
      nextHref="/day-056"
    >
      <Day055GoldenV2Web />
    </DayLivingBook>
  );
}
