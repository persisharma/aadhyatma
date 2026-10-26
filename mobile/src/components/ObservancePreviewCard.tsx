import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ObservanceArtwork from './ObservanceArtwork';
import AppIcon from './AppIcon';
import type { Lang } from '@/data/gita/language';
import type { ObservanceRule } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { captionFont } from '@/utils/scriptFont';

/** The star and detail are sibling buttons, never nested press targets. */
export default function ObservancePreviewCard({
  rule, lang, dateLabel, countdown, following, onToggleFollow, onPress,
  starRef, layout = 'row', areaLabel,
}: {
  rule: ObservanceRule;
  lang: Lang;
  dateLabel?: string;
  countdown?: string;
  following: boolean;
  onToggleFollow: () => void;
  onPress: () => void;
  starRef?: React.Ref<View>;
  layout?: 'row' | 'tile';
  areaLabel?: string;
}) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const tile = layout === 'tile';
  return (
    <View
      testID={`observance-card-${rule.id}`}
      style={[
        styles.card, tile && styles.tile,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg, marginBottom: tile ? 0 : spacing.md },
        elevation.subtle,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={contentByLang(lang, rule.nameHi, rule.nameEn)}
        onPress={onPress}
        style={({ pressed }) => [styles.main, { padding: spacing.md, gap: spacing.md }, tile && styles.tileMain, pressed && styles.pressed]}
      >
        <ObservanceArtwork rule={rule} size={tile ? 80 : 64} />
        <View style={[styles.meta, tile && styles.tileMeta]}>
          <Text style={{ ...typography.cardHindi, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.ink }}>
            {contentByLang(lang, rule.nameHi, rule.nameEn)}
          </Text>
          {!tile && (
            <Text style={{ ...typography.cardLatin, ...captionFont(lang === 'en' ? rule.nameHi : rule.nameEn), color: colors.inkMuted, marginTop: spacing.xs }}>
              {lang === 'en' ? rule.nameHi : rule.nameEn}
            </Text>
          )}
          {dateLabel && (
            <View style={[styles.dateRow, { gap: spacing.xs, marginTop: spacing.xs }]}>
              <AppIcon name="birthday" size={14} color={colors.inkMuted} />
              <Text style={{ ...typography.listingBody, fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkSoft }}>
                {dateLabel}
              </Text>
            </View>
          )}
          {countdown && (
            <View style={[styles.countdown, { backgroundColor: colors.goldTint, borderRadius: radii.pill, marginTop: spacing.xs, paddingHorizontal: spacing.sm }]}>
              <Text style={{ ...typography.listingBody, fontFamily: lang === 'en' ? fontFamilies.latinSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.saffronDeep }}>
                {countdown}
              </Text>
            </View>
          )}
          {areaLabel && <Text style={{ ...typography.listingBody, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.saffronDeep, marginTop: spacing.xs }}>{areaLabel}</Text>}
        </View>
        {!tile && <AppIcon name="next" size={14} color={colors.inkMuted} />}
      </Pressable>
      <Pressable
        ref={starRef}
        collapsable={false}
        testID={`observance-star-${rule.id}`}
        accessibilityRole="button"
        accessibilityState={{ selected: following }}
        accessibilityLabel={`${following ? 'Unfollow' : 'Follow'} ${rule.nameEn}`}
        onPress={onToggleFollow}
        style={({ pressed }) => [
          styles.star, tile && styles.tileStar,
          { borderColor: colors.divider, borderRadius: radii.xl, backgroundColor: following ? colors.goldTint : colors.parchmentSoft },
          pressed && styles.pressed,
        ]}
      >
        <AppIcon name="star" size={22} color={following ? colors.gold : colors.inkMuted} weight={following ? 'fill' : 'regular'} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  main: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  meta: { flex: 1, minWidth: 0 },
  dateRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  countdown: { alignSelf: 'flex-start', paddingVertical: 2 },
  star: { width: 44, height: 44, flexShrink: 0, marginRight: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tile: { width: 184, alignItems: 'stretch' },
  tileMain: { flexDirection: 'column', alignItems: 'flex-start', paddingTop: 12 },
  tileMeta: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', alignSelf: 'stretch' },
  tileStar: { position: 'absolute', top: 8, right: 0 },
  pressed: { opacity: 0.7 },
});
