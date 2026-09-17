import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import CanonRegistryLab from "./CanonRegistryLab";
import styles from "./canon.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Canon Registry",
  description: "Registro privado e somente leitura das abstrações HNK promovidas por Human Gate.",
  robots: { index: false, follow: false },
};

export default function CanonRegistryPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div className={styles.navRow}>
          <Link href="/research">← Research Lab</Link>
          <Link href="/research/human-gate">Human Gate →</Link>
        </div>
        <p className={styles.eyebrow}>HNK CODEX · CANON GOVERNANCE</p>
        <h1>Canon Registry</h1>
        <p>
          Visão somente leitura do que atravessou o Human Gate. Cada registro canônico mantém o vínculo
          com a decisão humana que o promoveu e não herda autoridade histórica das fontes pesquisadas.
        </p>
        <div className={styles.locks}>
          <span>HNK_AUTHORED</span>
          <span>READ ONLY</span>
          <span>HUMAN GATE REQUIRED</span>
          <span>SOURCE HISTORY PRESERVED</span>
        </div>
      </header>
      <CanonRegistryLab />
    </main>
  );
}
