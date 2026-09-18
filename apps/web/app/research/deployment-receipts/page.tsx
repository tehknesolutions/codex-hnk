import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import DeploymentExecutionReceiptLab from "./DeploymentExecutionReceiptLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Deployment Execution Receipt",
  description: "Recibo privado que vincula execução observada a um candidate ainda autorizado e ao commit aprovado.",
  robots: { index: false, follow: false },
};

export default function DeploymentExecutionReceiptPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE DEPLOYMENT ATTESTATION</p>
          <h1>Deployment Execution Receipt</h1>
          <p>
            Registre uma execução observada somente quando o Deployment Candidate continuar aprovado,
            confirme o commit exato e sele provider, deployment ID, resultado e evidência SHA-256.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>DEPLOYMENT_APPROVED ≠ DEPLOYMENT_EXECUTED</span>
        <span>CURRENT AUTHORIZATION REQUIRED</span>
        <span>EXACT COMMIT MATCH</span>
        <span>PROVIDER PAYLOAD SHA-256</span>
        <span>NO AUTO DEPLOY</span>
        <span>NO READINESS INFERENCE</span>
        <span>NO AUTO CANON</span>
      </div>

      <DeploymentExecutionReceiptLab />
    </main>
  );
}
