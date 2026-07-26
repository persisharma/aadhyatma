import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  type Graha,
  type RashifalGuidance,
} from '@/panchang/kundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont } from '@/utils/langType';

type Props = {
  guidance: RashifalGuidance;
  lang: Lang;
  showContext?: boolean;
};

function ordinal(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function contextLabel(lang: Lang, graha: Graha, house: number): string {
  return contentByLang(
    lang,
    `${GRAHA_NAMES_HI[graha]} · ${house} भाव`,
    `${GRAHA_NAMES_EN[graha]} · ${ordinal(house)} bhava`
  );
}

export default function JyotishGuidanceRows({
  guidance,
  lang,
  showContext = false,
}: Props) {
  const { colors, typography, radii } = useTheme();
  const rows = [
    {
      id: 'favour',
      marker: '↑',
      hi: 'जिसे स्थान दें',
      en: 'Favour',
      bodyHi: guidance.favourHi,
      bodyEn: guidance.favourEn,
      graha: guidance.favourGraha,
      house: guidance.favourHouse,
      accent: colors.gold,
      tint: colors.goldTint,
    },
    {
      id: 'pause',
      marker: '—',
      hi: 'जहाँ ठहरें',
      en: 'Pause',
      bodyHi: guidance.pauseHi,
      bodyEn: guidance.pauseEn,
      graha: guidance.pauseGraha,
      house: guidance.pauseHouse,
      accent: colors.avoidDeep,
      tint: colors.avoidTint,
    },
    {
      id: 'reflect',
      marker: '?',
      hi: 'चिंतन प्रश्न',
      en: 'Reflect',
      bodyHi: guidance.reflectionHi,
      bodyEn: guidance.reflectionEn,
      graha: guidance.reflectionGraha,
      house: guidance.reflectionHouse,
      accent: colors.saffronDeep,
      tint: colors.saffronTint,
    },
  ] as const;

  return (
    <View>
      {rows.map((row, index) => (
        <View
          key={row.id}
          accessibilityLabel={`${row.en}. ${row.bodyEn}`}
          style={[
            styles.row,
            {
              backgroundColor: colors.parchmentSoft,
              borderLeftColor: row.accent,
              borderBottomColor:
                index < rows.length - 1 ? colors.divider : 'transparent',
            },
          ]}
        >
          <View
            style={[
              styles.marker,
              { backgroundColor: row.tint, borderRadius: radii.pill },
            ]}
          >
            <Text style={[styles.markerText, { color: row.accent }]}>
              {row.marker}
            </Text>
          </View>
          <View style={styles.copy}>
            <Text
              style={[
                pillTextStyle(lang, typography.sectionLabel),
                styles.label,
                { color: colors.inkSoft },
              ]}
            >
              {contentByLang(lang, row.hi, row.en)}
            </Text>
            <Text
              style={{
                color: colors.ink,
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 12,
                lineHeight: 18,
                marginTop: 2,
              }}
            >
              {meaningByLang(lang, row.bodyHi, row.bodyEn)}
            </Text>
            {showContext && (
              <View
                style={[
                  styles.context,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.cardSurface,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text style={[styles.contextText, { color: colors.inkMuted }]}>
                  {contextLabel(lang, row.graha, row.house)}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 78,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderLeftWidth: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
  },
  marker: {
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 12,
  },
  copy: {
    flex: 1,
  },
  label: {
    fontSize: 12,
  },
  context: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  contextText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 12,
  },
});
