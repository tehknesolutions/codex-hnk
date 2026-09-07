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
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import type { DayDefinition } from '@hnk/day-runtime';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import {
  JELIEL_DAY_007,
  JELIEL_DAY_008,
  JELIEL_DAY_009,
  JELIEL_DAY_010,
} from './day-definitions';
import { useHnkDayRuntime } from './useHnkDayRuntime';

type JelielDay = 7 | 8 | 9 | 10;
type AnchorResponse = 'none' | 'weak' | 'moderate' | 'strong';

const DEFINITIONS: Record<JelielDay, DayDefinition> = {
  7: JELIEL_DAY_007,
  8: JELIEL_DAY_008,
  9: JELIEL_DAY_009,
  10: JELIEL_DAY_010,
};

export function JelielDays007to010Experience({ day }: { day: JelielDay }) {
  const definition = DEFINITIONS[day];
  const controller = useHnkDayRuntime(definition);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setCanon(null);
    setCanonError(null);

    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }

    void loadCanonicalDay(controller.auth.client, day)
      .then((snapshot) => {
        if (active) setCanon(snapshot);
      })
      .catch((cause) => {
        if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed');
      });

    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase, day]);

  if (controller.loading) return <Loading />;

  if (controller.runtime?.status === 'locked') {
    return (
      <Frame day={day} canon={canon} controller={controller}>
        <Card label="GATE" title="Dia bloqueado pelo progresso canônico">
          <Text style={styles.body}>A primeira conclusão deste Dia exige a conclusão canônica do Dia anterior. O runtime não permite ultrapassar esse gate por estado local.</Text>
        </Card>
      </Frame>
    );
  }

  const common = {
    canon,
    canonError,
    localError,
    setLocalError,
    controller,
  };

  return (
    <Frame day={day} canon={canon} controller={controller}>
      {canonError ? <Notice title="CÂNONE INDISPONÍVEL">A experiência não substitui o Markdown sincronizado por conteúdo inventado.</Notice> : null}
      {controller.error || localError ? <Notice title="SELO INTERROMPIDO">{localError ?? controller.error}</Notice> : null}
      {day === 7 ? <Day007 {...common} /> : null}
      {day === 8 ? <Day008 {...common} /> : null}
      {day === 9 ? <Day009 {...common} /> : null}
      {day === 10 ? <Day010 {...common} /> : null}
    </Frame>
  );
}

type CommonProps = {
  canon: CanonicalDaySnapshot | null;
  canonError: string | null;
  localError: string | null;
  setLocalError: (value: string | null) => void;
  controller: ReturnType<typeof useHnkDayRuntime>;
};

