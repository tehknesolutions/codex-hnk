'use client';

import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { CameraCapture } from '../CameraCapture';
import styles from './camera.module.css';

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

const DEFAULT_COLORS = ['#f5f5f2', '#d94848', '#34a853', '#f2cf3a', '#e8892f', '#3f65d9'];

function blankCube(): Record<Face, Cell[]> {
  return FACE_ORDER.reduce((acc, face, faceIndex) => {
    const cells: Cell[] = Array(9).fill(null);
    cells[4] = faceIndex;
    acc[face] = cells;
    return acc;
  }, {} as Record<Face, Cell[]>);
}

export function CameraConsultationClient() {
  const [faces, setFaces] = useState<Record<Face, Cell[]>>(() => blankCube());
  const [colorHex, setColorHex] = useState(DEFAULT_COLORS);
  const [activeDigit, setActiveDigit] = useState(0);
  const [intent, setIntent] = useState('');
  const [mode, setMode] = useState<'STATE' | 'RITUAL_32'>('STATE');
  const [moves, setMoves] = useState('');
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ConsultationResponse | null>(null);

  const flattened = useMemo(() => FACE_ORDER.flatMap(face => faces[face]), [faces]);
  const counts = useMemo(() => Array.from({ length: 6 }, (_, digit) => flattened.filter(cell => cell === digit).length), [flattened]);
  const complete = flattened.every(cell => cell !== null);
  const balanced = counts.every(count => count === 9);
  const cubeState = complete ? flattened.join('') : '';
  const moveCount = moves.trim() ? moves.trim().split(/\s+/u).length : 0;

  function updateFaces(updater: Record<Face, Cell[]> | ((current: Record<Face, Cell[]>) => Record<Face, Cell[]>)) {
    setFaces(current => typeof updater === 'function' ? updater(current) : updater);
    setReviewConfirmed(false);
    setResponse(null);
  }

  function paint(face: Face, index: number) {
    if (index === 4) return;
    updateFaces(current => ({
      ...current,
      [face]: current[face].map((cell, cellIndex) => cellIndex === index ? activeDigit : cell),
    }));
  }

  function reset() {
    setFaces(blankCube());
    setColorHex(DEFAULT_COLORS);
    setReviewConfirmed(false);
    setResponse(null);
    setError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setResponse(null);
    if (!intent.trim()) return setError('Escreva a intenção/Alef da consulta.');
    if (!complete) return setError('Complete ou corrija todas as 54 casas.');
    if (!balanced) return setError(`A transcrição final precisa ter 9 casas de cada dígito. Atual: ${counts.join(', ')}.`);
    if (!reviewConfirmed) return setError('Confirme a revisão humana das 54 casas antes do SHA.');
    if (mode === 'RITUAL_32' && moveCount !== 32) return setError(`RITUAL_32 exige 32 movimentos. Atual: ${moveCount}.`);

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
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Falha desconhecida');
    } finally {
      setBusy(false);
    }
  }

  const raw = response?.raw;
  const interpretation = response?.interpretation;

  return (
    <main className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>HOC · CAMERA V0.7 CANDIDATE</p>
          <h1>Captura assistida do cubo real</h1>
          <p>Fotografe as seis faces, aceite apenas como candidato, corrija manualmente e só então gere o HOC-256.</p>
        </div>
        <Link href="/oraculum">Usar captura manual V0.6</Link>
      </header>

      <form onSubmit={submit} className={styles.flow}>
        <section className={styles.card}>
          <h2>1 · Capture as seis faces</h2>
          <p className={styles.muted}>Use a orientação HOC-FACELET-SCAN-V1. A imagem permanece no navegador; o endpoint recebe somente a transcrição final.</p>
          <CameraCapture faces={faces} setFaces={updateFaces} setColorHex={setColorHex} />
        </section>

        <section className={styles.card}>
          <div className={styles.sectionHead}>
            <div><h2>2 · Revise as 54 casas</h2><p className={styles.muted}>A câmera não tem autoridade final. Escolha um dígito e corrija qualquer adesivo.</p></div>
            <button type="button" onClick={reset}>Reiniciar</button>
          </div>

          <div className={styles.palette}>
            {FACE_ORDER.map((face, digit) => (
              <button key={face} type="button" className={activeDigit === digit ? styles.activeColor : ''} onClick={() => setActiveDigit(digit)}>
                <i style={{ background: colorHex[digit] }} /> {digit} · {face} <small>{counts[digit]}/9</small>
              </button>
            ))}
          </div>

          <div className={styles.faces}>
            {FACE_ORDER.map((face, faceIndex) => (
              <article key={face} className={styles.facePanel}>
                <header><strong>{face}</strong><span>centro {faceIndex}</span></header>
                <div className={styles.grid}>
                  {faces[face].map((cell, index) => (
                    <button
                      key={`${face}-${index}`}
                      type="button"
                      disabled={index === 4}
                      className={index === 4 ? styles.center : styles.sticker}
                      onClick={() => paint(face, index)}
                      style={{ background: cell === null ? undefined : colorHex[cell] }}
                    >{cell ?? '·'}</button>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className={complete && balanced ? styles.valid : styles.invalid}>
            {complete ? (balanced ? '✓ 54/54 e 9 de cada dígito.' : `Contagens: ${counts.join(' · ')}`) : `${flattened.filter(cell => cell !== null).length}/54 preenchidas.`}
          </div>

          <label className={styles.review}>
            <input type="checkbox" checked={reviewConfirmed} disabled={!complete || !balanced} onChange={event => setReviewConfirmed(event.target.checked)} />
            <span>Revisei visualmente todas as 54 casas e confirmo esta transcrição como entrada do hash.</span>
          </label>

          <label className={styles.transcript}>Transcrição final U→R→F→D→L→B
            <textarea readOnly value={cubeState || 'Aguardando 54 casas…'} rows={3} />
          </label>
        </section>

        <section className={styles.card}>
          <h2>3 · Alef, modo e consulta</h2>
          <label>Intenção / pergunta
            <textarea value={intent} onChange={event => setIntent(event.target.value)} rows={3} placeholder="Qual padrão precisa se manifestar?" />
          </label>
          <div className={styles.modes}>
            <button type="button" className={mode === 'STATE' ? styles.modeActive : ''} onClick={() => setMode('STATE')}>STATE</button>
            <button type="button" className={mode === 'RITUAL_32' ? styles.modeActive : ''} onClick={() => setMode('RITUAL_32')}>RITUAL_32</button>
          </div>
          {mode === 'RITUAL_32' && <label>Movimentos Singmaster · {moveCount}/32<textarea value={moves} onChange={event => setMoves(event.target.value)} rows={4} /></label>}
          <button className={styles.submit} type="submit" disabled={busy}>{busy ? 'Decodificando…' : 'Gerar HOC-256 após revisão'}</button>
          {error && <p className={styles.error}>{error}</p>}
        </section>
      </form>

      {raw && interpretation && (
        <section className={styles.result}>
          <p className={styles.kicker}>RAW V0.4 PRESERVADO</p>
          <h2>{raw.hnk.glyphId} · Path {raw.path32.index}</h2>
          <code>{raw.raw.seed256}</code>
          <div className={styles.resultGrid}>
            <article><small>I Ching</small><strong>{raw.iching.primary.kingWen} → {raw.iching.resulting.kingWen}</strong><span>móveis {raw.iching.movingLines.join(', ') || 'nenhuma'}</span></article>
            <article><small>Tarot</small><strong>{raw.tarot.cardIndex}</strong><span>{interpretation.tarot?.kind === 'MINOR' ? `${interpretation.tarot.rank} of ${interpretation.tarot.suit}` : interpretation.tarot?.tarot}</span></article>
            <article><small>Astrologia</small><strong>{raw.astrology.zodiac}</strong><span>{raw.astrology.planet} · {raw.astrology.element}</span></article>
            <article><small>Alquimia</small><strong>{raw.alchemy.principle}</strong><span>{raw.alchemy.phase}</span></article>
          </div>
          <h3>Convergências</h3>
          {interpretation.convergences?.length ? interpretation.convergences.map((item: any) => <p key={item.id}>{item.id} · score {item.score} · {item.families.join(' + ')}</p>) : <p>Nenhuma convergência independente.</p>}
          <h3>Tensões</h3>
          {interpretation.tensions?.length ? interpretation.tensions.map((item: any) => <p key={item.axis}>{item.axis} · {item.left.score}:{item.right.score}</p>) : <p>Nenhuma tensão ativa.</p>}
          <p className={styles.disclaimer}>Captura de câmera = assistência de transcrição. A revisão humana é parte obrigatória do protocolo V0.7.</p>
        </section>
      )}
    </main>
  );
}
