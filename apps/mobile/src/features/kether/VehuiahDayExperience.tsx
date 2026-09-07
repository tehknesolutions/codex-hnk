import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
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
  parseVehuiahFragment,
  saveEncryptedVaultEntry,
  savePracticeRecord,
  startPracticeSession,
  type CompletionResult,
  type PracticeSessionRecord,
} from '@hnk/supabase-client';
import { useHnkAuth } from '../auth/AuthContext';
import { encryptVaultText } from '../vault/vault-crypto';
import {
  loadVehuiahDay,
  type VehuiahContentDay,
  type VehuiahDaySnapshot,
} from './cycle01-data';

export interface VehuiahDayExperienceProps {
  dayNumber: VehuiahContentDay;
  onServerProgress?: (result: CompletionResult) => void;
}

type SyncState = 'idle' | 'starting' | 'sealing' | 'sealed' | 'demo' | 'error';

type Day2State = {
  stillnessSeconds: number;
  impulses: number;
  postureAdjustments: number;
  comfort: number | null;
  quietude: number | null;
  integrationSeconds: number;
  reflection: string;
};

type Day3State = {
  observationSeconds: number;
  thoughtEntanglements: number;
  beliefs: [string, string, string];
  complaintFastStarted: boolean;
  boazSeconds: number;
  integrationSeconds: number;
  reflection: string;
};

type Day4State = {
  mantleSeconds: number;
  cancelSeconds: number;
  cancelCount: number;
  trigger: string;
  swishStep: number;
  reflection: string;
};

type Day5State = {
  breathSeconds: number;
  gestureSteps: boolean[];
  sphereSeconds: number;
  journal: string;
};

const INITIAL_DAY2: Day2State = {
  stillnessSeconds: 0,
  impulses: 0,
  postureAdjustments: 0,
  comfort: null,
  quietude: null,
  integrationSeconds: 0,
  reflection: '',
};
const INITIAL_DAY3: Day3State = {
  observationSeconds: 0,
  thoughtEntanglements: 0,
  beliefs: ['', '', ''],
  complaintFastStarted: false,
  boazSeconds: 0,
  integrationSeconds: 0,
  reflection: '',
};
const INITIAL_DAY4: Day4State = {
  mantleSeconds: 0,
  cancelSeconds: 0,
  cancelCount: 0,
  trigger: '',
  swishStep: 0,
  reflection: '',
};
const INITIAL_DAY5: Day5State = {
  breathSeconds: 0,
  gestureSteps: [false, false, false, false, false],
  sphereSeconds: 0,
  journal: '',
};

const PHASES: Record<VehuiahContentDay, string[]> = {
  2: ['threshold', 'stillness', 'integration', 'mirror', 'complete'],
  3: ['threshold', 'observe', 'beliefs', 'boaz', 'integration', 'mirror', 'complete'],
  4: ['threshold', 'mantle', 'cancel', 'swish', 'mirror', 'complete'],
  5: ['threshold', 'breath', 'gestures', 'sphere', 'journal', 'complete'],
};

