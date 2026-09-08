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
import { KetherOriginRelicNative } from './KetherOriginRelicNative';

type MacroAct = 'limiar' | 'revelacao' | 'jachin' | 'boaz' | 'meio' | 'selo';
type SyncState = 'idle' | 'starting' | 'sealing' | 'sealed' | 'demo' | 'error';
type PracticeDurations = { jachin: number; boaz: number; middle: number };
type SymbolKey = {
  id: 'louco' | 'fehu' | 'iching';
  mark: string;
  title: string;
  subtitle: string;
  text: string;
};

const ACTS: Array<{ id: MacroAct; roman: string; label: string }> = [
  { id: 'limiar', roman: 'I', label: 'LIMIAR' },
  { id: 'revelacao', roman: 'II', label: 'REVELAÇÃO' },
  { id: 'jachin', roman: 'III', label: 'EXPANSÃO' },
  { id: 'boaz', roman: 'IV', label: 'RESTRIÇÃO' },
  { id: 'meio', roman: 'V', label: 'CONVERGÊNCIA' },
  { id: 'selo', roman: 'VI', label: 'PASSAGEM' },
];

const SYMBOL_KEYS: SymbolKey[] = [
  {
    id: 'louco',
    mark: '0',
    title: 'O Louco',
    subtitle: 'O SALTO',
    text: 'No texto canônico, O Louco aparece à beira do precipício como imagem do salto de fé e da entrada no desconhecido de Kether.',
  },
  {
    id: 'fehu',
    mark: 'ᚠ',
    title: 'Fehu',
    subtitle: 'A FORÇA FECUNDANTE',
    text: 'No Pilar do Meio, Fehu participa da imagem de riqueza espiritual que fertiliza a experiência e aproxima força e forma.',
  },
  {
    id: 'iching',
    mark: '☰',
    title: 'Hexagrama 1',
    subtitle: 'O CRIATIVO',
    text: 'O Hexagrama 1 é apresentado pelo manuscrito como fogo iniciador do ciclo da criação cósmica: começo, potência e emanação.',
  },
];

const C = ketherTokens.color;
const R = hnkRhythm;

