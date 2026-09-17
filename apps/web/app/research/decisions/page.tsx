import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import DecisionLab from "./DecisionLab";
import styles from "./decision.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Research Lab — Codex Decisions",
  description: "Laboratório privado de decisões de admissão do HNK Codex.",
  robots: { index: false, follow: false },
};

export default function CodexDecisionResearchPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <p className={styles.eyebrow}>HNK CODEX · RESEARCH LAB</p>
            <h1 className={styles.title}>Decision Layer</h1>
          </div>
          <div className={styles.lockRow}>
            <Link className={styles.labLink} href="/research/human-gate">Human Gate →</Link>
            <Link className={styles.labLink} href="/research/correspondences">Correspondence Lab →</Link>
          </div>
        </div>
        <p className={styles.lead}>
          Catálogo executável de entrada, permanência, quarentena e exclusão operacional.
          O registro histórico é preservado mesmo quando um elemento é bloqueado do runtime.
        </p>
        <div className={styles.lockRow}>
          <span>CODEX_ADMISSION_PROTOCOL_V1</span>
          <span>NONE_AUTOMATIC</span>
          <span>HUMAN GATE</span>
          <span>PRIVATE</span>
        </div>
      </header>
      <DecisionLab />
    </main>
  );
}
