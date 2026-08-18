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
import { EVENT_RULES, GROUP_LABELS, GROUP_ORDER, type OccasionId } from '@/panchang/eventMuhurat';
import { useMuhuratFinderWarmup } from '@/panchang/useMuhuratFinder';
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
  mundan: 'मुं',
  annaprashan: 'अ',
  karnavedha: 'क',
  upanayana: 'उ',
  sampatti: 'सं',
  swarna: 'स्व',
  yatra: 'या',
};

/** Occasion-specific caption lines, where the generic transliteration is not enough. */
const OCCASION_CAPTION: Partial<Record<OccasionId, { hi: string; en: string }>> = {
  annaprashan: { hi: 'छठे–आठवें मास में', en: 'Annaprashan · 6th–8th month' },
  upanayana: { hi: 'जनेऊ संस्कार', en: 'Upanayana · Janeu' },
  mundan: { hi: 'चूड़ाकर्ण संस्कार', en: 'Mundan · Chudakarana' },
  yatra: { hi: 'दिशा शूल सहित', en: 'Travel · with Disha Shool' },
};

/**
 * शुभ मुहूर्त खोज — the occasion picker (PRD-16 Phase 1, design.md §60).
 * One decision: the occasion. The list reuses the app's `ListCard` (the library
 * list-card grammar) so it reads identically to every other list in the app.
 */
export default function MuhuratFinderScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  // Warm the shared day-cache while the user reads the occasion list, so tapping
  // an occasion resolves near-instantly. Non-blocking (see useMuhuratFinderWarmup).
  useMuhuratFinderWarmup();
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

        {/* Twelve occasions read as a wall without sections (TRD-16/P2 §6.1);
            three sectionLabel groups over the same shipped ListCard rows. */}
        {GROUP_ORDER.map((group) => (
          <React.Fragment key={group}>
            <Text
              style={[
                {
                  fontFamily: typography.sectionLabel.fontFamily,
                  fontSize: typography.sectionLabel.fontSize,
                  letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
                  color: colors.inkMuted,
                  textTransform: 'uppercase' as const,
                  marginBottom: spacing.sm,
                },
                group !== GROUP_ORDER[0] && { marginTop: spacing.lg },
              ]}
            >
              {contentByLang(lang, GROUP_LABELS[group].hi, GROUP_LABELS[group].en)}
            </Text>
            {EVENT_RULES.filter((rule) => rule.group === group).map((rule) => {
              const caption = OCCASION_CAPTION[rule.id];
              return (
                <ListCard
                  key={rule.id}
                  testID={`muhurat-occasion-${rule.id}`}
                  accessibilityLabel={contentByLang(lang, rule.nameHi, rule.nameEn)}
                  onPress={() => navigation.navigate('MuhuratResults', { occasionId: rule.id })}
                  leading={<CardThumb><Text style={glyphStyle}>{OCCASION_GLYPH[rule.id]}</Text></CardThumb>}
                >
                  <Text style={titleStyle}>{contentByLang(lang, rule.nameHi, rule.nameEn)}</Text>
                  <Text style={captionStyle}>
                    {caption
                      ? contentByLang(lang, caption.hi, caption.en)
                      : lang === 'en' ? rule.nameHi : rule.nameEn}
                  </Text>
                </ListCard>
              );
            })}
          </React.Fragment>
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
