import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGitaLanguage } from '@/data/gita/language';
import {
  buildKundaliInsights,
  type KundaliChart,
  type KundaliResultTab,
} from '@/panchang/kundali';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = {
  chart: KundaliChart;
  at: Date;
  onOpenTab: (tab: KundaliResultTab) => void;
};

export default function KundaliOverview({
  chart,
  at,
  onOpenTab,
}: Props) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const insights = buildKundaliInsights(chart, at);

  return (
    <View>
      <View
        style={[
          styles.intro,
          { borderColor: colors.divider, backgroundColor: colors.goldTint, borderRadius: radii.md },
        ]}
      >
        <Text
          style={{
            color: colors.ink,
            fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
            fontSize: 16,
          }}
        >
          {contentByLang(lang, 'पहले इसका अर्थ समझें', 'Understand your chart first')}
        </Text>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 12,
            lineHeight: 18,
            marginTop: 4,
          }}
        >
          {meaningByLang(
            lang,
            'ये पारम्परिक संकेत आपकी कुंडली पढ़ने की शुरुआत हैं—निश्चित भविष्यवाणी नहीं।',
            'These traditional lenses are a starting point for reading your chart—not certain predictions.'
          )}
        </Text>
      </View>

      {insights.map((insight) => (
        <Pressable
          key={insight.id}
          onPress={() => onOpenTab(insight.targetTab)}
          accessibilityRole="button"
          accessibilityLabel={`${insight.titleEn}. Learn more in ${insight.targetTab}.`}
          style={({ pressed }) => [
            styles.card,
            {
              borderColor: colors.cardActiveBorder,
              backgroundColor: colors.parchmentSoft,
              borderRadius: radii.lg,
            },
            elevation.card,
            pressed && { opacity: 0.72 },
          ]}
        >
          <View
            style={[
              styles.icon,
              { backgroundColor: colors.saffronTint, borderRadius: radii.md },
            ]}
          >
            <Text style={[styles.iconText, { color: colors.saffronDeep }]}>
              {insight.id === 'lagna' ? '1' : insight.id === 'moon' ? '☾' : '◷'}
            </Text>
          </View>
          <View style={styles.cardCopy}>
            <Text
              style={[
                pillTextStyle(lang, typography.sectionLabel),
                styles.eyebrow,
                { color: colors.saffronDeep },
              ]}
            >
              {contentByLang(lang, insight.eyebrowHi, insight.eyebrowEn)}
            </Text>
            <Text
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 17,
                marginTop: 4,
              }}
            >
              {contentByLang(lang, insight.titleHi, insight.titleEn)}
            </Text>
            <Text
              style={{
                color: colors.inkSoft,
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 12,
                lineHeight: 19,
                marginTop: 6,
              }}
            >
              {meaningByLang(lang, insight.bodyHi, insight.bodyEn)}
            </Text>
            <Text style={[styles.learn, { color: colors.saffronDeep }]}>
              {contentByLang(lang, 'और जानें  ›', 'Learn more  ›')}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { borderWidth: 1, padding: 14, marginBottom: 12 },
  card: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  cardCopy: { flex: 1 },
  eyebrow: { fontSize: 8 },
  learn: { fontFamily: 'Inter_600SemiBold', fontSize: 10, marginTop: 8 },
});
