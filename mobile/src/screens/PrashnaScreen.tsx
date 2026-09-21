import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import BasisChain from '@/components/BasisChain';
import PrashnaPhaseContent from '@/components/PrashnaPhaseContent';
import JyotishStateCard from '@/components/JyotishStateCard';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import type { PanchangStackParamList } from '@/navigation/types';
import { STRENGTH_LABEL_EN, STRENGTH_LABEL_HI, type PrashnaStrength } from '@/panchang/prashna';
import { buildPrashnaReading } from '@/panchang/prashnaGuidance';
import { questionsForPurpose } from '@/panchang/prashnaQuestions';
import { PRASHNA_PURPOSES, isPurposeId, type PurposeId } from '@/panchang/prashnaPurposes';
import { ageYears } from '@/panchang/reportFormat';
import { useKundali } from '@/panchang/useKundali';
import { useJyotishNow } from '@/panchang/useJyotishNow';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { pillTextStyle, scriptBodyFont, scriptTitleFont } from '@/utils/langType';

type Props = NativeStackScreenProps<PanchangStackParamList, 'Prashna'>;

/**
 * प्रश्न — ask the saved chart a purpose (PRD-43 Wave D; design.md §72).
 *
 * A picker of nine purposes (gated by the subject's derived age, the closed
 * ones dimmed WITH their reason), a question, then plain-language meaning,
 * editorial actions and relevant periods. Technical evidence expands on demand.
 * The engine is pure; this screen supplies the date, active chart and language.
 */

/** Purposes whose दिशा hands off to the Muhurat finder for "when to begin". */
const MUHURAT_PURPOSES: readonly PurposeId[] = ['vyapar', 'yatra', 'vivah'];

