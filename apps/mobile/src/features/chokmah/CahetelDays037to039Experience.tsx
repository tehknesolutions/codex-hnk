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
import {
  CAHETEL_DAY_037,
  CAHETEL_DAY_038,
  CAHETEL_DAY_039,
} from './runtime-definitions/cahetel';

type CahetelDay = 37 | 38 | 39;
type Controller = ReturnType<typeof useHnkDayRuntime>;

const DEFINITIONS: Record<CahetelDay, DayDefinition> = {
  37: CAHETEL_DAY_037,
  38: CAHETEL_DAY_038,
  39: CAHETEL_DAY_039,
};

export function CahetelDays037to039Experience({ day }: { day: CahetelDay }) {
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

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O app não promove draft editorial a cânone. Sincronize o repositório canônico para executar esta prática.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia bloqueado pelo servidor"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia anterior e a progressão oficial de Atziluth.</Text></RuntimeCard> : null}

      {controller.runtime?.status !== 'locked' && day === 37 ? <Day037 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && day === 38 ? <Day038 {...common} /> : null}
      {controller.runtime?.status !== 'locked' && day === 39 ? <Day039 {...common} /> : null}
    </ScrollView>
  );
}

type CommonProps = {
  canon: CanonicalDaySnapshot | null;
  controller: Controller;
  setLocalError: (value: string | null) => void;
};

function Threshold({ canon, controller, label, title }: { canon: CanonicalDaySnapshot | null; controller: Controller; label: string; title: string }) {
  if (controller.phase?.id !== 'threshold') return null;
  return (
    <RuntimeCard label={label} title={title}>
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="HNK-EP-1.1">Chokmah registra percepção antes de interpretação. Experiência subjetiva permanece válida sem virar certeza automática sobre causas externas.</RuntimeNotice>
      <RuntimePrimary label="INICIAR PRÁTICA" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
    </RuntimeCard>
  );
}

function Day037({ canon, controller, setLocalError }: CommonProps) {
  const [seconds, setSeconds] = useState(0);
  const [items, setItems] = useState(Array.from({ length: 20 }, () => ''));
  const [labels, setLabels] = useState(0);
  const [layersSeparated, setLayersSeparated] = useState(false);
  const [rule, setRule] = useState('');
  const [objects, setObjects] = useState(0);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="CAHETEL 1/5" title="Receber primeiro, interpretar depois" />;
  if (phase === 'vakog') return (
    <RuntimeCard label="VAKOG" title="Sete minutos de recepção sensorial">
      <RuntimeTimer value={seconds} target={420} onChange={setSeconds} />
      <RuntimeCounter label="RÓTULO AUTOMÁTICO PERCEBIDO" value={labels} onPress={() => setLabels((value) => value + 1)} />
      <Text style={runtimeTextStyles.private}>Os vinte registros abaixo serão cifrados no Vault. Descreva dado sensorial; evite concluir causa.</Text>
      {items.map((value, index) => (
        <TextInput key={index} value={value} onChangeText={(text) => setItems((current) => current.map((item, i) => i === index ? text : item))} placeholder={`${String(index + 1).padStart(2, '0')} · percepção direta`} placeholderTextColor="#666971" style={runtimeTextStyles.input} />
      ))}
      <RuntimePrimary label="SEPARAR CAMADAS" disabled={seconds < 420 || items.some((value) => value.trim().length === 0)} onPress={() => controller.nextPhase()} />
    </RuntimeCard>
  );
  if (phase === 'layers') return (
    <RuntimeCard label="DADO · INTERPRETAÇÃO · HIPÓTESE" title="Atrasar a conclusão">
      <Text style={runtimeTextStyles.body}>Revise seus registros e escolha conscientemente não transformar percepção em prova. Interpretação e hipótese são camadas posteriores.</Text>
      <RuntimeChoice selected={layersSeparated} label="SEPAREI DADO, INTERPRETAÇÃO E HIPÓTESE" onPress={() => setLayersSeparated((value) => !value)} />
      <RuntimePrimary label="INTEGRAR" disabled={!layersSeparated} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'integration') return (
    <RuntimeCard label="REGRA PESSOAL" title="Um critério de discernimento para Chokmah">
      <TextInput value={rule} onChangeText={setRule} multiline placeholder="Ex.: não trato sensação como certeza sem evidência independente · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <RuntimePrimary label="RETORNAR AO AMBIENTE" disabled={rule.trim().length < 8} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return (
    <RuntimeCard label="GROUNDING" title="O ambiente continua aqui">
      <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objects} onPress={() => setObjects((value) => Math.min(3, value + 1))} />
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Cahetel 1/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 037'} disabled={controller.busy || !controller.auth.client || !controller.auth.userId} onPress={() => void (async () => {
        setLocalError(null);
        try {
          if (!controller.auth.client || !controller.auth.userId) return;
          const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 37, kind: 'vakog', plaintext: JSON.stringify({ schema: 'hnk-day037-vakog-v1', perceptions: items.map((value) => value.trim()), discernment_rule: rule.trim() }) });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 37, payload: encrypted });
          await controller.seal({
            localRecordHash: encrypted.checksumSha256,
            durationSeconds: seconds,
            evidence: { protocol_completed: true, return_confirmed: true, vakog_completed: true, layers_separated: layersSeparated, discernment_rule_defined: true, perceptions_logged: 20, vakog_seconds: seconds },
            metrics: { labels_noticed: labels, perceptions_logged: 20, vakog_seconds: seconds },
          });
          controller.nextPhase();
        } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day037_seal_failed'); }
      })()} />
    </RuntimeCard>
  );
  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="CAHETEL 1/5" />;
  return null;
}

