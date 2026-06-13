import React from 'react';
import { StyleSheet, View } from 'react-native';
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
      {iconKey === 'stotram' && <OmGlyphIcon {...paint} />}
      {iconKey === 'chalisa' && <MalaIcon {...paint} />}
      {iconKey === 'japam' && (
        <JapamBeadIcon {...paint} fontFamily={typography.thumb.fontFamily} />
      )}
      {iconKey === 'deity' && <TempleIcon {...paint} />}
      {iconKey === 'aarti' && <DiyaIcon {...paint} />}
      {iconKey === 'theerth' && <ShikharaIcon {...paint} />}
    </View>
  );
}

function ShikharaIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.shikharaWrap}>
      <View style={[styles.shikharaFlagPole, { backgroundColor: color }]} />
      <View style={[styles.shikharaFlag, { borderLeftColor: accent }]} />
      <View style={[styles.shikharaPeak, { borderBottomColor: color }]} />
      <View style={[styles.shikharaPeakInner, { borderBottomColor: accent }]} />
      <View style={[styles.shikharaBase, { backgroundColor: color }]} />
      <View style={[styles.shikharaStep, { backgroundColor: accent }]} />
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

function OmGlyphIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.omWrap}>
      {/* Main body curve */}
      <View style={[styles.omBody, { borderColor: color }]} />
      {/* Upper hook / tail */}
      <View style={[styles.omTail, { borderColor: color }]} />
      {/* Crescent */}
      <View style={[styles.omCrescent, { borderColor: color }]} />
      {/* Bindu dot */}
      <View style={[styles.omDot, { backgroundColor: color }]} />
      {/* Decorative underline */}
      <View style={[styles.omRule, { backgroundColor: accent }]} />
    </View>
  );
}

function MalaIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.malaWrap}>
      <View style={[styles.malaThread, { backgroundColor: accent }]} />
      <View style={[styles.bead, styles.beadOne, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadTwo, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadThree, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadFour, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadFive, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadSix, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadSeven, { borderColor: color }]} />
      <View style={[styles.bead, styles.beadEight, { borderColor: color }]} />
      <View style={[styles.tasselKnot, { backgroundColor: color }]} />
      <View style={[styles.tasselCord, { backgroundColor: color }]} />
      <View style={[styles.tasselEnd, { backgroundColor: color }]} />
    </View>
  );
}

