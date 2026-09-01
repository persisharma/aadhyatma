import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import ReaderHeader from '@/components/ReaderHeader';
import ListCard, { CardThumb } from '@/components/ListCard';
import MuhuratFollowControl from '@/components/MuhuratFollowControl';
import MuhuratBalaStrip from '@/components/MuhuratBalaStrip';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useMuhuratFinder } from '@/panchang/useMuhuratFinder';
import { useMuhuratBala, type MuhuratBalaItem } from '@/panchang/useMuhuratBala';
import {
  DISHA_LABELS,
  DISHA_ORDER,
  DOSHA_LABELS,
  TIER_LABELS,
  getEventRule,
  type DayVerdict,
  type DishaDirection,
  type DoshaKey,
  type MuhuratWindow,
} from '@/panchang/eventMuhurat';
import { formatRangeCompact, formatShortDate } from '@/panchang/muhuratFormat';
import { VARA_NAMES_HI, VARA_NAMES_EN } from '@/panchang/names';
import { RASHI_NAMES_HI, RASHI_NAMES_EN } from '@/panchang/kundali';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { Lang } from '@/data/gita/language';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MuhuratResults'>;

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_HI = ['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्तूबर','नवंबर','दिसंबर'];

function weekdayName(dateMs: number, lang: Lang): string {
  const wd = new Date(dateMs).getDay();
  if (lang === 'en') return VARA_NAMES_EN[wd];
  if (lang === 'hi') return VARA_NAMES_HI[wd];
  return transliterateDevanagari(VARA_NAMES_HI[wd], lang);
}

function rashiName(index: number, lang: Lang): string {
  if (lang === 'en') return RASHI_NAMES_EN[index];
  if (lang === 'hi') return RASHI_NAMES_HI[index];
  return transliterateDevanagari(RASHI_NAMES_HI[index], lang);
}

/**
 * The best window's contiguous split sibling at a LAGNA boundary, when the
 * split is worth showing (prototype phone a: one choghadiya, two graded
 * segments, a quiet note). Anga-split siblings render no second line — their
 * chips would be identical and the detail screen carries that story.
 */
function splitSibling(windows: MuhuratWindow[]): MuhuratWindow | null {
  const [best, next] = windows;
  if (!best || !next || !best.splitFrom) return null;
  const contiguous = next.splitFrom === best.splitFrom && next.nameEn === best.nameEn
    && (next.start.getTime() === best.end.getTime() || next.end.getTime() === best.start.getTime());
  const acrossLagna = next.lagnaRashiIndex != null && next.lagnaRashiIndex !== best.lagnaRashiIndex;
  return contiguous && acrossLagna ? next : null;
}

/**
 * Ranked results — answer-first (design.md §60): the date is the answer, the
 * best window is the emphasised line. Every card is the shared `ListCard` (the
 * library list-card grammar) so the list reads like every other list in the app
 * — no bespoke "hero" first card. Two tiers only, never a score. A zero-result
 * window renders the empty-with-reason card and the first dates after it.
 */
