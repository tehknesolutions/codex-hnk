import styles from './lucidity-panel.module.css';

type LucidityPanelProps = {
  state: 'LEGACY_UNCLASSIFIED';
};

export function LucidityPanel({ state }: LucidityPanelProps) {
  return (
    <aside className={styles.panel} aria-labelledby="lucidity-title" data-lucidity-state={state}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>Camada de Lucidez · V1</p>
        <h2 id="lucidity-title">Acredito · Duvido · Provo</h2>
      </div>

      <div className={styles.axes} aria-label="Eixos de lucidez">
        <span>ACREDITO</span><span>DUVIDO</span><span>PROVO</span>
      </div>

      <dl className={styles.status}>
        <div><dt>Estado epistemológico</dt><dd>{state}</dd></div>
        <div><dt>Classificação</dt><dd>Não inferida retroativamente</dd></div>
        <div><dt>Autoridade</dt><dd>O painel não altera o cânone do Day 001</dd></div>
      </dl>

      <p className={styles.invariant}>
        EXPERIÊNCIA ≠ INTERPRETAÇÃO ≠ EVIDÊNCIA ≠ CÂNONE
      </p>
      <p className={styles.note}>
        Este conteúdo antecede a classificação Lucidity V1. Até revisão deliberada, o Codex o apresenta como legado não classificado em vez de inventar evidência, autoridade ou genealogia.
      </p>
    </aside>
  );
}
