import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ObservanceArtwork from './ObservanceArtwork';
import AppIcon from './AppIcon';
import ListingCard, { UPCOMING_ART_HEIGHT, UPCOMING_ART_WIDTH } from './ListingCard';
import type { Lang } from '@/data/gita/language';
import type { ObservanceRule } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont } from '@/utils/langType';

/** Scene-led Upcoming tiles and compact list rows; save/detail stay siblings. */
export default function ObservancePreviewCard({
  rule, lang, dateLabel, countdown, following, onToggleFollow, onPress,
  starRef, layout = 'row', areaLabel, onReminderPress, reminderOn,
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
  onReminderPress?: () => void;
  reminderOn?: boolean;
}) {
  const { colors, typography, radii } = useTheme();
  const tile = layout === 'tile';
  const bodyFont = lang === 'en' ? fontFamilies.inter : scriptBodyFont(lang, typography.meaning.fontFamily);
  const star = (
      <Pressable ref={starRef} collapsable={false} testID={`observance-star-${rule.id}`}
        accessibilityRole="button" accessibilityState={{ selected: following }}
        accessibilityLabel={`${following ? 'Unfollow' : 'Follow'} ${rule.nameEn}`} onPress={onToggleFollow}
        style={({ pressed }) => [styles.star, tile ? styles.tileStar : styles.rowStar, pressed && styles.pressed]}>
        <View style={[styles.starCircle, { width: tile ? 28 : 34, height: tile ? 28 : 34,
          borderColor: colors.divider, backgroundColor: following ? colors.goldTint : colors.parchmentSoft }]}>
          <AppIcon name="star" size={tile ? 18 : 22} color={following ? colors.gold : colors.saffronDeep} weight={following ? 'fill' : 'regular'} />
        </View>
      </Pressable>
  );
  return (
    <ListingCard testID={`observance-card-${rule.id}`} onPress={onPress}
      title={contentByLang(lang, rule.nameHi, rule.nameEn)} language={lang}
      accessibilityLabel={contentByLang(lang, rule.nameHi, rule.nameEn)}
      showChevron={!onReminderPress} actionCount={onReminderPress ? 2 : 1}
      action={<>{star}{onReminderPress && <Pressable onPress={onReminderPress}
        accessibilityRole="button" accessibilityLabel={`Reminders for ${rule.nameEn}`}
        accessibilityState={{ selected: reminderOn }}
        style={({ pressed }) => [styles.star, { top: 48, right: 4 }, pressed && styles.pressed]}>
        <View style={[styles.starCircle, { width: 34, height: 34, borderColor: colors.divider,
          backgroundColor: reminderOn ? colors.goldTint : colors.parchmentSoft }]}>
          <AppIcon name="bell" size={19} color={colors.saffronDeep} weight={reminderOn ? 'fill' : 'regular'} />
        </View>
      </Pressable>}</>}
      variant={tile ? 'upcoming' : 'observance'}
      secondary={tile ? undefined : lang === 'en' ? rule.nameHi : rule.nameEn}
      thumbnail={<ObservanceArtwork rule={rule} width={tile ? UPCOMING_ART_WIDTH : 78} height={tile ? UPCOMING_ART_HEIGHT : 78} variant={tile ? 'upcoming' : 'list'} />}
      meta={<View>
          {(dateLabel || countdown) && <View style={[styles.facts, tile && { marginTop: 2 }]}>
            {dateLabel && <View style={styles.dateRow}>
              <AppIcon name="date" size={tile ? 12 : 14} color={colors.saffronDeep} />
              <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: tile ? 18 : 20, flexShrink: 1, color: colors.inkSoft }}>{dateLabel}</Text>
            </View>}
            {countdown && <View style={[styles.countdown, { backgroundColor: colors.goldTint, borderRadius: radii.pill }]}>
              <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: tile ? 18 : 20, flexShrink: 1, color: colors.saffronDeep }}>{countdown}</Text>
            </View>}
          </View>}
          {areaLabel && <Text style={{ fontFamily: bodyFont, fontSize: 11, color: colors.saffronDeep, marginTop: 2 }}>{areaLabel}</Text>}
      </View>} />
  );
}

const styles = StyleSheet.create({
  facts: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 3 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countdown: { paddingHorizontal: 7, paddingVertical: 2 },
  star: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  tileStar: { top: 0, right: 0 },
  rowStar: { top: 4, right: 4 },
  starCircle: { borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.7 },
});
