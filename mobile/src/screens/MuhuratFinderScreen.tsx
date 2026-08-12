import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import ReaderHeader from '@/components/ReaderHeader';
import ListCard, { CardThumb } from '@/components/ListCard';
import { EVENT_RULES, type OccasionId } from '@/panchang/eventMuhurat';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MuhuratFinder'>;

/** Short Devanagari glyph for each occasion's thumb (the library-card letter-thumb grammar). */
const OCCASION_GLYPH: Record<OccasionId, string> = {
  'griha-pravesh': 'गृ',
  vahan: 'वा',
  namkaran: 'ना',
  vidyarambh: 'वि',
  'bhumi-pujan': 'भू',
  vyapar: 'व्या',
};

/**
 * शुभ मुहूर्त खोज — the occasion picker (PRD-16 Phase 1, design.md §60).
 * One decision: the occasion. The list reuses the app's `ListCard` (the library
 * list-card grammar) so it reads identically to every other list in the app.
 */
export default function MuhuratFinderScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const titleStyle = { fontFamily: titleFont, fontSize: 17, color: colors.ink, lineHeight: 25 };
  const captionStyle = {
    fontFamily: lang === 'en' ? bodyFont : typography.cardLatin.fontFamily,
    fontStyle: (lang === 'en' ? 'normal' : 'italic') as 'normal' | 'italic',
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 19,
    marginTop: 2,
  };
  const glyphStyle = { fontFamily: titleFont, fontSize: 22, color: colors.parchmentSoft };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ReaderHeader
        title={contentByLang(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat')}
        variant="index"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text
          style={{
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 13,
            color: colors.inkMuted,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: spacing.lg,
          }}
        >
          {contentByLang(lang, 'आप क्या करने जा रहे हैं?', 'What are you planning?')}
        </Text>

        {EVENT_RULES.map((rule) => (
          <ListCard
            key={rule.id}
            testID={`muhurat-occasion-${rule.id}`}
            accessibilityLabel={contentByLang(lang, rule.nameHi, rule.nameEn)}
            onPress={() => navigation.navigate('MuhuratResults', { occasionId: rule.id })}
            leading={<CardThumb><Text style={glyphStyle}>{OCCASION_GLYPH[rule.id]}</Text></CardThumb>}
          >
            <Text style={titleStyle}>{contentByLang(lang, rule.nameHi, rule.nameEn)}</Text>
            <Text style={captionStyle}>{lang === 'en' ? rule.nameHi : rule.nameEn}</Text>
          </ListCard>
        ))}

        <ListCard
          testID="muhurat-abujh-door"
          accessibilityLabel={contentByLang(lang, 'विशेष शुभ दिन', 'Special auspicious days')}
          onPress={() => navigation.navigate('AbujhDays')}
          leading={<CardThumb><Text style={glyphStyle}>॥</Text></CardThumb>}
          style={{ marginTop: spacing.sm }}
        >
          <Text style={titleStyle}>{contentByLang(lang, 'विशेष शुभ दिन', 'Special auspicious days')}</Text>
          <Text style={captionStyle}>
            {contentByLang(lang, 'अबूझ मुहूर्त — कोई गणना आवश्यक नहीं', 'Abujh days — no muhurat needed')}
          </Text>
        </ListCard>

        <Text
          style={{
            fontFamily: typography.cardLatin.fontFamily,
            fontSize: 12,
            color: colors.inkMuted,
            textAlign: 'center',
            marginTop: spacing.lg,
            lineHeight: 19,
          }}
        >
          {contentByLang(lang, 'अगले 3 महीनों में खोजा जाएगा', 'Searching the next 3 months')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
