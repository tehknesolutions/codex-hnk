'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  sealDay001V2,
  startDay001PracticeSessionV2,
} from '@hnk/supabase-client';
import { useWebDay001Runtime } from './WebDay001Runtime';
import { DAY001_CANON, DAY001_CANON_SOURCE_SHA } from './day001-canon-runtime';
import styles from './day001-golden-v2.module.css';

type Step = 'portal' | 'anchor' | 'kether' | 'jachin' | 'boaz' | 'middle' | 'mirror' | 'seal';
type Session = Awaited<ReturnType<typeof startDay001PracticeSessionV2>>;
type SuccessfulSeal = Extract<Awaited<ReturnType<typeof sealDay001V2>>, { ok: true }>['response'];
type Durations = { jachin: number; boaz: number; middle: number };

const STEPS: Step[] = ['portal', 'anchor', 'kether', 'jachin', 'boaz', 'middle', 'mirror', 'seal'];
const ANCHORS = [
  'Tenho uma referência clara',
  'Sinto isso, mas não sei definir',
  'Ainda estou procurando',
  'Prefiro apenas experimentar',
] as const;

function createSessionId(userId: string): string {
  return `hnk-web-d001-v2-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function Day001GoldenV2Web() {
  const runtime = useWebDay001Runtime();
  const [step, setStep] = useState<Step>('portal');
  const [anchor, setAnchor] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [durations, setDurations] = useState<Durations>({ jachin: 0, boaz: 0, middle: 0 });
  const [returns, setReturns] = useState({ jachin: false, boaz: false, middle: false });
  const [attentionReturns, setAttentionReturns] = useState(0);
  const [distractions, setDistractions] = useState(['', '', '']);
  const [intention, setIntention] = useState('');
  const [mirror, setMirror] = useState('');
  const [voluntary, setVoluntary] = useState(false);
  const [toneStarted, setToneStarted] = useState(false);
  const [tonePlaying, setTonePlaying] = useState(false);
  const [toneVolume, setToneVolume] = useState(0.04);
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const gain = useRef<GainNode | null>(null);
  const [canonVerified, setCanonVerified] = useState(false);
  const [canonState, setCanonState] = useState<'checking' | 'verified' | 'offline' | 'mismatch'>('checking');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sealed, setSealed] = useState<SuccessfulSeal | null>(null);

  const live = Boolean(runtime.configured && runtime.phase === 'signed-in' && runtime.client && runtime.userId);
  const current = STEPS.indexOf(step);
  const distractionCount = distractions.filter((value) => value.trim().length > 0).length;
  const totalDuration = durations.jachin + durations.boaz + durations.middle;
  const canSeal = Boolean(
    live && canonVerified && session && toneStarted && returns.jachin && returns.boaz && returns.middle &&
    durations.jachin > 0 && durations.boaz > 0 && durations.middle > 0 && distractionCount >= 3 && voluntary,
  );

  useEffect(() => {
    if (!live || !runtime.client) {
      setCanonVerified(false);
      setCanonState('offline');
      return;
    }
    let active = true;
    setCanonState('checking');
    void runtime.client
      .from('codex_days')
      .select('source_sha,status')
      .eq('day', 1)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (!active) return;
        if (queryError || !data || data.status !== 'canon' || data.source_sha !== DAY001_CANON_SOURCE_SHA) {
          setCanonVerified(false);
          setCanonState('mismatch');
          return;
        }
        setCanonVerified(true);
        setCanonState('verified');
      });
    return () => { active = false; };
  }, [live, runtime.client]);

  useEffect(() => {
    if (gain.current) gain.current.gain.value = toneVolume;
  }, [toneVolume]);

  useEffect(() => () => {
    const context = audioContext.current;
    oscillator.current = null;
    gain.current = null;
    audioContext.current = null;
    if (context && context.state !== 'closed') void context.close();
  }, []);

  async function ensureSession(): Promise<Session | null> {
    if (session) return session;
    if (!live || !runtime.client || !runtime.userId || !canonVerified) return null;
    const created = await startDay001PracticeSessionV2(runtime.client, {
      clientSessionId: createSessionId(runtime.userId),
      appVersion: '0.3.0-web-golden-v2',
    });
    setSession(created);
    return created;
  }

  async function advance(next: Step): Promise<void> {
    setError(null);
    try {
      if (next === 'jachin') await ensureSession();
      setStep(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'practice_session_start_failed');
    }
  }

  async function toggleTone(): Promise<void> {
    setError(null);
    try {
      let context = audioContext.current;
      if (!context) {
        context = new AudioContext();
        const source = context.createOscillator();
        const volume = context.createGain();
        source.type = 'sine';
        source.frequency.value = 528;
        volume.gain.value = toneVolume;
        source.connect(volume);
        volume.connect(context.destination);
        source.start();
        audioContext.current = context;
        oscillator.current = source;
        gain.current = volume;
        setToneStarted(true);
        setTonePlaying(true);
        return;
      }
      if (context.state === 'suspended') {
        await context.resume();
        setTonePlaying(true);
      } else if (context.state === 'running') {
        await context.suspend();
        setTonePlaying(false);
      }
    } catch (cause) {
      setTonePlaying(false);
      setError(cause instanceof Error ? cause.message : 'ritual_tone_failed');
    }
  }

  function safetyStop(): void {
    const context = audioContext.current;
    if (context?.state === 'running') void context.suspend();
    setTonePlaying(false);
    setError('Prática interrompida com segurança. O conteúdo privado permaneceu somente neste navegador.');
  }

  async function seal(): Promise<void> {
    if (!runtime.client || !session || !canSeal) return;
    setBusy(true);
    setError(null);
    try {
      if (audioContext.current?.state === 'running') await audioContext.current.suspend();
      setTonePlaying(false);
      const result = await sealDay001V2(runtime.client, {
        evidence: {
          sessionId: session.id,
          mode: 'first_completion',
          jachin: { durationSeconds: durations.jachin, attentionReturns },
          ritualTone528: { stoppedForDiscomfort: false },
          boaz: { durationSeconds: durations.boaz, environmentDistractionsCount: distractionCount },
          middle: { durationSeconds: durations.middle, voiceRecorded: false },
          soulMirror: {},
        },
        totalDurationSeconds: totalDuration,
        attentionReturns,
      });
      if (!result.ok) throw new Error(result.code);
      setSealed(result.response);
      setIntention('');
      setMirror('');
      setDistractions(['', '', '']);
      setAnchor(null);
      setStep('seal');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'day001_completion_failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.shell} data-hnk-theme="kether">
      <header className={styles.header}>
        <div><span>HNK CODEX · DIA 001</span><strong>KETHER</strong></div>
        <div className={styles.canonState} data-state={canonState}>
          {canonState === 'verified' ? 'CANON SHA VERIFICADO' : canonState === 'checking' ? 'VALIDANDO CANON…' : canonState === 'offline' ? 'OFFLINE / DEMO' : 'CANON DIVERGENTE'}
        </div>
      </header>
      <div className={styles.progress}>{STEPS.map((id, index) => <i key={id} data-on={index <= current} />)}</div>
      {error ? <div className={styles.error}>{error}</div> : null}

      {step === 'portal' ? <Panel>
        <Eyebrow>O PRIMEIRO LIMIAR</Eyebrow>
        <h1>A Coroa antes da forma.</h1>
        <p className={styles.lead}>Antes da primeira forma, existe um ponto. Antes da primeira palavra, existe atenção.</p>
        <System>Não precisa saber. Não precisa sentir algo especial. Você mantém o controle. Observe antes de interpretar.</System>
        <Action onClick={() => void advance('anchor')}>ACEITO EXPERIMENTAR</Action>
      </Panel> : null}

      {step === 'anchor' ? <Panel>
        <Eyebrow>ÂNCORA DE SIGNIFICADO · PRIVADA</Eyebrow>
        <h2>Existe algo que represente para você aquilo que é maior, verdadeiro ou sagrado?</h2>
        <div className={styles.choices}>{ANCHORS.map((choice) => <button key={choice} type="button" data-active={anchor === choice} onClick={() => setAnchor(choice)}>{anchor === choice ? '●' : '○'} {choice}</button>)}</div>
        <System>Esta escolha permanece local e não altera XP, Grade, protocolo, atributo ou acesso.</System>
        <Action disabled={!anchor} onClick={() => void advance('kether')}>CONTINUAR</Action>
      </Panel> : null}

      {step === 'kether' ? <Panel>
        <div className={styles.crown} aria-hidden="true"><i /><b>●</b><i /></div>
        <Eyebrow>COROA → KETHER</Eyebrow>
        <h1>O ponto anterior à forma.</h1>
        <p className={styles.lead}>Kether é apresentado aqui como a Coroa: origem, possibilidade e atenção antes da definição.</p>
        <div className={styles.meta}><span><small>MUNDO</small>ATZILUTH</span><span><small>ANJO</small>VEHUIAH</span><span><small>GRAU</small>NEÓFITO</span></div>
        <Action disabled={live && !canonVerified} onClick={() => void advance('jachin')}>{live ? 'ENTRAR EM JACHIN' : 'ENTRAR EM JACHIN · DEMO'}</Action>
      </Panel> : null}

      {step === 'jachin' ? <Panel>
        <Eyebrow>JACHIN · EXPANSÃO</Eyebrow>
        <Canon title="DOUTRINA">{DAY001_CANON.jachinDoctrine}</Canon>
        <Canon title="KAVANAH">{DAY001_CANON.jachinKavanah}</Canon>
        <Canon title="ORDÁLIA">{DAY001_CANON.jachinOrdalia}</Canon>
        <div className={styles.instrument}>
          <h3>Tom ritual · 528 Hz</h3>
          <System>Operador canônico do Day 001. Início manual, onda senoidal local e volume sob seu controle. Nenhum Theta/432 é inventado.</System>
          <div className={styles.toneControls}>
            <button type="button" onClick={() => void toggleTone()}>{tonePlaying ? 'PAUSAR 528' : toneStarted ? 'RETOMAR 528' : 'INICIAR 528'}</button>
            <label>VOLUME <input type="range" min="0" max="0.12" step="0.01" value={toneVolume} onChange={(event) => setToneVolume(Number(event.target.value))} /></label>
          </div>
        </div>
        <PracticeTimer target={600} label="FOCO · 10 MIN" onCommit={(seconds) => setDurations((value) => ({ ...value, jachin: seconds }))} />
        <button className={styles.returnCounter} type="button" onClick={() => setAttentionReturns((value) => value + 1)}>PERCEBI E VOLTEI · {attentionReturns}</button>
        {durations.jachin > 0 ? <ReturnGate confirmed={returns.jachin} onConfirm={() => setReturns((value) => ({ ...value, jachin: true }))} /> : null}
        <Action disabled={!toneStarted || !returns.jachin} onClick={() => void advance('boaz')}>ENTRAR EM BOAZ</Action>
        <Safety onStop={safetyStop} />
      </Panel> : null}

      {step === 'boaz' ? <Panel>
        <Eyebrow>BOAZ · ESTRUTURA</Eyebrow>
        <Canon title="DOUTRINA">{DAY001_CANON.boazDoctrine}</Canon>
        <Canon title="KAVANAH">{DAY001_CANON.boazKavanah}</Canon>
        <System>A frase canônica acima é preservada como fonte. Na prática do produto, não force os olhos, não tente provar paralisia e não transforme desconforto em meta. Você mantém o controle e pode encerrar.</System>
        <PracticeTimer target={300} label="RELAXAMENTO · 5 MIN" onCommit={(seconds) => setDurations((value) => ({ ...value, boaz: seconds }))} />
        <Canon title="ORDÁLIA">{DAY001_CANON.boazOrdalia}</Canon>
        <div className={styles.inputs}>{distractions.map((value, index) => <textarea key={index} value={value} onChange={(event) => setDistractions((items) => items.map((item, i) => i === index ? event.target.value : item))} placeholder={`Distração ${index + 1} · permanece local`} />)}</div>
        <System>Somente a contagem “3” entra na Evidence. O conteúdo das distrações não é enviado.</System>
        {durations.boaz > 0 ? <ReturnGate confirmed={returns.boaz} onConfirm={() => setReturns((value) => ({ ...value, boaz: true }))} /> : null}
        <Action disabled={!returns.boaz || distractionCount < 3} onClick={() => void advance('middle')}>CONVERGIR OS PILARES</Action>
        <Safety onStop={safetyStop} />
      </Panel> : null}

      {step === 'middle' ? <Panel>
        <Eyebrow>PILAR DO MEIO · CONVERGÊNCIA</Eyebrow>
        <Canon title="DOUTRINA">{DAY001_CANON.middleDoctrine}</Canon>
        <Canon title="KAVANAH">{DAY001_CANON.middleKavanah}</Canon>
        <System>Experiência primeiro: vocalização livre. Termo formal: Glossolália. Nenhum microfone, gravação, transcrição, interpretação espiritual automática ou upload é necessário.</System>
        <PracticeTimer target={180} label="VOCALIZAÇÃO · 3 MIN" onCommit={(seconds) => setDurations((value) => ({ ...value, middle: seconds }))} />
        <div className={styles.canonConflict}><strong>CANON EM RECONCILIAÇÃO EDITORIAL</strong><p>{DAY001_CANON.middleOrdalia}</p><small>O runtime preserva o texto-fonte, mas NÃO aplica gravação obrigatória nem XP extra. O único XP válido do Day 001 é o +150 autoritativo do servidor.</small></div>
        {durations.middle > 0 ? <ReturnGate confirmed={returns.middle} onConfirm={() => setReturns((value) => ({ ...value, middle: true }))} /> : null}
        <Action disabled={!returns.middle} onClick={() => void advance('mirror')}>ABRIR O ESPELHO</Action>
        <Safety onStop={safetyStop} />
      </Panel> : null}

      {step === 'mirror' ? <Panel>
        <Eyebrow>ESPELHO DA ALMA · PRIVADO</Eyebrow>
        <Canon title="FONTE">{DAY001_CANON.soulMirror}</Canon>
        <label className={styles.field}>INTENÇÃO / ÂNCORA<textarea value={intention} onChange={(event) => setIntention(event.target.value)} placeholder="Opcional · permanece apenas neste navegador" /></label>
        <label className={styles.field}>NO SILÊNCIO EU PERCEBI…<textarea value={mirror} onChange={(event) => setMirror(event.target.value)} placeholder="Opcional · permanece apenas neste navegador" /></label>
        <System>O Web ainda não sincroniza plaintext nem Vault íntimo. Estes textos não entram na Evidence e são apagados da memória da tela após o selo.</System>
        <div className={styles.correspondences}><span>KETHER<small>Cabala / HNK</small></span><span>ATZILUTH<small>Mundo</small></span><span>VEHUIAH<small>Ciclo</small></span><span>O LOUCO<small>Correspondência</small></span><span>FEHU<small>Correspondência</small></span><span>HEXAGRAMA 1<small>Correspondência</small></span></div>
        <button className={styles.voluntary} data-active={voluntary} type="button" onClick={() => setVoluntary((value) => !value)}>{voluntary ? '●' : '○'} CONFIRMO A CONCLUSÃO VOLUNTÁRIA</button>
        <Action disabled={!canSeal || busy} onClick={() => void seal()}>{busy ? 'SELANDO…' : live ? 'SELAR DIA 001 NO SERVIDOR' : 'SELO CANÔNICO EXIGE LOGIN/SYNC'}</Action>
      </Panel> : null}

      {step === 'seal' ? <Panel>
        <div className={styles.spark} aria-hidden="true">●</div>
        <Eyebrow>PRIMEIRA CENTELHA · ESTADO DO SERVIDOR</Eyebrow>
        <h1>Agora existe uma luz.</h1>
        <div className={styles.reward}>{sealed?.first_completion ? `+${sealed.xp_awarded} XP` : 'XP JÁ SELADO'}</div>
        <p className={styles.lead}>1 de 36 travessias de Kether registrada. Vehuiah: 1/5. O Fragmento I continua reservado ao Dia 005.</p>
        <System>{sealed ? `Contrato ${sealed.completion_contract_id} · ${sealed.server_completed_at}` : 'Sem resposta autoritativa.'}</System>
        <div className={styles.events}>{sealed?.progression_events.map((event) => <span key={event}>{event}</span>)}</div>
      </Panel> : null}

      <footer className={styles.footer}><span>QUEST HNK-KETHER-D001-V2</span><span>CANON {DAY001_CANON_SOURCE_SHA.slice(0, 10)}</span><span>{session ? `SESSION ${session.id.slice(0, 8)}` : 'NO SESSION'}</span>{live ? <button type="button" onClick={() => void runtime.signOut()}>SAIR</button> : null}</footer>
    </main>
  );
}

function PracticeTimer({ target, label, onCommit }: { target: number; label: string; onCommit: (seconds: number) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [committed, setCommitted] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  const remaining = Math.max(0, target - elapsed);
  return <div className={styles.timer}>
    <span>{label}</span><strong>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</strong>
    <small>Meta canônica {Math.round(target / 60)} min · a Evidence registra o tempo realmente praticado.</small>
    <div><button type="button" onClick={() => setRunning((value) => !value)}>{running ? 'PAUSAR' : elapsed ? 'RETOMAR' : 'INICIAR'}</button><button type="button" disabled={!elapsed || committed} onClick={() => { setRunning(false); setCommitted(true); onCommit(elapsed); }}>{committed ? 'REGISTRADO' : 'CONCLUIR PRÁTICA'}</button></div>
  </div>;
}

function ReturnGate({ confirmed, onConfirm }: { confirmed: boolean; onConfirm: () => void }) {
  return <div className={styles.returnGate}><strong>RETORNO</strong><p>Respire normalmente. Mova mãos e pés. Abra os olhos quando desejar e oriente-se ao ambiente.</p><button type="button" data-active={confirmed} onClick={onConfirm}>{confirmed ? '● RETORNO CONFIRMADO' : '○ ESTOU PRESENTE E QUERO CONTINUAR'}</button></div>;
}
function Safety({ onStop }: { onStop: () => void }) { return <button className={styles.safety} type="button" onClick={onStop}>PAUSAR / ENCERRAR COM SEGURANÇA</button>; }
function Panel({ children }: { children: ReactNode }) { return <section className={styles.panel}>{children}</section>; }
function Eyebrow({ children }: { children: ReactNode }) { return <p className={styles.eyebrow}>{children}</p>; }
function System({ children }: { children: ReactNode }) { return <div className={styles.system}>{children}</div>; }
function Canon({ title, children }: { title: string; children: ReactNode }) { return <article className={styles.canon}><span>CANON · {title}</span><p>{children}</p></article>; }
function Action({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) { return <button className={styles.action} type="button" disabled={disabled} onClick={onClick}>{children}</button>; }
