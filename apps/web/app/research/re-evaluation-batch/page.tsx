import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ClaimReevaluationBatchScannerLab from "./ClaimReevaluationBatchScannerLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Re-evaluation Batch Scanner",
  description: "Scanner privado em lote para detectar claims ativas com Evidence Synthesis alterado e materializar REVIEW_DUE sem reclassificação automática.",
  robots: { index: false, follow: false },
};

export default function ClaimReevaluationBatchScannerPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE BATCH RE-EVALUATION</p>
          <h1>Re-evaluation Batch Scanner</h1>
          <p>
            Percorra todas as claims ativas de um Reviewed Claim Registry, encontre o dossier original exato,
            cruze cada synthesis key com um candidate snapshot e gere REVIEW_DUE apenas onde o SHA-256 mudou.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>ALL ACTIVE CLAIMS</span>
        <span>EXACT DOSSIER DIGEST</span>
        <span>ONE CANDIDATE PER SYNTHESIS KEY</span>
        <span>INPUT GAPS PRESERVED</span>
        <span>IDEMPOTENT QUEUE MATERIALIZATION</span>
        <span>NO MACHINE RECLASSIFICATION</span>
        <span>HUMAN REVIEW REQUIRED</span>
      </div>

      <ClaimReevaluationBatchScannerLab />
    </main>
  );
}
