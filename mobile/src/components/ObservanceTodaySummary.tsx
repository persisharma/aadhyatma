import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import ObservanceArtwork from './ObservanceArtwork';
import type { ObservanceRule } from '@/panchang/types';
import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

/** The illustration stays beside the introduction and its reading actions. */
export default function ObservanceTodaySummary({ rule, titleHi, titleEn, lang, badge, children }: {
  rule: ObservanceRule; titleHi: string; titleEn: string; lang: Lang;
  badge?: React.ReactNode; children?: React.ReactNode;
}) {
  const { colors, typography } = useTheme();
  const { width } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={styles.summary}>
      <ObservanceArtwork rule={rule} width={width < 360 ? 100 : 126} height={154} variant="today" />
      <View style={styles.copy}>
        {badge}
        <Text style={{ ...typography.listingTitle, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), fontSize: 17, lineHeight: 24, color: colors.ink }}>
          {contentByLang(lang, titleHi, titleEn)}
        </Text>
        <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkMuted }}>
          {contentByLang(lang, rule.deityHi, rule.deityEn)}
        </Text>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded }}
          accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} description ${rule.nameEn}. ${meaningByLang(lang, rule.shortDescriptionHi, rule.shortDescriptionEn)}`}
          onPress={() => setExpanded(value => !value)} style={({ pressed }) => [styles.description, pressed && { opacity: 0.7 }]}>
          <Text testID={`observance-summary-${rule.id}`} numberOfLines={expanded ? undefined : 2}
            style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, lineHeight: 18, color: colors.inkSoft }}>
            {meaningByLang(lang, rule.shortDescriptionHi, rule.shortDescriptionEn)}
          </Text>
          <Text style={{ fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), fontSize: 11, lineHeight: 18, color: colors.saffronDeep, marginTop: 2 }}>
            {expanded ? contentByLang(lang, 'कम दिखाएँ', 'Show less') : contentByLang(lang, 'पूरा विवरण पढ़ें', 'Read full description')}
          </Text>
        </Pressable>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  copy: { flex: 1, minWidth: 0 },
  description: { minHeight: 44, marginTop: 4 },
});
