import { Day064GoldenV2Web } from './Day064GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day064Page() {
  return (
    <DayLivingBook
      day="064"
      sphere="KETHER"
      title="Day 064"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-063"
      nextHref="/day-065"
    >
      <Day064GoldenV2Web />
    </DayLivingBook>
  );
}
