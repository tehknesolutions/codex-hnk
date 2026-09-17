import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import EvidenceLedgerLab from "./EvidenceLedgerLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Evidence Ledger Lab",
  description: "Bancada privada para encadear experimento, attestation, medidas e requisitos explícitos de evidência.",
  robots: { index: false, follow: false },
};

export default function EvidenceLedgerLabPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE EVIDENCE</p>
          <h1>Evidence Ledger Lab</h1>
          <p>
            Una protocolo, attestation e medidas numa cadeia auditável; declare requisitos explícitos para
            cada afirmação e veja quando a cobertura está completa, parcial ou insuficiente sem confundir cobertura com verdade.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>SHA-256 SOURCE BINDINGS</span>
        <span>EXPLICIT REQUIREMENTS</span>
        <span>INSUFFICIENCY VISIBLE</span>
        <span>NO AUTO TRUTH INFERENCE</span>
        <span>NO AUTO PERSISTENCE</span>
        <span>NOT CAUSAL OR METAPHYSICAL PROOF</span>
      </div>

      <EvidenceLedgerLab />
    </main>
  );
}
