/**
 * दान-पुण्य home (PRD-26, design.md §73) — the educate-first surface. Opens on
 * महत्व: today's occasion line (panchang-resolved), the vaar-daan row, the full
 * verse spine rendered inline, the teaching-kathas, and one quiet खाता door at
 * the end. THE RELAXED §2.7 CONTRACT LIVES HERE: educate is the default, not a
 * gate. The home now carries a standing दान करें door (into the journey) and a
 * quiet दान-द्वार link (into the verified-orgs directory). The app still never
 * transacts — the hand-off is the org's own site behind the interstitial — and
 * the खाता (ledger) is never gated.
 */
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import {
  DAAN_VAAR_ENTRIES,
  getDaanKathas,
  getDaanOccasionForRule,
  getDaanPrinciples,
} from '@/data/daan';
import { usePanchangCalendarSystem, useObservancesForDate } from '@/panchang/usePanchang';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang, pick, verseLinesByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanPunya'>;

export default function DaanPunyaScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const [calendarSystem] = usePanchangCalendarSystem();
  const today = new Date();
  const observances = useObservancesForDate(today, calendarSystem);
  // First covered observance wins the "आज" card; no match ⇒ the card is absent
  // (never a placeholder), and the vaar row still serves the guest (U2).
  const todayMatch = observances
    .map((o) => ({ occasion: getDaanOccasionForRule(o.rule.id), ruleId: o.rule.id }))
    .find((m) => m.occasion != null);
  const [vaarIdx, setVaarIdx] = useState(today.getDay());
  const vaar = DAAN_VAAR_ENTRIES[vaarIdx];

  const principles = getDaanPrinciples();
  const kathas = getDaanKathas();

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-punya-screen">
      <ReaderHeader
        title={contentByLang(lang, 'दान-पुण्य', 'Daan Punya')}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 20, color: colors.inkSoft, textAlign: 'center', marginTop: spacing.sm }}>
          {contentByLang(lang, 'जप · व्रत · दान — साधना का तीसरा चरण', 'Japa · vrat · daan — the third limb of sadhana')}
        </Text>

        <View style={styles.doorBlock}>
          <Pressable
            testID="daan-home-donate"
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'दान करें', 'Donate')}
            onPress={() =>
              navigation.navigate(
                'DaanJourney',
                todayMatch?.occasion ? { occasionId: todayMatch.occasion.id } : {}
              )
            }
            style={[styles.donateBtn, { backgroundColor: colors.saffron, borderRadius: radii.pill }, elevation.card]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.onPrimary }}>
              {contentByLang(lang, 'दान करें', 'Donate')}
            </Text>
          </Pressable>
          <Pressable
            testID="daan-home-dwaar"
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'दान-द्वार — सत्यापित संस्थाएँ', 'Daan-dwaar — verified orgs')}
            onPress={() => navigation.navigate('DaanDirectory', {})}
            style={styles.dwaarLink}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
              {contentByLang(lang, 'दान-द्वार — सत्यापित संस्थाएँ ›', 'Daan-dwaar — verified orgs ›')}
            </Text>
          </Pressable>
          <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.gold, textAlign: 'center', marginTop: 4 }}>
            {contentByLang(
              lang,
              'पहले समझें, फिर दें — या सीधे द्वार पर जाएँ।',
              'Understand first, then give — or go straight to the door.'
            )}
          </Text>
        </View>

        {todayMatch?.occasion ? (
          <>
            <Text style={sectionLabelStyle}>{contentByLang(lang, 'आज के दान का महत्व', "Today's daan")}</Text>
            <View
              testID="daan-today-card"
              style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder, borderRadius: radii.lg }, elevation.card]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>
                {contentByLang(lang, todayMatch.occasion.titleHi, todayMatch.occasion.titleEn)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, marginTop: 6 }}>
                {meaningByLang(lang, todayMatch.occasion.whyHi, todayMatch.occasion.whyEn)}
              </Text>
              <Pressable
                testID="daan-today-journey"
                accessibilityRole="button"
                accessibilityLabel="Open today's daan journey"
                onPress={() => navigation.navigate('DaanJourney', { occasionId: todayMatch.occasion!.id })}
                style={[styles.journeyBtn, { borderColor: colors.saffron, borderRadius: radii.pill }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                  {contentByLang(lang, 'इस दिन की दान-यात्रा ›', "This day's daan journey ›")}
                </Text>
              </Pressable>
            </View>
          </>
        ) : null}

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'इस वार का दान', 'This vaar')}</Text>
        <View style={styles.vaarRow}>
          {DAAN_VAAR_ENTRIES.map((entry) => {
            const active = entry.weekday === vaarIdx;
            return (
              <Pressable
                key={entry.weekday}
                testID={`daan-vaar-${entry.weekday}`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Vaar ${entry.vaarEn}`}
                onPress={() => setVaarIdx(entry.weekday)}
                style={[
                  styles.vaarChip,
                  {
                    borderColor: active ? colors.cardActiveBorder : colors.border,
                    backgroundColor: active ? colors.goldChipBg : colors.surface,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 11.5, lineHeight: 18, color: active ? colors.saffronDeep : colors.inkSoft }}>
                  {contentByLang(lang, entry.vaarHi.slice(0, 2), entry.vaarEn.slice(0, 2))}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View testID="daan-vaar-line" style={[styles.vaarLine, { backgroundColor: colors.goldChipBg, borderRadius: radii.md }]}>
          <Text style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.inkSoft }}>
            {contentByLang(lang, `${vaar.vaarHi} — ${vaar.grahaHi}: ${vaar.itemsHi}`, `${vaar.vaarEn} — ${vaar.grahaEn}: ${vaar.itemsEn}`)}
          </Text>
        </View>

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'शास्त्र क्या कहते हैं', 'What the shastra says')}</Text>
        {principles.map((entry) => (
          <View
            key={entry.id}
            testID={`daan-principle-${entry.id}`}
            style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
          >
            {entry.verseLines ? (
              <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 26, color: colors.ink, textAlign: 'center' }}>
                {verseLinesByLang(lang, entry.verseLines, entry.iastLines ?? entry.verseLines).join('\n')}
              </Text>
            ) : (
              <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 22, color: colors.ink }}>
                {contentByLang(lang, entry.titleHi, entry.titleEn)}
              </Text>
            )}
            <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 10.5, letterSpacing: lang === 'en' ? 0.6 : 0, color: colors.gold, textAlign: 'center', textTransform: 'uppercase', marginTop: 8 }}>
              {contentByLang(lang, entry.citeHi, entry.citeEn)}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, marginTop: 8 }}>
              {meaningByLang(lang, entry.meaningHi, entry.meaningEn)}
            </Text>
            {entry.gitaRef ? (
              <Pressable
                testID="daan-gita-link"
                accessibilityRole="button"
                accessibilityLabel="Read in the Gita reader"
                onPress={() =>
                  rootNav.navigate('HomeTab', {
                    screen: 'GitaReader',
                    params: { chapter: entry.gitaRef!.chapter, initialIndex: entry.gitaRef!.verseIndex },
                  })
                }
                style={[styles.journeyBtn, { borderColor: colors.saffron, borderRadius: radii.pill, alignSelf: 'center' }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                  {contentByLang(lang, 'गीता में पढ़ें ›', 'Read in the Gita ›')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ))}

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'दान की कथाएँ', 'Stories of giving')}</Text>
        {kathas.map((katha) => (
          <Pressable
            key={katha.id}
            testID={`daan-katha-${katha.id}`}
            accessibilityRole="button"
            accessibilityLabel={`Story ${katha.titleEn}`}
            onPress={() => navigation.navigate('DaanKatha', { kathaId: katha.id })}
            style={[styles.rowCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
          >
            <View style={{ flex: 1 }}>
              {/* 22 leading, not 21: at 14.5 the semibold Devanagari matras (दानवीर, शिबि) sit
                  above a 1.45× box and the row card sliced their tops — §2 floor is ≥1.5×. */}
              <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: colors.ink }}>
                {contentByLang(lang, katha.titleHi, katha.titleEn)}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
                {contentByLang(lang, katha.subtitleHi, katha.subtitleEn)}
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
          </Pressable>
        ))}

        <Text style={sectionLabelStyle}>{contentByLang(lang, 'मेरा खाता', 'My register')}</Text>
        <Pressable
          testID="daan-ledger-door"
          accessibilityRole="button"
          accessibilityLabel="Daan ledger"
          onPress={() => navigation.navigate('DaanLedger')}
          style={[styles.rowCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.cardActiveBorder, borderRadius: radii.lg }, elevation.card]}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 22, color: colors.ink }}>
              {contentByLang(lang, 'मेरा दान-पुण्य खाता', 'My daan-punya register')}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
              {pick(lang, {
                hi: 'निजी — केवल इस डिवाइस पर',
                en: 'Private — on this device only',
                gu: 'ખાનગી — માત્ર આ ડિવાઇસ પર',
                kn: 'ಖಾಸಗಿ — ಈ ಸಾಧನದಲ್ಲಿ ಮಾತ್ರ',
              })}
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
        </Pressable>

        <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, marginTop: spacing.lg, textAlign: 'center' }}>
          {meaningByLang(
            lang,
            'यह परम्परा का परिचय है — मात्रा नहीं, भाव मापदण्ड है। यहाँ कोई अंक, कोई लक्ष्य, कोई तुलना नहीं।',
            'This introduces the tradition — bhaav, not amount, is the measure. There is no score here, no target, no comparison.'
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 13, marginBottom: 10 },
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  journeyBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, marginTop: 11, alignSelf: 'flex-start' },
  doorBlock: { alignItems: 'center', marginTop: 14, gap: 8 },
  donateBtn: { paddingHorizontal: 32, paddingVertical: 11, alignSelf: 'center' },
  dwaarLink: { paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'center' },
  vaarRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  vaarChip: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, minWidth: 38, alignItems: 'center' },
  vaarLine: { paddingHorizontal: 12, paddingVertical: 9, marginTop: 9 },
});
