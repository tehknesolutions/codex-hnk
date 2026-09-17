import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { researchLabEnabled } from "../../lib/research/auth";
import { admissionSummary, validateAdmissionDecisionLayer } from "../../lib/research/admission";
import { humanGateSummary, validateHumanGateRuntime } from "../../lib/research/human-gate";
import { canonRegistrySummary, validateCanonRegistry } from "../../lib/research/canon-registry";
import { createResearch001Registry } from "@hnk/correspondence-registry";
import { experimentAttestationSummary, experimentProtocolSummary, measurementContractSummary, symbolicRuntimeSummary } from "@hnk/quest-engine";
import styles from "./research.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HNK Research Lab",
  description: "Laboratório privado de pesquisa, proveniência, correspondências, decisões, cânone, runtime, experimentos, attestation e medidas tipadas do HNK Codex.",
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

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>HNK CODEX · PRIVATE RESEARCH</p>
        <h1>Research Lab</h1>
        <p>
          Uma superfície para separar fonte, linhagem, conflito, decisão Codex, Human Gate, autoria HNK,
          execução simbólica, experimentação preregistrada e medidas tipadas sem apagar divergências nem confundir registro com prova.
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

        <Link href="/research/human-gate" className={styles.moduleCard}>
          <p className={styles.kicker}>03 · AUTORIDADE HUMANA</p>
          <h2>Human Gate</h2>
          <p>
            Audite decisões explícitas, recomendações não vinculantes e a fronteira que impede qualquer
            promoção automática de candidato para HNK_CANON.
          </p>
          <span>ABRIR MÓDULO →</span>
        </Link>

        <Link href="/research/canon" className={styles.moduleCard}>
          <p className={styles.kicker}>04 · HNK_AUTHORED</p>
          <h2>Canon Registry</h2>
          <p>
            Consulte os registros que atravessaram o Human Gate e foram reescritos como material HNK,
            mantendo trace completo até pesquisa, decisão e aprovação.
          </p>
          <span>ABRIR MÓDULO →</span>
        </Link>

        <Link href="/research/runtime" className={styles.moduleCard}>
          <p className={styles.kicker}>05 · CÂNONE OPERACIONAL</p>
          <h2>Symbolic Runtime Lab</h2>
          <p>
            Execute sessões efêmeras com intenção, State/Path, Quest, glifo-chave, Vessel, observação,
            feedback e resultado com escopo explícito de evidência.
          </p>
          <span>ABRIR MÓDULO →</span>
        </Link>

        <Link href="/research/experiments" className={styles.moduleCard}>
          <p className={styles.kicker}>06 · EXPERIMENTAÇÃO PREREGISTRADA</p>
          <h2>Experiment Protocol Lab</h2>
          <p>
            Defina pergunta, hipótese, variáveis, controle e critérios antes de executar; agrupe artifacts
            válidos, gere attestations SHA-256 e mantenha descrição, interpretação e limitações separadas.
          </p>
          <span>ABRIR MÓDULO →</span>
        </Link>

        <Link href="/research/measurements" className={styles.moduleCard}>
          <p className={styles.kicker}>07 · TYPED MEASUREMENT</p>
          <h2>Measurement Contract Lab</h2>
          <p>
            Transforme as variáveis observadas preregistradas em métricas `NUMBER`, `BOOLEAN`, `CATEGORY`,
            `TEXT`, `COUNT` ou `SCALE`, registre valores sem imputação e compare controle × experimental descritivamente.
          </p>
          <span>ABRIR MÓDULO →</span>
        </Link>
      </section>

      <section className={styles.pipeline}>
        <p className={styles.kicker}>PIPELINE SELADO</p>
        <code>SOURCE → PROVENANCE → CATALOG → CONFLICT → DECISION → HUMAN GATE → HNK_AUTHORED CANON → SYMBOLIC RUNTIME → SESSION ARTIFACTS → PREREGISTERED EXPERIMENT → CONTENT ATTESTATION → TYPED MEASUREMENT</code>
      </section>
    </main>
  );
}
