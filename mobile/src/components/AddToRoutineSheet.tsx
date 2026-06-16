import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang, pick } from '@/utils/localize';
import { useRoutines } from '@/contexts/RoutineContext';
import { library } from '@/data/texts';
import { findJapamMantra } from '@/data/japam';
import { chaptersForSource } from '@/data/routine/chapters';
import { navigationRef } from '@/notifications/deepLink';
import type { Routine, RoutineItem } from '@/data/routine/types';

type Props = {
  /** Library entry id (or japam mantra id) to add; null hides the sheet. */
  sourceId: string | null;
  /** Pre-selected chapter for a chaptered source (e.g. opened from a reader). */
  initialChapter?: number;
  onClose: () => void;
};

/** The unit currently chosen in the sheet: the whole text or one chapter. */
type Unit = { kind: 'section' | 'japam' } | { kind: 'chapter'; chapter: number };

function findUnitItem(items: RoutineItem[], sourceId: string, unit: Unit): RoutineItem | undefined {
  if (unit.kind === 'chapter') {
    return items.find((i) => i.kind === 'chapter' && i.sourceId === sourceId && i.chapter === unit.chapter);
  }
  return items.find((i) => i.sourceId === sourceId && (i.kind === 'section' || i.kind === 'japam'));
}

export default function AddToRoutineSheet({ sourceId, initialChapter, onClose }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { routines, addItem, removeItem } = useRoutines();

  const entry = sourceId ? library.find((e) => e.id === sourceId) : undefined;
  const mantra = sourceId ? findJapamMantra(sourceId) : null;
  const isJapam = entry?.category === 'japam' || (!entry && !!mantra);
  const chapters = sourceId ? chaptersForSource(sourceId) : [];

  const titleHi = entry?.nameHi ?? mantra?.nameHi ?? sourceId ?? '';
  const titleEn = entry?.nameEn ?? mantra?.nameEn ?? sourceId ?? '';
  const tName = contentByLang(lang, titleHi, titleEn);

  // Selected unit: 'whole' (null) or a chapter number. Reset when the sheet
  // re-opens for a new source / chapter.
  const [chapterSel, setChapterSel] = useState<number | null>(initialChapter ?? null);
  useEffect(() => {
    setChapterSel(initialChapter ?? null);
  }, [sourceId, initialChapter]);

  const unit: Unit =
    chapterSel != null
      ? { kind: 'chapter', chapter: chapterSel }
      : { kind: isJapam ? 'japam' : 'section' };

  const toggle = (routine: Routine) => {
    if (!sourceId) return;
    const existing = findUnitItem(routine.items, sourceId, unit);
    if (existing) {
      removeItem(routine.id, existing.id);
      return;
    }
    const weekdayPart = routine.mode === 'weekday' ? { weekdays: [new Date().getDay()] } : {};
    if (unit.kind === 'chapter') {
      addItem(routine.id, { kind: 'chapter', sourceId, chapter: unit.chapter, ...weekdayPart });
    } else if (unit.kind === 'japam') {
      addItem(routine.id, { kind: 'japam', sourceId, targetRounds: 1, ...weekdayPart });
    } else {
      addItem(routine.id, { kind: 'section', sourceId, ...weekdayPart });
    }
  };

  const startNewRoutine = () => {
    onClose();
    (navigationRef.navigate as (name: string, params?: object) => void)('HomeTab', {
      screen: 'RoutineCreate',
    });
  };

  const chip = (selected: boolean) => ({
    borderWidth: selected ? 1.5 : 1,
    borderColor: selected ? colors.saffron : colors.divider,
    backgroundColor: selected ? colors.parchmentHighlight : colors.parchmentSoft,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  });

  return (
    <Modal visible={sourceId != null} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable
        accessible={false}
        style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
        onPress={onClose}
      >
        <Pressable
          accessible={false}
          onPress={(e) => e.stopPropagation()}
          style={[styles.sheet, { backgroundColor: colors.parchmentHighlight, paddingHorizontal: spacing.xxl }]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />
          <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 18, color: colors.ink, textAlign: 'center' }}>
            {pick(lang, { hi: `${tName} जोड़ें`, en: `Add ${tName}`, gu: `${tName} ઉમેરો`, kn: `${tName} ಸೇರಿಸಿ` })}
          </Text>
          <Text
            style={{
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 12,
              color: colors.inkMuted,
              textAlign: 'center',
              marginTop: 2,
              marginBottom: spacing.md,
            }}
          >
            {pick(lang, {
              hi: `“${titleEn}” को साधना में जोड़ें`,
              en: `Add “${titleHi}” to a routine`,
              gu: `“${titleEn}” ને સાધનામાં ઉમેરો`,
              kn: `“${titleEn}” ಅನ್ನು ಸಾಧನೆಗೆ ಸೇರಿಸಿ`,
            })}
          </Text>

          {/* Whole vs. chapter selector for chaptered sources */}
          {chapters.length > 0 && (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={{ ...typography.sectionLabel, color: colors.inkMuted, marginBottom: 8 }}>
                {pick(lang, { hi: 'क्या जोड़ें', en: 'What to add', gu: 'શું ઉમેરવું', kn: 'ಏನು ಸೇರಿಸಬೇಕು' })}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                <Pressable onPress={() => setChapterSel(null)} style={chip(chapterSel == null)}>
                  <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 13, color: colors.ink }}>
                    {pick(lang, { hi: 'पूरा', en: 'Whole', gu: 'આખું', kn: 'ಸಂಪೂರ್ಣ' })}
                  </Text>
                </Pressable>
                {chapters.map((c) => (
                  <Pressable key={c.chapter} onPress={() => setChapterSel(c.chapter)} style={chip(chapterSel === c.chapter)}>
                    <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 13, color: colors.ink }}>
                      {contentByLang(lang, c.titleHi, c.titleEn)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
            {routines.length === 0 && (
              <Text
                style={{
                  fontFamily: typography.meaning.fontFamily,
                  fontSize: 14,
                  color: colors.inkMuted,
                  textAlign: 'center',
                  paddingVertical: spacing.md,
                }}
              >
                {pick(lang, { hi: 'अभी कोई साधना नहीं', en: 'No routines yet', gu: 'હજી કોઈ સાધના નથી', kn: 'ಇನ್ನೂ ಯಾವುದೇ ಸಾಧನೆ ಇಲ್ಲ' })}
              </Text>
            )}

            {routines.map((r) => {
              const added = sourceId ? !!findUnitItem(r.items, sourceId, unit) : false;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => toggle(r)}
                  accessibilityRole="button"
                  style={[styles.row, { borderBottomColor: colors.divider }]}
                >
                  <View
                    style={[
                      styles.check,
                      {
                        borderColor: added ? colors.saffron : colors.gold,
                        backgroundColor: added ? colors.saffron : 'transparent',
                        borderRadius: radii.sm,
                      },
                    ]}
                  >
                    {added && <Text style={{ color: colors.onPrimary, fontSize: 13 }}>✓</Text>}
                  </View>
                  <Text style={{ flex: 1, fontFamily: typography.cardHindi.fontFamily, fontSize: 15, color: colors.ink }}>
                    {contentByLang(lang, r.nameHi || r.nameEn, r.nameEn || r.nameHi)}
                  </Text>
                  <View style={{ backgroundColor: colors.saffronTint, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ ...typography.versePill, color: colors.saffronDeep }}>
                      {r.mode === 'weekday'
                        ? pick(lang, { hi: 'वार', en: 'WEEKDAY', gu: 'વાર', kn: 'ವಾರ' })
                        : pick(lang, { hi: 'दैनिक', en: 'DAILY', gu: 'દૈનિક', kn: 'ದೈನಿಕ' })}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            <Pressable onPress={startNewRoutine} accessibilityRole="button" style={styles.newRow}>
              <Text style={{ color: colors.saffron, fontSize: 20, marginRight: 10 }}>＋</Text>
              <Text style={{ fontFamily: typography.verseLatin.fontFamily, fontSize: 15, color: colors.saffron }}>
                {pick(lang, { hi: 'नई साधना बनाएँ', en: 'New routine', gu: 'નવી સાધના બનાવો', kn: 'ಹೊಸ ಸಾಧನೆ ರಚಿಸಿ' })}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingBottom: 28 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  check: { width: 22, height: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  newRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
});
