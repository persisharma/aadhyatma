import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getNextOccurrence, getRuleById } from '@/panchang/vratCatalog';
import { useVratFollows, type VratFollow, type VratReminderPref } from '@/contexts/VratFollowContext';
import VratReminderSheet from '@/components/VratReminderSheet';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { ObservanceRule } from '@/panchang/types';
import type { PanchangStackParamList } from '@/navigation/types';
import { useTourTarget } from '@/components/tour/tourTargets';

type Props = NativeStackScreenProps<PanchangStackParamList, 'MyVrat'>;

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function shortDate(date: Date, lang: Lang): string {
  const months =
    lang === 'en' ? MONTHS_EN : lang === 'hi' ? MONTHS_HI : MONTHS_HI.map((m) => transliterateDevanagari(m, lang));
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function relativeLabel(date: Date, from: Date, lang: Lang): string {
  const days = Math.round((startOfLocalDay(date).getTime() - startOfLocalDay(from).getTime()) / 86400000);
  if (days <= 0) return contentByLang(lang, 'आज', 'today');
  if (days === 1) return contentByLang(lang, 'कल', '1d');
  return contentByLang(lang, `${days}द`, `${days}d`);
}

type FollowItem = {
  follow: VratFollow;
  rule: ObservanceRule;
  next: ReturnType<typeof getNextOccurrence>;
};

export default function MyVratScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  // Feature-tour anchor (design.md §47) — the content region in both the empty
  // (first-launch) and populated states.
  const myVratRef = useTourTarget('myVrat');
  const [calendarSystem] = usePanchangCalendarSystem();
  const { follows, followCount, reminderCount, reminderDefault, setReminder, setReminderDefault } =
    useVratFollows();

  const today = useMemo(() => startOfLocalDay(new Date()), []);

  // Followed rules paired with their next occurrence, sorted soonest-first so a
  // vrat whose date has just passed (and rolled to its next occurrence) sinks to
  // its correct chronological slot. Rules with no upcoming date sort to the end.
  const items = useMemo<FollowItem[]>(() => {
    const out: FollowItem[] = [];
    for (const follow of follows) {
      const rule = getRuleById(follow.ruleId);
      if (!rule) continue; // a renamed/removed rule id — skip defensively
      out.push({ follow, rule, next: getNextOccurrence(rule.id, today, calendarSystem) });
    }
    out.sort((a, b) => {
      if (!a.next) return b.next ? 1 : 0;
      if (!b.next) return -1;
      return a.next.date.getTime() - b.next.date.getTime();
    });
    return out;
  }, [follows, today, calendarSystem]);

  const thisMonthCount = useMemo(
    () =>
      items.filter(
        (it) =>
          it.next &&
          it.next.date.getMonth() === today.getMonth() &&
          it.next.date.getFullYear() === today.getFullYear()
      ).length,
    [items, today]
  );

  // Upcoming-among-followed, chronological. `items` is already date-sorted, so
  // this is just the followed rules that have an upcoming occurrence.
  const upcoming = useMemo(
    () =>
      items.filter(
        (it): it is FollowItem & { next: NonNullable<FollowItem['next']> } => it.next != null
      ),
    [items]
  );

  const [sheet, setSheet] = useState<
    { mode: 'vrat'; ruleId: string; name: string; initial: VratReminderPref } | { mode: 'default' } | null
  >(null);

  const reminderOnFor = (f: VratFollow) => {
    const r = f.reminder ?? reminderDefault;
    return r.dayOf || r.advanceDays > 0;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={contentByLang(lang, 'वापस', 'Back')}
            hitSlop={12}
            style={({ pressed }) => [styles.backButton, { borderColor: colors.divider }, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>‹</Text>
          </Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 16, color: colors.ink }}>
              {contentByLang(lang, 'मेरा व्रत', 'My Vrat')}
            </Text>
            <Text style={{ ...captionFont(lang === 'en' ? 'मेरा व्रत' : 'My Vrat'), fontSize: 12, color: colors.inkMuted }}>
              {lang === 'en' ? 'मेरा व्रत' : 'My Vrat'}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {followCount === 0 ? (
          <View ref={myVratRef} collapsable={false} style={styles.empty}>
            <Text style={{ fontSize: 36, color: colors.gold, marginBottom: 10 }}>★</Text>
            <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 18, color: colors.ink, textAlign: 'center' }}>
              {contentByLang(lang, 'अभी कोई व्रत नहीं', 'No vrats yet')}
            </Text>
            <Text
              style={{
                fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily),
                fontSize: 14,
                lineHeight: 21,
                color: colors.inkMuted,
                textAlign: 'center',
                marginTop: 8,
                paddingHorizontal: 12,
              }}
            >
              {meaningByLang(
                lang,
                'जिन व्रतों का आप पालन करते हैं उन्हें फ़ॉलो करें — वे यहाँ अगली तिथि के अनुसार दिखेंगे।',
                'Follow the vrats you observe — they show up here, sorted by which comes next.'
              )}
            </Text>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Browse Vrat and Parv"
              style={({ pressed }) => [
                styles.browseBtn,
                { backgroundColor: colors.saffron, borderRadius: radii.pill },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 14, color: colors.parchment }}>
                {contentByLang(lang, 'व्रत-पर्व देखें →', 'Browse व्रत-पर्व →')}
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Metric band */}
            <View ref={myVratRef} collapsable={false} style={[styles.metricBand, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.card]}>
              <Metric value={followCount} label={contentByLang(lang, 'फ़ॉलो', 'Following')} lang={lang} colors={colors} />
              <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />
              <Metric value={reminderCount} label={contentByLang(lang, 'अनुस्मारक', 'Reminders on')} lang={lang} colors={colors} />
              <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />
              <Metric value={thisMonthCount} label={contentByLang(lang, 'इस माह', 'This month')} lang={lang} colors={colors} />
            </View>

            <Pressable
              onPress={() => setSheet({ mode: 'default' })}
              accessibilityRole="button"
              accessibilityLabel="Reminder defaults"
              style={({ pressed }) => [styles.defaultsRow, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.saffronDeep }}>
                {contentByLang(lang, '🔔 डिफ़ॉल्ट अनुस्मारक', '🔔 Reminder defaults')}
              </Text>
              <Text style={{ fontSize: 16, color: colors.inkMuted }}>›</Text>
            </Pressable>

            {/* Priority list */}
            <Text style={[styles.sectionHeading, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
              {contentByLang(lang, 'मेरी प्राथमिकता', 'My priority')}
            </Text>
            {items.map((it) => (
              <PriorityRow
                key={it.rule.id}
                rule={it.rule}
                nextDate={it.next?.date ?? null}
                today={today}
                lang={lang}
                colors={colors}
                typography={typography}
                radii={radii}
                reminderOn={reminderOnFor(it.follow)}
                onOpen={() => navigation.navigate('ObservanceDetail', { ruleId: it.rule.id })}
                onBell={() =>
                  setSheet({
                    mode: 'vrat',
                    ruleId: it.rule.id,
                    name: contentByLang(lang, it.rule.nameHi, it.rule.nameEn),
                    initial: it.follow.reminder ?? reminderDefault,
                  })
                }
              />
            ))}

            {/* Upcoming timeline (among followed) */}
            {upcoming.length > 0 && (
              <>
                <Text style={[styles.sectionHeading, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), marginTop: 22 }]}>
                  {contentByLang(lang, 'आगामी', 'Upcoming')}
                </Text>
                {upcoming.map((it, i) => (
                  <View
                    key={it.rule.id}
                    style={[styles.upRow, { borderBottomColor: i < upcoming.length - 1 ? colors.divider : 'transparent' }]}
                  >
                    <View style={[styles.upDot, { backgroundColor: colors.saffron }]} />
                    <Text style={{ flex: 1, fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 14, color: colors.inkSoft }}>
                      {contentByLang(lang, it.rule.nameHi, it.rule.nameEn)}
                    </Text>
                    <Text style={{ fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkSoft }}>
                      {shortDate(it.next.date, lang)} · {relativeLabel(it.next.date, today, lang)}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
      {sheet && (
        <VratReminderSheet
          visible
          onClose={() => setSheet(null)}
          titleName={sheet.mode === 'vrat' ? sheet.name : null}
          initial={sheet.mode === 'vrat' ? sheet.initial : reminderDefault}
          onSave={(pref) => {
            if (sheet.mode === 'vrat') setReminder(sheet.ruleId, pref);
            else setReminderDefault(pref);
          }}
        />
      )}
    </View>
  );
}

function Metric({ value, label, lang, colors }: { value: number; label: string; lang: Lang; colors: any }) {
  return (
    <View style={styles.metric}>
      <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 22, color: colors.saffronDeep }}>{value}</Text>
      <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latin : scriptBodyFont(lang, fontFamilies.devanagari), fontSize: 12, color: colors.inkMuted, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

function PriorityRow({
  rule,
  nextDate,
  today,
  lang,
  colors,
  typography,
  radii,
  reminderOn,
  onOpen,
  onBell,
}: {
  rule: ObservanceRule;
  nextDate: Date | null;
  today: Date;
  lang: Lang;
  colors: any;
  typography: any;
  radii: any;
  reminderOn: boolean;
  onOpen: () => void;
  onBell: () => void;
}) {
  return (
    <View style={[styles.prow, { borderBottomColor: colors.divider }]}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={contentByLang(lang, rule.nameHi, rule.nameEn)}
        style={({ pressed }) => [{ flex: 1, paddingRight: 10 }, pressed && { opacity: 0.6 }]}
      >
        <Text style={{ fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), fontSize: 15, color: colors.ink }}>
          {contentByLang(lang, rule.nameHi, rule.nameEn)}
        </Text>
        <Text style={{ ...captionFont(lang === 'en' ? rule.nameHi : rule.nameEn), fontSize: 13, color: colors.inkMuted, marginTop: 2 }}>
          {lang === 'en' ? rule.nameHi : rule.nameEn}
        </Text>
      </Pressable>
      {nextDate && (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: lang === 'en' ? fontFamilies.interSemiBold : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkSoft }}>
            {shortDate(nextDate, lang)}
          </Text>
          <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latin : scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 12, color: colors.inkSoft, marginTop: 1 }}>
            {relativeLabel(nextDate, today, lang)}
          </Text>
        </View>
      )}
      <Pressable
        onPress={onBell}
        accessibilityRole="button"
        accessibilityState={{ selected: reminderOn }}
        accessibilityLabel={`Reminders for ${rule.nameEn}`}
        hitSlop={6}
        style={[
          styles.bell,
          {
            borderColor: reminderOn ? colors.saffron : colors.divider,
            backgroundColor: reminderOn ? colors.saffron : 'transparent',
            borderRadius: radii.md,
          },
        ]}
      >
        <Text style={{ fontSize: 13, color: reminderOn ? colors.parchment : colors.inkMuted }}>🔔</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { width: 36, height: 36, borderWidth: 1, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  browseBtn: { marginTop: 22, minHeight: 44, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  metricBand: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingVertical: 14, marginTop: 8, marginBottom: 6 },
  metric: { flex: 1, alignItems: 'center' },
  metricDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginVertical: 6 },
  sectionHeading: { fontSize: 15, marginTop: 18, marginBottom: 6 },
  prow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth },
  upRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  upDot: { width: 6, height: 6, borderRadius: 3 },
  defaultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginTop: 2 },
  bell: { width: 34, height: 34, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
