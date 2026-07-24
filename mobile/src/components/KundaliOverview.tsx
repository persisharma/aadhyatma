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
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = {
  chart: KundaliChart;
  at: Date;
  onOpenTab: (tab: KundaliResultTab) => void;
  onOpenPractice: () => void;
};

export default function KundaliOverview({
  chart,
  at,
  onOpenTab,
  onOpenPractice,
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
          <Text style={[styles.eyebrow, { color: colors.saffronDeep }]}>
            {contentByLang(lang, insight.eyebrowHi, insight.eyebrowEn).toUpperCase()}
          </Text>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 18,
              marginTop: 5,
            }}
          >
            {contentByLang(lang, insight.titleHi, insight.titleEn)}
          </Text>
          <Text
            style={{
              color: colors.inkSoft,
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 13,
              lineHeight: 20,
              marginTop: 7,
            }}
          >
            {meaningByLang(lang, insight.bodyHi, insight.bodyEn)}
          </Text>
          <Text style={[styles.learn, { color: colors.saffronDeep }]}>
            {contentByLang(lang, 'और समझें  ›', 'Learn more  ›')}
          </Text>
        </Pressable>
      ))}

      <Pressable
        onPress={onOpenPractice}
        accessibilityRole="button"
        accessibilityLabel="Open Navagraha Stotram practice"
        style={({ pressed }) => [
          styles.practice,
          { borderColor: colors.divider, borderRadius: radii.lg },
          pressed && { opacity: 0.7 },
        ]}
      >
        <Text style={[styles.practiceGlyph, { color: colors.gold }]}>ॐ</Text>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
              fontSize: 15,
            }}
          >
            {contentByLang(lang, 'आज की सरल साधना', 'A simple practice for today')}
          </Text>
          <Text
            style={{
              color: colors.inkMuted,
              fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {contentByLang(lang, 'नवग्रह स्तोत्रम्', 'Navagraha Stotram')}
          </Text>
        </View>
        <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { borderWidth: 1, padding: 14, marginBottom: 12 },
  card: { borderWidth: 1, padding: 16, marginBottom: 12 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4 },
  learn: { fontFamily: 'Inter_600SemiBold', fontSize: 11, marginTop: 10 },
  practice: {
    minHeight: 70,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  practiceGlyph: { fontFamily: 'NotoSansDevanagari_600SemiBold', fontSize: 24 },
});
