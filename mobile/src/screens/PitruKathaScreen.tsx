/**
 * पितृ-कथा reader (PRD-44 §5.4) — renders one teaching-katha from
 * data/pitru/kathas.ts: story paragraphs (meaning-policy language selection),
 * the शिक्षा panel, the rendered canon line, and — when the katha is drawn from
 * a bundled text — a hand-off into that reader. Mirrors DaanKathaScreen so the
 * teaching-kathas never enter the festival katha library.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { getPitruKatha } from '@/data/pitru';
import type { MoreStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { commentaryByLang, contentByLang, meaningByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruKatha'>;

export default function PitruKathaScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const katha = getPitruKatha(route.params.kathaId);

  const openRef = () => {
    if (!katha?.ref) return;
    if (katha.ref.kind === 'gita') {
      navigation.navigate('GitaReader', { chapter: katha.ref.chapter, initialIndex: katha.ref.verseIndex });
      return;
    }
    rootNav.navigate('HomeTab', {
      screen: 'ValmikiRamayanReader',
      params: { chapter: katha.ref.chapter, initialIndex: katha.ref.verseIndex },
    });
  };

  return (
    <View style={styles.root} testID="pitru-katha-screen">
      <LinearGradient colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={katha ? contentByLang(lang, katha.titleHi, katha.titleEn) : contentByLang(lang, 'कथा', 'Katha')}
          onBack={() => navigation.goBack()}
        />
        {katha && (
          <ScrollView contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]} showsVerticalScrollIndicator={false}>
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
              testID="pitru-katha-teaching"
              style={[styles.teaching, { backgroundColor: colors.goldTint, borderColor: colors.gold, borderRadius: radii.lg }]}
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

            {katha.ref && (
              <Pressable
                onPress={openRef}
                accessibilityRole="button"
                accessibilityLabel={`Open ${katha.ref.kind} reader for ${katha.id}`}
                testID="pitru-katha-ref"
                style={[styles.refPill, { borderColor: colors.gold, borderRadius: radii.pill }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                  {katha.ref.kind === 'gita'
                    ? contentByLang(lang, 'मूल श्लोक गीता में पढ़ें ›', 'Read the verses in the Gita ›')
                    : contentByLang(lang, 'मूल श्लोक रामायण में पढ़ें ›', 'Read the verses in the Ramayana ›')}
                </Text>
              </Pressable>
            )}

            <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.gold, textAlign: 'center', marginTop: spacing.lg, opacity: 0.7 }}>
              ॥ ॐ ॥
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 40 },
  teaching: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 13, marginTop: 6 },
  refPill: { alignSelf: 'center', borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, marginTop: 14, minHeight: 36, justifyContent: 'center' },
});
