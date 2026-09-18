import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ResearchReleaseManifestLab from "./ResearchReleaseManifestLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Research Release Manifest",
  description: "Reproducibility Pack privado que vincula Workspace Registry HEAD, Git commit, contratos, validators e comandos de reprodução.",
  robots: { index: false, follow: false },
};

export default function ResearchReleaseManifestPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE REPRODUCIBILITY PACK</p>
          <h1>Research Release Manifest</h1>
          <p>
            Sele um HEAD explícito do Snapshot Registry junto do commit Git, fontes exatas dos contratos,
            fontes e estados dos validators e comandos necessários para reproduzir a execução.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>EXPLICIT REGISTRY HEAD</span>
        <span>GIT COMMIT BINDING</span>
        <span>EXACT SOURCE SHA-256</span>
        <span>VALIDATION STATE PRESERVED</span>
        <span>BLOCKED ≠ PASS</span>
        <span>NO READINESS INFERENCE</span>
        <span>NO AUTO CANON</span>
      </div>

      <ResearchReleaseManifestLab />
    </main>
  );
}
