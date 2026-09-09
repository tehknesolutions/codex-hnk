import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
import { ALADIAH_DAY_051 } from './runtime-definitions/aladiah';

export function AladiahDay051SigilExperience() {
  const controller = useHnkDayRuntime(ALADIAH_DAY_051);
  const [canon, setCanon] = useState<CanonicalDaySnapshot | null>(null);
  const [canonError, setCanonError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [phrase, setPhrase] = useState('Minha percepção capta apenas a verdade');
  const [reductionRule, setReductionRule] = useState('');
  const [reducedForm, setReducedForm] = useState('');
  const [strokes, setStrokes] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const currentPathRef = useRef('');
  const [observeSeconds, setObserveSeconds] = useState(0);
  const [sigilEffectPresent, setSigilEffectPresent] = useState(false);
  const [textEffectPresent, setTextEffectPresent] = useState(false);
  const [sigilEffectRecorded, setSigilEffectRecorded] = useState(false);
  const [textEffectRecorded, setTextEffectRecorded] = useState(false);
  const [sigilFocus, setSigilFocus] = useState(5);
  const [textFocus, setTextFocus] = useState(5);
  const [textControlCompleted, setTextControlCompleted] = useState(false);
  const [comparisonCompleted, setComparisonCompleted] = useState(false);
  const [interpretationSeparated, setInterpretationSeparated] = useState(false);
  const [symbolicAnchorOnly, setSymbolicAnchorOnly] = useState(false);
  const [noGuaranteedProtection, setNoGuaranteedProtection] = useState(false);
  const [panicRuleAcknowledged, setPanicRuleAcknowledged] = useState(false);
  const [safetyClear, setSafetyClear] = useState(false);
  const [vaultAcknowledged, setVaultAcknowledged] = useState(false);
  const [objectsNamed, setObjectsNamed] = useState(0);

  useEffect(() => {
    let active = true;
    setCanon(null);
    setCanonError(null);
    if (!controller.auth.client || controller.auth.phase !== 'signed-in') {
      setCanonError('canonical_content_requires_authenticated_sync');
      return () => { active = false; };
    }
    void loadCanonicalDay(controller.auth.client, 51)
      .then((snapshot) => { if (active) setCanon(snapshot); })
      .catch((cause) => { if (active) setCanonError(cause instanceof Error ? cause.message : 'canonical_day_load_failed'); });
    return () => { active = false; };
  }, [controller.auth.client, controller.auth.phase]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const next = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
      currentPathRef.current = next;
      setCurrentPath(next);
    },
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      const next = `${currentPathRef.current} L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
      currentPathRef.current = next;
      setCurrentPath(next);
    },
    onPanResponderRelease: () => {
      const path = currentPathRef.current.trim();
      if (path) setStrokes((value) => [...value, path]);
      currentPathRef.current = '';
      setCurrentPath('');
    },
    onPanResponderTerminate: () => {
      const path = currentPathRef.current.trim();
      if (path) setStrokes((value) => [...value, path]);
      currentPathRef.current = '';
      setCurrentPath('');
    },
  }), []);

  if (controller.loading) return <View style={styles.loading}><Text style={styles.meta}>ABRINDO ALADIAH · DIA 051</Text></View>;
  const phase = controller.phase?.id;
  const compositionReady = phrase.trim().length >= 12 && reductionRule.trim().length >= 8 && reducedForm.trim().length >= 2 && strokes.length > 0;
  const safetyStop = () => controller.interrupt({ durationSeconds: observeSeconds, evidence: { safety_stop: true }, metrics: { sigil_focus: sigilFocus, text_focus: textFocus } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CHOKMAH · ALADIAH 5/5 · DIA 051</Text>
        <Text style={styles.title}>{canon?.title ?? 'CÂNONE SINCRONIZANDO'}</Text>
        <Text style={styles.meta}>{canon ? `${canon.sourcePath} · ${canon.sourceSha.slice(0, 10)}` : 'SEM FALLBACK EDITORIAL'}</Text>
      </View>

      {canonError ? <RuntimeNotice title="CÂNONE INDISPONÍVEL">O runtime não inventa regra de redução nem símbolo substituto.</RuntimeNotice> : null}
      {controller.error || localError ? <RuntimeNotice title="RUNTIME">{localError ?? controller.error}</RuntimeNotice> : null}
      {controller.runtime?.status === 'locked' ? <RuntimeCard label="GATE" title="Dia 051 bloqueado pela sequência"><Text style={runtimeTextStyles.body}>A primeira conclusão exige o Dia 050 confirmado no servidor.</Text></RuntimeCard> : null}
      {controller.runtime?.status === 'interrupted' ? <RuntimeNotice title="PRÁTICA INTERROMPIDA">Se o símbolo aumentar medo, compulsão, vigilância excessiva ou sensação de invulnerabilidade, arquive-o e não force retomada.</RuntimeNotice> : null}

      {controller.runtime?.status !== 'locked' && controller.runtime?.status !== 'interrupted' && phase === 'threshold' ? (
        <RuntimeCard label="ALADIAH 5/5" title="Sigilo pessoal como âncora de discernimento">
          <CanonicalText>{canon?.blocks['jachin-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="BOUNDARY">O Codex fornece a intenção, mas não fornece uma regra alfanumérica única. Você documenta a regra usada; o app não a inventa silenciosamente.</RuntimeNotice>
          <RuntimePrimary label="INICIAR COMPOSIÇÃO PRIVADA" disabled={!canon || controller.busy} onPress={() => void controller.begin().then(controller.nextPhase)} />
        </RuntimeCard>
      ) : null}

      {phase === 'compose' ? (
        <RuntimeCard label="VAULT LOCAL · COMPOSIÇÃO" title="Frase, redução e desenho permanecem privados">
          <Text style={styles.fieldLabel}>INTENÇÃO CANÔNICA</Text>
          <TextInput value={phrase} onChangeText={setPhrase} multiline style={runtimeTextStyles.textArea} />
          <Text style={styles.fieldLabel}>REGRA DE REDUÇÃO USADA · NÃO HÁ ALGORITMO IMPOSTO PELO CODEX</Text>
          <TextInput value={reductionRule} onChangeText={setReductionRule} multiline placeholder="Descreva a regra que você aplicou · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.textArea} />
          <Text style={styles.fieldLabel}>FORMA ALFANUMÉRICA REDUZIDA</Text>
          <TextInput value={reducedForm} onChangeText={setReducedForm} placeholder="Resultado da sua redução · Vault" placeholderTextColor="#666971" style={runtimeTextStyles.input} />
          <Text style={styles.fieldLabel}>DESENHO PRIVADO DO SIGILO</Text>
          <View style={styles.canvas} {...panResponder.panHandlers}>
            <Svg width="100%" height="220" viewBox="0 0 320 220">
              {strokes.map((path, index) => <Path key={index} d={path} stroke="#f4e6a2" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
              {currentPath ? <Path d={currentPath} stroke="#fff4be" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
            </Svg>
          </View>
          <View style={runtimeTextStyles.row}>
            <Pressable style={styles.secondary} onPress={() => { setStrokes([]); currentPathRef.current = ''; setCurrentPath(''); }}><Text style={styles.secondaryText}>LIMPAR DESENHO</Text></Pressable>
            <Text style={styles.strokeMeta}>{strokes.length} traço(s)</Text>
          </View>
          <RuntimeNotice title="PRIVACIDADE">Frase, regra, forma reduzida e vetores do desenho serão cifrados no Vault. Nenhum deles entra em evidence/metrics.</RuntimeNotice>
          <RuntimePrimary label="OBSERVAR SIGILO" disabled={!compositionReady} onPress={controller.nextPhase} />
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
        </RuntimeCard>
      ) : null}

      {phase === 'observe' ? (
        <RuntimeCard label="CONDIÇÃO A · SIGILO" title="Observação por 3 minutos">
          <RuntimeTimer value={observeSeconds} target={180} onChange={setObserveSeconds} />
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={sigilEffectRecorded && sigilEffectPresent} label="HOUVE FOCO/PROTEÇÃO PERCEBIDA/ANSIEDADE/IMAGEM" onPress={() => { setSigilEffectPresent(true); setSigilEffectRecorded(true); }} />
            <RuntimeChoice selected={sigilEffectRecorded && !sigilEffectPresent} label="NENHUM EFEITO MARCANTE" onPress={() => { setSigilEffectPresent(false); setSigilEffectRecorded(true); }} />
          </View>
          <RuntimeScale label="FOCO PERCEBIDO" value={sigilFocus} onChange={setSigilFocus} />
          <RuntimeNotice title="REGRA ANTIPÂNICO">Observar, verificar e não alimentar pânico. Sensação de proteção não significa invulnerabilidade.</RuntimeNotice>
          <RuntimePrimary label="SAFETY STOP" onPress={safetyStop} />
          <RuntimePrimary label="IR AO CONTROLE TEXTUAL" disabled={observeSeconds < 180 || !sigilEffectRecorded} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'control' ? (
        <RuntimeCard label="CONDIÇÃO B · TEXTO SIMPLES" title="Mesma regra sem o sigilo">
          <CanonicalText>{canon?.blocks['boaz-kavanah'] ?? ''}</CanonicalText>
          <RuntimeNotice title="SITUAÇÕES NÃO CRÍTICAS">Use a regra apenas como lembrete cotidiano de discernimento. Não teste o símbolo diante de risco real, doença, acidente ou ameaça.</RuntimeNotice>
          <Text style={styles.controlText}>{phrase}</Text>
          <View style={runtimeTextStyles.row}>
            <RuntimeChoice selected={textEffectRecorded && textEffectPresent} label="HOUVE EFEITO SUBJETIVO MARCANTE" onPress={() => { setTextEffectPresent(true); setTextEffectRecorded(true); }} />
            <RuntimeChoice selected={textEffectRecorded && !textEffectPresent} label="NENHUM EFEITO MARCANTE" onPress={() => { setTextEffectPresent(false); setTextEffectRecorded(true); }} />
          </View>
          <RuntimeScale label="FOCO COM TEXTO" value={textFocus} onChange={setTextFocus} />
          <RuntimeChoice selected={textControlCompleted} label="USEI A REGRA EM TEXTO SIMPLES, SEM PROMESSA DE PROTEÇÃO" onPress={() => setTextControlCompleted((value) => !value)} />
          <RuntimePrimary label="COMPARAR" disabled={!textEffectRecorded || !textControlCompleted} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'compare' ? (
        <RuntimeCard label="REVISÃO" title="Símbolo não é garantia">
          <Text style={runtimeTextStyles.body}>Sigilo: foco {sigilFocus}/10 · texto: foco {textFocus}/10. Diferença é experiência subjetiva, não prova de proteção externa.</Text>
          <RuntimeChoice selected={comparisonCompleted} label="COMPAREI SIGILO E TEXTO" onPress={() => setComparisonCompleted((value) => !value)} />
          <RuntimeChoice selected={interpretationSeparated} label="SEPAREI EXPERIÊNCIA SUBJETIVA DE CONCLUSÃO OBJETIVA" onPress={() => setInterpretationSeparated((value) => !value)} />
          <RuntimeChoice selected={symbolicAnchorOnly} label="TRATEI O SIGILO APENAS COMO ÂNCORA SIMBÓLICA DE DISCERNIMENTO" onPress={() => setSymbolicAnchorOnly((value) => !value)} />
          <RuntimeChoice selected={noGuaranteedProtection} label="NÃO TRATEI O SIGILO COMO PROTEÇÃO GARANTIDA CONTRA ENTIDADES, ACIDENTES OU DOENÇAS" onPress={() => setNoGuaranteedProtection((value) => !value)} />
          <RuntimeChoice selected={panicRuleAcknowledged} label="REGRA: OBSERVAR, VERIFICAR E NÃO ALIMENTAR PÂNICO" onPress={() => setPanicRuleAcknowledged((value) => !value)} />
          <RuntimeChoice selected={safetyClear} label="SEM MEDO, COMPULSÃO, HIPERVIGILÂNCIA OU SENSAÇÃO DE INVULNERABILIDADE RELEVANTE" onPress={() => setSafetyClear((value) => !value)} />
          <RuntimePrimary label="GROUNDING" disabled={!comparisonCompleted || !interpretationSeparated || !symbolicAnchorOnly || !noGuaranteedProtection || !panicRuleAcknowledged || !safetyClear} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'grounding' ? (
        <RuntimeCard label="GROUNDING" title="Arquivar o símbolo e retornar ao ambiente">
          <RuntimeCounter label="OBJETOS REAIS NOMEADOS" value={objectsNamed} onPress={() => setObjectsNamed((value) => Math.min(3, value + 1))} />
          <RuntimePrimary label="RETORNO CONFIRMADO" disabled={objectsNamed < 3} onPress={() => { controller.setReturnConfirmed(); controller.nextPhase(); }} />
        </RuntimeCard>
      ) : null}

      {phase === 'vault' ? (
        <RuntimeCard label="VAULT" title="Privacidade antes do selo">
          <RuntimeChoice selected={vaultAcknowledged} label="CONFIRMO QUE FRASE, REDUÇÃO E DESENHO SERÃO CIFRADOS" onPress={() => setVaultAcknowledged((value) => !value)} />
          <RuntimePrimary label="PREPARAR SELO" disabled={!vaultAcknowledged} onPress={controller.nextPhase} />
        </RuntimeCard>
      ) : null}

      {phase === 'seal' ? (
        <RuntimeCard label="SELO SERVER-SIDE" title="Aladiah 5/5">
          <RuntimePrimary label={controller.busy ? 'CIFRANDO E SELANDO…' : 'CIFRAR VAULT E SELAR DIA 051'} disabled={controller.busy || !controller.auth.client || !controller.auth.userId} onPress={() => void (async () => {
            setLocalError(null);
            try {
              if (!controller.auth.client || !controller.auth.userId) return;
              const encrypted = await encryptVaultText({
                userId: controller.auth.userId,
                day: 51,
                kind: 'discernment-sigil',
                plaintext: JSON.stringify({ schema: 'hnk-day051-discernment-sigil-v1', phrase: phrase.trim(), reduction_rule: reductionRule.trim(), reduced_form: reducedForm.trim(), strokes }),
              });
              await saveEncryptedVaultEntry(controller.auth.client, { day: 51, payload: encrypted });
              await controller.seal({
                localRecordHash: encrypted.checksumSha256,
                evidence: {
                  protocol_completed: true,
                  return_confirmed: true,
                  reduction_documented: true,
                  sigil_drawn: strokes.length > 0,
                  observation_completed: true,
                  text_control_completed: textControlCompleted,
                  comparison_completed: comparisonCompleted,
                  interpretation_separated: interpretationSeparated,
                  symbolic_anchor_only: symbolicAnchorOnly,
                  no_guaranteed_protection_claim: noGuaranteedProtection,
                  panic_rule_acknowledged: panicRuleAcknowledged,
                  vault_saved: true,
                  safety_clear: safetyClear,
                  sigil_effect_present: sigilEffectPresent,
                  text_effect_present: textEffectPresent,
                  sigil_observation_seconds: observeSeconds,
                },
                metrics: { sigil_focus: sigilFocus, text_focus: textFocus, stroke_count: strokes.length },
              });
              controller.nextPhase();
            } catch (cause) {
              setLocalError(cause instanceof Error ? cause.message : 'day051_seal_failed');
            }
          })()} />
        </RuntimeCard>
      ) : null}

      {phase === 'complete' ? <RuntimeCompletion completion={controller.runtime?.serverCompletion} label="ALADIAH 5/5" /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#02050a' },
  content: { padding: 24, gap: 18, paddingBottom: 52 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#02050a' },
  header: { gap: 6, marginBottom: 4 },
  eyebrow: { color: '#6f96ba', fontSize: 8, letterSpacing: 1.5 },
  title: { color: '#e8f4ff', fontSize: 25, lineHeight: 31, fontWeight: '300' },
  meta: { color: '#637e94', fontSize: 8, letterSpacing: 0.8 },
  fieldLabel: { color: '#72899c', fontSize: 8, letterSpacing: 1.1 },
  canvas: { height: 220, borderWidth: 1, borderColor: '#62592f', borderRadius: 16, overflow: 'hidden', backgroundColor: '#080909' },
  secondary: { borderWidth: 1, borderColor: '#4e4932', borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10 },
  secondaryText: { color: '#c8b96e', fontSize: 8, letterSpacing: 1 },
  strokeMeta: { color: '#756f50', fontSize: 9, alignSelf: 'center' },
  controlText: { color: '#f1e6b9', fontSize: 18, lineHeight: 27, borderWidth: 1, borderColor: '#35342b', borderRadius: 14, padding: 16, backgroundColor: '#0b0b08' },
});
