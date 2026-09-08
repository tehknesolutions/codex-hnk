import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from './canonical-day';
import {
  KETHER_PORTAL_036,
  PORTAL_036_CANONICAL_BLOCKER_ISSUE,
  PORTAL_036_OPERATORS_APPROVED,
} from './runtime-definitions/portal036';
import {
  CanonicalText,
  RuntimeCard,
  RuntimeChoice,
  RuntimeCompletion,
  RuntimeCounter,
  RuntimeNotice,
  RuntimePrimary,
  RuntimeScale,
  RuntimeTimer,
  runtimeTextStyles,
} from './KetherRuntimePrimitives';
import { useHnkDayRuntime } from './useHnkDayRuntime';

type Controller = ReturnType<typeof useHnkDayRuntime>;
type Attribute = 'HIP' | 'VNT' | 'PER' | 'SIN' | 'BIO' | 'INT' | 'DIS';
const ATTRIBUTES: Attribute[] = ['HIP', 'VNT', 'PER', 'SIN', 'BIO', 'INT', 'DIS'];

export function KetherPortal036Experience() {
  const controller = useHnkDayRuntime(KETHER_PORTAL_036);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { active = false; };
    void loadCanonicalDay(controller.auth.client, 36)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO O LIMIAR DO PORTAL 036</Text></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>KETHER 36/36 · PORTAL DE TRANSMUTAÇÃO</Text>
        <Text style={styles.title}>{canon?.title ?? 'KETHER → CHOKMAH'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)} · +${canon.xp} XP` : 'CÂNONE SINCRONIZANDO'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">{canonError}</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="PORTAL INTERROMPIDO">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <LockedPortal controller={controller} /> : null}
      {controller.runtime?.status !== 'locked' && controller.phase?.id === 'threshold' ? <PortalThreshold canon={canon} controller={controller} /> : null}
      {controller.runtime?.status !== 'locked' && PORTAL_036_OPERATORS_APPROVED ? <PortalExecutable canon={canon} controller={controller} setLocalError={setLocalError} /> : null}
    </ScrollView>
  );
}

function LockedPortal({ controller }: { controller: Controller }) {
  const completed = controller.progress?.completedDays.filter((day) => day >= 1 && day <= 35).length ?? 0;
  return (
    <RuntimeCard label="GATE 35/35" title="A Coroa ainda não está pronta para o exame">
      <Text style={styles.crown}>{completed}/35 DIAS · {Math.floor(completed / 5)}/7 FRAGMENTOS COMPLETOS</Text>
      <RuntimeNotice title="AUTORIDADE DO SERVIDOR">O cliente não pode contornar a sequência. O Portal exige todos os Dias 001–035 concluídos.</RuntimeNotice>
    </RuntimeCard>
  );
}

function PortalThreshold({ canon, controller }: { canon: CanonicalDaySnapshot | null; controller: Controller }) {
  const completed = controller.progress?.completedDays.filter((day) => day >= 1 && day <= 35).length ?? 0;
  return (
    <>
      <RuntimeCard label="COROA 7/7" title="O Portal pode ser enfrentado — a promoção ainda não ocorreu">
        <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
        <Text style={styles.crown}>{completed}/35 · GRAU {controller.progress?.initiatoryGrade ?? 1} · {(controller.progress?.initiatoryTitle ?? 'Neófito').toUpperCase()}</Text>
        <RuntimeNotice title="RESPONSABILIDADE, NÃO SUPERIORIDADE">A conclusão do Dia 035 acende a Coroa. Somente a transação válida do Dia 036 pode promover Neófito → Iniciado.</RuntimeNotice>
      </RuntimeCard>

      {!PORTAL_036_OPERATORS_APPROVED ? (
        <RuntimeCard label="CANONICAL_REFERENCE_PENDING" title="Execução ritual bloqueada por integridade canônica">
          <Text style={runtimeTextStyles.body}>O Dia 036 exige Sintonizador Angelical, Solfeggio de transição e sigilo de Kether. A fonte atual exige esses operadores, mas ainda não congela parâmetros/assets suficientes para produção.</Text>
          <RuntimeNotice title={`ISSUE #${PORTAL_036_CANONICAL_BLOCKER_ISSUE}`}>Nenhum preset, frequência, sigilo ou substituto será escolhido pelo cliente. O boss estrutural está implementado, mas `begin()` permanece inacessível até aprovação/versionamento.</RuntimeNotice>
        </RuntimeCard>
      ) : (
        <RuntimePrimary label="ENTRAR NO PRE-FLIGHT" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
      )}
    </>
  );
}

