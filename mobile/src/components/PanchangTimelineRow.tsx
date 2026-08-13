import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { scriptBodyFont } from '@/utils/langType';

/** Marker · short date · title row shared by Panchang Upcoming and Pitru Paksha. */
export default function PanchangTimelineRow({
  markerColor,
  dateLabel,
  title,
  secondary,
  showDivider = true,
  accessibilityLabel,
  density = 'compact',
}: {
  markerColor: string;
  dateLabel: string;
  title: string;
  secondary?: string | string[];
  showDivider?: boolean;
  accessibilityLabel?: string;
  density?: 'compact' | 'comfortable';
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const secondaryLines = secondary == null ? [] : Array.isArray(secondary) ? secondary : [secondary];
  const comfortable = density === 'comfortable';

  return (
    <View
      accessible={accessibilityLabel != null}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.row,
        comfortable ? styles.comfortableRow : styles.compactRow,
        { borderBottomColor: showDivider ? colors.divider : 'transparent' },
      ]}
    >
      <View style={[comfortable ? styles.comfortableDot : styles.compactDot, { backgroundColor: markerColor }]} />
      <Text
        style={{
          fontFamily: lang === 'en' ? (comfortable ? fontFamilies.interSemiBold : fontFamilies.latin) : bodyFont,
          fontSize: comfortable ? 11 : 12,
          color: colors.inkMuted,
          width: comfortable ? 52 : 50,
        }}
      >
        {dateLabel}
      </Text>
      <View style={styles.main}>
        <Text style={{ fontFamily: bodyFont, fontSize: comfortable ? 14 : 13, color: colors.ink }}>{title}</Text>
        {secondaryLines.map((line, index) => (
          <Text
            key={`${line}-${index}`}
            style={{ fontFamily: bodyFont, fontSize: 12, color: colors.saffronDeep, marginTop: 1 }}
          >
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  compactRow: { gap: 6, paddingVertical: 6 },
  comfortableRow: {
    gap: 11,
    paddingVertical: 11,
    minHeight: 44,
  },
  compactDot: { width: 5, height: 5, borderRadius: 2.5 },
  comfortableDot: { width: 8, height: 8, borderRadius: 4 },
  main: { flex: 1 },
});
