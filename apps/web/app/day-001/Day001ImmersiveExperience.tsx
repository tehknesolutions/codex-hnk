'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { startPracticeSession, type PracticeSessionRecord } from '@hnk/supabase-client';
import { useWebDay001Runtime } from './WebDay001Runtime';
import styles from './day001-immersive.module.css';

type CanonBlocks = {
  jachinDoctrine: string;
  jachinKavanah: string;
  boazDoctrine: string;
  boazKavanah: string;
  boazOrdalia: string;
  middleDoctrine: string;
  middleKavanah: string;
  middleOrdalia: string;
};

type LiveCanon = {
  sourceSha: string;
  rawMarkdown: string;
  blocks: CanonBlocks;
};

const FALLBACK: CanonBlocks = {
  jachinDoctrine: 'No primeiro dia da sua travessia, você depara-se com o abismo silencioso de Kether, a Coroa inacessível onde a existência repousa antes de qualquer forma. Aqui não há pensamentos, conceitos ou imagens; existe apenas a pulsação pura da Vida Zoe, o sopro divino incriado que sustenta a realidade inteira. O Louco ergue o seu bastão à beira do precipício, convidando-o a dar o salto de fé em direção ao absoluto esvaziamento da mente lógica. Para que a luz perpétua possa preencher o seu templo, a sua Psuche deve render-se de forma voluntária ao silêncio. Esqueça tudo o que aprendeu; apague as definições mundanas e as amarras intelectuais que limitam a sua percepção espiritual. Hoje, sintonizamos o símbolo mestre Dai Koo Myo, abrindo todos os canais sutis para receber a torrente ilimitada do Espírito Santo na terra sagrada.',
  jachinKavanah: 'Sente-se em postura ereta, respirando de forma profunda e pausada. Feche os olhos e visualize o símbolo Dai Koo Myo brilhando em ouro incandescente no topo da sua cabeça. Sinta a luz fluir para baixo, inundando o seu cérebro e silenciando o fluxo de palavras. Mantenha o foco fixo nesse ponto de luz por dez minutos, permitindo que a sua consciência se expanda até fundir-se com o vazio primordial divino e eterno.',
  boazDoctrine: 'A descida da força exige um vaso purificado e estruturado sob as leis do Rigor. No pilar de Boaz, compreendemos que a mente racional é o guardião cioso que impede o livre fluxo da verdade interior. O Fator Crítico ergue barreiras lógicas para proteger o ego decaído, mantendo-o preso aos condicionamentos mundanos da carne. Para desarmar essa fortaleza sem gerar conflito biológico, aplicamos o método de auto-hipnose de Dave Elman, provocando a fadiga pálpebral e o relaxamento muscular profundo. Esta restrição voluntária desliga a tagarelice da Psuche e prepara o terreno biológico para o descanso onírico consciente. O silêncio físico é o selo que protege a sua bioenergia das larvas e dispersões do cotidiano. Guarde a sua mente com severidade, eliminando todas as distrações, dúvidas, medos e ruídos desnecessários que tentarem invadir o seu próprio templo sagrado.',
  boazKavanah: 'Deite-se confortavelmente em um quarto totalmente escuro e silencioso. Force o relaxamento completo dos músculos ao redor dos seus olhos, certificando-se de que é impossível abrir as pálpebras de forma voluntária. Transfira essa sensação de paralisia muscular para o resto do corpo, descendo em transe profundo por cinco minutos. Ao final, determine mentalmente que todos os seus sonhos desta noite serão recordados com nitidez absoluta no seu próprio diário de bordo pessoal.',
  boazOrdalia: 'Escreva agora no seu diário de bordo digital as três principais distrações do seu ambiente físico que você irá banir e afastar a partir de hoje.',
  middleDoctrine: 'No pilar central de Tiphereth, os extremos se encontram para selar a aliança eterna entre a força e a forma. A energia do Arcano do Louco fertiliza a terra árida com a riqueza espiritual de Fehu, o fogo do Hexagrama 1 que inicia o ciclo da criação cósmica. Para fundir a expansão de Jachin com o rigor de Boaz, recorremos à glossolália espiritual como um atalho neurológico de alta performance. Ao emitir sons desprovidos de sentido lógico, você desliga o hemisfério esquerdo e permite que a Vida Zoe jorre sem filtros intelectuais sobre o seu sistema nervoso. O equilíbrio reside na união da disciplina corporal com a liberdade do espírito. O Mestre e o discípulo se tornam um só no centro geométrico do seu próprio templo de oração e do poder supremo da sua consciência divina ativa.',
  middleKavanah: 'Respire ritmadamente em quatro tempos. Em estado de transe leve, comece a vocalizar sons rápidos, rítmicos e sem lógica racional por três minutos contínuos. Não tente controlar a pronúncia; deixe que a sua laringe vibre livremente, expressando a energia sutil do seu subconsciente. Sinta o calor bioenergético subir pela sua coluna vertebral, acendendo um sol dourado e brilhante no centro geométrico do seu próprio peito no plano sutil totalmente divino e maravilhoso.',
  middleOrdalia: 'Valide agora o seu primeiro registro vocal de glossolália no cofre criptografado do aplicativo HNK para receber mais cento e cinquenta pontos de experiência do Codex.',
};

