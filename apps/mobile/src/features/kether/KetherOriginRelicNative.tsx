import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ketherTokens } from '@hnk/ui';

const LAYERS = [
  {
    roman: 'I',
    label: 'PONTO',
    title: 'Concentre a origem.',
    body: 'A Lente começa com a primitiva mais simples do sistema: um ponto de atenção. Ele não é um sigilo canônico nem representa uma entidade.',
  },
  {
    roman: 'II',
    label: 'EMANAÇÃO',
    title: 'Observe a expansão.',
    body: 'Os anéis tornam visível uma metáfora de interface: algo pode emergir de um centro sem que a interface transforme essa imagem em afirmação histórica ou científica.',
  },
  {
    roman: 'III',
    label: 'EIXO',
    title: 'Organize a passagem.',
    body: 'O eixo introduz direção e prepara o retorno ao manuscrito. A experiência ensina pela transformação do campo, enquanto a doutrina continua pertencendo ao texto canônico.',
  },
] as const;

const C = ketherTokens.color;

type Props = {
  reduceMotion: boolean;
  initialOpen?: boolean;
  initialLayer?: 0 | 1 | 2;
};

type StageSize = {
  width: number;
  height: number;
};

export function KetherOriginRelicNative({ reduceMotion, initialOpen = false, initialLayer = 0 }: Props) {
  const [open, setOpen] = useState(initialOpen);
  const [layer, setLayer] = useState<number>(initialLayer);
  const [stageSize, setStageSize] = useState<StageSize>({ width: 1, height: 1 });
  const [fieldOffset, setFieldOffset] = useState({ x: 0, y: 0 });

  const current = LAYERS[layer];
  const fieldTransform = useMemo(
    () => ({
      transform: reduceMotion
        ? [{ translateX: 0 }, { translateY: 0 }]
        : [{ translateX: fieldOffset.x }, { translateY: fieldOffset.y }],
    }),
    [fieldOffset.x, fieldOffset.y, reduceMotion],
  );

  function openRelic() {
    setLayer(0);
    setFieldOffset({ x: 0, y: 0 });
    setOpen(true);
  }

  function closeRelic() {
    setOpen(false);
    setFieldOffset({ x: 0, y: 0 });
  }

  function onStageLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setStageSize({ width: Math.max(1, width), height: Math.max(1, height) });
  }

  function onStagePress(event: GestureResponderEvent) {
    if (reduceMotion) return;
    const { locationX, locationY } = event.nativeEvent;
    const nx = (locationX / stageSize.width - 0.5) * 2;
    const ny = (locationY / stageSize.height - 0.5) * 2;
    setFieldOffset({ x: nx * 9, y: ny * 9 });
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir Lente da Origem"
        style={({ pressed }) => [styles.trigger, pressed && styles.triggerPressed]}
        onPress={openRelic}
      >
        <View style={styles.triggerCopy}>
          <Text style={styles.triggerEyebrow}>RELIC MOMENT</Text>
          <Text style={styles.triggerTitle}>ABRIR LENTE DA ORIGEM</Text>
        </View>
        <View style={styles.triggerGlyph} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <View style={styles.triggerGlyphMiddle} />
          <View style={styles.triggerGlyphPoint} />
        </View>
      </Pressable>

      <Modal visible={open} animationType={reduceMotion ? 'none' : 'fade'} presentationStyle="fullScreen" onRequestClose={closeRelic}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.headerEyebrow}>HNK · INSTRUMENTO DE INTERFACE</Text>
                <Text style={styles.headerTitle}>LENTE DA ORIGEM</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar Lente da Origem" onPress={closeRelic} hitSlop={12}>
                <Text style={styles.close}>FECHAR ×</Text>
              </Pressable>
            </View>

            <View style={styles.chamber}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Campo da Lente da Origem. Camada ${layer + 1} de 3: ${current.label}. Toque para deslocar o campo visual; o gesto é opcional.`}
                style={styles.stage}
                onLayout={onStageLayout}
                onPress={onStagePress}
              >
                <View style={styles.crossHorizontal} />
                <View style={styles.crossVertical} />
                <Text style={styles.layerGhost} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  {current.roman}
                </Text>

                <View style={[styles.instrument, fieldTransform]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
                  {layer >= 1 ? <View style={styles.ringOuter} /> : null}
                  {layer >= 1 ? <View style={styles.ringMiddle} /> : null}
                  {layer >= 1 ? <View style={styles.ringInner} /> : null}
                  {layer >= 2 ? <View style={styles.axis} /> : null}
                  {layer >= 2 ? <View style={[styles.trace, styles.traceA]} /> : null}
                  {layer >= 2 ? <View style={[styles.trace, styles.traceB]} /> : null}
                  <View style={styles.point} />
                </View>
              </Pressable>

              <View style={styles.copy}>
                <Text style={styles.layerLabel}>{current.roman} · {current.label}</Text>
                <Text style={styles.title}>{current.title}</Text>
                <View style={styles.rule} />
                <Text style={styles.body}>{current.body}</Text>
                <Text style={styles.instruction}>
                  {reduceMotion
                    ? 'MOVIMENTO REDUZIDO ATIVO · USE OS CONTROLES ABAIXO'
                    : 'TOQUE NO CAMPO PARA DESLOCAR A GEOMETRIA · O GESTO NÃO É OBRIGATÓRIO'}
                </Text>

                <View style={styles.progress} accessibilityRole="tablist">
                  {LAYERS.map((item, index) => (
                    <Pressable
                      key={item.label}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: index === layer }}
                      accessibilityLabel={`Abrir camada ${index + 1}: ${item.label}`}
                      onPress={() => {
                        setLayer(index);
                        setFieldOffset({ x: 0, y: 0 });
                      }}
                      style={[styles.progressButton, index === layer && styles.progressButtonActive]}
                    >
                      <View style={[styles.progressLine, index === layer && styles.progressLineActive]} />
                      <Text style={[styles.progressText, index === layer && styles.progressTextActive]}>{item.roman}</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.primaryAction, pressed && styles.primaryActionPressed]}
                  onPress={() => {
                    if (layer < LAYERS.length - 1) {
                      setLayer((value) => Math.min(value + 1, LAYERS.length - 1));
                      setFieldOffset({ x: 0, y: 0 });
                    } else {
                      closeRelic();
                    }
                  }}
                >
                  <Text style={styles.primaryActionText}>
                    {layer < LAYERS.length - 1 ? 'REVELAR PRÓXIMA CAMADA' : 'RETORNAR À REVELAÇÃO'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerCode}>FRONTEIRA HNK-EP</Text>
              <Text style={styles.disclaimerText}>
                Lente da Origem é uma metáfora/instrumento de interface HNK. Não é o Sigilo canônico de Kether, não detecta fenômenos e não constitui prova científica, biomédica ou espiritual externa.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020202',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#020202',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  trigger: {
    marginTop: 28,
    borderWidth: 1,
    borderColor: 'rgba(226,194,106,0.34)',
    backgroundColor: 'rgba(12,10,6,0.96)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  triggerPressed: {
    borderColor: 'rgba(245,216,139,0.72)',
    transform: [{ scale: 0.995 }],
  },
  triggerCopy: {
    flex: 1,
    gap: 4,
  },
  triggerEyebrow: {
    color: '#887b5a',
    fontSize: 9,
    letterSpacing: 1.8,
  },
  triggerTitle: {
    color: '#ead9a8',
    fontSize: 12,
    letterSpacing: 1.4,
    fontWeight: '600',
  },
  triggerGlyph: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(236,207,128,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerGlyphMiddle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(236,207,128,0.22)',
  },
  triggerGlyphPoint: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#f7e7b8',
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226,194,108,0.12)',
    backgroundColor: 'rgba(3,3,3,0.98)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  headerEyebrow: {
    color: '#7f7357',
    fontSize: 8,
    letterSpacing: 1.6,
  },
  headerTitle: {
    color: '#e7d6a3',
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  close: {
    color: '#b3a584',
    fontSize: 10,
    letterSpacing: 1.2,
    paddingVertical: 8,
  },
  chamber: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 22,
    gap: 30,
  },
  stage: {
    minHeight: 340,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(230,199,114,0.14)',
    backgroundColor: '#050402',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: 'rgba(237,210,136,0.04)',
  },
  crossVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: 'rgba(237,210,136,0.045)',
  },
  layerGhost: {
    position: 'absolute',
    left: 18,
    bottom: 4,
    color: 'rgba(232,201,112,0.045)',
    fontFamily: 'serif',
    fontSize: 172,
    lineHeight: 172,
  },
  instrument: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  point: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff5d3',
    shadowColor: '#f0cb65',
    shadowOpacity: 0.9,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  ringOuter: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: 'rgba(235,205,127,0.22)',
  },
  ringMiddle: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: 'rgba(235,205,127,0.24)',
  },
  ringInner: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(235,205,127,0.28)',
  },
  axis: {
    position: 'absolute',
    width: 1,
    height: 238,
    backgroundColor: 'rgba(243,217,143,0.72)',
  },
  trace: {
    position: 'absolute',
    width: 292,
    height: 1,
    backgroundColor: 'rgba(235,204,119,0.16)',
  },
  traceA: {
    transform: [{ rotate: '36deg' }],
  },
  traceB: {
    transform: [{ rotate: '-36deg' }],
  },
  copy: {
    paddingHorizontal: 4,
  },
  layerLabel: {
    color: '#b39858',
    fontSize: 10,
    letterSpacing: 1.8,
  },
  title: {
    marginTop: 10,
    color: '#e9dfc4',
    fontFamily: 'serif',
    fontSize: 42,
    lineHeight: 44,
  },
  rule: {
    width: 72,
    height: 1,
    marginTop: 22,
    marginBottom: 22,
    backgroundColor: '#d1ab54',
  },
  body: {
    color: '#b8ad92',
    fontFamily: 'serif',
    fontSize: 17,
    lineHeight: 29,
  },
  instruction: {
    marginTop: 22,
    color: '#77705c',
    fontSize: 9,
    lineHeight: 15,
    letterSpacing: 1,
  },
  progress: {
    marginTop: 28,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  progressButton: {
    minWidth: 62,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  progressButtonActive: {
    minWidth: 88,
  },
  progressLine: {
    width: 18,
    height: 1,
    backgroundColor: 'rgba(225,190,98,0.2)',
  },
  progressLineActive: {
    width: 38,
    backgroundColor: '#d7b35d',
  },
  progressText: {
    color: '#82775e',
    fontSize: 10,
  },
  progressTextActive: {
    color: '#efd689',
  },
  primaryAction: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: 'rgba(230,197,112,0.4)',
    backgroundColor: 'rgba(208,170,77,0.08)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryActionPressed: {
    borderColor: '#e9c970',
  },
  primaryActionText: {
    color: '#e6d5a4',
    fontSize: 10,
    letterSpacing: 1.4,
  },
  disclaimer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(221,188,99,0.1)',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 30,
    gap: 8,
  },
  disclaimerCode: {
    color: '#b59a5a',
    fontSize: 9,
    letterSpacing: 1.4,
  },
  disclaimerText: {
    color: '#716956',
    fontSize: 9,
    lineHeight: 15,
  },
});
