import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ContentCategory } from '@/data/texts';
import { useTheme } from '@/theme/ThemeContext';

export type CategoryIconKey = ContentCategory | 'deity';

type Props = {
  iconKey: CategoryIconKey;
};

type IconPaint = {
  color: string;
  accent: string;
};

export default function CategoryIcon({ iconKey }: Props) {
  const { colors, typography } = useTheme();
  const paint = { color: colors.saffronDeep, accent: colors.gold };

  return (
    <View style={styles.frame} accessible={false}>
      {iconKey === 'granth' && <PalmLeafManuscriptIcon {...paint} />}
      {iconKey === 'stotram' && (
        <OmGlyphIcon {...paint} fontFamily={typography.thumb.fontFamily} />
      )}
      {iconKey === 'chalisa' && <MalaIcon {...paint} />}
      {iconKey === 'japam' && (
        <JapamBeadIcon {...paint} fontFamily={typography.thumb.fontFamily} />
      )}
      {iconKey === 'deity' && <TempleIcon {...paint} />}
      {iconKey === 'aarti' && <DiyaIcon {...paint} />}
      {iconKey === 'bhajan' && <TanpuraIcon {...paint} />}
      {iconKey === 'veda' && <VedaManuscriptIcon {...paint} />}
    </View>
  );
}

function PalmLeafManuscriptIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.manuscriptWrap}>
      <View style={[styles.leaf, styles.leafTop, { borderColor: color }]} />
      <View style={[styles.leaf, styles.leafBottom, { borderColor: color }]} />
      <View style={[styles.leafLine, styles.leafLineTop, { backgroundColor: accent }]} />
      <View style={[styles.leafLine, styles.leafLineBottom, { backgroundColor: accent }]} />
      <View style={[styles.thread, { backgroundColor: color }]} />
      <View style={[styles.threadDot, { backgroundColor: color }]} />
    </View>
  );
}

function OmGlyphIcon({
  color,
  accent,
  fontFamily,
}: IconPaint & { fontFamily: string }) {
  return (
    <View style={styles.omWrap}>
      <Text style={[styles.omText, { color, fontFamily }]}>ॐ</Text>
      <View style={[styles.omRule, { backgroundColor: accent }]} />
    </View>
  );
}

function MalaIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.malaWrap}>
      <View style={[styles.bead, styles.beadOne, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadTwo, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadThree, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadFour, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadFive, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadSix, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadSeven, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadEight, { borderColor: color }]} />
      <View style={[styles.malaThread, { backgroundColor: accent }]} />
      <View style={[styles.tasselKnot, { backgroundColor: color }]} />
      <View style={[styles.tasselCord, { backgroundColor: color }]} />
    </View>
  );
}

function JapamBeadIcon({
  color,
  accent,
  fontFamily,
}: IconPaint & { fontFamily: string }) {
  return (
    <View style={styles.japamWrap}>
      <View style={[styles.japamChantA, { backgroundColor: accent }]} />
      <View style={[styles.japamChantB, { backgroundColor: accent }]} />
      <View style={[styles.japamChantC, { backgroundColor: accent }]} />
      <View style={[styles.japamBead, { borderColor: color }]}>
        <Text style={[styles.japamOm, { color, fontFamily }]}>ॐ</Text>
      </View>
      <View style={[styles.japamCord, { backgroundColor: color }]} />
      <View style={[styles.japamTassel, { backgroundColor: color }]} />
    </View>
  );
}

function TempleIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.templeWrap}>
      <View style={[styles.templeFlagPole, { backgroundColor: color }]} />
      <View style={[styles.templeFlag, { borderLeftColor: accent }]} />
      <View style={[styles.templeHalo, { borderColor: accent }]} />
      <View style={[styles.templeRoof, { borderBottomColor: color }]} />
      <View style={[styles.templeCap, { backgroundColor: color }]} />
      <View style={styles.pillarRow}>
        <View style={[styles.pillar, { backgroundColor: color }]} />
        <View style={[styles.pillar, { backgroundColor: color }]} />
        <View style={[styles.pillar, { backgroundColor: color }]} />
      </View>
      <View style={[styles.templeBase, { backgroundColor: color }]} />
      <View style={[styles.templeStep, { backgroundColor: accent }]} />
    </View>
  );
}

function DiyaIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.diyaWrap}>
      <View style={[styles.flameOuter, { backgroundColor: accent }]} />
      <View style={[styles.flameInner, { backgroundColor: color }]} />
      <View style={[styles.diyaBowl, { borderColor: color }]} />
      <View style={[styles.diyaLip, { backgroundColor: color }]} />
    </View>
  );
}

function TanpuraIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.tanpuraWrap}>
      <View style={[styles.tanpuraNeck, { backgroundColor: color }]} />
      <View style={[styles.tanpuraString, { backgroundColor: accent }]} />
      <View style={[styles.tanpuraPegLeft, { backgroundColor: color }]} />
      <View style={[styles.tanpuraPegRight, { backgroundColor: color }]} />
      <View style={[styles.tanpuraBridge, { backgroundColor: color }]} />
      <View style={[styles.tanpuraResonator, { borderColor: color }]} />
      <View style={[styles.tanpuraResonatorDot, { backgroundColor: accent }]} />
    </View>
  );
}

function VedaManuscriptIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.vedaWrap}>
      <View style={[styles.vedaLeaf, styles.vedaLeafTop, { borderColor: color }]} />
      <View style={[styles.vedaLeaf, styles.vedaLeafMid, { borderColor: color }]} />
      <View style={[styles.vedaLeaf, styles.vedaLeafBottom, { borderColor: color }]} />
      <View style={[styles.vedaLine, styles.vedaLineOne, { backgroundColor: accent }]} />
      <View style={[styles.vedaLine, styles.vedaLineTwo, { backgroundColor: accent }]} />
      <View style={[styles.vedaBand, { backgroundColor: color }]} />
      <View style={[styles.vedaKnot, { borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manuscriptWrap: {
    width: 34,
    height: 26,
    position: 'relative',
  },
  leaf: {
    position: 'absolute',
    left: 3,
    width: 28,
    height: 8,
    borderWidth: 1.4,
    borderRadius: 5,
  },
  leafTop: {
    top: 4,
  },
  leafBottom: {
    top: 14,
  },
  leafLine: {
    position: 'absolute',
    left: 10,
    width: 14,
    height: 1,
    borderRadius: 1,
  },
  leafLineTop: {
    top: 8,
  },
  leafLineBottom: {
    top: 18,
  },
  thread: {
    position: 'absolute',
    left: 16,
    top: 2,
    width: 2,
    height: 23,
    borderRadius: 1,
  },
  threadDot: {
    position: 'absolute',
    left: 14,
    top: 11,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  omWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  omText: {
    fontSize: 25,
    lineHeight: 30,
    includeFontPadding: false,
    textAlign: 'center',
    transform: [{ translateY: 1 }],
  },
  omRule: {
    width: 15,
    height: 1.3,
    borderRadius: 1,
    opacity: 0.75,
    transform: [{ translateY: -1 }],
  },
  malaWrap: {
    width: 34,
    height: 32,
    position: 'relative',
  },
  bead: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.4,
  },
  beadOne: {
    left: 5,
    top: 4,
  },
  beadTwo: {
    left: 2,
    top: 12,
  },
  beadThree: {
    left: 5,
    top: 20,
  },
  beadFour: {
    left: 14,
    top: 23,
  },
  beadFive: {
    right: 5,
    top: 20,
  },
  beadSix: {
    right: 2,
    top: 12,
  },
  beadSeven: {
    right: 5,
    top: 4,
  },
  beadEight: {
    left: 14,
    top: 1,
  },
  malaThread: {
    position: 'absolute',
    left: 16,
    top: 7,
    width: 1.2,
    height: 16,
    borderRadius: 1,
    opacity: 0.7,
  },
  tasselKnot: {
    position: 'absolute',
    left: 15,
    top: 15,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tasselCord: {
    position: 'absolute',
    left: 16.4,
    top: 18,
    width: 1.2,
    height: 11,
    borderRadius: 1,
  },
  japamWrap: {
    width: 32,
    height: 34,
    position: 'relative',
    alignItems: 'center',
  },
  japamChantA: {
    position: 'absolute',
    top: 1,
    left: 8,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.8,
  },
  japamChantB: {
    position: 'absolute',
    top: 0,
    left: 14.5,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.9,
  },
  japamChantC: {
    position: 'absolute',
    top: 1,
    right: 8,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.8,
  },
  japamBead: {
    position: 'absolute',
    top: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  japamOm: {
    fontSize: 13,
    lineHeight: 16,
    includeFontPadding: false,
    transform: [{ translateY: 1 }],
  },
  japamCord: {
    position: 'absolute',
    bottom: 3,
    width: 1.4,
    height: 4,
    borderRadius: 1,
  },
  japamTassel: {
    position: 'absolute',
    bottom: 0,
    width: 6,
    height: 3,
    borderRadius: 2,
  },
  templeWrap: {
    width: 34,
    height: 32,
    position: 'relative',
    alignItems: 'center',
  },
  templeHalo: {
    position: 'absolute',
    top: 1,
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.2,
    opacity: 0.45,
  },
  templeFlagPole: {
    position: 'absolute',
    left: 17,
    top: 0,
    width: 1.4,
    height: 8,
    borderRadius: 1,
  },
  templeFlag: {
    position: 'absolute',
    left: 18,
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 2.5,
    borderBottomWidth: 2.5,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  templeRoof: {
    position: 'absolute',
    top: 7,
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  templeCap: {
    position: 'absolute',
    top: 5,
    width: 6,
    height: 3,
    borderRadius: 2,
  },
  pillarRow: {
    position: 'absolute',
    top: 16,
    width: 24,
    height: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillar: {
    width: 4,
    height: 9,
    borderRadius: 2,
  },
  templeBase: {
    position: 'absolute',
    bottom: 5,
    width: 28,
    height: 3,
    borderRadius: 2,
  },
  templeStep: {
    position: 'absolute',
    bottom: 1,
    width: 22,
    height: 2,
    borderRadius: 1,
    opacity: 0.85,
  },
  diyaWrap: {
    width: 34,
    height: 32,
    position: 'relative',
    alignItems: 'center',
  },
  flameOuter: {
    position: 'absolute',
    top: 2,
    width: 10,
    height: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 2,
    transform: [{ rotate: '20deg' }],
  },
  flameInner: {
    position: 'absolute',
    top: 7,
    width: 5,
    height: 8,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 1,
    transform: [{ rotate: '20deg' }],
  },
  diyaBowl: {
    position: 'absolute',
    bottom: 4,
    width: 27,
    height: 12,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  diyaLip: {
    position: 'absolute',
    bottom: 14,
    width: 29,
    height: 2,
    borderRadius: 1,
  },
  tanpuraWrap: {
    width: 32,
    height: 34,
    position: 'relative',
    alignItems: 'center',
  },
  tanpuraNeck: {
    position: 'absolute',
    top: 2,
    width: 3,
    height: 22,
    borderRadius: 2,
  },
  tanpuraString: {
    position: 'absolute',
    top: 3,
    width: 1,
    height: 25,
    borderRadius: 1,
    opacity: 0.85,
  },
  tanpuraPegLeft: {
    position: 'absolute',
    top: 7,
    left: 9,
    width: 8,
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: '-18deg' }],
  },
  tanpuraPegRight: {
    position: 'absolute',
    top: 11,
    right: 9,
    width: 8,
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: '18deg' }],
  },
  tanpuraBridge: {
    position: 'absolute',
    bottom: 10,
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  tanpuraResonator: {
    position: 'absolute',
    bottom: 2,
    width: 18,
    height: 14,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  tanpuraResonatorDot: {
    position: 'absolute',
    bottom: 7,
    width: 5,
    height: 5,
    borderRadius: 3,
    opacity: 0.85,
  },
  vedaWrap: {
    width: 34,
    height: 28,
    position: 'relative',
  },
  vedaLeaf: {
    position: 'absolute',
    left: 2,
    width: 30,
    height: 7,
    borderWidth: 1.2,
    borderRadius: 5,
  },
  vedaLeafTop: {
    top: 3,
  },
  vedaLeafMid: {
    top: 10,
  },
  vedaLeafBottom: {
    top: 17,
  },
  vedaLine: {
    position: 'absolute',
    left: 8,
    height: 1,
    borderRadius: 1,
  },
  vedaLineOne: {
    top: 13,
    width: 18,
  },
  vedaLineTwo: {
    top: 20,
    width: 14,
  },
  vedaBand: {
    position: 'absolute',
    right: 8,
    top: 1,
    width: 2,
    height: 25,
    borderRadius: 1,
  },
  vedaKnot: {
    position: 'absolute',
    right: 5,
    top: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.4,
  },
});