function createClientSessionId(day: number, userId: string): string {
  return `hnk-d${String(day).padStart(3, '0')}-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return 'Não foi possível concluir o selo digital.';
  if (error.message === 'vault_secure_storage_unavailable_on_web') {
    return 'O Vault V1 fecha com segurança no web. Para selar conteúdo íntimo, use o app mobile enquanto a recuperação E2EE web/multi-device não estiver congelada.';
  }
  if (error.message === 'previous_day_required') return 'O servidor manteve a sequência: conclua o Dia anterior antes de selar este.';
  if (error.message === 'authentication_required') return 'A sessão do Átrio expirou. Entre novamente.';
  return error.message;
}

export function VehuiahDayExperience({ dayNumber, onServerProgress }: VehuiahDayExperienceProps) {
  const auth = useHnkAuth();
  const [snapshot, setSnapshot] = useState<VehuiahDaySnapshot | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [practice, setPractice] = useState<PracticeSessionRecord | null>(null);
  const [completion, setCompletion] = useState<CompletionResult | null>(null);
  const [vaultHash, setVaultHash] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [day2, setDay2] = useState<Day2State>(INITIAL_DAY2);
  const [day3, setDay3] = useState<Day3State>(INITIAL_DAY3);
  const [day4, setDay4] = useState<Day4State>(INITIAL_DAY4);
  const [day5, setDay5] = useState<Day5State>(INITIAL_DAY5);

  useEffect(() => {
    let active = true;
    setSnapshot(null);
    setPhaseIndex(0);
    setPractice(null);
    setCompletion(null);
    setVaultHash(null);
    setSyncState('idle');
    setSyncError(null);
    setDay2(INITIAL_DAY2);
    setDay3(INITIAL_DAY3);
    setDay4(INITIAL_DAY4);
    setDay5(INITIAL_DAY5);
    void loadVehuiahDay(dayNumber, auth.accessToken ?? undefined).then((loaded) => {
      if (active) setSnapshot(loaded);
    });
    return () => {
      active = false;
    };
  }, [dayNumber, auth.accessToken]);

  const phases = PHASES[dayNumber];
  const phase = phases[phaseIndex] ?? 'complete';
  const isLive = Boolean(auth.configured && auth.phase === 'signed-in' && auth.client && auth.userId);

  function advance() {
    setPhaseIndex((value) => Math.min(phases.length - 1, value + 1));
  }

  async function begin() {
    setSyncError(null);
    if (!isLive || !auth.client || !auth.userId) {
      setSyncState('demo');
      advance();
      return;
    }
    if (practice) {
      advance();
      return;
    }
    setSyncState('starting');
    try {
      const session = await startPracticeSession(auth.client, {
        day: dayNumber,
        clientSessionId: createClientSessionId(dayNumber, auth.userId),
        mode: 'canonical',
        appVersion: '0.1.0',
      });
      setPractice(session);
      setSyncState('idle');
      advance();
    } catch (error) {
      setSyncState('error');
      setSyncError(describeError(error));
    }
  }

  async function seal() {
    if (!snapshot) return;
    setSyncError(null);

    if (!isLive || !auth.client || !auth.userId || !practice) {
      setSyncState('demo');
      setPhaseIndex(phases.length - 1);
      return;
    }

    setSyncState('sealing');
    try {
      const privatePayload = buildPrivatePayload(dayNumber, day2, day3, day4, day5);
      let recordHash = vaultHash;
      if (!recordHash) {
        const encrypted = await encryptVaultText({
          userId: auth.userId,
          day: dayNumber,
          kind: 'journal',
          plaintext: JSON.stringify(privatePayload),
        });
        await saveEncryptedVaultEntry(auth.client, { day: dayNumber, payload: encrypted });
        recordHash = encrypted.checksumSha256;
        setVaultHash(recordHash);
      }

      const record = buildPracticeRecord(dayNumber, day2, day3, day4, day5);
      await savePracticeRecord(auth.client, {
        sessionId: practice.id,
        durationSeconds: record.durationSeconds,
        metrics: record.metrics,
        evidence: record.evidence,
        readyForCompletion: true,
        endedAt: new Date().toISOString(),
        localRecordHash: recordHash,
      });

      const result = await completeCodexDay(auth.client, {
        day: dayNumber,
        sessionId: practice.id,
        localRecordHash: recordHash,
      });

      setCompletion(result);
      setSyncState('sealed');
      clearPrivateText(dayNumber, setDay2, setDay3, setDay4, setDay5);
      setPhaseIndex(phases.length - 1);
      onServerProgress?.(result);
    } catch (error) {
      setSyncState('error');
      setSyncError(describeError(error));
    }
  }

  if (!snapshot) {
    return (
      <View style={styles.loading}>
        <VehuiahGlyph day={dayNumber} phase={0} />
        <ActivityIndicator color="#fff8df" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <DayHeader snapshot={snapshot} phaseIndex={phaseIndex} phaseCount={phases.length} />
        <VehuiahGlyph day={dayNumber} phase={phaseIndex} />

        {phase === 'threshold' ? (
          <Threshold
            snapshot={snapshot}
            isLive={isLive}
            syncState={syncState}
            error={syncError}
            onBegin={() => void begin()}
          />
        ) : null}

        {dayNumber === 2 ? (
          <Day2Phases
            phase={phase}
            snapshot={snapshot}
            state={day2}
            setState={setDay2}
            syncState={syncState}
            syncError={syncError}
            completion={completion}
            onAdvance={advance}
            onSeal={() => void seal()}
          />
        ) : null}

        {dayNumber === 3 ? (
          <Day3Phases
            phase={phase}
            snapshot={snapshot}
            state={day3}
            setState={setDay3}
            syncState={syncState}
            syncError={syncError}
            completion={completion}
            onAdvance={advance}
            onSeal={() => void seal()}
          />
        ) : null}

        {dayNumber === 4 ? (
          <Day4Phases
            phase={phase}
            snapshot={snapshot}
            state={day4}
            setState={setDay4}
            syncState={syncState}
            syncError={syncError}
            completion={completion}
            onAdvance={advance}
            onSeal={() => void seal()}
          />
        ) : null}

        {dayNumber === 5 ? (
          <Day5Phases
            phase={phase}
            snapshot={snapshot}
            state={day5}
            setState={setDay5}
            syncState={syncState}
            syncError={syncError}
            completion={completion}
            onAdvance={advance}
            onSeal={() => void seal()}
          />
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>VEHUIAH · {dayNumber}/5</Text>
          <Text style={styles.footerText}>SOURCE · {snapshot.sourceSha.slice(0, 10)}</Text>
          <Text style={styles.footerText}>SESSION · {practice ? practice.id.slice(0, 8) : 'LOCAL'}</Text>
          <Text style={styles.footerText}>VAULT · {vaultHash ? vaultHash.slice(0, 8) : 'PENDING'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Day2Phases({
  phase,
  snapshot,
  state,
  setState,
  syncState,
  syncError,
  completion,
  onAdvance,
  onSeal,
}: DayPhaseProps<Day2State>) {
  if (phase === 'stillness') {
    return (
      <Card eyebrow="ESTABILIDADE" title="A estátua não é sofrimento">
        <Canonical>{snapshot.boazKavanah}</Canonical>
        <Safety>
          A instrução canônica fala em imobilidade. No produto, dor, dormência persistente, tontura ou necessidade real de ajuste nunca contam como falha. Ajuste a postura e registre o evento; o objetivo é observar, não suportar dano.
        </Safety>
        <RitualClock
          targetSeconds={900}
          value={state.stillnessSeconds}
          onChange={(stillnessSeconds) => setState((current) => ({ ...current, stillnessSeconds }))}
        />
        <View style={styles.counterRow}>
          <Counter label="IMPULSOS PERCEBIDOS" value={state.impulses} onPress={() => setState((current) => ({ ...current, impulses: current.impulses + 1 }))} />
          <Counter label="AJUSTES REAIS" value={state.postureAdjustments} onPress={() => setState((current) => ({ ...current, postureAdjustments: current.postureAdjustments + 1 }))} />
        </View>
        <Scale label="CONFORTO" value={state.comfort} onChange={(comfort) => setState((current) => ({ ...current, comfort }))} />
        <Scale label="QUIETUDE" value={state.quietude} onChange={(quietude) => setState((current) => ({ ...current, quietude }))} />
        <Primary
          label="ENTRAR NA INTEGRAÇÃO"
          onPress={onAdvance}
          disabled={state.stillnessSeconds < 900 || state.comfort === null || state.quietude === null}
        />
      </Card>
    );
  }
  if (phase === 'integration') {
    return (
      <Card eyebrow="CONVERGÊNCIA" title="Do corpo imóvel ao eixo">
        <Canonical>{snapshot.middleKavanah}</Canonical>
        <Epistemic>
          Luz, canais e bioenergia permanecem linguagem ritual/fenomenológica HNK. O app não converte a visualização em diagnóstico fisiológico nem mede “energia sutil”.
        </Epistemic>
        <RitualClock
          targetSeconds={180}
          value={state.integrationSeconds}
          onChange={(integrationSeconds) => setState((current) => ({ ...current, integrationSeconds }))}
        />
        <Primary label="ABRIR O ESPELHO" onPress={onAdvance} disabled={state.integrationSeconds < 180} />
      </Card>
    );
  }
  if (phase === 'mirror') {
    return (
      <Card eyebrow="ESPELHO" title="O que aconteceu nos primeiros minutos?">
        <Canonical>{snapshot.boazOrdalia}</Canonical>
        <TextInput
          value={state.reflection}
          onChangeText={(reflection) => setState((current) => ({ ...current, reflection }))}
          placeholder="REGISTRO PRIVADO — VAI PARA O VAULT CIFRADO"
          placeholderTextColor="#656871"
          style={styles.textArea}
          multiline
        />
        {syncError ? <ErrorBox text={syncError} /> : null}
        <Primary
          label={syncState === 'sealing' ? 'SELANDO…' : 'CIFRAR E SELAR DIA 002'}
          onPress={onSeal}
          disabled={state.reflection.trim().length === 0 || syncState === 'sealing'}
        />
      </Card>
    );
  }
  if (phase === 'complete') return <Completion snapshot={snapshot} completion={completion} cycleLabel="VEHUIAH 2/5 · ESTABILIDADE" />;
  return null;
}

function Day3Phases({ phase, snapshot, state, setState, syncState, syncError, completion, onAdvance, onSeal }: DayPhaseProps<Day3State>) {
  if (phase === 'observe') {
    return (
      <Card eyebrow="LUCIDEZ" title="O fluxo passa; o centro permanece">
        <Canonical>{snapshot.jachinKavanah}</Canonical>
        <RitualClock
          targetSeconds={600}
          value={state.observationSeconds}
          onChange={(observationSeconds) => setState((current) => ({ ...current, observationSeconds }))}
        />
        <Counter
          label="PERCEBI QUE ME ENVOLVI COM UM PENSAMENTO"
          value={state.thoughtEntanglements}
          onPress={() => setState((current) => ({ ...current, thoughtEntanglements: current.thoughtEntanglements + 1 }))}
        />
        <Epistemic>O contador registra atenção, não “fracasso”. Pensar durante uma prática de observação não invalida a sessão.</Epistemic>
        <Primary label="AUDITAR TRÊS CRENÇAS" onPress={onAdvance} disabled={state.observationSeconds < 600} />
      </Card>
    );
  }
  if (phase === 'beliefs') {
    return (
      <Card eyebrow="BELIEF AUDIT" title="Três crenças para questionar, não para obedecer">
        <Canonical>{snapshot.jachinOrdalia}</Canonical>
        {state.beliefs.map((value, index) => (
          <TextInput
            key={index}
            value={value}
            onChangeText={(text) => setState((current) => ({ ...current, beliefs: current.beliefs.map((item, i) => i === index ? text : item) as [string, string, string] }))}
            placeholder={`CRENÇA ${index + 1} · VAULT PRIVADO`}
            placeholderTextColor="#656871"
            style={styles.input}
          />
        ))}
        <Primary label="ENCONTRAR A RESTRIÇÃO" onPress={onAdvance} disabled={state.beliefs.some((value) => value.trim().length === 0)} />
      </Card>
    );
  }
  if (phase === 'boaz') {
    return (
      <Card eyebrow="RESTRIÇÃO" title="Perguntar sem forçar resposta">
        <Canonical>{snapshot.boazKavanah}</Canonical>
        <Safety>
          A experiência trata qualquer resposta interna como conteúdo subjetivo. Não existe obrigação de “entrar em transe” nem de obter resposta; mantenha controle voluntário e encerre se houver desconforto.
        </Safety>
        <RitualClock targetSeconds={180} value={state.boazSeconds} onChange={(boazSeconds) => setState((current) => ({ ...current, boazSeconds }))} />
        <Pressable
          style={[styles.oath, state.complaintFastStarted && styles.oathActive]}
          onPress={() => setState((current) => ({ ...current, complaintFastStarted: true }))}
        >
          <Text style={styles.oathTitle}>24H · JEJUM DE RECLAMAÇÃO</Text>
          <Text style={styles.oathText}>{state.complaintFastStarted ? 'INICIADO — o app registra apenas este booleano.' : snapshot.boazOrdalia}</Text>
        </Pressable>
        <Primary label="INTEGRAR" onPress={onAdvance} disabled={state.boazSeconds < 180 || !state.complaintFastStarted} />
      </Card>
    );
  }
  if (phase === 'integration') {
    return (
      <Card eyebrow="CONVERGÊNCIA" title="Luz no centro, linguagem no lugar">
        <Canonical>{snapshot.middleKavanah}</Canonical>
        <RitualClock targetSeconds={180} value={state.integrationSeconds} onChange={(integrationSeconds) => setState((current) => ({ ...current, integrationSeconds }))} />
        <Primary label="ABRIR O ESPELHO" onPress={onAdvance} disabled={state.integrationSeconds < 180} />
      </Card>
    );
  }
  if (phase === 'mirror') {
    return (
      <Card eyebrow="ESPELHO" title="O que mudou quando você parou de se confundir com o pensamento?">
        <TextInput value={state.reflection} onChangeText={(reflection) => setState((current) => ({ ...current, reflection }))} placeholder="REGISTRO PRIVADO — VAULT CIFRADO" placeholderTextColor="#656871" style={styles.textArea} multiline />
        {syncError ? <ErrorBox text={syncError} /> : null}
        <Primary label={syncState === 'sealing' ? 'SELANDO…' : 'CIFRAR E SELAR DIA 003'} onPress={onSeal} disabled={state.reflection.trim().length === 0 || syncState === 'sealing'} />
      </Card>
    );
  }
  if (phase === 'complete') return <Completion snapshot={snapshot} completion={completion} cycleLabel="VEHUIAH 3/5 · LUCIDEZ" />;
  return null;
}

function Day4Phases({ phase, snapshot, state, setState, syncState, syncError, completion, onAdvance, onSeal }: DayPhaseProps<Day4State>) {
  if (phase === 'mantle') {
    return (
      <Card eyebrow="MALEABILIDADE" title="Vestir uma representação deliberada">
        <Canonical>{snapshot.jachinKavanah}</Canonical>
        <Epistemic>
          Aqui “placebo intencional” é prática de imaginação, expectativa, atenção e representação dentro do modelo HNK. A plataforma não promete cura, alteração bioquímica garantida ou efeito “quântico” mensurável.
        </Epistemic>
        <RitualClock targetSeconds={600} value={state.mantleSeconds} onChange={(mantleSeconds) => setState((current) => ({ ...current, mantleSeconds }))} />
        <Primary label="ENTRAR NO CANCEL MARKER" onPress={onAdvance} disabled={state.mantleSeconds < 600} />
      </Card>
    );
  }
  if (phase === 'cancel') {
    return (
      <Card eyebrow="RESTRIÇÃO" title="Marcar, dissolver, retornar">
        <Canonical>{snapshot.boazKavanah}</Canonical>
        <RitualClock targetSeconds={600} value={state.cancelSeconds} onChange={(cancelSeconds) => setState((current) => ({ ...current, cancelSeconds }))} />
        <Counter label="CANCEL MARKER" value={state.cancelCount} onPress={() => setState((current) => ({ ...current, cancelCount: current.cancelCount + 1 }))} />
        <TextInput value={state.trigger} onChangeText={(trigger) => setState((current) => ({ ...current, trigger }))} placeholder="GATILHO RECONHECIDO · VAULT PRIVADO" placeholderTextColor="#656871" style={styles.input} />
        <Primary label="REALIZAR O SWISH" onPress={onAdvance} disabled={state.cancelSeconds < 600 || state.trigger.trim().length === 0} />
      </Card>
    );
  }
  if (phase === 'swish') {
    const labels = ['IMAGEM PEQUENA / ESCURA', 'DESLOCAMENTO', 'IMAGEM GRANDE / LUMINOSA'];
    return (
      <Card eyebrow="TRANSMUTAÇÃO" title="Troca de representação">
        <Canonical>{snapshot.middleKavanah}</Canonical>
        <Epistemic>
          O efeito visual representa o Padrão Swish descrito no cânone. Ele não afirma que uma animação provoque alteração bioquímica instantânea.
        </Epistemic>
        <View style={styles.swishStage}>
          <View style={[styles.swishOrb, state.swishStep >= 2 && styles.swishOrbLarge, state.swishStep >= 3 && styles.swishOrbBright]} />
          <Text style={styles.swishLabel}>{labels[Math.min(state.swishStep, 2)]}</Text>
        </View>
        <Primary label={state.swishStep >= 3 ? 'SWISH CONCLUÍDO' : 'AVANÇAR REPRESENTAÇÃO'} onPress={() => setState((current) => ({ ...current, swishStep: Math.min(3, current.swishStep + 1) }))} disabled={state.swishStep >= 3} />
        <Primary label="ABRIR O ESPELHO" onPress={onAdvance} disabled={state.swishStep < 3} />
      </Card>
    );
  }
  if (phase === 'mirror') {
    return (
      <Card eyebrow="ESPELHO" title="O que a nova representação tornou possível observar?">
        <TextInput value={state.reflection} onChangeText={(reflection) => setState((current) => ({ ...current, reflection }))} placeholder="REGISTRO PRIVADO — VAULT CIFRADO" placeholderTextColor="#656871" style={styles.textArea} multiline />
        {syncError ? <ErrorBox text={syncError} /> : null}
        <Primary label={syncState === 'sealing' ? 'SELANDO…' : 'CIFRAR E SELAR DIA 004'} onPress={onSeal} disabled={state.reflection.trim().length === 0 || syncState === 'sealing'} />
      </Card>
    );
  }
  if (phase === 'complete') return <Completion snapshot={snapshot} completion={completion} cycleLabel="VEHUIAH 4/5 · MALEABILIDADE" />;
  return null;
}

function Day5Phases({ phase, snapshot, state, setState, syncState, syncError, completion, onAdvance, onSeal }: DayPhaseProps<Day5State>) {
  if (phase === 'breath') {
    return (
      <Card eyebrow="LIMITE" title="Respiração porosa expansiva">
        <Canonical>{snapshot.jachinKavanah}</Canonical>
        <Epistemic>
          O campo, sombras e energia são apresentados como linguagem ritual e imagética. Respire sem hiperventilar; pare se houver tontura ou desconforto.
        </Epistemic>
        <BreathClock targetSeconds={600} value={state.breathSeconds} onChange={(breathSeconds) => setState((current) => ({ ...current, breathSeconds }))} />
        <Primary label="ENTRAR NA SEQUÊNCIA DE GESTOS" onPress={onAdvance} disabled={state.breathSeconds < 600} />
      </Card>
    );
  }
  if (phase === 'gestures') {
    const steps = [
      'Voltar-se para o Leste',
      'Respirar profundamente sem forçar',
      'Assumir a mão dominante em forma de espada',
      'Realizar gestos firmes de corte ao redor, sem contato físico perigoso',
      'Expirar após os cortes e retornar à postura estável',
    ];
    return (
      <Card eyebrow="RESTRIÇÃO" title="Sequência direcional sem câmera julgadora">
        <Canonical>{snapshot.boazKavanah}</Canonical>
        <Safety>
          A fonte fixa o Leste e os gestos ao redor, mas não fornece uma rota cardinal adicional. Por isso o MVP não inventa Norte/Oeste/Sul nem usa câmera para declarar um gesto “correto”.
        </Safety>
        {steps.map((label, index) => (
          <Pressable
            key={label}
            style={[styles.checkRow, state.gestureSteps[index] && styles.checkRowDone]}
            onPress={() => setState((current) => ({ ...current, gestureSteps: current.gestureSteps.map((value, i) => i === index ? !value : value) }))}
          >
            <Text style={styles.checkMark}>{state.gestureSteps[index] ? '✓' : String(index + 1).padStart(2, '0')}</Text>
            <Text style={styles.checkLabel}>{label}</Text>
          </Pressable>
        ))}
        <Primary label="FECHAR NA ESFERA" onPress={onAdvance} disabled={!state.gestureSteps.every(Boolean)} />
      </Card>
    );
  }
  if (phase === 'sphere') {
    return (
      <Card eyebrow="CONVERGÊNCIA" title="Closing Sphere">
        <Canonical>{snapshot.middleKavanah}</Canonical>
        <Epistemic>
          Dai Koo Myo ainda depende do master visual Usui aprovado. Enquanto isso, o app apresenta o texto canônico sem desenhar um símbolo arbitrário.
        </Epistemic>
        <SphereClock targetSeconds={300} value={state.sphereSeconds} onChange={(sphereSeconds) => setState((current) => ({ ...current, sphereSeconds }))} />
        <Primary label="REGISTRAR O FECHAMENTO" onPress={onAdvance} disabled={state.sphereSeconds < 300} />
      </Card>
    );
  }
  if (phase === 'journal') {
    return (
      <Card eyebrow="ESPELHO / SELO" title="O que você decidiu não aceitar mais?">
        <Canonical>{snapshot.boazOrdalia}</Canonical>
        <TextInput value={state.journal} onChangeText={(journal) => setState((current) => ({ ...current, journal }))} placeholder="REGISTRO PRIVADO — VAULT CIFRADO" placeholderTextColor="#656871" style={styles.textArea} multiline />
        {syncError ? <ErrorBox text={syncError} /> : null}
        <Primary label={syncState === 'sealing' ? 'SELANDO…' : 'CIFRAR · SELAR · VERIFICAR FRAGMENTO I'} onPress={onSeal} disabled={state.journal.trim().length === 0 || syncState === 'sealing'} />
      </Card>
    );
  }
  if (phase === 'complete') return <Completion snapshot={snapshot} completion={completion} cycleLabel="VEHUIAH 5/5 · FRAGMENTO I" />;
  return null;
}

type Setter<T> = (value: T | ((current: T) => T)) => void;

type DayPhaseProps<T> = {
  phase: string;
  snapshot: VehuiahDaySnapshot;
  state: T;
  setState: Setter<T>;
  syncState: SyncState;
  syncError: string | null;
  completion: CompletionResult | null;
  onAdvance: () => void;
  onSeal: () => void;
};

function Threshold({ snapshot, isLive, syncState, error, onBegin }: { snapshot: VehuiahDaySnapshot; isLive: boolean; syncState: SyncState; error: string | null; onBegin: () => void }) {
  return (
    <Card eyebrow={`VEHUIAH ${snapshot.day}/5`} title={snapshot.title}>
      <Text style={styles.role}>{snapshot.dramaticRole}</Text>
      <View style={styles.metaRow}>
        <Meta label="SEPHIRA" value="KETHER" />
        <Meta label="MUNDO" value="ATZILUTH" />
        <Meta label="XP" value={`+${snapshot.xp}`} />
        <Meta label="FONTE" value={snapshot.source === 'supabase' ? 'CANON LIVE' : 'OFFLINE'} />
      </View>
      <Text style={styles.microcopy}>
        O servidor controla sequência e XP. O app não permite transformar uma revisita em recompensa duplicada.
      </Text>
      {!isLive ? <Safety>Modo demonstrativo: você pode percorrer a experiência, mas não existe selo canônico nem XP persistido.</Safety> : null}
      {error ? <ErrorBox text={error} /> : null}
      <Primary label={syncState === 'starting' ? 'CRIANDO SESSÃO…' : 'INICIAR O DIA'} onPress={onBegin} disabled={syncState === 'starting'} />
    </Card>
  );
}

function Completion({ snapshot, completion, cycleLabel }: { snapshot: VehuiahDaySnapshot; completion: CompletionResult | null; cycleLabel: string }) {
  const fragment = snapshot.day === 5 && completion ? safeFragment(completion.crown) : null;
  return (
    <Card eyebrow="PASSAGEM" title={completion ? 'Selo confirmado pelo servidor' : 'Demonstração concluída'}>
      <View style={styles.reward}>
        <Text style={styles.rewardLabel}>{completion ? 'RECOMPENSA CANÔNICA' : 'RECOMPENSA PREVISTA'}</Text>
        <Text style={styles.rewardXp}>{completion ? (completion.firstCompletion ? `+${completion.xpAwarded} XP` : 'XP JÁ SELADO') : `+${snapshot.xp} XP`}</Text>
        {completion ? <Text style={styles.rewardTotal}>XP TOTAL · {completion.xpTotal}</Text> : null}
      </View>
      <Text style={styles.cycleLabel}>{cycleLabel}</Text>
      {fragment ? (
        <View style={[styles.fragment, fragment.lit && styles.fragmentLit]}>
          <Text style={styles.fragmentLabel}>FRAGMENTO I · VEHUIAH</Text>
          <Text style={styles.fragmentValue}>{fragment.completedDays}/5 · {fragment.lit ? 'ACESO' : 'AINDA NÃO ACESO'}</Text>
          <View style={styles.fragmentCells}>{Array.from({ length: 5 }, (_, index) => <View key={index} style={[styles.fragmentCell, index < fragment.completedDays && styles.fragmentCellDone]} />)}</View>
        </View>
      ) : null}
      <Text style={styles.microcopy}>
        {completion
          ? completion.firstCompletion
            ? 'Primeira conclusão registrada. O próximo Dia é liberado pelo estado de progresso do servidor.'
            : 'Revisita confirmada sem duplicação de XP.'
          : 'Nenhuma alteração de progresso foi persistida.'}
      </Text>
    </Card>
  );
}

function safeFragment(crown: CompletionResult['crown']) {
  try {
    return parseVehuiahFragment(crown);
  } catch {
    return null;
  }
}

function buildPrivatePayload(day: VehuiahContentDay, d2: Day2State, d3: Day3State, d4: Day4State, d5: Day5State) {
  if (day === 2) return { schema: 'hnk-day002-private-v1', reflection: d2.reflection.trim() };
  if (day === 3) return { schema: 'hnk-day003-private-v1', beliefs: d3.beliefs.map((value) => value.trim()), reflection: d3.reflection.trim() };
  if (day === 4) return { schema: 'hnk-day004-private-v1', trigger: d4.trigger.trim(), reflection: d4.reflection.trim() };
  return { schema: 'hnk-day005-private-v1', journal: d5.journal.trim() };
}

function buildPracticeRecord(day: VehuiahContentDay, d2: Day2State, d3: Day3State, d4: Day4State, d5: Day5State) {
  if (day === 2) {
    return {
      durationSeconds: d2.stillnessSeconds + d2.integrationSeconds,
      metrics: {
        stillness_seconds: d2.stillnessSeconds,
        movement_impulses: d2.impulses,
        posture_adjustments: d2.postureAdjustments,
        comfort: d2.comfort ?? 0,
        quietude: d2.quietude ?? 0,
        integration_seconds: d2.integrationSeconds,
      },
      evidence: {
        protocol_completed: d2.stillnessSeconds >= 900 && d2.integrationSeconds >= 180,
        return_confirmed: true,
        stillness_seconds: d2.stillnessSeconds,
        movement_impulses: d2.impulses,
        comfort: d2.comfort ?? 0,
        mirror_saved_to_vault: true,
      },
    };
  }
  if (day === 3) {
    return {
      durationSeconds: d3.observationSeconds + d3.boazSeconds + d3.integrationSeconds,
      metrics: {
        observation_seconds: d3.observationSeconds,
        thought_entanglements: d3.thoughtEntanglements,
        boaz_seconds: d3.boazSeconds,
        integration_seconds: d3.integrationSeconds,
      },
      evidence: {
        protocol_completed: d3.observationSeconds >= 600 && d3.boazSeconds >= 180 && d3.integrationSeconds >= 180,
        return_confirmed: true,
        observation_minutes: Math.floor(d3.observationSeconds / 60),
        beliefs_logged_count: d3.beliefs.filter((value) => value.trim().length > 0).length,
        complaint_fast_started: d3.complaintFastStarted,
        private_text_saved_to_vault: true,
      },
    };
  }
  if (day === 4) {
    return {
      durationSeconds: d4.mantleSeconds + d4.cancelSeconds,
      metrics: {
        visualization_seconds: d4.mantleSeconds,
        cancel_practice_seconds: d4.cancelSeconds,
        cancel_count: d4.cancelCount,
      },
      evidence: {
        protocol_completed: d4.mantleSeconds >= 600 && d4.cancelSeconds >= 600 && d4.swishStep >= 3,
        return_confirmed: true,
        visualization_minutes: Math.floor(d4.mantleSeconds / 60),
        cancel_count: d4.cancelCount,
        swish_completed: d4.swishStep >= 3,
        private_text_saved_to_vault: true,
      },
    };
  }
  return {
    durationSeconds: d5.breathSeconds + d5.sphereSeconds,
    metrics: {
      breath_seconds: d5.breathSeconds,
      sphere_seconds: d5.sphereSeconds,
      directional_steps_completed: d5.gestureSteps.filter(Boolean).length,
    },
    evidence: {
      protocol_completed: d5.breathSeconds >= 600 && d5.sphereSeconds >= 300 && d5.gestureSteps.every(Boolean),
      return_confirmed: true,
      breath_practice_completed: d5.breathSeconds >= 600,
      directional_sequence_completed: d5.gestureSteps.every(Boolean),
      journal_record_created: d5.journal.trim().length > 0,
    },
  };
}

function clearPrivateText(day: VehuiahContentDay, setD2: Setter<Day2State>, setD3: Setter<Day3State>, setD4: Setter<Day4State>, setD5: Setter<Day5State>) {
  if (day === 2) setD2((current) => ({ ...current, reflection: '' }));
  if (day === 3) setD3((current) => ({ ...current, beliefs: ['', '', ''], reflection: '' }));
  if (day === 4) setD4((current) => ({ ...current, trigger: '', reflection: '' }));
  if (day === 5) setD5((current) => ({ ...current, journal: '' }));
}

function DayHeader({ snapshot, phaseIndex, phaseCount }: { snapshot: VehuiahDaySnapshot; phaseIndex: number; phaseCount: number }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerEyebrow}>HNK CODEX · DIA {String(snapshot.day).padStart(3, '0')}</Text>
        <Text style={styles.headerTitle}>KETHER</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerCounter}>{Math.min(phaseIndex + 1, phaseCount)}/{phaseCount}</Text>
        <Text style={styles.headerSource}>{snapshot.source === 'supabase' ? 'CANON LIVE' : 'CANON OFFLINE'}</Text>
      </View>
    </View>
  );
}

function VehuiahGlyph({ day, phase }: { day: number; phase: number }) {
  const activeCells = Math.min(5, day - 1 + (phase > 0 ? 1 : 0));
  return (
    <View style={styles.glyph}>
      <View style={styles.glyphRingOuter} />
      <View style={styles.glyphRingInner} />
      <View style={styles.glyphAxis} />
      <View style={styles.glyphPoint} />
      <View style={styles.glyphCells}>{Array.from({ length: 5 }, (_, index) => <View key={index} style={[styles.glyphCell, index < activeCells && styles.glyphCellActive]} />)}</View>
    </View>
  );
}

function RitualClock({ targetSeconds, value, onChange }: { targetSeconds: number; value: number; onChange: (value: number) => void }) {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || value >= targetSeconds) return;
    const id = setInterval(() => onChange(Math.min(targetSeconds, value + 1)), 1000);
    return () => clearInterval(id);
  }, [running, targetSeconds, value, onChange]);
  useEffect(() => {
    if (value >= targetSeconds) setRunning(false);
  }, [value, targetSeconds]);
  const remaining = targetSeconds - value;
  return (
    <View style={styles.clock}>
      <View>
        <Text style={styles.clockLabel}>TEMPO REAL REGISTRADO</Text>
        <Text style={styles.clockValue}>{formatSeconds(value)}</Text>
        <Text style={styles.clockRemaining}>ALVO · {formatSeconds(targetSeconds)} · FALTAM {formatSeconds(Math.max(0, remaining))}</Text>
      </View>
      <Pressable style={styles.clockButton} onPress={() => setRunning((current) => !current)}>
        <Text style={styles.clockButtonText}>{running ? 'PAUSAR' : value === 0 ? 'INICIAR' : value >= targetSeconds ? 'CONCLUÍDO' : 'CONTINUAR'}</Text>
      </Pressable>
    </View>
  );
}

function BreathClock(props: { targetSeconds: number; value: number; onChange: (value: number) => void }) {
  const phase = Math.floor(props.value / 6) % 2 === 0 ? 'RECEBER / INSPIRAR SEM FORÇAR' : 'EXPANDIR / EXPIRAR SUAVEMENTE';
  return (
    <View style={styles.breathFrame}>
      <View style={[styles.breathOrb, phase.startsWith('EXPANDIR') && styles.breathOrbExpanded]} />
      <Text style={styles.breathPhase}>{phase}</Text>
      <RitualClock {...props} />
    </View>
  );
}

function SphereClock(props: { targetSeconds: number; value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.sphereFrame}>
      <View style={styles.sphereOuter}><View style={styles.sphereInner}><View style={styles.spherePoint} /></View></View>
      <RitualClock {...props} />
    </View>
  );
}

function Counter({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return (
    <Pressable style={styles.counter} onPress={onPress}>
      <Text style={styles.counterLabel}>{label}</Text>
      <Text style={styles.counterValue}>+ {value}</Text>
    </Pressable>
  );
}

function Scale({ label, value, onChange }: { label: string; value: number | null; onChange: (value: number) => void }) {
  return (
    <View style={styles.scale}>
      <Text style={styles.scaleLabel}>{label} · {value ?? '—'}/10</Text>
      <View style={styles.scaleRow}>{Array.from({ length: 11 }, (_, index) => <Pressable key={index} onPress={() => onChange(index)} style={[styles.scaleDot, value === index && styles.scaleDotActive]}><Text style={[styles.scaleDotText, value === index && styles.scaleDotTextActive]}>{index}</Text></Pressable>)}</View>
    </View>
  );
}

function Card({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

function Canonical({ children }: { children: ReactNode }) {
  return <Text style={styles.canonical}>{children}</Text>;
}
function Safety({ children }: { children: ReactNode }) {
  return <View style={styles.safety}><Text style={styles.safetyLabel}>SEGURANÇA DA PRÁTICA</Text><Text style={styles.safetyText}>{children}</Text></View>;
}
function Epistemic({ children }: { children: ReactNode }) {
  return <View style={styles.epistemic}><Text style={styles.epistemicLabel}>HNK-EP · LEITURA DO PRODUTO</Text><Text style={styles.epistemicText}>{children}</Text></View>;
}
function ErrorBox({ text }: { text: string }) {
  return <View style={styles.error}><Text style={styles.errorTitle}>SELO INTERROMPIDO COM SEGURANÇA</Text><Text style={styles.errorText}>{text}</Text></View>;
}
function Meta({ label, value }: { label: string; value: string }) {
  return <View style={styles.meta}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>;
}
function Primary({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primary, disabled && styles.primaryDisabled, pressed && !disabled && styles.primaryPressed]}><Text style={[styles.primaryText, disabled && styles.primaryTextDisabled]}>{label}</Text></Pressable>;
}
function formatSeconds(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  loading: { flex: 1, backgroundColor: '#030406', alignItems: 'center', justifyContent: 'center', gap: 24 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 28, paddingBottom: 80 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  headerEyebrow: { color: '#95844f', fontSize: 10, letterSpacing: 2 },
  headerTitle: { color: '#fffdf4', fontSize: 26, letterSpacing: 7, fontWeight: '300', marginTop: 5 },
  headerRight: { alignItems: 'flex-end' },
  headerCounter: { color: '#fffdf4', fontVariant: ['tabular-nums'], fontSize: 13 },
  headerSource: { color: '#666970', fontSize: 8, letterSpacing: 1.4, marginTop: 5 },
  glyph: { height: 230, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  glyphRingOuter: { position: 'absolute', width: 186, height: 186, borderRadius: 93, borderWidth: 1, borderColor: 'rgba(221,199,120,0.22)' },
  glyphRingInner: { position: 'absolute', width: 104, height: 104, borderRadius: 52, borderWidth: 1, borderColor: 'rgba(250,243,212,0.2)' },
  glyphAxis: { position: 'absolute', width: 1, height: 190, backgroundColor: 'rgba(237,221,158,0.13)' },
  glyphPoint: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff9df', shadowColor: '#fff0ad', shadowOpacity: 0.8, shadowRadius: 16 },
  glyphCells: { position: 'absolute', bottom: 12, flexDirection: 'row', gap: 7 },
  glyphCell: { width: 24, height: 3, borderRadius: 2, backgroundColor: '#24252a' },
  glyphCellActive: { backgroundColor: '#d6c277' },
  card: { borderWidth: 1, borderColor: '#292a2f', borderRadius: 28, padding: 24, backgroundColor: '#08090d', gap: 16 },
  cardEyebrow: { color: '#9a8852', fontSize: 10, letterSpacing: 2.1, fontWeight: '700' },
  cardTitle: { color: '#fffdf4', fontSize: 29, lineHeight: 35, fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#27282c' },
  role: { color: '#e2d7af', fontSize: 16, lineHeight: 24, letterSpacing: 0.5 },
  canonical: { color: '#e7e1cf', fontSize: 16, lineHeight: 27 },
  microcopy: { color: '#81838b', fontSize: 12, lineHeight: 19 },
  safety: { borderWidth: 1, borderColor: '#493b2c', borderRadius: 16, backgroundColor: '#100c09', padding: 15 },
  safetyLabel: { color: '#c8a77b', fontSize: 8, letterSpacing: 1.5, fontWeight: '800' },
  safetyText: { color: '#c6b7a5', fontSize: 12, lineHeight: 19, marginTop: 7 },
  epistemic: { borderWidth: 1, borderColor: '#303d42', borderRadius: 16, backgroundColor: '#090f11', padding: 15 },
  epistemicLabel: { color: '#89aab2', fontSize: 8, letterSpacing: 1.5, fontWeight: '800' },
  epistemicText: { color: '#a9bdc1', fontSize: 12, lineHeight: 19, marginTop: 7 },
  error: { borderWidth: 1, borderColor: '#563532', borderRadius: 16, backgroundColor: '#140b0b', padding: 15 },
  errorTitle: { color: '#d99a91', fontSize: 8, letterSpacing: 1.4, fontWeight: '800' },
  errorText: { color: '#c8aaa6', fontSize: 12, lineHeight: 19, marginTop: 7 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { flexGrow: 1, minWidth: 110, borderWidth: 1, borderColor: '#24252a', borderRadius: 14, padding: 12, backgroundColor: '#0c0d11' },
  metaLabel: { color: '#676970', fontSize: 8, letterSpacing: 1.3 },
  metaValue: { color: '#e8dfc4', fontSize: 12, marginTop: 4 },
  primary: { minHeight: 55, borderRadius: 16, backgroundColor: '#dfcc7d', alignItems: 'center', justifyContent: 'center' },
  primaryPressed: { opacity: 0.84 },
  primaryDisabled: { backgroundColor: '#25251f' },
  primaryText: { color: '#11110e', fontSize: 10, letterSpacing: 1.6, fontWeight: '800', textAlign: 'center', paddingHorizontal: 10 },
  primaryTextDisabled: { color: '#69695e' },
  clock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#3a351f', borderRadius: 18, padding: 16, backgroundColor: '#0c0c09' },
  clockLabel: { color: '#8d8055', fontSize: 8, letterSpacing: 1.4 },
  clockValue: { color: '#fff1b2', fontSize: 28, fontVariant: ['tabular-nums'], marginTop: 4 },
  clockRemaining: { color: '#5f5a45', fontSize: 8, letterSpacing: 0.9, marginTop: 4 },
  clockButton: { borderWidth: 1, borderColor: '#62562f', paddingVertical: 10, paddingHorizontal: 13, borderRadius: 12 },
  clockButtonText: { color: '#d5c47f', fontSize: 8, letterSpacing: 1.2, fontWeight: '700' },
  counterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  counter: { flexGrow: 1, minWidth: 180, borderWidth: 1, borderColor: '#313238', borderRadius: 16, backgroundColor: '#0a0b0e', padding: 15 },
  counterLabel: { color: '#74767d', fontSize: 8, letterSpacing: 1.2 },
  counterValue: { color: '#efe3b5', fontSize: 23, marginTop: 7 },
  scale: { gap: 9 },
  scaleLabel: { color: '#a5a088', fontSize: 9, letterSpacing: 1.2 },
  scaleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  scaleDot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: '#303137', alignItems: 'center', justifyContent: 'center' },
  scaleDotActive: { borderColor: '#d6c277', backgroundColor: '#2a2513' },
  scaleDotText: { color: '#676970', fontSize: 10 },
  scaleDotTextActive: { color: '#f7e9a7' },
  input: { minHeight: 54, borderWidth: 1, borderColor: '#303137', borderRadius: 15, backgroundColor: '#050609', color: '#fffdf4', padding: 14, fontSize: 14 },
  textArea: { minHeight: 170, borderWidth: 1, borderColor: '#303137', borderRadius: 16, backgroundColor: '#050609', color: '#fffdf4', padding: 15, fontSize: 14, lineHeight: 21, textAlignVertical: 'top' },
  oath: { borderWidth: 1, borderColor: '#3d3730', borderRadius: 17, padding: 16, backgroundColor: '#0d0b09' },
  oathActive: { borderColor: '#8a7745', backgroundColor: '#151207' },
  oathTitle: { color: '#d5c27b', fontSize: 9, letterSpacing: 1.3, fontWeight: '700' },
  oathText: { color: '#aaa493', fontSize: 12, lineHeight: 18, marginTop: 7 },
  swishStage: { height: 210, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#050609', overflow: 'hidden' },
  swishOrb: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#23242a' },
  swishOrbLarge: { width: 118, height: 118, borderRadius: 59, backgroundColor: '#5a5031' },
  swishOrbBright: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#e0ca78', shadowColor: '#fff0a6', shadowOpacity: 0.8, shadowRadius: 28 },
  swishLabel: { position: 'absolute', bottom: 15, color: '#8b8d94', fontSize: 8, letterSpacing: 1.3 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 13, borderWidth: 1, borderColor: '#2c2d32', borderRadius: 15, padding: 14, backgroundColor: '#0a0b0e' },
  checkRowDone: { borderColor: '#625733', backgroundColor: '#121007' },
  checkMark: { width: 28, color: '#d6c277', fontSize: 11, fontVariant: ['tabular-nums'] },
  checkLabel: { flex: 1, color: '#c7c1ae', fontSize: 13, lineHeight: 19 },
  breathFrame: { gap: 14, alignItems: 'center' },
  breathOrb: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, borderColor: '#d6c277', backgroundColor: 'rgba(214,194,119,0.05)' },
  breathOrbExpanded: { width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(214,194,119,0.14)' },
  breathPhase: { color: '#b9aa73', fontSize: 9, letterSpacing: 1.4 },
  sphereFrame: { gap: 18, alignItems: 'center' },
  sphereOuter: { width: 170, height: 170, borderRadius: 85, borderWidth: 1, borderColor: '#7b8e9b', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(105,137,160,0.05)' },
  sphereInner: { width: 94, height: 94, borderRadius: 47, borderWidth: 1, borderColor: '#d6c277', alignItems: 'center', justifyContent: 'center' },
  spherePoint: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff8dc' },
  reward: { minHeight: 170, borderWidth: 1, borderColor: '#4e4427', borderRadius: 85, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0d08' },
  rewardLabel: { color: '#887b52', fontSize: 8, letterSpacing: 1.4 },
  rewardXp: { color: '#fff0ad', fontSize: 31, fontWeight: '300', marginTop: 7 },
  rewardTotal: { color: '#8f825a', fontSize: 9, letterSpacing: 1.1, marginTop: 5 },
  cycleLabel: { color: '#d7ca98', fontSize: 11, letterSpacing: 1.3, textAlign: 'center' },
  fragment: { borderWidth: 1, borderColor: '#34353a', borderRadius: 18, padding: 16, backgroundColor: '#0a0b0e' },
  fragmentLit: { borderColor: '#756637', backgroundColor: '#121007' },
  fragmentLabel: { color: '#8b7d54', fontSize: 8, letterSpacing: 1.3 },
  fragmentValue: { color: '#eadc9c', fontSize: 15, marginTop: 6 },
  fragmentCells: { flexDirection: 'row', gap: 7, marginTop: 12 },
  fragmentCell: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#292a2f' },
  fragmentCellDone: { backgroundColor: '#d4bf70' },
  footer: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 9, paddingHorizontal: 4 },
  footerText: { color: '#505259', fontSize: 8, letterSpacing: 1 },
});