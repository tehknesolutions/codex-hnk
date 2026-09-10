import Svg, { G, Path } from 'react-native-svg';

export const THURISAZ_MASTER_ID = 'thurisaz-hnk-master-v1.svg';
export const THURISAZ_MASTER_UNICODE = 'U+16A6';
export const THURISAZ_MASTER_SHA256 = 'c7e0967c30f084a9b57f864342613d1af6209de148bf9ae9b941896b6c3980ea';

/** Native rendering of the canonical 200×240 HNK SVG. Geometry is copied
 * exactly from assets/canonical/binah/thurisaz-hnk-master-v1.svg. */
export function ThurisazMasterV1() {
  return (
    <Svg
      width="100%"
      height={300}
      viewBox="0 0 200 240"
      accessibilityRole="image"
      accessibilityLabel="HNK Thurisaz Master V1, U+16A6, ereta e não espelhada"
    >
      <G fill="none" strokeLinecap="square" strokeLinejoin="miter">
        <Path d="M60 20 V220 M60 68 L148 120 L60 172" stroke="#111111" strokeWidth={24} />
        <Path d="M60 20 V220 M60 68 L148 120 L60 172" stroke="#B3192E" strokeWidth={10} />
      </G>
    </Svg>
  );
}
