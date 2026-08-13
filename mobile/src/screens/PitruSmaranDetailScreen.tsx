import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import ReaderHeader from '@/components/ReaderHeader';
import ObservanceDetailHero from '@/components/ObservanceDetailHero';
import { useGitaLanguage } from '@/data/gita/language';
import { usePitruSmaran } from '@/contexts/PitruSmaranContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { addDays } from '@/panchang/calendarGrid';
import {
  nextObservanceForEntry,
  pakshaShraddhaDay,
  pitruPakshaWindow,
  tithiName,
} from '@/panchang/pitruSmaran';
import {
  entryCaption,
  entryDisplayName,
  fullDate,
  inDaysLabel,
  shortDateWithYear,
  startOfLocalDay,
} from '@/panchang/pitruSmaranDisplay';
import { VARA_NAMES_EN, VARA_NAMES_HI } from '@/panchang/names';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';
import { contentByLang } from '@/utils/localize';
import { scriptBodyFont, scriptTitleFont } from '@/utils/langType';
import type { MoreStackParamList, TabParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'PitruSmaranDetail'>;

type Solved = {
  next: Date | null;
  following: Date | null; // the occurrence after `next` ("अगले वर्ष")
  pakshaYear: number;
  pakshaDay: Date | null;
};

// गीता पाठ deep links: Adhyaya 15 (Purushottama Yoga) and Adhyaya 2 are the
// traditional shraddha-paath chapters; both ship in the Gita reader already.
const GITA_PAATH_CHAPTERS = [
  { chapter: 15, labelHi: 'गीता — पंचदश अध्याय', labelEn: 'Gita — Adhyaya 15' },
  { chapter: 2, labelHi: 'गीता — द्वितीय अध्याय', labelEn: 'Gita — Adhyaya 2' },
] as const;

/**
 * Person detail (PRD-17) — the §33 ObservanceDetail hero pattern: name 24 pt
 * centred, tithi caption, the saffron-tint "अगला · date · in N days" pill; then
 * next year's date, this year's Pitru Paksha day, and गीता पाठ links. Delete is
 * a full confirm sheet. No share surface, no celebration.
 */
export default function PitruSmaranDetailScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const rootNav = useNavigation<NavigationProp<TabParamList>>();
  const { getEntry, removeEntry, updateEntry } = usePitruSmaran();
  const { permissionStatus, requestPermission } = useNotificationPreferences();

  const entry = getEntry(route.params.entryId);
  const today = startOfLocalDay(new Date());
  const todayMs = today.getTime();

  const [solved, setSolved] = useState<Solved | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tithiRule = entry?.tithiRule;
  useEffect(() => {
    if (!tithiRule) return undefined;
    let cancelled = false;
    const handle = setTimeout(() => {
      const day = new Date(todayMs);
      const result: Solved = { next: null, following: null, pakshaYear: day.getFullYear(), pakshaDay: null };
      try {
        result.next = nextObservanceForEntry({ tithiRule }, day);
        if (result.next) {
          result.following = nextObservanceForEntry({ tithiRule }, addDays(result.next, 1));
        }
        // "पितृ पक्ष में किस दिन" — this year's fortnight, or next year's once
        // this year's सर्वपितृ अमावस्या has passed.
        let year = day.getFullYear();
        const window = pitruPakshaWindow(year);
        if (window && window.end.getTime() < day.getTime()) year += 1;
        result.pakshaYear = year;
        result.pakshaDay = pakshaShraddhaDay(tithiRule, year);
      } catch {
        // leave nulls — rows render only when solved
      }
      if (!cancelled) setSolved(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [tithiRule, todayMs]);

  const bodyFont = scriptBodyFont(lang, typography.meaning.fontFamily);
  const titleFont = scriptTitleFont(lang, typography.readerTitle.fontFamily);

  const openGitaChapter = (chapter: number) => {
    rootNav.navigate('HomeTab', { screen: 'GitaReader', params: { chapter } });
  };

  const deleteEntry = () => {
    if (!entry) return;
    setConfirmDelete(false);
    removeEntry(entry.id);
    navigation.goBack();
  };

  const setReminderEnabled = async (enabled: boolean) => {
    if (!entry) return;
    if (!enabled) {
      updateEntry(entry.id, { reminderEnabled: false });
      return;
    }
    const status = permissionStatus === 'granted' ? 'granted' : await requestPermission();
    updateEntry(entry.id, { reminderEnabled: status === 'granted' });
  };

  const weekdayName = (d: Date): string =>
    contentByLang(lang, VARA_NAMES_HI[d.getDay()], VARA_NAMES_EN[d.getDay()]);

  const pakshaDayLabel = (): string => {
    if (!solved?.pakshaDay || !entry) return '';
    const dateLabel = shortDateWithYear(solved.pakshaDay, lang);
    if (entry.tithiRule === 'sarvapitri') {
      return `${contentByLang(lang, 'सर्वपितृ अमावस्या', 'Sarvapitri Amavasya')} — ${dateLabel}`;
    }
    const shraddha = contentByLang(
      lang,
      `${tithiName(entry.tithiRule, 'hi')} श्राद्ध`,
      `${tithiName(entry.tithiRule, 'en')} Shraddha`
    );
    return `${shraddha} — ${dateLabel}`;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'पितृ स्मरण', 'Pitru Smaran')}
          onBack={() => navigation.goBack()}
          right={
            entry ? (
              <Pressable
                onPress={() => navigation.navigate('PitruSmaranEdit', { entryId: entry.id })}
                accessibilityRole="button"
                accessibilityLabel="Edit smaran"
                hitSlop={12}
                style={({ pressed }) => pressed && { opacity: 0.6 }}
              >
                <Text style={{ fontFamily: fontFamilies.interSemiBold, fontSize: 12, color: colors.saffron }}>
                  {contentByLang(lang, 'सम्पादन', 'Edit')}
                </Text>
              </Pressable>
            ) : undefined
          }
          sideWidth={64}
        />

        {!entry ? (
          <View style={styles.centered}>
            <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.inkMuted }}>
              {contentByLang(lang, 'यह प्रविष्टि नहीं मिली।', 'Entry not found.')}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
          >
            <ObservanceDetailHero
              style={styles.hero}
              layout="smaran"
              leading={(
                <Text style={{ fontFamily: typography.readerTitle.fontFamily, fontSize: 14, color: colors.gold, letterSpacing: 6 }}>
                  ॥ ॐ ॥
                </Text>
              )}
              title={entryDisplayName(entry, lang)}
              caption={(
                <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkSoft, textAlign: 'center' }}>
                  {contentByLang(lang, 'श्राद्ध तिथि:', 'Shraddha tithi:')} {entryCaption(entry, lang)}
                </Text>
              )}
              nextLabel={solved?.next
                ? `${contentByLang(lang, 'अगला', 'Next')} · ${fullDate(solved.next, lang)} · ${inDaysLabel(solved.next, today, lang)}`
                : null}
            />

            {/* Next year */}
            {solved?.following && (
              <View style={[styles.row, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
                <View style={styles.rowMain}>
                  <Text style={[styles.rowLabel, { color: colors.inkMuted }]}>
                    {contentByLang(lang, 'अगले वर्ष', 'NEXT YEAR')}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 2 }}>
                    {weekdayName(solved.following)}, {fullDate(solved.following, lang)}
                  </Text>
                </View>
              </View>
            )}

            {/* Pitru Paksha mapping */}
            {solved?.pakshaDay && (
              <View style={[styles.row, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
                <View style={styles.rowMain}>
                  <Text style={[styles.rowLabel, { color: colors.inkMuted }]}>
                    {contentByLang(lang, `पितृ पक्ष ${solved.pakshaYear} में`, `IN PITRU PAKSHA ${solved.pakshaYear}`)}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 2 }}>
                    {pakshaDayLabel()}
                  </Text>
                </View>
              </View>
            )}

            {/* Personal notifications are deliberately OFF until this person is opted in. */}
            <View style={[styles.row, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md }]}>
              <View style={styles.rowMain}>
                <Text style={[styles.rowLabel, { color: colors.inkMuted }]}>
                  {contentByLang(lang, 'स्मरण अनुस्मारक', 'SMARAN REMINDER')}
                </Text>
                <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 19, color: colors.inkSoft, marginTop: 3 }}>
                  {contentByLang(lang, 'एक दिन पहले और उसी दिन', 'Day before and day of')}
                </Text>
              </View>
              <Switch
                value={entry.reminderEnabled === true}
                onValueChange={setReminderEnabled}
                trackColor={{ false: colors.divider, true: colors.gold }}
                thumbColor={colors.parchmentHighlight}
                accessibilityRole="switch"
                accessibilityLabel="Smaran reminder"
                accessibilityHint="Notifies the day before and the day of this remembrance"
              />
            </View>

            {/* गीता पाठ deep links */}
            {GITA_PAATH_CHAPTERS.map(({ chapter, labelHi, labelEn }, i) => (
              <Pressable
                key={chapter}
                onPress={() => openGitaChapter(chapter)}
                accessibilityRole="button"
                accessibilityLabel={`Open ${labelEn}`}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.md },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={styles.rowMain}>
                  <Text style={[styles.rowLabel, { color: colors.inkMuted }]}>
                    {i === 0
                      ? contentByLang(lang, 'उस दिन पाठ', 'PAATH FOR THE DAY')
                      : contentByLang(lang, 'पाठ', 'PAATH')}
                  </Text>
                  <Text style={{ fontFamily: bodyFont, fontSize: 14, color: colors.ink, marginTop: 2 }}>
                    {contentByLang(lang, labelHi, labelEn)}
                  </Text>
                </View>
                <Text style={{ fontSize: 17, color: colors.saffron }}>›</Text>
              </Pressable>
            ))}

            {/* Delete */}
            <Pressable
              onPress={() => setConfirmDelete(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete smaran entry"
              style={({ pressed }) => [styles.deleteLink, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkMuted, textDecorationLine: 'underline' }}>
                {contentByLang(lang, 'प्रविष्टि हटाएँ', 'Delete entry')}
              </Text>
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>

      {/* Delete confirm — a full modal card (never a swipe-only gesture, §12). */}
      <Modal visible={confirmDelete} transparent animationType="fade" onRequestClose={() => setConfirmDelete(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.modalBackdrop }]}>
          <View style={[styles.confirmCard, { backgroundColor: colors.parchmentSoft, borderColor: colors.divider, borderRadius: radii.lg }, elevation.raised]}>
            <Text style={{ fontFamily: titleFont, fontSize: 16, color: colors.ink, textAlign: 'center' }}>
              {contentByLang(lang, 'प्रविष्टि हटाएँ?', 'Delete this entry?')}
            </Text>
            <Text style={{ fontFamily: bodyFont, fontSize: 13, lineHeight: 21, color: colors.inkSoft, textAlign: 'center', marginTop: 8 }}>
              {contentByLang(
                lang,
                'यह स्मरण इस फ़ोन से हट जाएगा। यह क्रिया वापस नहीं होगी।',
                'This remembrance will be removed from this phone. This cannot be undone.'
              )}
            </Text>
            <Pressable
              onPress={deleteEntry}
              accessibilityRole="button"
              accessibilityLabel="Confirm delete"
              style={({ pressed }) => [styles.confirmBtn, { backgroundColor: colors.saffron, borderRadius: radii.md }, pressed && { opacity: 0.85 }]}
            >
              <Text style={{ fontFamily: titleFont, fontSize: 14, color: colors.onPrimary }}>
                {contentByLang(lang, 'हटाएँ', 'Delete')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setConfirmDelete(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel delete"
              style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={{ fontFamily: bodyFont, fontSize: 13, color: colors.inkMuted }}>
                {contentByLang(lang, 'रहने दें', 'Keep it')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  scroll: { paddingTop: 4, paddingBottom: 40 },
  hero: { marginTop: 4, marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
    minHeight: 44,
  },
  rowMain: { flex: 1 },
  rowLabel: { fontFamily: fontFamilies.interSemiBold, fontSize: 11, letterSpacing: 0.5 },
  deleteLink: { alignItems: 'center', marginTop: 14, minHeight: 44, justifyContent: 'center' },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  confirmCard: { width: '100%', maxWidth: 340, borderWidth: 1, padding: 20 },
  confirmBtn: { minHeight: 46, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  cancelBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
