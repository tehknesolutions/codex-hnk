import Svg, { Circle, G, Path } from 'react-native-svg';

export const MAGICIAN_MERCURY_SIGIL_ID = 'HNK-REF-MAGICIAN-MERCURY-V1' as const;
export const MAGICIAN_MERCURY_SIGIL_ASSET = 'magician-mercury-sigil-hnk-v1.svg' as const;
export const MAGICIAN_MERCURY_SIGIL_SHA256 = '8c7b95f81aee0689ec3497380c4c3841634ca311dbfa09eed50c757809a97209' as const;

export function MagicianMercurySigilV1() {
  return (
    <Svg
      width="100%"
      height={280}
      viewBox="0 0 240 280"
      accessibilityRole="image"
      accessibilityLabel="Sigilo canônico HNK do Mago ancorado em Mercúrio, orientação ereta e não espelhada"
    >
      <G fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M78 58 Q120 18 162 58" stroke="#111111" strokeWidth={16} />
        <Circle cx={120} cy={112} r={48} stroke="#111111" strokeWidth={16} />
        <Path d="M120 160 L120 244 M82 206 L158 206" stroke="#111111" strokeWidth={16} />
        <Path d="M78 58 Q120 18 162 58" stroke="#B3192E" strokeWidth={5} />
        <Circle cx={120} cy={112} r={48} stroke="#B3192E" strokeWidth={5} />
        <Path d="M120 160 L120 244 M82 206 L158 206" stroke="#B3192E" strokeWidth={5} />
      </G>
    </Svg>
  );
}
