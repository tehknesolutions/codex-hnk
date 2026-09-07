import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  completeCodexDay,
  saveEncryptedVaultEntry,
  savePracticeRecord,
  startPracticeSession,
  type CompletionResult,
  type PracticeSessionRecord,
} from '@hnk/supabase-client';
import { hnkRhythm, ketherTokens } from '@hnk/ui';
import { useHnkAuth } from '../auth/AuthContext';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadDay001Snapshot, type Day001Snapshot } from './day001-data';

type Scene =
  | 'void'
  | 'touch'
  | 'geometry'
  | 'crown'
  | 'leap'
  | 'crossing'
  | 'chamber'
  | 'reveal'
  | 'manuscript'
  | 'relic'
  | 'kavanah'
  | 'intention'
  | 'contract'
  | 'seal'
  | 'mirror'
  | 'quest'
  | 'reward'
  | 'tree'
  | 'passage'
  | 'atrium';

type PracticeDurations = {
  jachin: number;
  boaz: number;
  middle: number;
};

type SyncState = 'idle' | 'starting' | 'sealing' | 'sealed' | 'demo' | 'error';

const SCENES: Scene[] = [
  'void',
  'touch',
  'geometry',
  'crown',
  'leap',
  'crossing',
  'chamber',
  'reveal',
  'manuscript',
  'relic',
  'kavanah',
  'intention',
  'contract',
  'seal',
  'mirror',
  'quest',
  'reward',
  'tree',
  'passage',
  'atrium',
];

const C = ketherTokens.color;
const R = hnkRhythm;

