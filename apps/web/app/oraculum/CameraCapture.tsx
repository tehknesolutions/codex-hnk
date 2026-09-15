'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { classifyRgb, rgbToHex, sampleNinePatches, type Rgb } from './camera-color-utils.mjs';
import styles from './camera-capture.module.css';

const FACE_ORDER = ['U', 'R', 'F', 'D', 'L', 'B'] as const;
type Face = (typeof FACE_ORDER)[number];
type Cell = number | null;

type Props = {
  faces: Record<Face, Cell[]>;
  setFaces: (updater: Record<Face, Cell[]> | ((current: Record<Face, Cell[]>) => Record<Face, Cell[]>)) => void;
  setColorHex: (updater: string[] | ((current: string[]) => string[])) => void;
};

type CapturedFace = Readonly<{ samples: ReadonlyArray<Rgb> }>;

export function CameraCapture({ faces, setFaces, setColorHex }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [activeFace, setActiveFace] = useState<Face>('U');
  const [captures, setCaptures] = useState<Partial<Record<Face, CapturedFace>>>({});
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [lowConfidence, setLowConfidence] = useState<string[]>([]);

  const captureCount = Object.keys(captures).length;
  const canClassify = FACE_ORDER.every(face => captures[face]?.samples?.length === 9);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  async function startCamera() {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Este navegador não oferece acesso de câmera. Use a captura manual V0.6.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setRunning(true);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Não foi possível acessar a câmera.');
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
  }

  function captureFace() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setCameraError('A câmera ainda não está pronta para captura.');
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return setCameraError('Canvas 2D indisponível.');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const samples = sampleNinePatches(image.data, image.width, image.height);
    setCaptures(current => ({ ...current, [activeFace]: Object.freeze({ samples }) }));
    const currentIndex = FACE_ORDER.indexOf(activeFace);
    const next = FACE_ORDER[currentIndex + 1];
    if (next) setActiveFace(next);
  }

  const prototypes = useMemo(() => {
    if (!canClassify) return null;
    return FACE_ORDER.map(face => captures[face]!.samples[4]);
  }, [canClassify, captures]);

  function applyCandidateTranscript() {
    if (!prototypes) return;
    const warnings: string[] = [];
    const nextFaces = { ...faces } as Record<Face, Cell[]>;
    FACE_ORDER.forEach((face, faceIndex) => {
      const samples = captures[face]!.samples;
      nextFaces[face] = samples.map((sample, cellIndex) => {
        if (cellIndex === 4) return faceIndex;
        const classified = classifyRgb(sample, prototypes);
        if (classified.confidence < 0.2) warnings.push(`${face}${cellIndex + 1}`);
        return classified.bestDigit;
      });
    });
    setFaces(nextFaces);
    setColorHex(prototypes.map(rgbToHex));
    setLowConfidence(warnings);
  }

  return (
    <details className={styles.details}>
      <summary>V0.7 · captura opcional pela câmera</summary>
      <div className={styles.cameraPanel}>
        <p>A câmera só sugere a transcrição. Revise manualmente as 54 casas antes de gerar o SHA.</p>
        <div className={styles.cameraControls}>
          <button type="button" onClick={running ? stopCamera : startCamera}>{running ? 'Desligar câmera' : 'Ativar câmera'}</button>
          <label>Face
            <select value={activeFace} onChange={event => setActiveFace(event.target.value as Face)}>
              {FACE_ORDER.map(face => <option key={face} value={face}>{face}</option>)}
            </select>
          </label>
          <button type="button" disabled={!running} onClick={captureFace}>Capturar {activeFace}</button>
        </div>
        <div className={styles.cameraStage}>
          <video ref={videoRef} playsInline muted className={styles.cameraVideo} />
          <div className={styles.cameraGuide} aria-hidden="true">
            {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
          </div>
        </div>
        <canvas ref={canvasRef} hidden />
        <div className={styles.captureStatus}>
          {FACE_ORDER.map(face => <span key={face} data-ready={Boolean(captures[face])}>{face} {captures[face] ? '✓' : '·'}</span>)}
        </div>
        <button type="button" disabled={!canClassify} onClick={applyCandidateTranscript}>Aplicar candidato das 6 faces ({captureCount}/6)</button>
        {lowConfidence.length > 0 && <p className={styles.cameraWarning}>Revise especialmente: {lowConfidence.join(', ')}. Baixa separação cromática não significa erro certo; é apenas um alerta de revisão.</p>}
        {cameraError && <p className={styles.error}>{cameraError}</p>}
      </div>
    </details>
  );
}
