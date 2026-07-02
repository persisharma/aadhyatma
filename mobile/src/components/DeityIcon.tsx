import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';
import type { DeityIconKey } from '@/data/deities';

type Props = {
  iconKey?: DeityIconKey;
  fallbackText: string;
  /** Rendered glyph size in dp. Defaults to 36 (the catalog-card avatar size). */
  size?: number;
};

type IconProps = { size: number };

export default function DeityIcon({ iconKey, fallbackText, size = 36 }: Props) {
  switch (iconKey) {
    case 'bowArrow':
      return <RamaIcon size={size} />;
    case 'bansuriPeacockFeather':
      return <KrishnaIcon size={size} />;
    case 'chakra':
      return <ChakraIcon size={size} />;
    case 'trishul':
      return <TrishulIcon size={size} />;
    case 'gada':
      return <GadaIcon size={size} />;
    case 'lotus':
      return <LotusIcon size={size} />;
    case 'modak':
      return <ModakIcon size={size} />;
    case 'surya':
      return <SuryaIcon size={size} />;
    case 'veena':
      return <VeenaIcon size={size} />;
    default:
      return <Text style={[styles.fallback, { fontSize: size * 0.44 }]}>{fallbackText}</Text>;
  }
}

const ink = '#733207';
const gold = '#D49A35';
const paleGold = '#F4C872';
const green = '#3F7B46';
const teal = '#0B6F73';

const VIEW_BOX = '0 0 44 44';

function RamaIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      <Path
        d="M13 8C25 12 26 32 13 36"
        fill="none"
        stroke={ink}
        strokeWidth={2.7}
        strokeLinecap="round"
      />
      <Path
        d="M14 9C19 17 19 27 14 35"
        fill="none"
        stroke={paleGold}
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.85}
      />
      <Line x1={13.5} y1={8.5} x2={13.5} y2={35.5} stroke={ink} strokeWidth={1.4} />
      <Line x1={8} y1={27} x2={35} y2={17} stroke={ink} strokeWidth={2.3} strokeLinecap="round" />
      <Path d="M35 17L29.5 14.5L31.5 20.5Z" fill={gold} stroke={ink} strokeWidth={1} />
      <Path d="M8 27L12.5 22.5M8 27L14 29.5" stroke={paleGold} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

function KrishnaIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      <Path
        d="M6 29L31 20"
        stroke={ink}
        strokeWidth={4.2}
        strokeLinecap="round"
      />
      <Path
        d="M7 28.5L31 20"
        stroke={gold}
        strokeWidth={2.1}
        strokeLinecap="round"
      />
      {[13, 19, 25].map((x) => (
        <Circle key={x} cx={x} cy={25.5 - (x - 13) * 0.35} r={1.1} fill={ink} />
      ))}
      <Line x1={28} y1={33} x2={33} y2={7} stroke={green} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M31 12C23 15 23 25 30 30" fill="none" stroke={teal} strokeWidth={1.2} strokeLinecap="round" />
      <Path d="M34 12C40 17 38 26 31 30" fill="none" stroke={teal} strokeWidth={1.2} strokeLinecap="round" />
      <Ellipse cx={33} cy={14} rx={6.2} ry={7.6} fill={paleGold} stroke={green} strokeWidth={1.2} />
      <Ellipse cx={33} cy={14} rx={3.4} ry={4} fill={teal} />
      <Circle cx={33} cy={14} r={2} fill={ink} />
    </Svg>
  );
}