function Day007({ canon, setLocalError, controller }: CommonProps) {
  const [relaxation, setRelaxation] = useState(5);
  const [effort, setEffort] = useState(5);
  const [attempts, setAttempts] = useState(1);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} title="Soltar sem forçar" />;

  if (phase === 'relaxation') {
    return (
      <Card label="JACHIN · RELAXAMENTO" title="Pálpebras relaxadas, agência preservada">
        <Canonical>{canon?.blocks['jachin-kavanah'] ?? ''}</Canonical>
        <Notice title="REVERSIBILIDADE">O objetivo é relaxamento voluntário. Não há obrigação de produzir catalepsia ou qualquer fenômeno específico.</Notice>
        <Primary label="REALIZAR TESTE VOLUNTÁRIO" onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'test') {
    return (
      <Card label="TESTE" title="Sensação não é o mesmo que esforço">
        <Canonical>{canon?.blocks['boaz-kavanah'] ?? ''}</Canonical>
        <Scale label="RELAXAMENTO" value={relaxation} onChange={setRelaxation} />
        <Scale label="ESFORÇO MUSCULAR" value={effort} onChange={setEffort} />
        <View style={styles.inlineRow}>
          <Text style={styles.body}>TENTATIVAS · {attempts}</Text>
          <Pressable style={styles.smallButton} onPress={() => setAttempts((value) => value + 1)}><Text style={styles.smallButtonText}>+ TENTATIVA</Text></Pressable>
        </View>
        <Primary label="LIBERAR A SUGESTÃO" onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'release') {
    return (
      <Card label="RETORNO" title="Abrir, mover, orientar">
        <Text style={styles.body}>Abra os olhos quando desejar, mova suavemente o rosto e confirme que o teste terminou. O app não mantém uma sugestão ativa como requisito de progresso.</Text>
        <Primary label="CONFIRMAR LIBERAÇÃO" onPress={() => {
          controller.setEvidence({ release_completed: true });
          controller.setReturnConfirmed();
          controller.nextPhase();
        }} />
      </Card>
    );
  }

  if (phase === 'evidence') {
    return (
      <Card label="EVIDÊNCIA" title="Registrar sem julgar o resultado">
        <Text style={styles.body}>Relaxamento percebido: {relaxation}/10 · esforço: {effort}/10 · tentativas: {attempts}.</Text>
        <Primary label="PREPARAR O SELO" onPress={() => {
          controller.setEvidence({ relaxation_rating: relaxation, effort_rating: effort, attempts });
          controller.nextPhase();
        }} />
      </Card>
    );
  }

  if (phase === 'seal') {
    return (
      <SealCard
        controller={controller}
        onSeal={async () => {
          setLocalError(null);
          try {
            await controller.seal({
              evidence: {
                protocol_completed: true,
                return_confirmed: true,
                release_completed: true,
                relaxation_rating: relaxation,
                effort_rating: effort,
                attempts,
              },
              metrics: { relaxation_rating: relaxation, effort_rating: effort, attempts },
            });
          } catch (cause) {
            setLocalError(cause instanceof Error ? cause.message : 'day007_seal_failed');
          }
        }}
      />
    );
  }

  return <Completion controller={controller} cycleLabel="JELIEL 2/5" />;
}

function Day008({ canon, setLocalError, controller }: CommonProps) {
  const [lastNumber, setLastNumber] = useState('100');
  const [distractions, setDistractions] = useState(0);
  const [relaxation, setRelaxation] = useState(5);
  const phase = controller.phase?.id;

  const parsedLastNumber = Number(lastNumber);
  const validNumber = Number.isInteger(parsedLastNumber) && parsedLastNumber >= 0 && parsedLastNumber <= 100;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} title="Descer sem competir" />;

  if (phase === 'body-descent') {
    return (
      <Card label="JACHIN · DESCIDA" title="Relaxar o corpo por regiões">
        <Canonical>{canon?.blocks['jachin-kavanah'] ?? ''}</Canonical>
        <Text style={styles.body}>Percorra o corpo no próprio ritmo. Não existe score de profundidade e nenhuma região precisa produzir sensação especial.</Text>
        <Primary label="INICIAR A CONTAGEM" onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'countdown') {
    return (
      <Card label="CONTAGEM" title="100 → … · retorno é o treino">
        <Canonical>{canon?.blocks['boaz-kavanah'] ?? ''}</Canonical>
        <Counter label="DISTRAÇÃO PERCEBIDA" value={distractions} onPress={() => setDistractions((value) => value + 1)} />
        <TextInput
          value={lastNumber}
          onChangeText={setLastNumber}
          keyboardType="number-pad"
          placeholder="Último número lembrado"
          placeholderTextColor="#676970"
          style={styles.input}
        />
        <Scale label="RELAXAMENTO" value={relaxation} onChange={setRelaxation} />
        <Notice title="SEM BENCHMARK">O último número é dado de sessão, não pontuação. O objetivo é perceber distração e retornar.</Notice>
        <Primary label="ENCERRAR A DESCIDA" disabled={!validNumber} onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'grounding') {
    return (
      <Card label="RETORNO" title="Orientar-se antes do registro">
        <Text style={styles.body}>Mova mãos e pés, abra os olhos e reconheça o ambiente. O estado termina voluntariamente.</Text>
        <Primary label="CONFIRMAR RETORNO" onPress={() => {
          controller.setReturnConfirmed();
          controller.nextPhase();
        }} />
      </Card>
    );
  }

  if (phase === 'evidence') {
    return (
      <Card label="EVIDÊNCIA" title="Carga cognitiva sem punição">
        <Text style={styles.body}>Início: 100 · último número lembrado: {validNumber ? parsedLastNumber : '—'} · distrações: {distractions} · relaxamento: {relaxation}/10.</Text>
        <Primary label="PREPARAR O SELO" disabled={!validNumber} onPress={() => {
          controller.setEvidence({ countdown_start: 100, last_number_recalled: parsedLastNumber, relaxation_rating: relaxation, distractions });
          controller.nextPhase();
        }} />
      </Card>
    );
  }

  if (phase === 'seal') {
    return (
      <SealCard
        controller={controller}
        onSeal={async () => {
          setLocalError(null);
          try {
            await controller.seal({
              evidence: {
                protocol_completed: true,
                return_confirmed: true,
                countdown_start: 100,
                last_number_recalled: parsedLastNumber,
                relaxation_rating: relaxation,
                distractions,
              },
              metrics: { last_number_recalled: parsedLastNumber, relaxation_rating: relaxation, distractions },
            });
          } catch (cause) {
            setLocalError(cause instanceof Error ? cause.message : 'day008_seal_failed');
          }
        }}
      />
    );
  }

  return <Completion controller={controller} cycleLabel="JELIEL 3/5" />;
}

function Day009({ canon, setLocalError, controller }: CommonProps) {
  const [dreamRecalled, setDreamRecalled] = useState<boolean | null>(null);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [dream, setDream] = useState('');
  const [emotion, setEmotion] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} title="Recordar antes de interpretar" />;

  if (phase === 'intention') {
    return (
      <Card label="ANTES DE DORMIR" title="Intenção sem fragmentar o sono">
        <Canonical>{canon?.blocks['jachin-kavanah'] ?? ''}</Canonical>
        <Notice title="SONO NÃO É GAMIFICADO">O app não exige despertar durante a noite. A captura acontece ao acordar, e ausência de lembrança continua sendo dado válido.</Notice>
        <Primary label="INTENÇÃO REGISTRADA · SEGUIR" onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'morning-capture') {
    return (
      <Card label="AO ACORDAR" title="Capturar antes de analisar">
        <View style={styles.choiceRow}>
          <Choice selected={dreamRecalled === true} label="LEMBREI" onPress={() => setDreamRecalled(true)} />
          <Choice selected={dreamRecalled === false} label="SEM LEMBRANÇA" onPress={() => setDreamRecalled(false)} />
        </View>
        {dreamRecalled === true ? (
          <TextInput value={dream} onChangeText={setDream} placeholder="SONHO · Vault privado" placeholderTextColor="#676970" multiline style={styles.textArea} />
        ) : null}
        <Scale label="QUALIDADE PERCEBIDA DO SONO" value={sleepQuality} onChange={setSleepQuality} />
        <Primary label="SEPARAR CAMADAS" disabled={dreamRecalled === null || (dreamRecalled === true && dream.trim().length === 0)} onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'layers') {
    return (
      <Card label="TRÊS CAMADAS" title="Experiência · emoção · hipótese">
        {dreamRecalled ? <Text style={styles.privatePreview}>SONHO CAPTURADO · {dream.length} caracteres privados</Text> : <Text style={styles.privatePreview}>SEM LEMBRANÇA · estado aceito sem fabricação de conteúdo</Text>}
        <TextInput value={emotion} onChangeText={setEmotion} placeholder="EMOÇÃO · Vault privado (opcional)" placeholderTextColor="#676970" style={styles.input} />
        <TextInput value={hypothesis} onChangeText={setHypothesis} placeholder="HIPÓTESE · Vault privado (opcional)" placeholderTextColor="#676970" multiline style={styles.textAreaSmall} />
        <Primary label="RETORNAR AO DIA" onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'grounding') {
    return (
      <Card label="RETORNO" title="O registro termina no mundo desperto">
        <Text style={styles.body}>Confirme que está orientado ao ambiente e pronto para encerrar o registro. O sonho não recebe interpretação automática.</Text>
        <Primary label="CONFIRMAR RETORNO" onPress={() => {
          controller.setReturnConfirmed();
          controller.nextPhase();
        }} />
      </Card>
    );
  }

  if (phase === 'seal') {
    return (
      <SealCard
        controller={controller}
        onSeal={async () => {
          if (dreamRecalled === null || !controller.auth.client || !controller.auth.userId) return;
          setLocalError(null);
          try {
            let localRecordHash: string | null = null;
            if (dreamRecalled || emotion.trim() || hypothesis.trim()) {
              const encrypted = await encryptVaultText({
                userId: controller.auth.userId,
                day: 9,
                kind: 'dream',
                plaintext: JSON.stringify({
                  schema: 'hnk-day009-dream-v1',
                  dreamRecalled,
                  dream: dream.trim() || null,
                  emotion: emotion.trim() || null,
                  hypothesis: hypothesis.trim() || null,
                }),
              });
              await saveEncryptedVaultEntry(controller.auth.client, { day: 9, payload: encrypted });
              localRecordHash = encrypted.checksumSha256;
            }

            await controller.seal({
              localRecordHash,
              evidence: {
                protocol_completed: true,
                return_confirmed: true,
                capture_completed: true,
                dream_recalled: dreamRecalled,
                sleep_quality: sleepQuality,
              },
              metrics: { dream_recalled: dreamRecalled, sleep_quality: sleepQuality },
            });
            setDream('');
            setEmotion('');
            setHypothesis('');
          } catch (cause) {
            setLocalError(cause instanceof Error ? cause.message : 'day009_seal_failed');
          }
        }}
      />
    );
  }

  return <Completion controller={controller} cycleLabel="JELIEL 4/5" />;
}

function Day010({ canon, setLocalError, controller }: CommonProps) {
  const [calmBefore, setCalmBefore] = useState(5);
  const [tensionBefore, setTensionBefore] = useState(5);
  const [focusBefore, setFocusBefore] = useState(5);
  const [pairingSeconds, setPairingSeconds] = useState(0);
  const [calmAfter, setCalmAfter] = useState(5);
  const [tensionAfter, setTensionAfter] = useState(5);
  const [focusAfter, setFocusAfter] = useState(5);
  const [response, setResponse] = useState<AnchorResponse | null>(null);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} title="Ancorar sem tornar a chave irresistível" />;

  if (phase === 'baseline') {
    return (
      <Card label="BASELINE" title="Antes do pareamento">
        <Scale label="CALMA" value={calmBefore} onChange={setCalmBefore} />
        <Scale label="TENSÃO" value={tensionBefore} onChange={setTensionBefore} />
        <Scale label="FOCO" value={focusBefore} onChange={setFocusBefore} />
        <Primary label="INICIAR PAREAMENTO" onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'pairing') {
    return (
      <Card label="PAREAMENTO" title="Polegar + indicador · 10 segundos">
        <Canonical>{canon?.blocks['middle-kavanah'] ?? canon?.blocks['jachin-kavanah'] ?? ''}</Canonical>
        <PracticeTimer value={pairingSeconds} target={10} onChange={setPairingSeconds} />
        <Primary label="ENTRAR NO RETORNO NEUTRO" disabled={pairingSeconds < 10} onPress={controller.nextPhase} />
      </Card>
    );
  }

  if (phase === 'neutral-return') {
    return (
      <Card label="RETORNO NEUTRO" title="Sair antes de testar">
        <Text style={styles.body}>Movimente-se e retorne à atividade comum. O teste deve acontecer fora da indução completa, preservando reversibilidade.</Text>
        <Primary label="CONFIRMAR RETORNO E TESTAR" onPress={() => {
          controller.setReturnConfirmed();
          controller.nextPhase();
        }} />
      </Card>
    );
  }

  if (phase === 'test') {
    return (
      <Card label="TESTE" title="Observar dez segundos sem exigir efeito">
        <Text style={styles.body}>Repita o gesto em contexto neutro e registre a resposta percebida. `Sem efeito` é um resultado válido.</Text>
        <View style={styles.choiceRow}>
          {(['none', 'weak', 'moderate', 'strong'] as const).map((value) => (
            <Choice key={value} selected={response === value} label={value === 'none' ? 'NENHUMA' : value === 'weak' ? 'FRACA' : value === 'moderate' ? 'MODERADA' : 'FORTE'} onPress={() => setResponse(value)} />
          ))}
        </View>
        <Scale label="CALMA DEPOIS" value={calmAfter} onChange={setCalmAfter} />
        <Scale label="TENSÃO DEPOIS" value={tensionAfter} onChange={setTensionAfter} />
        <Scale label="FOCO DEPOIS" value={focusAfter} onChange={setFocusAfter} />
        <Primary label="PREPARAR SELO DO FRAGMENTO II" disabled={response === null} onPress={() => {
          if (!response) return;
          controller.setEvidence({
            pairing_seconds: pairingSeconds,
            neutral_test_completed: true,
            calm_before: calmBefore,
            calm_after: calmAfter,
            response,
          });
          controller.nextPhase();
        }} />
      </Card>
    );
  }

  if (phase === 'seal') {
    const responseOrdinal = response === 'none' ? 0 : response === 'weak' ? 1 : response === 'moderate' ? 2 : response === 'strong' ? 3 : null;
    return (
      <SealCard
        controller={controller}
        onSeal={async () => {
          if (!response || responseOrdinal === null) return;
          setLocalError(null);
          try {
            await controller.seal({
              evidence: {
                protocol_completed: true,
                return_confirmed: true,
                pairing_seconds: pairingSeconds,
                neutral_test_completed: true,
                calm_before: calmBefore,
                calm_after: calmAfter,
                response,
              },
              remoteEvidence: {
                protocol_completed: true,
                return_confirmed: true,
                pairing_seconds: pairingSeconds,
                neutral_test_completed: true,
                calm_before: calmBefore,
                calm_after: calmAfter,
                response_strength_ordinal: responseOrdinal,
              },
              metrics: {
                calm_before: calmBefore,
                tension_before: tensionBefore,
                focus_before: focusBefore,
                calm_after: calmAfter,
                tension_after: tensionAfter,
                focus_after: focusAfter,
                response_strength_ordinal: responseOrdinal,
              },
              durationSeconds: pairingSeconds,
            });
          } catch (cause) {
            setLocalError(cause instanceof Error ? cause.message : 'day010_seal_failed');
          }
        }}
      />
    );
  }

  return <Completion controller={controller} cycleLabel="JELIEL 5/5 · FRAGMENTO II" />;
}

function Threshold({ canon, controller, title }: { canon: CanonicalDaySnapshot | null; controller: ReturnType<typeof useHnkDayRuntime>; title: string }) {
  return (
    <Card label={`JELIEL ${controller.runtime?.day ? controller.runtime.day - 5 : '—'}/5`} title={canon?.title ?? title}>
      <Canonical>{canon?.blocks['jachin-doctrine'] ?? 'Conteúdo canônico aguardando sincronização.'}</Canonical>
      <Notice title="AUTORIDADE DE PROGRESSÃO">A tela inicia uma Practice Session. XP e conclusão continuam sendo confirmados somente pelo servidor.</Notice>
      <Primary label={controller.busy ? 'CRIANDO SESSÃO…' : controller.runtime?.mode === 'revisit' ? 'REVISITAR' : 'INICIAR'} disabled={controller.busy || !canon} onPress={() => void controller.begin().then(() => controller.nextPhase()).catch(() => undefined)} />
    </Card>
  );
}

function SealCard({ controller, onSeal }: { controller: ReturnType<typeof useHnkDayRuntime>; onSeal: () => Promise<void> }) {
  return (
    <Card label="SELO" title="Enviar evidência estruturada">
      <Text style={styles.body}>O cliente não informa quantidade de XP. O RPC usa o valor canônico de `codex_days` e mantém a conclusão idempotente.</Text>
      <Primary label={controller.busy ? 'SELANDO…' : 'SELAR DIA'} disabled={controller.busy} onPress={() => void onSeal()} />
    </Card>
  );
}

function Completion({ controller, cycleLabel }: { controller: ReturnType<typeof useHnkDayRuntime>; cycleLabel: string }) {
  const completion = controller.runtime?.serverCompletion;
  if (!completion) return null;
  return (
    <Card label="PASSAGEM" title={`${cycleLabel} confirmado`}>
      <View style={styles.reward}>
        <Text style={styles.rewardLabel}>{completion.firstCompletion ? 'RECOMPENSA CANÔNICA' : 'REVISITA'}</Text>
        <Text style={styles.rewardXp}>{completion.firstCompletion ? `+${completion.xpAwarded} XP` : 'XP JÁ SELADO'}</Text>
        <Text style={styles.rewardTotal}>XP TOTAL · {completion.xpTotal}</Text>
      </View>
      <Text style={styles.body}>Grau atual · {completion.initiatoryTitle}. O fragmento é derivado pelo estado global da Coroa, nunca escrito por esta tela.</Text>
    </Card>
  );
}

function Frame({ day, canon, controller, children }: { day: JelielDay; canon: CanonicalDaySnapshot | null; controller: ReturnType<typeof useHnkDayRuntime>; children: ReactNode }) {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>KETHER · CICLO II · JELIEL · {day - 5}/5</Text>
            <Text style={styles.title}>{canon?.title ?? `DIA ${String(day).padStart(3, '0')}`}</Text>
          </View>
          <View style={styles.accountBox}>
            <Text style={styles.accountText}>{controller.progress?.initiatoryTitle?.toUpperCase() ?? 'NEÓFITO'}</Text>
            <Text style={styles.accountText}>{controller.progress?.xpTotal ?? 0} XP</Text>
          </View>
        </View>
        <View style={styles.sourceStrip}>
          <Text style={styles.sourceText}>CÂNONE · {canon?.sourceSha.slice(0, 10) ?? 'AGUARDANDO SYNC'}</Text>
          <Text style={styles.sourceText}>XP · {canon?.xp ?? '—'}</Text>
          <Text style={styles.sourceText}>STATE · {controller.runtime?.status ?? 'LOADING'}</Text>
        </View>
        {children}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DAY · {String(day).padStart(3, '0')}</Text>
          <Text style={styles.footerText}>CYCLE · JELIEL {day - 5}/5</Text>
          <Text style={styles.footerText}>SESSION · {controller.practice?.id.slice(0, 8) ?? '—'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Loading() {
  return <View style={styles.loading}><ActivityIndicator color="#efe0a2" /><Text style={styles.loadingText}>LENDO JELIEL</Text></View>;
}

function PracticeTimer({ value, target, onChange }: { value: number; target: number; onChange: (value: number) => void }) {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || value >= target) return;
    const id = setInterval(() => onChange(Math.min(target, value + 1)), 1000);
    return () => clearInterval(id);
  }, [onChange, running, target, value]);
  useEffect(() => { if (value >= target) setRunning(false); }, [target, value]);
  return (
    <View style={styles.timer}>
      <View><Text style={styles.timerLabel}>TEMPO REAL</Text><Text style={styles.timerValue}>{formatSeconds(value)}</Text><Text style={styles.timerTarget}>ALVO · {formatSeconds(target)}</Text></View>
      <Pressable style={styles.timerButton} disabled={value >= target} onPress={() => setRunning((state) => !state)}><Text style={styles.timerButtonText}>{value >= target ? 'CONCLUÍDO' : running ? 'PAUSAR' : value > 0 ? 'CONTINUAR' : 'INICIAR'}</Text></Pressable>
    </View>
  );
}

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.scale}>
      <Text style={styles.scaleLabel}>{label} · {value}/10</Text>
      <View style={styles.scaleRow}>{Array.from({ length: 11 }, (_, index) => <Pressable key={index} onPress={() => onChange(index)} style={[styles.scaleDot, value === index && styles.scaleDotActive]}><Text style={[styles.scaleDotText, value === index && styles.scaleDotTextActive]}>{index}</Text></Pressable>)}</View>
    </View>
  );
}

