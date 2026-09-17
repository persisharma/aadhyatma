import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BasisChain from '@/components/BasisChain';
import JyotishStateCard from '@/components/JyotishStateCard';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import { RASHI_NAMES_EN, RASHI_NAMES_HI } from '@/panchang/kundali';
import { buildPrashnaAnswer, STRENGTH_LABEL_EN, STRENGTH_LABEL_HI, type PrashnaStrength } from '@/panchang/prashna';
import { PRASHNA_PURPOSES, isPurposeId, type PurposeId } from '@/panchang/prashnaPurposes';
import { ageYears } from '@/panchang/reportFormat';
import { useKundali } from '@/panchang/useKundali';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'Prashna'>;

/**
 * प्रश्न — ask the saved chart a purpose (PRD-43 Wave D; design.md §72).
 *
 * A picker of nine purposes (gated by the subject's derived age, the closed
 * ones dimmed WITH their reason), then the answer in six fixed blocks:
 * सार · आधार · बल/बाधा · काल · दिशा · उपाय. The engine is pure; this screen
 * supplies "now", the active person's chart and the reading language, and
 * renders the आधार chains that make every sentence auditable (§14.3.1).
 */

/** Purposes whose दिशा hands off to the Muhurat finder for "when to begin". */
const MUHURAT_PURPOSES: readonly PurposeId[] = ['vyapar', 'yatra', 'vivah'];

