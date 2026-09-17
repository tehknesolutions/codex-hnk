import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../lib/research/auth";
import { admissionSummary, validateAdmissionDecisionLayer } from "../../lib/research/admission";
import { humanGateSummary, validateHumanGateRuntime } from "../../lib/research/human-gate";
import { canonRegistrySummary, validateCanonRegistry } from "../../lib/research/canon-registry";
import { createResearch001Registry } from "@hnk/correspondence-registry";
import {
  evidenceLedgerSummary,
  evidenceSynthesisSummary,
  experimentAttestationSummary,
  experimentProtocolSummary,
  measurementContractSummary,
  replicationRegistrySummary,
  symbolicRuntimeSummary,
} from "@hnk/quest-engine";
import styles from "./research.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Research Lab",
  description: "Laboratório privado de pesquisa, runtime, evidência, replicação e síntese descritiva do HNK Codex.",
  robots: { index: false, follow: false },
};

export default function ResearchLabHome() {
  if (!researchLabEnabled()) notFound();

  const correspondenceRegistry = createResearch001Registry();
  const registryValidation = correspondenceRegistry.validate();
  const decisionValidation = validateAdmissionDecisionLayer();
  const decisionSummary = admissionSummary();
  const humanGateValidation = validateHumanGateRuntime();
  const humanGate = humanGateSummary();
  const canonValidation = validateCanonRegistry();
  const canon = canonRegistrySummary();
  const runtime = symbolicRuntimeSummary();
  const experiments = experimentProtocolSummary();
  const attestation = experimentAttestationSummary();
  const measurement = measurementContractSummary();
  const evidence = evidenceLedgerSummary();
  const replication = replicationRegistrySummary();
  const synthesis = evidenceSynthesisSummary();

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>HNK CODEX · PRIVATE RESEARCH</p>
        <h1>Research Lab</h1>
        <p>
          Uma superfície para separar fonte, linhagem, decisão, autoria HNK, execução simbólica,
          experimentação preregistrada, medidas, evidência, replicação e síntese acumulativa.
        </p>
        <div className={styles.locks}>
          <span>PRIVATE</span>
          <span>PROVENANCE FIRST</span>
          <span>NO AUTO-PROMOTION</span>
          <span>HUMAN GATE</span>
          <span>HNK_AUTHORED CANON</span>
          <span>EVIDENCE SCOPED RUNTIME</span>
          <span>PREREGISTERED EXPERIMENTS</span>
          <span>SHA-256 CONTENT ATTESTATION</span>
          <span>TYPED MEASUREMENT</span>
          <span>EXPLICIT EVIDENCE COVERAGE</span>
          <span>DESCRIPTIVE REPLICATION</span>
          <span>CONVERGENCE / DIVERGENCE SYNTHESIS</span>
        </div>
      </header>

      <section className={styles.healthGrid} aria-label="Saúde do laboratório">
        <article>
          <span className={registryValidation.ok ? styles.good : styles.bad} />
          <strong>Correspondence Registry</strong>
          <p>{correspondenceRegistry.records.length} registros · {correspondenceRegistry.gaps.length} source gaps</p>
        </article>
        <article>
          <span className={decisionValidation.ok ? styles.good : styles.bad} />
          <strong>Decision Layer</strong>
          <p>{decisionSummary.items} itens catalogados</p>
        </article>
        <article>
          <span className={humanGateValidation.ok ? styles.good : styles.bad} />
          <strong>Human Gate</strong>
          <p>{humanGate.decided}/{humanGate.candidates} decididos · {humanGate.pending} pendentes</p>
        </article>
        <article>
          <span className={canonValidation.ok ? styles.good : styles.bad} />
          <strong>Canon Registry</strong>
          <p>{canon.records} registros · {canon.authority}</p>
        </article>
        <article>
          <span className={runtime.canon_contract_ok ? styles.good : styles.bad} />
          <strong>Symbolic Runtime</strong>
          <p>{runtime.canon_dependencies} dependências · {runtime.events} eventos</p>
        </article>
        <article>
          <span className={experiments.preregistration_required ? styles.good : styles.bad} />
          <strong>Experiment Protocol</strong>
          <p>control required · preregistration locked</p>
        </article>
        <article>
          <span className={attestation.hash_chain ? styles.good : styles.bad} />
          <strong>Experiment Attestation</strong>
          <p>{String(attestation.algorithm)} · content integrity only</p>
        </article>
        <article>
          <span className={measurement.plan_locked_before_sessions ? styles.good : styles.bad} />
          <strong>Measurement Contract</strong>
          <p>{Array.isArray(measurement.types) ? measurement.types.length : 0} metric types · descriptive only</p>
        </article>
        <article>
          <span className={evidence.explicit_insufficiency ? styles.good : styles.bad} />
          <strong>Evidence Ledger</strong>
          <p>requirements explicit · insufficiency visible</p>
        </article>
        <article>
          <span className={replication.exact_metric_signature_required ? styles.good : styles.bad} />
          <strong>Replication Registry</strong>
          <p>independent runs · descriptive direction only</p>
        </article>
        <article>
          <span className={synthesis.mixed_and_insufficient_preserved ? styles.good : styles.bad} />
          <strong>Evidence Synthesis</strong>
          <p>exact metric groups · convergence/divergence map</p>
        </article>
      </section>

      <section className={styles.modules}>
        <Link href="/research/correspondences" className={styles.moduleCard}><p className={styles.kicker}>01 · PROVENIÊNCIA E CONFLITO</p><h2>Correspondence Lab</h2><p>Compare tradições e correspondências sem colapsar divergências numa única tabela.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/decisions" className={styles.moduleCard}><p className={styles.kicker}>02 · CODEX ADMISSION</p><h2>Decision Layer</h2><p>Audite entrada, referência, pesquisa, exclusão operacional e candidatos sem apagar a origem.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/human-gate" className={styles.moduleCard}><p className={styles.kicker}>03 · AUTORIDADE HUMANA</p><h2>Human Gate</h2><p>Preserve a fronteira entre recomendação de máquina e aprovação humana explícita.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/canon" className={styles.moduleCard}><p className={styles.kicker}>04 · HNK_AUTHORED</p><h2>Canon Registry</h2><p>Consulte registros canônicos HNK com trace até pesquisa, decisão e Human Gate.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/runtime" className={styles.moduleCard}><p className={styles.kicker}>05 · CÂNONE OPERACIONAL</p><h2>Symbolic Runtime Lab</h2><p>Execute sessões com State/Path, Quest, observação, feedback e resultado evidence-scoped.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/experiments" className={styles.moduleCard}><p className={styles.kicker}>06 · EXPERIMENTAÇÃO PREREGISTRADA</p><h2>Experiment Protocol Lab</h2><p>Preregistre controles, critérios, sessões e relatório com attestation SHA-256.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/measurements" className={styles.moduleCard}><p className={styles.kicker}>07 · TYPED MEASUREMENT</p><h2>Measurement Contract Lab</h2><p>Converta variáveis em métricas tipadas, registre dados sem imputação e resuma descritivamente.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/evidence" className={styles.moduleCard}><p className={styles.kicker}>08 · EVIDENCE COVERAGE</p><h2>Evidence Ledger Lab</h2><p>Encadeie fontes verificáveis e torne cobertura completa, parcial ou insuficiente explicitamente auditável.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/replications" className={styles.moduleCard}><p className={styles.kicker}>09 · DESCRIPTIVE REPLICATION</p><h2>Replication Registry Lab</h2><p>Agrupe Evidence Ledgers independentes e registre repetição, divergência e insuficiência por métrica.</p><span>ABRIR MÓDULO →</span></Link>
        <Link href="/research/synthesis" className={styles.moduleCard}>
          <p className={styles.kicker}>10 · EVIDENCE SYNTHESIS</p>
          <h2>Evidence Synthesis Lab</h2>
          <p>Agrupe Replication Registries por assinatura exata de métrica e construa uma matriz de convergência, divergência, MIXED e insuficiência por pergunta.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
      </section>

      <section className={styles.pipeline}>
        <p className={styles.kicker}>PIPELINE SELADO</p>
        <code>SOURCE → PROVENANCE → CATALOG → CONFLICT → DECISION → HUMAN GATE → HNK_AUTHORED CANON → SYMBOLIC RUNTIME → SESSION ARTIFACTS → PREREGISTERED EXPERIMENT → CONTENT ATTESTATION → TYPED MEASUREMENT → EVIDENCE LEDGER → REPLICATION REGISTRY → EVIDENCE SYNTHESIS</code>
      </section>
    </main>
  );
}
