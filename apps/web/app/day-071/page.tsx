import { Day071GoldenV2Web } from './Day071GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day071Page() {
  return (
    <DayLivingBook
      day="071"
      sphere="KETHER"
      title="Day 071"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-070"
      nextHref="/day-072"
    >
      <Day071GoldenV2Web />
    </DayLivingBook>
  );
}
