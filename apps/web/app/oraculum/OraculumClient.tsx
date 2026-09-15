'use client';

import { FormEvent, useMemo, useState } from 'react';
import styles from './oraculum.module.css';

const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
type Face = (typeof FACE_ORDER)[number];
type Cell = number | null;

type ConsultationResponse = {
  ok: boolean;
  error?: string;
  scanProfile?: string;
  raw?: any;
  interpretation?: any;
};

const DEFAULT_NAMES = ['Branco', 'Vermelho', 'Verde', 'Amarelo', 'Laranja', 'Azul'];
const DEFAULT_COLORS = ['#f5f5f2', '#d94848', '#34a853', '#f2cf3a', '#e8892f', '#3f65d9'];

function blankCube(): Record<Face, Cell[]> {
  return FACE_ORDER.reduce((acc, face, faceIndex) => {
    const cells: Cell[] = Array(9).fill(null);
    cells[4] = faceIndex;
    acc[face] = cells;
    return acc;
  }, {} as Record<Face, Cell[]>);
}

function solvedCube(): Record<Face, Cell[]> {
  return FACE_ORDER.reduce((acc, face, faceIndex) => {
    acc[face] = Array(9).fill(faceIndex);
    return acc;
  }, {} as Record<Face, Cell[]>);
}

function descriptor(value: any) {
  if (!value) return '—';
  if (value.type === 'SEFIRAH') return `${value.path}. ${value.name}`;
  if (value.letter) return `${value.path}. ${value.letter}${value.tarot ? ` · ${value.tarot}` : ''}`;
  if (value.kind === 'MINOR') return `${value.rank} of ${value.suit}`;
  return value.tarot ?? value.name ?? '—';
}

