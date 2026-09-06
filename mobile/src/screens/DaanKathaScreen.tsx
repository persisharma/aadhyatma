/**
 * दान-कथा reader (PRD-26 §10.2 Bucket B) — renders one of the five
 * teaching-kathas from data/daan/kathas.ts: story paragraphs (meaning-policy
 * language selection), the शिक्षा panel, and the rendered canonical source
 * line. The shipped katha library renders its own entries via
 * VratKathaReader; this screen exists so the teaching-kathas never pollute
 * that registry.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { getDaanKatha } from '@/data/daan';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { commentaryByLang, contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanKatha'>;

export default function DaanKathaScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const katha = getDaanKatha(route.params.kathaId);
  if (!katha) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <ReaderHeader title={contentByLang(lang, 'कथा', 'Katha')} variant="index" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-katha-screen">
      <ReaderHeader
        title={contentByLang(lang, katha.titleHi, katha.titleEn)}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.sm }}>
          {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
        </Text>

        {katha.sections.map((section) => (
          <View key={section.id} style={{ marginTop: spacing.lg }}>
            {commentaryByLang(lang, section.paragraphsHi, section.paragraphsEn).map((paragraph, idx) => (
              <Text
                key={`${section.id}-${idx}`}
                style={{ fontFamily: bodyFont, fontSize: 14, lineHeight: 25, color: colors.inkSoft, marginBottom: spacing.md }}
              >
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        <View
          testID="daan-katha-teaching"
          style={[styles.teaching, { backgroundColor: colors.goldChipBg, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
        >
          <Text
            style={{
              fontFamily: typography.sectionLabel.fontFamily,
              fontSize: typography.sectionLabel.fontSize,
              letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
              color: colors.gold,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {contentByLang(lang, 'शिक्षा', 'The teaching')}
          </Text>
          <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: 23, color: colors.saffronDeep }}>
            {meaningByLang(lang, katha.teachingHi, katha.teachingEn)}
          </Text>
        </View>

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.md }}>
          {contentByLang(lang, `स्रोत: ${katha.canonHi}`, `Source: ${katha.canonEn}`)}
        </Text>
        <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.gold, textAlign: 'center', marginTop: spacing.lg, opacity: 0.7 }}>
          ॥ ॐ ॥
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  teaching: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginTop: 6 },
});