export default function PrashnaScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { chart, profile, loadState } = useKundali();
  const now = useMemo(() => new Date(), []);
  const initial = route.params?.purposeId;
  const [purposeId, setPurposeId] = useState<PurposeId>(
    initial && isPurposeId(initial) ? initial : 'vidya'
  );

  const age = chart ? ageYears(chart.input.date, now) : null;
  const answer = useMemo(
    () => (chart ? buildPrashnaAnswer(chart, purposeId, now) : null),
    [chart, purposeId, now]
  );
  const moon = chart?.grahas.find((position) => position.graha === 'moon');

  const openPractice = (sourceId: string) => {
    const entry = library.find((candidate) => candidate.id === sourceId);
    const target = entry ? buildEntryStartTarget(entry) : null;
    if (target) rootNav.navigate('HomeTab', target);
  };

  const eyebrow = (hi: string, en: string) => (
    <Text style={[pillTextStyle(lang, typography.sectionLabel), { color: colors.saffronDeep, fontSize: 10 }]}>
      {contentByLang(lang, hi, en)}
    </Text>
  );
  const bodyText = (hi: string, en: string, key?: string, muted = false) => (
    <Text
      key={key}
      style={{
        color: muted ? colors.inkMuted : colors.inkSoft,
        fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
        fontSize: 12,
        lineHeight: 19,
        marginTop: 6,
      }}
    >
      {meaningByLang(lang, hi, en)}
    </Text>
  );
  const card = (children: React.ReactNode, active = false, key?: string, label?: string) => (
    <View
      key={key}
      accessible={Boolean(label)}
      accessibilityLabel={label}
      style={[
        styles.card,
        {
          borderColor: active ? colors.cardActiveBorder : colors.divider,
          backgroundColor: active ? colors.cardActiveFrom : colors.parchmentSoft,
          borderRadius: radii.lg,
        },
        active && elevation.card,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]} style={StyleSheet.absoluteFill} />
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
          <View style={{ flex: 1 }}>
            <Text
              accessibilityLabel="Prashna"
              style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 18 }}
            >
              {contentByLang(lang, 'प्रश्न', 'Prashna')}
            </Text>
            <Text style={[styles.caption, { color: colors.inkMuted }]}>
              {contentByLang(lang, 'अपनी कुंडली से पूछें', 'Ask your chart')}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl * 2 }}
          showsVerticalScrollIndicator={false}
        >
          {loadState === 'loading' && (
            <JyotishStateCard kind="loading" lang={lang} titleHi="कुंडली पढ़ी जा रही है" titleEn="Reading your chart" bodyHi="सहेजी गई कुंडली से उत्तर बन रहा है।" bodyEn="Composing the answer from your saved chart." />
          )}
          {loadState === 'error' && (
            <JyotishStateCard
              kind="error"
              lang={lang}
              titleHi="जन्म विवरण पढ़े नहीं जा सके"
              titleEn="We couldn’t read your birth details"
              bodyHi="कुछ हटाया नहीं गया। प्रश्न के लिए कुंडली फिर बनाएँ।"
              bodyEn="Nothing was deleted. Rebuild your Kundali to ask it a question."
              actionHi="जन्म विवरण फिर भरें"
              actionEn="Re-enter birth details"
              actionAccessibilityLabel="Re-enter birth details"
              onAction={() => rootNav.navigate('Kundali')}
            />
          )}
          {loadState === 'guest' && (
            <>
              <View style={[styles.empty, { borderColor: colors.divider, backgroundColor: colors.cardSurface, borderRadius: radii.lg }]}>
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
                    'प्रश्न आपकी जन्म कुंडली से उत्तर देता है। एक बार कुंडली बनाएँ — फिर विद्या, व्यापार, नौकरी जैसे नौ विषयों पर पूछें।',
                    'Prashna answers from your birth chart. Create your Kundali once — then ask about study, business, work and six more purposes.'
                  )}
                </Text>
              </View>
              <Pressable
                onPress={() => rootNav.navigate('Kundali')}
                accessibilityRole="button"
                accessibilityLabel="Create Kundali"
                style={({ pressed }) => [
                  styles.createButton,
                  { borderColor: colors.divider, backgroundColor: colors.parchmentSoft, borderRadius: radii.pill },
                  pressed && { opacity: 0.72 },
                ]}
              >
                <Text style={[styles.practiceLinkText, { color: colors.saffronDeep }]}>
                  {contentByLang(lang, 'जन्म कुंडली बनाएँ', 'Create Kundali')}
                </Text>
              </Pressable>
            </>
          )}

          {chart && profile && answer && moon && (
            <>
              {card(
                <>
                  {eyebrow('किसके लिए', 'For whom')}
                  <Text style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
                    {profile.name
                      ? contentByLang(lang, `${profile.name} · ${RASHI_NAMES_HI[chart.lagnaRashiIndex]} लग्न`, `${profile.name} · ${RASHI_NAMES_EN[chart.lagnaRashiIndex]} Lagna`)
                      : contentByLang(lang, `${RASHI_NAMES_HI[chart.lagnaRashiIndex]} लग्न`, `${RASHI_NAMES_EN[chart.lagnaRashiIndex]} Lagna`)}
                  </Text>
                  {bodyText(
                    `${RASHI_NAMES_HI[moon.rashiIndex]} चन्द्र · आयु ${answer.ageLabelHi} (${answer.asOfLabelHi} को)`,
                    `${RASHI_NAMES_EN[moon.rashiIndex]} Moon · age ${answer.ageLabelEn} (as of ${answer.asOfLabelEn})`,
                    undefined,
                    true
                  )}
                </>,
                false,
                'who',
                'Whose chart'
              )}

              {/* Purpose picker — closed purposes stay visible WITH their reason. */}
              <Text style={[pillTextStyle(lang, typography.sectionLabel), styles.sectionLabel, { color: colors.inkMuted }]}>
                {contentByLang(lang, 'विषय चुनें', 'Choose a purpose')}
              </Text>
              <View style={styles.grid} accessibilityLabel="Purpose picker">
                {PRASHNA_PURPOSES.map((purpose) => {
                  const open = age !== null && age >= purpose.minAge;
                  const selected = purpose.id === purposeId;
                  return (
                    <Pressable
                      key={purpose.id}
                      testID={`purpose-${purpose.id}`}
                      disabled={!open}
                      onPress={() => setPurposeId(purpose.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected, disabled: !open }}
                      accessibilityLabel={`Purpose ${purpose.nameEn}${open ? '' : `, closed until age ${purpose.minAge}`}`}
                      style={({ pressed }) => [
                        styles.purpose,
                        {
                          borderColor: selected ? colors.cardActiveBorder : colors.divider,
                          backgroundColor: selected ? colors.cardActiveFrom : colors.cardSurface,
                          borderRadius: radii.md,
                          opacity: open ? (pressed ? 0.7 : 1) : 0.45,
                        },
                      ]}
                    >
                      <Text style={{ color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 14 }}>
                        {contentByLang(lang, purpose.nameHi, purpose.nameEn)}
                      </Text>
                      <Text style={[styles.purposeSub, { color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                        {open
                          ? meaningByLang(lang, purpose.askHi, purpose.askEn)
                          : meaningByLang(lang, `${purpose.minAge} वर्ष के बाद`, `From age ${purpose.minAge}`)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {answer.gated ? (
                card(
                  <>
                    {eyebrow('अभी नहीं', 'Not yet')}
                    {bodyText(answer.gateReasonHi ?? '', answer.gateReasonEn ?? '')}
                  </>,
                  false,
                  'gate',
                  'Purpose closed'
                )
              ) : (
                <>
                  {/* सार */}
                  {card(
                    <>
                      <View style={styles.saarHead}>
                        {eyebrow('सार · संक्षिप्त उत्तर', 'The short answer')}
                        <StrengthPill strength={answer.strength!} lang={lang} />
                      </View>
                      <Text
                        testID="prashna-saar"
                        style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}
                      >
                        {meaningByLang(lang, answer.saarTitleHi, answer.saarTitleEn)}
                      </Text>
                      {bodyText(answer.saarBodyHi, answer.saarBodyEn)}
                    </>,
                    true,
                    'saar',
                    `Short answer: ${answer.saarTitleEn}`
                  )}

                  {/* आधार */}
                  {card(
                    <>
                      {eyebrow('आधार · यह क्यों', 'Basis · why this reading')}
                      {bodyText(answer.aadhaarIntroHi, answer.aadhaarIntroEn)}
                      {answer.chains.map((chain, index) => (
                        <BasisChain
                          key={`chain-${index}`}
                          basis={chain.basis}
                          lang={lang}
                          labelHi={chain.labelHi}
                          labelEn={chain.labelEn}
                          testID={`prashna-chain-${index}`}
                        />
                      ))}
                    </>,
                    false,
                    'aadhaar',
                    'Basis for the reading'
                  )}

                  {/* बल / बाधा */}
                  {card(
                    <>
                      {eyebrow('बल और बाधा', 'What supports, what resists')}
                      <View style={styles.split}>
                        <View style={[styles.col, { backgroundColor: colors.goldTint, borderRadius: radii.md }]}>
                          <Text style={[pillTextStyle(lang, typography.sectionLabel), { color: colors.saffronDeep, fontSize: 10 }]}>
                            {contentByLang(lang, 'जो साथ देता है', 'Supports')}
                          </Text>
                          {answer.supports.length === 0
                            ? bodyText('— कोई स्पष्ट बल नहीं', '— no clear support', 'sup-none', true)
                            : answer.supports.map((f) => bodyText(f.textHi, f.textEn, f.id))}
                        </View>
                        <View style={[styles.col, { backgroundColor: colors.avoidTint, borderRadius: radii.md }]}>
                          <Text style={[pillTextStyle(lang, typography.sectionLabel), { color: colors.avoidDeep, fontSize: 10 }]}>
                            {contentByLang(lang, 'जो रोकता है', 'Resists')}
                          </Text>
                          {answer.resists.length === 0
                            ? bodyText('— कोई स्पष्ट बाधा नहीं', '— no clear resistance', 'res-none', true)
                            : answer.resists.map((f) => bodyText(f.textHi, f.textEn, f.id))}
                        </View>
                      </View>
                    </>,
                    false,
                    'balbadha',
                    'Supports and resists'
                  )}

                  {/* काल */}
                  {card(
                    <>
                      {eyebrow('काल · अनुकूल अवधियाँ', 'Windows · supportive periods')}
                      {bodyText(answer.kaalIntroHi, answer.kaalIntroEn, undefined, true)}
                      {answer.windows.map((w) => (
                        <View
                          key={w.id}
                          testID={`prashna-window-${w.id}`}
                          style={[
                            styles.window,
                            {
                              backgroundColor: colors.cardSurface,
                              borderLeftColor: w.relevant ? colors.gold : colors.divider,
                              borderRadius: radii.md,
                              opacity: w.relevant ? 1 : 0.82,
                            },
                          ]}
                        >
                          <Text style={[styles.windowDate, { color: colors.ink }]}>
                            {contentByLang(lang, w.labelHi, w.labelEn)}
                            {w.current ? contentByLang(lang, ' · अभी', ' · now') : ''}
                          </Text>
                          {bodyText(w.textHi, w.textEn)}
                        </View>
                      ))}
                    </>,
                    false,
                    'kaal',
                    'Supportive windows'
                  )}

                  {/* दिशा */}
                  {card(
                    <>
                      {eyebrow('दिशा · क्या करें', 'Direction · what to do')}
                      {answer.dishaHi.map((hi, index) => (
                        <View key={`disha-${index}`} style={styles.dishaRow}>
                          <Text style={{ color: colors.saffron, fontSize: 12, lineHeight: 19, marginTop: 6 }}>—</Text>
                          <View style={{ flex: 1 }}>{bodyText(hi, answer.dishaEn[index])}</View>
                        </View>
                      ))}
                      <View style={styles.actions}>
                        {MUHURAT_PURPOSES.includes(purposeId) && (
                          <ActionPill lang={lang} hi="मुहूर्त खोजें" en="Find a muhurat" a11y="Open Muhurat finder" onPress={() => rootNav.navigate('MuhuratFinder')} />
                        )}
                        {purposeId === 'vivah' && (
                          <ActionPill lang={lang} hi="गुण मिलान" en="Guna Milan" a11y="Open Guna Milan" onPress={() => rootNav.navigate('GunaMilan')} />
                        )}
                        <ActionPill lang={lang} hi="पूर्ण विवेचन" en="Full reading" a11y="Open full Kundali reading" onPress={() => rootNav.navigate('KundaliReport')} />
                      </View>
                    </>,
                    false,
                    'disha',
                    'Direction'
                  )}

                  {/* उपाय */}
                  {(() => {
                    const practice = library.find((entry) => entry.id === answer.practiceSourceId);
                    if (!practice) return null;
                    return card(
                      <>
                        {eyebrow('उपाय · साधना', 'Practice')}
                        <Text style={[styles.title, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15 }]}>
                          {contentByLang(lang, practice.nameHi, practice.nameEn)}
                        </Text>
                        {bodyText(answer.practiceNoteHi, answer.practiceNoteEn, undefined, true)}
                        <Pressable
                          onPress={() => openPractice(practice.id)}
                          accessibilityRole="button"
                          accessibilityLabel={`Open ${practice.nameEn} practice`}
                          style={({ pressed }) => [
                            styles.practiceLink,
                            { borderColor: colors.divider, backgroundColor: colors.cardSurface, borderRadius: radii.pill },
                            pressed && { opacity: 0.7 },
                          ]}
                        >
                          <Text style={[styles.practiceLinkText, { color: colors.saffronDeep }]}>
                            {contentByLang(lang, `${practice.nameHi} पढ़ें`, `Read ${practice.nameEn}`)} ›
                          </Text>
                        </Pressable>
                      </>,
                      true,
                      'upaya',
                      'Practice'
                    );
                  })()}
                </>
              )}

              <Text
                style={[
                  styles.footer,
                  { color: colors.inkMuted, borderTopColor: colors.divider, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) },
                ]}
              >
                {meaningByLang(lang, answer.footerHi, answer.footerEn)}
              </Text>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StrengthPill({ strength, lang }: { strength: PrashnaStrength; lang: Lang }) {
  const { colors, radii } = useTheme();
  const tint = strength === 'prabal' ? colors.goldChipBg : strength === 'ksheen' ? colors.avoidChipBg : colors.cardSurface;
  const ink = strength === 'ksheen' ? colors.avoidDeep : strength === 'prabal' ? colors.saffronDeep : colors.inkSoft;
  const bars = strength === 'prabal' ? 3 : strength === 'madhyam' ? 2 : 1;
  return (
    <View
      testID="prashna-strength"
      accessibilityLabel={`Strength ${STRENGTH_LABEL_EN[strength]}`}
      style={[styles.pill, { backgroundColor: tint, borderColor: colors.divider, borderRadius: radii.pill }]}
    >
      <Text style={[styles.pillText, { color: ink }]}>
        {contentByLang(lang, STRENGTH_LABEL_HI[strength], STRENGTH_LABEL_EN[strength]).toUpperCase()}
      </Text>
      <View style={styles.bars}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={[styles.bar, { backgroundColor: ink, opacity: index < bars ? 1 : 0.28 }]} />
        ))}
      </View>
    </View>
  );
}

function ActionPill({ lang, hi, en, a11y, onPress }: { lang: Lang; hi: string; en: string; a11y: string; onPress: () => void }) {
  const { colors, radii } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [
        styles.practiceLink,
        { borderColor: colors.divider, backgroundColor: colors.cardSurface, borderRadius: radii.pill, marginTop: 0 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.practiceLinkText, { color: colors.saffronDeep }]}>{contentByLang(lang, hi, en)} ›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  caption: { fontFamily: fontFamilies.inter, fontSize: 12, lineHeight: 18 },
  sectionLabel: { fontSize: 10, marginTop: 4, marginBottom: 8 },
  card: { padding: 14, borderWidth: 1, marginBottom: 10 },
  empty: { padding: 18, borderWidth: 1, borderStyle: 'dashed' },
  createButton: { minHeight: 44, marginTop: 12, paddingHorizontal: 16, borderWidth: 1, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 16, marginTop: 4, lineHeight: 22 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  purpose: { width: '48%', minHeight: 72, padding: 11, borderWidth: 1 },
  purposeSub: { fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  saarHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1 },
  pillText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 0.9 },
  bars: { flexDirection: 'row', gap: 2 },
  bar: { width: 3, height: 9, borderRadius: 1 },
  split: { flexDirection: 'row', gap: 8, marginTop: 8 },
  col: { flex: 1, padding: 10 },
  window: { padding: 10, borderLeftWidth: 2, marginTop: 8 },
  windowDate: { fontFamily: fontFamilies.interSemiBold, fontSize: 11, fontVariant: ['tabular-nums'] },
  dishaRow: { flexDirection: 'row', gap: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  practiceLink: { minHeight: 38, marginTop: 10, paddingHorizontal: 13, borderWidth: 1, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center' },
  practiceLinkText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10 },
  footer: { fontSize: 10.5, lineHeight: 16, marginTop: 8, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
