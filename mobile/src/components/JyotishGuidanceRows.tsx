import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Lang } from '@/data/gita/language';
import type { PersonalGuidance } from '@/panchang/gochar';
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
  guidance: RashifalGuidance | PersonalGuidance;
  lang: Lang;
  /**
   * How much provenance to print.
   *   false      — none (the compact treatments).
   *   true       — a chip under EVERY row: the full reading, for the Rashifal screen.
   *   'summary'  — ONE आधार line under the last row, for the Jyotish landing.
   *
   * 'summary' exists because the per-row chips repeat themselves: Favour and
   * Reflect routinely share a graha, so two of the three chips are character-for-
   * character identical, and 96 dp of the landing went to printing the same
   * evidence twice ahead of the reading it supports. The summary dedupes by
   * graha+house and keeps the full chips one tap away on the Rashifal screen.
   */
  showContext?: boolean | 'summary';
};

function isPersonal(
  guidance: RashifalGuidance | PersonalGuidance
): guidance is PersonalGuidance {
  return 'taraBala' in guidance;
}

function ordinal(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function contextLabel(
  lang: Lang,
  graha: Graha,
  house: number,
  lagnaHouse: number | null
): string {
  if (lagnaHouse === null) {
    return contentByLang(
      lang,
      `${GRAHA_NAMES_HI[graha]} · ${house} भाव`,
      `${GRAHA_NAMES_EN[graha]} · ${ordinal(house)} bhava`
    );
  }
  return contentByLang(
    lang,
    `${GRAHA_NAMES_HI[graha]} · चन्द्र से ${house} भाव · लग्न से ${lagnaHouse} भाव`,
    `${GRAHA_NAMES_EN[graha]} · ${ordinal(house)} bhava from Moon · ${ordinal(lagnaHouse)} from Lagna`
  );
}

/**
 * The distinct graha/house pairs behind the three rows, in row order, deduped.
 * Keyed on the RENDERED string so two rows that differ only in house number stay
 * separate while two genuinely identical readings collapse to one.
 */
function summaryLabel(
  lang: Lang,
  rows: readonly { graha: Graha; house: number; lagnaHouse: number | null }[]
): string {
  const seen = new Set<string>();
  const parts: string[] = [];
  for (const row of rows) {
    const key = `${row.graha}:${row.house}:${row.lagnaHouse ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    parts.push(
      row.lagnaHouse === null
        ? contentByLang(
          lang,
          `${GRAHA_NAMES_HI[row.graha]} ${row.house}`,
          `${GRAHA_NAMES_EN[row.graha]} ${row.house}`
        )
        : contentByLang(
          lang,
          `${GRAHA_NAMES_HI[row.graha]} ${row.house}/${row.lagnaHouse}`,
          `${GRAHA_NAMES_EN[row.graha]} ${row.house}/${row.lagnaHouse}`
        )
    );
  }
  return contentByLang(
    lang,
    `आधार · ${parts.join(' · ')}`,
    `Basis · ${parts.join(' · ')}`
  );
}

export default function JyotishGuidanceRows({
  guidance,
  lang,
  showContext = false,
}: Props) {
  const { colors, typography, radii } = useTheme();
  const personal = isPersonal(guidance) ? guidance : null;
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
      lagnaHouse: personal?.favourHouseFromLagna ?? null,
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
      lagnaHouse: personal?.pauseHouseFromLagna ?? null,
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
      lagnaHouse: personal?.reflectionHouseFromLagna ?? null,
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
            {showContext === true && (
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
                  {contextLabel(lang, row.graha, row.house, row.lagnaHouse)}
                </Text>
              </View>
            )}
          </View>
        </View>
      ))}
      {showContext === 'summary' && (
        <View
          // The houses are evidence, not a reading, so the summary is a quiet
          // strip rather than a fourth row — and it carries the full wording in
          // its a11y label, since the abbreviation is a sighted-reader economy.
          accessibilityLabel={summaryLabel('en', rows)}
          style={[
            styles.summary,
            {
              backgroundColor: colors.cardSurface,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <Text
            numberOfLines={2}
            style={[
              pillTextStyle(lang, typography.sectionLabel),
              styles.summaryText,
              { color: colors.inkMuted },
            ]}
          >
            {summaryLabel(lang, rows)}
          </Text>
        </View>
      )}
      {personal?.dashaNoteHi && personal.dashaNoteEn && (
        <View
          accessibilityLabel={`Dasha note. ${personal.dashaNoteEn}`}
          style={[
            styles.dashaNote,
            {
              backgroundColor: colors.goldTint,
              borderLeftColor: colors.gold,
            },
          ]}
        >
          <Text
            style={[
              pillTextStyle(lang, typography.sectionLabel),
              styles.label,
              { color: colors.inkSoft },
            ]}
          >
            {contentByLang(lang, 'दशा संकेत', 'Dasha note')}
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
            {meaningByLang(lang, personal.dashaNoteHi, personal.dashaNoteEn)}
          </Text>
        </View>
      )}
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
  dashaNote: {
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderLeftWidth: 4,
  },
  contextText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 12,
  },
  summary: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  summaryText: {
    fontSize: 11,
    // 11 pt Devanagari needs >= 1.4x leading (design.md 3.0).
    lineHeight: 16,
  },
});
