/**
 * दान-यात्रा (PRD-26 §4a) — the canonical occasion journey as a stepper:
 * महत्व → शास्त्र → कथा → क्या दें → संकल्प-भाव. THE TERMINAL RULE IS
 * STRUCTURAL: the record and दान-द्वार actions exist in the tree only on the
 * last step (never "skippable in one scroll-tap"), record leads, and the
 * directory door here is the ONLY path to DaanDirectory in the app. A user
 * who leaves at any step has been fully served — no nagging toward the end.
 */
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import ReaderHeader from '@/components/ReaderHeader';
import { useGitaLanguage } from '@/data/gita/language';
import { getDaanCause, getDaanKatha, getDaanOccasion, getDaanPrinciples } from '@/data/daan';
import { getKathaContent } from '@/panchang/kathaContent';
import type { DaanStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { contentByLang, meaningByLang, verseLinesByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<DaanStackParamList, 'DaanJourney'>;

type StepKind = 'mahatva' | 'shastra' | 'katha' | 'items' | 'sankalp';

export default function DaanJourneyScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);
  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);

  const occasion = getDaanOccasion(route.params.occasionId);
  const sattvik = getDaanPrinciples().find((p) => p.id === 'sattvik-daan') ?? null;
  const shippedKatha = occasion?.kathaId ? getKathaContent(occasion.kathaId) : null;
  const daanKatha = occasion?.daanKathaId ? getDaanKatha(occasion.daanKathaId) : null;

  const steps = useMemo<StepKind[]>(() => {
    const list: StepKind[] = ['mahatva', 'shastra'];
    if (shippedKatha || daanKatha) list.push('katha');
    list.push('items', 'sankalp');
    return list;
  }, [shippedKatha, daanKatha]);
  const [stepIdx, setStepIdx] = useState(0);

  if (!occasion) {
    // An unknown/retired occasion id: nothing to teach — leave quietly.
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
        <ReaderHeader title={contentByLang(lang, 'दान', 'Daan')} variant="index" onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  const stepLabel = (() => {
    const n = `${stepIdx + 1}/${steps.length}`;
    switch (step) {
      case 'mahatva':
        return contentByLang(lang, `चरण ${n} · महत्व`, `Step ${n} · Why`);
      case 'shastra':
        return contentByLang(lang, `चरण ${n} · शास्त्र`, `Step ${n} · Shastra`);
      case 'katha':
        return contentByLang(lang, `चरण ${n} · कथा`, `Step ${n} · Katha`);
      case 'items':
        return contentByLang(lang, `चरण ${n} · क्या दें`, `Step ${n} · What to give`);
      case 'sankalp':
        return contentByLang(lang, `चरण ${n} · संकल्प-भाव`, `Step ${n} · Sankalp bhaav`);
    }
  })();

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']} testID="daan-journey-screen">
      <ReaderHeader
        title={contentByLang(lang, occasion.titleHi, occasion.titleEn)}
        variant="index"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
        <View style={styles.dots}>
          {steps.map((s, i) => (
            <View
              key={s}
              style={[
                styles.dot,
                { backgroundColor: i === stepIdx ? colors.saffron : colors.border, width: i === stepIdx ? 22 : 7 },
              ]}
            />
          ))}
        </View>
        <Text
          style={{
            fontFamily: typography.sectionLabel.fontFamily,
            fontSize: typography.sectionLabel.fontSize,
            letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
            color: colors.gold,
            textTransform: 'uppercase',
            marginBottom: spacing.sm,
          }}
        >
          {stepLabel}
        </Text>

        {step === 'mahatva' && (
          <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
            <Text style={{ fontFamily: bodyFont, fontSize: 13.5, lineHeight: 22, color: colors.inkSoft }}>
              {meaningByLang(lang, occasion.whyHi, occasion.whyEn)}
            </Text>
          </View>
        )}

        {step === 'shastra' && sattvik && (
          <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
            {sattvik.verseLines ? (
              <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 26, color: colors.ink, textAlign: 'center' }}>
                {verseLinesByLang(lang, sattvik.verseLines, sattvik.iastLines ?? sattvik.verseLines).join('\n')}
              </Text>
            ) : null}
            <Text style={{ fontFamily: typography.sectionLabel.fontFamily, fontSize: 10.5, letterSpacing: lang === 'en' ? 0.6 : 0, color: colors.gold, textAlign: 'center', textTransform: 'uppercase', marginTop: 8 }}>
              {contentByLang(lang, sattvik.citeHi, sattvik.citeEn)}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, marginTop: 8 }}>
              {meaningByLang(lang, sattvik.meaningHi, sattvik.meaningEn)}
            </Text>
            {sattvik.gitaRef ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Read in the Gita reader"
                onPress={() =>
                  rootNav.navigate('HomeTab', {
                    screen: 'GitaReader',
                    params: { chapter: sattvik.gitaRef!.chapter, initialIndex: sattvik.gitaRef!.verseIndex },
                  })
                }
                style={[styles.chipBtn, { borderColor: colors.saffron, borderRadius: radii.pill, alignSelf: 'center' }]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12.5, color: colors.saffronDeep }}>
                  {contentByLang(lang, 'गीता में पढ़ें ›', 'Read in the Gita ›')}
                </Text>
              </Pressable>
            ) : null}
          </View>
        )}

        {step === 'katha' && (
          <>
            {shippedKatha ? (
              <Pressable
                testID="daan-journey-shipped-katha"
                accessibilityRole="button"
                accessibilityLabel={`Read katha ${shippedKatha.titleEn}`}
                onPress={() =>
                  rootNav.navigate('HomeTab', { screen: 'VratKathaReader', params: { kathaId: occasion.kathaId } })
                }
                style={[styles.rowCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>
                    {contentByLang(lang, shippedKatha.titleHi, shippedKatha.titleEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
                    {contentByLang(lang, 'कथा-कोश में पढ़ें', 'Read in the katha library')}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
              </Pressable>
            ) : null}
            {daanKatha ? (
              <Pressable
                testID="daan-journey-daan-katha"
                accessibilityRole="button"
                accessibilityLabel={`Read story ${daanKatha.titleEn}`}
                onPress={() => navigation.navigate('DaanKatha', { kathaId: daanKatha.id })}
                style={[styles.rowCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: titleFont, fontSize: 14.5, lineHeight: 21, color: colors.ink }}>
                    {contentByLang(lang, daanKatha.titleHi, daanKatha.titleEn)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, marginTop: 2 }}>
                    {contentByLang(lang, daanKatha.subtitleHi, daanKatha.subtitleEn)}
                  </Text>
                </View>
                <Text style={{ fontSize: 18, color: colors.inkMuted }}>›</Text>
              </Pressable>
            ) : null}
          </>
        )}

        {step === 'items' && (
          <>
            {occasion.items.map((item) => (
              <View
                key={item.id}
                style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg, marginBottom: 8 }, elevation.card]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 14, lineHeight: 21, color: colors.ink }}>
                  {contentByLang(lang, item.nameHi, item.nameEn)}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 12, lineHeight: 18, color: colors.inkMuted, marginTop: 3 }}>
                  {meaningByLang(lang, item.reasonHi, item.reasonEn)}
                </Text>
              </View>
            ))}
          </>
        )}

        {step === 'sankalp' && (
          <>
            <View style={[styles.card, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
              <Text style={{ fontFamily: titleFont, fontSize: 15, lineHeight: 25, color: colors.ink, textAlign: 'center' }}>
                {contentByLang(lang, 'श्रद्धया देयम् — जो भी दूँ,\nश्रद्धा, सामर्थ्य और विनम्रता से दूँ ॥', 'Shraddhaya deyam — whatever I give,\nmay I give with faith, means and humility.')}
              </Text>
              <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 17, color: colors.inkMuted, textAlign: 'center', marginTop: 8 }}>
                {contentByLang(lang, 'भाव-वाक्य — तैत्तिरीय उपनिषद् १.११.३ पर आधारित', 'The bhaav line — after Taittirīya Upaniṣad 1.11.3')}
              </Text>
            </View>
            {/* The journey's terminal actions — the only place the directory door exists. */}
            <View style={[styles.terminal, { borderTopColor: colors.divider }]}>
              {occasion.causes && occasion.causes.length > 0 ? (
                <Text
                  testID="daan-journey-causes"
                  style={{ fontFamily: bodyFont, fontSize: 12.5, lineHeight: 19, color: colors.saffronDeep, textAlign: 'center', marginBottom: 10 }}
                >
                  {contentByLang(lang, 'इस दिन की सेवा — ', 'This day serves — ')}
                  {occasion.causes
                    .map((id) => {
                      const meta = getDaanCause(id);
                      return meta ? contentByLang(lang, meta.nameHi, meta.nameEn) : id;
                    })
                    .join(' · ')}
                </Text>
              ) : null}
              <View style={styles.actionRow}>
                <Pressable
                  testID="daan-journey-record"
                  accessibilityRole="button"
                  accessibilityLabel="Record in my daan ledger"
                  onPress={() => navigation.navigate('DaanEntry', { occasionId: occasion.id })}
                  style={[styles.actionBtn, { backgroundColor: colors.saffron, borderColor: colors.saffron, borderRadius: radii.pill }]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.onPrimary }}>
                    {contentByLang(lang, 'खाते में दर्ज करें', 'Record in my register')}
                  </Text>
                </Pressable>
                <Pressable
                  testID="daan-journey-directory"
                  accessibilityRole="button"
                  accessibilityLabel="Open the giving directory, external"
                  onPress={() =>
                    navigation.navigate('DaanDirectory', occasion.causes ? { causes: [...occasion.causes] } : {})
                  }
                  style={[styles.actionBtn, { borderColor: colors.saffron, borderRadius: radii.pill }]}
                >
                  <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
                    {contentByLang(lang, 'दान-द्वार (बाहरी)', 'Daan dwaar (external)')}
                  </Text>
                </Pressable>
              </View>
              <Text style={{ fontFamily: bodyFont, fontSize: 11.5, lineHeight: 18, color: colors.inkMuted, textAlign: 'center', marginTop: 10 }}>
                {meaningByLang(
                  lang,
                  'दान-द्वार यात्रा के अंत में ही खुलता है — दर्ज-करें के बाद। यहाँ रुक जाना भी पूर्ण है।',
                  'The daan-dwaar opens only at the journey’s end — after the record. Stopping here is also complete.'
                )}
              </Text>
            </View>
          </>
        )}

        <View style={styles.navRow}>
          <Pressable
            testID="daan-journey-prev"
            accessibilityRole="button"
            accessibilityLabel="Previous step"
            disabled={stepIdx === 0}
            onPress={() => setStepIdx((i) => Math.max(0, i - 1))}
            style={[styles.navBtn, { borderColor: colors.border, borderRadius: radii.pill, opacity: stepIdx === 0 ? 0 : 1 }]}
          >
            <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.inkMuted }}>
              {contentByLang(lang, 'पीछे', 'Back')}
            </Text>
          </Pressable>
          {!isLast ? (
            <Pressable
              testID="daan-journey-next"
              accessibilityRole="button"
              accessibilityLabel="Next step"
              onPress={() => setStepIdx((i) => Math.min(steps.length - 1, i + 1))}
              style={[styles.navBtn, { backgroundColor: colors.saffron, borderColor: colors.saffron, borderRadius: radii.pill }]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.onPrimary }}>
                {contentByLang(lang, 'आगे', 'Next')}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dots: { flexDirection: 'row', gap: 7, justifyContent: 'center', paddingVertical: 12 },
  dot: { height: 7, borderRadius: 4 },
  card: { borderWidth: 1, paddingHorizontal: 14, paddingTop: 13, paddingBottom: 13, marginBottom: 10 },
  rowCard: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  chipBtn: { borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7, marginTop: 11 },
  terminal: { borderTopWidth: 1, marginTop: 6, paddingTop: 14 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderWidth: 1.5, minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  navRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  navBtn: { flex: 1, borderWidth: 1.5, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
});
