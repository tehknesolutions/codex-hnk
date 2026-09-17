import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../lib/research/auth";
import { admissionSummary, validateAdmissionDecisionLayer } from "../../lib/research/admission";
import { createResearch001Registry } from "@hnk/correspondence-registry";
import styles from "./research.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Research Lab",
  description: "Laboratório privado de pesquisa, proveniência, correspondências e decisões do HNK Codex.",
  robots: { index: false, follow: false },
};

export default function ResearchLabHome() {
  if (!researchLabEnabled()) notFound();

  const registry = createResearch001Registry();
  const registryValidation = registry.validate();
  const decisionValidation = validateAdmissionDecisionLayer();
  const decisionSummary = admissionSummary();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>HNK CODEX · PRIVATE RESEARCH</p>
        <h1>Research Lab</h1>
        <p>
          Uma superfície para separar fonte, linhagem, conflito, decisão Codex e eventual autoria HNK
          sem apagar divergências nem promover material automaticamente ao cânone.
        </p>
        <div className={styles.locks}>
          <span>PRIVATE</span>
          <span>PROVENANCE FIRST</span>
          <span>NONE_AUTOMATIC</span>
          <span>HUMAN GATE</span>
        </div>
      </header>

      <section className={styles.healthGrid} aria-label="Saúde do laboratório">
        <article>
          <span className={registryValidation.ok ? styles.good : styles.bad} />
          <strong>Correspondence Registry</strong>
          <p>{registry.records.length} registros · {registry.gaps.length} source gaps</p>
        </article>
        <article>
          <span className={decisionValidation.ok ? styles.good : styles.bad} />
          <strong>Decision Layer</strong>
          <p>{decisionSummary.items} itens · {decisionSummary.human_gate_pending} aguardando Human Gate</p>
        </article>
      </section>

      <section className={styles.modules}>
        <Link href="/research/correspondences" className={styles.moduleCard}>
          <p className={styles.kicker}>01 · PROVENIÊNCIA E CONFLITO</p>
          <h2>Correspondence Lab</h2>
          <p>
            Compare Sefer Yetzirah, Golden Dawn, Del Debbio, Éliphas Lévi e Crowley/Thoth sem colapsar
            as tradições numa única tabela.
          </p>
          <span>ABRIR MÓDULO →</span>
        </Link>

        <Link href="/research/decisions" className={styles.moduleCard}>
          <p className={styles.kicker}>02 · CODEX ADMISSION</p>
          <h2>Decision Layer</h2>
          <p>
            Veja por que cada elemento entra, permanece, fica em pesquisa, aguarda Human Gate ou é
            excluído operacionalmente sem ser apagado do arquivo.
          </p>
          <span>ABRIR MÓDULO →</span>
        </Link>
      </section>

      <section className={styles.pipeline}>
        <p className={styles.kicker}>PIPELINE SELADO</p>
        <code>SOURCE → PROVENANCE → CATALOG → CONFLICT → DECISION → HUMAN GATE → HNK CANON</code>
      </section>
    </main>
  );
}