export function OraculumClient() {
  const [intent, setIntent] = useState('');
  const [mode, setMode] = useState<'STATE' | 'RITUAL_32'>('STATE');
  const [moves, setMoves] = useState('');
  const [faces, setFaces] = useState<Record<Face, Cell[]>>(() => blankCube());
  const [activeDigit, setActiveDigit] = useState(0);
  const [colorNames, setColorNames] = useState(DEFAULT_NAMES);
  const [colorHex, setColorHex] = useState(DEFAULT_COLORS);
  const [response, setResponse] = useState<ConsultationResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const flattened = useMemo(() => FACE_ORDER.flatMap(face => faces[face]), [faces]);
  const counts = useMemo(() => Array.from({ length: 6 }, (_, digit) => flattened.filter(cell => cell === digit).length), [flattened]);
  const complete = flattened.every(cell => cell !== null);
  const balanced = counts.every(count => count === 9);
  const cubeState = complete ? flattened.join('') : '';
  const moveCount = moves.trim() ? moves.trim().split(/\s+/u).length : 0;

  function paint(face: Face, index: number) {
    if (index === 4) return;
    setFaces(current => ({
      ...current,
      [face]: current[face].map((cell, cellIndex) => (cellIndex === index ? activeDigit : cell)),
    }));
  }

  function changeColorName(index: number, value: string) {
    setColorNames(current => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function changeColorHex(index: number, value: string) {
    setColorHex(current => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLocalError(null);
    setResponse(null);
    if (!intent.trim()) return setLocalError('Escreva a intenção/Alef da consulta.');
    if (!complete) return setLocalError('Complete as 54 casas do cubo.');
    if (!balanced) return setLocalError(`Cada cor deve aparecer 9 vezes. Contagens atuais: ${counts.join(', ')}.`);
    if (mode === 'RITUAL_32' && moveCount !== 32) return setLocalError(`RITUAL_32 exige exatamente 32 movimentos. Atual: ${moveCount}.`);

    setBusy(true);
    try {
      const request = await fetch('/api/oraculum', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent,
          cubeState,
          mode,
          moves: mode === 'RITUAL_32' ? moves : undefined,
          profileId: 'HNK_ORACULUM_DEFAULT_V1',
          includeResultingIChing: true,
        }),
      });
      const data = (await request.json()) as ConsultationResponse;
      if (!data.ok) throw new Error(data.error || 'Falha na consulta');
      setResponse(data);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Falha desconhecida');
    } finally {
      setBusy(false);
    }
  }

  const raw = response?.raw;
  const interpreted = response?.interpretation;

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>HOC · V0.6 CANDIDATE</p>
          <h1>HNK Oraculum Cube</h1>
          <p>Transcreva um cubo 3×3 real, preserve o RAW V0.4 e aplique a interpretação governada V0.5.</p>
        </div>
        <div className={styles.badge}>HOC-FACELET-SCAN-V1</div>
      </header>

      <form onSubmit={submit} className={styles.flow}>
        <section className={styles.card}>
          <div className={styles.step}><span>1</span><div><h2>Calibre o cubo</h2><p>Fixe U/R/F/D/L/B pelos centros. O nome da cor é apenas visual; o dígito 0–5 é o dado serializado.</p></div></div>
          <div className={styles.paletteGrid}>
            {FACE_ORDER.map((face, index) => (
              <div className={styles.paletteCard} key={face}>
                <strong>{face} → {index}</strong>
                <input value={colorNames[index]} onChange={event => changeColorName(index, event.target.value)} aria-label={`Nome da cor ${face}`} />
                <input type="color" value={colorHex[index]} onChange={event => changeColorHex(index, event.target.value)} aria-label={`Cor visual ${face}`} />
                <small>{counts[index]}/9</small>
              </div>
            ))}
          </div>
          <details className={styles.details}>
            <summary>Como orientar cada face</summary>
            <p>F/R/L/B: mantenha U fisicamente para cima. U: vista de cima, com a borda F embaixo. D: vista de baixo, com a borda F em cima. Leia cada 3×3 da esquerda para a direita e de cima para baixo.</p>
          </details>
        </section>

        <section className={styles.card}>
          <div className={styles.step}><span>2</span><div><h2>Transcreva as 54 casas</h2><p>Escolha uma cor/dígito e toque nas casas correspondentes do cubo físico. Os seis centros ficam travados.</p></div></div>
          <div className={styles.paintPalette}>
            {FACE_ORDER.map((face, digit) => (
              <button key={face} type="button" className={activeDigit === digit ? styles.paintActive : styles.paintButton} onClick={() => setActiveDigit(digit)}>
                <i style={{ background: colorHex[digit] }} /> {digit} · {colorNames[digit]}
              </button>
            ))}
          </div>
          <div className={styles.faces}>
            {FACE_ORDER.map((face, faceIndex) => (
              <div className={styles.facePanel} key={face}>
                <div className={styles.faceTitle}><strong>{face}</strong><span>centro {faceIndex}</span></div>
                <div className={styles.faceGrid}>
                  {faces[face].map((cell, index) => (
                    <button
                      key={`${face}-${index}`}
                      type="button"
                      disabled={index === 4}
                      onClick={() => paint(face, index)}
                      className={index === 4 ? styles.centerSticker : styles.sticker}
                      style={{ background: cell === null ? undefined : colorHex[cell] }}
                      aria-label={`${face} posição ${index + 1}: ${cell === null ? 'vazia' : cell}`}
                    >{cell ?? '·'}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.inlineActions}>
            <button type="button" onClick={() => setFaces(blankCube())}>Limpar para centros</button>
            <button type="button" onClick={() => setFaces(solvedCube())}>Carregar cubo resolvido</button>
          </div>
          <div className={balanced && complete ? styles.validState : styles.invalidState}>
            {complete ? (balanced ? '✓ Estado cromático válido: 9 de cada dígito.' : `Contagens inválidas: ${counts.join(' · ')}`) : `Preenchidas ${flattened.filter(cell => cell !== null).length}/54 casas.`}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.step}><span>3</span><div><h2>Declare o Alef e o modo</h2><p>A intenção entra no RAW commit. Evite usar o caractere reservado “|”.</p></div></div>
          <label className={styles.label}>Intenção / pergunta
            <textarea value={intent} onChange={event => setIntent(event.target.value)} rows={3} placeholder="Ex.: Qual padrão precisa se manifestar?" />
          </label>
          <div className={styles.modeRow}>
            <button type="button" className={mode === 'STATE' ? styles.modeActive : ''} onClick={() => setMode('STATE')}>STATE</button>
            <button type="button" className={mode === 'RITUAL_32' ? styles.modeActive : ''} onClick={() => setMode('RITUAL_32')}>RITUAL_32</button>
          </div>
          {mode === 'RITUAL_32' && (
            <label className={styles.label}>32 movimentos Singmaster <span>{moveCount}/32</span>
              <textarea value={moves} onChange={event => setMoves(event.target.value)} rows={4} placeholder="U R F2 L' ..." />
            </label>
          )}
          <button className={styles.submit} disabled={busy} type="submit">{busy ? 'Decodificando…' : 'Gerar consulta HOC-256'}</button>
          {localError && <p className={styles.error}>{localError}</p>}
        </section>
      </form>

      {raw && interpreted && (
        <section className={styles.results}>
          <div className={styles.resultHero}>
            <div><p className={styles.kicker}>RAW V0.4 · IMUTÁVEL</p><h2>{raw.hnk.glyphId} · Path {raw.path32.index}</h2><p className={styles.hash}>{raw.raw.seed256}</p></div>
            <div className={styles.colorTriad}>
              <span style={{ background: raw.colors.essence }} title={`Essence ${raw.colors.essence}`} />
              <span style={{ background: raw.colors.shadow }} title={`Shadow ${raw.colors.shadow}`} />
              <span style={{ background: raw.colors.manifestation }} title={`Manifestation ${raw.colors.manifestation}`} />
            </div>
          </div>

          <div className={styles.resultGrid}>
            <article className={styles.resultCard}><small>Path-32</small><strong>{descriptor(interpreted.path)}</strong><p>{interpreted.path.attribution ? `${interpreted.path.attribution.kind}: ${interpreted.path.attribution.value}` : 'Estrutura sefirotica'}</p></article>
            <article className={styles.resultCard}><small>Tarot</small><strong>{descriptor(interpreted.tarot)}</strong><p>Índice bruto {raw.tarot.cardIndex}</p></article>
            <article className={styles.resultCard}><small>I Ching</small><strong>{raw.iching.primary.lowerTrigram.symbol} {raw.iching.primary.upperTrigram.symbol} · {raw.iching.primary.kingWen}</strong><p>Linhas móveis: {raw.iching.movingLines.join(', ') || 'nenhuma'} → {raw.iching.resulting.kingWen}</p></article>
            <article className={styles.resultCard}><small>Astrologia</small><strong>{raw.astrology.zodiac} · {raw.astrology.planet}</strong><p>Elemento bruto: {raw.astrology.element}</p></article>
            <article className={styles.resultCard}><small>Alquimia</small><strong>{raw.alchemy.principle}</strong><p>{raw.alchemy.phase}</p></article>
            <article className={styles.resultCard}><small>Numerologia</small><strong>{raw.numerology.raw}</strong><p>raiz {raw.numerology.digitalRoot} · hex {raw.numerology.hex}</p></article>
          </div>

          <div className={styles.analysisGrid}>
            <article className={styles.analysisCard}>
              <h3>Convergências independentes</h3>
              {interpreted.convergences.length ? interpreted.convergences.map((item: any) => <div className={styles.signal} key={item.id}><strong>{item.id}</strong><span>score {item.score}</span><small>{item.families.join(' + ')}</small></div>) : <p>Nenhuma convergência cruzou duas famílias independentes.</p>}
            </article>
            <article className={styles.analysisCard}>
              <h3>Tensões</h3>
              {interpreted.tensions.length ? interpreted.tensions.map((item: any) => <div className={styles.signal} key={item.axis}><strong>{item.axis}</strong><span>{item.left.score} : {item.right.score}</span><small>{item.authority}</small></div>) : <p>Nenhum eixo de tensão ativo.</p>}
            </article>
          </div>

          <article className={styles.malkuth}>
            <div><small>MALKUTH · ação verificável</small><h3>{interpreted.malkuth.dominantKey || 'Sem dominante'}</h3></div>
            <p>{interpreted.malkuth.actionTemplate}</p>
            <strong>Verificação obrigatória: {interpreted.malkuth.verificationRequired ? 'SIM' : 'NÃO'}</strong>
          </article>

          <details className={styles.details}>
            <summary>Auditoria técnica</summary>
            <pre>{JSON.stringify({ commit: raw.commit, scanProfile: response.scanProfile, provenance: raw.provenance, signals: interpreted.signals }, null, 2)}</pre>
          </details>
          <p className={styles.disclaimer}>Leitura simbólica e contemplativa. O sistema preserva provenance e não afirma certeza sobrenatural ou previsão infalível.</p>
        </section>
      )}
    </main>
  );
}
