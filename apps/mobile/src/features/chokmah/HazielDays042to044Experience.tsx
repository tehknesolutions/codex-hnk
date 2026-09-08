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
import { HAZIEL_DAY_042, HAZIEL_DAY_043, HAZIEL_DAY_044 } from './runtime-definitions/haziel';

type HazielCanonDay = 42 | 43 | 44;
type Controller = ReturnType<typeof useHnkDayRuntime>;

const DEFINITIONS: Record<HazielCanonDay, DayDefinition> = {
  42: HAZIEL_DAY_042,
  43: HAZIEL_DAY_043,
  44: HAZIEL_DAY_044,
};

export function HazielDays042to044Experience({ day }: { day: HazielCanonDay }) {
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
    return <View style={styles.loading}><Text style={styles.meta}>ABRINDO HAZIEL · DIA {String(day).padStart(3, '0')}</Text></View>;
  }

  const common = { canon, controller, setLocalError };
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · HAZIEL {day - 41}/5 · DIA {String(day).padStart(3, '0')}</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">Haziel só executa conteúdo `canon` sincronizado por commit SHA imutável. Draft/candidate nunca é fallback.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia anterior no estado canônico do servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Stop Gate preservado. Nenhum XP é concedido por interromper; grounding e retorno vêm antes de nova tentativa.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && day === 42 ? <Day042 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && day === 43 ? <Day043 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && day === 44 ? <Day044 {...common} /> : null}
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

function Grounding({ controller, title }: { controller: Controller; title: string }) {
  const [objects, setObjects] = useState(0);
  return (
    <RuntimeCard label="GROUNDING" title={title}>
      <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objects} onPress={() => setObjects((value) => Math.min(3, value + 1))} />
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
}

function Day042({ canon, controller, setLocalError }: CommonProps) {
  const [massageSeconds, setMassageSeconds] = useState(0);
  const [residualSeconds, setResidualSeconds] = useState(0);
  const [controlSeconds, setControlSeconds] = useState(0);
  const [frontalIntensity, setFrontalIntensity] = useState(0);
  const [controlIntensity, setControlIntensity] = useState(0);
  const [comfort, setComfort] = useState(5);
  const [frontalPresent, setFrontalPresent] = useState(false);
  const [controlPresent, setControlPresent] = useState(false);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="HAZIEL 1/5" title="Atenção frontal sem alegação neurológica" notice="Ajna e Brodmann 10 permanecem referências do plano em camadas distintas. Sensação frontal não comprova ativação cortical nem abertura energética." />;

  if (phase === 'massage') return (
    <RuntimeCard label="JACHIN · CONTATO" title="Massagem frontal muito leve · 3 minutos">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={massageSeconds} target={180} onChange={setMassageSeconds} />
      <RuntimeScale label="CONFORTO" value={comfort} onChange={setComfort} />
      <RuntimeNotice title="STOP GATE">Não pressione olhos ou órbitas. Dor, cefaleia importante, tontura, dormência persistente ou alteração visual encerram a sessão.</RuntimeNotice>
      <RuntimePrimary label="ENCERRAR POR DESCONFORTO" disabled={controller.busy} onPress={() => controller.interrupt({ durationSeconds: massageSeconds, evidence: { safety_stop: true }, metrics: { massage_seconds: massageSeconds, comfort } })} />
      <RuntimePrimary label="OBSERVAR RESÍDUO" disabled={massageSeconds < 180} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'residual') return (
    <RuntimeCard label="E3 · FENOMENOLOGIA" title="Cinco minutos sem tocar a testa">
      <RuntimeTimer value={residualSeconds} target={300} onChange={setResidualSeconds} />
      <RuntimeChoice selected={frontalPresent} label="PERCEBI ALGUMA SENSAÇÃO FRONTAL (AUSÊNCIA TAMBÉM É VÁLIDA)" onPress={() => setFrontalPresent((value) => !value)} />
      <RuntimeScale label="INTENSIDADE PERCEBIDA" value={frontalIntensity} onChange={setFrontalIntensity} />
      <RuntimePrimary label="IR AO CONTROLE" disabled={residualSeconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'control') return (
    <RuntimeCard label="BOAZ · CONTROLE" title="Ponta do nariz · 5 minutos · sem fórmula teúrgica">
      <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={controlSeconds} target={300} onChange={setControlSeconds} />
      <RuntimeChoice selected={controlPresent} label="PERCEBI ALGUMA SENSAÇÃO NO CONTROLE (AUSÊNCIA É VÁLIDA)" onPress={() => setControlPresent((value) => !value)} />
      <RuntimeScale label="INTENSIDADE DO CONTROLE" value={controlIntensity} onChange={setControlIntensity} />
      <RuntimePrimary label="COMPARAR" disabled={controlSeconds < 300} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'compare') return (
    <RuntimeCard label="REVISÃO" title="Contato, sensação e interpretação não são a mesma camada">
      <Text style={runtimeTextStyles.body}>Frontal {frontalIntensity}/10 · controle {controlIntensity}/10. Diferença não prova mecanismo cortical ou campo energético.</Text>
      <RuntimeChoice selected={comparisonCompleted} label="COMPAREI SEM ESCOLHER UM VENCEDOR" onPress={() => setComparisonCompleted((value) => !value)} />
      <RuntimeChoice selected={interpretationSeparated} label="SEPAREI DADO CORPORAL DE INTERPRETAÇÃO TEÚRGICA" onPress={() => setInterpretationSeparated((value) => !value)} />
      <RuntimeChoice selected={safetyClear} label="SEM SINTOMA DE STOP GATE AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
      <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !safetyClear} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'grounding') return <Grounding controller={controller} title="Abrir os olhos e localizar o ambiente" />;

  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Haziel 1/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 042'} disabled={controller.busy} onPress={() => void controller.seal({
        durationSeconds: massageSeconds + residualSeconds + controlSeconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          massage_completed: true,
          residual_completed: true,
          control_completed: true,
          comparison_completed: comparisonCompleted,
          interpretation_separated: interpretationSeparated,
          safety_clear: safetyClear,
          frontal_sensation_present: frontalPresent,
          control_sensation_present: controlPresent,
          massage_seconds: massageSeconds,
          residual_seconds: residualSeconds,
          control_seconds: controlSeconds,
        },
        metrics: { frontal_intensity: frontalIntensity, control_intensity: controlIntensity, comfort },
      }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day042_seal_failed'))} />
    </RuntimeCard>
  );

  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAZIEL 1/5" />;
  return null;
}

