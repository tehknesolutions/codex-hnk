import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import EvidenceSynthesisLab from "./EvidenceSynthesisLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Evidence Synthesis Lab",
  description: "Bancada privada para sintetizar múltiplos Replication Registries por assinatura de métrica e pergunta.",
  robots: { index: false, follow: false },
};

export default function EvidenceSynthesisLabPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE SYNTHESIS</p>
          <h1>Evidence Synthesis Lab</h1>
          <p>
            Agrupe Replication Registries, preserve métricas incompatíveis em grupos separados e visualize
            convergência, divergência, sinais únicos, estados mistos e insuficiência sem criar uma conclusão causal automática.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>GROUP BY EXACT METRIC SIGNATURE</span>
        <span>MIXED PRESERVED</span>
        <span>INSUFFICIENT PRESERVED</span>
        <span>NO P-VALUES</span>
        <span>NO AUTO PERSISTENCE</span>
        <span>NOT TRUTH / CAUSAL / METAPHYSICAL PROOF</span>
      </div>

      <EvidenceSynthesisLab />
    </main>
  );
}
