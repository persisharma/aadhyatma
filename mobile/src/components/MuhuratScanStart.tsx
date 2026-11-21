import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import { formatShortDate } from '@/panchang/muhuratFormat';

/** The date LABEL used by the active scan; never format it as an instant. */
export default function MuhuratScanStart({ date }: { date: Date }) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { location } = usePanchangLocation();
  const fontFamily = scriptTitleFont(lang, typography.cardHindi.fontFamily);
  const formatted = formatShortDate(date, lang);
  const label = {
    en: `Dates from ${formatted} · IST`,
    hi: `${formatted} से तिथियाँ · IST`,
    gu: `${formatted} થી તારીખો · IST`,
    kn: `${formatted} ರಿಂದ ದಿನಾಂಕಗಳು · IST`,
  }[lang];
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={{ fontFamily, fontSize: 12.5, lineHeight: 22, color: colors.inkMuted, textAlign: 'center' }}>
        {contentByLang(lang, location.labelHi, location.labelEn)}
        {contentByLang(lang, ' · दृक्पंचांग पद्धति', ' · DrikPanchang convention')}
      </Text>
      <Text testID="muhurat-scan-start" style={{ fontFamily, fontSize: 13, lineHeight: 23, color: colors.saffronDeep, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}
