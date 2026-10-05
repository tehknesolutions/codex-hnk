import { Day072GoldenV2Web } from './Day072GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day072Page() {
  return (
    <DayLivingBook
      day="072"
      sphere="KETHER"
      title="Day 072"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-071"
      nextHref="/day-073"
    >
      <Day072GoldenV2Web />
    </DayLivingBook>
  );
}
