import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import NorthIndianChart from '@/components/NorthIndianChart';
import type { Lang } from '@/data/gita/language';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from '@/panchang/names';
import {
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  getCurrentDasha,
  RASHI_GLYPHS,
  RASHI_NAMES_EN,
  RASHI_NAMES_HI,
  RASHI_NAMES_WESTERN,
  type KundaliChart,
  type RashifalGuidance,
} from '@/panchang/kundali';
import type { City } from '@/panchang/locations';
import type { BirthProfile } from '@/panchang/useKundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type RashifalProps = {
  kind: 'rashifal';
  width: number;
  lang: Lang;
  guidance: RashifalGuidance;
  rashiIndex: number;
  practiceHi: string;
  practiceEn: string;
  date: Date;
};

type KundaliProps = {
  kind: 'kundali';
  width: number;
  lang: Lang;
  chart: KundaliChart;
  profile: BirthProfile;
  city: City;
};

type Props = RashifalProps | KundaliProps;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function formatBirthDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function formatBirthTime(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function signPair(lang: Lang, index: number): { primary: string; secondary: string } {
  return {
    primary: contentByLang(lang, RASHI_NAMES_HI[index], RASHI_NAMES_EN[index]),
    secondary: lang === 'en' ? RASHI_NAMES_WESTERN[index] : RASHI_NAMES_EN[index],
  };
}

function BrandHeader({
  lang,
  right,
}: {
  lang: Lang;
  right: React.ReactNode;
}) {
  const { colors, typography } = useTheme();
  return (
    <>
      <View style={styles.brandRow}>
        <Text style={[styles.om, { color: colors.saffronDeep }]}>ॐ</Text>
        <Text
          style={{
            color: colors.ink,
            fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
            fontSize: 17,
          }}
        >
          {contentByLang(lang, 'वेदांश', 'Vedansh')}
        </Text>
        <View style={styles.brandRight}>{right}</View>
      </View>
      <View style={[styles.rule, { backgroundColor: colors.divider }]} />
    </>
  );
}

function RashifalShareCard(props: RashifalProps) {
  const { colors, typography, radii } = useTheme();
  const sign = signPair(props.lang, props.rashiIndex);
  const isKannada = props.lang === 'kn';
  const rows = [
    {
      id: 'favour',
      marker: '↑',
      hi: 'जिसे स्थान दें',
      en: 'Favour',
      bodyHi: props.guidance.favourHi,
      bodyEn: props.guidance.favourEn,
    },
    {
      id: 'pause',
      marker: '—',
      hi: 'जहाँ ठहरें',
      en: 'Pause',
      bodyHi: props.guidance.pauseHi,
      bodyEn: props.guidance.pauseEn,
    },
    {
      id: 'reflect',
      marker: '?',
      hi: 'चिंतन प्रश्न',
      en: 'Reflect',
      bodyHi: props.guidance.reflectionHi,
      bodyEn: props.guidance.reflectionEn,
    },
  ] as const;

  return (
    <LinearGradient
      colors={[colors.cardActiveFrom, colors.parchment]}
      style={[
        styles.card,
        {
          width: props.width,
          aspectRatio: 4 / 5,
          borderColor: colors.saffronDeep,
          borderRadius: radii.lg,
          padding: props.width * 0.051,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.orbit,
          {
            width: props.width * 0.53,
            height: props.width * 0.53,
            borderColor: colors.divider,
            borderRadius: props.width,
            top: props.width * 0.15,
          },
        ]}
      />
      <BrandHeader
        lang={props.lang}
        right={(
          <Text style={[styles.meta, { color: colors.inkMuted }]}>
            {contentByLang(props.lang, 'आज का राशिफल', 'Daily Rashifal')}
            {'\n'}
            {formatDate(props.date)}
          </Text>
        )}
      />
      <View style={styles.signLockup}>
        <View
          style={[
            styles.signGlyph,
            {
              borderColor: colors.cardActiveBorder,
              backgroundColor: colors.saffronTint,
              borderRadius: radii.pill,
            },
          ]}
        >
          <Text style={[styles.signGlyphText, { color: colors.saffronDeep }]}>
            {RASHI_GLYPHS[props.rashiIndex]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              pillTextStyle(props.lang, typography.sectionLabel),
              styles.kicker,
              { color: colors.saffronDeep },
            ]}
          >
            {contentByLang(props.lang, 'चन्द्र-राशि मार्गदर्शन', 'Moon-sign guidance')}
          </Text>
          <Text
            style={{
              color: colors.ink,
              fontFamily: scriptTitleFont(props.lang, typography.readerTitle.fontFamily),
              fontSize: props.width * 0.075,
              marginTop: 1,
            }}
          >
            {sign.primary}
            <Text style={[styles.signSecondary, { color: colors.inkMuted }]}>
              {' '}· {sign.secondary}
            </Text>
          </Text>
        </View>
      </View>
      <View style={[styles.shareGuidance, isKannada && styles.shareGuidanceTight]}>
        {rows.map((row) => (
          <View
            key={row.id}
            style={[
              styles.shareGuidanceRow,
              {
                borderColor: colors.divider,
                backgroundColor: colors.cardSurface,
                borderRadius: radii.sm,
              },
              isKannada && styles.shareGuidanceRowTight,
            ]}
          >
            <View
              style={[
                styles.shareMarker,
                { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
              ]}
            >
              <Text style={[styles.shareMarkerText, { color: colors.saffronDeep }]}>
                {row.marker}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  pillTextStyle(props.lang, typography.sectionLabel),
                  styles.shareLabel,
                  { color: colors.inkSoft },
                ]}
              >
                {contentByLang(props.lang, row.hi, row.en)}
              </Text>
              <Text
                numberOfLines={3}
                style={{
                  color: colors.ink,
                  fontFamily: scriptBodyFont(props.lang, typography.meaning.fontFamily),
                  fontSize: isKannada ? 9.2 : 10.5,
                  lineHeight: isKannada ? 13 : 15,
                  marginTop: 1,
                }}
              >
                {meaningByLang(props.lang, row.bodyHi, row.bodyEn)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <View
        style={[
          styles.sharePractice,
          {
            borderColor: colors.cardActiveBorder,
            backgroundColor: colors.saffronTint,
            borderRadius: radii.md,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.sharePracticeText,
            {
              color: colors.saffronDeep,
              fontFamily: scriptBodyFont(props.lang, typography.meaning.fontFamily),
            },
          ]}
        >
          ॐ {contentByLang(props.lang, 'साधना', 'Practice')} ·{' '}
          {contentByLang(props.lang, props.practiceHi, props.practiceEn)}
        </Text>
      </View>
      <View style={[styles.trust, { borderTopColor: colors.divider }]}>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: scriptBodyFont(props.lang, typography.meaning.fontFamily),
            fontSize: 7.5,
            lineHeight: 10,
            textAlign: 'center',
          }}
        >
          {meaningByLang(
            props.lang,
            'पारम्परिक मार्गदर्शन चिंतन के लिए है—निश्चित भविष्यवाणी नहीं।',
            'Traditional guidance for reflection—not a certain prediction.'
          )}
        </Text>
        <Text
          style={{
            color: colors.inkSoft,
            fontFamily: scriptTitleFont(props.lang, typography.readerTitle.fontFamily),
            fontSize: 10,
            textAlign: 'center',
            marginTop: 3,
          }}
        >
          {contentByLang(
            props.lang,
            'वेदांश · पवित्र पाठ, दैनिक साधना',
            'Vedansh · Sacred texts, daily practice'
          )}
        </Text>
      </View>
    </LinearGradient>
  );
}

function KundaliShareCard(props: KundaliProps) {
  const { colors, typography, radii } = useTheme();
  const moon = props.chart.grahas.find((position) => position.graha === 'moon')!;
  const currentDasha = getCurrentDasha(props.chart, new Date());
  const lagna = signPair(props.lang, props.chart.lagnaRashiIndex);
  const moonSign = signPair(props.lang, moon.rashiIndex);
  const chartSize = Math.min(208, props.width * 0.61);

  return (
    <LinearGradient
      colors={[colors.cardActiveFrom, colors.parchment]}
      style={[
        styles.card,
        {
          width: props.width,
          aspectRatio: 4 / 5,
          borderColor: colors.saffronDeep,
          borderRadius: radii.lg,
          padding: props.width * 0.051,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.orbit,
          {
            width: props.width * 0.53,
            height: props.width * 0.53,
            borderColor: colors.divider,
            borderRadius: props.width,
            top: props.width * 0.15,
          },
        ]}
      />
      <BrandHeader
        lang={props.lang}
        right={(
          <Text style={[styles.meta, { color: colors.inkMuted }]}>
            {contentByLang(props.lang, 'जन्म कुंडली', 'Birth Kundali')}
            {'\n'}
            {contentByLang(props.lang, 'लाहिरी · पूर्ण राशि भाव', 'Lahiri · Whole-sign houses')}
          </Text>
        )}
      />
      <View style={styles.kundaliHeading}>
        <Text
          style={[
            pillTextStyle(props.lang, typography.sectionLabel),
            styles.kicker,
            { color: colors.saffronDeep },
          ]}
        >
          {contentByLang(props.lang, 'जन्म कुंडली', 'Janma Kundali')}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: colors.ink,
            fontFamily: scriptTitleFont(props.lang, typography.readerTitle.fontFamily),
            fontSize: 24,
            marginTop: 1,
          }}
        >
          {props.profile.name || contentByLang(props.lang, 'आपकी कुंडली', 'Your Kundali')}
        </Text>
        <Text style={[styles.birthMeta, { color: colors.inkMuted }]}>
          {formatBirthDate(props.profile.date)} · {formatBirthTime(props.profile.time)} ·{' '}
          {contentByLang(props.lang, props.city.nameHi, props.city.nameEn)}
        </Text>
      </View>
      <View style={{ alignItems: 'center', marginTop: 6 }}>
        <NorthIndianChart chart={props.chart} size={chartSize} />
      </View>
      <View style={styles.chips}>
        {[
          `${lagna.primary} ${contentByLang(props.lang, 'लग्न', 'Lagna')}`,
          `${moonSign.primary} ${contentByLang(props.lang, 'चन्द्र', 'Moon')}`,
          currentDasha
            ? `${contentByLang(
              props.lang,
              GRAHA_NAMES_HI[currentDasha.maha.lord],
              GRAHA_NAMES_EN[currentDasha.maha.lord]
            )} ${contentByLang(props.lang, 'महादशा', 'Mahadasha')}`
            : `${contentByLang(
              props.lang,
              NAKSHATRA_NAMES_HI[moon.nakshatraIndex],
              NAKSHATRA_NAMES_EN[moon.nakshatraIndex]
            )} · ${contentByLang(props.lang, `पद ${moon.pada}`, `Pada ${moon.pada}`)}`,
        ].map((label) => (
          <View
            key={label}
            style={[
              styles.chip,
              {
                borderColor: colors.divider,
                backgroundColor: colors.cardSurface,
                borderRadius: radii.pill,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: colors.inkSoft }]}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.method, { borderTopColor: colors.divider }]}>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: scriptBodyFont(props.lang, typography.meaning.fontFamily),
            fontSize: 7.5,
            lineHeight: 10,
            textAlign: 'center',
          }}
        >
          {contentByLang(
            props.lang,
            'लाहिरी अयनांश · पूर्ण राशि भाव · उपकरण पर गणना',
            'Lahiri ayanamsa · Whole-sign houses · Computed on device'
          )}
          {'\n'}
          <Text style={{ color: colors.inkSoft }}>
            {contentByLang(
              props.lang,
              'वेदांश · पंचांग और ज्योतिष',
              'Vedansh · Panchang & Jyotish'
            )}
          </Text>
        </Text>
      </View>
    </LinearGradient>
  );
}

export default function JyotishShareCard(props: Props) {
  return props.kind === 'rashifal'
    ? <RashifalShareCard {...props} />
    : <KundaliShareCard {...props} />;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  orbit: {
    position: 'absolute',
    alignSelf: 'center',
    borderWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    zIndex: 1,
  },
  om: {
    fontFamily: fontFamilies.devanagariBold,
    fontSize: 18,
  },
  brandRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  meta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 7.5,
    lineHeight: 10,
    textAlign: 'right',
  },
  rule: {
    height: 1,
    marginVertical: 9,
  },
  signLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  signGlyph: {
    width: 46,
    height: 46,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signGlyphText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
  },
  kicker: {
    fontSize: 8,
  },
  signSecondary: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
  shareGuidance: {
    marginTop: 12,
    gap: 8,
  },
  shareGuidanceTight: {
    marginTop: 10,
    gap: 6,
  },
  shareGuidanceRow: {
    minHeight: 54,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
  },
  shareGuidanceRowTight: {
    minHeight: 51,
    paddingVertical: 7,
  },
  shareMarker: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareMarkerText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  shareLabel: {
    fontSize: 8.5,
  },
  sharePractice: {
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
  },
  sharePracticeText: {
    fontSize: 10,
    textAlign: 'center',
  },
  trust: {
    marginTop: 'auto',
    paddingTop: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  kundaliHeading: {
    alignItems: 'center',
  },
  birthMeta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 9.5,
    marginTop: 2,
    textAlign: 'center',
  },
  chips: {
    marginTop: 7,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8.5,
  },
  method: {
    marginTop: 'auto',
    paddingTop: 7,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
