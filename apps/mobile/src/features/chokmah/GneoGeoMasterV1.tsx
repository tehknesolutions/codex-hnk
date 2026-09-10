import Svg, { Circle, G, Line, Polygon, Rect, Text as SvgText } from 'react-native-svg';

export const GNEO_GEO_MASTER_ID = 'cockpit-gneo-geo-hnk-master-v1.svg';
export const GNEO_GEO_MASTER_SHA256 = '9b3c8f3f8292100d148e7a698e8a8d978adee6f1779412a1ba833603c7fc62e6';

const nodes = [
  { id: 1, label: 'Superconsciência', cx: 290, cy: 100, r: 10, fill: '#ffd700', stroke: '#000', text: '#000' },
  { id: 2, label: 'Consciência', cx: 250, cy: 170, r: 10, fill: '#ff7300', stroke: '#fff', text: '#fff' },
  { id: 3, label: 'Subconsciente', cx: 210, cy: 100, r: 10, fill: '#00d2ff', stroke: '#000', text: '#000' },
  { id: 4, label: 'Multi-Sigilo', cx: 250, cy: 120, r: 11, fill: '#fff', stroke: '#000', text: '#000' },
  { id: 5, label: 'Temperamento', cx: 180, cy: 140, r: 9, fill: '#00d2ff', stroke: '#fff', text: '#000' },
  { id: 6, label: 'Tarefa Principal', cx: 250, cy: 48, r: 9, fill: '#ffd700', stroke: '#000', text: '#000' },
  { id: 7, label: 'Longevidade', cx: 320, cy: 140, r: 9, fill: '#00d2ff', stroke: '#fff', text: '#000' },
  { id: 8, label: 'Nome / Circuito 8', cx: 250, cy: 92, r: 10, fill: '#a85218', stroke: '#ffd700', text: '#fff' },
] as const;

export function GneoGeoMasterV1() {
  return (
    <Svg width="100%" height={260} viewBox="0 0 500 265" accessibilityRole="image" accessibilityLabel="HNK Cockpit Gneo Geo Master V1. Campo circular com duas estrelas triangulares opostas, eixos, oito nós informativos e Pérola Azul central. Os nós não correspondem um a um aos oito Circuitos da Consciência.">
      <Rect width="500" height="265" fill="#020408" />
      <G fill="none">
        <Circle cx="250" cy="132" r="105" stroke="#00d2ff" strokeWidth="1.2" strokeDasharray="6 3" />
        <Polygon points="250,27 335,178 165,178" stroke="#ffd700" strokeWidth="2" />
        <Polygon points="250,237 165,86 335,86" stroke="#ffd700" strokeWidth="2" />
        <Line x1="250" y1="12" x2="250" y2="252" stroke="#ff8800" strokeWidth="1.5" />
        <Line x1="130" y1="132" x2="370" y2="132" stroke="#ff8800" strokeWidth="1.5" />
      </G>
      <G fontSize="10" fontWeight="700" textAnchor="middle">
        {nodes.map((node) => (
          <G key={node.id} accessibilityLabel={`Nó ${node.id}: ${node.label}`}>
            <Circle cx={node.cx} cy={node.cy} r={node.r} fill={node.fill} stroke={node.stroke} />
            <SvgText x={node.cx} y={node.cy + 4} fill={node.text}>{node.id}</SvgText>
          </G>
        ))}
      </G>
      <Circle cx="250" cy="132" r="7" fill="#2f80ff" stroke="#d8f3ff" strokeWidth="2" />
      <SvgText x="250" y="258" fill="#8aa7b7" fontSize="8" textAnchor="middle">HNK CANONICAL SCHEMATIC · GNEO GEO V1</SvgText>
    </Svg>
  );
}
