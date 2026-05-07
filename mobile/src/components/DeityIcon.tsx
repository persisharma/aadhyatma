import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { DeityIconKey } from '@/data/deities';

type Props = {
  iconKey?: DeityIconKey;
  fallbackText: string;
};

const emojiIcons: Partial<Record<DeityIconKey, string>> = {
  bowArrow: '🏹',
  trishul: '🔱',
  lotus: '🪷',
};

export default function DeityIcon({ iconKey, fallbackText }: Props) {
  if (iconKey === 'bansuriPeacockFeather') return <KrishnaIcon />;
  if (iconKey === 'gada') return <GadaIcon />;
  if (iconKey === 'modak') return <ModakIcon />;

  const emoji = iconKey ? emojiIcons[iconKey] : undefined;

  return (
    <Text style={emoji ? styles.emoji : styles.fallback}>
      {emoji ?? fallbackText}
    </Text>
  );
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
      <View style={styles.gadaBase} />
    </View>
  );
}

function ModakIcon() {
  return (
    <View style={styles.modakWrap} accessible={false}>
      <View style={styles.modakBody} />
      <View style={styles.modakCrease} />
      <View style={[styles.modakDot, styles.modakDotOne]} />
      <View style={[styles.modakDot, styles.modakDotTwo]} />
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
    width: 30,
    height: 30,
    position: 'relative',
    transform: [{ rotate: '-28deg' }],
  },
  gadaHead: {
    position: 'absolute',
    left: 3,
    top: 1,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: ink,
    borderWidth: 1,
    borderColor: '#F4C872',
  },
  gadaNeck: {
    position: 'absolute',
    left: 15,
    top: 11,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ink,
  },
  gadaHandle: {
    position: 'absolute',
    left: 18,
    top: 13,
    width: 4,
    height: 17,
    borderRadius: 2,
    backgroundColor: ink,
  },
  gadaBase: {
    position: 'absolute',
    left: 15,
    bottom: 0,
    width: 10,
    height: 4,
    borderRadius: 2,
    backgroundColor: ink,
  },
  modakWrap: {
    width: 30,
    height: 30,
    position: 'relative',
    alignItems: 'center',
  },
  modakBody: {
    position: 'absolute',
    top: 2,
    width: 21,
    height: 26,
    borderRadius: 11,
    backgroundColor: ink,
    transform: [{ scaleX: 0.9 }],
  },
  modakCrease: {
    position: 'absolute',
    top: 6,
    width: 3,
    height: 15,
    borderRadius: 2,
    backgroundColor: '#F4C872',
    opacity: 0.55,
  },
  modakDot: {
    position: 'absolute',
    top: 21,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#F4C872',
    opacity: 0.65,
  },
  modakDotOne: {
    left: 10,
  },
  modakDotTwo: {
    right: 10,
  },
});
