import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import DeploymentGateLab from "./DeploymentGateLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Deployment Candidate & Human Deployment Gate",
  description: "Governança privada que separa RELEASE_ACCEPTED de APPROVED_FOR_DEPLOYMENT.",
  robots: { index: false, follow: false },
};

export default function DeploymentGatePage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE DEPLOYMENT GOVERNANCE</p>
          <h1>Deployment Candidate & Human Deployment Gate</h1>
          <p>
            Uma release aceita pode ser nomeada como candidata a um ambiente, mas só recebe autorização
            de deployment por uma segunda decisão humana explícita sobre o estado ainda atual da release.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>RELEASE_ACCEPTED ≠ DEPLOYMENT_APPROVED</span>
        <span>HUMAN NOMINATION</span>
        <span>CURRENT RELEASE BINDING</span>
        <span>STALE CANDIDATE BLOCKED</span>
        <span>HUMAN DEPLOYMENT GATE</span>
        <span>NO AUTO DEPLOY</span>
        <span>NO AUTO CANON</span>
      </div>

      <DeploymentGateLab />
    </main>
  );
}
