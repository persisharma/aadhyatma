import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ContentCategory } from '@/data/texts';
import { useTheme } from '@/theme/ThemeContext';
import LotusMark from '@/components/LotusMark';

export type PurposeIconKey =
  | 'purpose-protection'
  | 'purpose-obstacles'
  | 'purpose-courage'
  | 'purpose-peace'
  | 'purpose-insight'
  | 'purpose-devotion'
  | 'purpose-wealth'
  | 'purpose-prosperity'
  | 'purpose-health'
  | 'purpose-victory'
  | 'purpose-moksha'
  | 'purpose-auspicious'
  | 'purpose-family'
  | 'purpose-morning';

type PurposeIconKind = PurposeIconKey extends `purpose-${infer Kind}` ? Kind : never;

export type CategoryIconKey = ContentCategory | 'deity' | 'vrat' | 'purpose' | 'insight' | 'routine' | PurposeIconKey;

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
  const purposeKind = getPurposeIconKind(iconKey);

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
      {iconKey === 'sanskar' && <VedaManuscriptIcon {...paint} />}
      {iconKey === 'kavacham' && <KavachIcon {...paint} />}
      {iconKey === 'ashtakam' && <AshtakamIcon {...paint} />}
      {iconKey === 'suktam' && <SuktamIcon {...paint} />}
      {iconKey === 'vrat' && <KalashIcon {...paint} />}
      {iconKey === 'purpose' && <PurposeIcon {...paint} />}
      {iconKey === 'insight' && <InsightIcon {...paint} />}
      {/* नित्य साधना launcher tile — reuse the routine's completed-bloom mark. */}
      {iconKey === 'routine' && <LotusMark size={30} />}
      {purposeKind && <PurposeTileIcon kind={purposeKind} {...paint} />}
    </View>
  );
}

function getPurposeIconKind(iconKey: CategoryIconKey): PurposeIconKind | null {
  return iconKey.startsWith('purpose-')
    ? (iconKey.slice('purpose-'.length) as PurposeIconKind)
    : null;
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

function KalashIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.kalashWrap}>
      <View testID="category-icon-vrat-coconut" style={[styles.kalashCoconut, { borderColor: color }]}>
        <View style={[styles.kalashCoconutMark, { backgroundColor: color }]} />
      </View>
      <View
        testID="category-icon-vrat-left-leaf"
        style={[styles.kalashLeaf, styles.kalashLeafLeft, { borderColor: accent }]}
      />
      <View style={[styles.kalashLeaf, styles.kalashLeafRight, { borderColor: accent }]} />
      <View style={[styles.kalashNeck, { backgroundColor: color }]} />
      <View testID="category-icon-vrat-pot" style={[styles.kalashPot, { borderColor: color }]} />
      <View testID="category-icon-vrat-band" style={[styles.kalashBand, { backgroundColor: accent }]} />
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

// Kavacham (कवच) — a devotional "armour" text. Icon is a protective crest with
// a central tilak-like spine, in the same outline-stroke idiom as CategoryIcons.
function KavachIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.kavachWrap}>
      <View testID="category-icon-kavach-shield" style={[styles.kavachShield, { borderColor: color }]} />
      <View testID="category-icon-kavach-spine" style={[styles.kavachSpine, { backgroundColor: accent }]} />
      <View testID="category-icon-kavach-crossbar" style={[styles.kavachCrossbar, { backgroundColor: accent }]} />
      <View testID="category-icon-kavach-arc" style={[styles.kavachArc, { borderColor: color }]} />
      <View testID="category-icon-kavach-bindu" style={[styles.kavachBindu, { backgroundColor: color }]} />
    </View>
  );
}

// Ashtakam (अष्टकम् · "eight") — two overlapping squares form an eight-point
// star (aṣṭadala), echoing the eight-verse form, in the outline-stroke idiom.
function AshtakamIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.ashtakamWrap}>
      <View style={[styles.ashtakamSquare, { borderColor: color }]} />
      <View style={[styles.ashtakamSquareRot, { borderColor: accent }]} />
    </View>
  );
}

