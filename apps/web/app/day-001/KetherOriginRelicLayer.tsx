'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import styles from './kether-origin-relic.module.css';
import mobileFlowStyles from './kether-origin-relic-mobile-flow.module.css';

const LAYERS = [
  {
    roman: 'I',
    label: 'PONTO',
    title: 'Concentre a origem.',
    body: 'A Lente começa com a primitiva mais simples do sistema: um ponto de atenção. Ele não é um sigilo canônico nem representa uma entidade.',
  },
  {
    roman: 'II',
    label: 'EMANAÇÃO',
    title: 'Observe a expansão.',
    body: 'Os anéis tornam visível uma metáfora de interface: algo pode emergir de um centro sem que a interface transforme essa imagem em afirmação histórica ou científica.',
  },
  {
    roman: 'III',
    label: 'EIXO',
    title: 'Organize a passagem.',
    body: 'O eixo introduz direção e prepara o retorno ao manuscrito. A experiência ensina pela transformação do campo, enquanto a doutrina continua pertencendo ao texto canônico.',
  },
] as const;

function readCurrentAct() {
  return document.querySelector<HTMLElement>('main[data-act]')?.dataset.act ?? null;
}

export function KetherOriginRelicLayer() {
  const [activeAct, setActiveAct] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [layer, setLayer] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const sync = () => {
      const next = readCurrentAct();
      setActiveAct(next);
      if (next !== 'revelacao') setOpen(false);
    };

    sync();
    const root = document.querySelector<HTMLElement>('main[data-act]');
    if (!root) return;
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-act'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function openRelic() {
    setLayer(0);
    setOpen(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
    stageRef.current?.style.setProperty('--relic-x', `${(x - 0.5) * 2}`);
    stageRef.current?.style.setProperty('--relic-y', `${(y - 0.5) * 2}`);
  }

  if (activeAct !== 'revelacao') return null;

  const current = LAYERS[layer];

  return (
    <>
      <button type="button" className={styles.trigger} onClick={openRelic}>
        <span>RELIC MOMENT</span>
        <strong>ABRIR LENTE DA ORIGEM</strong>
        <i aria-hidden="true" />
      </button>

      {open ? (
        <section
          className={`${styles.overlay} ${mobileFlowStyles.mobileFlow}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="origin-relic-title"
          data-relic-layer={layer + 1}
          data-relic-overlay
        >
          <div className={styles.backdrop} aria-hidden="true" />
          <header className={styles.header} data-relic-header>
            <div>
              <span>HNK · INSTRUMENTO DE INTERFACE</span>
              <strong>LENTE DA ORIGEM</strong>
            </div>
            <button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} aria-label="Fechar Lente da Origem">
              FECHAR ×
            </button>
          </header>

          <div className={styles.chamber} data-relic-chamber>
            <div
              ref={stageRef}
              className={styles.stage}
              data-testid="kether-origin-relic-stage"
              data-relic-stage
              onPointerMove={handlePointerMove}
              onPointerLeave={() => {
                stageRef.current?.style.setProperty('--relic-x', '0');
                stageRef.current?.style.setProperty('--relic-y', '0');
              }}
            >
              <div className={styles.instrument} aria-hidden="true">
                <i className={styles.axis} />
                <i className={styles.ringOuter} />
                <i className={styles.ringMiddle} />
                <i className={styles.ringInner} />
                <b className={styles.point} />
                <span className={styles.traceA} />
                <span className={styles.traceB} />
              </div>
              <div className={styles.layerIndex} aria-hidden="true">{current.roman}</div>
            </div>

            <article className={styles.copy} aria-live="polite" data-relic-copy>
              <p>{current.roman} · {current.label}</p>
              <h2 id="origin-relic-title">{current.title}</h2>
              <div className={styles.rule} />
              <p className={styles.body}>{current.body}</p>
              <div className={styles.instructions}>
                <span>MOVA CURSOR / TOQUE PARA DESLOCAR O CAMPO</span>
                <span>FECHAR SEMPRE DISPONÍVEL · MOVIMENTO NÃO É OBRIGATÓRIO</span>
              </div>
              <div className={styles.progress} aria-label={`Camada ${layer + 1} de 3`} data-relic-progress>
                {LAYERS.map((item, index) => (
                  <button key={item.label} type="button" data-active={index === layer} onClick={() => setLayer(index)} aria-label={`Abrir camada ${index + 1}: ${item.label}`}>
                    <i />
                    <span>{item.roman}</span>
                  </button>
                ))}
              </div>
              <div className={styles.actions} data-relic-actions>
                {layer < LAYERS.length - 1 ? (
                  <button type="button" onClick={() => setLayer((value) => Math.min(value + 1, LAYERS.length - 1))}>REVELAR PRÓXIMA CAMADA</button>
                ) : (
                  <button type="button" onClick={() => setOpen(false)}>RETORNAR À REVELAÇÃO</button>
                )}
              </div>
            </article>
          </div>

          <footer className={styles.disclaimer} data-relic-disclaimer>
            <strong>FRONTEIRA HNK-EP</strong>
            <span>Lente da Origem é uma metáfora/instrumento de interface HNK. Não é o Sigilo canônico de Kether, não detecta fenômenos e não constitui prova científica, biomédica ou espiritual externa.</span>
          </footer>
        </section>
      ) : null}
    </>
  );
}