function Counter({ label, value, onPress }: { label: string; value: number; onPress: () => void }) {
  return <Pressable style={styles.counter} onPress={onPress}><Text style={styles.counterLabel}>{label}</Text><Text style={styles.counterValue}>+ {value}</Text></Pressable>;
}

function Choice({ selected, label, onPress }: { selected: boolean; label: string; onPress: () => void }) {
  return <Pressable style={[styles.choice, selected && styles.choiceSelected]} onPress={onPress}><Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text></Pressable>;
}

function Card({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return <View style={styles.card}><Text style={styles.cardLabel}>{label}</Text><Text style={styles.cardTitle}>{title}</Text><View style={styles.divider} />{children}</View>;
}
function Canonical({ children }: { children: ReactNode }) { return <Text style={styles.canonical}>{children}</Text>; }
function Notice({ title, children }: { title: string; children: ReactNode }) { return <View style={styles.notice}><Text style={styles.noticeTitle}>{title}</Text><Text style={styles.noticeText}>{children}</Text></View>; }
function Primary({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.primary, disabled && styles.primaryDisabled]}><Text style={[styles.primaryText, disabled && styles.primaryTextDisabled]}>{label}</Text></Pressable>; }
function formatSeconds(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#030406' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: '#030406' },
  loadingText: { color: '#786d49', fontSize: 9, letterSpacing: 1.5 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 24, paddingBottom: 90, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start' },
  eyebrow: { color: '#8d7f4f', fontSize: 9, letterSpacing: 1.6 },
  title: { color: '#fffaf0', fontSize: 27, lineHeight: 33, fontWeight: '300', marginTop: 7 },
  accountBox: { alignItems: 'flex-end', gap: 4 },
  accountText: { color: '#73756f', fontSize: 8, letterSpacing: 1.1 },
  sourceStrip: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#202126', paddingVertical: 10 },
  sourceText: { color: '#5f6167', fontSize: 8, letterSpacing: 1 },
  card: { borderWidth: 1, borderColor: '#292a2f', borderRadius: 24, padding: 22, backgroundColor: '#08090d', gap: 15 },
  cardLabel: { color: '#9b8953', fontSize: 9, letterSpacing: 1.5, fontWeight: '700' },
  cardTitle: { color: '#f8f1db', fontSize: 23, lineHeight: 29, fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#27282c' },
  body: { color: '#a7a89f', fontSize: 13, lineHeight: 21 },
  canonical: { color: '#ddd5bf', fontSize: 15, lineHeight: 25 },
  notice: { borderWidth: 1, borderColor: '#343b3d', borderRadius: 15, padding: 14, backgroundColor: '#090d0f' },
  noticeTitle: { color: '#8fa4aa', fontSize: 8, letterSpacing: 1.2, fontWeight: '700' },
  noticeText: { color: '#aab7b9', fontSize: 12, lineHeight: 19, marginTop: 6 },
  primary: { minHeight: 54, borderRadius: 15, backgroundColor: '#dcc879', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  primaryDisabled: { backgroundColor: '#25251f' },
  primaryText: { color: '#10100d', fontSize: 9, letterSpacing: 1.4, fontWeight: '800', textAlign: 'center' },
  primaryTextDisabled: { color: '#65655b' },
  inlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  smallButton: { borderWidth: 1, borderColor: '#62562f', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  smallButtonText: { color: '#d1bf7b', fontSize: 8, letterSpacing: 1 },
  scale: { gap: 8 },
  scaleLabel: { color: '#a39b7d', fontSize: 9, letterSpacing: 1 },
  scaleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  scaleDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#303137', alignItems: 'center', justifyContent: 'center' },
  scaleDotActive: { borderColor: '#d6c277', backgroundColor: '#2a2513' },
  scaleDotText: { color: '#676970', fontSize: 9 },
  scaleDotTextActive: { color: '#f7e9a7' },
  counter: { borderWidth: 1, borderColor: '#303137', borderRadius: 15, padding: 15, backgroundColor: '#0a0b0e' },
  counterLabel: { color: '#73757c', fontSize: 8, letterSpacing: 1.1 },
  counterValue: { color: '#e8dab0', fontSize: 22, marginTop: 5 },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#303137', borderRadius: 14, padding: 13, backgroundColor: '#050609', color: '#fffaf0', fontSize: 14 },
  textArea: { minHeight: 145, borderWidth: 1, borderColor: '#303137', borderRadius: 15, padding: 14, backgroundColor: '#050609', color: '#fffaf0', fontSize: 14, lineHeight: 21, textAlignVertical: 'top' },
  textAreaSmall: { minHeight: 100, borderWidth: 1, borderColor: '#303137', borderRadius: 15, padding: 14, backgroundColor: '#050609', color: '#fffaf0', fontSize: 14, lineHeight: 21, textAlignVertical: 'top' },
  privatePreview: { color: '#a99a6a', fontSize: 10, letterSpacing: 0.7 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, borderColor: '#303137', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#08090d' },
  choiceSelected: { borderColor: '#70623a', backgroundColor: '#171309' },
  choiceText: { color: '#777980', fontSize: 9, letterSpacing: 0.8 },
  choiceTextSelected: { color: '#e2d39d' },
  timer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#39331e', borderRadius: 17, padding: 16, backgroundColor: '#0b0b08' },
  timerLabel: { color: '#81754f', fontSize: 8, letterSpacing: 1.2 },
  timerValue: { color: '#f3df98', fontSize: 30, fontVariant: ['tabular-nums'], marginTop: 4 },
  timerTarget: { color: '#5d5843', fontSize: 8, letterSpacing: 1, marginTop: 3 },
  timerButton: { borderWidth: 1, borderColor: '#655a32', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 10 },
  timerButtonText: { color: '#cfbd79', fontSize: 8, letterSpacing: 1.1, fontWeight: '700' },
  reward: { minHeight: 150, borderWidth: 1, borderColor: '#534827', borderRadius: 75, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0d08' },
  rewardLabel: { color: '#887a4f', fontSize: 8, letterSpacing: 1.3 },
  rewardXp: { color: '#fff0ad', fontSize: 28, fontWeight: '300', marginTop: 6 },
  rewardTotal: { color: '#8f825a', fontSize: 9, letterSpacing: 1.1, marginTop: 5 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8, paddingHorizontal: 4, marginTop: 4 },
  footerText: { color: '#4f5158', fontSize: 8, letterSpacing: 0.9 },
});