function Day038({ canon, controller, setLocalError }: CommonProps) {
  const [seconds, setSeconds] = useState(0);
  const [thoughts, setThoughts] = useState(Array.from({ length: 10 }, () => ''));
  const [leadingUsed, setLeadingUsed] = useState(false);
  const [choicePreserved, setChoicePreserved] = useState(false);
  const [tensionBefore, setTensionBefore] = useState(5);
  const [tensionAfter, setTensionAfter] = useState(5);
  const [limit, setLimit] = useState('');
  const [objects, setObjects] = useState(0);
  const phase = controller.phase?.id;

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="CAHETEL 2/5" title="Acompanhar sem concordar" />;
  if (phase === 'pacing') return (
    <RuntimeCard label="PACING" title="Seis minutos acompanhando o que já está presente">
      <RuntimeScale label="TENSÃO INICIAL" value={tensionBefore} onChange={setTensionBefore} />
      <RuntimeTimer value={seconds} target={360} onChange={setSeconds} />
      <Text style={runtimeTextStyles.private}>Pensamentos ficam no Vault. Registrar não significa validá-los como fatos.</Text>
      {thoughts.map((value, index) => <TextInput key={index} value={value} onChangeText={(text) => setThoughts((current) => current.map((item, i) => i === index ? text : item))} placeholder={`${index + 1} · pensamento acompanhado`} placeholderTextColor="#666971" style={runtimeTextStyles.input} />)}
      <RuntimePrimary label="PASSAR AO LEADING" disabled={seconds < 360 || thoughts.some((value) => value.trim().length === 0)} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'leading') return (
    <RuntimeCard label="LEADING PERMISSIVO" title="Direção pode ser aceita ou recusada">
      <Text style={runtimeTextStyles.body}>Use uma formulação permissiva voltada à calma, foco ou oração. A sugestão não é ordem e não transforma o conteúdo mental em verdade.</Text>
      <RuntimeChoice selected={leadingUsed} label="USEI UM LEADING PERMISSIVO" onPress={() => setLeadingUsed((value) => !value)} />
      <RuntimeChoice selected={choicePreserved} label="MANTIVE LIBERDADE PARA ACEITAR OU RECUSAR" onPress={() => setChoicePreserved((value) => !value)} />
      <RuntimeScale label="TENSÃO FINAL" value={tensionAfter} onChange={setTensionAfter} />
      <RuntimePrimary label="REVISAR" disabled={!leadingUsed || !choicePreserved} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'review') return (
    <RuntimeCard label="LIMITE PESSOAL" title="Conduzir sem violentar">
      <TextInput value={limit} onChangeText={setLimit} multiline placeholder="Que limite impede uma sugestão de ultrapassar sua consciência? · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
      <RuntimePrimary label="GROUNDING" disabled={limit.trim().length < 8} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return (
    <RuntimeCard label="RETORNO VOLUNTÁRIO" title="Encerrar sem dependência">
      <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objects} onPress={() => setObjects((value) => Math.min(3, value + 1))} />
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Cahetel 2/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 038'} disabled={controller.busy || !controller.auth.client || !controller.auth.userId} onPress={() => void (async () => {
        setLocalError(null);
        try {
          if (!controller.auth.client || !controller.auth.userId) return;
          const encrypted = await encryptVaultText({ userId: controller.auth.userId, day: 38, kind: 'pacing-leading', plaintext: JSON.stringify({ schema: 'hnk-day038-pacing-v1', thoughts: thoughts.map((value) => value.trim()), personal_limit: limit.trim() }) });
          await saveEncryptedVaultEntry(controller.auth.client, { day: 38, payload: encrypted });
          await controller.seal({
            localRecordHash: encrypted.checksumSha256,
            durationSeconds: seconds,
            evidence: { protocol_completed: true, return_confirmed: true, pacing_completed: true, leading_completed: leadingUsed, voluntary_choice_preserved: choicePreserved, personal_suggestion_limit_defined: true, thoughts_paced: 10, pacing_seconds: seconds },
            metrics: { thoughts_paced: 10, pacing_seconds: seconds, tension_before: tensionBefore, tension_after: tensionAfter },
          });
          controller.nextPhase();
        } catch (cause) { setLocalError(cause instanceof Error ? cause.message : 'day038_seal_failed'); }
      })()} />
    </RuntimeCard>
  );
  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="CAHETEL 2/5" />;
  return null;
}

