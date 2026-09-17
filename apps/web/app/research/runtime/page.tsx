import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../../lib/research/auth";
import SymbolicRuntimeLab from "./SymbolicRuntimeLab";
import styles from "./runtime.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Symbolic Runtime Lab",
  description: "Bancada privada e efêmera para executar, exportar, reproduzir e comparar sessões do HNK Symbolic Runtime Contract V1.",
  robots: { index: false, follow: false },
};

export default function SymbolicRuntimeLabPage() {
  if (!researchLabEnabled()) notFound();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>HNK CODEX · PRIVATE RUNTIME</p>
          <h1>Symbolic Runtime Lab</h1>
          <p>
            Execute uma sessão simbólica HNK como máquina de estados auditável: intenção, caminho,
            construção, contexto, observação, feedback e resultado. Exporte artifacts JSON validados,
            reproduza o histórico deterministicamente e compare sessões sem persistência automática.
          </p>
        </div>
        <Link href="/research" className={styles.backLink}>← Research Lab</Link>
      </header>

      <div className={styles.locks}>
        <span>PRIVATE</span>
        <span>EPHEMERAL</span>
        <span>USER-CONTROLLED ARTIFACTS</span>
        <span>NO SERVER PERSISTENCE</span>
        <span>CANON BACKED</span>
        <span>NOT METAPHYSICAL PROOF</span>
      </div>

      <SymbolicRuntimeLab />
    </main>
  );
}
