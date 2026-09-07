/**
 * A Jyotish door as a 2×2 GRID TILE that answers for the selected person
 * (design.md §51c).
 *
 * Why this replaced the stacked tool-card row it grew out of: on the landing the
 * doors are a menu, and a menu does not need body copy — the destination
 * explains itself. What the landing DOES owe the reader is what each door would
 * say for whoever is selected right now: लग्न and नक्षत्र on कुंडली, the running
 * साढ़े साती on गोचर. That turns four look-alike cards into one object with four
 * live readings, and it is what lets the separate chart-glance card go away
 * instead of being compressed — the numbers moved to the doors that needed them.
 *
 * Two states, one geometry:
 *   - `value` present  → the personalised reading, in the accent ink.
 *   - `value` null     → the descriptive fallback (`bodyHi`/`bodyEn`), quiet.
 * The fallback is not a nicety: the guest and error branches of the landing have
 * no chart, so NO tile has a value there. Same grid, same tile, no chart needed.
 *
 * `live` lifts exactly one tile onto the active card surface when something is
 * actually running for this person. It is an emphasis, never the only signal —
 * the value line always says in words what the fill is hinting at (§12).
 *
 * The NEW badge stays a TEXT pill rather than the dot the prototype drew: §12
 * forbids colour as the only carrier, and NEW vs SOON is a distinction a bare
 * dot cannot make. It rides the top row beside the glyph, so it costs no height.
 *
 * The reading goes in `accessibilityValue`, NOT appended to the label. A screen
 * reader announces label-then-value, so it is heard either way — but the label
 * stays the caller's door name character-for-character, which is what every
 * Maestro `tapOn: "Open Gochar"` selector targets. Growing the label would have
 * silently broken four shipped flows.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

/** Dense navigation chrome, same cap as the person chips it sits under. */
const TILE_FONT_CAP = 1.25;

export type JyotishTileValue = { hi: string; en: string } | null;

export default function JyotishToolTile({
  titleHi,
  titleEn,
  bodyHi,
  bodyEn,
  value,
  glyph,
  badge,
  live = false,
  onPress,
  accessibilityLabel,
  lang,
}: {
  titleHi: string;
  titleEn: string;
  /** Shown when `value` is null — the guest/error state and any tile with no reading. */
  bodyHi: string;
  bodyEn: string;
  /** What this door says for the selected person today; null when unknowable. */
  value?: JyotishTileValue;
  glyph: string;
  badge?: string;
  live?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  lang: Lang;
}) {
  const { colors, typography, radii } = useTheme();
  const reading = value ?? null;
  const line = reading
    ? contentByLang(lang, reading.hi, reading.en)
    : meaningByLang(lang, bodyHi, bodyEn);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      // English whatever the reading language, so TalkBack and Maestro agree.
      accessibilityValue={{ text: reading ? reading.en : bodyEn }}
      style={({ pressed }) => [
        styles.tile,
        {
          borderColor: live ? colors.cardActiveBorder : colors.divider,
          backgroundColor: live ? colors.cardActiveFrom : colors.parchmentSoft,
          borderRadius: radii.lg,
        },
        pressed && { opacity: 0.72 },
      ]}
    >
      <View style={styles.top}>
        <View
          style={[
            styles.glyph,
            { backgroundColor: colors.saffronTint, borderRadius: radii.md },
          ]}
        >
          <Text
            maxFontSizeMultiplier={TILE_FONT_CAP}
            style={{
              color: colors.saffronDeep,
              fontFamily: fontFamilies.devanagariBold,
              fontSize: 15,
            }}
          >
            {glyph}
          </Text>
        </View>
        <View style={styles.topEnd}>
          {badge && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill },
              ]}
            >
              <Text
                maxFontSizeMultiplier={TILE_FONT_CAP}
                style={[styles.badgeText, { color: colors.newBadgeText }]}
              >
                {badge}
              </Text>
            </View>
          )}
          <Text
            maxFontSizeMultiplier={TILE_FONT_CAP}
            style={{ color: colors.saffronDeep, fontSize: 17 }}
          >
            ›
          </Text>
        </View>
      </View>
      <Text
        numberOfLines={2}
        maxFontSizeMultiplier={TILE_FONT_CAP}
        style={[
          styles.title,
          {
            color: colors.ink,
            fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
          },
        ]}
      >
        {contentByLang(lang, titleHi, titleEn)}
      </Text>
      <Text
        numberOfLines={2}
        maxFontSizeMultiplier={TILE_FONT_CAP}
        style={{
          // The reading is the point of the tile, so it takes the accent ink;
          // the descriptive fallback stays a caption.
          color: reading ? colors.saffronDeep : colors.inkMuted,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 11,
          // 11 pt Devanagari needs ≥ 1.4× leading or the shirorekha is sliced
          // off the top of the line (design.md §3.0).
          lineHeight: 16,
          marginTop: 2,
        }}
      >
        {line}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    // Two lines of reading + title + glyph + padding. Below this the value line
    // clips at large font scale, which is the whole reason the tile exists.
    minHeight: 104,
    // Half the row minus the 8 dp gap — the same proportion the fact grid used.
    width: '48.7%',
    paddingHorizontal: 11,
    paddingVertical: 12,
    borderWidth: 1,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  topEnd: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  glyph: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  // Matches the stacked tool card's badge exactly (10 pt is the lint-enforced
  // floor — UI chrome is never font-scaled, so it can never be enlarged, §3).
  badge: { paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 1.1 },
  // marginTop:auto pins the title + reading to the bottom, so tiles of unequal
  // title length still line their readings up across the grid.
  title: { fontSize: 14, marginTop: 'auto', paddingTop: 8 },
});
