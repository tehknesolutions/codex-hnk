import Svg, { Circle, G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

export const TETRAGRAMMATON_MASTER_ID = 'pantaculo-tetragrammaton-hnk-master-v1.svg';
export const TETRAGRAMMATON_MASTER_SHA256 = '16cd1d9ff1cc256f570d526bc6c6bfd249d06957d972f87f51168011cb78451b';

const hexMarks = [[500,95],[805,240],[900,535],[760,825],[240,825],[100,535],[195,240]] as const;

export function TetragrammatonMasterV1() {
  return (
    <Svg width="100%" height={340} viewBox="0 0 1000 1000" accessibilityRole="image" accessibilityLabel="HNK Pantáculo Tetragrammaton Master V1, ereto e não espelhado">
      <Rect width="1000" height="1000" fill="#f4ead1" />
      <G fill="none" stroke="#1b1711" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="500" cy="500" r="455" strokeWidth="18" /><Circle cx="500" cy="500" r="410" strokeWidth="8" /><Circle cx="500" cy="500" r="305" strokeWidth="8" /><Circle cx="500" cy="500" r="140" strokeWidth="8" />
        <Path d="M500 195 L245 680 L755 680 Z" strokeWidth="10" /><Path d="M245 680 L500 820 L755 680" strokeWidth="10" /><Path d="M500 195 L500 365 M245 680 L375 560 M755 680 L625 560" strokeWidth="8" />
        <Polygon points="500,385 605,565 395,565" strokeWidth="10" /><Polygon points="500,625 395,445 605,445" strokeWidth="10" /><Circle cx="500" cy="505" r="30" strokeWidth="8" />
        <G strokeWidth="14"><Path d="M290 380 h80 M330 340 v80"/><Path d="M630 380 h80 M670 340 v80"/><Path d="M460 760 h80 M500 720 v80"/></G>
        <G strokeWidth="7">
          <Path d="M470 280 h60 l-10 45 h-40 z M500 325 v18 M475 343 h50"/><Path d="M315 590 h60 l-10 45 h-40 z M345 635 v18 M320 653 h50"/><Path d="M625 590 h60 l-10 45 h-40 z M655 635 v18 M630 653 h50"/>
          <Path d="M500 275 c-25-25 5-42 0-68 c30 22 30 45 0 68"/><Path d="M345 585 c-25-25 5-42 0-68 c30 22 30 45 0 68"/><Path d="M655 585 c-25-25 5-42 0-68 c30 22 30 45 0 68"/>
        </G>
        <G strokeWidth="5">{hexMarks.map(([x,y]) => <G key={`${x}-${y}`} transform={`translate(${x} ${y})`}><Polygon points="0,-24 21,12 -21,12"/><Polygon points="0,24 21,-12 -21,-12"/></G>)}</G>
      </G>
      <G fill="#1b1711" textAnchor="middle">
        <SvgText x="355" y="150" fontSize="40" letterSpacing="7">ALPHA</SvgText><SvgText x="650" y="150" fontSize="40" letterSpacing="7">OMEGA</SvgText>
        <SvgText x="860" y="420" fontSize="34" transform="rotate(70 860 420)" letterSpacing="4">O THEOS</SvgText><SvgText x="140" y="600" fontSize="30" transform="rotate(-72 140 600)" letterSpacing="3">EHEYEH</SvgText>
        <SvgText x="340" y="875" fontSize="29" letterSpacing="3">ASHER</SvgText><SvgText x="660" y="875" fontSize="29" letterSpacing="3">EHEYEH</SvgText>
        <SvgText x="500" y="350" fontSize="28" letterSpacing="5">TETRAGRAMMATON</SvgText><SvgText x="330" y="510" fontSize="26" transform="rotate(-38 330 510)" letterSpacing="3">TETRAGRAMMATON</SvgText><SvgText x="670" y="510" fontSize="26" transform="rotate(38 670 510)" letterSpacing="3">TETRAGRAMMATON</SvgText><SvgText x="500" y="700" fontSize="26" letterSpacing="4">TETRAGRAMMATON</SvgText>
        <SvgText x="330" y="330" fontSize="32" fontWeight="700">A G L A</SvgText><SvgText x="670" y="330" fontSize="32" fontWeight="700">A G L A</SvgText><SvgText x="500" y="850" fontSize="32" fontWeight="700">A G L A</SvgText>
        <SvgText x="250" y="570" fontSize="44">☾</SvgText><SvgText x="750" y="570" fontSize="44">☿</SvgText><SvgText x="500" y="250" fontSize="40">♄</SvgText><SvgText x="540" y="250" fontSize="40">♃</SvgText>
      </G>
      <Circle cx="500" cy="505" r="10" fill="#8b6f2e" />
      <SvgText x="500" y="970" fill="#5c4c34" fontSize="18" textAnchor="middle">HNK CANONICAL MASTER V1 · DAY 070 · UPRIGHT · DO NOT MIRROR</SvgText>
    </Svg>
  );
}