function createClientSessionId(userId: string): string {
  return `hnk-d001-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === 'vault_secure_storage_unavailable_on_web') {
      return 'O Vault V1 fecha com segurança no web. Para selar conteúdo íntimo, use o app mobile enquanto a recuperação E2EE web/multi-device não estiver congelada.';
    }
    if (error.message === 'authentication_required') {
      return 'A sessão do Átrio expirou. Entre novamente antes de selar o Dia.';
    }
    return error.message;
  }
  return 'Não foi possível concluir o selo digital.';
}

export function Day001MasterVerticalSlice() {
  const auth = useHnkAuth();
  const [day, setDay] = useState<Day001Snapshot | null>(null);
  const [scene, setScene] = useState<Scene>('void');
  const [intention, setIntention] = useState('');
  const [contractAccepted, setContractAccepted] = useState(false);
  const [distractions, setDistractions] = useState(['', '', '']);
  const [mirror, setMirror] = useState('');
  const [practice, setPractice] = useState<PracticeSessionRecord | null>(null);
  const [durations, setDurations] = useState<PracticeDurations>({ jachin: 0, boaz: 0, middle: 0 });
  const [completion, setCompletion] = useState<CompletionResult | null>(null);
  const [vaultHash, setVaultHash] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    void loadDay001Snapshot(auth.accessToken ?? undefined).then((snapshot) => {
      if (active) setDay(snapshot);
    });
    return () => {
      active = false;
    };
  }, [auth.accessToken]);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const sceneIndex = SCENES.indexOf(scene);
  const isLive = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);
  const totalDuration = durations.jachin + durations.boaz + durations.middle;

  function advance() {
    const next = SCENES[sceneIndex + 1];
    if (next) setScene(next);
  }

  async function beginPractice() {
    setSyncError(null);
    if (!isLive || !auth.client || !auth.userId) {
      setSyncState('demo');
      setScene('chamber');
      return;
    }
    if (practice) {
      setScene('chamber');
      return;
    }

    setSyncState('starting');
    try {
      const session = await startPracticeSession(auth.client, {
        day: 1,
        clientSessionId: createClientSessionId(auth.userId),
        mode: 'canonical',
        appVersion: '0.1.0',
      });
      setPractice(session);
      setSyncState('idle');
      setScene('chamber');
    } catch (error) {
      setSyncState('error');
      setSyncError(errorMessage(error));
    }
  }

  async function sealDay() {
    setSyncError(null);
    if (!day) return;

    if (!isLive || !auth.client || !auth.userId || !practice) {
      setSyncState('demo');
      setScene('reward');
      return;
    }

    setSyncState('sealing');
    try {
      let recordHash = vaultHash;
      if (!recordHash) {
        const plaintext = JSON.stringify({
          schema: 'hnk-day001-private-v2',
          intention: intention.trim(),
          neophyte_contract_accepted: contractAccepted,
          mirror: mirror.trim(),
          distractions: distractions.map((value) => value.trim()),
        });
        const payload = await encryptVaultText({
          userId: auth.userId,
          day: 1,
          kind: 'journal',
          plaintext,
        });
        await saveEncryptedVaultEntry(auth.client, { day: 1, payload });
        recordHash = payload.checksumSha256;
        setVaultHash(recordHash);
      }

      await savePracticeRecord(auth.client, {
        sessionId: practice.id,
        durationSeconds: totalDuration,
        metrics: {
          total_practice_seconds: totalDuration,
          jachin_seconds: durations.jachin,
          boaz_seconds: durations.boaz,
          middle_seconds: durations.middle,
        },
        evidence: {
          jachin_completed: true,
          boaz_completed: true,
          middle_completed: true,
          distraction_count: distractions.filter((value) => value.trim().length > 0).length,
          mirror_saved_to_vault: true,
          neophyte_contract_confirmed: contractAccepted,
        },
        readyForCompletion: true,
        endedAt: new Date().toISOString(),
        localRecordHash: recordHash,
      });

      const result = await completeCodexDay(auth.client, {
        day: 1,
        sessionId: practice.id,
        localRecordHash: recordHash,
      });

      setCompletion(result);
      setSyncState('sealed');
      setScene('reward');
    } catch (error) {
      setSyncState('error');
      setSyncError(errorMessage(error));
    }
  }

  if (!day) {
    return (
      <View style={styles.loading}>
        <OriginField level={0} reduceMotion />
        <ActivityIndicator color={C.originWhite} />
      </View>
    );
  }

  const showHud = sceneIndex >= 3;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showHud ? (
          <Header
            day={day}
            sceneIndex={sceneIndex}
            live={isLive}
            onSignOut={() => void auth.signOut()}
          />
        ) : null}

        <OriginField level={sceneIndex} reduceMotion={reduceMotion} />

        {scene === 'void' ? (
          <BareScene>
            <Text style={styles.whisper}>ANTES DA FORMA, UMA POSSIBILIDADE.</Text>
            <PrimaryAction label="TOCAR A ORIGEM" onPress={advance} quiet />
          </BareScene>
        ) : null}

        {scene === 'touch' ? (
          <BareScene>
            <Text style={styles.sacredTitle}>A luz respondeu.</Text>
            <Text style={styles.bodyMuted}>Nenhum dashboard. Nenhuma explicação excessiva. Apenas a primeira resposta do sistema ao seu gesto.</Text>
            <PrimaryAction label="PERMANECER" onPress={advance} quiet />
          </BareScene>
        ) : null}

        {scene === 'geometry' ? (
          <SceneCard eyebrow="EMANAÇÃO" title="A forma começa a nascer do vazio.">
            <Text style={styles.editorialBody}>Eixo, anel, nó e limiar aparecem como arquitetura primordial — não como sigilo e não como correspondência canônica inventada.</Text>
            <PrimaryAction label="REVELAR A COROA" onPress={advance} />
          </SceneCard>
        ) : null}

        {scene === 'crown' ? (
          <SceneCard eyebrow="DIA 001 · KETHER" title="A COROA">
            <MetadataConstellation day={day} />
            <Text style={styles.systemNote}>A primeira centelha não é o Fragmento I. Vehuiah só é consolidado após o Dia 005.</Text>
            <PrimaryAction label="VER O PRIMEIRO MOVIMENTO" onPress={advance} />
          </SceneCard>
        ) : null}

        {scene === 'leap' ? (
          <SceneCard eyebrow="O LOUCO · FEHU · HEXAGRAMA 1" title={day.experienceTitle}>
            <Text style={styles.sacredQuote}>O primeiro ato não é possuir uma resposta. É aceitar atravessar o limiar.</Text>
            <Text style={styles.systemNote}>Microcopy de plataforma. O conteúdo canônico permanece separado e imutável.</Text>
            <PrimaryAction label="ATRAVESSAR" onPress={advance} />
          </SceneCard>
        ) : null}

        {scene === 'crossing' ? (
          <ThresholdScene
            live={isLive}
            syncState={syncState}
            syncError={syncError}
            onEnter={() => void beginPractice()}
          />
        ) : null}

        {scene === 'chamber' ? (
          <SceneCard eyebrow="CÂMARA DE KETHER" title="Silêncio antes do conteúdo.">
            <Text style={styles.editorialBody}>A interface reduz novamente sua presença. A sessão já existe; agora o Codex pode revelar o texto sem quebrar a atmosfera de entrada.</Text>
            <SystemStrip items={[["SESSÃO", practice ? practice.id.slice(0, 8) : "LOCAL"], ["MOTION", reduceMotion ? "REDUZIDO" : "PADRÃO"], ["ÁUDIO", "PRESET PENDING"]]} />
            <PrimaryAction label="REVELAR" onPress={advance} />
          </SceneCard>
        ) : null}

        {scene === 'reveal' ? (
          <SceneCard eyebrow="REVELAÇÃO" title="Kether não entrega tudo de uma vez.">
            <Text style={styles.editorialBody}>A experiência abre a tríade interna do Dia 001 — expansão, fricção e convergência — sem convertê-la em três caixas mecânicas.</Text>
            <PrimaryAction label="ABRIR O MANUSCRITO" onPress={advance} />
          </SceneCard>
        ) : null}

        {scene === 'manuscript' ? (
          <SceneCard eyebrow="MANUSCRITO" title="Três campos. Um único rito.">
            <ManuscriptSection label="JACHIN · EXPANSÃO" text={day.jachinKavanah} />
            <ManuscriptSection label="BOAZ · RESTRIÇÃO" text={day.boazKavanah} />
            <ManuscriptSection label="MEIO · CONVERGÊNCIA" text={day.middleKavanah} />
            <PrimaryAction label="TOCAR O ARTEFATO" onPress={advance} />
          </SceneCard>
        ) : null}

        {scene === 'relic' ? <RelicMoment onContinue={advance} /> : null}

        {scene === 'kavanah' ? (
          <KavanahRite
            day={day}
            onComplete={(nextDurations) => {
              setDurations(nextDurations);
              advance();
            }}
          />
        ) : null}

        {scene === 'intention' ? (
          <SceneCard eyebrow="INTENÇÃO PESSOAL" title="Nomeie o que você traz ao limiar.">
            <Text style={styles.bodyMuted}>Este texto é registro privado do praticante. Ele não altera o cânone e não é usado para inferir estado espiritual.</Text>
            <TextInput value={intention} onChangeText={setIntention} placeholder="MINHA INTENÇÃO PARA ESTA TRAVESSIA…" placeholderTextColor={C.textMuted} style={styles.input} multiline />
            <PrimaryAction label="FIXAR INTENÇÃO" onPress={advance} disabled={intention.trim().length === 0} />
          </SceneCard>
        ) : null}

        {scene === 'contract' ? (
          <SceneCard eyebrow="CONTRATO DO NEÓFITO" title="Prática voluntária. Retorno preservado.">
            <Text style={styles.editorialBody}>Eu posso pausar, encerrar ou retornar. Desconforto não é falha. Intensidade subjetiva não é prova biomédica nem metafísica. Meu progresso válido não depende de ultrapassar meus limites.</Text>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: contractAccepted }} onPress={() => setContractAccepted((value) => !value)} style={[styles.contractRow, contractAccepted && styles.contractRowActive]}>
              <View style={[styles.contractNode, contractAccepted && styles.contractNodeActive]} />
              <Text style={styles.contractText}>{contractAccepted ? 'CONTRATO CONFIRMADO' : 'TOCAR PARA CONFIRMAR'}</Text>
            </Pressable>
            <PrimaryAction label="PROSSEGUIR AO SELO" onPress={advance} disabled={!contractAccepted} />
          </SceneCard>
        ) : null}

        {scene === 'seal' ? (
          <SceneCard eyebrow="SELO" title="A intenção recebe um limite.">
            <View style={styles.sealArtifact}><View style={styles.sealSquare} /><View style={styles.sealCircle} /><View style={styles.sealPoint} /></View>
            <Text style={styles.systemNote}>Geometria aprovada de threshold/origem. Isto não é o sigilo canônico de Kether.</Text>
            <PrimaryAction label="ABRIR O ESPELHO" onPress={advance} />
          </SceneCard>
        ) : null}

        {scene === 'mirror' ? (
          <SceneCard eyebrow="ESPELHO DA ALMA" title="O que mudou entre o início e agora?">
            <Text style={styles.bodyMuted}>Registre sinais, percepções e aprendizados sem transformar sensação em certeza automática. No modo real, o texto será cifrado antes do sync.</Text>
            <TextInput value={mirror} onChangeText={setMirror} placeholder="ESCREVA SEM PRESSA…" placeholderTextColor={C.textMuted} style={[styles.input, styles.mirrorInput]} multiline textAlignVertical="top" />
            <PrimaryAction label="LEVAR AO MUNDO" onPress={advance} disabled={mirror.trim().length === 0} />
          </SceneCard>
        ) : null}

        {scene === 'quest' ? (
          <SceneCard eyebrow="QUEST · ASSIAH" title="Afaste três distrações do centro.">
            <Text style={styles.editorialBody}>{day.boazOrdalia}</Text>
            <View style={styles.bladeStack}>
              {distractions.map((value, index) => (
                <View key={index} style={styles.blade}>
                  <Text style={styles.bladeIndex}>LÂMINA {String(index + 1).padStart(2, '0')}</Text>
                  <TextInput value={value} onChangeText={(text) => setDistractions((current) => current.map((item, itemIndex) => (itemIndex === index ? text : item)))} placeholder={`DISTRAÇÃO ${index + 1}`} placeholderTextColor={C.textMuted} style={styles.bladeInput} multiline />
                </View>
              ))}
            </View>
            {syncError ? <ErrorNotice text={syncError} /> : null}
            <PrimaryAction label={syncState === 'sealing' ? 'SELANDO A TRAVESSIA…' : isLive ? 'CIFRAR, REGISTRAR E CONCLUIR' : 'CONCLUIR DEMONSTRAÇÃO'} onPress={() => void sealDay()} disabled={distractions.some((item) => item.trim().length === 0) || syncState === 'sealing'} />
          </SceneCard>
        ) : null}

        {scene === 'reward' ? <RewardScene day={day} completion={completion} live={isLive} syncState={syncState} onContinue={advance} /> : null}
        {scene === 'tree' ? <TreeSpark onContinue={advance} /> : null}

        {scene === 'passage' ? (
          <SceneCard eyebrow="PASSAGEM" title="NEÓFITO — TRAVESSIA INICIADA">
            <Text style={styles.sacredQuote}>1 de 36 travessias de Kether registrada.</Text>
            <Text style={styles.bodyMuted}>A Coroa recebeu apenas a primeira centelha. O Fragmento I de Vehuiah continua reservado ao fechamento do ciclo no Dia 005.</Text>
            <PrimaryAction label="RETORNAR AO ÁTRIO" onPress={advance} />
          </SceneCard>
        ) : null}

        {scene === 'atrium' ? (
          <SceneCard eyebrow="O ÁTRIO · TRANSFORMADO" title="Agora existe uma luz onde antes havia apenas vazio.">
            <View style={styles.atriumSpark}><View style={styles.atriumRing} /><View style={styles.atriumPoint} /></View>
            <SystemStrip items={[["KETHER", "001 / 036"], ["VEHUIAH", "1 / 5"], ["GRAU", completion?.initiatoryTitle?.toUpperCase() ?? "NEÓFITO"], ["XP", completion ? String(completion.xpTotal) : "DEMO"]]} />
            <Text style={styles.systemNote}>O próximo Dia só deve aparecer como continuação disponível quando o estado canônico do servidor permitir.</Text>
          </SceneCard>
        ) : null}

        {showHud ? <FooterStatus day={day} sceneIndex={sceneIndex} practice={practice} vaultHash={vaultHash} /> : null}
      </ScrollView>
    </View>
  );
}

function Header({ day, sceneIndex, live, onSignOut }: { day: Day001Snapshot; sceneIndex: number; live: boolean; onSignOut: () => void }) {
  return <View style={styles.header}><View><Text style={styles.systemEyebrow}>HNK CODEX · DIA {String(day.day).padStart(3, '0')}</Text><Text style={styles.headerTitle}>KETHER</Text></View><View style={styles.headerRight}><Text style={styles.systemCounter}>{String(Math.min(sceneIndex + 1, SCENES.length)).padStart(2, '0')} / {SCENES.length}</Text><Text style={styles.systemSource}>{day.source === 'supabase' ? 'CANON LIVE' : 'CANON OFFLINE'}</Text>{live ? <Pressable onPress={onSignOut} accessibilityRole="button"><Text style={styles.signOut}>SAIR DO ÁTRIO</Text></Pressable> : null}</View></View>;
}

function OriginField({ level, reduceMotion }: { level: number; reduceMotion: boolean }) {
  const ringCount = level <= 0 ? 0 : Math.min(4, Math.ceil(level / 2));
  const showAxis = level >= 2;
  const showThreshold = level >= 5;
  const showRays = level >= 9;
  const glow = !reduceMotion && level > 0;
  return <View style={styles.originFrame} accessibilityLabel="Geometria progressiva de Kether">{showAxis ? <View style={styles.originAxis} /> : null}{Array.from({ length: ringCount }, (_, index) => { const size = 84 + index * 52; return <View key={size} style={[styles.originRing, { width: size, height: size, borderRadius: size / 2, marginLeft: -size / 2, marginTop: -size / 2 }]} />; })}{showThreshold ? <View style={styles.originThreshold} /> : null}{showRays ? Array.from({ length: 12 }, (_, index) => <View key={index} style={[styles.originRay, { transform: [{ rotate: `${index * 30}deg` }] }]} />) : null}<View style={[styles.originPoint, level > 0 && styles.originPointActive, glow && styles.originPointGlow]} /></View>;
}
function BareScene({ children }: { children: ReactNode }) { return <View style={styles.bareScene}>{children}</View>; }
function SceneCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) { return <View style={styles.card}><Text style={styles.sceneEyebrow}>{eyebrow}</Text><Text style={styles.sceneTitle}>{title}</Text><View style={styles.divider} />{children}</View>; }
function MetadataConstellation({ day }: { day: Day001Snapshot }) { return <View style={styles.metaWrap}><Meta label="MUNDO" value={day.world} /><Meta label="ANJO" value={day.angel} /><Meta label="GRAU" value="NEÓFITO" /><Meta label="XP" value={`+${day.xp}`} /><Meta label="TRACKS" value={day.tracks.join(' · ')} wide /></View>; }
function Meta({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) { return <View style={[styles.metaInscription, wide && styles.metaWide]}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>; }
function ThresholdScene({ live, syncState, syncError, onEnter }: { live: boolean; syncState: SyncState; syncError: string | null; onEnter: () => void }) { return <SceneCard eyebrow="TRAVESSIA" title="A interface cruza com você."><View style={styles.thresholdArtifact}><View style={styles.thresholdAxis} /><View style={styles.thresholdDiamond} /><View style={styles.thresholdPoint} /></View><SyncBadge live={live} state={syncState} />{syncError ? <ErrorNotice text={syncError} /> : null}<PrimaryAction label={syncState === 'starting' ? 'CRIANDO SESSÃO…' : 'ENTRAR NA CÂMARA'} onPress={onEnter} disabled={syncState === 'starting'} /></SceneCard>; }
function ManuscriptSection({ label, text }: { label: string; text: string }) { return <View style={styles.manuscriptSection}><Text style={styles.manuscriptLabel}>{label}</Text><Text style={styles.manuscriptText}>{text}</Text></View>; }
function RelicMoment({ onContinue }: { onContinue: () => void }) { return <SceneCard eyebrow="RELIC MOMENT" title="A origem torna-se tocável."><View style={styles.relicField}><View style={styles.relicAxis} /><View style={styles.relicRingOuter} /><View style={styles.relicRingInner} />{Array.from({ length: 12 }, (_, index) => <View key={index} style={[styles.relicRay, { transform: [{ rotate: `${index * 30}deg` }] }]} />)}<View style={styles.relicPoint} /></View><Text style={styles.systemNote}>Momento memorável construído apenas com ponto, eixo, anéis e limiar. Nenhum sigilo novo foi introduzido.</Text><PrimaryAction label="ENTRAR NA KAVANAH" onPress={onContinue} /></SceneCard>; }

function KavanahRite({ day, onComplete }: { day: Day001Snapshot; onComplete: (durations: PracticeDurations) => void }) {
  const segments = [{ key: 'jachin' as const, label: 'EXPANSÃO', title: 'Abertura', target: 600, text: day.jachinKavanah }, { key: 'boaz' as const, label: 'RESTRIÇÃO', title: 'Vaso', target: 300, text: day.boazKavanah }, { key: 'middle' as const, label: 'CONVERGÊNCIA', title: 'Centro', target: 180, text: day.middleKavanah }];
  const [segmentIndex, setSegmentIndex] = useState(0); const [localDurations, setLocalDurations] = useState<PracticeDurations>({ jachin: 0, boaz: 0, middle: 0 }); const segment = segments[segmentIndex];
  function commit(elapsed: number) { const next = { ...localDurations, [segment.key]: elapsed }; setLocalDurations(next); if (segmentIndex < segments.length - 1) setSegmentIndex((value) => value + 1); else onComplete(next); }
  return <SceneCard eyebrow={`KAVANAH · ${segment.label}`} title={segment.title}><Text style={styles.manuscriptText}>{segment.text}</Text><RitualTimer key={segment.key} targetSeconds={segment.target} onCommit={commit} /><Text style={styles.systemNote}>Você pode encerrar a etapa antes do tempo-alvo. Interrupção não produz penalidade espiritual nem de XP.</Text><View style={styles.segmentRail}>{segments.map((item, index) => <View key={item.key} style={[styles.segmentNode, index <= segmentIndex && styles.segmentNodeActive]} />)}</View></SceneCard>;
}
function RitualTimer({ targetSeconds, onCommit }: { targetSeconds: number; onCommit: (elapsed: number) => void }) { const [elapsed, setElapsed] = useState(0); const [running, setRunning] = useState(false); useEffect(() => { if (!running) return; const id = setInterval(() => setElapsed((value) => Math.min(targetSeconds, value + 1)), 1000); return () => clearInterval(id); }, [running, targetSeconds]); useEffect(() => { if (elapsed >= targetSeconds) setRunning(false); }, [elapsed, targetSeconds]); const formatted = useMemo(() => `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`, [elapsed]); return <View style={styles.timer}><View><Text style={styles.timerLabel}>RITUAL TIMER · ALVO {Math.floor(targetSeconds / 60)} MIN</Text><Text style={styles.timerValue}>{formatted}</Text></View><View style={styles.timerActions}><Pressable style={styles.timerButton} onPress={() => setRunning((value) => !value)}><Text style={styles.timerButtonText}>{running ? 'PAUSAR' : elapsed === 0 ? 'INICIAR' : 'CONTINUAR'}</Text></Pressable><Pressable style={styles.timerButton} onPress={() => onCommit(elapsed)}><Text style={styles.timerButtonText}>CONCLUIR ETAPA</Text></Pressable></View></View>; }
function RewardScene({ day, completion, live, syncState, onContinue }: { day: Day001Snapshot; completion: CompletionResult | null; live: boolean; syncState: SyncState; onContinue: () => void }) { const first = completion?.firstCompletion === true; const reward = completion ? (first ? `+${completion.xpAwarded} XP` : 'XP JÁ SELADO') : `+${day.xp} XP`; return <SceneCard eyebrow="RECOMPENSA" title="A travessia recebeu resposta canônica."><View style={styles.rewardHalo}><Text style={styles.rewardLabel}>{completion ? 'RESPOSTA DO SERVIDOR' : 'RECOMPENSA CANÔNICA PREVISTA'}</Text><Text style={styles.rewardXp}>{reward}</Text>{completion ? <Text style={styles.rewardTotal}>XP TOTAL · {completion.xpTotal}</Text> : null}</View><Text style={styles.systemNote}>{completion ? (first ? 'Primeira conclusão confirmada de forma idempotente.' : 'Revisita confirmada sem duplicação de XP.') : live && syncState !== 'demo' ? 'Sem confirmação do servidor.' : 'Modo demonstrativo: nenhum XP foi persistido.'}</Text><PrimaryAction label="VER KETHER NA ÁRVORE" onPress={onContinue} /></SceneCard>; }
function TreeSpark({ onContinue }: { onContinue: () => void }) { return <SceneCard eyebrow="ÁRVORE DA VIDA" title="Kether acende."><View style={styles.treeField} accessibilityLabel="Árvore da Vida com Kether aceso"><View style={styles.treeStem} /><View style={[styles.treeNode, styles.treeKether]}><View style={styles.treeKetherPoint} /></View><View style={[styles.treeNode, styles.treeChokmah]} /><View style={[styles.treeNode, styles.treeBinah]} /><View style={[styles.treeNode, styles.treeTiphereth]} /><View style={[styles.treeNode, styles.treeYesod]} /><View style={[styles.treeNode, styles.treeMalkuth]} /></View><Text style={styles.sacredQuote}>1 de 36 travessias de Kether registrada.</Text><PrimaryAction label="PASSAR ADIANTE" onPress={onContinue} /></SceneCard>; }
function SystemStrip({ items }: { items: Array<[string, string]> }) { return <View style={styles.systemStrip}>{items.map(([label, value]) => <View key={label} style={styles.systemCell}><Text style={styles.systemCellLabel}>{label}</Text><Text style={styles.systemCellValue}>{value}</Text></View>)}</View>; }
function SyncBadge({ live, state }: { live: boolean; state: SyncState }) { return <View style={styles.syncBadge}><View style={[styles.syncDot, live && styles.syncDotLive]} /><Text style={styles.syncText}>{live ? `ÁTRIO AUTENTICADO · ${state.toUpperCase()}` : 'MODO DEMONSTRATIVO · SEM PERSISTÊNCIA'}</Text></View>; }
function ErrorNotice({ text }: { text: string }) { return <View style={styles.errorNotice}><Text style={styles.errorTitle}>SELO INTERROMPIDO COM SEGURANÇA</Text><Text style={styles.errorText}>{text}</Text></View>; }
function PrimaryAction({ label, onPress, disabled = false, quiet = false }: { label: string; onPress: () => void; disabled?: boolean; quiet?: boolean }) { return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, quiet && styles.primaryButtonQuiet, disabled && styles.primaryButtonDisabled, pressed && !disabled && styles.primaryButtonPressed]}><Text style={[styles.primaryButtonText, quiet && styles.primaryButtonTextQuiet, disabled && styles.primaryButtonTextDisabled]}>{label}</Text></Pressable>; }
function FooterStatus({ day, sceneIndex, practice, vaultHash }: { day: Day001Snapshot; sceneIndex: number; practice: PracticeSessionRecord | null; vaultHash: string | null }) { return <View style={styles.footer}><Text style={styles.footerText}>SOURCE · {day.sourceSha.slice(0, 10)}</Text><Text style={styles.footerText}>MOVIMENTO · {String(sceneIndex + 1).padStart(2, '0')}/{SCENES.length}</Text><Text style={styles.footerText}>SESSION · {practice ? practice.id.slice(0, 8) : 'LOCAL'}</Text><Text style={styles.footerText}>VAULT · {vaultHash ? vaultHash.slice(0, 8) : 'PENDING'}</Text></View>; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.void },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: R.r24, backgroundColor: C.void },
  scrollContent: { width: '100%', maxWidth: 780, alignSelf: 'center', paddingHorizontal: R.r24, paddingTop: R.r24, paddingBottom: R.r72 },
  header: { zIndex: ketherTokens.depth.hud, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: R.r12, marginBottom: R.r12 },
  headerRight: { alignItems: 'flex-end' },
  systemEyebrow: { color: C.goldMaterial, fontSize: 10, letterSpacing: 2.2, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] },
  headerTitle: { color: C.originWhite, fontSize: 28, letterSpacing: 7, fontWeight: '300', marginTop: R.r6, fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  systemCounter: { color: C.textPrimary, fontSize: 12, fontVariant: ['tabular-nums'], fontFamily: ketherTokens.typography.system.fallback[0] },
  systemSource: { color: C.textMuted, fontSize: 8, letterSpacing: 1.4, marginTop: R.r6, fontFamily: ketherTokens.typography.system.fallback[0] },
  signOut: { color: C.goldMaterial, opacity: 0.58, fontSize: 8, letterSpacing: 1.1, marginTop: R.r6, fontFamily: ketherTokens.typography.system.fallback[0] },
  originFrame: { zIndex: ketherTokens.depth.architecture, height: 276, alignItems: 'center', justifyContent: 'center', position: 'relative', marginVertical: R.r6 },
  originAxis: { position: 'absolute', width: 1, height: 230, backgroundColor: 'rgba(255,253,244,0.18)' },
  originRing: { position: 'absolute', left: '50%', top: '50%', borderWidth: 1, borderColor: 'rgba(203,176,109,0.28)' },
  originThreshold: { position: 'absolute', width: 118, height: 118, borderWidth: 1, borderColor: 'rgba(203,176,109,0.2)', transform: [{ rotate: '45deg' }] },
  originRay: { position: 'absolute', width: 1, height: 224, backgroundColor: 'rgba(203,176,109,0.07)' },
  originPoint: { width: ketherTokens.geometry.originPoint / 2, height: ketherTokens.geometry.originPoint / 2, borderRadius: ketherTokens.geometry.originPoint, backgroundColor: C.textMuted },
  originPointActive: { backgroundColor: C.originWhite }, originPointGlow: { shadowColor: C.originWhite, shadowOpacity: 0.72, shadowRadius: 24 },
  bareScene: { zIndex: ketherTokens.depth.content, minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: R.r24, paddingHorizontal: R.r12 },
  whisper: { color: C.textMuted, fontSize: 9, letterSpacing: 2.8, textAlign: 'center', fontFamily: ketherTokens.typography.system.fallback[0] },
  sacredTitle: { color: C.originWhite, fontSize: 34, lineHeight: 42, textAlign: 'center', fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  sacredQuote: { color: C.textPrimary, fontSize: 22, lineHeight: 32, textAlign: 'center', fontStyle: 'italic', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  card: { zIndex: ketherTokens.depth.content, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.22)', backgroundColor: C.surface, paddingVertical: R.r36, paddingHorizontal: R.r24, gap: R.r24 },
  sceneEyebrow: { color: C.goldMaterial, fontSize: 9, letterSpacing: 2.4, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] }, sceneTitle: { color: C.originWhite, fontSize: 32, lineHeight: 39, fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] }, divider: { height: 1, backgroundColor: 'rgba(247,243,231,0.1)' }, bodyMuted: { color: C.textSecondary, fontSize: 15, lineHeight: 24, fontFamily: ketherTokens.typography.editorialBody.fallback[0] }, editorialBody: { color: C.textPrimary, fontSize: 17, lineHeight: 29, fontFamily: ketherTokens.typography.editorialBody.fallback[0] }, systemNote: { color: C.textMuted, fontSize: 11, lineHeight: 18, fontFamily: ketherTokens.typography.system.fallback[0] },
  metaWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: R.r12 }, metaInscription: { minWidth: 116, flexGrow: 1, borderLeftWidth: 1, borderColor: 'rgba(203,176,109,0.34)', paddingLeft: R.r12, paddingVertical: R.r6 }, metaWide: { minWidth: '100%' }, metaLabel: { color: C.textMuted, fontSize: 8, letterSpacing: 1.5, fontFamily: ketherTokens.typography.system.fallback[0] }, metaValue: { color: C.textPrimary, fontSize: 13, marginTop: R.r6, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  thresholdArtifact: { height: 210, alignItems: 'center', justifyContent: 'center', position: 'relative' }, thresholdAxis: { position: 'absolute', width: 1, height: 190, backgroundColor: 'rgba(255,253,244,0.2)' }, thresholdDiamond: { width: 120, height: 120, borderWidth: 1, borderColor: 'rgba(203,176,109,0.4)', transform: [{ rotate: '45deg' }] }, thresholdPoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: C.originWhite },
  manuscriptSection: { gap: R.r12, paddingVertical: R.r12 }, manuscriptLabel: { color: C.goldMaterial, fontSize: 9, letterSpacing: 1.7, fontFamily: ketherTokens.typography.system.fallback[0] }, manuscriptText: { color: C.textPrimary, fontSize: 18, lineHeight: 30, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  relicField: { height: 290, alignItems: 'center', justifyContent: 'center', position: 'relative' }, relicAxis: { position: 'absolute', width: 1, height: 250, backgroundColor: 'rgba(255,253,244,0.2)' }, relicRingOuter: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1, borderColor: 'rgba(203,176,109,0.38)' }, relicRingInner: { position: 'absolute', width: 108, height: 108, borderRadius: 54, borderWidth: 1, borderColor: 'rgba(255,253,244,0.25)' }, relicRay: { position: 'absolute', width: 1, height: 258, backgroundColor: 'rgba(203,176,109,0.08)' }, relicPoint: { width: 14, height: 14, borderRadius: 7, backgroundColor: C.originWhite, shadowColor: C.originWhite, shadowOpacity: 0.58, shadowRadius: 20 },
  timer: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.24)', paddingVertical: R.r12, gap: R.r12 }, timerLabel: { color: C.goldMaterial, fontSize: 8, letterSpacing: 1.5, fontFamily: ketherTokens.typography.system.fallback[0] }, timerValue: { color: C.originWhite, fontSize: 32, fontVariant: ['tabular-nums'], marginTop: R.r3, fontFamily: ketherTokens.typography.system.fallback[0] }, timerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: R.r6 }, timerButton: { borderWidth: 1, borderColor: 'rgba(203,176,109,0.42)', paddingVertical: R.r12, paddingHorizontal: R.r12 }, timerButtonText: { color: C.goldBright, fontSize: 8, letterSpacing: 1.2, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] }, segmentRail: { flexDirection: 'row', gap: R.r6, justifyContent: 'center' }, segmentNode: { width: 24, height: 2, backgroundColor: 'rgba(119,118,111,0.36)' }, segmentNodeActive: { backgroundColor: C.goldMaterial },
  input: { minHeight: 90, borderWidth: 1, borderColor: 'rgba(203,176,109,0.22)', backgroundColor: C.void, color: C.textPrimary, padding: R.r12, fontSize: 15, lineHeight: 22, fontFamily: ketherTokens.typography.editorialBody.fallback[0] }, mirrorInput: { minHeight: 190 }, contractRow: { flexDirection: 'row', alignItems: 'center', gap: R.r12, borderWidth: 1, borderColor: 'rgba(119,118,111,0.28)', padding: R.r12 }, contractRowActive: { borderColor: 'rgba(203,176,109,0.54)' }, contractNode: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: C.textMuted }, contractNodeActive: { backgroundColor: C.originWhite, borderColor: C.originWhite }, contractText: { color: C.textSecondary, fontSize: 9, letterSpacing: 1.3, fontFamily: ketherTokens.typography.system.fallback[0] },
  sealArtifact: { height: 220, alignItems: 'center', justifyContent: 'center', position: 'relative' }, sealSquare: { width: 128, height: 128, borderWidth: 1, borderColor: 'rgba(203,176,109,0.38)', transform: [{ rotate: '45deg' }] }, sealCircle: { position: 'absolute', width: 98, height: 98, borderRadius: 49, borderWidth: 1, borderColor: 'rgba(255,253,244,0.22)' }, sealPoint: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: C.originWhite }, bladeStack: { gap: R.r12 }, blade: { borderLeftWidth: 1, borderColor: 'rgba(203,176,109,0.34)', paddingLeft: R.r12, gap: R.r6 }, bladeIndex: { color: C.goldMaterial, fontSize: 8, letterSpacing: 1.5, fontFamily: ketherTokens.typography.system.fallback[0] }, bladeInput: { minHeight: 62, color: C.textPrimary, fontSize: 15, lineHeight: 22, paddingVertical: R.r6, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  rewardHalo: { alignItems: 'center', justifyContent: 'center', minHeight: 200, borderWidth: 1, borderColor: 'rgba(203,176,109,0.36)', borderRadius: 100 }, rewardLabel: { color: C.goldMaterial, fontSize: 8, letterSpacing: 1.6, fontFamily: ketherTokens.typography.system.fallback[0] }, rewardXp: { color: C.originWhite, fontSize: 38, fontWeight: '300', marginTop: R.r6, fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] }, rewardTotal: { color: C.textMuted, fontSize: 9, letterSpacing: 1.3, marginTop: R.r6, fontFamily: ketherTokens.typography.system.fallback[0] },
  treeField: { height: 330, position: 'relative', alignItems: 'center' }, treeStem: { position: 'absolute', top: 36, bottom: 36, width: 1, backgroundColor: 'rgba(203,176,109,0.2)' }, treeNode: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(119,118,111,0.36)', backgroundColor: C.void }, treeKether: { top: 18, borderColor: C.goldMaterial, alignItems: 'center', justifyContent: 'center' }, treeKetherPoint: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.originWhite }, treeChokmah: { top: 86, right: '26%' }, treeBinah: { top: 86, left: '26%' }, treeTiphereth: { top: 164 }, treeYesod: { top: 232 }, treeMalkuth: { bottom: 8 }, atriumSpark: { height: 180, alignItems: 'center', justifyContent: 'center', position: 'relative' }, atriumRing: { width: 126, height: 126, borderRadius: 63, borderWidth: 1, borderColor: 'rgba(203,176,109,0.38)' }, atriumPoint: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: C.originWhite },
  systemStrip: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(247,243,231,0.08)' }, systemCell: { minWidth: '50%', paddingVertical: R.r12 }, systemCellLabel: { color: C.textMuted, fontSize: 7, letterSpacing: 1.3, fontFamily: ketherTokens.typography.system.fallback[0] }, systemCellValue: { color: C.textPrimary, fontSize: 10, marginTop: R.r3, fontFamily: ketherTokens.typography.system.fallback[0] }, syncBadge: { flexDirection: 'row', alignItems: 'center', gap: R.r6 }, syncDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.textMuted }, syncDotLive: { backgroundColor: C.goldBright }, syncText: { color: C.textMuted, fontSize: 8, letterSpacing: 1.1, fontFamily: ketherTokens.typography.system.fallback[0] }, errorNotice: { borderWidth: 1, borderColor: 'rgba(156,92,85,0.55)', backgroundColor: 'rgba(70,24,20,0.22)', padding: R.r12 }, errorTitle: { color: '#d6a39d', fontSize: 8, letterSpacing: 1.3, fontWeight: '800', fontFamily: ketherTokens.typography.system.fallback[0] }, errorText: { color: '#c7aaa6', fontSize: 12, lineHeight: 18, marginTop: R.r6, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  primaryButton: { minHeight: 54, borderWidth: 1, borderColor: C.goldMaterial, backgroundColor: C.goldMaterial, alignItems: 'center', justifyContent: 'center', paddingHorizontal: R.r24 }, primaryButtonQuiet: { backgroundColor: 'transparent', borderColor: 'rgba(203,176,109,0.34)' }, primaryButtonPressed: { opacity: 0.78 }, primaryButtonDisabled: { backgroundColor: C.surfaceRaised, borderColor: 'rgba(119,118,111,0.28)' }, primaryButtonText: { color: C.void, fontSize: 9, letterSpacing: 1.7, fontWeight: '800', fontFamily: ketherTokens.typography.system.fallback[0] }, primaryButtonTextQuiet: { color: C.goldBright }, primaryButtonTextDisabled: { color: C.textMuted }, footer: { marginTop: R.r24, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: R.r6 }, footerText: { color: C.textMuted, opacity: 0.64, fontSize: 7, letterSpacing: 1, fontFamily: ketherTokens.typography.system.fallback[0] },
});
