import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ResearchArtifactLibraryLab from "./ResearchArtifactLibraryLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Evidence Snapshot Catalog & Artifact Library",
  description: "Biblioteca privada append-only de Claim Dossiers e Evidence Synthesis snapshots, endereçada por digest e revisão.",
  robots: { index: false, follow: false },
};

export default function ResearchArtifactLibraryPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE ARTIFACT LIBRARY</p>
          <h1>Evidence Snapshot Catalog & Artifact Library</h1>
          <p>
            Catalogue snapshots validados por digest, key e revisão sem apagar versões anteriores.
            A biblioteca resolve os inputs corretos para re-evaluation, mas não infere relevância,
            verdade ou cânone.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>APPEND-ONLY HISTORY</span>
        <span>SHA-256 CONTENT IDENTITY</span>
        <span>EXACT DOSSIER DIGEST</span>
        <span>LATEST SYNTHESIS BY LIBRARY REVISION</span>
        <span>NO RELEVANCE INFERENCE</span>
        <span>NO AUTO CANON</span>
      </div>

      <ResearchArtifactLibraryLab />
    </main>
  );
}
