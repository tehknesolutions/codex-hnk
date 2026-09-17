import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CorrespondenceLab from "./CorrespondenceLab";
import styles from "./lab.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Research Lab — Correspondências",
  description: "Laboratório privado de comparação de correspondências do HNK Codex.",
  robots: { index: false, follow: false },
};

export default function CorrespondenceResearchPage() {
  if (process.env.HNK_RESEARCH_LAB_ENABLED !== "true") notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>HNK CODEX · RESEARCH LAB</p>
        <h1 className={styles.title}>Correspondence Lab</h1>
        <p className={styles.lead}>
          Compare tradições sem colapsar divergências. Todo dado desta superfície é
          <strong> referência de pesquisa</strong> e não entra automaticamente no cânone HNK.
        </p>
        <div className={styles.lockRow}>
          <span>REFERENCE_ONLY</span>
          <span>NONE_AUTOMATIC</span>
          <span>PRIVATE GATE</span>
        </div>
      </header>
      <CorrespondenceLab />
    </main>
  );
}
