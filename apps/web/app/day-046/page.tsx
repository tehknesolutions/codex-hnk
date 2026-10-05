import { Day046GoldenV2Web } from './Day046GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day046Page() {
  return (
    <DayLivingBook
      day="046"
      sphere="KETHER"
      title="Day 046"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-045"
      nextHref="/day-047"
    >
      <Day046GoldenV2Web />
    </DayLivingBook>
  );
}
