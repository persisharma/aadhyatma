import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ObservanceArtwork from './ObservanceArtwork';
import type { ObservanceRule } from '@/panchang/types';
import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

/** A compact landing introduction; full prose remains available in place. */
export default function ObservanceTodaySummary({ rule, titleHi, titleEn, lang }: {
  rule: ObservanceRule;
  titleHi: string;
  titleEn: string;
  lang: Lang;
}) {
  const { colors, typography, spacing } = useTheme();
  const [expanded, setExpanded] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} description ${rule.nameEn}. ${meaningByLang(lang, rule.shortDescriptionHi, rule.shortDescriptionEn)}`}
      onPress={() => setExpanded(value => !value)}
      style={({ pressed }) => [styles.summary, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.heading, { gap: spacing.md, marginBottom: spacing.sm }]}>
        <ObservanceArtwork rule={rule} size={76} />
        <View style={styles.title}>
          <Text style={{ ...typography.listingTitle, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.ink }}>
            {contentByLang(lang, titleHi, titleEn)}
          </Text>
          <Text style={{ ...typography.listingBody, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkMuted }}>
            {contentByLang(lang, rule.deityHi, rule.deityEn)}
          </Text>
        </View>
      </View>
      <Text
        testID={`observance-summary-${rule.id}`}
        numberOfLines={expanded ? undefined : 2}
        style={{ ...typography.listingBody, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkSoft }}
      >
        {meaningByLang(lang, rule.shortDescriptionHi, rule.shortDescriptionEn)}
      </Text>
      <Text style={{ ...typography.listingBody, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.saffronDeep, marginVertical: spacing.xs }}>
        {expanded ? contentByLang(lang, 'कम दिखाएँ', 'Show less') : contentByLang(lang, 'पूरा विवरण पढ़ें', 'Read full description')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, minWidth: 0 },
  summary: { minHeight: 44 },
});
