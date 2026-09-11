import {Circle,Line,Path,Svg} from 'react-native-svg';

const gates=[
[600,268,600,218],[766,312.48,791,269.18],[887.52,434,930.82,409],[932,600,982,600],[887.52,766,930.82,791],[766,887.52,791,930.82],[600,932,600,982],[434,887.52,409,930.82],[312.48,766,269.18,791],[268,600,218,600],[312.48,434,269.18,409],[434,312.48,409,269.18],
] as const;
const marks=[
[600,190,600,154],[672.93,186.38,677.45,160.78],[743.65,205.33,752.54,180.9],[805,244.93,823,213.75],[869.97,278.26,886.68,258.34],[921.74,330.03,941.66,313.32],[955.07,395,986.25,377],[994.67,456.35,1019.1,447.46],[1013.62,527.07,1039.22,522.55],[1010,600,1046,600],[1013.62,672.93,1039.22,677.45],[994.67,743.65,1019.1,752.54],[955.07,805,986.25,823],[921.74,869.97,941.66,886.68],[869.97,921.74,886.68,941.66],[805,955.07,823,986.25],[743.65,994.67,752.54,1019.1],[672.93,1013.62,677.45,1039.22],[600,1010,600,1046],[527.07,1013.62,522.55,1039.22],[456.35,994.67,447.46,1019.1],[395,955.07,377,986.25],[330.03,921.74,313.32,941.66],[278.26,869.97,258.34,886.68],[244.93,805,213.75,823],[205.33,743.65,180.9,752.54],[186.38,672.93,160.78,677.45],[190,600,154,600],[186.38,527.07,160.78,522.55],[205.33,456.35,180.9,447.46],[244.93,395,213.75,377],[278.26,330.03,258.34,313.32],[330.03,278.26,313.32,258.34],[395,244.93,377,213.75],[456.35,205.33,447.46,180.9],[527.07,186.38,522.55,160.78],
] as const;

export interface KetherSigilV1MobileProps{size?:number;resolved?:boolean}
export function KetherSigilV1Mobile({size=320,resolved=false}:KetherSigilV1MobileProps){const stroke=resolved?'#f4d889':'#d7d9e2';return <Svg accessibilityLabel="Sigilo da Coroa de Kether HNK V1" width={size} height={size} viewBox="0 0 1200 1200">
  <Circle cx={600} cy={600} r={144} fill="none" stroke={stroke} strokeWidth={6}/><Circle cx={600} cy={600} r={288} fill="none" stroke={stroke} strokeWidth={6}/><Circle cx={600} cy={600} r={432} fill="none" stroke={stroke} strokeWidth={6}/>
  {gates.map((g,i)=><Line key={`gate-${i+1}`} x1={g[0]} y1={g[1]} x2={g[2]} y2={g[3]} stroke={stroke} strokeWidth={10} strokeLinecap="round"/>)}
  {marks.map((m,i)=><Line key={`day-${i+1}`} x1={m[0]} y1={m[1]} x2={m[2]} y2={m[3]} stroke={i===35&&!resolved?'#666977':stroke} strokeWidth={5} strokeLinecap="round"/>)}
  <Line x1={600} y1={600} x2={600} y2={116} stroke={resolved?stroke:'#666977'} strokeWidth={12} strokeLinecap="round"/>
  <Path d="M 540 116 L 570 76 L 600 36 L 630 76 L 660 116" fill="none" stroke={resolved?stroke:'#666977'} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round"/>
  <Circle cx={600} cy={600} r={12} fill={stroke}/>
</Svg>}
