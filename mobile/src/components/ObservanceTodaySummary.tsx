import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import CatalogArtwork from './CatalogArtwork';
import type { ObservanceRule } from '@/panchang/types';
import type { Lang } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

/** The approved split hero; description and reading controls are independent. */
export default function ObservanceTodaySummary({ rule, titleHi, titleEn, lang, children }: {
  rule: ObservanceRule;
  titleHi: string;
  titleEn: string;
  lang: Lang;
  children?: React.ReactNode;
}) {
  const { colors, typography, spacing, radii } = useTheme();
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={[styles.hero, { gap: spacing.md }]}>
      <CatalogArtwork
        rule={rule}
        aspectRatio={0.65}
        style={[styles.artwork, { height: spacing.catalogHeroArtworkHeight, borderRadius: radii.md }]}
      />
      <View style={styles.meta}>
        <View style={[styles.category, { backgroundColor: colors.goldTint, borderRadius: radii.pill, paddingHorizontal: spacing.sm }]}>
          <Text style={{ ...typography.catalogMeta, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.saffronDeep }}>
            {rule.category === 'vrat' ? contentByLang(lang, 'व्रत', 'Vrat') : rule.category === 'upavas' ? contentByLang(lang, 'उपवास', 'Upvas') : contentByLang(lang, 'पर्व', 'Festival')}
          </Text>
        </View>
        <Text style={{ ...typography.catalogTitle, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.catalogAccent }}>
          {contentByLang(lang, titleHi, titleEn)}
        </Text>
        <Text style={{ ...typography.catalogMeta, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkMuted }}>
          {contentByLang(lang, rule.deityHi, rule.deityEn)}
        </Text>
        <Text
          testID={`observance-summary-${rule.id}`}
          numberOfLines={expanded ? undefined : 2}
          style={{ ...typography.catalogBody, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), color: colors.inkSoft, marginTop: spacing.xs }}
        >
          {meaningByLang(lang, rule.shortDescriptionHi, rule.shortDescriptionEn)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} description ${rule.nameEn}`}
          onPress={() => setExpanded(value => !value)}
          style={({ pressed }) => [styles.more, pressed && { opacity: 0.7 }]}
        >
          <Text style={{ ...typography.catalogMeta, fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily), color: colors.saffronDeep }}>
            {expanded ? contentByLang(lang, 'कम दिखाएँ', 'Show less') : contentByLang(lang, 'पूरा विवरण पढ़ें ›', 'Read full description ›')}
          </Text>
        </Pressable>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'flex-start' },
  artwork: { width: '36%', flexShrink: 0 },
  category: { alignSelf: 'flex-start', paddingVertical: 2, marginBottom: 4 },
  meta: { flex: 1, minWidth: 0 },
  more: { minHeight: 44, justifyContent: 'center' },
});