const ACTS = [
  { id: 'limiar', roman: 'I', label: 'Limiar' },
  { id: 'revelacao', roman: 'II', label: 'Revelação' },
  { id: 'jachin', roman: 'III', label: 'Expansão' },
  { id: 'boaz', roman: 'IV', label: 'Restrição' },
  { id: 'meio', roman: 'V', label: 'Convergência' },
  { id: 'selo', roman: 'VI', label: 'Passagem' },
] as const;

const SYMBOL_KEYS = [
  { id: 'louco', mark: '0', title: 'O Louco', subtitle: 'O salto', text: 'No texto canônico, O Louco aparece à beira do precipício como imagem do salto de fé e da entrada no desconhecido de Kether.' },
  { id: 'fehu', mark: 'ᚠ', title: 'Fehu', subtitle: 'A força fecundante', text: 'No Pilar do Meio, Fehu é associado à riqueza espiritual que fertiliza a experiência e participa da união entre força e forma.' },
  { id: 'iching', mark: '☰', title: 'Hexagrama 1', subtitle: 'O Criativo', text: 'O Hexagrama 1 é apresentado como fogo iniciador do ciclo da criação cósmica — uma chave de começo, potência e emanação.' },
] as const;

function between(source: string, start: string, end: string): string | null {
  const a = source.indexOf(start);
  if (a < 0) return null;
  const b = source.indexOf(end, a + start.length);
  if (b < 0) return null;
  return source.slice(a + start.length, b).trim();
}

function parseBlocks(markdown: string): CanonBlocks | null {
  const take = (name: string) => between(markdown, `<!-- HNK:COUNT START ${name}`, '<!-- HNK:COUNT END -->')?.replace(/^target=\d+\s*-->/, '').trim() ?? null;
  const values = {
    jachinDoctrine: take('jachin-doctrine'),
    jachinKavanah: take('jachin-kavanah'),
    boazDoctrine: take('boaz-doctrine'),
    boazKavanah: take('boaz-kavanah'),
    boazOrdalia: take('boaz-ordalia'),
    middleDoctrine: take('middle-doctrine'),
    middleKavanah: take('middle-kavanah'),
    middleOrdalia: take('middle-ordalia'),
  };
  if (Object.values(values).some((value) => !value)) return null;
  return values as CanonBlocks;
}

