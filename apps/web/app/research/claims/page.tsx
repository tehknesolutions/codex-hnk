import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ClaimDossierLab from "./ClaimDossierLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Claim Dossier & Evidence Review Gate",
  description: "Bancada privada para vincular claims a Evidence Synthesis e registrar revisão humana explícita.",
  robots: { index: false, follow: false },
};

export default function ClaimDossierLabPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE CLAIM REVIEW</p>
          <h1>Claim Dossier & Evidence Review Gate</h1>
          <p>
            Vincule uma afirmação aos grupos exatos de Evidence Synthesis, registre lacunas e conflitos,
            e só depois abra uma revisão humana explícita. Convergência não vira verdade nem cânone automaticamente.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>HUMAN RELEVANCE CLASSIFICATION</span>
        <span>GAPS + CONFLICTS PRESERVED</span>
        <span>EXPLICIT HUMAN REVIEW SIGNAL</span>
        <span>MACHINE CANNOT DECIDE</span>
        <span>NO AUTO CANON PROMOTION</span>
        <span>NOT TRUTH / CAUSAL / METAPHYSICAL PROOF</span>
      </div>

      <ClaimDossierLab />
    </main>
  );
}
