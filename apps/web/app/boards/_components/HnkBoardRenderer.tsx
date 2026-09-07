import type { HnkBoard } from '@hnk/assets';
import styles from './board-renderer.module.css';
import themeStyles from './kether-token-bridge.module.css';

export interface HnkBoardRendererProps {
  board: HnkBoard;
}

export function HnkBoardRenderer({ board }: HnkBoardRendererProps) {
  const ketherTheme = board.scopeId === 'kether';

  return (
    <main
      className={`${styles.page} ${ketherTheme ? themeStyles.kether : ''}`}
      data-hnk-theme={ketherTheme ? 'kether' : undefined}
    >
      <section
        className={styles.board}
        aria-label={board.accessibility.alt}
        data-hnk-board-id={board.id}
        data-hnk-board-version={board.version}
      >
        <div className={styles.architecture} aria-hidden="true">
          <span className={styles.architectureAxis} />
          <span className={styles.architectureRingOne} />
          <span className={styles.architectureRingTwo} />
        </div>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>HNK · {board.family.toUpperCase()}</p>
            <p className={styles.heroOrdinal}>I</p>
            <h1>{board.title}</h1>
            {board.subtitle ? <p className={styles.subtitle}>{board.subtitle}</p> : null}
            {board.rangeLabel ? <p className={styles.range}>{board.rangeLabel}</p> : null}
          </div>

          <div className={styles.crownField} aria-hidden="true">
            <div className={`${styles.crownOrbit} ${styles.crownOrbitOne}`} />
            <div className={`${styles.crownOrbit} ${styles.crownOrbitTwo}`} />
            <div className={`${styles.crownOrbit} ${styles.crownOrbitThree}`} />
            <div className={styles.crownAxis} />
            <div className={styles.crownOrigin} />
            <div className={`${styles.crownRay} ${styles.crownRayLeft}`} />
            <div className={`${styles.crownRay} ${styles.crownRayRight}`} />
          </div>
        </header>

        <div className={styles.factConstellation} aria-label="Metadados do capítulo">
          {board.facts.map((fact, index) => (
            <article className={styles.fact} key={`${fact.label}-${fact.value}`}>
              <span className={styles.factIndex}>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p>{fact.label}</p>
                <strong>{fact.value}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.editorialField}>
          {board.sections.map((section, index) => (
            <article
              className={`${styles.panel} ${index === 0 ? styles.panelPrimary : ''} ${
                index === 1 ? styles.panelManuscript : ''
              } ${index === 2 ? styles.panelRpg : ''}`}
              key={section.id}
            >
              <span className={styles.panelOrdinal}>{String(index + 1).padStart(2, '0')}</span>
              {section.eyebrow ? <p className={styles.panelEyebrow}>{section.eyebrow}</p> : null}
              <h2>{section.title}</h2>
              {section.body ? <p className={styles.body}>{section.body}</p> : null}
              {section.items ? (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {section.facts ? (
                <dl className={styles.inlineFacts}>
                  {section.facts.map((fact) => (
                    <div key={`${section.id}-${fact.label}`}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          ))}
        </div>

        {board.cycles?.length ? (
          <section className={styles.cycles} aria-labelledby={`${board.id}-cycles-title`}>
            <div className={styles.sectionHeading}>
              <p className={styles.panelEyebrow}>Progressão · 7 Fragmentos</p>
              <h2 id={`${board.id}-cycles-title`}>A Emanação da Coroa</h2>
              <p className={styles.sectionIntro}>
                Sete movimentos de cinco dias conduzem o Neófito até o limiar do Portal 036.
              </p>
            </div>

            <div className={styles.cyclePath}>
              <div className={styles.cycleSpine} aria-hidden="true" />
              {board.cycles.map((cycle) => (
                <article className={styles.cycle} key={cycle.id}>
                  <div className={styles.cycleNode} aria-hidden="true">
                    <span>{String(cycle.index).padStart(2, '0')}</span>
                  </div>
                  <div className={styles.cycleCopy}>
                    <p className={styles.cycleMeta}>
                      {cycle.label} · Dias {cycle.days[0]}–{cycle.days[1]}
                    </p>
                    <h3>{cycle.title}</h3>
                    {cycle.focus ? <p>{cycle.focus}</p> : null}
                    <div className={styles.cycleSystemLine}>
                      {cycle.attributes?.length ? (
                        <p className={styles.attributes}>{cycle.attributes.join(' · ')}</p>
                      ) : null}
                      {cycle.xpLabel ? <p className={styles.xp}>{cycle.xpLabel}</p> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {board.portal ? (
          <section className={styles.portal}>
            <div className={styles.portalArchitecture} aria-hidden="true">
              <span className={styles.portalOuter} />
              <span className={styles.portalInner} />
              <span className={styles.portalCore} />
              <span className={styles.portalVertical} />
              <span className={styles.portalHorizontal} />
            </div>
            <div className={styles.portalCopy}>
              <p className={styles.panelEyebrow}>Portal · Dia {board.portal.days.join(', ')}</p>
              <h2>{board.portal.title}</h2>
              {board.portal.destination ? (
                <p className={styles.destination}>Destino: {board.portal.destination}</p>
              ) : null}
              {board.portal.summary ? <p className={styles.portalSummary}>{board.portal.summary}</p> : null}
            </div>
          </section>
        ) : null}

        <footer className={styles.footer}>
          <span>{board.id}</span>
          <span>v{board.version}</span>
          <span>{board.lifecycle}</span>
          <span>{board.visual.direction}</span>
        </footer>
      </section>
    </main>
  );
}
