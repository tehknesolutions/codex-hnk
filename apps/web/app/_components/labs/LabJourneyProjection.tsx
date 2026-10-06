import Link from "next/link";
import { getLabRegistry } from "@hnk/lab-contract";

export function LabJourneyProjection() {
  const labs = getLabRegistry();
  const available = labs.filter((lab) => lab.status === "AVAILABLE");

  return <section aria-labelledby="lab-journey-title">
    <header>
      <p>OPERATIO · M8</p>
      <h3 id="lab-journey-title">Labs executáveis</h3>
      <p>{available.length} protocolos disponíveis · {labs.length - available.length} slots dormentes</p>
    </header>
    <div className="living-book__routes">
      {labs.map((lab) => lab.status === "AVAILABLE"
        ? <Link key={lab.dayId} href={lab.href} aria-label={`Abrir Lab Day ${lab.dayId}`}>
            <b>LAB · DAY {lab.dayId}</b><span>prática disponível</span>
          </Link>
        : <span key={lab.dayId} aria-disabled="true" data-lab-status="DORMANT">
            <b>LAB · DAY {lab.dayId}</b><span>DORMANT</span>
          </span>)}
    </div>
    <p className="living-book__note">A interface projeta o Lab Registry. Slots dormentes não recebem link nem autoridade de execução.</p>
  </section>;
}
