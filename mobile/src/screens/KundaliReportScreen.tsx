import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import JyotishShareCard from '@/components/JyotishShareCard';
import JyotishShareSheet from '@/components/JyotishShareSheet';
import JyotishStateCard from '@/components/JyotishStateCard';
import NorthIndianChart from '@/components/NorthIndianChart';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import { buildKundaliHandoffText } from '@/panchang/kundaliHandoff';
import { buildKundaliReport } from '@/panchang/kundaliReport';
import type { KundaliReportSection } from '@/panchang/kundaliReportModel';
import { getCityById } from '@/panchang/locations';
import { useKundali } from '@/panchang/useKundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import {
  pillTextStyle,
  scriptBodyFont,
  scriptTitleFont,
} from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'KundaliReport'>;

const DATE_LOCALES: Record<Lang, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
};

function birthDateLabel(dateIso: string, locale: string): string {
  const [year, month, day] = dateIso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function birthTimeLabel(time: string | undefined): string | null {
  if (!time) return null;
  const [hour, minute] = time.split(':').map(Number);
  const meridiem = hour < 12 ? 'AM' : 'PM';
  const clockHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${clockHour}:${String(minute).padStart(2, '0')} ${meridiem}`;
}

export default function KundaliReportScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { chart, profile, loadState } = useKundali();
  const [shareVisible, setShareVisible] = useState(false);
  const now = useMemo(() => new Date(), []);
  const city = profile ? getCityById(profile.cityId) : null;

  const report = useMemo(() => {
    if (!chart || !profile || !city) return null;
    return buildKundaliReport(
      chart,
      {
        name: profile.name || null,
        birthDateLabelHi: birthDateLabel(profile.date, DATE_LOCALES.hi),
        birthDateLabelEn: birthDateLabel(profile.date, DATE_LOCALES.en),
        birthTimeLabel: birthTimeLabel(profile.time),
        cityNameHi: city.nameHi,
        cityNameEn: city.nameEn,
      },
      now
    );
  }, [chart, city, now, profile]);

  const openPractice = (sourceId: string) => {
    const entry = library.find((candidate) => candidate.id === sourceId);
    const target = entry ? buildEntryStartTarget(entry) : null;
    if (target) rootNav.navigate('HomeTab', target);
  };

  // The complete text export (chart table, dasha dates, every section, JSON
  // model) — for the user's notes or an AI assistant of their choice. It
  // carries every birth detail, so it goes out only through this explicit
  // warning + the OS share sheet; the app itself never contacts a service.
  const shareFullText = () => {
    if (!chart || !report) return;
    Alert.alert(
      contentByLang(lang, 'पूर्ण पाठ साझा करें', 'Share the full text'),
      contentByLang(
        lang,
        'इस पाठ में नाम, जन्म तिथि, समय, नगर, पूरी ग्रह-सारणी, दशा-क्रम और सम्पूर्ण विवेचन शामिल हैं। इसे आप नोट्स या अपनी पसंद के AI सहायक को सौंप सकते हैं — साझा करने से पहले जाँच लें।',
        'This text includes the chart name, birth date, time, city, the full graha table, the dasha sequence, and the whole reading. You can hand it to notes or an AI assistant of your choice — review it before sharing.'
      ),
      [
        { text: contentByLang(lang, 'रद्द करें', 'Cancel'), style: 'cancel' },
        {
          text: contentByLang(lang, 'साझा करें', 'Share'),
          onPress: () => {
            void Share.share({ message: buildKundaliHandoffText(chart, report) });
          },
        },
      ]
    );
  };

  const disclaimer = report && (
    <View
      style={[
        styles.disclaimer,
        {
          borderColor: colors.divider,
          backgroundColor: colors.goldTint,
          borderRadius: radii.md,
        },
      ]}
    >
      <Text
        style={{
          color: colors.inkSoft,
          fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
          fontSize: 11,
          lineHeight: 17,
        }}
      >
        {meaningByLang(lang, report.disclaimerHi, report.disclaimerEn)}
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={({ pressed }) => [
              styles.backButton,
              { borderColor: colors.divider, backgroundColor: colors.parchmentSoft },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text
              accessibilityLabel="Full Kundali reading"
              style={{
                color: colors.ink,
                fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                fontSize: 18,
              }}
            >
              {contentByLang(lang, 'पूर्ण कुंडली विवेचन', 'Full Kundali reading')}
            </Text>
            {report && (
              <Text style={[styles.caption, { color: colors.inkMuted }]}>
                {report.name ?? contentByLang(lang, 'आपकी जन्म कुंडली', 'Your birth chart')}
              </Text>
            )}
          </View>
          {report && (
            <Pressable
              onPress={() => setShareVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Share chart summary"
              style={({ pressed }) => [
                styles.sharePill,
                {
                  borderColor: colors.divider,
                  backgroundColor: colors.parchmentSoft,
                  borderRadius: radii.pill,
                },
                pressed && { opacity: 0.65 },
              ]}
            >
              <Text style={[styles.shareText, { color: colors.saffronDeep }]}>
                ↗ {contentByLang(lang, 'साझा करें', 'Share')}
              </Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.xxl,
            paddingBottom: spacing.xxl * 2,
          }}
          showsVerticalScrollIndicator={false}
        >
          {loadState === 'loading' && (
            <JyotishStateCard
              kind="loading"
              lang={lang}
              titleHi="विवेचन तैयार हो रहा है"
              titleEn="Preparing your reading"
              bodyHi="सहेजी गई कुंडली से पूर्ण विवेचन बन रहा है।"
              bodyEn="Compiling the full reading from your saved chart."
            />
          )}
          {loadState === 'error' && (
            <JyotishStateCard
              kind="error"
              lang={lang}
              titleHi="जन्म विवरण पढ़े नहीं जा सके"
              titleEn="We couldn’t read your birth details"
              bodyHi="कुछ हटाया नहीं गया। विवेचन के लिए कुंडली फिर बनाएँ।"
              bodyEn="Nothing was deleted. Rebuild your Kundali for the reading."
              actionHi="जन्म विवरण फिर भरें"
              actionEn="Re-enter birth details"
              actionAccessibilityLabel="Re-enter birth details"
              onAction={() => rootNav.navigate('Kundali')}
            />
          )}
          {loadState === 'guest' && (
            <>
              <View
                style={[
                  styles.empty,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.cardSurface,
                    borderRadius: radii.lg,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.inkMuted,
                    fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                    fontSize: 12,
                    lineHeight: 18,
                    textAlign: 'center',
                  }}
                >
                  {meaningByLang(
                    lang,
                    'पूर्ण विवेचन आपकी जन्म कुंडली से बनता है। एक बार कुंडली बनाएँ।',
                    'The full reading is compiled from your birth chart. Create your Kundali once.'
                  )}
                </Text>
              </View>
              <Pressable
                onPress={() => rootNav.navigate('Kundali')}
                accessibilityRole="button"
                accessibilityLabel="Create Kundali"
                style={({ pressed }) => [
                  styles.createButton,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    borderRadius: radii.pill,
                  },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text style={[styles.createText, { color: colors.saffronDeep }]}>
                  {contentByLang(lang, 'जन्म कुंडली बनाएँ', 'Create Kundali')}
                </Text>
              </Pressable>
            </>
          )}

          {report && chart && (
            <>
              {disclaimer}
              <Pressable
                onPress={shareFullText}
                accessibilityRole="button"
                accessibilityLabel="Share the full reading as text"
                style={({ pressed }) => [
                  styles.textShare,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    borderRadius: radii.md,
                  },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.ink,
                      fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
                      fontSize: 13,
                    }}
                  >
                    {contentByLang(lang, 'पूर्ण पाठ साझा करें', 'Share full text')}
                  </Text>
                  <Text
                    style={{
                      color: colors.inkMuted,
                      fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                      fontSize: 10.5,
                      lineHeight: 15,
                      marginTop: 2,
                    }}
                  >
                    {meaningByLang(
                      lang,
                      'पूरा विवेचन, ग्रह-सारणी व दशा-क्रम पाठ रूप में — नोट्स या AI सहायक के लिए।',
                      'The whole reading, graha table, and dasha sequence as text — for notes or an AI assistant.'
                    )}
                  </Text>
                </View>
                <Text style={{ color: colors.saffronDeep, fontSize: 16 }}>⇪</Text>
              </Pressable>
              <View
                style={[
                  styles.chartCard,
                  {
                    borderColor: colors.divider,
                    backgroundColor: colors.parchmentSoft,
                    borderRadius: radii.lg,
                  },
                  elevation.card,
                ]}
              >
                <NorthIndianChart chart={chart} size={224} />
              </View>
              {report.sections.map((section) => (
                <ReportSectionCard
                  key={section.id}
                  section={section}
                  lang={lang}
                  colors={colors}
                  typography={typography}
                  radii={radii}
                  onPractice={openPractice}
                />
              ))}
              {disclaimer}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {report && chart && profile && city && (
        <JyotishShareSheet
          visible={shareVisible}
          lang={lang}
          titleHi="कुंडली सार साझा करें"
          titleEn="Share the chart summary"
          privacyHi="इस कार्ड में नाम, जन्म तिथि, समय और नगर शामिल हैं। साझा करने से पहले जाँच लें।"
          privacyEn="This card includes the chart name, birth date, time, and city. Review it before sharing."
          onClose={() => setShareVisible(false)}
          renderCard={(width) => (
            <JyotishShareCard
              kind="kundali"
              width={width}
              lang={lang}
              chart={chart}
              profile={profile}
              city={city}
            />
          )}
        />
      )}
    </View>
  );
}

function ReportSectionCard({
  section,
  lang,
  colors,
  typography,
  radii,
  onPractice,
}: {
  section: KundaliReportSection;
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  onPractice: (sourceId: string) => void;
}) {
  const practice = section.practiceSourceId
    ? library.find((entry) => entry.id === section.practiceSourceId)
    : undefined;
  return (
    <View
      accessible
      accessibilityLabel={`${section.titleEn}. ${section.bodyEn.join(' ')}`}
      style={[
        styles.sectionCard,
        {
          borderColor: colors.divider,
          backgroundColor: colors.parchmentSoft,
          borderRadius: radii.lg,
        },
      ]}
    >
      <Text
        style={[
          pillTextStyle(lang, typography.sectionLabel),
          { color: colors.saffronDeep, fontSize: 10 },
        ]}
      >
        {contentByLang(lang, section.eyebrowHi, section.eyebrowEn)}
      </Text>
      <Text
        style={{
          color: colors.ink,
          fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily),
          fontSize: 16,
          marginTop: 4,
        }}
      >
        {contentByLang(lang, section.titleHi, section.titleEn)}
      </Text>
      {section.facts.length > 0 && (
        <View style={styles.factList}>
          {section.facts.map((factEntry) => (
            <View
              key={factEntry.id}
              style={[styles.factRow, { borderBottomColor: colors.divider }]}
            >
              <Text
                maxFontSizeMultiplier={1.25}
                style={[
                  pillTextStyle(lang, typography.sectionLabel),
                  styles.factLabel,
                  { color: colors.inkMuted },
                ]}
              >
                {contentByLang(lang, factEntry.labelHi, factEntry.labelEn)}
              </Text>
              <Text
                maxFontSizeMultiplier={1.25}
                style={{
                  flex: 1,
                  textAlign: 'right',
                  color: colors.ink,
                  fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                  fontSize: 12,
                  lineHeight: 18,
                }}
              >
                {contentByLang(lang, factEntry.valueHi, factEntry.valueEn)}
              </Text>
            </View>
          ))}
        </View>
      )}
      {section.bodyHi.map((paragraphHi, index) => (
        <Text
          key={`${section.id}-p${index}`}
          style={{
            color: colors.inkSoft,
            fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
            fontSize: 12,
            lineHeight: 19,
            marginTop: index === 0 ? 8 : 6,
          }}
        >
          {meaningByLang(lang, paragraphHi, section.bodyEn[index])}
        </Text>
      ))}
      {practice && (
        <Pressable
          onPress={() => onPractice(practice.id)}
          accessibilityRole="button"
          accessibilityLabel={`Open ${practice.nameEn} practice`}
          style={({ pressed }) => [
            styles.practiceLink,
            {
              borderColor: colors.divider,
              backgroundColor: colors.cardSurface,
              borderRadius: radii.pill,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.practiceLinkText, { color: colors.saffronDeep }]}>
            {contentByLang(lang, `${practice.nameHi} पढ़ें`, `Read ${practice.nameEn}`)} ›
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    // 44 to match every other back control (design.md §12).
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  caption: {
    fontFamily: fontFamilies.inter,
    fontSize: 12,
    lineHeight: 18,
  },
  sharePill: {
    minHeight: 36,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  disclaimer: {
    padding: 11,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 10,
  },
  empty: {
    padding: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  createButton: {
    minHeight: 44,
    marginTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
  textShare: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderWidth: 1,
    marginBottom: 10,
  },
  chartCard: {
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionCard: {
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  factList: {
    marginTop: 8,
  },
  factRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
  },
  factLabel: {
    fontSize: 12,
  },
  practiceLink: {
    minHeight: 38,
    marginTop: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceLinkText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 10,
  },
});
