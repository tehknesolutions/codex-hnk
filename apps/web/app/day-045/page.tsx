import { Day045AudioReadiness } from './Day045AudioReadiness';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day045Page() {
  return (
    <DayLivingBook
      day="045"
      sphere="KETHER"
      title="Day 045"
      subtitle="Audio Readiness do HNK Codex."
      previousHref="/day-044"
      nextHref="/day-046"
    >
      <Day045AudioReadiness />
    </DayLivingBook>
  );
}
