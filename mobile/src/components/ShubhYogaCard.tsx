import React from 'react';
import PanchangDaySurface from './PanchangDaySurface';
import { moreIconSources } from './MoreIcon';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { eyebrowTextStyle, scriptBodyFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import MuhuratChip from '@/components/MuhuratChip';
import { formatRangeEndAware } from '@/panchang/muhuratFormat';
import type { ShubhYogaWindow } from '@/panchang/shubhYoga';

/**
 * The शुभ योग line (PRD-27): one quiet card naming the day's yogas with their
 * windows. Shared by the Panchang day panel (under the anga grid) and the
 * Muhurat Finder day detail (under the answer block). Renders NOTHING when no
 * yoga forms — present-or-absent is the entire vocabulary; there is no score,
 * no empty state, no "no yoga today" copy.
 *
 * Chips carry the full "… योग" name under the शुभ योग eyebrow — never the bare
 * word योग, which on this tab names the unrelated 27-cycle नित्य योग field
 * (the collision rule, RULEBOOK §24). Window ends go through the shipped
 * formatEndInstant (via formatRangeEndAware) so a past-midnight end carries
 * its short date instead of reading as this morning; the printed-panchang
 * 26:12 style is never used.
 */
export default function ShubhYogaCard({
  yogas,
  referenceDay,
  painted = false,
}: {
  yogas: ShubhYogaWindow[];
  referenceDay: Date;
  painted?: boolean;
}) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  if (yogas.length === 0) return null;
  const Frame = painted ? PanchangDaySurface : View;
  return (
    <Frame
      testID="shubh-yoga-card"
      style={[
        styles.card,
        !painted && { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
        elevation.card,
      ]}
    >
      <View style={styles.heading}>
        {painted && <Image source={moreIconSources.star} style={{ width: 22, height: 22 }} resizeMode="contain" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />}
        <Text style={[eyebrowTextStyle(lang, 11), { color: colors.saffronDeep }]}>
          {contentByLang(lang, 'शुभ योग', 'Shubh Yoga')}
        </Text>
      </View>
      {yogas.map((w) => (
        <View
          key={`${w.key}-${w.start.getTime()}`}
          style={styles.row}
          testID={`shubh-yoga-${w.key}`}
          accessibilityLabel={w.nameEn}
        >
          <MuhuratChip label={contentByLang(lang, w.nameHi, w.nameEn)} tone="yoga" />
          <Text
            numberOfLines={1}
            style={{
              // The end can carry a Devanagari short-date suffix outside en —
              // never a Latin-only face for it (design.md §3, the anga-tile rule).
              fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 12,
              color: colors.inkSoft,
              marginLeft: 'auto',
              flexShrink: 1,
            }}
          >
            {formatRangeEndAware(w.start, w.end, referenceDay, lang)}
          </Text>
        </View>
      ))}
    </Frame>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  card: { borderWidth: 1, padding: 14, marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
});