function createSessionId(userId: string) {
  return `hnk-web-d001-v2-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function RitualTimer({ seconds, label }: { seconds: number; label: string }) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, remaining]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = 1 - remaining / seconds;

  return (
    <div className={styles.timer} style={{ '--timer-progress': `${progress * 360}deg` } as React.CSSProperties}>
      <div className={styles.timerRing}>
        <div>
          <strong>{String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}</strong>
          <small>{label}</small>
        </div>
      </div>
      <div className={styles.timerActions}>
        <button type="button" onClick={() => setRunning((value) => !value)}>{running ? 'PAUSAR' : remaining === seconds ? 'INICIAR' : 'CONTINUAR'}</button>
        <button type="button" onClick={() => { setRunning(false); setRemaining(seconds); }}>REINICIAR</button>
      </div>
      <p>Você pode encerrar antes. A prática não recompensa desconforto, perda de controle ou intensidade subjetiva.</p>
    </div>
  );
}

function Manuscript({ label, title, text, tone }: { label: string; title: string; text: string; tone: 'expansion' | 'restriction' | 'middle' }) {
  return (
    <article className={`${styles.manuscript} ${styles[tone]}`}>
      <header><span>{label}</span><i /></header>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function Day001ImmersiveExperience() {
  const runtime = useWebDay001Runtime();
  const [act, setAct] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string>('louco');
  const [canon, setCanon] = useState<LiveCanon | null>(null);
  const [practice, setPractice] = useState<PracticeSessionRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [intention, setIntention] = useState('');
  const [mirror, setMirror] = useState('');
  const [contract, setContract] = useState(false);
  const [distractions, setDistractions] = useState(['', '', '']);
  const [voiceActive, setVoiceActive] = useState(false);
  const [micState, setMicState] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [localSeal, setLocalSeal] = useState(false);
  const topRef = useRef<HTMLDivElement | null>(null);

  const live = Boolean(runtime.configured && runtime.phase === 'signed-in' && runtime.client && runtime.userId);
  const blocks = canon?.blocks ?? FALLBACK;
  const currentKey = SYMBOL_KEYS.find((key) => key.id === selectedKey) ?? SYMBOL_KEYS[0];
  const completionReady = contract && intention.trim().length > 0 && mirror.trim().length > 0 && distractions.every((value) => value.trim().length > 0);

  useEffect(() => {
    if (!live || !runtime.client) return;
    let active = true;
    void runtime.client
      .from('codex_days')
      .select('day,source_sha,content')
      .eq('day', 1)
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data || typeof data.source_sha !== 'string') {
          setRuntimeError('O dataset canônico não pôde ser validado. A experiência permanece em fallback educacional local.');
          return;
        }
        const content = typeof data.content === 'object' && data.content !== null ? data.content as Record<string, unknown> : null;
        const raw = content?.raw_markdown;
        if (typeof raw !== 'string') return;
        const parsed = parseBlocks(raw);
        if (!parsed) return;
        setCanon({ sourceSha: data.source_sha, rawMarkdown: raw, blocks: parsed });
      });
    return () => { active = false; };
  }, [live, runtime.client]);

  async function enterPractice() {
    if (!live || !runtime.client || !runtime.userId || practice) return;
    setBusy(true);
    setRuntimeError(null);
    try {
      const session = await startPracticeSession(runtime.client, {
        day: 1,
        clientSessionId: createSessionId(runtime.userId),
        mode: 'canonical',
        appVersion: '0.2.0-web-immersive',
      });
      setPractice(session);
    } catch {
      setRuntimeError('Não foi possível abrir a Practice Session. O conteúdo continua disponível em modo de leitura/prática local.');
    } finally {
      setBusy(false);
    }
  }

  function moveTo(next: number) {
    setAct(Math.max(0, Math.min(ACTS.length - 1, next)));
    window.requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  async function requestMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicState('denied');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicState('granted');
      setVoiceActive(true);
    } catch {
      setMicState('denied');
    }
  }

  const actId = ACTS[act].id;

  return (
    <main className={styles.shell} data-hnk-theme="kether" data-act={actId} ref={topRef}>
      <div className={styles.atmosphere} aria-hidden="true"><i /><i /><i /></div>

      <header className={styles.hud}>
        <div className={styles.brand}><span>HNK CODEX</span><strong>DIA 001 · KETHER</strong></div>
        <nav className={styles.ritualMap} aria-label="Mapa ritual do Dia 001">
          {ACTS.map((item, index) => (
            <button key={item.id} type="button" data-active={index === act} data-complete={index < act} onClick={() => index <= act ? moveTo(index) : undefined} aria-label={`${item.roman}. ${item.label}`}>
              <i>{item.roman}</i><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className={styles.runtimeState}>
          <span>{live ? 'CANON LIVE' : 'PROOF / OFFLINE'}</span>
          {canon ? <small>SOURCE {canon.sourceSha.slice(0, 10)}</small> : <small>FALLBACK EDUCACIONAL</small>}
        </div>
      </header>

      {runtimeError ? <div className={styles.runtimeError}>{runtimeError}</div> : null}

      {actId === 'limiar' ? (
        <section className={`${styles.act} ${styles.thresholdAct}`}>
          <div className={styles.cosmos} aria-hidden="true"><div className={styles.originPoint} /><div className={styles.originRing} /><div className={styles.originAxis} /></div>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>I · LIMIAR</p>
            <h1>Antes da forma,<br /><em>uma possibilidade.</em></h1>
            <p>Você não abriu uma lição. Você chegou ao primeiro limiar de Kether — a Coroa, em Atziluth, sob o ciclo de Vehuiah.</p>
            <div className={styles.thresholdMeta}>
              <span><small>SEPHIRA</small>KETHER</span><span><small>MUNDO</small>ATZILUTH</span><span><small>ANJO</small>VEHUIAH</span><span><small>GRAU</small>NEÓFITO</span>
            </div>
            <div className={styles.actions}>
              <button className={styles.primary} type="button" onClick={() => { void enterPractice(); moveTo(1); }} disabled={busy}>{busy ? 'ABRINDO A CÂMARA…' : 'ATRAVESSAR O LIMIAR'}</button>
              <a href="#manuscrito">LER SEM INICIAR PRÁTICA</a>
            </div>
          </div>
        </section>
      ) : null}

      {actId === 'revelacao' ? (
        <section className={`${styles.act} ${styles.revelationAct}`}>
          <header className={styles.actHeader}><p className={styles.kicker}>II · REVELAÇÃO</p><h2>Três chaves para compreender o começo.</h2><p>Antes da prática, o Codex apresenta a constelação simbólica que o próprio Dia 001 usa para pensar origem, potência e criação.</p></header>
          <div className={styles.symbolStage}>
            <div className={styles.symbolKeys}>
              {SYMBOL_KEYS.map((key) => <button key={key.id} type="button" data-selected={key.id === selectedKey} onClick={() => setSelectedKey(key.id)}><b>{key.mark}</b><span><strong>{key.title}</strong><small>{key.subtitle}</small></span></button>)}
            </div>
            <article className={styles.symbolMeaning}><span className={styles.giantMark}>{currentKey.mark}</span><p className={styles.kicker}>CHAVE ATIVA</p><h3>{currentKey.title}</h3><p>{currentKey.text}</p><small>Leitura derivada do texto canônico do Dia 001; não é uma definição universal dessas tradições.</small></article>
          </div>
          <div className={styles.epistemicRibbon}><strong>HNK-EP</strong><span>Experiência espiritual, símbolo tradicional e sensação subjetiva permanecem distinguíveis de afirmação científica ou biomédica.</span></div>
          <div className={styles.actions}><button className={styles.primary} type="button" onClick={() => moveTo(2)}>ABRIR O MANUSCRITO</button></div>
        </section>
      ) : null}

      {actId === 'jachin' ? (
        <section className={`${styles.act} ${styles.jachinAct}`} id="manuscrito">
          <header className={styles.actHeader}><p className={styles.kicker}>III · JACHIN · EXPANSÃO</p><h2>O conhecimento primeiro é lido.<br />Depois, é praticado.</h2></header>
          <div className={styles.manuscriptGrid}>
            <Manuscript label="DOUTRINA · TEXTO CANÔNICO" title="O abismo silencioso de Kether" text={blocks.jachinDoctrine} tone="expansion" />
            <aside className={styles.marginNotes}>
              <div><small>CONCEITO</small><strong>Vida Zoe</strong><p>O texto apresenta Zoe como linguagem teológica da vida divina que sustenta a experiência de Kether.</p></div>
              <div><small>GESTO</small><strong>O Salto</strong><p>O Louco funciona no próprio manuscrito como imagem do salto de fé e do abandono temporário de definições.</p></div>
              <div><small>REFERÊNCIA VISUAL</small><strong>Dai Koo Myo</strong><p>O operador está no cânone, mas seu master visual HNK continua em revisão. A interface não inventa um desenho.</p></div>
            </aside>
          </div>
          <div className={styles.practiceChamber}>
            <div><p className={styles.kicker}>KAVANAH · PRÁTICA</p><h3>Dez minutos de foco.</h3><p className={styles.canonicalInstruction}>{blocks.jachinKavanah}</p><div className={styles.audioPending}><i />ÁUDIO RITUAL · PRESET_PENDING · nenhuma frequência é escolhida silenciosamente</div></div>
            <RitualTimer seconds={600} label="FOCO DE JACHIN" />
          </div>
          <div className={styles.actions}><button className={styles.primary} type="button" onClick={() => moveTo(3)}>CONTRAIR A FORÇA · ENTRAR EM BOAZ</button></div>
        </section>
      ) : null}

      {actId === 'boaz' ? (
        <section className={`${styles.act} ${styles.boazAct}`}>
          <header className={styles.actHeader}><p className={styles.kicker}>IV · BOAZ · RESTRIÇÃO</p><h2>A forma cria um vaso para a força.</h2><p>A experiência se contrai: menos abertura, mais limite, observação e escolha prática.</p></header>
          <div className={styles.manuscriptGridReverse}>
            <aside className={styles.boazInstrument}><div className={styles.verticalAxis}><i /><i /><i /></div><small>FATOR CRÍTICO · DISCIPLINA · RETORNO VOLUNTÁRIO</small><p>O produto apresenta o método descrito pelo manuscrito sem premiar imobilidade, desconforto ou perda de controle.</p></aside>
            <Manuscript label="DOUTRINA · TEXTO CANÔNICO" title="O rigor como estrutura" text={blocks.boazDoctrine} tone="restriction" />
          </div>
          <div className={styles.practiceChamberDark}>
            <RitualTimer seconds={300} label="RELAXAMENTO · BOAZ" />
            <div><p className={styles.kicker}>KAVANAH</p><p className={styles.canonicalInstruction}>{blocks.boazKavanah}</p><small>Safety layer do produto: você pode ajustar postura, abrir os olhos ou encerrar. A frase canônica é preservada; a interface não transforma desconforto em meta.</small></div>
          </div>
          <section className={styles.distractionLab}>
            <div className={styles.labIntro}><p className={styles.kicker}>ORDÁLIA · LABORATÓRIO</p><h3>Retire três distrações do centro.</h3><p>{blocks.boazOrdalia}</p></div>
            <div className={styles.blades}>
              {distractions.map((value, index) => <label key={index} data-filled={value.trim().length > 0}><span>0{index + 1}</span><small>DISTRAÇÃO</small><textarea value={value} onChange={(event) => setDistractions((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder="Nomeie sem enviar ao servidor…" /><i /></label>)}
            </div>
            <p className={styles.privacyNote}>PROOF WEB: estes campos permanecem somente na memória da página. O Vault final continuará bloqueado até a fronteira E2EE web estar aprovada.</p>
          </section>
          <div className={styles.actions}><button className={styles.primary} type="button" onClick={() => moveTo(4)} disabled={!distractions.every((value) => value.trim())}>CONVERGIR OS PILARES</button></div>
        </section>
      ) : null}

      {actId === 'meio' ? (
        <section className={`${styles.act} ${styles.middleAct}`}>
          <div className={styles.convergenceGeometry} aria-hidden="true"><i /><i /><b /></div>
          <header className={styles.actHeader}><p className={styles.kicker}>V · PILAR DO MEIO · CONVERGÊNCIA</p><h2>Expansão e rigor deixam de competir.</h2></header>
          <div className={styles.middleColumns}>
            <Manuscript label="INTEGRAÇÃO · TEXTO CANÔNICO" title="Força + forma" text={blocks.middleDoctrine} tone="middle" />
            <div className={styles.voiceTemple}>
              <p className={styles.kicker}>KAVANAH VOCAL</p><h3>A voz como prática.</h3><p>{blocks.middleKavanah}</p>
              <div className={styles.waveform} data-active={voiceActive}>{Array.from({ length: 28 }).map((_, index) => <i key={index} />)}</div>
              <div className={styles.voiceActions}>
                <button type="button" onClick={() => void requestMicrophone()}>{micState === 'granted' ? 'MICROFONE AUTORIZADO' : 'AUTORIZAR MICROFONE (OPCIONAL)'}</button>
                <button type="button" onClick={() => setVoiceActive((value) => !value)}>{voiceActive ? 'ENCERRAR PRÁTICA' : 'PRATICAR SEM GRAVAR'}</button>
              </div>
              <small>{micState === 'denied' ? 'Permissão negada ou indisponível. A prática pode continuar sem microfone.' : 'Nenhuma gravação ou upload acontece automaticamente.'}</small>
            </div>
          </div>
          <div className={styles.reflectionGrid}>
            <label><span>INTENÇÃO DO NEÓFITO</span><textarea value={intention} onChange={(event) => setIntention(event.target.value)} placeholder="O que você traz para a travessia?" /></label>
            <label><span>ESPELHO DA ALMA</span><textarea value={mirror} onChange={(event) => setMirror(event.target.value)} placeholder="O que mudou entre o início e agora?" /></label>
          </div>
          <button type="button" className={`${styles.contract} ${contract ? styles.contractOn : ''}`} onClick={() => setContract((value) => !value)}><i />{contract ? 'CONTRATO DO NEÓFITO · CONFIRMADO' : 'CONFIRMAR: PRÁTICA VOLUNTÁRIA · RETORNO PRESERVADO'}</button>
          <div className={styles.actions}><button className={styles.primary} type="button" disabled={!completionReady} onClick={() => moveTo(5)}>PREPARAR O SELO</button></div>
        </section>
      ) : null}

      {actId === 'selo' ? (
        <section className={`${styles.act} ${styles.sealAct}`}>
          <div className={styles.treeField} data-sealed={localSeal} aria-hidden="true">
            <div className={styles.treeAxis} />
            {Array.from({ length: 10 }).map((_, index) => <i key={index} style={{ '--node-index': index } as React.CSSProperties} />)}
            <b>K</b>
          </div>
          <div className={styles.sealCopy}>
            <p className={styles.kicker}>VI · SELO · PASSAGEM</p>
            <h2>{localSeal ? 'Agora existe uma luz.' : 'A travessia pede um testemunho.'}</h2>
            {!localSeal ? <><p>O produto não concede XP neste proof web. O gesto abaixo ensaia a composição ritual; a recompensa verdadeira continua dependente da conclusão canônica idempotente no servidor.</p><div className={styles.evidenceSummary}><span><small>INTENÇÃO</small>REGISTRADA LOCALMENTE</span><span><small>DISTRAÇÕES</small>3 / 3</span><span><small>RETORNO</small>PRESERVADO</span><span><small>XP CANÔNICO</small>+150</span></div><button className={styles.primary} type="button" onClick={() => setLocalSeal(true)}>TESTEMUNHAR A PRIMEIRA CENTELHA</button></> : <><div className={styles.reward}><small>RECOMPENSA CANÔNICA PREVISTA</small><strong>+150 XP</strong><span>1 de 36 travessias de Kether</span></div><p>A Árvore não aparece como dashboard. Ela surge como consequência espacial da travessia. O Fragmento I de Vehuiah só existe depois do Dia 005.</p><button className={styles.primary} type="button" onClick={() => { setLocalSeal(false); moveTo(0); }}>RETORNAR AO ÁTRIO TRANSFORMADO</button></>}
          </div>
        </section>
      ) : null}

      <footer className={styles.footer}>
        <span>HNK SACRED EDITORIAL FANTASY</span>
        <span>ÁUDIO: PRESET_PENDING</span>
        <span>{practice ? `SESSION ${practice.id.slice(0, 8)}` : live ? 'SESSION NÃO INICIADA' : 'PROOF LOCAL'}</span>
        {live ? <button type="button" onClick={() => void runtime.signOut()}>SAIR DO ÁTRIO</button> : null}
      </footer>
    </main>
  );
}