// Suktam (सूक्तम् · Vedic/Puranic hymn) — paired palm-leaf manuscript lines
// give the category a sacred-text silhouette instead of a generic text glyph.
function SuktamIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.suktamWrap}>
      <View testID="category-icon-suktam-bindu" style={[styles.suktamBindu, { backgroundColor: color }]} />
      <View
        testID="category-icon-suktam-leaf-top"
        style={[styles.suktamLeaf, styles.suktamLeafTop, { borderColor: color }]}
      />
      <View
        testID="category-icon-suktam-leaf-bottom"
        style={[styles.suktamLeaf, styles.suktamLeafBottom, { borderColor: color }]}
      />
      <View
        testID="category-icon-suktam-rule-top"
        style={[styles.suktamRule, styles.suktamRuleTop, { backgroundColor: accent }]}
      />
      <View style={[styles.suktamRule, styles.suktamRuleBottom, { backgroundColor: accent }]} />
      <View style={[styles.suktamKnot, { backgroundColor: accent }]} />
    </View>
  );
}

// Purpose (उद्देश्य) — a compass/intent marker: direction without implying
// protection, temple, or a specific practice category.
function PurposeIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.purposeWrap}>
      <View testID="category-icon-purpose-ring" style={[styles.purposeRing, { borderColor: color }]} />
      <View testID="category-icon-purpose-arrow" style={[styles.purposeArrow, { borderBottomColor: accent }]} />
      <View style={[styles.purposeStem, { backgroundColor: color }]} />
      <View testID="category-icon-purpose-bindu" style={[styles.purposeBindu, { backgroundColor: color }]} />
    </View>
  );
}

// Insight (अन्तर्दृष्टि) — an inner-seeing eye with a small rising ray, used
// for knowledge/understanding rather than reusing the generic Books glyph.
function InsightIcon({ color, accent }: IconPaint) {
  return (
    <View style={styles.insightWrap}>
      <View testID="category-icon-insight-eye" style={[styles.insightEye, { borderColor: color }]} />
      <View testID="category-icon-insight-pupil" style={[styles.insightPupil, { backgroundColor: accent }]} />
      <View testID="category-icon-insight-ray" style={[styles.insightRay, { backgroundColor: color }]} />
      <View style={[styles.insightRayLeft, { backgroundColor: color }]} />
      <View style={[styles.insightRayRight, { backgroundColor: color }]} />
    </View>
  );
}

