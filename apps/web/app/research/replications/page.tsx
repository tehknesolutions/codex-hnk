import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ReplicationRegistryLab from "./ReplicationRegistryLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Replication Registry Lab",
  description: "Bancada privada para agrupar Evidence Ledgers independentes e comparar repetibilidade descritiva.",
  robots: { index: false, follow: false },
};

export default function ReplicationRegistryLabPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE REPLICATION</p>
          <h1>Replication Registry Lab</h1>
          <p>
            Agrupe execuções independentes com a mesma assinatura de métrica e compare a direção
            descritiva CONTROL × EXPERIMENT sem transformar repetição em prova de verdade ou causalidade.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>DISTINCT EXPERIMENT IDs</span>
        <span>EXACT METRIC SIGNATURE</span>
        <span>DESCRIPTIVE DIRECTION ONLY</span>
        <span>INSUFFICIENCY VISIBLE</span>
        <span>NO AUTO PERSISTENCE</span>
        <span>NOT TRUTH / CAUSAL / METAPHYSICAL PROOF</span>
      </div>

      <ReplicationRegistryLab />
    </main>
  );
}
