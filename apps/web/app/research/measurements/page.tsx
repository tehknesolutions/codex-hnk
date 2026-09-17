import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import MeasurementContractLab from "./MeasurementContractLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Measurement Contract Lab",
  description: "Bancada privada para métricas tipadas, matriz de medidas e resumo descritivo ligado a experimentos preregistrados.",
  robots: { index: false, follow: false },
};

export default function MeasurementContractLabPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE MEASUREMENT</p>
          <h1>Measurement Contract Lab</h1>
          <p>
            Converta cada variável observada preregistrada em uma métrica tipada com unidade, método de coleta,
            fonte de evidência, momento da medição e critério definidos antes das sessões.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>PLAN LOCKED BEFORE SESSIONS</span>
        <span>TYPED METRICS</span>
        <span>NO IMPUTATION</span>
        <span>DESCRIPTIVE ONLY</span>
        <span>NO AUTO PERSISTENCE</span>
        <span>NOT CAUSAL OR METAPHYSICAL PROOF</span>
      </div>

      <MeasurementContractLab />
    </main>
  );
}