export default function PrashnaScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<any>();
  const { chart, profile, loadState } = useKundali();
  const readingType = { fontFamily: scriptBodyFont(lang, lang === 'en' ? fontFamilies.latin : typography.meaning.fontFamily), fontSize: lang === 'en' ? 18 : 15, lineHeight: 25 };
  const headingType = { fontFamily: scriptTitleFont(lang, lang === 'en' ? fontFamilies.latinSemiBold : typography.readerTitle.fontFamily), fontSize: lang === 'en' ? 20 : 17, lineHeight: 27 };
  const now = useJyotishNow(chart);
  const initial = route.params?.purposeId;
  const [purposeId, setPurposeId] = useState<PurposeId>(
    initial && isPurposeId(initial) ? initial : 'vidya'
  );

  const [questionId, setQuestionId] = useState('general');
  const [basisOpen, setBasisOpen] = useState(false);
  const [completed, setCompleted] = useState<readonly string[]>([]);
  const purposeScroll = useRef<ScrollView>(null);
  const purposeOffsets = useRef<Record<string, number>>({});
  useEffect(() => {
    const x = purposeOffsets.current[purposeId];
    if (x !== undefined) purposeScroll.current?.scrollTo({ x: Math.max(0, x - 12), animated: false });
  }, [purposeId]);
  useEffect(() => { setQuestionId('general'); }, [chart]);
  useEffect(() => { setBasisOpen(false); setCompleted([]); }, [chart, purposeId, questionId]);
  const age = chart ? ageYears(chart.input.date, now) : null;
  const reading = useMemo(
    () => (chart ? buildPrashnaReading(chart, purposeId, now, { questionId, ...(['naukri', 'vyapar'].includes(purposeId) ? { gocharScanDays: 0 } : {}) }) : null),
    [chart, purposeId, now, questionId]
  );
  const answer = reading?.analysis;
  const guidance = reading?.guidance;
  const phase = reading?.phase;

  const openPractice = (sourceId: string) => {
    const entry = library.find((candidate) => candidate.id === sourceId);
    const target = entry ? buildEntryStartTarget(entry) : null;
    if (target) rootNav.navigate('HomeTab', target);
  };

  const eyebrow = (hi: string, en: string) => (
    <Text style={[pillTextStyle(lang, typography.sectionLabel), { color: colors.saffronDeep, fontSize: lang === 'en' ? 10 : 12, lineHeight: 20 }]}>
      {contentByLang(lang, hi, en)}
    </Text>
  );
  const bodyText = (hi: string, en: string, key?: string, muted = false) => (
    <Text
      key={key}
      style={{
        color: muted ? colors.inkMuted : colors.inkSoft,
        ...readingType,
        marginTop: 6,
      }}
    >
      {meaningByLang(lang, hi, en)}
    </Text>
  );
  const card = (children: React.ReactNode, active = false, key?: string, label?: string) => (
    <View
      key={key}
      accessible={false}
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
              style={{ ...headingType, color: colors.ink, fontSize: lang === 'en' ? 24 : 20 }}
            >
              {contentByLang(lang, 'प्रश्न', 'Prashna')}
            </Text>
            <Text style={[styles.caption, { color: colors.inkMuted, fontFamily: lang === 'en' ? fontFamilies.inter : scriptBodyFont(lang, fontFamilies.devanagari), lineHeight: 21 }]}>
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
                <Text style={[styles.practiceLinkText, { color: colors.saffronDeep, fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptTitleFont(lang, fontFamilies.devanagariBold) }]}>
                  {contentByLang(lang, 'जन्म कुंडली बनाएँ', 'Create Kundali')}
                </Text>
              </Pressable>
            </>
          )}

          {chart && profile && answer && (
            <>
              {card(
                <>
                  {eyebrow('किसके लिए', 'For whom')}
                  <Text style={[styles.title, headingType, { color: colors.ink }]}>{profile.name || contentByLang(lang, 'आपकी कुंडली', 'Your chart')}</Text>
                  {bodyText(`आयु ${answer.ageLabelHi} · ${answer.asOfLabelHi}`, `Age ${answer.ageLabelEn} · ${answer.asOfLabelEn}`, undefined, true)}
                </>,
                false,
                'who',
                'Whose chart'
              )}

              {/* Purpose picker — closed purposes stay visible WITH their reason. */}
              <Text style={[pillTextStyle(lang, typography.sectionLabel), styles.sectionLabel, { color: colors.inkMuted }]}>
                {contentByLang(lang, 'विषय चुनें', 'Choose a purpose')}
              </Text>
              <ScrollView ref={purposeScroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.grid} accessibilityLabel="Purpose picker">
                {PRASHNA_PURPOSES.map((purpose) => {
                  const open = age !== null && age >= purpose.minAge;
                  const selected = purpose.id === purposeId;
                  return (
                    <Pressable
                      key={purpose.id}
                      onLayout={event => {
                        const x = event.nativeEvent.layout.x;
                        purposeOffsets.current[purpose.id] = x;
                        if (selected) purposeScroll.current?.scrollTo({ x: Math.max(0, x - 12), animated: false });
                      }}
                      testID={`purpose-${purpose.id}`}
                      disabled={!open}
                      onPress={() => { setPurposeId(purpose.id); setQuestionId('general'); }}
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
                      <Text style={{ ...headingType, color: colors.ink }}>
                        {contentByLang(lang, purpose.nameHi, purpose.nameEn)}
                      </Text>
                      {!open && <Text style={[styles.purposeSub, { color: colors.inkMuted, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily) }]}>
                        {meaningByLang(lang, `${purpose.minAge} वर्ष के बाद`, `From age ${purpose.minAge}`)}
                      </Text>}
                    </Pressable>
                  );
                })}
              </ScrollView>

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
                  {guidance && (
                    <>
                      {questionsForPurpose(purposeId).length > 1 && (
                        <View style={styles.questionList} accessibilityLabel="Your question">
                          {eyebrow('आपका प्रश्न', 'Your question')}
                          {questionsForPurpose(purposeId).map(question => (
                            <Pressable key={question.id} testID={`question-${question.id}`} accessibilityRole="button"
                              accessibilityState={{ selected: guidance.questionId === question.id }}
                              accessibilityLabel={meaningByLang(lang, question.label.hi, question.label.en)}
                              onPress={() => setQuestionId(question.id)}
                              style={[styles.question, styles.questionOption, { borderColor: guidance.questionId === question.id ? colors.saffronDeep : colors.divider, backgroundColor: guidance.questionId === question.id ? colors.cardActiveFrom : colors.parchmentSoft, borderRadius: radii.md }]}>
                              <View accessible={false} style={[styles.radio, { borderColor: guidance.questionId === question.id ? colors.saffronDeep : colors.inkMuted }]}>{guidance.questionId === question.id && <View style={[styles.radioDot, { backgroundColor: colors.saffronDeep }]} />}</View>
                              <Text style={{ ...readingType, flex: 1, color: colors.ink }}>
                                {meaningByLang(lang, question.label.hi, question.label.en)}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                      {phase ? <PrashnaPhaseContent key={`${chart.input.date.toISOString()}-${chart.input.latitude}-${chart.input.longitude}-${purposeId}-${questionId}`} phase={phase} lang={lang}>
                        <View style={styles.actions}>
                          {purposeId === 'vyapar' && <ActionPill lang={lang} hi="मुहूर्त खोजें" en="Find a muhurat" a11y="Open Muhurat finder" onPress={() => rootNav.navigate('MuhuratFinder')} />}
                          <ActionPill lang={lang} hi="विस्तृत विवेचन और साझा करें" en="Full reading and share" a11y="Open full Kundali reading" onPress={() => rootNav.navigate('KundaliReport', { prashnaContext: { purposeId, questionId: phase.questionId } })} />
                        </View>
                      </PrashnaPhaseContent> : <>
                      {card(<>
                        {eyebrow('आपके प्रश्न का उत्तर', 'Your reading')}
                        <Text testID="prashna-saar" style={[styles.title, headingType, { color: colors.ink }]}>
                          {meaningByLang(lang, guidance.title.hi, guidance.title.en)}
                        </Text>
                        {bodyText(guidance.summary.hi, guidance.summary.en)}
                        {guidance.parentNote && bodyText(guidance.parentNote.hi, guidance.parentNote.en)}
                      </>, true, 'saar', 'Your reading')}
                      {card(<>
                        {eyebrow('आपके लिए इसका अर्थ', 'What this means for you')}
                        {guidance.insights.map(insight => <View key={insight.id} testID={`insight-${insight.id}`} style={styles.insight}>
                          <Text style={[styles.title, headingType, { color: colors.ink }]}>{meaningByLang(lang, insight.title.hi, insight.title.en)}</Text>
                          {bodyText(insight.meaning.hi, insight.meaning.en)}
                        </View>)}
                      </>, false, 'meaning', 'What this means for you')}
                      {card(<>
                        {eyebrow('आप क्या कर सकते हैं', 'A practical plan')}
                        {bodyText('अपने अनुसार कदम चुनें और पूरा होने पर निशान लगाएँ। ये व्यावहारिक सुझाव हैं।', 'Choose what fits and tick it off when done. These are practical suggestions.', undefined, true)}
                        {guidance.actions.map(action => <Pressable key={action.id} testID={`action-${action.id}`} accessibilityRole="checkbox"
                          accessibilityLabel={meaningByLang(lang, action.text.hi, action.text.en)} accessibilityState={{ checked: completed.includes(action.id) }}
                          onPress={() => setCompleted(old => old.includes(action.id) ? old.filter(id => id !== action.id) : [...old, action.id])}
                          style={styles.actionRow}>
                          <Text style={{ color: colors.saffronDeep, fontSize: 18 }}>{completed.includes(action.id) ? '✓' : '○'}</Text>
                          <Text style={{ ...readingType, flex: 1, color: completed.includes(action.id) ? colors.inkMuted : colors.inkSoft }}>
                            {meaningByLang(lang, action.text.hi, action.text.en)}
                          </Text>
                        </Pressable>)}
                        {eyebrow('ध्यान रखें', 'Keep in mind')}
                        {bodyText(guidance.caution.hi, guidance.caution.en)}
                        <View style={styles.actions}>
                          {MUHURAT_PURPOSES.includes(purposeId) && <ActionPill lang={lang} hi="मुहूर्त खोजें" en="Find a muhurat" a11y="Open Muhurat finder" onPress={() => rootNav.navigate('MuhuratFinder')} />}
                          {purposeId === 'vivah' && <ActionPill lang={lang} hi="गुण मिलान" en="Guna Milan" a11y="Open Guna Milan" onPress={() => rootNav.navigate('GunaMilan')} />}
                          <ActionPill lang={lang} hi="विस्तृत विवेचन और साझा करें" en="Full reading and share" a11y="Open full Kundali reading" onPress={() => rootNav.navigate('KundaliReport', { prashnaContext: { purposeId, questionId: guidance.questionId } })} />
                        </View>
                      </>, false, 'actions', 'Practical plan')}
                      {card(<>
                        {eyebrow('समय का संकेत', 'Timing')}
                        {bodyText(guidance.timing.text.hi, guidance.timing.text.en)}
                        {guidance.timing.windowIds.map(id => answer.windows.find(w => w.id === id)!).map(w => <View key={w.id} testID={`prashna-window-${w.id}`} style={[styles.window, { borderLeftColor: colors.gold }]}>
                          <Text style={[styles.windowDate, { color: colors.ink, fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptBodyFont(lang, fontFamilies.devanagari) }]}>{contentByLang(lang, w.labelHi, w.labelEn)}{w.current ? contentByLang(lang, ' · अभी', ' · now') : ''}</Text>
                          {bodyText(w.current ? 'इस विषय से जुड़ी चल रही अवधि; अनुकूलता की पुष्टि नहीं।' : 'इस विषय से जुड़ी आगामी अवधि; परिणाम की तारीख नहीं।', w.current ? 'A current period connected with this topic; favourability is not established.' : 'An upcoming period connected with this topic; not an outcome date.')}
                        </View>)}
                      </>, false, 'timing', 'Timing')}
                      <Pressable testID="prashna-basis-toggle" accessibilityRole="button" accessibilityState={{ expanded: basisOpen }}
                        accessibilityLabel={contentByLang(lang, basisOpen ? 'ज्योतिषीय आधार छिपाएँ' : 'ज्योतिषीय आधार देखें', basisOpen ? 'Hide Jyotish basis' : 'See Jyotish basis')} onPress={() => setBasisOpen(!basisOpen)}
                        style={[styles.question, { borderColor: colors.divider, borderRadius: radii.md }]}>
                        <Text style={{ ...readingType, color: colors.saffronDeep }}>{contentByLang(lang, basisOpen ? 'ज्योतिषीय आधार छिपाएँ' : 'ज्योतिषीय आधार देखें', basisOpen ? 'Hide Jyotish basis' : 'See Jyotish basis')}</Text>
                      </Pressable>
                      {basisOpen && card(<>
                        {eyebrow('ज्योतिषीय आधार', 'Jyotish basis')}
                        <StrengthPill strength={answer.strength!} lang={lang} />
                        {bodyText(answer.aadhaarIntroHi, answer.aadhaarIntroEn)}
                        {guidance.insights.map((insight, index) => <BasisChain key={insight.id} basis={insight.basis} lang={lang} labelHi={insight.title.hi} labelEn={insight.title.en} testID={`prashna-chain-${index}`} />)}
                        {answer.supports.length > 0 && <View style={{ marginTop: 12 }}>{eyebrow('सहायक संकेत', 'Supporting indications')}</View>}
                        {answer.supports.map(f => bodyText(f.textHi, f.textEn, f.id))}
                        {answer.resists.length > 0 && <View style={{ marginTop: 12 }}>{eyebrow('विरोधी संकेत', 'Opposing indications')}</View>}
                        {answer.resists.map(f => bodyText(f.textHi, f.textEn, f.id))}
                        {answer.qualifies.length > 0 && <View style={{ marginTop: 12 }}>{eyebrow('अन्य संदर्भ', 'Other context')}</View>}
                        {answer.qualifies.map(f => bodyText(f.textHi, f.textEn, f.id))}
                        {answer.windows.map(w => bodyText(`${w.labelHi} · ${w.textHi}`, `${w.labelEn} · ${w.textEn}`, w.id))}
                      </>, false, 'basis', 'Jyotish basis')}
                      </>}
                    </>
                  )}

                  {/* उपाय */}
                  {(() => {
                    const practice = library.find((entry) => entry.id === answer.practiceSourceId);
                    if (!practice) return null;
                    return card(
                      <>
                        {eyebrow('उपाय · साधना', 'Practice')}
                        <Text style={[styles.title, headingType, { color: colors.ink }]}>
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
                          <Text style={[styles.practiceLinkText, { color: colors.saffronDeep, fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptTitleFont(lang, fontFamilies.devanagariBold) }]}>
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
      <Text style={[pillTextStyle(lang, styles.pillText), { color: ink, flexShrink: 1, lineHeight: 20 }]}>
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
      <Text style={[styles.practiceLinkText, { color: colors.saffronDeep, fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptTitleFont(lang, fontFamilies.devanagariBold) }]}>{contentByLang(lang, hi, en)} ›</Text>
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
  grid: { gap: 8, paddingBottom: 12 },
  questionList: { gap: 6, marginBottom: 14 },
  question: { minHeight: 48, padding: 12, borderWidth: 1, marginBottom: 8 },
  questionOption: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 0 },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  insight: { marginTop: 8, marginBottom: 8 },
  actionRow: { minHeight: 44, flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 10 },
  purpose: { minWidth: 105, minHeight: 48, padding: 11, borderWidth: 1, justifyContent: 'center' },
  purposeSub: { fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  pill: { alignSelf: 'flex-start', maxWidth: '100%', marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1 },
  pillText: { fontFamily: fontFamilies.interSemiBold, fontSize: 10, letterSpacing: 0.9 },
  bars: { flexDirection: 'row', gap: 2 },
  bar: { width: 3, height: 9, borderRadius: 1 },
  window: { padding: 10, borderLeftWidth: 2, marginTop: 8 },
  windowDate: { fontFamily: fontFamilies.interSemiBold, fontSize: 12, lineHeight: 21, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  practiceLink: { minHeight: 44, maxWidth: '100%', paddingVertical: 9, marginTop: 10, paddingHorizontal: 13, borderWidth: 1, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center' },
  practiceLinkText: { fontFamily: fontFamilies.interSemiBold, fontSize: 12, lineHeight: 21, flexShrink: 1, textAlign: 'center' },
  footer: { fontSize: 10.5, lineHeight: 16, marginTop: 8, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
});