function PurposeTileIcon({ kind, color, accent }: IconPaint & { kind: PurposeIconKind }) {
  const testID = `category-icon-purpose-${kind}`;

  if (kind === 'insight') {
    return (
      <View testID={testID} style={styles.purposeTileWrap}>
        <InsightIcon color={color} accent={accent} />
      </View>
    );
  }

  return (
    <View testID={testID} style={styles.purposeTileWrap}>
      {kind === 'protection' && (
        <>
          <View style={[styles.purposeShield, { borderColor: color }]} />
          <View style={[styles.purposeCenterDot, { backgroundColor: accent }]} />
          <View style={[styles.purposeShortRule, { backgroundColor: accent }]} />
        </>
      )}
      {kind === 'obstacles' && (
        <>
          <View style={[styles.purposeMountainLarge, { borderBottomColor: color }]} />
          <View style={[styles.purposeMountainSmall, { borderBottomColor: accent }]} />
          <View style={[styles.purposePath, { borderColor: color }]} />
        </>
      )}
      {kind === 'courage' && (
        <>
          <View style={[styles.purposeFlagPole, { backgroundColor: color }]} />
          <View style={[styles.purposeFlag, { borderLeftColor: accent }]} />
          <View style={[styles.purposeBaseRule, { backgroundColor: color }]} />
        </>
      )}
      {kind === 'peace' && (
        <>
          <View style={[styles.purposePeaceRing, { borderColor: color }]} />
          <View style={[styles.purposePeaceLine, { backgroundColor: accent }]} />
          <View style={[styles.purposeCenterDot, { backgroundColor: color }]} />
        </>
      )}
      {kind === 'devotion' && (
        <>
          <View style={[styles.purposeDevotionFlameOuter, { backgroundColor: accent }]} />
          <View style={[styles.purposeDevotionFlameInner, { backgroundColor: color }]} />
          <View style={[styles.purposeBowl, { borderColor: color }]} />
        </>
      )}
      {kind === 'wealth' && (
        <>
          <View style={[styles.purposeCoinTop, { borderColor: accent }]} />
          <View style={[styles.purposeCoinMid, { borderColor: color }]} />
          <View style={[styles.purposeCoinBottom, { borderColor: color }]} />
        </>
      )}
      {kind === 'prosperity' && (
        <>
          <View style={[styles.purposeStemTall, { backgroundColor: color }]} />
          <View style={[styles.purposeLeafLeft, { borderColor: accent }]} />
          <View style={[styles.purposeLeafRight, { borderColor: accent }]} />
          <View style={[styles.purposeBaseRule, { backgroundColor: color }]} />
        </>
      )}
      {kind === 'health' && (
        <>
          <View style={[styles.purposeHealthRing, { borderColor: color }]} />
          <View style={[styles.purposeHealthVertical, { backgroundColor: accent }]} />
          <View style={[styles.purposeHealthHorizontal, { backgroundColor: accent }]} />
        </>
      )}
      {kind === 'victory' && (
        <>
          <View style={[styles.purposeVictoryCup, { borderColor: color }]} />
          <View style={[styles.purposeVictoryStem, { backgroundColor: color }]} />
          <View style={[styles.purposeVictoryFlag, { borderLeftColor: accent }]} />
          <View style={[styles.purposeBaseRule, { backgroundColor: color }]} />
        </>
      )}
      {kind === 'moksha' && (
        <>
          <View style={[styles.purposeArch, { borderColor: color }]} />
          <View style={[styles.purposeRisingDot, { backgroundColor: accent }]} />
          <View style={[styles.purposeRay, { backgroundColor: color }]} />
        </>
      )}
      {kind === 'auspicious' && (
        <>
          <View style={[styles.purposeTilakDrop, { backgroundColor: accent }]} />
          <View style={[styles.purposeTilakStem, { backgroundColor: color }]} />
          <View style={[styles.purposeSideRayLeft, { backgroundColor: color }]} />
          <View style={[styles.purposeSideRayRight, { backgroundColor: color }]} />
        </>
      )}
      {kind === 'family' && (
        <>
          <View style={[styles.purposeHomeRoof, { borderBottomColor: color }]} />
          <View style={[styles.purposeHomeBase, { borderColor: color }]} />
          <View style={[styles.purposeFamilyDotLeft, { backgroundColor: accent }]} />
          <View style={[styles.purposeFamilyDotRight, { backgroundColor: accent }]} />
        </>
      )}
      {kind === 'morning' && (
        <>
          <View style={[styles.purposeSunRise, { borderColor: accent }]} />
          <View style={[styles.purposeHorizon, { backgroundColor: color }]} />
          <View style={[styles.purposeMorningRay, { backgroundColor: color }]} />
          <View style={[styles.purposeMorningRayLeft, { backgroundColor: color }]} />
          <View style={[styles.purposeMorningRayRight, { backgroundColor: color }]} />
        </>
      )}
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
  purposeTileWrap: {
    width: 34,
    height: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeShield: {
    width: 23,
    height: 27,
    borderWidth: 2,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  purposeCenterDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  purposeShortRule: {
    position: 'absolute',
    top: 19,
    width: 12,
    height: 2,
    borderRadius: 1,
  },
  purposeMountainLarge: {
    position: 'absolute',
    bottom: 8,
    left: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 17,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  purposeMountainSmall: {
    position: 'absolute',
    bottom: 8,
    right: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 13,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  purposePath: {
    position: 'absolute',
    bottom: 2,
    width: 20,
    height: 8,
    borderBottomWidth: 2,
    borderRadius: 10,
  },
  purposeFlagPole: {
    position: 'absolute',
    left: 14,
    top: 6,
    width: 2,
    height: 19,
    borderRadius: 1,
  },
  purposeFlag: {
    position: 'absolute',
    left: 16,
    top: 7,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  purposeBaseRule: {
    position: 'absolute',
    bottom: 4,
    width: 22,
    height: 3,
    borderRadius: 2,
  },
  purposePeaceRing: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 12,
  },
  purposePeaceLine: {
    position: 'absolute',
    width: 18,
    height: 2,
    borderRadius: 1,
  },
  purposeDevotionFlameOuter: {
    position: 'absolute',
    top: 2,
    width: 13,
    height: 18,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 9,
    borderBottomRightRadius: 9,
    transform: [{ rotate: '42deg' }],
  },
  purposeDevotionFlameInner: {
    position: 'absolute',
    top: 8,
    width: 7,
    height: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    transform: [{ rotate: '42deg' }],
  },
  purposeBowl: {
    position: 'absolute',
    bottom: 4,
    width: 24,
    height: 12,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  purposeCoinTop: {
    position: 'absolute',
    top: 6,
    width: 18,
    height: 8,
    borderWidth: 2,
    borderRadius: 9,
  },
  purposeCoinMid: {
    position: 'absolute',
    top: 13,
    width: 24,
    height: 8,
    borderWidth: 2,
    borderRadius: 10,
  },
  purposeCoinBottom: {
    position: 'absolute',
    top: 20,
    width: 28,
    height: 8,
    borderWidth: 2,
    borderRadius: 10,
  },
  purposeStemTall: {
    position: 'absolute',
    bottom: 5,
    width: 2,
    height: 19,
    borderRadius: 1,
  },
  purposeLeafLeft: {
    position: 'absolute',
    top: 8,
    left: 7,
    width: 13,
    height: 9,
    borderWidth: 2,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    transform: [{ rotate: '-20deg' }],
  },
  purposeLeafRight: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 13,
    height: 9,
    borderWidth: 2,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    transform: [{ rotate: '20deg' }],
  },
  purposeHealthRing: {
    width: 25,
    height: 25,
    borderWidth: 2,
    borderRadius: 13,
  },
  purposeHealthVertical: {
    position: 'absolute',
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  purposeHealthHorizontal: {
    position: 'absolute',
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  purposeVictoryCup: {
    position: 'absolute',
    top: 8,
    width: 24,
    height: 13,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
  },
  purposeVictoryStem: {
    position: 'absolute',
    bottom: 6,
    width: 3,
    height: 8,
    borderRadius: 1.5,
  },
  purposeVictoryFlag: {
    position: 'absolute',
    top: 2,
    right: 9,
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  purposeArch: {
    position: 'absolute',
    bottom: 4,
    width: 24,
    height: 25,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  purposeRisingDot: {
    position: 'absolute',
    top: 7,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  purposeRay: {
    position: 'absolute',
    top: 2,
    width: 2,
    height: 8,
    borderRadius: 1,
  },
  purposeTilakDrop: {
    position: 'absolute',
    top: 4,
    width: 12,
    height: 16,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  purposeTilakStem: {
    position: 'absolute',
    bottom: 5,
    width: 3,
    height: 12,
    borderRadius: 2,
  },
  purposeSideRayLeft: {
    position: 'absolute',
    top: 13,
    left: 5,
    width: 7,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-20deg' }],
  },
  purposeSideRayRight: {
    position: 'absolute',
    top: 13,
    right: 5,
    width: 7,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '20deg' }],
  },
  purposeHomeRoof: {
    position: 'absolute',
    top: 5,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 11,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  purposeHomeBase: {
    position: 'absolute',
    bottom: 5,
    width: 22,
    height: 14,
    borderWidth: 2,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  purposeFamilyDotLeft: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  purposeFamilyDotRight: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  purposeSunRise: {
    position: 'absolute',
    bottom: 7,
    width: 22,
    height: 22,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  purposeHorizon: {
    position: 'absolute',
    bottom: 7,
    width: 28,
    height: 3,
    borderRadius: 2,
  },
  purposeMorningRay: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 6,
    borderRadius: 1,
  },
  purposeMorningRayLeft: {
    position: 'absolute',
    top: 4,
    left: 7,
    width: 2,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '-35deg' }],
  },
  purposeMorningRayRight: {
    position: 'absolute',
    top: 4,
    right: 7,
    width: 2,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '35deg' }],
  },
  purposeWrap: {
    width: 32,
    height: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purposeRing: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 12,
  },
  purposeArrow: {
    position: 'absolute',
    top: 5,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '42deg' }],
  },
  purposeStem: {
    position: 'absolute',
    width: 2,
    height: 13,
    borderRadius: 1,
    transform: [{ rotate: '42deg' }],
  },
  purposeBindu: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  insightWrap: {
    width: 32,
    height: 32,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightEye: {
    width: 27,
    height: 15,
    borderWidth: 2,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    transform: [{ scaleY: 0.78 }],
  },
  insightPupil: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  insightRay: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 7,
    borderRadius: 1,
  },
  insightRayLeft: {
    position: 'absolute',
    top: 3,
    left: 8,
    width: 2,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '-34deg' }],
  },
  insightRayRight: {
    position: 'absolute',
    top: 3,
    right: 8,
    width: 2,
    height: 6,
    borderRadius: 1,
    transform: [{ rotate: '34deg' }],
  },
  suktamWrap: {
    width: 34,
    height: 32,
    position: 'relative',
  },
  suktamBindu: {
    position: 'absolute',
    top: 0,
    left: 15,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  suktamLeaf: {
    position: 'absolute',
    left: 2,
    width: 30,
    height: 8,
    borderWidth: 1.8,
    borderRadius: 5,
  },
  suktamLeafTop: {
    top: 7,
  },
  suktamLeafBottom: {
    top: 18,
  },
  suktamRule: {
    position: 'absolute',
    left: 9,
    width: 16,
    height: 1.6,
    borderRadius: 1,
  },
  suktamRuleTop: {
    top: 10.2,
  },
  suktamRuleBottom: {
    top: 21.2,
  },
  suktamKnot: {
    position: 'absolute',
    left: 15,
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  kavachWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  kavachShield: {
    width: 24,
    height: 28,
    borderWidth: 2,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  kavachSpine: {
    position: 'absolute',
    top: 8,
    width: 2.2,
    height: 18,
    borderRadius: 1,
    opacity: 0.9,
  },
  kavachCrossbar: {
    position: 'absolute',
    top: 15,
    width: 13,
    height: 2,
    borderRadius: 1,
  },
  kavachArc: {
    position: 'absolute',
    top: 20,
    width: 13,
    height: 7,
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderRadius: 7,
  },
  kavachBindu: {
    position: 'absolute',
    top: 10,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  ashtakamWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ashtakamSquare: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 2,
  },
  ashtakamSquareRot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
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
  kalashWrap: {
    width: 34,
    height: 32,
    position: 'relative',
    alignItems: 'center',
  },
  kalashCoconut: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    borderWidth: 1.8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kalashCoconutMark: {
    width: 4.5,
    height: 2.2,
    borderRadius: 2,
    opacity: 0.85,
  },
  kalashLeaf: {
    position: 'absolute',
    top: 7,
    width: 12,
    height: 6,
    borderTopWidth: 2,
    borderRadius: 6,
  },
  kalashLeafLeft: {
    left: 3,
    transform: [{ rotate: '28deg' }],
  },
  kalashLeafRight: {
    right: 3,
    transform: [{ rotate: '-28deg' }],
  },
  kalashNeck: {
    position: 'absolute',
    top: 11,
    width: 14,
    height: 2.6,
    borderRadius: 1.5,
  },
  kalashPot: {
    position: 'absolute',
    top: 14,
    width: 27,
    height: 18,
    borderWidth: 1.9,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
  },
  kalashBand: {
    position: 'absolute',
    top: 22,
    width: 17,
    height: 1.8,
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
