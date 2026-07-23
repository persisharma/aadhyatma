import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DeityIconKey } from '@/data/deities';

type Props = {
  iconKey?: DeityIconKey;
  fallbackText: string;
  /** Rendered glyph size in dp. Defaults to 36 (the catalog-card avatar size). */
  size?: number;
};

/** The size the View-based glyphs below are drawn at; larger sizes scale up. */
const BASE_SIZE = 36;

const emojiIcons: Partial<Record<DeityIconKey, string>> = {
  bowArrow: '🏹',
  chakra: '☸️',
  trishul: '🔱',
  lotus: '🪷',
  surya: '☀️',
  // PRD-A deity expansion (§A.4.2)
  lakshmi: '🪔',
  suryadev: '🌞',
  radha: '🌸',
  kartikeya: '🦚',
};

export default function DeityIcon({ iconKey, fallbackText, size = BASE_SIZE }: Props) {
  const scale = size / BASE_SIZE;
  if (iconKey === 'bansuriPeacockFeather') return <Scaled scale={scale}><KrishnaIcon /></Scaled>;
  if (iconKey === 'gada') return <Scaled scale={scale}><GadaIcon /></Scaled>;
  if (iconKey === 'modak') return <Scaled scale={scale}><ModakIcon /></Scaled>;
  if (iconKey === 'veena') return <Scaled scale={scale}><VeenaIcon /></Scaled>;

  const emoji = iconKey ? emojiIcons[iconKey] : undefined;
  if (emoji) {
    return <Text style={[styles.emoji, { fontSize: size * 0.61, lineHeight: size * 0.78 }]}>{emoji}</Text>;
  }

  return <Text style={[styles.fallback, { fontSize: size * 0.44 }]}>{fallbackText}</Text>;
}

/** Scales the fixed-size View glyphs. Renders children directly at 1× so the
 *  common catalog-card case keeps its exact layout. */
function Scaled({ scale, children }: { scale: number; children: React.ReactNode }) {
  if (scale === 1) return <>{children}</>;
  return <View style={{ transform: [{ scale }] }} accessible={false}>{children}</View>;
}

function KrishnaIcon() {
  return (
    <View style={styles.krishnaWrap} accessible={false}>
      <View style={styles.bansuri}>
        <View style={styles.bansuriBody} />
        <View style={[styles.bansuriHole, styles.bansuriHoleOne]} />
        <View style={[styles.bansuriHole, styles.bansuriHoleTwo]} />
        <View style={[styles.bansuriHole, styles.bansuriHoleThree]} />
      </View>
      <View style={styles.peacockFeather}>
        <View style={styles.featherStem} />
        <View style={[styles.featherStrand, styles.featherStrandOne]} />
        <View style={[styles.featherStrand, styles.featherStrandTwo]} />
        <View style={[styles.featherStrand, styles.featherStrandThree]} />
        <View style={[styles.featherStrand, styles.featherStrandFour]} />
        <View style={[styles.featherStrand, styles.featherStrandFive]} />
        <View style={styles.featherEyeOuter}>
          <View style={styles.featherEyeMid}>
            <View style={styles.featherEyeInner} />
          </View>
        </View>
      </View>
    </View>
  );
}

function GadaIcon() {
  return (
    <View style={styles.gadaWrap} accessible={false}>
      <View style={styles.gadaHead} />
      <View style={styles.gadaNeck} />
      <View style={styles.gadaHandle} />
      <View style={styles.gadaPommel} />
    </View>
  );
}

function ModakIcon() {
  return (
    <View style={styles.modakWrap} accessible={false}>
      <View style={styles.modakPeak} />
      <View style={styles.modakBody} />
      <View style={styles.modakPleatLeft} />
      <View style={styles.modakPleatRight} />
    </View>
  );
}

function VeenaIcon() {
  return (
    <View style={styles.veenaWrap} accessible={false}>
      <View style={styles.veenaUpperGourd} />
      <View style={styles.veenaNeck} />
      <View style={[styles.veenaString, styles.veenaStringOne]} />
      <View style={[styles.veenaString, styles.veenaStringTwo]} />
      <View style={styles.veenaGourd} />
    </View>
  );
}

const ink = '#733207';
const gold = '#D49A35';
const featherGreen = '#17715D';
const featherTeal = '#0B7D82';
const featherYellow = '#E5BE2E';
const featherBlue = '#064D5E';

