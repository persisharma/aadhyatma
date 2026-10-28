import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import CatalogBackground from '@/components/CatalogBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage, type Lang } from '@/data/gita/language';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getNextOccurrence, getRuleById } from '@/panchang/vratCatalog';
import { useVratFollows, type VratFollow, type VratReminderPref } from '@/contexts/VratFollowContext';
import VratReminderSheet from '@/components/VratReminderSheet';
import VratReminderPermissionNotice from '@/components/VratReminderPermissionNotice';
import MuhuratFollowList from '@/components/MuhuratFollowList';
import { useMuhuratFollows } from '@/contexts/MuhuratFollowContext';
import ObservancePreviewCard from '@/components/ObservancePreviewCard';
import ReaderHeader from '@/components/ReaderHeader';
import { ListingCardFrame } from '@/components/ListingCard';
import CachedArtwork from '@/components/CachedArtwork';
import AppIcon from '@/components/AppIcon';
import { observanceCountdown } from '@/panchang/observancePresentation';
import { captionFont } from '@/utils/scriptFont';
import { contentByLang, meaningByLang } from '@/utils/localize';
import { scriptTitleFont, scriptBodyFont } from '@/utils/langType';
import { fontFamilies } from '@/theme/typography';
import { transliterateDevanagari } from '@/utils/transliterate';
import type { ObservanceRule } from '@/panchang/types';
import type { PanchangStackParamList } from '@/navigation/types';
import { useTourTarget } from '@/components/tour/tourTargets';
import { useIsFocused } from '@react-navigation/native';

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


type FollowItem = {
  follow: VratFollow;
  rule: ObservanceRule;
  next: ReturnType<typeof getNextOccurrence>;
};

