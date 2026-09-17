import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ExperimentProtocolLab from "./ExperimentProtocolLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Experiment Protocol Lab",
  description: "Bancada privada para experimentos HNK preregistrados com controle, artifacts e relatório separado de interpretação.",
  robots: { index: false, follow: false },
};

export default function ExperimentProtocolLabPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE EXPERIMENTS</p>
          <h1>Experiment Protocol Lab</h1>
          <p>
            Preregistre pergunta, hipótese, variáveis e critérios antes da execução; depois organize artifacts
            de controle e condição experimental sem converter diferenças em causalidade automática.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>PREREGISTRATION LOCKED</span>
        <span>CONTROL REQUIRED</span>
        <span>DETERMINISTIC ARTIFACT REPLAY</span>
        <span>NO AUTO PERSISTENCE</span>
        <span>NOT CAUSAL OR METAPHYSICAL PROOF</span>
      </div>

      <ExperimentProtocolLab />
    </main>
  );
}
