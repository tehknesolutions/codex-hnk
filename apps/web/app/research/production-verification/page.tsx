import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ProductionVerificationLab from "./ProductionVerificationLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Post-Deployment Verification & Human Production Gate",
  description: "Registro privado de receipts, checks pós-deploy e decisões humanas explícitas de produção.",
  robots: { index: false, follow: false },
};

export default function ProductionVerificationPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE PRODUCTION GOVERNANCE</p>
          <h1>Post-Deployment Verification & Human Production Gate</h1>
          <p>
            Preserve receipts de execução, registre checks observados após o deploy e só derive
            PRODUCTION_ACCEPTED por decisão humana explícita sobre o receipt e verification mais recentes.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>DEPLOYMENT_EXECUTED ≠ PRODUCTION_ACCEPTED</span>
        <span>LATEST RECEIPT</span>
        <span>POST-DEPLOY CHECKS</span>
        <span>PASS ≠ AUTO ACCEPT</span>
        <span>HUMAN PRODUCTION GATE</span>
        <span>NO NETWORK EXECUTION</span>
        <span>NO AUTO CANON</span>
      </div>

      <ProductionVerificationLab />
    </main>
  );
}
