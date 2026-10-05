import { Day036PortalReadiness } from './Day036PortalReadiness';
import { DayLivingBook } from '../_components/DayLivingBook';

export default function Day036Page() {
  return (
    <DayLivingBook
      day="036"
      sphere="KETHER"
      title="Day 036"
      subtitle="Portal Readiness do HNK Codex."
      previousHref="/day-035"
      nextHref="/day-037"
    >
      <Day036PortalReadiness />
    </DayLivingBook>
  );
}