function PortalExecutable({ canon, controller, setLocalError }: { canon: CanonicalDaySnapshot | null; controller: Controller; setLocalError: (value: string | null) => void }) {
  const [preflight, setPreflight] = useState([false, false, false, false, false]);
  const [sequenceSteps, setSequenceSteps] = useState([false, false, false, false]);
  const [gnosisSeconds, setGnosisSeconds] = useState(0);
  const [activeDispersions, setActiveDispersions] = useState(0);
  const [activeDepth, setActiveDepth] = useState(5);
  const [activeStability, setActiveStability] = useState(5);
  const [activeClarity, setActiveClarity] = useState(5);
  const [returnA, setReturnA] = useState([false, false, false, false]);
  const [baseSeconds, setBaseSeconds] = useState(0);
  const [baseDispersions, setBaseDispersions] = useState(0);
  const [baseDepth, setBaseDepth] = useState(5);
  const [baseStability, setBaseStability] = useState(5);
  const [baseClarity, setBaseClarity] = useState(5);
  const [returnB, setReturnB] = useState([false, false, false, false]);
  const [comparison, setComparison] = useState(false);
  const [consolidated, setConsolidated] = useState<number[]>([]);
  const [fragile, setFragile] = useState<number[]>([]);
  const [prematureCriterion, setPrematureCriterion] = useState(false);
  const [attributeDays, setAttributeDays] = useState<Record<Attribute, string>>({ HIP: '', VNT: '', PER: '', SIN: '', BIO: '', INT: '', DIS: '' });
  const [whatLearned, setWhatLearned] = useState('');
  const [investigable, setInvestigable] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [vaultHash, setVaultHash] = useState<string | null>(null);
  const [readiness, setReadiness] = useState(5);
  const [safetyBlocking, setSafetyBlocking] = useState(false);
  const phase = controller.phase?.id;

  const completedDays = useMemo(() => new Set(controller.progress?.completedDays ?? []), [controller.progress?.completedDays]);
  const attributeEvidence = ATTRIBUTES.map((attribute) => Number(attributeDays[attribute])).filter((day) => Number.isInteger(day) && day >= 1 && day <= 35 && completedDays.has(day));
  const attributesReady = attributeEvidence.length === 7;

  if (safetyBlocking) return (
    <RuntimeCard label="SAFETY STOP" title="Portal encerrado sem promoção">
      <Text style={runtimeTextStyles.body}>A tentativa foi interrompida. Dias 001–035 e Coroa 7/7 permanecem preservados; +500 XP e promoção não são concedidos.</Text>
    </RuntimeCard>
  );

  if (phase === 'preflight') {
    const labels = ['Ambiente adequado e sem risco imediato', 'Posição confortável', 'Posso interromper a qualquer momento', 'Volume/áudio sob meu controle', 'Vault disponível para síntese privada'];
    return <RuntimeCard label="PRE-FLIGHT" title="Agência antes da travessia">{labels.map((label, index) => <RuntimeChoice key={label} selected={preflight[index]} label={label} onPress={() => setPreflight((rows) => rows.map((value, i) => i === index ? !value : value))} />)}<RuntimePrimary label="VALIDAR OPERADORES" disabled={!preflight.every(Boolean)} onPress={controller.nextPhase} /></RuntimeCard>;
  }

  if (phase === 'operator-gate') return <RuntimeCard label="OPERADORES APROVADOS" title="Sintonizador · Solfeggio · Sigilo"><RuntimeNotice title="VERSIONAMENTO OBRIGATÓRIO">Esta fase só existe quando `PORTAL_036_OPERATORS_APPROVED` for liberado por mudança canônica versionada.</RuntimeNotice><RuntimePrimary label="INICIAR CONDITION A" onPress={controller.nextPhase} /></RuntimeCard>;

  if (phase === 'portal-active') return (
    <RuntimeCard label="CONDITION A · PORTAL" title="Sequência integrada de Kether">
      <Text style={runtimeTextStyles.body}>Marque somente etapas realmente executadas. Uma falha pode ser reconhecida e recuperada; não existe GAME OVER.</Text>
      {['Sintonizador Angelical acionado', 'Solfeggio de transição ativo', 'Indução completa estabilizada', 'Sigilo de Kether ativado'].map((label, index) => <RuntimeChoice key={label} selected={sequenceSteps[index]} label={label} onPress={() => setSequenceSteps((rows) => rows.map((value, i) => i === index ? !value : value))} />)}
      <RuntimeTimer value={gnosisSeconds} target={300} onChange={setGnosisSeconds} />
      <RuntimeCounter label="DISPERSÕES / RECUPERAÇÕES" value={activeDispersions} onPress={() => setActiveDispersions((value) => value + 1)} />
      <RuntimeScale label="PROFUNDIDADE AUTORRELATADA" value={activeDepth} onChange={setActiveDepth} />
      <RuntimeScale label="ESTABILIDADE" value={activeStability} onChange={setActiveStability} />
      <RuntimeScale label="CLAREZA" value={activeClarity} onChange={setActiveClarity} />
      <SafetyStop onPress={() => { setSafetyBlocking(true); controller.interrupt({ evidence: { safety_blocking_state: true }, metrics: { portal_safety_stop: true, stage_ordinal: 1 } }); }} />
      <RuntimePrimary label="RETURN GATE A" disabled={!sequenceSteps.every(Boolean) || gnosisSeconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'return-a') return <PortalReturnGate title="RETURN GATE A" checks={returnA} setChecks={setReturnA} onDone={controller.nextPhase} />;

  if (phase === 'base') return (
    <RuntimeCard label="CONDITION B · BASE" title="Indução + gnose sem os três operadores">
      <RuntimeNotice title="CONTROLE">Sem Sintonizador, sem Solfeggio de transição e sem sigilo de Kether. Mesma lógica de observação, sem tentar tornar o controle pior.</RuntimeNotice>
      <RuntimeTimer value={baseSeconds} target={300} onChange={setBaseSeconds} />
      <RuntimeCounter label="DISPERSÕES / RECUPERAÇÕES" value={baseDispersions} onPress={() => setBaseDispersions((value) => value + 1)} />
      <RuntimeScale label="PROFUNDIDADE AUTORRELATADA" value={baseDepth} onChange={setBaseDepth} />
      <RuntimeScale label="ESTABILIDADE" value={baseStability} onChange={setBaseStability} />
      <RuntimeScale label="CLAREZA" value={baseClarity} onChange={setBaseClarity} />
      <SafetyStop onPress={() => { setSafetyBlocking(true); controller.interrupt({ evidence: { safety_blocking_state: true }, metrics: { portal_safety_stop: true, stage_ordinal: 2 } }); }} />
      <RuntimePrimary label="RETURN GATE B" disabled={baseSeconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'return-b') return <PortalReturnGate title="RETURN GATE B" checks={returnB} setChecks={setReturnB} onDone={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />;

  if (phase === 'comparison') return (
    <RuntimeCard label="PORTAL × BASE" title="Comparar sem fabricar causalidade">
      <Text style={styles.delta}>PROFUNDIDADE · A {activeDepth}/10 · B {baseDepth}/10</Text>
      <Text style={styles.delta}>ESTABILIDADE · A {activeStability}/10 · B {baseStability}/10</Text>
      <Text style={styles.delta}>CLAREZA · A {activeClarity}/10 · B {baseClarity}/10</Text>
      <Text style={styles.delta}>DISPERSÕES · A {activeDispersions} · B {baseDispersions}</Text>
      <RuntimeNotice title="HNK-EP">Diferença observada pertence ao protocolo HNK; não prova efeito independente de símbolo, áudio ou tecnologia.</RuntimeNotice>
      <RuntimePrimary label="REGISTRAR COMPARAÇÃO" onPress={() => { setComparison(true); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (phase === 'review') return (
    <RuntimeCard label="REVIEW 001–035" title="3 consolidadas · 3 frágeis · sem reescrever a história">
      <Text style={runtimeTextStyles.body}>Escolha Dias como referências de competências. Isso cria uma lente de revisão; não altera Practice Records antigos.</Text>
      <DayReferencePicker label="CONSOLIDADAS" selected={consolidated} setSelected={setConsolidated} max={3} />
      <DayReferencePicker label="FRÁGEIS" selected={fragile} setSelected={setFragile} max={3} />
      <RuntimeChoice selected={prematureCriterion} label="DECLAREI UM CRITÉRIO OBJETIVO QUE IMPEDIRIA PROMOÇÃO PREMATURA" onPress={() => setPrematureCriterion((value) => !value)} />
      <RuntimePrimary label="EVIDÊNCIAS DOS 7 ATRIBUTOS" disabled={consolidated.length !== 3 || fragile.length !== 3 || !prematureCriterion} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'attributes') return (
    <RuntimeCard label="ATTRIBUTE EVIDENCE" title="Sete referências existentes · nenhum ganho inventado">
      <RuntimeNotice title="SEM AUTO-LEVEL">Selecionar evidência não incrementa HIP/VNT/PER/SIN/BIO/INT/DIS. O Portal registra referências; ganhos de atributo exigem contrato próprio.</RuntimeNotice>
      {ATTRIBUTES.map((attribute) => <TextInput key={attribute} value={attributeDays[attribute]} onChangeText={(text) => setAttributeDays((state) => ({ ...state, [attribute]: text.replace(/\D/g, '').slice(0, 2) }))} keyboardType="number-pad" placeholder={`${attribute} · Dia 001–035 concluído`} placeholderTextColor="#656871" style={runtimeTextStyles.input} />)}
      <Text style={styles.meta}>{attributeEvidence.length}/7 referências válidas</Text>
      <RuntimePrimary label="SÍNTESE PRIVADA" disabled={!attributesReady} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'synthesis') return (
    <RuntimeCard label="SÍNTESE DE KETHER" title="Texto integral somente no Vault">
      <TextInput value={whatLearned} onChangeText={setWhatLearned} multiline placeholder="O que Kether ensinou?" placeholderTextColor="#656871" style={runtimeTextStyles.textArea} />
      <TextInput value={investigable} onChangeText={setInvestigable} multiline placeholder="O que permanece investigável?" placeholderTextColor="#656871" style={runtimeTextStyles.textArea} />
      <TextInput value={discipline} onChangeText={setDiscipline} multiline placeholder="Qual disciplina seguirá para Chokmah?" placeholderTextColor="#656871" style={runtimeTextStyles.textArea} />
      <RuntimePrimary label={vaultHash ? 'SÍNTESE CIFRADA' : 'CIFRAR SÍNTESE'} disabled={Boolean(vaultHash) || !whatLearned.trim() || !investigable.trim() || !discipline.trim()} onPress={() => void (async () => {
        if (!controller.auth.client || !controller.auth.userId) return;
        setLocalError(null);
        try {
          const encrypted = await encryptVaultText({
            userId: controller.auth.userId,
            day: 36,
            kind: 'journal',
            plaintext: JSON.stringify({ schema: 'hnk-portal036-synthesis-v1', whatLearned: whatLearned.trim(), investigable: investigable.trim(), discipline: discipline.trim() }),
          });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 36, payload: encrypted });
          setVaultHash(encrypted.checksumSha256);
          setWhatLearned(''); setInvestigable(''); setDiscipline('');
          controller.nextPhase();
        } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'portal_vault_seal_failed'); }
      })()} />
    </RuntimeCard>
  );

  if (phase === 'promotion-review') return (
    <RuntimeCard label="PROMOTION REVIEW" title="Continuidade, não perfeição">
      <RuntimeScale label="PRONTIDÃO PERCEBIDA · NÃO É THRESHOLD ISOLADO" value={readiness} onChange={setReadiness} />
      <RuntimeNotice title="GATE ESTRUTURAL">Promoção depende da execução completa, comparação, retorno, revisão, 3/3 competências, 7 evidências, síntese cifrada e ausência de safety blocker — não de profundidade mínima ou fenômenos extraordinários.</RuntimeNotice>
      <RuntimePrimary label="REVISAR SELO FINAL" disabled={!comparison || !vaultHash || safetyBlocking} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'seal') return (
    <RuntimeCard label="SELO ATÔMICO" title="Neófito → Iniciado somente no backend">
      <RuntimePrimary label={controller.busy ? 'SELANDO PORTAL…' : 'SELAR PORTAL 036 · +500 XP'} disabled={controller.busy || !vaultHash || safetyBlocking} onPress={() => void controller.seal({
        durationSeconds: gnosisSeconds + baseSeconds,
        localRecordHash: vaultHash,
        evidence: {
          portal_condition_completed: sequenceSteps.every(Boolean) && gnosisSeconds >= 300,
          base_condition_completed: baseSeconds >= 300,
          portal_base_comparison_completed: comparison,
          return_confirmed: returnA.every(Boolean) && returnB.every(Boolean),
          review_001_035_completed: consolidated.length === 3 && fragile.length === 3,
          consolidated_competencies_count: consolidated.length,
          fragile_competencies_count: fragile.length,
          attribute_evidence_count: attributeEvidence.length,
          premature_promotion_criterion_declared: prematureCriterion,
          kether_synthesis_completed: Boolean(vaultHash),
          journal_update_confirmed: Boolean(vaultHash),
          safety_blocking_state: safetyBlocking,
          safety_clear: !safetyBlocking,
        },
        metrics: {
          portal_gnosis_seconds: gnosisSeconds,
          base_gnosis_seconds: baseSeconds,
          active_dispersions: activeDispersions,
          base_dispersions: baseDispersions,
          active_depth: activeDepth,
          base_depth: baseDepth,
          active_stability: activeStability,
          base_stability: baseStability,
          active_clarity: activeClarity,
          base_clarity: baseClarity,
          readiness_rating: readiness,
          consolidated_ref_1: consolidated[0] ?? 0,
          consolidated_ref_2: consolidated[1] ?? 0,
          consolidated_ref_3: consolidated[2] ?? 0,
          fragile_ref_1: fragile[0] ?? 0,
          fragile_ref_2: fragile[1] ?? 0,
          fragile_ref_3: fragile[2] ?? 0,
          ...Object.fromEntries(ATTRIBUTES.map((attribute, index) => [`attribute_ref_${index + 1}`, Number(attributeDays[attribute]) || 0])),
        },
      }).then(controller.nextPhase)} />
    </RuntimeCard>
  );

  if (phase === 'complete') return (
    <>
      <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="KETHER 36/36" />
      <RuntimeCard label="PASSAGEM CONFIRMADA" title="Level 2 · Iniciado">
        <View style={styles.transitions}><Text style={styles.transition}>FEHU → URUZ</Text><Text style={styles.transition}>O LOUCO → O MAGO</Text><Text style={styles.transition}>HEXAGRAMA 1 → HEXAGRAMA 2</Text></View>
        <RuntimeNotice title="CHOKMAH DESBLOQUEADO">A passagem aumenta responsabilidade, não superioridade. O backend define `current_day=37`, mas não cria Practice Session, completion ou XP do Dia 037 automaticamente.</RuntimeNotice>
      </RuntimeCard>
    </>
  );

  return null;
}

function PortalReturnGate({ title, checks, setChecks, onDone }: { title: string; checks: boolean[]; setChecks: (value: boolean[]) => void; onDone: () => void }) {
  const labels = ['Olhos/consciência ambiental restaurados', 'Movimento voluntário confirmado', 'Orientação ao ambiente confirmada', 'Clareza suficiente para continuar'];
  return (
    <RuntimeCard label={title} title="Retorno explícito antes da próxima etapa">
      {labels.map((label, index) => <RuntimeChoice key={label} selected={checks[index]} label={label} onPress={() => setChecks(checks.map((value, i) => i === index ? !value : value))} />)}
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={!checks.every(Boolean)} onPress={onDone} />
    </RuntimeCard>
  );
}

function DayReferencePicker({ label, selected, setSelected, max }: { label: string; selected: number[]; setSelected: (value: number[]) => void; max: number }) {
  const [candidate, setCandidate] = useState('');
  const day = Number(candidate);
  const add = () => {
    if (!Number.isInteger(day) || day < 1 || day > 35 || selected.includes(day) || selected.length >= max) return;
    setSelected([...selected, day]);
    setCandidate('');
  };
  return (
    <View style={styles.referenceGroup}>
      <Text style={styles.meta}>{label} · {selected.length}/{max}</Text>
      <View style={styles.referenceRow}><TextInput value={candidate} onChangeText={(text) => setCandidate(text.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" placeholder="Dia 1–35" placeholderTextColor="#656871" style={[runtimeTextStyles.input, styles.referenceInput]} /><Pressable style={styles.addButton} onPress={add}><Text style={styles.addText}>ADICIONAR</Text></Pressable></View>
      <View style={runtimeTextStyles.row}>{selected.map((value) => <RuntimeChoice key={value} selected label={`DIA ${String(value).padStart(3, '0')} ×`} onPress={() => setSelected(selected.filter((item) => item !== value))} />)}</View>
    </View>
  );
}

function SafetyStop({ onPress }: { onPress: () => void }) {
  return <Pressable style={styles.safetyStop} onPress={onPress}><Text style={styles.safetyStopText}>SAFETY STOP · ENCERRAR SEM PROMOÇÃO</Text></Pressable>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020304' },
  content: { width: '100%', maxWidth: 780, alignSelf: 'center', padding: 24, gap: 18, paddingBottom: 90 },
  loading: { flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020304' },
  header: { gap: 7, paddingBottom: 4 },
  eyebrow: { color: '#a08a50', fontSize: 9, letterSpacing: 1.6 },
  title: { color: '#fff4cf', fontSize: 30, lineHeight: 36, fontWeight: '300' },
  meta: { color: '#676960', fontSize: 8, letterSpacing: 0.9 },
  crown: { color: '#f0da8c', fontSize: 15, lineHeight: 23, letterSpacing: 1.1, textAlign: 'center' },
  delta: { color: '#c9bc90', fontSize: 12, lineHeight: 19 },
  transitions: { gap: 10, alignItems: 'center', paddingVertical: 10 },
  transition: { color: '#efdc9b', fontSize: 17, letterSpacing: 1.5 },
  referenceGroup: { gap: 9, borderWidth: 1, borderColor: '#292a2f', borderRadius: 14, padding: 12 },
  referenceRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  referenceInput: { flex: 1 },
  addButton: { borderWidth: 1, borderColor: '#6e6038', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 15 },
  addText: { color: '#d9c57d', fontSize: 8, letterSpacing: 1 },
  safetyStop: { borderWidth: 1, borderColor: '#623a39', borderRadius: 13, padding: 13, backgroundColor: '#160b0b' },
  safetyStopText: { color: '#dca39e', fontSize: 9, letterSpacing: 1.1, textAlign: 'center', fontWeight: '700' },
});
