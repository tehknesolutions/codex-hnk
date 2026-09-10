import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { saveEncryptedVaultEntry } from '@hnk/supabase-client';
import { encryptVaultText } from '../vault/vault-crypto';
import { loadCanonicalDay, type CanonicalDaySnapshot } from '../kether/canonical-day';
import { CanonicalText, RuntimeCard, RuntimeChoice, RuntimeCompletion, RuntimeCounter, RuntimeNotice, RuntimePrimary, RuntimeTimer, runtimeTextStyles } from '../kether/KetherRuntimePrimitives';
import { useHnkDayRuntime } from '../kether/useHnkDayRuntime';
import { CHOKMAH_DAY_072 } from './runtime-definitions/portal';

type Support = 'mirror' | 'bowl' | null;
type Lighting = 'electric' | 'candle' | null;

export function ChokmahDay072BlackMirrorExperience() {
  const controller = useHnkDayRuntime(CHOKMAH_DAY_072);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [support, setSupport] = useState<Support>(null);
  const [lighting, setLighting] = useState<Lighting>(null);
  const [candleSafe, setCandleSafe] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [formPresent, setFormPresent] = useState(false);
  const [formRecorded, setFormRecorded] = useState(false);
  const [rawObservation, setRawObservation] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [preregisterSaved, setPreregisterSaved] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [checksum, setChecksum] = useState<string | null>(null);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [externalNo, setExternalNo] = useState(false);
  const [highImpactNo, setHighImpactNo] = useState(false);
  const [lightingRestored, setLightingRestored] = useState(false);
  const [orientation, setOrientation] = useState(false);
  const [safe, setSafe] = useState(false);
  const [objects, setObjects] = useState(0);

  useEffect(() => {
    let live = true;
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') return () => { live = false; };
    void loadCanonicalDay(controller.auth.client, 72)
      .then((value) => { if (live) setCanon(value); })
      .catch((cause) => { if (live) setError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { live = false; };
  }, [controller.auth.client, controller.auth.phase]);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO PORTAL · DIA 072</Text></View>;
  const phase = controller.phase?.id;
  const electric = lighting === 'electric';
  const thresholdSafe = support !== null && lighting !== null && (electric || candleSafe);

  const savePreregister = async () => {
    if (!controller.auth.client || !controller.auth.userId || rawObservation.trim().length < 2 || !support || !lighting) return;
    try {
      const encrypted = await encryptVaultText({
        userId: controller.auth.userId,
        day: 72,
        kind: 'portal072-visual-preregister',
        plaintext: JSON.stringify({
          schema: 'hnk-portal072-preregister-v1',
          support,
          lighting,
          active_seconds: seconds,
          visual_form_present: formPresent,
          raw_observation: rawObservation.trim(),
        }),
      });
      await saveEncryptedVaultEntry(controller.auth.client, { day: 72, payload: encrypted });
      setChecksum(encrypted.checksumSha256);
      setPreregisterSaved(true);
      controller.nextPhase();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'day072_preregister_failed');
    }
  };

  const saveReview = async () => {
    if (!controller.auth.client || !controller.auth.userId) return;
    try {
      if (interpretation.trim()) {
        const encrypted = await encryptVaultText({
          userId: controller.auth.userId,
          day: 72,
          kind: 'portal072-interpretation-layer',
          plaintext: JSON.stringify({ schema: 'hnk-portal072-interpretation-v1', interpretation: interpretation.trim() }),
        });
        await saveEncryptedVaultEntry(controller.auth.client, { day: 72, payload: encrypted });
      }
      setReviewSaved(true);
      controller.nextPhase();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'day072_review_vault_failed');
    }
  };

  const stop = () => controller.interrupt({ durationSeconds: seconds, evidence: { safety_stop: true } });

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.eyebrow}>CHOKMAH · PORTAL 1/2 · DIA 072</Text>
      <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
      <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
    </View>
    {controller.error || error ? <RuntimeNotice title="RUNTIME">{error ?? controller.error}</RuntimeNotice> : null}
    {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 072 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 071 confirmado no servidor.</Text></RuntimeCard> : null}

    {phase === 'threshold' ? <RuntimeCard label="GRANDE ESPELHO NEGRO" title="Preparar observação com segurança">
      <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
      <RuntimeNotice title="ILUMINAÇÃO">O fallback elétrico estável é a opção recomendada do produto. Se a vela real do plano for usada, ela exige confirmação explícita de segurança contra fogo.</RuntimeNotice>
      <View style={runtimeTextStyles.row}>
        <RuntimeChoice selected={support === 'mirror'} label="ESPELHO / SUPERFÍCIE NEGRA" onPress={() => setSupport('mirror')} />
        <RuntimeChoice selected={support === 'bowl'} label="TIGELA PRETA COM ÁGUA LIMPA" onPress={() => setSupport('bowl')} />
      </View>
      <View style={runtimeTextStyles.row}>
        <RuntimeChoice selected={lighting === 'electric'} label="LUZ ELÉTRICA ESTÁVEL · RECOMENDADA" onPress={() => { setLighting('electric'); setCandleSafe(false); }} />
        <RuntimeChoice selected={lighting === 'candle'} label="VELA REAL DO PLANO" onPress={() => setLighting('candle')} />
      </View>
      {lighting === 'candle' ? <RuntimeChoice selected={candleSafe} label="VELA ESTÁVEL, ATRÁS DOS OMBROS, LONGE DE INFLAMÁVEIS E COM SAÍDA LIVRE" onPress={() => setCandleSafe((value) => !value)} /> : null}
      <RuntimePrimary label="INICIAR 15 MINUTOS" disabled={!canon || !thresholdSafe || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
    </RuntimeCard> : null}

    {phase === 'active' ? <RuntimeCard label="OBSERVAÇÃO" title="15 minutos · olhar difuso sem perseguir imagens">
      <RuntimeTimer value={seconds} target={900} onChange={setSeconds} />
      <View style={runtimeTextStyles.row}>
        <RuntimeChoice selected={formRecorded && formPresent} label="ALGUMA FORMA / SOMBRA FOI PERCEBIDA" onPress={() => { setFormPresent(true); setFormRecorded(true); }} />
        <RuntimeChoice selected={formRecorded && !formPresent} label="NENHUMA FORMA MARCANTE" onPress={() => { setFormPresent(false); setFormRecorded(true); }} />
      </View>
      <RuntimePrimary label="SAFETY STOP" onPress={stop} />
      <RuntimePrimary label="PRÉ-REGISTRAR" disabled={seconds < 900 || !formRecorded} onPress={controller.nextPhase} />
    </RuntimeCard> : null}

    {phase === 'preregister' ? <RuntimeCard label="PRÉ-REGISTRO CIFRADO" title="Descrever antes de interpretar">
      <RuntimeNotice title="VAULT">Registre contorno, posição, movimento, cor, duração ou simplesmente “nenhuma forma”. Este texto não entra em analytics nem no evidence scalar.</RuntimeNotice>
      <TextInput value={rawObservation} onChangeText={setRawObservation} placeholder="Descrição visual bruta · Vault cifrado" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} multiline />
      <RuntimePrimary label={preregisterSaved ? 'PRÉ-REGISTRO SELADO' : 'CIFRAR E SELAR PRÉ-REGISTRO'} disabled={preregisterSaved || rawObservation.trim().length < 2} onPress={() => void savePreregister()} />
    </RuntimeCard> : null}

    {phase === 'review' ? <RuntimeCard label="REVISÃO" title="Separar percepção, símbolo e hipótese">
      <CanonicalText>{canon?.blocks['middle-kavanah'] ?? ''}</CanonicalText>
      <TextInput value={interpretation} onChangeText={setInterpretation} placeholder="Interpretação opcional · camada separada no Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} multiline />
      <RuntimeChoice selected={interpretationSeparated} label="SEPAREI DESCRIÇÃO VISUAL DE INTERPRETAÇÃO" onPress={() => setInterpretationSeparated((value) => !value)} />
      <RuntimeChoice selected={externalNo} label="NÃO TRATEI FORMAS/SOMBRAS COMO PRESENÇA EXTERNA CONFIRMADA" onPress={() => setExternalNo((value) => !value)} />
      <RuntimeChoice selected={highImpactNo} label="NÃO USEI O RESULTADO PARA DECISÃO DE SAÚDE, DINHEIRO, SEGURANÇA OU TERCEIROS" onPress={() => setHighImpactNo((value) => !value)} />
      <RuntimePrimary label={reviewSaved ? 'REVISÃO SALVA' : 'SALVAR REVISÃO E RETORNAR'} disabled={reviewSaved || !interpretationSeparated || !externalNo || !highImpactNo} onPress={() => void saveReview()} />
    </RuntimeCard> : null}

    {phase === 'grounding' ? <RuntimeCard label="RETURN GATE" title="Restaurar iluminação e orientação">
      <RuntimeCounter label="ELEMENTOS REAIS NOMEADOS" value={objects} onPress={() => setObjects((value) => Math.min(5, value + 1))} />
      <RuntimeChoice selected={lightingRestored} label="ILUMINAÇÃO NORMAL RESTAURADA" onPress={() => setLightingRestored((value) => !value)} />
      <RuntimeChoice selected={orientation} label="LOCALIZAÇÃO E ORIENTAÇÃO TOTALMENTE RESTAURADAS" onPress={() => setOrientation((value) => !value)} />
      <RuntimeChoice selected={safe} label="SEM DOR OCULAR, TONTURA, MEDO CRESCENTE OU DESORIENTAÇÃO AO FINAL" onPress={() => setSafe((value) => !value)} />
      <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objects < 5 || !lightingRestored || !orientation || !safe} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
    </RuntimeCard> : null}

    {phase === 'seal' ? <RuntimeCard label="SELO SERVER-SIDE" title="Portal Chokmah→Binah · 1/2">
      <RuntimePrimary label={controller.busy ? 'SELANDO…' : 'SELAR DIA 072 · +300 XP'} disabled={controller.busy || !preregisterSaved || !checksum || !reviewSaved} onPress={() => void controller.seal({
        localRecordHash: checksum ?? undefined,
        durationSeconds: seconds,
        evidence: {
          protocol_completed: true,
          return_confirmed: true,
          active_completed: seconds >= 900,
          support_selected: support !== null,
          visual_preregister_saved: preregisterSaved,
          interpretation_separated: interpretationSeparated,
          external_presence_not_claimed: externalNo,
          high_impact_decision_not_used: highImpactNo,
          fire_safety_preserved: electric || candleSafe,
          lighting_restored: lightingRestored,
          orientation_restored: orientation,
          vault_saved: preregisterSaved,
          safety_clear: safe,
          electric_fallback_used: electric,
          visual_form_present: formPresent,
          active_seconds: seconds,
        },
      }).then(controller.nextPhase).catch((cause) => setError(cause instanceof Error ? cause.message : 'day072_seal_failed'))} />
    </RuntimeCard> : null}

    {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="PORTAL 1/2 · DIA 072" /> : null}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#020308' },
  content: { padding: 24, gap: 18, paddingBottom: 52 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020308' },
  header: { gap: 6 },
  eyebrow: { color: '#7e86b8', fontSize: 8, letterSpacing: 1.5 },
  title: { color: '#f1efff', fontSize: 25, lineHeight: 31, fontWeight: '300' },
  meta: { color: '#767a9d', fontSize: 8, letterSpacing: 0.8 },
});