function JapamBeadIcon({ color, accent }: IconPaint & { fontFamily: string }) {
  return (
    <View style={styles.japamWrap}>
      <View style={[styles.japamChantA, { backgroundColor: accent }]} />
      <View style={[styles.japamChantB, { backgroundColor: accent }]} />
      <View style={[styles.japamChantC, { backgroundColor: accent }]} />
      <View style={[styles.japamCounter, { borderColor: color }]}>
        <View style={[styles.japamWindow, { backgroundColor: accent }]} />
        <View style={styles.japamBeadRow}>
          <View style={[styles.japamBead, { borderColor: color }]} />
          <View style={[styles.japamBead, { borderColor: color }]} />
          <View style={[styles.japamBead, { borderColor: color }]} />
        </View>
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
      <View style={[styles.tanpuraHead, { backgroundColor: color }]} />
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
      <View style={[styles.vedaPage, styles.vedaPageBack, { borderColor: accent }]} />
      <View style={[styles.vedaPage, styles.vedaPageFront, { borderColor: color }]} />
      <View style={[styles.vedaSpine, { backgroundColor: color }]} />
      <View style={[styles.vedaRule, styles.vedaRuleTop, { backgroundColor: accent }]} />
      <View style={[styles.vedaRule, styles.vedaRuleBottom, { backgroundColor: accent }]} />
      <View style={[styles.vedaSeal, { borderColor: color }]} />
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
    width: 36,
    height: 28,
    position: 'relative',
  },
  leaf: {
    position: 'absolute',
    left: 2,
    width: 32,
    height: 9,
    borderWidth: 1.8,
    borderRadius: 5,
  },
  leafTop: {
    top: 3,
  },
  leafBottom: {
    top: 14,
  },
  leafLine: {
    position: 'absolute',
    left: 9,
    width: 18,
    height: 1.5,
    borderRadius: 1,
  },
  leafLineTop: {
    top: 7,
  },
  leafLineBottom: {
    top: 18,
  },
  thread: {
    position: 'absolute',
    left: 16.5,
    top: 1,
    width: 2.4,
    height: 26,
    borderRadius: 1,
  },
  threadDot: {
    position: 'absolute',
    left: 13.8,
    top: 10.5,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  omWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  omBody: {
    position: 'absolute',
    bottom: 6,
    width: 18,
    height: 14,
    borderWidth: 2,
    borderRadius: 9,
    borderTopWidth: 2,
    borderRightWidth: 0.5,
  },
  omTail: {
    position: 'absolute',
    top: 4,
    right: 5,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderRadius: 5,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  omCrescent: {
    position: 'absolute',
    top: 2,
    right: 7,
    width: 8,
    height: 5,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderRadius: 4,
  },
  omDot: {
    position: 'absolute',
    top: 1,
    right: 9,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  omRule: {
    position: 'absolute',
    bottom: 2,
    width: 16,
    height: 1.6,
    borderRadius: 1,
    opacity: 0.75,
  },
  malaWrap: {
    width: 36,
    height: 32,
    position: 'relative',
  },
  bead: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.7,
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
    left: 14.5,
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
    left: 14.5,
    top: 1,
  },
  malaThread: {
    position: 'absolute',
    left: 17,
    top: 7,
    width: 1.6,
    height: 17,
    borderRadius: 1,
    opacity: 0.65,
  },
  tasselKnot: {
    position: 'absolute',
    left: 15.5,
    top: 15,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  tasselCord: {
    position: 'absolute',
    left: 17.2,
    top: 19,
    width: 1.6,
    height: 9,
    borderRadius: 1,
  },
  tasselEnd: {
    position: 'absolute',
    left: 14,
    bottom: 0,
    width: 8,
    height: 3,
    borderRadius: 2,
  },
  japamWrap: {
    width: 34,
    height: 32,
    position: 'relative',
    alignItems: 'center',
  },
  japamChantA: {
    position: 'absolute',
    top: 0,
    left: 9,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.8,
  },
  japamChantB: {
    position: 'absolute',
    top: 0,
    left: 15.5,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.9,
  },
  japamChantC: {
    position: 'absolute',
    top: 0,
    right: 9,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.8,
  },
  japamCounter: {
    position: 'absolute',
    top: 6,
    width: 23,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  japamWindow: {
    width: 11,
    height: 3,
    borderRadius: 2,
    marginBottom: 3,
    opacity: 0.8,
  },
  japamBeadRow: {
    flexDirection: 'row',
    gap: 2,
  },
  japamBead: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1.3,
  },
  japamCord: {
    position: 'absolute',
    bottom: 3,
    width: 1.6,
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
  templeFlagPole: {
    position: 'absolute',
    left: 17,
    top: 1,
    width: 1.6,
    height: 7,
    borderRadius: 1,
  },
  templeFlag: {
    position: 'absolute',
    left: 18.5,
    top: 1,
    width: 0,
    height: 0,
    borderTopWidth: 2.4,
    borderBottomWidth: 2.4,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  templeRoof: {
    position: 'absolute',
    top: 8,
    width: 0,
    height: 0,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  templeCap: {
    position: 'absolute',
    top: 6,
    width: 7,
    height: 3,
    borderRadius: 2,
  },
  pillarRow: {
    position: 'absolute',
    top: 17,
    width: 23,
    height: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pillar: {
    width: 4.5,
    height: 8,
    borderRadius: 2,
  },
  templeBase: {
    position: 'absolute',
    bottom: 5,
    width: 29,
    height: 3.4,
    borderRadius: 2,
  },
  templeStep: {
    position: 'absolute',
    bottom: 1,
    width: 24,
    height: 2.4,
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
    top: 3,
    width: 11,
    height: 11,
    borderTopLeftRadius: 5.5,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 5.5,
    borderBottomRightRadius: 5.5,
    transform: [{ rotate: '-45deg' }],
  },
  flameInner: {
    position: 'absolute',
    top: 7,
    width: 5,
    height: 5,
    borderTopLeftRadius: 2.5,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 2.5,
    borderBottomRightRadius: 2.5,
    transform: [{ rotate: '-45deg' }],
  },
  diyaBowl: {
    position: 'absolute',
    bottom: 3,
    width: 31,
    height: 13,
    borderWidth: 1.8,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  diyaLip: {
    position: 'absolute',
    bottom: 15,
    width: 32,
    height: 2.4,
    borderRadius: 1,
  },
  tanpuraWrap: {
    width: 34,
    height: 32,
    position: 'relative',
    alignItems: 'center',
  },
  tanpuraHead: {
    position: 'absolute',
    top: 2,
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  tanpuraNeck: {
    position: 'absolute',
    top: 5,
    width: 3,
    height: 19,
    borderRadius: 2,
  },
  tanpuraString: {
    position: 'absolute',
    top: 5,
    width: 1,
    height: 23,
    borderRadius: 1,
    opacity: 0.85,
  },
  tanpuraPegLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 9,
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: '-18deg' }],
  },
  tanpuraPegRight: {
    position: 'absolute',
    top: 12,
    right: 8,
    width: 9,
    height: 3,
    borderRadius: 2,
    transform: [{ rotate: '18deg' }],
  },
  tanpuraBridge: {
    position: 'absolute',
    bottom: 9,
    width: 12,
    height: 2.2,
    borderRadius: 1,
  },
  tanpuraResonator: {
    position: 'absolute',
    bottom: 1,
    width: 22,
    height: 15,
    borderRadius: 12,
    borderWidth: 1.8,
  },
  tanpuraResonatorDot: {
    position: 'absolute',
    bottom: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.85,
  },
  vedaWrap: {
    width: 34,
    height: 30,
    position: 'relative',
  },
  vedaPage: {
    position: 'absolute',
    width: 25,
    height: 22,
    borderWidth: 1.7,
    borderRadius: 3,
  },
  vedaPageBack: {
    left: 6,
    top: 3,
    opacity: 0.55,
  },
  vedaPageFront: {
    left: 3,
    top: 6,
  },
  vedaSpine: {
    position: 'absolute',
    left: 8,
    top: 7,
    width: 2.4,
    height: 20,
    borderRadius: 1,
  },
  vedaRule: {
    position: 'absolute',
    left: 14,
    height: 1.5,
    borderRadius: 1,
  },
  vedaRuleTop: {
    top: 13,
    width: 13,
  },
  vedaRuleBottom: {
    top: 19,
    width: 10,
  },
  vedaSeal: {
    position: 'absolute',
    right: 5,
    bottom: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  shikharaWrap: {
    width: 34,
    height: 32,
    position: 'relative',
    alignItems: 'center',
  },
  shikharaFlagPole: {
    position: 'absolute',
    top: 0,
    width: 1.5,
    height: 6,
    borderRadius: 1,
  },
  shikharaFlag: {
    position: 'absolute',
    top: 0,
    left: 18,
    width: 0,
    height: 0,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 5,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  shikharaPeak: {
    position: 'absolute',
    top: 5,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },
  shikharaPeakInner: {
    position: 'absolute',
    top: 11,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
    opacity: 0.7,
  },
  shikharaBase: {
    position: 'absolute',
    bottom: 4,
    width: 28,
    height: 3,
    borderRadius: 1.5,
  },
  shikharaStep: {
    position: 'absolute',
    bottom: 0,
    width: 22,
    height: 2.5,
    borderRadius: 1,
    opacity: 0.85,
  },
});