export default function MuhuratResultsScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const { location } = usePanchangLocation();
  const rule = getEventRule(route.params.occasionId);
  // यात्रा only (PRD-16/P3 §4.6): the chosen direction excludes its दिशा शूल
  // days. Scan-time state — never persisted, never carried by a follow.
  const [direction, setDirection] = useState<DishaDirection | undefined>(undefined);
  const { loading, summary, firstAfter } = useMuhuratFinder(rule.id, undefined, direction);
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  // Phase 4: the quiet personal row (saved Kundali only — §8). The hook reads
  // the profile itself; with none saved `hasProfile` stays false and every
  // card renders exactly as before. It ANNOTATES ONLY: verdicts, ordering and
  // sections above never touch it.
  const listedVerdicts = [
    ...(summary?.shreshtha.slice(0, 5) ?? []),
    ...(summary?.madhyam.slice(0, 6) ?? []),
    ...firstAfter,
  ];
  const balaItems: MuhuratBalaItem[] = listedVerdicts
    .filter((v) => v.windows[0])
    .map((v) => ({
      dateMs: v.dateMs,
      windowStart: v.windows[0].start,
      nakshatraIndex: v.windows[0].angaAtWindow?.nakshatraIndex ?? v.sunriseAnga.nakshatraIndex,
    }));
  const { hydrated: balaHydrated, hasProfile, balaByDate } = useMuhuratBala(balaItems);

  const sectionLabelStyle = {
    fontFamily: typography.sectionLabel.fontFamily,
    fontSize: typography.sectionLabel.fontSize,
    letterSpacing: lang === 'en' ? typography.sectionLabel.letterSpacing : 0,
    color: colors.inkMuted,
    textTransform: 'uppercase' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  };

  // Phase 3 (design.md §60): the best-window line gains a quiet lagna chip;
  // a split shows as two window lines with a `लग्न सीमा पर विभाजित` note.
  // Every card stays the identical shipped ListCard — no hero, no ordinals.
  const LagnaChip = ({ index }: { index: number }) => (
    <Text
      style={{
        fontFamily: titleFont,
        fontSize: 11,
        color: colors.saffronDeep,
        backgroundColor: colors.goldChipBg,
        borderRadius: 6,
        overflow: 'hidden',
        paddingHorizontal: 5,
      }}
    >
      {' '}{rashiName(index, lang)} {contentByLang(lang, 'लग्न', 'lagna')}{' '}
    </Text>
  );

  const WindowLine = ({ w, secondary }: { w: MuhuratWindow; secondary?: boolean }) => (
    <Text
      style={{
        marginTop: secondary ? 1 : 4,
        fontFamily: typography.cardHindi.fontFamily,
        fontSize: secondary ? 14 : 16,
        color: secondary ? colors.inkSoft : colors.ink,
        lineHeight: secondary ? 22 : 25,
      }}
    >
      <Text style={{ fontFamily: titleFont, fontSize: 13, color: colors.saffronDeep }}>
        {contentByLang(lang, w.nameHi, w.nameEn)}{' '}
      </Text>
      {formatRangeCompact(w.start, w.end)}
      {w.lagnaRashiIndex != null && <LagnaChip index={w.lagnaRashiIndex} />}
    </Text>
  );

  const Card = ({ v }: { v: DayVerdict }) => {
    const d = new Date(v.dateMs);
    const best = v.windows[0];
    const sibling = splitSibling(v.windows);
    const tier = v.tier === 'shreshtha' ? 'shreshtha' : 'madhyam';
    return (
      <ListCard
        testID={`muhurat-result-${d.getDate()}`}
        accessibilityLabel={`${formatShortDate(d, lang)} · ${weekdayName(v.dateMs, lang)}`}
        onPress={() => navigation.navigate('MuhuratDayDetail', { occasionId: rule.id, dateMs: v.dateMs })}
        leading={
          <CardThumb>
            <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 22, color: colors.parchmentSoft }}>
              {d.getDate()}
            </Text>
          </CardThumb>
        }
      >
        <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.ink, lineHeight: 24 }}>
          {contentByLang(lang, MONTHS_HI[d.getMonth()], MONTHS_EN[d.getMonth()])} · {weekdayName(v.dateMs, lang)}
        </Text>
        <Text style={{ fontFamily: titleFont, fontSize: 12, color: tier === 'shreshtha' ? colors.saffronDeep : colors.inkMuted, lineHeight: 19, marginTop: 1 }}>
          {contentByLang(lang, TIER_LABELS[tier].hi, TIER_LABELS[tier].en)}
        </Text>
        {best && <WindowLine w={best} />}
        {sibling && (
          <>
            <WindowLine w={sibling} secondary />
            <Text
              style={{
                fontFamily: typography.cardLatin.fontFamily,
                fontStyle: 'italic',
                fontSize: 11,
                color: colors.inkMuted,
                lineHeight: 17,
                marginTop: 1,
              }}
            >
              {contentByLang(lang, 'लग्न सीमा पर विभाजित', 'Split at a lagna boundary')}
            </Text>
          </>
        )}
        {balaByDate?.get(v.dateMs) && <MuhuratBalaStrip bala={balaByDate.get(v.dateMs)} variant="row" />}
      </ListCard>
    );
  };

  const Empty = () => {
    const doshaDays = summary?.doshaDays ?? {};
    const reasons = (Object.keys(doshaDays) as DoshaKey[])
      .filter((k) => rule.doshas.includes(k))
      .sort((a, b) => (doshaDays[b] ?? 0) - (doshaDays[a] ?? 0))
      .slice(0, 2);
    return (
      <View
        testID="muhurat-empty-reason"
        style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.lg }, elevation.card]}
      >
        <Text style={{ fontFamily: typography.thumb.fontFamily, fontSize: 20, color: colors.gold, textAlign: 'center', lineHeight: 30 }}>॥</Text>
        <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink, textAlign: 'center', lineHeight: 24, marginTop: 4 }}>
          {contentByLang(lang, 'अगले 3 महीनों में कोई शुभ मुहूर्त नहीं', 'No auspicious muhurat in the next 3 months')}
        </Text>
        <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 13, color: colors.inkSoft, textAlign: 'center', lineHeight: 21, marginTop: 6 }}>
          {contentByLang(
            lang,
            'यह उत्तर सही है — आँकड़ों की कमी नहीं।',
            'That is the correct answer, not a gap in the data.'
          )}
        </Text>
        {reasons.map((k) => (
          <View key={k} style={[styles.reason, { backgroundColor: colors.goldTint, borderColor: colors.border, borderRadius: radii.md }]}>
            <Text style={{ fontFamily: titleFont, fontSize: 12, color: colors.saffronDeep, lineHeight: 19 }}>
              {contentByLang(lang, 'कारण · ', 'Reason · ')}
              {contentByLang(lang, DOSHA_LABELS[k].hi, DOSHA_LABELS[k].en)}
              {/* दिशा शूल's reason must NAME the direction (PRD-16/P3 §4.6). */}
              {k === 'disha-shool' && direction
                ? ` — ${contentByLang(lang, DISHA_LABELS[direction].hi, DISHA_LABELS[direction].en)}`
                : ''}
            </Text>
            <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12.5, color: colors.inkSoft, lineHeight: 20 }}>
              {contentByLang(lang, 'इस अवधि के ', 'Applies to ')}
              {doshaDays[k]}
              {contentByLang(lang, ' दिनों पर लागू', ' days of this window')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const hasResults = (summary?.shreshtha.length ?? 0) + (summary?.madhyam.length ?? 0) > 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      <ReaderHeader
        title={contentByLang(lang, rule.nameHi, rule.nameEn)}
        variant="index"
        onBack={() => navigation.goBack()}
      />

      {/* यात्रा only (PRD-16/P3 §4.6): the 8-direction दिशा chip row, above the
          loading branch so it survives the re-scan a chosen direction starts.
          The chosen direction's दिशा शूल days are excluded with the reason
          naming the direction; with none chosen the scan runs shool-free. */}
      {rule.id === 'yatra' && (
        <View style={[styles.dishaRow, { paddingHorizontal: spacing.readingGutter }]}>
          {DISHA_ORDER.map((dir) => {
            const active = direction === dir;
            return (
              <Pressable
                key={dir}
                testID={`muhurat-disha-${dir}`}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={contentByLang(lang, `दिशा ${DISHA_LABELS[dir].hi}`, `Direction ${DISHA_LABELS[dir].en}`)}
                onPress={() => setDirection(active ? undefined : dir)}
                style={[
                  styles.dishaChip,
                  {
                    borderColor: active ? colors.cardActiveBorder : colors.border,
                    backgroundColor: active ? colors.goldChipBg : colors.surface,
                    borderRadius: radii.pill,
                  },
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 12, color: active ? colors.saffronDeep : colors.inkSoft, lineHeight: 19 }}>
                  {contentByLang(lang, DISHA_LABELS[dir].hi, DISHA_LABELS[dir].en)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {loading ? (
        <View style={styles.loading} testID="muhurat-results-loading">
          <ActivityIndicator color={colors.saffron} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.readingGutter, paddingBottom: spacing.xxl }}>
          <Text
            style={{
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 12.5,
              color: colors.inkMuted,
              textAlign: 'center',
            }}
          >
            {contentByLang(lang, location.labelHi, location.labelEn)}
            {contentByLang(lang, ' · दृक्पंचांग पद्धति', ' · DrikPanchang convention')}
          </Text>

          {/* गृह प्रवेश only (PRD-24 §6): the moment the direction questions are
              live. Pushes वास्तु दिशा in place on this stack — Back returns here. */}
          {rule.id === 'griha-pravesh' && (
            <View style={{ marginTop: spacing.md }}>
              <ListCard
                testID="muhurat-vastu-door"
                leading={
                  <CardThumb>
                    <Text style={{ color: colors.saffronDeep, fontFamily: typography.readerTitle.fontFamily, fontSize: 18 }}>दि</Text>
                  </CardThumb>
                }
                onPress={() => navigation.navigate('VastuDisha')}
                accessibilityLabel="Open Vastu Disha for the new home"
              >
                <Text style={{ color: colors.ink, fontFamily: titleFont, fontSize: 15 }}>
                  {contentByLang(lang, 'नए घर की वास्तु दिशा', 'Vastu directions for the new home')}
                </Text>
                <Text style={{ color: colors.inkMuted, fontFamily: typography.cardLatin.fontFamily, fontSize: 11.5, lineHeight: 17 }}>
                  {contentByLang(lang, 'मंदिर · रसोई · मुख्य द्वार — दिशा चक्र के साथ', 'Mandir · kitchen · main door — with the disha chakra')}
                </Text>
              </ListCard>
            </View>
          )}

          {hasResults ? (
            <>
              {summary!.shreshtha.length > 0 && (
                <>
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'सर्वोत्तम तिथियाँ', 'Best dates')}</Text>
                  {summary!.shreshtha.slice(0, 5).map((v) => (
                    <Card key={v.dateMs} v={v} />
                  ))}
                </>
              )}
              {summary!.madhyam.length > 0 && (
                <>
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'अन्य उपयुक्त तिथियाँ', 'More suitable dates')}</Text>
                  {summary!.madhyam.slice(0, 6).map((v) => (
                    <Card key={v.dateMs} v={v} />
                  ))}
                </>
              )}
              <Pressable
                testID="muhurat-view-on-calendar"
                accessibilityRole="button"
                accessibilityLabel={contentByLang(lang, 'कैलेंडर में देखें', 'View on calendar')}
                onPress={() =>
                  navigation.navigate('PanchangHome', {
                    muhuratOverlay: {
                      occasionId: rule.id,
                      days: [...summary!.shreshtha, ...summary!.madhyam].map((v) => v.dateMs),
                    },
                  })
                }
                style={[
                  styles.calendarLink,
                  { borderColor: colors.border, backgroundColor: colors.surface, borderRadius: radii.pill },
                  elevation.subtle,
                ]}
              >
                <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.saffronDeep, lineHeight: 22 }}>
                  {contentByLang(lang, 'कैलेंडर में देखें', 'View on calendar')} ›
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <Empty />
              {/* Empty-with-reason must END IN AN ACTION (PRD-16 §8 measures
                  exactly this). The follow targets the first day that actually
                  qualifies — a real graded muhurat with a window — rather than
                  the season boundary, which would notify the user days early
                  with nothing they could act on. */}
              {firstAfter.length > 0 && (
                <>
                  <MuhuratFollowControl
                    occasionId={rule.id}
                    occasionNameHi={rule.nameHi}
                    occasionNameEn={rule.nameEn}
                    date={new Date(firstAfter[0].dateMs)}
                    tier={firstAfter[0].tier}
                    bestWindow={firstAfter[0].windows[0] ?? null}
                  />
                  <Text style={sectionLabelStyle}>{contentByLang(lang, 'इसके बाद पहली तिथियाँ', 'First dates after')}</Text>
                  {firstAfter.map((v) => (
                    <Card key={v.dateMs} v={v} />
                  ))}
                </>
              )}
            </>
          )}
          {/* Phase 4 no-profile state (§8.4): the ONLY trace of the personal
              strip is this one italic footer line, results list only, styled
              as the disclaimer beside it, deep-linking to the shipped Kundali
              screen. Never on day cards, never on the detail, never a badge. */}
          {balaHydrated && !hasProfile && hasResults && (
            <Pressable
              testID="muhurat-bala-footer"
              accessibilityRole="button"
              accessibilityLabel={contentByLang(
                lang,
                'कुंडली सहेजने पर हर दिन आपके तारा/चन्द्र बल के साथ दिखेगा',
                'Save your Kundali to see each day with your Tara/Chandra bala'
              )}
              onPress={() => navigation.navigate('Kundali', undefined)}
            >
              <Text
                style={{
                  fontFamily: typography.cardLatin.fontFamily,
                  fontStyle: 'italic',
                  fontSize: 11.5,
                  color: colors.inkMuted,
                  textAlign: 'center',
                  marginTop: spacing.lg,
                  lineHeight: 18,
                  textDecorationLine: 'underline',
                  textDecorationColor: colors.divider,
                }}
              >
                {contentByLang(
                  lang,
                  'कुंडली सहेजने पर हर दिन आपके तारा/चन्द्र बल के साथ दिखेगा',
                  'Save your Kundali to see each day with your Tara/Chandra bala'
                )}
              </Text>
            </Pressable>
          )}
          <Text
            style={{
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 11.5,
              color: colors.inkMuted,
              textAlign: 'center',
              marginTop: spacing.lg,
              lineHeight: 18,
            }}
          >
            {contentByLang(lang, 'परम्परागत मार्गदर्शन। पुरोहित से पुष्टि करें।', 'Traditional guidance — confirm with your purohit.')}
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { borderWidth: 1, padding: 16, marginTop: 12 },
  calendarLink: { borderWidth: 1, alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  reason: { borderWidth: 1, padding: 12, marginTop: 12 },
  dishaRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 10 },
  dishaChip: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, minHeight: 32, justifyContent: 'center' },
});