function Day043({ canon, controller, setLocalError }: CommonProps) {
  const [blueSeconds, setBlueSeconds] = useState(0);
  const [graySeconds, setGraySeconds] = useState(0);
  const [bluePresent, setBluePresent] = useState(false);
  const [grayPresent, setGrayPresent] = useState(false);
  const [blueStability, setBlueStability] = useState(0);
  const [grayStability, setGrayStability] = useState(0);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [clairvoyanceNotClaimed, setClairvoyanceNotClaimed] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="HAZIEL 2/5" title="Pérola Azul como imagem interna investigável" notice="Imagem deliberada, evento espontâneo, pós-imagem e interpretação permanecem separados. Brilho subjetivo não confirma clarividência nem objeto externo." />;

  if (phase === 'blue') return (
    <RuntimeCard label="CONDIÇÃO A · AZUL" title="Pérola Azul · 10 minutos">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={blueSeconds} target={600} onChange={setBlueSeconds} />
      <RuntimeChoice selected={bluePresent} label="HOUVE ALGUM CONTEÚDO VISUAL (NÃO É OBRIGATÓRIO)" onPress={() => setBluePresent((value) => !value)} />
      <RuntimeScale label="ESTABILIDADE PERCEBIDA" value={blueStability} onChange={setBlueStability} />
      <RuntimeNotice title="STOP GATE">Não mova nem tensione os olhos sob as pálpebras para perseguir luzes. Dor, cefaleia ou alteração visual persistente encerram a prática.</RuntimeNotice>
      <RuntimePrimary label="ENCERRAR POR DESCONFORTO" onPress={() => controller.interrupt({ durationSeconds: blueSeconds, evidence: { safety_stop: true }, metrics: { blue_seconds: blueSeconds } })} />
      <RuntimePrimary label="IR AO CONTROLE CINZA" disabled={blueSeconds < 600} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'gray') return (
    <RuntimeCard label="CONDIÇÃO B · CINZA" title="Mesmo tamanho e posição · 10 minutos">
      <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={graySeconds} target={600} onChange={setGraySeconds} />
      <RuntimeChoice selected={grayPresent} label="HOUVE ALGUM CONTEÚDO VISUAL NO CONTROLE" onPress={() => setGrayPresent((value) => !value)} />
      <RuntimeScale label="ESTABILIDADE DO CONTROLE" value={grayStability} onChange={setGrayStability} />
      <RuntimePrimary label="COMPARAR" disabled={graySeconds < 600} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'compare') return (
    <RuntimeCard label="REVISÃO" title="Azul e cinza sem prêmio de vidência">
      <Text style={runtimeTextStyles.body}>Azul {blueStability}/10 · cinza {grayStability}/10. Ausência de imagem é resultado válido.</Text>
      <RuntimeChoice selected={comparisonCompleted} label="COMPAREI AS DUAS CONDIÇÕES" onPress={() => setComparisonCompleted((value) => !value)} />
      <RuntimeChoice selected={interpretationSeparated} label="SEPAREI IMAGEM CULTIVADA, EVENTO ESPONTÂNEO E INTERPRETAÇÃO" onPress={() => setInterpretationSeparated((value) => !value)} />
      <RuntimeChoice selected={clairvoyanceNotClaimed} label="NÃO TRATEI BRILHO OU NITIDEZ COMO PROVA DE CLARIVIDÊNCIA" onPress={() => setClairvoyanceNotClaimed((value) => !value)} />
      <RuntimeChoice selected={safetyClear} label="SEM SINTOMA DE STOP GATE AO FINAL" onPress={() => setSafetyClear((value) => !value)} />
      <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !clairvoyanceNotClaimed || !safetyClear} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'grounding') return <Grounding controller={controller} title="Abrir os olhos gradualmente e reconhecer o ambiente" />;

  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Haziel 2/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 043'} disabled={controller.busy} onPress={() => void controller.seal({
        durationSeconds: blueSeconds + graySeconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          blue_completed: true,
          gray_completed: true,
          comparison_completed: comparisonCompleted,
          interpretation_separated: interpretationSeparated,
          clairvoyance_not_claimed: clairvoyanceNotClaimed,
          safety_clear: safetyClear,
          blue_content_present: bluePresent,
          gray_content_present: grayPresent,
          blue_seconds: blueSeconds,
          gray_seconds: graySeconds,
        },
        metrics: { blue_stability: blueStability, gray_stability: grayStability },
      }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day043_seal_failed'))} />
    </RuntimeCard>
  );

  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAZIEL 2/5" />;
  return null;
}

