import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ReviewedClaimRegistryLab from "./ReviewedClaimRegistryLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Reviewed Claim Registry",
  description: "Registro privado pesquisável e versionado de claims que já passaram por Evidence Review Gate humano.",
  robots: { index: false, follow: false },
};

export default function ReviewedClaimRegistryPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE REVIEWED CLAIMS</p>
          <h1>Reviewed Claim Registry</h1>
          <p>
            Indexe claims já revisadas por humano, preserve versões anteriores e use supersession explícita
            quando a mesma claim evoluir. O registry continua totalmente separado do HNK_CANON.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>REVIEWED GATE REQUIRED</span>
        <span>VERSIONED CLAIM HISTORY</span>
        <span>EXPLICIT SUPERSESSION</span>
        <span>SEARCHABLE</span>
        <span>NOT CANON</span>
        <span>NO AUTO TRUTH / CAUSALITY / METAPHYSICAL PROOF</span>
      </div>

      <ReviewedClaimRegistryLab />
    </main>
  );
}
