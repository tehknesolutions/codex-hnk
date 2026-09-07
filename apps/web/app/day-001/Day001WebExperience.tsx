'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  startPracticeSession,
  type PracticeSessionRecord,
} from '@hnk/supabase-client';
import styles from './day001.module.css';
import review from './day001-review.module.css';
import liveStyles from './web-live.module.css';
import { useWebDay001Runtime } from './WebDay001Runtime';

type Scene = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
};

type LiveCanonSnapshot = {
  day: 1;
  chapter: 1;
  sephira: 'Kether';
  world: 'Atziluth';
  angel: 'Vehuiah';
  level: 1;
  xp: 150;
  tracks: string[];
  sourceSha: string;
  hasCanonicalManuscript: true;
};

const SCENES: Scene[] = [
  { key: 'void', eyebrow: 'ORIGEM', title: 'Antes da forma.', body: 'A experiência começa quase vazia. Uma única possibilidade permanece no centro.' },
  { key: 'touch', eyebrow: 'PRIMEIRA RESPOSTA', title: 'A luz respondeu.', body: 'O sistema reconhece o gesto antes de revelar informação.' },
  { key: 'geometry', eyebrow: 'GEOMETRIA', title: 'A forma nasce do vazio.', body: 'Ponto, eixo, anel, nó e threshold estruturam Kether sem criar um sigilo novo.' },
  { key: 'crown', eyebrow: 'DIA 001 · KETHER', title: 'A Coroa', body: 'Atziluth · Vehuiah · Neófito · +150 XP · TEURG-101 · COMP-101 · BIO-101.' },
  { key: 'leap', eyebrow: 'O LOUCO · FEHU · HEXAGRAMA 1', title: 'O Salto Cósmico', body: 'O primeiro movimento do Dia 001 aparece como passagem, não como lição ou dashboard.' },
  { key: 'crossing', eyebrow: 'TRAVESSIA', title: 'Cruzar é uma decisão.', body: 'No runtime autenticado, este movimento cria a sessão canônica de prática.' },
  { key: 'chamber', eyebrow: 'CÂMARA DE KETHER', title: 'Silêncio antes do conteúdo.', body: 'A interface reduz novamente sua presença. Áudio permanece PRESET_PENDING.' },
  { key: 'reveal', eyebrow: 'REVELAÇÃO', title: 'A tríade emerge.', body: 'Expansão, fricção e convergência aparecem como mudanças de campo, nunca três cards mecânicos.' },
  { key: 'manuscript', eyebrow: 'MANUSCRITO', title: 'O texto volta a respirar.', body: 'A produção web deve carregar o Markdown canônico sincronizado; este proof não duplica o texto editorial dentro da camada visual.' },
  { key: 'relic', eyebrow: 'RELIC MOMENT', title: 'A origem torna-se tocável.', body: 'Um artefato memorável feito apenas de primitivas aprovadas: ponto, eixo, anéis e limiar.' },
  { key: 'kavanah', eyebrow: 'KAVANAH', title: 'Prática guiada.', body: 'O runtime final recebe os três movimentos canônicos e registra duração sem premiar intensidade subjetiva.' },
  { key: 'intention', eyebrow: 'INTENÇÃO PESSOAL', title: 'Nomeie o que você traz.', body: 'Registro privado do praticante; nunca substitui conteúdo canônico.' },
  { key: 'contract', eyebrow: 'CONTRATO DO NEÓFITO', title: 'Prática voluntária. Retorno preservado.', body: 'Pausar, encerrar ou retornar continua permitido. Desconforto não é falha.' },
  { key: 'seal', eyebrow: 'SELO', title: 'A intenção recebe um limite.', body: 'Geometria de threshold/origem. Não é o sigilo canônico de Kether.' },
  { key: 'mirror', eyebrow: 'ESPELHO DA ALMA', title: 'O que mudou?', body: 'No runtime real, conteúdo sensível é cifrado antes do sync.' },
  { key: 'quest', eyebrow: 'QUEST · ASSIAH', title: 'Leve a travessia ao mundo.', body: 'Três distrações deixam o centro; a ação concreta nasce da prática.' },
  { key: 'reward', eyebrow: 'RECOMPENSA', title: '+150 XP', body: 'Somente uma conclusão canônica idempotente concede XP.' },
  { key: 'tree', eyebrow: 'ÁRVORE DA VIDA', title: 'Kether acende.', body: '1 de 36 travessias registrada. Ainda não existe Fragmento I de Vehuiah.' },
  { key: 'passage', eyebrow: 'PASSAGEM', title: 'Neófito — travessia iniciada.', body: 'O usuário retorna ao sistema diferente de como entrou.' },
  { key: 'atrium', eyebrow: 'O ÁTRIO · TRANSFORMADO', title: 'Agora existe uma luz.', body: 'A primeira centelha permanece como memória espacial do progresso.' },
];

