import React from 'react';
import Svg, { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';
import type { LandmarkKind } from '@/content/dialectBackdrops';

interface Props {
  kind: LandmarkKind;
  width?: number | string;
  height?: number;
  color?: string;
  opacity?: number;
}

/**
 * Faint vector skyline anchored to the bottom of a hero header. Each landmark is a single-color
 * silhouette in a 320x120 viewBox; the sky (top) is empty so `xMidYMax slice` fills any width and
 * crops upward without distorting the monument.
 */
export function LandmarkSilhouette({ kind, width = '100%', height = 120, color = '#ffffff', opacity = 0.16 }: Props) {
  return (
    <Svg width={width} height={height} viewBox="0 0 320 120" preserveAspectRatio="xMidYMax slice">
      <G fill={color} opacity={opacity}>
        {renderKind(kind, color)}
      </G>
    </Svg>
  );
}

function renderKind(kind: LandmarkKind, color: string): React.ReactNode {
  switch (kind) {
    case 'martyrs_memorial':
      // Maqam E'chahid: three concave palm-leaf blades joining at a peak over an eternal flame.
      return (
        <>
          <Rect x={0} y={116} width={320} height={4} />
          <Path d="M150,116 Q150,58 197,14 Q200,58 160,116 Z" />
          <Path d="M193,116 Q197,54 200,10 Q203,54 207,116 Z" />
          <Path d="M170,116 Q170,58 203,14 Q200,58 190,116 Z" />
          <Rect x={172} y={110} width={56} height={8} rx={2} />
          <Circle cx={200} cy={100} r={6} fill={color} opacity={1} />
        </>
      );
    case 'domes':
      // El Oued — a run of low domes with a slim minaret.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Path d="M32,112 Q52,74 72,112 Z" />
          <Path d="M78,112 Q104,66 130,112 Z" />
          <Path d="M136,112 Q158,78 180,112 Z" />
          <Path d="M186,112 Q214,64 242,112 Z" />
          <Rect x={258} y={54} width={16} height={58} rx={3} />
          <Path d="M258,56 Q266,40 274,56 Z" />
          <Circle cx={266} cy={40} r={4} />
        </>
      );
    case 'cairo':
      // Pyramids of Giza + the lattice Cairo Tower.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Polygon points="14,112 74,54 134,112" />
          <Polygon points="104,112 146,74 188,112" />
          <Polygon points="250,112 258,44 262,44 270,112" />
          <Polygon points="252,50 268,50 264,32 256,32" />
          <Rect x={257} y={58} width={6} height={6} />
          <Line x1={260} y1={32} x2={260} y2={18} stroke={color} strokeWidth={2} />
          <G opacity={0.5}>
            <Line x1={254} y1={70} x2={266} y2={70} stroke={color} strokeWidth={1.5} />
            <Line x1={255} y1={84} x2={265} y2={84} stroke={color} strokeWidth={1.5} />
            <Line x1={256} y1={98} x2={264} y2={98} stroke={color} strokeWidth={1.5} />
          </G>
        </>
      );
    case 'koutoubia':
      // Square Almohad minaret with a low arcaded wall.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={40} y={96} width={240} height={16} />
          <Rect x={142} y={34} width={40} height={78} />
          <Rect x={150} y={20} width={24} height={16} />
          <Line x1={162} y1={20} x2={162} y2={6} stroke={color} strokeWidth={2} />
          <Circle cx={162} cy={6} r={3} />
        </>
      );
    case 'sidibou':
      // Whitewashed domed building + slim minaret (Sidi Bou Said).
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={96} y={66} width={110} height={46} />
          <Path d="M96,68 Q151,26 206,68 Z" />
          <Rect x={224} y={44} width={16} height={68} rx={2} />
          <Path d="M224,46 Q232,32 240,46 Z" />
          <Circle cx={232} cy={32} r={4} />
        </>
      );
    case 'umayyad':
      // Broad prayer hall, big central dome, two flanking minarets.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={70} y={72} width={180} height={40} />
          <Path d="M120,74 Q160,30 200,74 Z" />
          <Rect x={64} y={40} width={14} height={72} rx={2} />
          <Path d="M64,42 Q71,30 78,42 Z" />
          <Rect x={242} y={40} width={14} height={72} rx={2} />
          <Path d="M242,42 Q249,30 256,42 Z" />
        </>
      );
    case 'kaaba_tower':
      // The Kaaba cube beside the Abraj Al Bait clock tower.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={48} y={78} width={52} height={34} />
          <Rect x={206} y={22} width={40} height={90} />
          <Rect x={212} y={6} width={28} height={18} rx={2} />
          <Circle cx={226} cy={15} r={5} fill="none" stroke={color} strokeWidth={2} />
          <Line x1={226} y1={6} x2={226} y2={-4} stroke={color} strokeWidth={2} />
        </>
      );
    case 'burj':
      // Sail-shaped tower flanked by glass skyscrapers.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={60} y={60} width={22} height={52} />
          <Rect x={88} y={44} width={22} height={68} />
          <Path d="M232,112 L232,26 Q244,16 268,112 Z" />
          <Rect x={286} y={70} width={18} height={42} />
        </>
      );
    case 'malwiya':
      // Samarra's spiralling conical minaret.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Polygon points="132,112 188,112 174,34 146,34" />
          <Rect x={150} y={20} width={20} height={16} />
          <G opacity={0.5} stroke={color} strokeWidth={2} fill="none">
            <Line x1={136} y1={104} x2={184} y2={94} />
            <Line x1={139} y1={88} x2={181} y2={78} />
            <Line x1={143} y1={72} x2={177} y2={62} />
            <Line x1={147} y1={56} x2={173} y2={46} />
          </G>
        </>
      );
    case 'meroe':
      // Cluster of steep Nubian pyramids.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Polygon points="34,112 58,50 82,112" />
          <Polygon points="90,112 110,58 130,112" />
          <Polygon points="140,112 166,44 192,112" />
          <Polygon points="200,112 220,60 240,112" />
          <Polygon points="248,112 270,52 292,112" />
        </>
      );
    case 'sanaa':
      // Old Sana'a tower-houses with lit upper windows.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={44} y={52} width={30} height={60} />
          <Rect x={80} y={38} width={30} height={74} />
          <Rect x={116} y={62} width={28} height={50} />
          <Rect x={172} y={44} width={30} height={68} />
          <Rect x={208} y={58} width={28} height={54} />
          <Rect x={244} y={34} width={30} height={78} />
          <G opacity={0.55}>
            <Rect x={52} y={60} width={5} height={7} />
            <Rect x={62} y={60} width={5} height={7} />
            <Rect x={88} y={48} width={5} height={7} />
            <Rect x={98} y={48} width={5} height={7} />
            <Rect x={180} y={54} width={5} height={7} />
            <Rect x={190} y={54} width={5} height={7} />
            <Rect x={252} y={44} width={5} height={7} />
            <Rect x={262} y={44} width={5} height={7} />
          </G>
        </>
      );
    case 'dome_of_rock':
      // Jerusalem's Dome of the Rock: octagonal base + golden dome, flanked by a wall/minaret.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={116} y={72} width={88} height={40} />
          <Path d="M116,74 Q160,20 204,74 Z" />
          <Line x1={160} y1={20} x2={160} y2={6} stroke={color} strokeWidth={2} />
          <Circle cx={160} cy={6} r={3} />
          <Rect x={60} y={88} width={16} height={24} />
          <Rect x={246} y={84} width={16} height={28} />
        </>
      );
    case 'cedar':
      // The cedar of Lebanon: a broad layered evergreen on a low ridge.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={154} y={92} width={12} height={20} />
          <Path d="M110,96 Q160,84 210,96 Q188,90 210,80 Q170,86 160,66 Q150,86 110,80 Q132,90 110,96 Z" />
          <Path d="M120,84 Q160,72 200,84 Q160,50 160,50 Q160,50 120,84 Z" />
          <Path d="M134,68 Q160,58 186,68 Q160,38 160,38 Q160,38 134,68 Z" />
        </>
      );
    case 'petra':
      // Petra's Treasury (Al-Khazneh) façade carved into the rock: columns + pediment + tholos.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={120} y={40} width={80} height={72} />
          <Polygon points="118,40 160,14 202,40" />
          <Rect x={150} y={22} width={20} height={26} />
          <Path d="M150,24 Q160,14 170,24 Z" />
          <G opacity={0.55}>
            <Rect x={128} y={54} width={7} height={58} />
            <Rect x={144} y={54} width={7} height={58} />
            <Rect x={169} y={54} width={7} height={58} />
            <Rect x={185} y={54} width={7} height={58} />
          </G>
        </>
      );
    case 'roman_arch':
      // The Arch of Marcus Aurelius, Tripoli: two piers, an entablature, and a low dome — drawn as
      // solid parts around an open archway (the gap between the piers reads as the arch).
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={122} y={54} width={20} height={58} />
          <Rect x={178} y={54} width={20} height={58} />
          <Path d="M122,64 Q160,30 198,64 L198,54 Q160,24 122,54 Z" />
          <Rect x={116} y={40} width={88} height={16} />
          <Path d="M140,40 Q160,20 180,40 Z" />
        </>
      );
    case 'minaret':
    default:
      // Generic grand mosque: central dome flanked by a minaret.
      return (
        <>
          <Rect x={0} y={112} width={320} height={8} />
          <Rect x={92} y={70} width={120} height={42} />
          <Path d="M112,72 Q152,26 192,72 Z" />
          <Rect x={232} y={40} width={16} height={72} rx={2} />
          <Path d="M232,42 Q240,28 248,42 Z" />
          <Circle cx={240} cy={28} r={4} />
          <Rect x={70} y={92} width={22} height={20} />
        </>
      );
  }
}
