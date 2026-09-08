import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { DayDefinition } from '@hnk/day-runtime';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
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
} from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { CAHETEL_DAY_040, CAHETEL_DAY_041 } from './runtime-definitions/cahetel';

type CahetelCanonDay = 40 | 41;
type Controller = ReturnType<typeof useHnkDayRuntime>;

const DEFINITIONS: Record<CahetelCanonDay, DayDefinition> = {
  40: CAHETEL_DAY_040,
  41: CAHETEL_DAY_041,
};

export function CahetelDays040to041Experience({ day }: { day: CahetelCanonDay }) {
  const controller = useHnkDayRuntime(DEFINITIONS[day]);
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
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });

    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase, day]);

  if (controller.loading) {
    return <View style={styles.loading}><Text style={styles.meta}>ABRINDO CHOKMAH · DIA {String(day).padStart(3, '0')}</Text></View>;
  }

  const common = { canon, controller, setLocalError };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · CAHETEL {day - 36}/5 · DIA {String(day).padStart(3, '0')}</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">Esta prática só abre a partir do conteúdo `canon` sincronizado por SHA imutável. Draft editorial nunca é usado como fallback.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia bloqueado pelo servidor"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia anterior e a progressão oficial de Atziluth.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">O encerramento por desconforto não concede XP. Retorne ao ambiente e inicie novamente quando for apropriado.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && day === 40 ? <Day040 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && day === 41 ? <Day041 {...common} /> : null}
    </ScrollView>
  );
}

type CommonProps = {
  canon: CanonicalDaySnapshot | null;
  controller: Controller;
  setLocalError: (value: string | null) => void;
};

function Threshold({ canon, controller, label, title, notice }: { canon: CanonicalDaySnapshot | null; controller: Controller; label: string; title: string; notice: string }) {
  if (controller.phase?.id !== 'threshold') return null;
  return (
    <RuntimeCard label={label} title={title}>
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="HNK-EP-1.1">{notice}</RuntimeNotice>
      <RuntimePrimary label="INICIAR PRÁTICA" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
    </RuntimeCard>
  );
}

