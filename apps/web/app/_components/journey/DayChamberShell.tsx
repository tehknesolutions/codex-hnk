import type { ReactNode } from 'react';
import { getJourneyDay, getJourneyNavigation, projectDayChamber, type ChamberEvidenceMap } from '../../../../../packages/journey-contract/src/index';

type Props = { day: string; children: ReactNode; evidence?: ChamberEvidenceMap };

export function DayChamberShell({ day, children, evidence = { MANUSCRITO: { ref: `day-${day}:legacy-body` } } }: Props) {
  const descriptor = getJourneyDay(day);
  if (!descriptor || descriptor.status !== 'AVAILABLE') throw new Error(`Day ${day} is not executable`);
  const chamber = projectDayChamber(descriptor, evidence);
  const navigation = getJourneyNavigation(day);
  return (
    <section className="day-chamber-shell" data-day={day}>
      <nav className="day-chamber-shell__surfaces" aria-label={`Superfícies do Day ${day}`}>
        {chamber.surfaces.map((surface) => <span key={surface.id} data-status={surface.status}>{surface.id} · {surface.status === 'AVAILABLE' ? 'DISPONÍVEL' : 'INDISPONÍVEL'}</span>)}
      </nav>
      <div className="day-chamber-shell__legacy">{children}</div>
      <nav className="day-chamber-shell__navigation" aria-label={`Travessia do Day ${day}`}>
        {navigation.previous ? <a href={navigation.previous.href}>← DAY {navigation.previous.dayId}</a> : <a href="/?spread=pratica#living-book">← JORNADA</a>}
        <a href="/?spread=pratica#living-book">MAPA DA JORNADA</a>
        {navigation.next ? <a href={navigation.next.href}>DAY {navigation.next.dayId} →</a> : null}
      </nav>
    </section>
  );
}
