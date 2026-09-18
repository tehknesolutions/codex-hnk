import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ClaimReevaluationQueueLab from "./ClaimReevaluationQueueLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Claim Re-evaluation Queue",
  description: "Fila privada para detectar quando novas versões de Evidence Synthesis tornam uma claim revisada candidata a nova revisão humana.",
  robots: { index: false, follow: false },
};

export default function ClaimReevaluationQueuePage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE RE-EVALUATION</p>
          <h1>Claim Re-evaluation Queue</h1>
          <p>
            Compare a síntese usada pela versão ativa de uma claim com um novo snapshot da mesma synthesis key.
            A máquina pode detectar mudança e abrir REVIEW_DUE; ela não pode alterar a classificação da claim.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>SAME SYNTHESIS KEY</span>
        <span>SNAPSHOT CHANGE DETECTION</span>
        <span>LINKED GROUP DIFF</span>
        <span>NEW GROUPS UNCLASSIFIED</span>
        <span>HUMAN REVIEW REQUIRED</span>
        <span>NO MACHINE RECLASSIFICATION</span>
        <span>NOT CANON</span>
      </div>

      <ClaimReevaluationQueueLab />
    </main>
  );
}