function createClientSessionId(userId: string): string {
  return `hnk-d001-v2-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === 'vault_secure_storage_unavailable_on_web') {
      return 'O Vault fechou com segurança. Use o app nativo para conteúdo íntimo enquanto a recuperação E2EE web não estiver congelada.';
    }
    if (error.message === 'authentication_required') {
      return 'A sessão do Átrio expirou. Entre novamente antes de selar o Dia.';
    }
    return error.message;
  }
  return 'Não foi possível concluir o selo digital.';
}

export function Day001ImmersiveMobileVerticalSlice() {
  const auth = useHnkAuth();
  const [day, setDay] = useState<Day001Snapshot | null>(null);
  const [act, setAct] = useState<MacroAct>('limiar');
  const [selectedKey, setSelectedKey] = useState<SymbolKey['id']>('louco');
  const [practice, setPractice] = useState<PracticeSessionRecord | null>(null);
  const [durations, setDurations] = useState<PracticeDurations>({ jachin: 0, boaz: 0, middle: 0 });
  const [jachinDone, setJachinDone] = useState(false);
  const [boazDone, setBoazDone] = useState(false);
  const [middleDone, setMiddleDone] = useState(false);
  const [distractions, setDistractions] = useState(['', '', '']);
  const [intention, setIntention] = useState('');
  const [mirror, setMirror] = useState('');
  const [contractAccepted, setContractAccepted] = useState(false);
  const [completion, setCompletion] = useState<CompletionResult | null>(null);
  const [vaultHash, setVaultHash] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [sparkWitnessed, setSparkWitnessed] = useState(false);

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

  const actIndex = ACTS.findIndex((item) => item.id === act);
  const selectedSymbol = SYMBOL_KEYS.find((item) => item.id === selectedKey) ?? SYMBOL_KEYS[0];
  const isLive = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);
  const totalDuration = durations.jachin + durations.boaz + durations.middle;
  const distractionsReady = distractions.every((value) => value.trim().length > 0);
  const middleReady = middleDone && intention.trim().length > 0 && mirror.trim().length > 0 && contractAccepted;

  async function beginPractice() {
    setSyncError(null);
    if (!isLive || !auth.client || !auth.userId) {
      setSyncState('demo');
      setAct('revelacao');
      return;
    }
    if (practice) {
      setAct('revelacao');
      return;
    }

    setSyncState('starting');
    try {
      const session = await startPracticeSession(auth.client, {
        day: 1,
        clientSessionId: createClientSessionId(auth.userId),
        mode: 'canonical',
        appVersion: '0.2.0-mobile-immersive',
      });
      setPractice(session);
      setSyncState('idle');
      setAct('revelacao');
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
      setSparkWitnessed(true);
      return;
    }

    setSyncState('sealing');
    try {
      let recordHash = vaultHash;
      if (!recordHash) {
        const plaintext = JSON.stringify({
          schema: 'hnk-day001-private-v3',
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
          jachin_completed: jachinDone,
          boaz_completed: boazDone,
          middle_completed: middleDone,
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
      setSparkWitnessed(true);
      setIntention('');
      setMirror('');
      setDistractions(['', '', '']);
    } catch (error) {
      setSyncState('error');
      setSyncError(errorMessage(error));
    }
  }

  if (!day) {
    return (
      <View style={styles.loading}>
        <OriginCosmos reduceMotion />
        <ActivityIndicator color={C.originWhite} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          day={day}
          act={act}
          live={isLive}
          onNavigate={(target) => {
            const targetIndex = ACTS.findIndex((item) => item.id === target);
            if (targetIndex <= actIndex) setAct(target);
          }}
          onSignOut={() => void auth.signOut()}
        />

        {syncError ? <ErrorNotice text={syncError} /> : null}

        {act === 'limiar' ? (
          <Panel>
            <OriginCosmos reduceMotion={reduceMotion} />
            <Text style={styles.kicker}>I · LIMIAR</Text>
            <Text style={styles.heroTitle}>
              Antes da forma,{`\n`}
              <Text style={styles.heroAccent}>uma possibilidade.</Text>
            </Text>
            <Text style={styles.heroBody}>
              Você não abriu uma lição. Você chegou ao primeiro limiar de Kether — a Coroa, em Atziluth, sob o ciclo de Vehuiah.
            </Text>
            <MetadataConstellation day={day} />
            <SyncBadge live={isLive} state={syncState} />
            <PrimaryAction
              label={syncState === 'starting' ? 'ABRINDO A CÂMARA…' : 'ATRAVESSAR O LIMIAR'}
              onPress={() => void beginPractice()}
              disabled={syncState === 'starting'}
            />
          </Panel>
        ) : null}

        {act === 'revelacao' ? (
          <Panel>
            <ActHeading
              eyebrow="II · REVELAÇÃO"
              title="Três chaves para compreender o começo."
              body="O Codex apresenta sua constelação simbólica antes da prática: começo, força fecundante e impulso criativo."
            />
            <View style={styles.symbolSelector}>
              {SYMBOL_KEYS.map((key) => (
                <Pressable
                  key={key.id}
                  style={[styles.symbolKey, selectedKey === key.id && styles.symbolKeyActive]}
                  onPress={() => setSelectedKey(key.id)}
                >
                  <Text style={styles.symbolMark}>{key.mark}</Text>
                  <View style={styles.symbolLabelWrap}>
                    <Text style={styles.symbolTitle}>{key.title}</Text>
                    <Text style={styles.symbolSubtitle}>{key.subtitle}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
            <View style={styles.symbolMeaning}>
              <Text style={styles.symbolMeaningMark}>{selectedSymbol.mark}</Text>
              <Text style={styles.kicker}>CHAVE ATIVA</Text>
              <Text style={styles.symbolMeaningTitle}>{selectedSymbol.title}</Text>
              <Text style={styles.editorialBody}>{selectedSymbol.text}</Text>
              <Text style={styles.systemNote}>
                Leitura derivada do texto canônico do Dia 001; não é uma definição universal dessas tradições.
              </Text>
            </View>
            <View style={styles.epistemicRibbon}>
              <Text style={styles.epistemicCode}>HNK-EP</Text>
              <Text style={styles.epistemicText}>
                Experiência espiritual, símbolo tradicional e sensação subjetiva permanecem distinguíveis de afirmação científica ou biomédica.
              </Text>
            </View>
            <KetherOriginRelicNative reduceMotion={reduceMotion} />
            <PrimaryAction label="ABRIR O MANUSCRITO" onPress={() => setAct('jachin')} />
          </Panel>
        ) : null}

        {act === 'jachin' ? (
          <Panel>
            <ActHeading eyebrow="III · JACHIN · EXPANSÃO" title="O conhecimento primeiro é lido. Depois, é praticado." />
            <Manuscript label="DOUTRINA · TEXTO CANÔNICO" title="O abismo silencioso de Kether" text={day.jachinDoctrine} />
            <View style={styles.notes}>
              <MarginNote label="CONCEITO" title="Vida Zoe" text="Linguagem teológica da vida divina usada pelo próprio manuscrito." />
              <MarginNote label="GESTO" title="O Salto" text="O Louco funciona como imagem de entrada e abandono temporário de definições." />
              <MarginNote
                label="REFERÊNCIA"
                title="Dai Koo Myo"
                text="Está no cânone; o master visual HNK continua pendente. O app não inventa um desenho."
              />
            </View>
            <PracticeChamber>
              <Text style={styles.kicker}>KAVANAH · PRÁTICA</Text>
              <Text style={styles.practiceTitle}>Dez minutos de foco.</Text>
              <Text style={styles.practiceText}>{day.jachinKavanah}</Text>
              <AudioPending />
              <RitualTimer
                targetSeconds={600}
                label="FOCO DE JACHIN"
                onCommit={(elapsed) => {
                  setDurations((current) => ({ ...current, jachin: elapsed }));
                  setJachinDone(true);
                }}
              />
            </PracticeChamber>
            <PrimaryAction
              label="CONTRAIR A FORÇA · ENTRAR EM BOAZ"
              onPress={() => setAct('boaz')}
              disabled={!jachinDone}
            />
          </Panel>
        ) : null}

        {act === 'boaz' ? (
          <Panel>
            <ActHeading
              eyebrow="IV · BOAZ · RESTRIÇÃO"
              title="A forma cria um vaso para a força."
              body="A experiência se contrai: menos abertura, mais limite, observação e escolha prática."
            />
            <BoazAxis />
            <Manuscript label="DOUTRINA · TEXTO CANÔNICO" title="O rigor como estrutura" text={day.boazDoctrine} />
            <PracticeChamber dark>
              <Text style={styles.kicker}>KAVANAH · PRÁTICA</Text>
              <Text style={styles.practiceText}>{day.boazKavanah}</Text>
              <Text style={styles.safetyNote}>
                Camada de segurança do produto: você pode ajustar postura, abrir os olhos ou encerrar. Desconforto não é meta nem requisito de progresso.
              </Text>
              <RitualTimer
                targetSeconds={300}
                label="RELAXAMENTO · BOAZ"
                onCommit={(elapsed) => {
                  setDurations((current) => ({ ...current, boaz: elapsed }));
                  setBoazDone(true);
                }}
              />
            </PracticeChamber>
            <View style={styles.lab}>
              <Text style={styles.kicker}>ORDÁLIA · LABORATÓRIO</Text>
              <Text style={styles.labTitle}>Retire três distrações do centro.</Text>
              <Text style={styles.editorialBody}>{day.boazOrdalia}</Text>
              <View style={styles.bladeStack}>
                {distractions.map((value, index) => (
                  <View key={index} style={[styles.blade, value.trim().length > 0 && styles.bladeActive]}>
                    <Text style={styles.bladeGhost}>0{index + 1}</Text>
                    <Text style={styles.bladeLabel}>DISTRAÇÃO</Text>
                    <TextInput
                      value={value}
                      onChangeText={(text) =>
                        setDistractions((current) => current.map((item, itemIndex) => (itemIndex === index ? text : item)))
                      }
                      placeholder={`Nomeie a distração ${index + 1}…`}
                      placeholderTextColor={C.textMuted}
                      style={styles.bladeInput}
                      multiline
                    />
                  </View>
                ))}
              </View>
            </View>
            <PrimaryAction
              label="CONVERGIR OS PILARES"
              onPress={() => setAct('meio')}
              disabled={!boazDone || !distractionsReady}
            />
          </Panel>
        ) : null}

        {act === 'meio' ? (
          <Panel>
            <ConvergenceGeometry />
            <ActHeading eyebrow="V · PILAR DO MEIO · CONVERGÊNCIA" title="Expansão e rigor deixam de competir." />
            <Manuscript label="INTEGRAÇÃO · TEXTO CANÔNICO" title="Força + forma" text={day.middleDoctrine} />
            <PracticeChamber>
              <Text style={styles.kicker}>KAVANAH VOCAL · SEM GRAVAÇÃO AUTOMÁTICA</Text>
              <Text style={styles.practiceTitle}>A voz como prática.</Text>
              <Text style={styles.practiceText}>{day.middleKavanah}</Text>
              <VoiceWave active={middleDone} reduceMotion={reduceMotion} />
              <RitualTimer
                targetSeconds={180}
                label="VOCALIZAÇÃO · PILAR DO MEIO"
                onCommit={(elapsed) => {
                  setDurations((current) => ({ ...current, middle: elapsed }));
                  setMiddleDone(true);
                }}
              />
              <Text style={styles.systemNote}>Nenhuma gravação, análise da voz ou upload é necessário para concluir o Dia.</Text>
            </PracticeChamber>
            <ReflectionField
              label="INTENÇÃO DO NEÓFITO"
              value={intention}
              onChange={setIntention}
              placeholder="O que você traz para esta travessia?"
            />
            <ReflectionField
              label="ESPELHO DA ALMA"
              value={mirror}
              onChange={setMirror}
              placeholder="O que mudou entre o início e agora?"
              large
            />
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: contractAccepted }}
              style={[styles.contract, contractAccepted && styles.contractActive]}
              onPress={() => setContractAccepted((value) => !value)}
            >
              <View style={[styles.contractNode, contractAccepted && styles.contractNodeActive]} />
              <Text style={styles.contractText}>
                {contractAccepted ? 'CONTRATO DO NEÓFITO · CONFIRMADO' : 'PRÁTICA VOLUNTÁRIA · RETORNO PRESERVADO'}
              </Text>
            </Pressable>
            <PrimaryAction label="PREPARAR O SELO" onPress={() => setAct('selo')} disabled={!middleReady} />
          </Panel>
        ) : null}

        {act === 'selo' ? (
          <Panel>
            <TreeField sealed={sparkWitnessed} reduceMotion={reduceMotion} />
            <Text style={styles.kicker}>VI · SELO · PASSAGEM</Text>
            <Text style={styles.sealTitle}>{sparkWitnessed ? 'Agora existe uma luz.' : 'A travessia pede um testemunho.'}</Text>
            {!sparkWitnessed ? (
              <>
                <Text style={styles.heroBody}>
                  O conteúdo íntimo será cifrado antes do sync. O Practice Record recebe apenas evidência estruturada; o servidor decide XP e progressão.
                </Text>
                <SystemStrip
                  items={[
                    ['JACHIN', `${durations.jachin}s`],
                    ['BOAZ', `${durations.boaz}s`],
                    ['MEIO', `${durations.middle}s`],
                    ['DISTRAÇÕES', '3 / 3'],
                  ]}
                />
                <PrimaryAction
                  label={syncState === 'sealing' ? 'CIFRANDO E SELANDO…' : isLive ? 'CIFRAR · REGISTRAR · CONCLUIR' : 'TESTEMUNHAR EM MODO DEMO'}
                  onPress={() => void sealDay()}
                  disabled={syncState === 'sealing'}
                />
              </>
            ) : (
              <>
                <View style={styles.rewardHalo}>
                  <Text style={styles.rewardLabel}>{completion ? 'RESPOSTA CANÔNICA DO SERVIDOR' : 'DEMONSTRAÇÃO · SEM PERSISTÊNCIA'}</Text>
                  <Text style={styles.rewardXp}>
                    {completion ? (completion.firstCompletion ? `+${completion.xpAwarded} XP` : 'XP JÁ SELADO') : `+${day.xp} XP`}
                  </Text>
                  <Text style={styles.rewardTotal}>1 DE 36 TRAVESSIAS DE KETHER</Text>
                </View>
                <Text style={styles.systemNote}>
                  O Fragmento I de Vehuiah continua reservado ao fechamento do ciclo no Dia 005.
                </Text>
                <PrimaryAction label="RETORNAR AO ÁTRIO TRANSFORMADO" onPress={() => setAct('limiar')} />
              </>
            )}
          </Panel>
        ) : null}

        <FooterStatus day={day} act={act} practice={practice} vaultHash={vaultHash} />
      </ScrollView>
    </View>
  );
}

function Header({
  day,
  act,
  live,
  onNavigate,
  onSignOut,
}: {
  day: Day001Snapshot;
  act: MacroAct;
  live: boolean;
  onNavigate: (target: MacroAct) => void;
  onSignOut: () => void;
}) {
  const current = ACTS.findIndex((item) => item.id === act);
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.systemEyebrow}>HNK CODEX · DIA {String(day.day).padStart(3, '0')}</Text>
          <Text style={styles.headerTitle}>KETHER</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.systemSource}>{day.source === 'supabase' ? 'CANON LIVE' : 'CANON OFFLINE'}</Text>
          {live ? (
            <Pressable onPress={onSignOut}>
              <Text style={styles.signOut}>SAIR DO ÁTRIO</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={styles.ritualMap} accessibilityLabel="Mapa ritual do Dia 001">
        {ACTS.map((item, index) => (
          <Pressable key={item.id} disabled={index > current} onPress={() => onNavigate(item.id)} style={styles.ritualStep}>
            <View style={[styles.ritualNode, index === current && styles.ritualNodeActive, index < current && styles.ritualNodeComplete]}>
              <Text style={styles.ritualRoman}>{item.roman}</Text>
            </View>
            <Text style={[styles.ritualLabel, index === current && styles.ritualLabelActive]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
}

function PracticeChamber({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <View style={[styles.practiceChamber, dark && styles.practiceChamberDark]}>{children}</View>;
}

function ActHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <View style={styles.actHeading}>
      <Text style={styles.kicker}>{eyebrow}</Text>
      <Text style={styles.actTitle}>{title}</Text>
      {body ? <Text style={styles.heroBody}>{body}</Text> : null}
    </View>
  );
}

function OriginCosmos({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <View style={styles.cosmos} accessibilityLabel="Geometria primordial de Kether">
      <View style={styles.cosmosAxis} />
      <View style={styles.cosmosRingOuter} />
      <View style={styles.cosmosRingMiddle} />
      <View style={styles.cosmosRingInner} />
      <View style={[styles.cosmosPoint, !reduceMotion && styles.cosmosPointGlow]} />
    </View>
  );
}

function MetadataConstellation({ day }: { day: Day001Snapshot }) {
  return (
    <View style={styles.metaWrap}>
      <Meta label="SEPHIRA" value={day.sephira.toUpperCase()} />
      <Meta label="MUNDO" value={day.world.toUpperCase()} />
      <Meta label="ANJO" value={day.angel.toUpperCase()} />
      <Meta label="GRAU" value="NEÓFITO" />
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function Manuscript({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <View style={styles.manuscript}>
      <Text style={styles.manuscriptLabel}>{label}</Text>
      <Text style={styles.manuscriptTitle}>{title}</Text>
      <View style={styles.manuscriptRule} />
      <Text style={styles.manuscriptText}>{text}</Text>
    </View>
  );
}

function MarginNote({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <View style={styles.marginNote}>
      <Text style={styles.marginLabel}>{label}</Text>
      <Text style={styles.marginTitle}>{title}</Text>
      <Text style={styles.marginText}>{text}</Text>
    </View>
  );
}

function RitualTimer({ targetSeconds, label, onCommit }: { targetSeconds: number; label: string; onCommit: (elapsed: number) => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [committed, setCommitted] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((value) => Math.min(targetSeconds, value + 1)), 1000);
    return () => clearInterval(id);
  }, [running, targetSeconds]);

  useEffect(() => {
    if (elapsed >= targetSeconds) setRunning(false);
  }, [elapsed, targetSeconds]);

  const remaining = Math.max(0, targetSeconds - elapsed);
  const formatted = useMemo(
    () => `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`,
    [remaining],
  );

  return (
    <View style={styles.timer}>
      <View style={styles.timerDial}>
        <Text style={styles.timerValue}>{formatted}</Text>
        <Text style={styles.timerLabel}>{label}</Text>
      </View>
      <View style={styles.timerActions}>
        <Pressable style={styles.timerButton} onPress={() => setRunning((value) => !value)}>
          <Text style={styles.timerButtonText}>{running ? 'PAUSAR' : elapsed === 0 ? 'INICIAR' : 'CONTINUAR'}</Text>
        </Pressable>
        <Pressable
          disabled={elapsed === 0}
          style={[styles.timerButton, elapsed === 0 && styles.timerButtonDisabled, committed && styles.timerButtonCommitted]}
          onPress={() => {
            if (elapsed === 0) return;
            setRunning(false);
            setCommitted(true);
            onCommit(elapsed);
          }}
        >
          <Text style={styles.timerButtonText}>{committed ? 'ETAPA REGISTRADA' : 'CONCLUIR ETAPA'}</Text>
        </Pressable>
      </View>
      <Text style={styles.timerSafety}>Você pode concluir antes do alvo. Nenhum bônus é concedido por desconforto ou intensidade subjetiva.</Text>
    </View>
  );
}

function AudioPending() {
  return <Text style={styles.audioPending}>ÁUDIO RITUAL · PRESET_PENDING · nenhuma frequência é escolhida silenciosamente</Text>;
}

function BoazAxis() {
  return (
    <View style={styles.boazAxis}>
      <View style={styles.boazLine} />
      <View style={[styles.boazNode, { top: 24 }]} />
      <View style={[styles.boazNode, { top: 104 }]} />
      <View style={[styles.boazNode, { top: 184 }]} />
    </View>
  );
}

function VoiceWave({ active, reduceMotion }: { active: boolean; reduceMotion: boolean }) {
  return (
    <View style={styles.waveField} accessibilityLabel="Visualização abstrata da prática vocal">
      {Array.from({ length: 21 }, (_, index) => {
        const height = 12 + ((index * 17) % 48);
        return <View key={index} style={[styles.waveBar, { height }, active && !reduceMotion && styles.waveBarActive]} />;
      })}
    </View>
  );
}

function ReflectionField({
  label,
  value,
  onChange,
  placeholder,
  large = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  large?: boolean;
}) {
  return (
    <View style={styles.reflectionField}>
      <Text style={styles.reflectionLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        style={[styles.reflectionInput, large && styles.reflectionInputLarge]}
        multiline
        textAlignVertical="top"
      />
    </View>
  );
}

function ConvergenceGeometry() {
  return (
    <View style={styles.convergence} accessibilityLabel="Geometria de convergência dos pilares">
      <View style={[styles.convergenceLine, styles.convergenceLeft]} />
      <View style={[styles.convergenceLine, styles.convergenceRight]} />
      <View style={styles.convergenceCenter} />
    </View>
  );
}

function TreeField({ sealed, reduceMotion }: { sealed: boolean; reduceMotion: boolean }) {
  const nodes = [
    [150, 34],
    [94, 96],
    [206, 96],
    [76, 174],
    [224, 174],
    [150, 220],
    [86, 300],
    [214, 300],
    [150, 366],
    [150, 430],
  ];
  return (
    <View
      style={styles.treeField}
      accessibilityLabel={sealed ? 'Árvore da Vida com Kether aceso' : 'Árvore da Vida aguardando primeira centelha'}
    >
      <View style={styles.treeStem} />
      {nodes.map(([left, top], index) => (
        <View
          key={index}
          style={[
            styles.treeNode,
            { left, top },
            index === 0 && sealed && styles.treeKetherLit,
            index === 0 && sealed && !reduceMotion && styles.treeKetherGlow,
          ]}
        />
      ))}
    </View>
  );
}

function SystemStrip({ items }: { items: Array<[string, string]> }) {
  return (
    <View style={styles.systemStrip}>
      {items.map(([label, value]) => (
        <View key={label} style={styles.systemCell}>
          <Text style={styles.systemCellLabel}>{label}</Text>
          <Text style={styles.systemCellValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function SyncBadge({ live, state }: { live: boolean; state: SyncState }) {
  return (
    <View style={styles.syncBadge}>
      <View style={[styles.syncDot, live && styles.syncDotLive]} />
      <Text style={styles.syncText}>{live ? `ÁTRIO AUTENTICADO · ${state.toUpperCase()}` : 'MODO DEMONSTRATIVO · SEM PERSISTÊNCIA'}</Text>
    </View>
  );
}

function ErrorNotice({ text }: { text: string }) {
  return (
    <View style={styles.errorNotice}>
      <Text style={styles.errorTitle}>SELO INTERROMPIDO COM SEGURANÇA</Text>
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

function PrimaryAction({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.primaryButtonPressed,
      ]}
    >
      <Text style={[styles.primaryButtonText, disabled && styles.primaryButtonTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

function FooterStatus({
  day,
  act,
  practice,
  vaultHash,
}: {
  day: Day001Snapshot;
  act: MacroAct;
  practice: PracticeSessionRecord | null;
  vaultHash: string | null;
}) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>SOURCE · {day.sourceSha.slice(0, 10)}</Text>
      <Text style={styles.footerText}>ATO · {ACTS.find((item) => item.id === act)?.label}</Text>
      <Text style={styles.footerText}>SESSION · {practice ? practice.id.slice(0, 8) : 'LOCAL'}</Text>
      <Text style={styles.footerText}>VAULT · {vaultHash ? vaultHash.slice(0, 8) : 'PENDING'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.void },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: R.r24, backgroundColor: C.void },
  scrollContent: { width: '100%', maxWidth: 820, alignSelf: 'center', paddingHorizontal: R.r24, paddingTop: R.r24, paddingBottom: R.r72 },
  header: { gap: R.r24, marginBottom: R.r24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: R.r12 },
  headerRight: { alignItems: 'flex-end' },
  systemEyebrow: { color: C.goldMaterial, fontSize: 9, letterSpacing: 2.2, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] },
  headerTitle: { color: C.originWhite, fontSize: 28, letterSpacing: 7, fontWeight: '300', marginTop: R.r6, fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  systemSource: { color: C.textMuted, fontSize: 8, letterSpacing: 1.4, fontFamily: ketherTokens.typography.system.fallback[0] },
  signOut: { color: C.goldMaterial, opacity: 0.7, fontSize: 8, letterSpacing: 1.1, marginTop: R.r6, fontFamily: ketherTokens.typography.system.fallback[0] },
  ritualMap: { flexDirection: 'row', justifyContent: 'space-between', gap: R.r3, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.14)', paddingVertical: R.r12 },
  ritualStep: { flex: 1, alignItems: 'center', gap: R.r6 },
  ritualNode: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(203,176,109,0.2)', alignItems: 'center', justifyContent: 'center' },
  ritualNodeActive: { borderColor: C.goldBright, shadowColor: C.goldBright, shadowOpacity: 0.28, shadowRadius: 12 },
  ritualNodeComplete: { borderColor: 'rgba(203,176,109,0.55)', backgroundColor: 'rgba(203,176,109,0.08)' },
  ritualRoman: { color: C.textSecondary, fontSize: 8, fontFamily: ketherTokens.typography.system.fallback[0] },
  ritualLabel: { color: C.textMuted, fontSize: 6.5, letterSpacing: 0.6, fontFamily: ketherTokens.typography.system.fallback[0] },
  ritualLabelActive: { color: C.goldBright },
  panel: { minHeight: 560, gap: R.r24, paddingVertical: R.r24, paddingHorizontal: R.r24, borderWidth: 1, borderColor: 'rgba(203,176,109,0.14)', backgroundColor: 'rgba(255,253,244,0.012)' },
  kicker: { color: C.goldMaterial, fontSize: 9, letterSpacing: 2.1, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] },
  heroTitle: { color: C.originWhite, fontSize: 44, lineHeight: 49, fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  heroAccent: { color: C.goldBright, fontStyle: 'italic' },
  heroBody: { color: C.textSecondary, fontSize: 16, lineHeight: 25, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  actHeading: { gap: R.r12 },
  actTitle: { color: C.originWhite, fontSize: 35, lineHeight: 41, fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  cosmos: { height: 330, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cosmosAxis: { position: 'absolute', width: 1, height: 270, backgroundColor: 'rgba(255,253,244,0.18)' },
  cosmosRingOuter: { position: 'absolute', width: 270, height: 270, borderRadius: 135, borderWidth: 1, borderColor: 'rgba(203,176,109,0.24)' },
  cosmosRingMiddle: { position: 'absolute', width: 178, height: 178, borderRadius: 89, borderWidth: 1, borderColor: 'rgba(203,176,109,0.16)' },
  cosmosRingInner: { position: 'absolute', width: 86, height: 86, borderRadius: 43, borderWidth: 1, borderColor: 'rgba(255,253,244,0.18)' },
  cosmosPoint: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.originWhite },
  cosmosPointGlow: { shadowColor: C.originWhite, shadowOpacity: 0.8, shadowRadius: 30 },
  metaWrap: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.14)' },
  metaCell: { width: '50%', paddingVertical: R.r12, paddingHorizontal: R.r12, borderRightWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.08)' },
  metaLabel: { color: C.textMuted, fontSize: 7, letterSpacing: 1.4, fontFamily: ketherTokens.typography.system.fallback[0] },
  metaValue: { color: C.textPrimary, fontSize: 12, letterSpacing: 1, marginTop: R.r6, fontFamily: ketherTokens.typography.system.fallback[0] },
  symbolSelector: { gap: R.r6 },
  symbolKey: { flexDirection: 'row', alignItems: 'center', gap: R.r12, borderWidth: 1, borderColor: 'rgba(203,176,109,0.12)', padding: R.r12, opacity: 0.58 },
  symbolKeyActive: { opacity: 1, borderColor: 'rgba(203,176,109,0.55)', backgroundColor: 'rgba(203,176,109,0.045)' },
  symbolMark: { width: 48, color: C.goldBright, fontSize: 28, textAlign: 'center', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  symbolLabelWrap: { flex: 1 },
  symbolTitle: { color: C.textPrimary, fontSize: 18, fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  symbolSubtitle: { color: C.textMuted, fontSize: 7, letterSpacing: 1.1, marginTop: R.r3, fontFamily: ketherTokens.typography.system.fallback[0] },
  symbolMeaning: { minHeight: 260, borderWidth: 1, borderColor: 'rgba(203,176,109,0.18)', padding: R.r24, overflow: 'hidden' },
  symbolMeaningMark: { position: 'absolute', right: -8, bottom: -40, color: 'rgba(203,176,109,0.06)', fontSize: 170, fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  symbolMeaningTitle: { color: C.originWhite, fontSize: 34, marginVertical: R.r12, fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  editorialBody: { color: C.textPrimary, fontSize: 16, lineHeight: 27, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  systemNote: { color: C.textMuted, fontSize: 10, lineHeight: 16, fontFamily: ketherTokens.typography.system.fallback[0] },
  epistemicRibbon: { borderLeftWidth: 1, borderColor: C.goldMaterial, paddingLeft: R.r12, gap: R.r6 },
  epistemicCode: { color: C.goldBright, fontSize: 8, letterSpacing: 1.7, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] },
  epistemicText: { color: C.textMuted, fontSize: 11, lineHeight: 18, fontFamily: ketherTokens.typography.system.fallback[0] },
  manuscript: { gap: R.r12, padding: R.r24, borderWidth: 1, borderColor: 'rgba(203,176,109,0.18)', backgroundColor: 'rgba(255,253,244,0.018)' },
  manuscriptLabel: { color: C.textMuted, fontSize: 8, letterSpacing: 1.5, fontFamily: ketherTokens.typography.system.fallback[0] },
  manuscriptTitle: { color: C.originWhite, fontSize: 31, lineHeight: 37, fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  manuscriptRule: { height: 1, backgroundColor: 'rgba(203,176,109,0.18)' },
  manuscriptText: { color: C.textPrimary, fontSize: 17, lineHeight: 30, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  notes: { gap: R.r6 },
  marginNote: { borderLeftWidth: 1, borderColor: 'rgba(203,176,109,0.25)', paddingLeft: R.r12, paddingVertical: R.r6 },
  marginLabel: { color: C.textMuted, fontSize: 7, letterSpacing: 1.4, fontFamily: ketherTokens.typography.system.fallback[0] },
  marginTitle: { color: C.goldBright, fontSize: 17, marginVertical: R.r3, fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  marginText: { color: C.textSecondary, fontSize: 12, lineHeight: 18, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  practiceChamber: { gap: R.r12, padding: R.r24, borderWidth: 1, borderColor: 'rgba(203,176,109,0.16)', backgroundColor: 'rgba(0,0,0,0.32)' },
  practiceChamberDark: { backgroundColor: 'rgba(0,0,0,0.48)' },
  practiceTitle: { color: C.originWhite, fontSize: 29, fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  practiceText: { color: C.textSecondary, fontSize: 15, lineHeight: 25, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  safetyNote: { color: C.textMuted, fontSize: 10, lineHeight: 17, borderLeftWidth: 1, borderColor: 'rgba(203,176,109,0.2)', paddingLeft: R.r12, fontFamily: ketherTokens.typography.system.fallback[0] },
  audioPending: { color: C.textMuted, fontSize: 8, letterSpacing: 0.8, borderWidth: 1, borderColor: 'rgba(203,176,109,0.12)', padding: R.r12, fontFamily: ketherTokens.typography.system.fallback[0] },
  timer: { gap: R.r12, alignItems: 'center', paddingVertical: R.r12 },
  timerDial: { width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: 'rgba(203,176,109,0.38)', alignItems: 'center', justifyContent: 'center' },
  timerValue: { color: C.originWhite, fontSize: 30, fontVariant: ['tabular-nums'], fontFamily: ketherTokens.typography.system.fallback[0] },
  timerLabel: { color: C.textMuted, fontSize: 7, letterSpacing: 1.2, marginTop: R.r6, fontFamily: ketherTokens.typography.system.fallback[0] },
  timerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: R.r6 },
  timerButton: { borderWidth: 1, borderColor: 'rgba(203,176,109,0.38)', paddingVertical: R.r12, paddingHorizontal: R.r12 },
  timerButtonDisabled: { opacity: 0.3 },
  timerButtonCommitted: { borderColor: C.goldMaterial, backgroundColor: 'rgba(203,176,109,0.08)' },
  timerButtonText: { color: C.goldBright, fontSize: 8, letterSpacing: 1.1, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] },
  timerSafety: { color: C.textMuted, fontSize: 9, lineHeight: 15, textAlign: 'center', fontFamily: ketherTokens.typography.system.fallback[0] },
  boazAxis: { height: 220, width: 100, alignSelf: 'center', position: 'relative', marginVertical: R.r6 },
  boazLine: { position: 'absolute', left: 49, top: 10, width: 1, height: 200, backgroundColor: 'rgba(203,176,109,0.3)' },
  boazNode: { position: 'absolute', left: 39, width: 20, height: 20, borderWidth: 1, borderColor: 'rgba(203,176,109,0.45)', backgroundColor: C.void, transform: [{ rotate: '45deg' }] },
  lab: { gap: R.r12, borderWidth: 1, borderColor: 'rgba(203,176,109,0.14)', padding: R.r24 },
  labTitle: { color: C.originWhite, fontSize: 29, fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  bladeStack: { gap: R.r12 },
  blade: { minHeight: 170, borderWidth: 1, borderColor: 'rgba(203,176,109,0.15)', padding: R.r12, overflow: 'hidden' },
  bladeActive: { borderColor: 'rgba(203,176,109,0.55)', backgroundColor: 'rgba(203,176,109,0.03)' },
  bladeGhost: { position: 'absolute', right: 12, top: -6, color: 'rgba(203,176,109,0.06)', fontSize: 62, fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  bladeLabel: { color: C.textMuted, fontSize: 7, letterSpacing: 1.3, fontFamily: ketherTokens.typography.system.fallback[0] },
  bladeInput: { minHeight: 100, marginTop: R.r12, color: C.textPrimary, fontSize: 14, lineHeight: 22, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.18)', fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  convergence: { height: 120, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  convergenceLine: { position: 'absolute', width: 140, height: 1, backgroundColor: 'rgba(203,176,109,0.32)' },
  convergenceLeft: { left: 25, transform: [{ rotate: '9deg' }] },
  convergenceRight: { right: 25, transform: [{ rotate: '-9deg' }] },
  convergenceCenter: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: C.goldMaterial, backgroundColor: C.void, shadowColor: C.goldBright, shadowOpacity: 0.24, shadowRadius: 16 },
  waveField: { height: 90, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.08)' },
  waveBar: { width: 2, backgroundColor: 'rgba(203,176,109,0.3)' },
  waveBarActive: { backgroundColor: 'rgba(244,216,142,0.75)' },
  reflectionField: { gap: R.r12, borderWidth: 1, borderColor: 'rgba(203,176,109,0.14)', padding: R.r12 },
  reflectionLabel: { color: C.goldMaterial, fontSize: 8, letterSpacing: 1.3, fontFamily: ketherTokens.typography.system.fallback[0] },
  reflectionInput: { minHeight: 100, color: C.textPrimary, fontSize: 14, lineHeight: 22, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  reflectionInputLarge: { minHeight: 150 },
  contract: { flexDirection: 'row', alignItems: 'center', gap: R.r12, borderWidth: 1, borderColor: 'rgba(203,176,109,0.18)', padding: R.r12 },
  contractActive: { borderColor: 'rgba(203,176,109,0.55)', backgroundColor: 'rgba(203,176,109,0.04)' },
  contractNode: { width: 12, height: 12, borderWidth: 1, borderColor: C.goldMaterial, transform: [{ rotate: '45deg' }] },
  contractNodeActive: { backgroundColor: C.goldMaterial, shadowColor: C.goldBright, shadowOpacity: 0.4, shadowRadius: 10 },
  contractText: { flex: 1, color: C.textSecondary, fontSize: 9, letterSpacing: 0.8, fontFamily: ketherTokens.typography.system.fallback[0] },
  treeField: { width: 300, height: 470, alignSelf: 'center', position: 'relative' },
  treeStem: { position: 'absolute', left: 149, top: 30, width: 1, height: 410, backgroundColor: 'rgba(203,176,109,0.18)' },
  treeNode: { position: 'absolute', width: 22, height: 22, marginLeft: -11, marginTop: -11, borderRadius: 11, borderWidth: 1, borderColor: 'rgba(203,176,109,0.22)', backgroundColor: C.void },
  treeKetherLit: { borderColor: C.goldBright, backgroundColor: 'rgba(203,176,109,0.14)' },
  treeKetherGlow: { shadowColor: C.goldBright, shadowOpacity: 0.75, shadowRadius: 26 },
  sealTitle: { color: C.originWhite, fontSize: 39, lineHeight: 45, fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  rewardHalo: { alignItems: 'center', gap: R.r6, paddingVertical: R.r36, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.22)' },
  rewardLabel: { color: C.textMuted, fontSize: 8, letterSpacing: 1.4, fontFamily: ketherTokens.typography.system.fallback[0] },
  rewardXp: { color: C.goldBright, fontSize: 48, fontWeight: '300', fontFamily: ketherTokens.typography.sacredDisplay.fallback[0] },
  rewardTotal: { color: C.textSecondary, fontSize: 9, letterSpacing: 1.1, fontFamily: ketherTokens.typography.system.fallback[0] },
  systemStrip: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: 'rgba(203,176,109,0.13)' },
  systemCell: { width: '50%', padding: R.r12, borderRightWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(203,176,109,0.08)' },
  systemCellLabel: { color: C.textMuted, fontSize: 7, letterSpacing: 1.2, fontFamily: ketherTokens.typography.system.fallback[0] },
  systemCellValue: { color: C.textPrimary, fontSize: 11, marginTop: R.r6, fontFamily: ketherTokens.typography.system.fallback[0] },
  syncBadge: { flexDirection: 'row', alignItems: 'center', gap: R.r6, alignSelf: 'flex-start' },
  syncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.textMuted },
  syncDotLive: { backgroundColor: C.goldBright, shadowColor: C.goldBright, shadowOpacity: 0.5, shadowRadius: 8 },
  syncText: { color: C.textMuted, fontSize: 8, letterSpacing: 0.8, fontFamily: ketherTokens.typography.system.fallback[0] },
  errorNotice: { borderWidth: 1, borderColor: 'rgba(201,120,84,0.38)', backgroundColor: 'rgba(68,31,20,0.26)', padding: R.r12, gap: R.r6, marginBottom: R.r12 },
  errorTitle: { color: '#d7a27e', fontSize: 8, letterSpacing: 1.1, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] },
  errorText: { color: C.textSecondary, fontSize: 11, lineHeight: 17, fontFamily: ketherTokens.typography.editorialBody.fallback[0] },
  primaryButton: { alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(203,176,109,0.55)', backgroundColor: 'rgba(203,176,109,0.07)', paddingVertical: R.r12, paddingHorizontal: R.r24 },
  primaryButtonPressed: { backgroundColor: 'rgba(203,176,109,0.14)' },
  primaryButtonDisabled: { opacity: 0.28 },
  primaryButtonText: { color: C.goldBright, fontSize: 9, letterSpacing: 1.2, fontWeight: '700', fontFamily: ketherTokens.typography.system.fallback[0] },
  primaryButtonTextDisabled: { color: C.textMuted },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: R.r12, marginTop: R.r24, paddingTop: R.r12, borderTopWidth: 1, borderColor: 'rgba(203,176,109,0.1)' },
  footerText: { color: C.textMuted, fontSize: 7, letterSpacing: 0.7, fontFamily: ketherTokens.typography.system.fallback[0] },
});