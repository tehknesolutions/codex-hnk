import { Day068GoldenV2Web } from './Day068GoldenV2Web';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day068Page() {
  return (
    <DayLivingBook
      day="068"
      sphere="KETHER"
      title="Day 068"
      subtitle="Conteúdo executado pela implementação Golden V2 do HNK Codex."
      previousHref="/day-067"
      nextHref="/day-069"
    >
      <Day068GoldenV2Web />
    </DayLivingBook>
  );
}