function Day044({ canon, controller, setLocalError }: CommonProps) {
  const [truisms, setTruisms] = useState(Array.from({ length: 6 }, () => ''));
  const [suggestions, setSuggestions] = useState(Array.from({ length: 3 }, () => ''));
  const [activeFocus, setActiveFocus] = useState(5);
  const [neutralFocus, setNeutralFocus] = useState(5);
  const [activeCompleted, setActiveCompleted] = useState(false);
  const [neutralCompleted, setNeutralCompleted] = useState(false);
  const [ethicalReview, setEthicalReview] = useState(false);
  const [autonomyPreserved, setAutonomyPreserved] = useState(false);
  const [neutralText, setNeutralText] = useState('');
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="HAZIEL 3/5" title="Truísmos não autorizam contrabandear conclusões" notice="Fatos verificáveis podem organizar foco; não criam verdade por repetição, não substituem consentimento e não tornam uma sugestão inevitável." />;

  if (phase === 'compose') return (
    <RuntimeCard label="ROTEIRO · VAULT" title="Seis truísmos + três sugestões permissivas">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <Text style={runtimeTextStyles.private}>O texto integral será cifrado no Vault. O servidor recebe apenas contagens, flags e ratings.</Text>
      {truisms.map((value, index) => <TextInput key={`t-${index}`} value={value} onChangeText={(text) => setTruisms((current) => current.map((item, i) => i === index ? text : item))} placeholder={`${index + 1} · truísmo verificável`} placeholderTextColor="#666971" style={runtimeTextStyles.input} />)}
      {suggestions.map((value, index) => <TextInput key={`s-${index}`} value={value} onChangeText={(text) => setSuggestions((current) => current.map((item, i) => i === index ? text : item))} placeholder={`${index + 1} · sugestão permissiva`} placeholderTextColor="#666971" style={runtimeTextStyles.input} />)}
      <RuntimePrimary label="LER O ROTEIRO" disabled={truisms.some((value) => value.trim().length < 3) || suggestions.some((value) => value.trim().length < 3)} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'active') return (
    <RuntimeCard label="CONDIÇÃO A" title="Leitura ativa, lentamente, com direito de recusar">
      <RuntimeScale label="FOCO APÓS O ROTEIRO" value={activeFocus} onChange={setActiveFocus} />
      <RuntimeChoice selected={activeCompleted} label="LI O ROTEIRO SEM TRATAR SUGESTÕES COMO ORDENS" onPress={() => setActiveCompleted((value) => !value)} />
      <RuntimePrimary label="IR AO TEXTO NEUTRO" disabled={!activeCompleted} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'neutral') return (
    <RuntimeCard label="CONDIÇÃO B" title="Parágrafo neutro, sem fórmula teúrgica ou sugestão">
      <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
      <TextInput value={neutralText} onChangeText={setNeutralText} multiline placeholder="Cole/escreva um parágrafo neutro para esta comparação · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <RuntimeScale label="FOCO APÓS O TEXTO NEUTRO" value={neutralFocus} onChange={setNeutralFocus} />
      <RuntimeChoice selected={neutralCompleted} label="CONCLUÍ A COMPARAÇÃO NEUTRA" onPress={() => setNeutralCompleted((value) => !value)} />
      <RuntimePrimary label="AUDITAR LINGUAGEM" disabled={!neutralCompleted || neutralText.trim().length < 12} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'review') return (
    <RuntimeCard label="REGRA ÉTICA" title="Verdadeiro não significa coercitivo">
      <Text style={runtimeTextStyles.body}>Ativo: foco {activeFocus}/10 · neutro: foco {neutralFocus}/10. Diferença não demonstra poder hipnótico universal.</Text>
      <RuntimeChoice selected={ethicalReview} label="REVI SALTOS LÓGICOS, PROMESSAS ABSOLUTAS E PRESSÃO" onPress={() => setEthicalReview((value) => !value)} />
      <RuntimeChoice selected={autonomyPreserved} label="TODAS AS SUGESTÕES CONTINUAM RECUSÁVEIS" onPress={() => setAutonomyPreserved((value) => !value)} />
      <RuntimePrimary label="GROUNDING" disabled={!ethicalReview || !autonomyPreserved} onPress={controller.nextPhase} />
    </RuntimeCard>
  );

  if (phase === 'grounding') return <Grounding controller={controller} title="Encerrar a leitura e retornar ao ambiente" />;

  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Haziel 3/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 044'} disabled={controller.busy || !controller.auth.client || !controller.auth.userId} onPress={() => void (async () => {
        setLocalError(null);
        try {
          if (!controller.auth.client || !controller.auth.userId) return;
          const encrypted = await encryptVaultText({
            userId: controller.auth.userId,
            day: 44,
            kind: 'truism-script',
            plaintext: JSON.stringify({ schema: 'hnk-day044-truisms-v1', truisms: truisms.map((value) => value.trim()), suggestions: suggestions.map((value) => value.trim()), neutral_text: neutralText.trim() }),
          });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 44, payload: encrypted });
          await controller.seal({
            localRecordHash: encrypted.checksumSha256,
            evidence: {
              protocol_completed: true,
              return_confirmed: true,
              active_script_completed: activeCompleted,
              neutral_comparison_completed: neutralCompleted,
              ethical_review_completed: ethicalReview,
              autonomy_preserved: autonomyPreserved,
              truisms_logged: 6,
              suggestions_logged: 3,
            },
            metrics: { active_focus: activeFocus, neutral_focus: neutralFocus },
          });
          controller.nextPhase();
        } catch (cause) {
          setLocalError(cause instanceof Error ? cause.message : 'day044_seal_failed');
        }
      })()} />
    </RuntimeCard>
  );

  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="HAZIEL 3/5" />;
  return null;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  content: { padding: 22, gap: 18, paddingBottom: 90 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' },
  header: { gap: 6, marginBottom: 4 },
  eyebrow: { color: '#5f94aa', fontSize: 8, letterSpacing: 1.5 },
  title: { color: '#e6f7ff', fontSize: 26, lineHeight: 32, fontWeight: '300' },
  meta: { color: '#55717d', fontSize: 8, letterSpacing: 0.8 },
});
