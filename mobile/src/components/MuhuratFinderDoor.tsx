import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import ListCard from './ListCard';

/**
 * Drawn sunrise glyph — sun disc + three rays over a horizon bar, hand-built
 * from `View` strokes like the tab-bar icons (design.md §17; no emoji, §5).
 * Sized for the door's 46px `saffron-tint` pad.
 */
function SunriseGlyph({ color, size }: { color: string; size: number }) {
  const stroke = Math.max(1.5, size * 0.08);
  const ray = size * 0.16;
  const disc = size * 0.34;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Sun disc (stroked ring), sitting just above the horizon. */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.3,
          width: disc,
          height: disc,
          borderRadius: disc / 2,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      {/* Rays: one vertical + two diagonals fanning up from the disc. */}
      <View style={{ position: 'absolute', top: size * 0.1, width: stroke, height: ray, backgroundColor: color, borderRadius: stroke / 2 }} />
      <View
        style={{
          position: 'absolute',
          top: size * 0.16,
          left: size * 0.18,
          width: stroke,
          height: ray,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '-42deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: size * 0.16,
          right: size * 0.18,
          width: stroke,
          height: ray,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '42deg' }],
        }}
      />
      {/* Horizon bar. */}
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.14,
          width: size * 0.78,
          height: stroke,
          backgroundColor: color,
          borderRadius: stroke / 2,
        }}
      />
    </View>
  );
}

/**
 * The Panchang tab's door into the Event Muhurat Finder (PRD-16; design.md
 * §33/§60). Sits between the Daily Muhurat glance card and the anga grid. Uses
 * the shared `ListCard` in its FLAT variant — parchment-soft on a divider
 * border — so the gradient stays reserved for the live glance card directly
 * above and the door no longer reads as part of it; the leading thumb is a
 * drawn sunrise glyph on a saffron-tint pad instead of the gradient मु tile.
 * The only extra is the नया/NEW badge inline with the title.
 */
export default function MuhuratFinderDoor({ onPress }: { onPress: () => void }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  return (
    <ListCard
      testID="muhurat-finder-door"
      accessibilityLabel={contentByLang(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat')}
      onPress={onPress}
      style={styles.door}
      variant="flat"
      leading={
        <View style={[styles.glyphPad, { backgroundColor: colors.saffronTint }]}>
          <SunriseGlyph color={colors.saffronDeep} size={26} />
        </View>
      }
    >
      <View style={styles.titleRow}>
        <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink, lineHeight: 24 }}>
          {contentByLang(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat')}
        </Text>
        <View style={[styles.newBadge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.sm }]}>
          <Text
            style={{
              fontFamily: typography.versePill.fontFamily,
              fontSize: typography.versePill.fontSize,
              // Tracking splits the shirorekha — no letterSpacing outside en.
              letterSpacing: lang === 'en' ? 1.2 : 0,
              color: colors.newBadgeText,
              textTransform: 'uppercase',
            }}
          >
            {contentByLang(lang, 'नया', 'New')}
          </Text>
        </View>
      </View>
      <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12.5, color: colors.inkMuted, lineHeight: 19, marginTop: 2 }}>
        {contentByLang(lang, 'गृह प्रवेश · वाहन · नामकरण…', 'Planning something? Griha Pravesh, vehicle, naming…')}
      </Text>
    </ListCard>
  );
}

const styles = StyleSheet.create({
  door: { marginTop: 12 },
  glyphPad: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newBadge: { paddingHorizontal: 7, paddingVertical: 2 },
});
