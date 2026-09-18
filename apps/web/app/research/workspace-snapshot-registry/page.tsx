import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import WorkspaceSnapshotRegistryLab from "./WorkspaceSnapshotRegistryLab";
import styles from "../runtime/runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Workspace Snapshot Registry",
  description: "Timeline privada de Research Workspace Snapshots com HEAD explícito, forks, ancestry e comparação.",
  robots: { index: false, follow: false },
};

export default function WorkspaceSnapshotRegistryPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE SNAPSHOT TIMELINE</p>
          <h1>Workspace Snapshot Registry</h1>
          <p>
            Catalogue checkpoints por snapshot digest, valide a cadeia parent → child, detecte forks,
            mantenha um HEAD escolhido explicitamente por humano e compare qualquer par registrado.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>SNAPSHOT DIGEST IDENTITY</span>
        <span>PARENT MUST EXIST</span>
        <span>FORKS DETECTED</span>
        <span>EXPLICIT HEAD MOVE</span>
        <span>HEAD EVENT HISTORY</span>
        <span>NO ORPHANS</span>
        <span>NO AUTO CANON</span>
      </div>

      <WorkspaceSnapshotRegistryLab />
    </main>
  );
}
