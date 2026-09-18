import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import ResearchWorkspaceSnapshotLab from "./ResearchWorkspaceSnapshotLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Research Workspace Snapshot",
  description: "Checkpoint privado do estado de pesquisa com root digest, comparação e restauração exata dos componentes.",
  robots: { index: false, follow: false },
};

export default function ResearchWorkspaceSnapshotPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE RESEARCH CHECKPOINT</p>
          <h1>Research Workspace Snapshot</h1>
          <p>
            Congele Artifact Library, Reviewed Claim Registry e Claim Re-evaluation Queue sob um único
            root digest. Compare checkpoints, encadeie parent snapshots e restaure os componentes exatos
            sem persistência automática.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>ROOT SHA-256</span>
        <span>COMPONENT DIGEST BINDING</span>
        <span>IMMUTABLE CHECKPOINT</span>
        <span>DIRECT PARENT LINEAGE</span>
        <span>COMPARE</span>
        <span>EXACT RESTORE</span>
        <span>NO AUTO CANON</span>
      </div>

      <ResearchWorkspaceSnapshotLab />
    </main>
  );
}