function Day040({ canon, controller, setLocalError }: CommonProps) {
  const [verbalSeconds, setVerbalSeconds] = useState(0);
  const [silentSeconds, setSilentSeconds] = useState(0);
  const [truisms, setTruisms] = useState(['', '', '']);
  const [suggestion, setSuggestion] = useState('');
  const [verbalHeaviness, setVerbalHeaviness] = useState(0);
  const [silentHeaviness, setSilentHeaviness] = useState(0);
  const [verbalComfort, setVerbalComfort] = useState(5);
  const [silentComfort, setSilentComfort] = useState(5);
  const [autonomyPreserved, setAutonomyPreserved] = useState(false);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [objects, setObjects] = useState(0);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="CAHETEL 4/5" title="Autoindução ocular sem perda de agência" notice="Peso nas pálpebras é experiência subjetiva possível, não prova de controle involuntário nem de mecanismo cerebral específico. Piscar e abrir os olhos continuam permitidos." />;

  if (phase === 'verbal') return (
    <RuntimeCard label="CONDIÇÃO A · VERBAL" title="Truísmos + sugestão permissiva · 6 minutos">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={verbalSeconds} target={360} onChange={setVerbalSeconds} />
      {truisms.map((value, index) => (
        <TextInput
          key={index}
          value={value}
          onChangeText={(text) => setTruisms((current) => current.map((item, i) => i === index ? text : item))}
          placeholder={`${index + 1} · truísmo verificável · Vault`}
          placeholderTextColor="#666971"
          style={runtimeTextStyles.input}
        />
      ))}
      <TextInput value={suggestion} onChangeText={setSuggestion} placeholder="Uma sugestão permissiva de relaxamento · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.input} />
      <RuntimeScale label="PESO PERCEBIDO DAS PÁLPEBRAS" value={verbalHeaviness} onChange={setVerbalHeaviness} />
      <RuntimeScale label="CONFORTO OCULAR" value={verbalComfort} onChange={setVerbalComfort} />
      <RuntimeNotice title="STOP GATE">Dor ocular, cefaleia, tontura, alteração visual persistente ou ansiedade crescente encerram a prática. Não force os olhos para cima e não dispute com a necessidade de piscar.</RuntimeNotice>
      <RuntimePrimary label="ENCERRAR POR DESCONFORTO" disabled={controller.busy} onPress={() => controller.interrupt({ durationSeconds: verbalSeconds, evidence: { safety_stop: true }, metrics: { verbal_seconds: verbalSeconds, verbal_comfort: verbalComfort } })} />
      <RuntimePrimary label="IR À CONDIÇÃO SILENCIOSA" disabled={verbalSeconds < 360 || truisms.some((value) => value.trim().length < 4) || suggestion.trim().length < 4} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'silent') return (
    <RuntimeCard label="CONDIÇÃO B · SILENCIOSA" title="Mesmo alvo visual, sem pacing/leading · 6 minutos">
      <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={silentSeconds} target={360} onChange={setSilentSeconds} />
      <RuntimeScale label="PESO PERCEBIDO DAS PÁLPEBRAS" value={silentHeaviness} onChange={setSilentHeaviness} />
      <RuntimeScale label="CONFORTO OCULAR" value={silentComfort} onChange={setSilentComfort} />
      <RuntimePrimary label="ENCERRAR POR DESCONFORTO" disabled={controller.busy} onPress={() => controller.interrupt({ durationSeconds: verbalSeconds + silentSeconds, evidence: { safety_stop: true }, metrics: { silent_seconds: silentSeconds, silent_comfort: silentComfort } })} />
      <RuntimePrimary label="COMPARAR CONDIÇÕES" disabled={silentSeconds < 360} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'compare') return (
    <RuntimeCard label="COMPARAÇÃO" title="Descrever diferença sem fabricar um vencedor">
      <Text style={runtimeTextStyles.body}>Verbal: peso {verbalHeaviness}/10 · conforto {verbalComfort}/10. Silenciosa: peso {silentHeaviness}/10 · conforto {silentComfort}/10.</Text>
      <RuntimeChoice selected={autonomyPreserved} label="ABRIR OS OLHOS CONTINUOU SENDO UMA ESCOLHA SIMPLES" onPress={() => setAutonomyPreserved((value) => !value)} />
      <RuntimeChoice selected={comparisonCompleted} label="COMPAREI AS CONDIÇÕES SEM TRATAR DIFERENÇA COMO PROVA DE CONTROLE" onPress={() => setComparisonCompleted((value) => !value)} />
      <RuntimePrimary label="RETORNAR AO AMBIENTE" disabled={!autonomyPreserved || !comparisonCompleted} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'grounding') return (
    <RuntimeCard label="GROUNDING" title="Abrir os olhos plenamente e localizar o ambiente">
      <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objects} onPress={() => setObjects((value) => Math.min(3, value + 1))} />
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Cahetel 4/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 040'} disabled={controller.busy || !controller.auth.client || !controller.auth.userId} onPress={() => void (async () => {
        setLocalError(null);
        try {
          if (!controller.auth.client || !controller.auth.userId) return;
          const encrypted = await encryptVaultText({
            userId: controller.auth.userId,
            day: 40,
            kind: 'ocular-autoinduction',
            plaintext: JSON.stringify({
              schema: 'hnk-day040-autoinduction-v1',
              truisms: truisms.map((value) => value.trim()),
              permissive_suggestion: suggestion.trim(),
              comparison: {
                verbal_heaviness: verbalHeaviness,
                silent_heaviness: silentHeaviness,
                verbal_comfort: verbalComfort,
                silent_comfort: silentComfort,
              },
            }),
          });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 40, payload: encrypted });
          await controller.seal({
            localRecordHash: encrypted.checksumSha256,
            durationSeconds: verbalSeconds + silentSeconds,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              verbal_condition_completed: true,
              silent_condition_completed: true,
              comparison_completed: comparisonCompleted,
              autonomy_preserved: autonomyPreserved,
              verbal_seconds: verbalSeconds,
              silent_seconds: silentSeconds,
              truisms_logged: 3,
              suggestions_logged: 1,
            },
            metrics: {
              verbal_heaviness: verbalHeaviness,
              silent_heaviness: silentHeaviness,
              verbal_comfort: verbalComfort,
              silent_comfort: silentComfort,
              total_seconds: verbalSeconds + silentSeconds,
            },
          });
          controller.nextPhase();
        } catch (cause) {
          setLocalError(cause instanceof Error ? cause.message : 'day040_seal_failed');
        }
      })()} />
    </RuntimeCard>
  );

  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="CAHETEL 4/5" />;
  return null;
}