function createClientSessionId(userId: string): string {
  return `hnk-web-d001-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseCanonRow(row: Record<string, unknown> | null): LiveCanonSnapshot | null {
  if (!row) return null;
  const content = typeof row.content === 'object' && row.content !== null
    ? row.content as Record<string, unknown>
    : null;
  const rawMarkdown = content?.raw_markdown;

  if (
    row.day !== 1 ||
    row.chapter !== 1 ||
    row.sephira !== 'Kether' ||
    row.world !== 'Atziluth' ||
    row.angel !== 'Vehuiah' ||
    row.level !== 1 ||
    row.xp !== 150 ||
    typeof row.source_sha !== 'string' ||
    !Array.isArray(row.tracks) ||
    !row.tracks.every((track) => typeof track === 'string') ||
    typeof rawMarkdown !== 'string' ||
    rawMarkdown.trim().length === 0
  ) {
    return null;
  }

  return {
    day: 1,
    chapter: 1,
    sephira: 'Kether',
    world: 'Atziluth',
    angel: 'Vehuiah',
    level: 1,
    xp: 150,
    tracks: row.tracks as string[],
    sourceSha: row.source_sha,
    hasCanonicalManuscript: true,
  };
}

export function Day001WebExperience() {
  const runtime = useWebDay001Runtime();
  const [index, setIndex] = useState(0);
  const [intention, setIntention] = useState('');
  const [mirror, setMirror] = useState('');
  const [contract, setContract] = useState(false);
  const [canon, setCanon] = useState<LiveCanonSnapshot | null>(null);
  const [practice, setPractice] = useState<PracticeSessionRecord | null>(null);
  const [runtimeBusy, setRuntimeBusy] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const scene = SCENES[index];
  const progress = `${String(index + 1).padStart(2, '0')} / ${SCENES.length}`;
  const live = Boolean(
    runtime.configured &&
    runtime.phase === 'signed-in' &&
    runtime.client &&
    runtime.userId,
  );

  useEffect(() => {
    if (!live || !runtime.client) {
      setCanon(null);
      return;
    }

    let active = true;
    setRuntimeError(null);
    void runtime.client
      .from('codex_days')
      .select('day,chapter,sephira,world,angel,level,xp,tracks,source_sha,content')
      .eq('day', 1)
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setRuntimeError('Não foi possível validar o snapshot canônico do Dia 001 no servidor.');
          return;
        }
        const snapshot = parseCanonRow(data as Record<string, unknown> | null);
        if (!snapshot) {
          setRuntimeError('O servidor respondeu, mas o snapshot do Dia 001 não corresponde ao contrato congelado.');
          return;
        }
        setCanon(snapshot);
      });

    return () => {
      active = false;
    };
  }, [live, runtime.client]);

  const geometryLevel = useMemo(() => Math.min(index, 12), [index]);
  const mirrorSecurityBlocked = live && scene.key === 'mirror';
  const crossingAwaitingCanon = live && scene.key === 'crossing' && !canon;
  const canAdvance =
    runtimeBusy || crossingAwaitingCanon ? false :
    scene.key === 'intention' ? intention.trim().length > 0 :
    scene.key === 'contract' ? contract :
    scene.key === 'mirror' ? mirror.trim().length > 0 && !mirrorSecurityBlocked : true;
  const reviewSceneClass = scene.key === 'relic'
    ? review.relicScene
    : scene.key === 'atrium'
      ? review.atriumScene
      : '';
  const reduceOrigin = scene.key === 'relic' || scene.key === 'atrium';

  async function advance() {
    if (!canAdvance) return;
    setRuntimeError(null);

    if (scene.key === 'crossing' && live && runtime.client && runtime.userId && canon && !practice) {
      setRuntimeBusy(true);
      try {
        const session = await startPracticeSession(runtime.client, {
          day: 1,
          clientSessionId: createClientSessionId(runtime.userId),
          mode: 'canonical',
          appVersion: '0.1.0-web',
        });
        setPractice(session);
      } catch {
        setRuntimeError('A sessão canônica não pôde ser iniciada. A travessia permaneceu no limiar.');
        setRuntimeBusy(false);
        return;
      }
      setRuntimeBusy(false);
    }

    setIndex((value) => Math.min(SCENES.length - 1, value + 1));
  }

  const crownWorld = (canon?.world ?? 'ATZILUTH').toUpperCase();
  const crownAngel = (canon?.angel ?? 'VEHUIAH').toUpperCase();
  const crownXp = canon?.xp ?? 150;

  return (
    <main className={`${styles.shell} ${review.shellReview}`} data-hnk-theme="kether" data-scene={scene.key}>
      {index >= 3 ? (
        <header className={styles.hud}>
          <div>
            <span>HNK CODEX · DIA 001</span>
            <strong>KETHER</strong>
          </div>
          <div className={styles.hudRight}>
            <span>{progress}</span>
            <small>{live ? 'WEB LIVE · VAULT FINAL BLOQUEADO' : 'WEB PROOF · LOCAL STATE'}</small>
            {live ? (
              <button className={liveStyles.signOut} type="button" onClick={() => void runtime.signOut()}>
                SAIR DO ÁTRIO
              </button>
            ) : null}
          </div>
        </header>
      ) : null}

      <section className={`${styles.origin} ${reduceOrigin ? review.originReduced : ''}`} aria-label="Geometria progressiva de Kether">
        {geometryLevel >= 2 ? <i className={styles.axis} /> : null}
        {geometryLevel >= 1 ? <i className={`${styles.ring} ${styles.ringOne}`} /> : null}
        {geometryLevel >= 3 ? <i className={`${styles.ring} ${styles.ringTwo}`} /> : null}
        {geometryLevel >= 5 ? <i className={styles.threshold} /> : null}
        {geometryLevel >= 9 ? <i className={styles.rays} /> : null}
        <i className={`${styles.point} ${geometryLevel > 0 ? styles.pointActive : ''}`} />
      </section>

      <section className={`${styles.scene} ${index < 2 ? styles.sceneBare : ''} ${reviewSceneClass}`}>
        <p className={styles.eyebrow}>{scene.eyebrow}</p>
        <h1>{scene.title}</h1>
        <p className={styles.body}>{scene.body}</p>

        {scene.key === 'crown' ? (
          <>
            <div className={styles.constellation}>
              <span><small>MUNDO</small>{crownWorld}</span>
              <span><small>ANJO</small>{crownAngel}</span>
              <span><small>GRAU</small>NEÓFITO</span>
              <span><small>XP</small>+{crownXp}</span>
            </div>
            <p className={liveStyles.sourceNote}>
              {live
                ? canon
                  ? `CANON LIVE · SOURCE ${canon.sourceSha.slice(0, 12)}`
                  : 'VALIDANDO CANON LIVE…'
                : 'PROOF VISUAL · METADADOS DE REFERÊNCIA DO FREEZE'}
            </p>
          </>
        ) : null}

        {scene.key === 'manuscript' && live ? (
          <p className={liveStyles.sourceNote}>
            {canon?.hasCanonicalManuscript
              ? `MANUSCRITO VALIDADO NO DATASET CANÔNICO · SOURCE ${canon.sourceSha.slice(0, 12)}`
              : 'O MANUSCRITO NÃO É DECLARADO LIVE ATÉ O RAW MARKDOWN SER VALIDADO.'}
          </p>
        ) : null}

        {scene.key === 'crossing' && live ? (
          <p className={liveStyles.sourceNote}>
            {practice
              ? `PRACTICE SESSION · ${practice.id.slice(0, 8)}`
              : canon
                ? 'A PRÓXIMA AÇÃO CRIA UMA PRACTICE SESSION CANÔNICA.'
                : 'AGUARDANDO VALIDAÇÃO DO CÂNONE ANTES DE ABRIR A TRAVESSIA.'}
          </p>
        ) : null}

        {scene.key === 'relic' ? (
          <div className={`${styles.relic} ${review.relicStage}`} aria-label="Relic Moment de Kether">
            <i className={styles.relicAxis} />
            <i className={`${styles.relicRing} ${styles.relicOuter}`} />
            <i className={`${styles.relicRing} ${styles.relicInner}`} />
            <i className={styles.relicRays} />
            <i className={styles.relicPoint} />
          </div>
        ) : null}

        {scene.key === 'intention' ? (
          <>
            <textarea value={intention} onChange={(event) => setIntention(event.target.value)} placeholder="MINHA INTENÇÃO PARA ESTA TRAVESSIA…" className={styles.input} />
            {live ? <p className={liveStyles.localOnly}>MEMÓRIA VOLÁTIL DO BROWSER · NÃO PERSISTIDA · NÃO ENVIADA</p> : null}
          </>
        ) : null}

        {scene.key === 'contract' ? (
          <button type="button" className={`${styles.contract} ${contract ? styles.contractActive : ''}`} onClick={() => setContract((value) => !value)} aria-pressed={contract}>
            <i /> {contract ? 'CONTRATO CONFIRMADO' : 'TOCAR PARA CONFIRMAR'}
          </button>
        ) : null}

        {scene.key === 'seal' ? (
          <div className={styles.seal} aria-label="Geometria de selo não canônica">
            <i className={styles.sealSquare} />
            <i className={styles.sealCircle} />
            <i className={styles.sealPoint} />
          </div>
        ) : null}

        {scene.key === 'mirror' ? (
          <>
            <textarea value={mirror} onChange={(event) => setMirror(event.target.value)} placeholder="ESCREVA SEM PRESSA…" className={`${styles.input} ${styles.mirror}`} />
            {mirrorSecurityBlocked ? (
              <div className={liveStyles.securityBoundary} role="status">
                <strong>SELO WEB BLOQUEADO COM SEGURANÇA</strong>
                <p>
                  O browser ainda não possui um keystore/recovery E2EE congelado equivalente ao SecureStore nativo. Este texto permanece somente na memória desta página: não foi persistido, não foi enviado ao Vault e nenhum XP será concedido no Web.
                </p>
                <span>CONTINUE NO APP MOBILE PARA CIFRAR E CONCLUIR O DIA 001.</span>
              </div>
            ) : null}
          </>
        ) : null}

        {scene.key === 'tree' || scene.key === 'atrium' ? (
          <div className={`${styles.tree} ${scene.key === 'atrium' ? review.treeStage : ''}`} aria-label="Kether aceso na Árvore da Vida">
            <i className={styles.treeStem} />
            <i className={`${review.treeBranch} ${review.treeBranchLeft}`} />
            <i className={`${review.treeBranch} ${review.treeBranchRight}`} />
            <i className={`${styles.treeNode} ${styles.kether}`}><b /></i>
            <i className={`${styles.treeNode} ${styles.chokmah}`} />
            <i className={`${styles.treeNode} ${styles.binah}`} />
            <i className={`${styles.treeNode} ${styles.tiphereth}`} />
            <i className={`${styles.treeNode} ${styles.yesod}`} />
            <i className={`${styles.treeNode} ${styles.malkuth}`} />
          </div>
        ) : null}

        {runtimeError ? <p className={liveStyles.runtimeError}>{runtimeError}</p> : null}

        {scene.key !== 'atrium' ? (
          <button type="button" className={styles.cta} onClick={() => void advance()} disabled={!canAdvance}>
            {runtimeBusy
              ? 'CRIANDO SESSÃO…'
              : mirrorSecurityBlocked
                ? 'SELO WEB BLOQUEADO · CONTINUE NO MOBILE'
                : crossingAwaitingCanon
                  ? 'VALIDANDO CÂNONE…'
                  : scene.key === 'void'
                    ? 'TOCAR A ORIGEM'
                    : scene.key === 'tree'
                      ? 'PASSAR ADIANTE'
                      : 'CONTINUAR'}
          </button>
        ) : (
          <div className={styles.finalState}>KETHER · 001 / 036 · VEHUIAH 1 / 5 · NEÓFITO</div>
        )}
      </section>

      {index >= 3 ? (
        <footer className={styles.footer}>
          <span>VISUAL PASS V2</span>
          <span>REDUCED MOTION READY</span>
          <span>{live ? 'CANON/SESSION LIVE · VAULT BLOCKED' : 'CANON COPY NOT DUPLICATED'}</span>
        </footer>
      ) : null}
    </main>
  );
}