function ChakraIcon({ size }: IconProps) {
  const spokes = [
    [22, 9, 22, 35],
    [9, 22, 35, 22],
    [12.8, 12.8, 31.2, 31.2],
    [31.2, 12.8, 12.8, 31.2],
  ];

  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      <Circle cx={22} cy={22} r={14} fill="none" stroke={ink} strokeWidth={2.6} />
      <Circle cx={22} cy={22} r={8.2} fill="none" stroke={paleGold} strokeWidth={1.8} />
      {spokes.map(([x1, y1, x2, y2]) => (
        <Line
          key={`${x1}-${y1}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={ink}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      ))}
      <Circle cx={22} cy={22} r={3.2} fill={ink} />
    </Svg>
  );
}

function TrishulIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      <Line x1={22} y1={9} x2={22} y2={37} stroke={ink} strokeWidth={3} strokeLinecap="round" />
      <Path d="M22 8C19 13 19 17 22 21C25 17 25 13 22 8Z" fill={gold} stroke={ink} strokeWidth={1.2} />
      <Path
        d="M13 13C13 21 16 25 22 25C28 25 31 21 31 13"
        fill="none"
        stroke={ink}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path d="M13 13L10 18M31 13L34 18" stroke={gold} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={16} y1={31} x2={28} y2={31} stroke={paleGold} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

function GadaIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      <Path d="M16 7C22 4 29 8 29 15C29 21 24 25 18 23C13 21 11 15 13 11C13.7 9.3 14.7 8 16 7Z" fill={ink} />
      <Path d="M16 7C19 8 23 8 27 6" stroke={paleGold} strokeWidth={1.5} strokeLinecap="round" opacity={0.75} />
      <Path d="M19 22L25 37" stroke={ink} strokeWidth={4.4} strokeLinecap="round" />
      <Path d="M18 25L25 22" stroke={paleGold} strokeWidth={2} strokeLinecap="round" />
      <Line x1={21} y1={38} x2={30} y2={35} stroke={ink} strokeWidth={3.8} strokeLinecap="round" />
    </Svg>
  );
}

function LotusIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      <Path d="M22 10C17 15 16 23 22 29C28 23 27 15 22 10Z" fill={paleGold} stroke={ink} strokeWidth={1.4} />
      <Path d="M13 15C12 23 15 29 22 31C22 23 18 18 13 15Z" fill={gold} stroke={ink} strokeWidth={1.3} />
      <Path d="M31 15C32 23 29 29 22 31C22 23 26 18 31 15Z" fill={gold} stroke={ink} strokeWidth={1.3} />
      <Path d="M8 24C12 31 17 34 22 31C18 26 13 24 8 24Z" fill={paleGold} stroke={ink} strokeWidth={1.2} />
      <Path d="M36 24C32 31 27 34 22 31C26 26 31 24 36 24Z" fill={paleGold} stroke={ink} strokeWidth={1.2} />
      <Path d="M10 34C17 37 27 37 34 34" stroke={green} strokeWidth={2.3} strokeLinecap="round" />
    </Svg>
  );
}

function ModakIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      <Path d="M22 7L15 20H29L22 7Z" fill={ink} />
      <Path
        d="M12 21C12 31 16 37 22 37C28 37 32 31 32 21C28 24 16 24 12 21Z"
        fill={ink}
      />
      <Path d="M17 15C18 22 18 30 16 35M27 15C26 22 26 30 28 35" stroke={paleGold} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <Path d="M14 22C18 25 26 25 30 22" stroke={paleGold} strokeWidth={1.6} strokeLinecap="round" opacity={0.75} />
    </Svg>
  );
}

function SuryaIcon({ size }: IconProps) {
  const rays = [
    [22, 4, 22, 9],
    [22, 35, 22, 40],
    [4, 22, 9, 22],
    [35, 22, 40, 22],
    [9.3, 9.3, 12.8, 12.8],
    [31.2, 31.2, 34.7, 34.7],
    [34.7, 9.3, 31.2, 12.8],
    [12.8, 31.2, 9.3, 34.7],
  ];

  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      {rays.map(([x1, y1, x2, y2]) => (
        <Line
          key={`${x1}-${y1}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={ink}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      ))}
      <Circle cx={22} cy={22} r={10.5} fill={gold} stroke={ink} strokeWidth={2} />
      <Path d="M16 22C18 25 21 26.5 25 25.5C27 25 28.5 23.8 30 22" stroke={paleGold} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function VeenaIcon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEW_BOX} accessible={false}>
      <Circle cx={14} cy={31} r={8.4} fill={gold} stroke={ink} strokeWidth={1.8} />
      <Circle cx={23} cy={10} r={4.8} fill={gold} stroke={ink} strokeWidth={1.4} />
      <Path d="M17 28L29 8" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <Path d="M20 29L32 10" stroke={paleGold} strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M13 31C19 28 25 20 31 9" stroke={paleGold} strokeWidth={1} strokeLinecap="round" fill="none" opacity={0.85} />
      <Path d="M11 26C17 25 26 17 32 6" stroke={ink} strokeWidth={1.2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  fallback: {
    color: '#FFF7E7',
    includeFontPadding: false,
    textAlign: 'center',
  },
});
