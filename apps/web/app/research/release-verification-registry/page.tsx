import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ReleaseVerificationRegistryLab from "./ReleaseVerificationRegistryLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Release Verification Registry & Human Gate",
  description: "Registro privado append-only de Verification Reports e decisões humanas explícitas de release.",
  robots: { index: false, follow: false },
};

export default function ReleaseVerificationRegistryPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE HUMAN RELEASE GATE</p>
          <h1>Release Verification Registry & Human Gate</h1>
          <p>
            Preserve Verification Reports por digest e exija uma decisão humana explícita sobre um relatório
            específico antes de considerar uma release aceita. MATCH nunca aceita automaticamente.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>APPEND-ONLY REPORTS</span>
        <span>APPEND-ONLY HUMAN DECISIONS</span>
        <span>MATCH ≠ AUTO ACCEPT</span>
        <span>LATEST REPORT REOPENS GATE</span>
        <span>NON-MATCH ACCEPT = EXPLICIT OVERRIDE</span>
        <span>MACHINE CANNOT ACCEPT</span>
        <span>NO AUTO CANON</span>
      </div>

      <ReleaseVerificationRegistryLab />
    </main>
  );
}
