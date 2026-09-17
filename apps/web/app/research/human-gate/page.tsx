import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import HumanGateLab from "./HumanGateLab";
import styles from "./human-gate.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Research Lab — Human Gate",
  description: "Fila privada de revisão humana para candidatos do HNK Codex.",
  robots: { index: false, follow: false },
};

export default function HumanGateResearchPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <p className={styles.eyebrow}>HNK CODEX · RESEARCH LAB</p>
            <h1 className={styles.title}>Human Gate</h1>
          </div>
          <nav className={styles.nav}>
            <Link href="/research/decisions">Decision Layer</Link>
            <Link href="/research/correspondences">Correspondence Lab</Link>
          </nav>
        </div>
        <p className={styles.lead}>
          Revisão explícita dos itens classificados como CANDIDATE. Esta superfície informa, compara e organiza; ela não aprova nada sozinha.
        </p>
        <div className={styles.lockRow}>
          <span>EXPLICIT HUMAN APPROVAL ONLY</span>
          <span>MACHINE AUTOPROMOTION = FALSE</span>
          <span>PRESERVE RESEARCH HISTORY</span>
          <span>PRIVATE</span>
        </div>
      </header>
      <HumanGateLab />
    </main>
  );
}
