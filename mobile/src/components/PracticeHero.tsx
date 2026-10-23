import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CachedArtwork from './CachedArtwork';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { practiceSummary } from '@/data/routine/practiceView';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';

/** Full 2:1 composition stays visible; copy grows below it at every text size. */
export default function PracticeHero({ doneCount, total }: { doneCount: number; total: number }) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const summary = practiceSummary(doneCount, total, lang);
  return (
    <View testID="practice-hero" style={{ borderRadius: radii.lg, borderWidth: 1, borderColor: colors.goldTint,
      backgroundColor: colors.parchmentSoft, overflow: 'hidden', marginBottom: spacing.md }}>
      <CachedArtwork source={readerIllustrationAsset('hanuman-sita')} resizeMode="contain"
        style={{ width: '100%', aspectRatio: 2, backgroundColor: colors.parchmentDeep }}
        fallback={<View style={StyleSheet.absoluteFillObject} />} />
      <View style={{ padding: spacing.lg, gap: spacing.xs }}>
        <Text style={{ ...typography.practiceHeroTitle, color: colors.ink,
          fontFamily: scriptTitleFont(lang, typography.cardHindi.fontFamily) }}>
          {contentByLang(lang, 'भक्ति से आरम्भ करें', 'Begin with devotion')}
        </Text>
        <Text style={{ ...typography.practiceItemMeta, color: colors.inkSoft,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }}>
          {total > 0 ? `${summary.big} · ${summary.sub}` : contentByLang(lang, 'आज अपनी साधना को समय दें', 'Make time for your practice today')}
        </Text>
      </View>
    </View>
  );
}
