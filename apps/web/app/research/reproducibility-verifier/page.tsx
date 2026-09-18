import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ReproducibilityVerifierLab from "./ReproducibilityVerifierLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Reproducibility Verifier",
  description: "Verificação privada de Release Manifest contra estado observado de Git, runtime, contratos e validators.",
  robots: { index: false, follow: false },
};

export default function ReproducibilityVerifierPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE REPRODUCIBILITY VERIFICATION</p>
          <h1>Reproducibility Verifier</h1>
          <p>
            Compare um Research Release Manifest com uma cópia observada do projeto e classifique cada
            vínculo como MATCH, DRIFT, MISSING ou UNVERIFIED.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>MATCH / DRIFT / MISSING / UNVERIFIED</span>
        <span>EXACT SOURCE SHA-256</span>
        <span>GIT COMMIT CHECK</span>
        <span>RUNTIME CHECK</span>
        <span>NO AUTO COMMAND EXECUTION</span>
        <span>NO READINESS INFERENCE</span>
        <span>NO AUTO CANON</span>
      </div>

      <ReproducibilityVerifierLab />
    </main>
  );
}