function Day039({ canon, controller, setLocalError }: CommonProps) {
  const [safety, setSafety] = useState([false, false, false]);
  const [neutralSeconds, setNeutralSeconds] = useState(0);
  const [symbolicSeconds, setSymbolicSeconds] = useState(0);
  const [neutralIntensity, setNeutralIntensity] = useState(5);
  const [symbolicIntensity, setSymbolicIntensity] = useState(5);
  const [layersSeparated, setLayersSeparated] = useState(false);
  const [telepathyNotClaimed, setTelepathyNotClaimed] = useState(false);
  const [objects, setObjects] = useState(0);
  const phase = controller.phase?.id;
  const safetyClear = safety.every(Boolean);

  if (phase === 'threshold') return <Threshold canon={canon} controller={controller} label="CAHETEL 3/5" title="Sentir sem converter sensação em mensagem" />;
  if (phase === 'safety') return (
    <RuntimeCard label="NECK SAFETY GATE" title="Contato leve ou pequena distância">
      <RuntimeChoice selected={safety[0]} label="NÃO PRESSIONAREI VIAS AÉREAS OU VASOS" onPress={() => setSafety((current) => current.map((value, index) => index === 0 ? !value : value))} />
      <RuntimeChoice selected={safety[1]} label="RESPIRAÇÃO PERMANECERÁ NATURAL" onPress={() => setSafety((current) => current.map((value, index) => index === 1 ? !value : value))} />
      <RuntimeChoice selected={safety[2]} label="DOR, TONTURA, FALTA DE AR OU ANSIEDADE ENCERRAM A PRÁTICA" onPress={() => setSafety((current) => current.map((value, index) => index === 2 ? !value : value))} />
      <RuntimePrimary label="ABRIR FASE NEUTRA" disabled={!safetyClear} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'neutral') return (
    <RuntimeCard label="FASE NEUTRA" title="Três minutos sem visualização">
      <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
      <RuntimeTimer value={neutralSeconds} target={180} onChange={setNeutralSeconds} />
      <RuntimeScale label="INTENSIDADE CORPORAL" value={neutralIntensity} onChange={setNeutralIntensity} />
      <RuntimePrimary label="INTRODUZIR FASE SIMBÓLICA" disabled={neutralSeconds < 180} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'symbolic') return (
    <RuntimeCard label="FASE SIMBÓLICA" title="Quatro minutos com a imagem ritual do cânone">
      <RuntimeTimer value={symbolicSeconds} target={240} onChange={setSymbolicSeconds} />
      <RuntimeScale label="INTENSIDADE CORPORAL" value={symbolicIntensity} onChange={setSymbolicIntensity} />
      <RuntimeNotice title="HIPÓTESE, NÃO DETECÇÃO">Calor, imagens ou impressões são registros subjetivos. O app não confirma telepatia, bloqueio energético ou mensagem de outra mente.</RuntimeNotice>
      <RuntimePrimary label="SEPARAR CAMADAS" disabled={symbolicSeconds < 240} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'layers') return (
    <RuntimeCard label="QUATRO CAMADAS" title="Sensação · imagem · interpretação · hipótese">
      <RuntimeChoice selected={layersSeparated} label="SEPAREI AS QUATRO CAMADAS" onPress={() => setLayersSeparated((value) => !value)} />
      <RuntimeChoice selected={telepathyNotClaimed} label="NÃO CLASSIFIQUEI IMPRESSÃO SUBJETIVA COMO TELEPATIA CONFIRMADA" onPress={() => setTelepathyNotClaimed((value) => !value)} />
      <RuntimePrimary label="GROUNDING" disabled={!layersSeparated || !telepathyNotClaimed} onPress={controller.nextPhase} />
    </RuntimeCard>
  );
  if (phase === 'grounding') return (
    <RuntimeCard label="RETORNO CORPORAL" title="Mãos afastadas · respiração natural">
      <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objects} onPress={() => setObjects((value) => Math.min(3, value + 1))} />
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard>
  );
  if (phase === 'seal') return (
    <RuntimeCard label="SELO" title="Cahetel 3/5">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 039'} disabled={controller.busy} onPress={() => void controller.seal({
        durationSeconds: neutralSeconds + symbolicSeconds,
        evidence: { protocol_completed: true, return_confirmed: true, safety_clear: safetyClear, neutral_phase_completed: neutralSeconds >= 180, symbolic_phase_completed: symbolicSeconds >= 240, layers_separated: layersSeparated, telepathy_not_claimed: telepathyNotClaimed, neutral_seconds: neutralSeconds, symbolic_seconds: symbolicSeconds },
        metrics: { neutral_seconds: neutralSeconds, symbolic_seconds: symbolicSeconds, neutral_intensity: neutralIntensity, symbolic_intensity: symbolicIntensity },
      }).then(controller.nextPhase).catch((cause) => setLocalError(cause instanceof Error ? cause.message : 'day039_seal_failed'))} />
    </RuntimeCard>
  );
  if (phase === 'complete') return <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="CAHETEL 3/5" />;
  return null;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  content: { padding: 22, gap: 18, paddingBottom: 72 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' },
  header: { gap: 7, paddingVertical: 10 },
  eyebrow: { color: '#699ab2', fontSize: 9, letterSpacing: 1.7, fontWeight: '700' },
  title: { color: '#eef7ff', fontSize: 27, lineHeight: 33, fontWeight: '300' },
  meta: { color: '#61717c', fontSize: 9, letterSpacing: 0.7 },
});