export default function MyVratScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  // Feature-tour anchor (design.md §47) — the content region in both the empty
  // (first-launch) and populated states.
  const isFocused = useIsFocused();
  const myVratRef = useTourTarget('myVrat', undefined, isFocused);
  const [calendarSystem] = usePanchangCalendarSystem();
  const { follows, followCount, reminderCount, reminderDefault, setReminder, setReminderDefault, unfollow } =
    useVratFollows();
  // Muhurat follows (PRD-16 §6.7) share this screen — one ★ inventory, not two.
  // They also gate the empty state: a user may follow a muhurat before any vrat.
  const { followCount: muhuratFollowCount } = useMuhuratFollows();

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

  const [sheet, setSheet] = useState<
    { mode: 'vrat'; ruleId: string; name: string; initial: VratReminderPref } | { mode: 'default' } | null
  >(null);

  const reminderOnFor = (f: VratFollow) => {
    const r = f.reminder ?? reminderDefault;
    return r.dayOf || r.advanceDays > 0;
  };

  return (
    <View style={styles.root}>
      <CatalogBackground />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader title={contentByLang(lang, 'मेरा व्रत', 'My Vrat')} onBack={() => navigation.goBack()}
          titleContent={<>
            <Text style={{ ...typography.cardHindi, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily), color: colors.ink }}>{contentByLang(lang, 'मेरा व्रत', 'My Vrat')}</Text>
            <Text style={{ ...captionFont(lang === 'en' ? 'मेरा व्रत' : 'My Vrat'), fontSize: 13, lineHeight: 20, color: colors.inkMuted }}>{lang === 'en' ? 'मेरा व्रत' : 'My Vrat'} · {followCount + muhuratFollowCount}</Text>
          </>} />

        {followCount === 0 && muhuratFollowCount === 0 ? (
          <ScrollView contentContainerStyle={styles.empty}>
            <View ref={myVratRef} collapsable={false} style={{ width: '100%', alignItems: 'center' }}>
            <CachedArtwork source={require("@assets/icons/observance-scenes/karwa-chauth-puja-muted.webp")} style={{ width: 200, height: 100, marginBottom: 16 }} />
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
                'व्रत पर घंटी दबाकर स्मरण जोड़ें — वह यहाँ अगली तिथि के अनुसार दिखेगा।',
                'Tap a vrat’s reminder bell to save it here, sorted by its next date.'
              )}
            </Text>
            <Pressable
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Browse Vrat and Parv"
              style={({ pressed }) => [
                styles.browseBtn,
                { backgroundColor: colors.catalogAccent, borderRadius: radii.pill },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 14, color: colors.parchment }}>
                {contentByLang(lang, 'व्रत-पर्व देखें →', 'Browse व्रत-पर्व →')}
              </Text>
            </Pressable>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
          >
            {reminderCount > 0 && <VratReminderPermissionNotice />}
            {/* Metric band. The vrat blocks render only when a vrat is actually
                followed — this screen can now be reached with muhurat follows
                and none of its own. */}
            <View ref={myVratRef} collapsable={false}><ListingCardFrame tone="catalog" style={styles.metricBand}>
              <Metric value={followCount} label={contentByLang(lang, 'सहेजे व्रत', 'Saved vrats')} lang={lang} colors={colors} />
              <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />
              <Metric value={reminderCount} label={contentByLang(lang, 'अनुस्मारक', 'Reminders on')} lang={lang} colors={colors} />
              <View style={[styles.metricDivider, { backgroundColor: colors.divider }]} />
              <Metric value={thisMonthCount} label={contentByLang(lang, 'इस माह', 'This month')} lang={lang} colors={colors} />
            </ListingCardFrame></View>

            {followCount > 0 && (
            <Pressable
              onPress={() => setSheet({ mode: 'default' })}
              accessibilityRole="button"
              accessibilityLabel="Vrat reminder timings"
              style={({ pressed }) => [styles.defaultsRow, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontFamily: scriptBodyFont(lang, typography.meaning.fontFamily), fontSize: 13, color: colors.saffronDeep }}>
                {contentByLang(lang, 'व्रत स्मरण का समय', 'Vrat reminder timings')}
              </Text>
              <AppIcon name="bell" size={20} color={colors.saffronDeep} />
            </Pressable>
            )}

            {/* Priority list */}
            {followCount > 0 && (
            <>
            <Text style={[styles.sectionHeading, { color: colors.ink, fontFamily: scriptTitleFont(lang, typography.readerTitle.fontFamily) }]}>
              {contentByLang(lang, 'मेरी प्राथमिकता', 'My priority')}
            </Text>
            {items.map((it) => (
              <ObservancePreviewCard key={it.rule.id} rule={it.rule} lang={lang} following
                dateLabel={it.next ? shortDate(it.next.date, lang) : undefined}
                countdown={it.next ? observanceCountdown(it.next.date, today, lang) : undefined}
                reminderOn={reminderOnFor(it.follow)}
                onToggleReminder={() => unfollow(it.rule.id)}
                onPress={() => navigation.navigate('ObservanceDetail', { ruleId: it.rule.id })}
                onEditReminder={() => setSheet({ mode: 'vrat', ruleId: it.rule.id,
                  name: contentByLang(lang, it.rule.nameHi, it.rule.nameEn), initial: it.follow.reminder ?? reminderDefault })}
              />
            ))}

            </>
            )}

            <MuhuratFollowList
              onOpen={(occasionId, dateMs) =>
                navigation.navigate('MuhuratDayDetail', { occasionId, dateMs })
              }
            />
          </ScrollView>
        )}
      </SafeAreaView>
      {sheet && (
        <VratReminderSheet
          visible
          onClose={() => setSheet(null)}
          titleName={sheet.mode === 'vrat' ? sheet.name : null}
          footnote={contentByLang(lang, 'व्रत के स्मरण और दैनिक भक्ति के स्मरण अलग हैं।', 'Vrat reminders are separate from Daily Bhakti reminders.')}
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
      <Text style={{ fontFamily: lang === 'en' ? fontFamilies.latin : scriptBodyFont(lang, fontFamilies.devanagari), fontSize: 12, lineHeight: 20, textAlign: 'center', color: colors.inkMuted, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 8, paddingBottom: 32 },
  empty: { flexGrow: 1, paddingVertical: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  browseBtn: { marginTop: 22, minHeight: 44, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  metricBand: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, marginTop: 8, marginBottom: 6 },
  metric: { flex: 1, alignItems: 'center' },
  metricDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginVertical: 6 },
  sectionHeading: { fontSize: 15, marginTop: 18, marginBottom: 6 },
  defaultsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, marginTop: 2 },
});