const styles = StyleSheet.create({
  emoji: {
    fontSize: 22,
    lineHeight: 28,
    includeFontPadding: false,
    textAlign: 'center',
  },
  fallback: {
    color: '#FFF7E7',
    fontSize: 16,
    includeFontPadding: false,
    textAlign: 'center',
  },
  krishnaWrap: {
    width: 36,
    height: 34,
    position: 'relative',
  },
  bansuri: {
    position: 'absolute',
    left: 1,
    bottom: 7,
    width: 30,
    height: 12,
    transform: [{ rotate: '-19deg' }],
  },
  bansuriBody: {
    position: 'absolute',
    left: 0,
    top: 5,
    width: 30,
    height: 4,
    borderRadius: 2,
    backgroundColor: gold,
    borderWidth: 1,
    borderColor: ink,
  },
  bansuriHole: {
    position: 'absolute',
    top: 6,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: ink,
  },
  bansuriHoleOne: {
    left: 8,
  },
  bansuriHoleTwo: {
    left: 15,
  },
  bansuriHoleThree: {
    left: 22,
  },
  peacockFeather: {
    position: 'absolute',
    right: 1,
    top: 0,
    width: 21,
    height: 30,
    transform: [{ rotate: '23deg' }],
  },
  featherStem: {
    position: 'absolute',
    left: 10,
    top: 2,
    width: 1.4,
    height: 27,
    borderRadius: 1,
    backgroundColor: featherGreen,
  },
  featherStrand: {
    position: 'absolute',
    height: 1,
    borderRadius: 1,
    backgroundColor: featherTeal,
  },
  featherStrandOne: {
    left: 3,
    top: 7,
    width: 12,
    transform: [{ rotate: '-41deg' }],
  },
  featherStrandTwo: {
    left: 5,
    top: 13,
    width: 15,
    transform: [{ rotate: '-25deg' }],
  },
  featherStrandThree: {
    left: 2,
    top: 19,
    width: 14,
    transform: [{ rotate: '-15deg' }],
  },
  featherStrandFour: {
    right: 0,
    top: 15,
    width: 13,
    transform: [{ rotate: '28deg' }],
  },
  featherStrandFive: {
    right: 2,
    top: 21,
    width: 12,
    transform: [{ rotate: '18deg' }],
  },
  featherEyeOuter: {
    position: 'absolute',
    left: 4,
    top: 3,
    width: 15,
    height: 17,
    borderRadius: 9,
    backgroundColor: featherYellow,
    borderWidth: 1,
    borderColor: '#6DAF29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featherEyeMid: {
    width: 9,
    height: 10,
    borderRadius: 5,
    backgroundColor: featherTeal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featherEyeInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: featherBlue,
  },
  gadaWrap: {
    width: 22,
    height: 30,
    alignItems: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  gadaHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ink,
    borderWidth: 1.2,
    borderColor: '#F4C872',
  },
  gadaNeck: {
    width: 5,
    height: 2,
    backgroundColor: '#F4C872',
    marginTop: -1,
    opacity: 0.85,
  },
  gadaHandle: {
    width: 3.5,
    height: 9,
    borderRadius: 1,
    backgroundColor: ink,
  },
  gadaPommel: {
    width: 9,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: ink,
    marginTop: -1,
  },
  modakWrap: {
    width: 30,
    height: 32,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  modakPeak: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: ink,
    marginBottom: -3,
  },
  modakBody: {
    width: 22,
    height: 19,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    backgroundColor: ink,
  },
  modakPleatLeft: {
    position: 'absolute',
    top: 4,
    left: 7,
    width: 1.5,
    height: 14,
    borderRadius: 1,
    backgroundColor: '#F4C872',
    opacity: 0.45,
    transform: [{ rotate: '-22deg' }],
  },
  modakPleatRight: {
    position: 'absolute',
    top: 4,
    right: 7,
    width: 1.5,
    height: 14,
    borderRadius: 1,
    backgroundColor: '#F4C872',
    opacity: 0.45,
    transform: [{ rotate: '22deg' }],
  },
  veenaWrap: {
    width: 30,
    height: 34,
    position: 'relative',
    transform: [{ rotate: '-16deg' }],
  },
  veenaGourd: {
    position: 'absolute',
    left: 1,
    bottom: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: gold,
    borderWidth: 1.2,
    borderColor: ink,
  },
  veenaNeck: {
    position: 'absolute',
    left: 8,
    bottom: 13,
    width: 3.5,
    height: 21,
    borderRadius: 2,
    backgroundColor: ink,
  },
  veenaUpperGourd: {
    position: 'absolute',
    left: 5,
    top: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: gold,
    borderWidth: 1,
    borderColor: ink,
  },
  veenaString: {
    position: 'absolute',
    width: 1,
    backgroundColor: gold,
    opacity: 0.85,
  },
  veenaStringOne: {
    left: 9,
    top: 2,
    height: 24,
  },
  veenaStringTwo: {
    left: 11,
    top: 2,
    height: 24,
  },
});
