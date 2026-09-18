import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../lib/research/auth";
import { admissionSummary, validateAdmissionDecisionLayer } from "../../lib/research/admission";
import { humanGateSummary, validateHumanGateRuntime } from "../../lib/research/human-gate";
import { canonRegistrySummary, validateCanonRegistry } from "../../lib/research/canon-registry";
import { createResearch001Registry } from "@hnk/correspondence-registry";
import {
  claimDossierSummary,
  claimReevaluationBatchScannerSummary,
  deploymentGateRegistrySummary,
  claimReevaluationQueueSummary,
  evidenceLedgerSummary,
  evidenceReviewGateSummary,
  evidenceSynthesisSummary,
  experimentAttestationSummary,
  experimentProtocolSummary,
  measurementContractSummary,
  replicationRegistrySummary,
  researchArtifactLibrarySummary,
  researchReleaseManifestSummary,
  reproducibilityVerifierSummary,
  releaseVerificationRegistrySummary,
  researchWorkspaceSnapshotSummary,
  workspaceSnapshotRegistrySummary,
  reviewedClaimRegistrySummary,
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
  const claimDossier = claimDossierSummary();
  const reviewGate = evidenceReviewGateSummary();
  const reviewedClaims = reviewedClaimRegistrySummary();
  const reevaluationQueue = claimReevaluationQueueSummary();
  const reevaluationBatch = claimReevaluationBatchScannerSummary();
  const artifactLibrary = researchArtifactLibrarySummary();
  const releaseManifest = researchReleaseManifestSummary();
  const reproducibilityVerifier = reproducibilityVerifierSummary();
  const releaseVerificationRegistry = releaseVerificationRegistrySummary();
  const deploymentGate = deploymentGateRegistrySummary();
  const workspaceSnapshot = researchWorkspaceSnapshotSummary();
  const workspaceSnapshotRegistry = workspaceSnapshotRegistrySummary();

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
          <span>CLAIM DOSSIER</span>
          <span>HUMAN EVIDENCE REVIEW GATE</span>
          <span>REVIEWED CLAIM REGISTRY</span>
          <span>CLAIM RE-EVALUATION QUEUE</span>
          <span>RE-EVALUATION BATCH SCANNER</span>
          <span>ARTIFACT LIBRARY</span>
          <span>WORKSPACE SNAPSHOT</span>
          <span>SNAPSHOT REGISTRY</span>
          <span>RELEASE MANIFEST</span>
          <span>REPRODUCIBILITY VERIFIER</span>
          <span>HUMAN RELEASE GATE</span>
          <span>HUMAN DEPLOYMENT GATE</span>
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
        <article>
          <span className={claimDossier.human_relevance_classification_required ? styles.good : styles.bad} />
          <strong>Claim Dossier</strong>
          <p>human relevance · gaps/conflicts preserved</p>
        </article>
        <article>
          <span className={reviewGate.machine_can_decide === false ? styles.good : styles.bad} />
          <strong>Evidence Review Gate</strong>
          <p>explicit human signal · no auto canon</p>
        </article>
        <article>
          <span className={reviewedClaims.non_destructive_history ? styles.good : styles.bad} />
          <strong>Reviewed Claim Registry</strong>
          <p>versioned human-reviewed claims · NOT_CANON</p>
        </article>
        <article>
          <span className={reevaluationQueue.machine_can_change_classification === false ? styles.good : styles.bad} />
          <strong>Claim Re-evaluation Queue</strong>
          <p>snapshot drift detection · human review required</p>
        </article>
        <article>
          <span className={reevaluationBatch.machine_can_change_classification === false ? styles.good : styles.bad} />
          <strong>Re-evaluation Batch Scanner</strong>
          <p>all active claims · explicit coverage gaps</p>
        </article>
        <article>
          <span className={artifactLibrary.machine_inferred_relevance === false ? styles.good : styles.bad} />
          <strong>Artifact Library</strong>
          <p>append-only snapshots · deterministic input resolution</p>
        </article>
        <article>
          <span className={workspaceSnapshot.component_digest_binding ? styles.good : styles.bad} />
          <strong>Workspace Snapshot</strong>
          <p>root SHA-256 · compare · exact restore</p>
        </article>
        <article>
          <span className={workspaceSnapshotRegistry.machine_can_choose_head === false ? styles.good : styles.bad} />
          <strong>Snapshot Registry</strong>
          <p>timeline · forks · explicit human HEAD</p>
        </article>
        <article>
          <span className={releaseManifest.production_readiness_inferred === false ? styles.good : styles.bad} />
          <strong>Release Manifest</strong>
          <p>HEAD + Git + contracts + validator evidence</p>
        </article>
        <article>
          <span className={reproducibilityVerifier.production_readiness_inferred === false ? styles.good : styles.bad} />
          <strong>Reproducibility Verifier</strong>
          <p>MATCH · DRIFT · MISSING · UNVERIFIED</p>
        </article>
        <article>
          <span className={releaseVerificationRegistry.machine_can_accept_release === false ? styles.good : styles.bad} />
          <strong>Human Release Gate</strong>
          <p>MATCH ≠ acceptance · explicit report-bound decision</p>
        </article>
        <article>
          <span className={deploymentGate.machine_can_approve_deployment === false ? styles.good : styles.bad} />
          <strong>Human Deployment Gate</strong>
          <p>RELEASE_ACCEPTED ≠ deployment authorization</p>
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
        <Link href="/research/claims" className={styles.moduleCard}>
          <p className={styles.kicker}>11 · CLAIM DOSSIER + HUMAN REVIEW</p>
          <h2>Claim Dossier & Evidence Review Gate</h2>
          <p>Vincule afirmações a grupos de Evidence Synthesis, preserve lacunas/conflitos e exija uma decisão humana explícita sem promoção automática para verdade ou cânone.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/reviewed-claims" className={styles.moduleCard}>
          <p className={styles.kicker}>12 · REVIEWED CLAIM REGISTRY</p>
          <h2>Reviewed Claim Registry</h2>
          <p>Indexe claims já revisadas, mantenha versões superseded de forma não destrutiva e pesquise classificações humanas sem confundir review com verdade ou cânone.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/re-evaluations" className={styles.moduleCard}>
          <p className={styles.kicker}>13 · CLAIM RE-EVALUATION QUEUE</p>
          <h2>Claim Re-evaluation Queue</h2>
          <p>Detecte quando um novo snapshot da mesma Evidence Synthesis torna uma claim ativa candidata a nova revisão, sem reclassificação automática.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/re-evaluation-batch" className={styles.moduleCard}>
          <p className={styles.kicker}>14 · RE-EVALUATION BATCH SCANNER</p>
          <h2>Re-evaluation Batch Scanner</h2>
          <p>Varra todas as claims ativas, preserve dossiers ou syntheses ausentes como gaps explícitos e materialize somente REVIEW_DUE na fila.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/artifacts" className={styles.moduleCard}>
          <p className={styles.kicker}>15 · EVIDENCE SNAPSHOT CATALOG</p>
          <h2>Artifact Library</h2>
          <p>Catalogue Claim Dossiers e Evidence Synthesis por digest, key e revisão; resolva automaticamente os inputs corretos para o Batch Scanner.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/workspace-snapshots" className={styles.moduleCard}>
          <p className={styles.kicker}>16 · RESEARCH WORKSPACE SNAPSHOT</p>
          <h2>Workspace Snapshot</h2>
          <p>Congele Artifact Library, Reviewed Claim Registry e Re-evaluation Queue num único root digest; compare checkpoints e restaure os componentes exatos.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/workspace-snapshot-registry" className={styles.moduleCard}>
          <p className={styles.kicker}>17 · WORKSPACE SNAPSHOT REGISTRY</p>
          <h2>Snapshot Registry</h2>
          <p>Catalogue checkpoints por digest, valide parent → child, detecte forks, trace ancestry, compare qualquer par e mova HEAD somente por ação humana explícita.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/releases" className={styles.moduleCard}>
          <p className={styles.kicker}>18 · RESEARCH RELEASE MANIFEST</p>
          <h2>Reproducibility Pack</h2>
          <p>Sele o HEAD explícito com commit Git, versões e fontes dos contratos, fontes/estado dos validators e comandos de reprodução sem inferir Production PASS.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/reproducibility-verifier" className={styles.moduleCard}>
          <p className={styles.kicker}>19 · REPRODUCIBILITY VERIFIER</p>
          <h2>Verify Release</h2>
          <p>Compare um Reproducibility Pack com Git, runtime e fontes observadas e produza MATCH, DRIFT, MISSING ou UNVERIFIED sem executar comandos automaticamente.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/release-verification-registry" className={styles.moduleCard}>
          <p className={styles.kicker}>20 · VERIFICATION REGISTRY + HUMAN RELEASE GATE</p>
          <h2>Human Release Gate</h2>
          <p>Preserve Verification Reports por digest e aceite, rejeite ou retenha uma release somente por decisão humana explícita sobre um report específico.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
        <Link href="/research/deployment-gate" className={styles.moduleCard}>
          <p className={styles.kicker}>21 · DEPLOYMENT CANDIDATE + HUMAN DEPLOYMENT GATE</p>
          <h2>Human Deployment Gate</h2>
          <p>Nomeie somente releases atualmente aceitas, invalide candidates quando a evidência mudar e autorize deployment apenas por decisão humana explícita sobre um candidate ainda ELIGIBLE.</p>
          <span>ABRIR MÓDULO →</span>
        </Link>
      </section>

      <section className={styles.pipeline}>
        <p className={styles.kicker}>PIPELINE SELADO</p>
        <code>SOURCE → PROVENANCE → CATALOG → CONFLICT → DECISION → HUMAN GATE → HNK_AUTHORED CANON → SYMBOLIC RUNTIME → SESSION ARTIFACTS → PREREGISTERED EXPERIMENT → CONTENT ATTESTATION → TYPED MEASUREMENT → EVIDENCE LEDGER → REPLICATION REGISTRY → EVIDENCE SYNTHESIS → CLAIM DOSSIER → EVIDENCE REVIEW GATE → REVIEWED CLAIM REGISTRY → ARTIFACT LIBRARY → RE-EVALUATION BATCH SCANNER → CLAIM RE-EVALUATION QUEUE → WORKSPACE SNAPSHOT → SNAPSHOT REGISTRY → RELEASE MANIFEST → REPRODUCIBILITY VERIFIER → VERIFICATION REGISTRY → HUMAN RELEASE GATE → DEPLOYMENT CANDIDATE → HUMAN DEPLOYMENT GATE</code>
      </section>
    </main>
  );
}
