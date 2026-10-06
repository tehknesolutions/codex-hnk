import { getJourneySlots } from '../../../../../packages/journey-contract/src/index';

export function JourneyGrid() {
  const slots = getJourneySlots();
  return (
    <section className="journey-grid" aria-label="Jornada HNK · horizonte 001 a 109">
      <header><p className="living-book__lead">109 câmaras estruturais. Somente Days confirmados pelo Registry possuem rota executável.</p></header>
      <div className="journey-grid__slots">
        {slots.map((slot) => slot.status === 'AVAILABLE' ? (
          <a key={slot.dayId} href={slot.href} className="journey-grid__slot" data-status="AVAILABLE">
            <b>DAY {slot.dayId}</b><span>DISPONÍVEL</span>
          </a>
        ) : (
          <span key={slot.dayId} className="journey-grid__slot" data-status="DORMANT" aria-disabled="true">
            <b>DAY {slot.dayId}</b><span>DORMENTE</span>
          </span>
        ))}
      </div>
    </section>
  );
}
