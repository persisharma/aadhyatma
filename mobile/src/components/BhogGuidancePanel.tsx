import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useGitaLanguage } from '@/data/gita/language';
import type { BhogContentEntry, BhogGuidanceItem } from '@/panchang/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = {
  entry: BhogContentEntry;
  testID?: string;
};

function GuidanceSection({
  labelHi,
  labelEn,
  rows,
  tone = 'normal',
}: {
  labelHi: string;
  labelEn: string;
  rows: readonly BhogGuidanceItem[];
  tone?: 'normal' | 'warning';
}) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const accent = tone === 'warning' ? colors.saffronDeep : colors.inkSoft;

  if (rows.length === 0) return null;

  return (
    <View style={[styles.section, { borderTopColor: colors.divider }]}>
      <Text
        maxFontSizeMultiplier={1.25}
        style={[
          styles.label,
          pillTextStyle(lang, {
            fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
            fontSize: 11,
            letterSpacing: 0.35,
          }),
          { color: accent },
        ]}
      >
        {contentByLang(lang, labelHi, labelEn)}
      </Text>
      <View style={styles.list}>
        {rows.map((row) => (
          <View key={row.id} style={styles.bulletRow}>
            <Text style={{ color: accent, fontSize: 13, lineHeight: 20 }}>•</Text>
            <Text
              style={{
                flex: 1,
                color: colors.inkSoft,
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 13,
                lineHeight: 20,
              }}
            >
              {contentByLang(lang, row.textHi, row.textEn)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Shared, read-only guidance panel for Observance Detail and Vidhi तैयारी. */
export default function BhogGuidancePanel({ entry, testID = 'bhog-guidance-panel' }: Props) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  return (
    <View
      testID={testID}
      style={[
        styles.panel,
        { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg },
        elevation.card,
      ]}
    >
      <Text
        style={{
          color: colors.ink,
          fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
          fontSize: 15,
          lineHeight: 22,
        }}
      >
        {contentByLang(lang, entry.titleHi, entry.titleEn)}
      </Text>

      <GuidanceSection labelHi="अर्पित करें" labelEn="Offer" rows={entry.offerings} />
      <GuidanceSection
        labelHi="व्रत में ग्रहण करें"
        labelEn="During the fast"
        rows={entry.permittedDuringFast ?? []}
      />
      <GuidanceSection
        labelHi="व्रत में वर्जित"
        labelEn="Avoid during the fast"
        rows={entry.abstainedDuringFast ?? []}
        tone="warning"
      />
      <GuidanceSection
        labelHi="न चढ़ाएँ"
        labelEn="Do not offer"
        rows={entry.doNotOffer ?? []}
        tone="warning"
      />

      {entry.paranaMealHi && entry.paranaMealEn ? (
        <View style={[styles.section, { borderTopColor: colors.divider }]}>
          <Text
            maxFontSizeMultiplier={1.25}
            style={[
              styles.label,
              pillTextStyle(lang, {
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 11,
                letterSpacing: 0.35,
              }),
              { color: colors.inkSoft },
            ]}
          >
            {contentByLang(lang, 'पारण भोजन', 'Parana meal')}
          </Text>
          <Text style={[styles.note, { color: colors.inkSoft, fontFamily: bodyFont }]}>
            {contentByLang(lang, entry.paranaMealHi, entry.paranaMealEn)}
          </Text>
        </View>
      ) : null}

      <Text style={[styles.tradition, { color: colors.inkMuted, fontFamily: bodyFont, borderTopColor: colors.divider }]}>
        {contentByLang(lang, entry.traditionNoteHi, entry.traditionNoteEn)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 12 },
  section: { borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
  label: { marginBottom: 5 },
  list: { gap: 3 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  note: { fontSize: 13, lineHeight: 20 },
  tradition: { borderTopWidth: 1, marginTop: 10, paddingTop: 9, fontSize: 12, lineHeight: 18 },
});