function Day041({ canon, controller, setLocalError }: CommonProps) {
  const [question, setQuestion] = useState('');
  const [questionSafe, setQuestionSafe] = useState(false);
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [openSeconds, setOpenSeconds] = useState(0);
  const [activeContent, setActiveContent] = useState('');
  const [openContent, setOpenContent] = useState('');
  const [activeNoResponse, setActiveNoResponse] = useState(false);
  const [openNoResponse, setOpenNoResponse] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [alternative, setAlternative] = useState('');
  const [verification, setVerification] = useState('');
  const [interpretationDelayed, setInterpretationDelayed] = useState(false);
  const [objects, setObjects] = useState(0);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="CAHETEL 5/5" title="Intuição Zoe com rastreabilidade" notice="Imagem, sensação, palavra, memória ou silêncio podem ser registrados como experiência. Nenhum conteúdo interno é automaticamente revelação, previsão ou conhecimento externo confirmado." />;

  if (phase === 'question') return (
    <RuntimeCard label="PERGUNTA" title="Escolha algo espiritual, não urgente e não crítico">
      <Text style={runtimeTextStyles.private}>A pergunta é privada e será cifrada no Vault. Não use esta prática para decidir emergência, saúde, finanças, acusações ou risco para terceiros.</Text>
      <TextInput value={question} onChangeText={setQuestion} multiline placeholder="Pergunta espiritual · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <RuntimeChoice selected={questionSafe} label="A PERGUNTA NÃO EXIGE DECISÃO IMEDIATA DE SEGURANÇA" onPress={() => setQuestionSafe((value) => !value)} />
      <RuntimePrimary label="RECEPÇÃO COM PERGUNTA" disabled={!questionSafe || question.trim().length < 8} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'active') return (
    <RuntimeCard label="CONDIÇÃO A · PERGUNTA ATIVA" title="Sete minutos recebendo sem interpretar">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={activeSeconds} target={420} onChange={setActiveSeconds} />
      <TextInput value={activeContent} onChangeText={(text) => { setActiveContent(text); if (text.trim()) setActiveNoResponse(false); }} multiline placeholder="Imagem, sensação, palavra, memória — apenas forma da experiência · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <RuntimeChoice selected={activeNoResponse} label="NENHUMA RESPOSTA / SILÊNCIO TAMBÉM É UM RESULTADO VÁLIDO" onPress={() => { setActiveNoResponse((value) => !value); if (!activeNoResponse) setActiveContent(''); }} />
      <RuntimePrimary label="RECEPÇÃO ABERTA" disabled={activeSeconds < 420 || (!activeNoResponse && activeContent.trim().length === 0)} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'open') return (
    <RuntimeCard label="CONDIÇÃO B · RECEPÇÃO ABERTA" title="Sete minutos sem formular pergunta">
      <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={openSeconds} target={420} onChange={setOpenSeconds} />
      <TextInput value={openContent} onChangeText={(text) => { setOpenContent(text); if (text.trim()) setOpenNoResponse(false); }} multiline placeholder="Ocorrência espontânea — sem procurar conexão com a pergunta · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <RuntimeChoice selected={openNoResponse} label="NENHUMA OCORRÊNCIA / SILÊNCIO TAMBÉM É VÁLIDO" onPress={() => { setOpenNoResponse((value) => !value); if (!openNoResponse) setOpenContent(''); }} />
      <RuntimePrimary label="DISCERNIR" disabled={openSeconds < 420 || (!openNoResponse && openContent.trim().length === 0)} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'discernment') return (
    <RuntimeCard label="DISCERNIMENTO" title="Separar experiência, interpretação, alternativa e verificação">
      <TextInput value={interpretation} onChangeText={setInterpretation} multiline placeholder="Interpretação possível — pode permanecer vazia/incerta · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <TextInput value={alternative} onChangeText={setAlternative} multiline placeholder="Explicação alternativa — ou registre incerto/sem resposta · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <TextInput value={verification} onChangeText={setVerification} multiline placeholder="Verificação segura antes de agir — ou nenhuma ação sem evidência · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <RuntimeChoice selected={interpretationDelayed} label="REGISTREI A EXPERIÊNCIA ANTES DE INTERPRETAR" onPress={() => setInterpretationDelayed((value) => !value)} />
      <RuntimeNotice title="LIMITE">Nenhuma impressão interna substitui avaliação concreta em segurança, saúde, finanças, acusações ou riscos para terceiros.</RuntimeNotice>
      <RuntimePrimary label="RETORNAR" disabled={!interpretationDelayed || alternative.trim().length < 4 || verification.trim().length < 4} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'grounding') return (
    <RuntimeCard label="GROUNDING" title="Retorno voluntário ao ambiente">
      <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objects} onPress={() => setObjects((value) => Math.min(3, value + 1))} />
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );

  if (phase === 'seal') return (
    <RuntimeCard label="SELO DO CICLO" title="Cahetel 5/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 041'} disabled={controller.busy || !controller.auth.client || !controller.auth.userId} onPress={() => void (async () => {
        setLocalError(null);
        try {
          if (!controller.auth.client || !controller.auth.userId) return;
          const encrypted = await encryptVaultText({
            userId: controller.auth.userId,
            day: 41,
            kind: 'intuition-zoe',
            plaintext: JSON.stringify({
              schema: 'hnk-day041-intuition-zoe-v1',
              question: question.trim(),
              active_reception: activeNoResponse ? null : activeContent.trim(),
              open_reception: openNoResponse ? null : openContent.trim(),
              interpretation: interpretation.trim() || null,
              alternative: alternative.trim(),
              verification: verification.trim(),
            }),
          });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 41, payload: encrypted });
          await controller.seal({
            localRecordHash: encrypted.checksumSha256,
            durationSeconds: activeSeconds + openSeconds,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              question_defined: true,
              active_reception_completed: true,
              open_reception_completed: true,
              interpretation_delayed: interpretationDelayed,
              alternative_recorded: true,
              verification_defined: true,
              active_reception_seconds: activeSeconds,
              open_reception_seconds: openSeconds,
              active_content_present: !activeNoResponse && activeContent.trim().length > 0,
              open_content_present: !openNoResponse && openContent.trim().length > 0,
            },
            metrics: {
              active_reception_seconds: activeSeconds,
              open_reception_seconds: openSeconds,
              active_no_response: activeNoResponse,
              open_no_response: openNoResponse,
              total_seconds: activeSeconds + openSeconds,
            },
          });
          controller.nextPhase();
        } catch (cause) {
          setLocalError(cause instanceof Error ? cause.message : 'day041_seal_failed');
        }
      })()} />
    </RuntimeCard>
  );

  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="CAHETEL 5/5" />;
  return null;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  content: { padding: 20, paddingBottom: 64, gap: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' },
  header: { gap: 7, marginBottom: 4 },
  eyebrow: { color: '#5f94aa', fontSize: 8, letterSpacing: 1.5 },
  title: { color: '#e6f7ff', fontSize: 26, lineHeight: 32, fontWeight: '300' },
  meta: { color: '#5c7986', fontSize: 8, letterSpacing: 0.8 },
});
