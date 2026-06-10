import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutines } from '@/contexts/RoutineContext';
import { library } from '@/data/texts';
import { findJapamMantra } from '@/data/japam';
import { navigationRef } from '@/notifications/deepLink';
import type { RoutineItem } from '@/data/routine/types';

type Props = {
  /** Library entry id (or japam mantra id) to add; null hides the sheet. */
  sourceId: string | null;
  onClose: () => void;
};

/** A whole-section or japam item already present for this source (chapter items
 * are managed separately and don't count as "the whole thing is added"). */
function existingWholeItem(items: RoutineItem[], sourceId: string): RoutineItem | undefined {
  return items.find(
    (i) => i.sourceId === sourceId && (i.kind === 'section' || i.kind === 'japam')
  );
}

export default function AddToRoutineSheet({ sourceId, onClose }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { routines, addItem, removeItem } = useRoutines();
  const isHi = lang === 'hi';

  const entry = sourceId ? library.find((e) => e.id === sourceId) : undefined;
  const mantra = sourceId ? findJapamMantra(sourceId) : null;
  const isJapam = entry?.category === 'japam' || (!entry && !!mantra);
  const isGranth = entry?.category === 'granth';

  const titleHi = entry?.nameHi ?? mantra?.nameHi ?? sourceId ?? '';
  const titleEn = entry?.nameEn ?? mantra?.nameEn ?? sourceId ?? '';

  const toggle = (routineId: string) => {
    if (!sourceId) return;
    const routine = routines.find((r) => r.id === routineId);
    if (!routine) return;
    const existing = existingWholeItem(routine.items, sourceId);
    if (existing) {
      removeItem(routineId, existing.id);
      return;
    }
    addItem(routineId, {
      kind: isJapam ? 'japam' : 'section',
      sourceId,
      ...(isJapam ? { targetRounds: 1 } : {}),
      ...(routine.mode === 'weekday' ? { weekdays: [new Date().getDay()] } : {}),
    });
  };

  const startNewRoutine = () => {
    onClose();
    // Navigate from outside a navigator via the shared ref (sheet lives above
    // the NavigationContainer). Cast the call signature, not via `any`.
    (navigationRef.navigate as (name: string, params?: object) => void)('HomeTab', {
      screen: 'RoutineCreate',
    });
  };

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
          style={[
            styles.sheet,
            { backgroundColor: colors.parchmentHighlight, paddingHorizontal: spacing.xxl },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.divider }]} />
          <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 18, color: colors.ink, textAlign: 'center' }}>
            {isHi ? `${titleHi} जोड़ें` : `Add ${titleEn}`}
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
            {isHi ? `“${titleEn}” को साधना में जोड़ें` : `Add “${titleHi}” to a routine`}
          </Text>

          {isGranth && (
            <Text
              style={{
                fontFamily: typography.cardLatin.fontFamily,
                fontSize: 11,
                color: colors.inkMuted,
                textAlign: 'center',
                marginBottom: spacing.sm,
              }}
            >
              {isHi
                ? 'ग्रंथ — पूरा जोड़ा जा रहा है (अध्याय-स्तर शीघ्र)'
                : 'Granth — adding the whole text (chapter-level coming soon)'}
            </Text>
          )}

          <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
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
                {isHi ? 'अभी कोई साधना नहीं' : 'No routines yet'}
              </Text>
            )}

            {routines.map((r) => {
              const added = sourceId ? !!existingWholeItem(r.items, sourceId) : false;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => toggle(r.id)}
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
                    {r.nameHi || r.nameEn}
                  </Text>
                  <View style={{ backgroundColor: colors.saffronTint, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <Text style={{ ...typography.versePill, color: colors.saffronDeep }}>
                      {r.mode === 'weekday' ? (isHi ? 'वार' : 'WEEKDAY') : isHi ? 'दैनिक' : 'DAILY'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            <Pressable onPress={startNewRoutine} accessibilityRole="button" style={styles.newRow}>
              <Text style={{ color: colors.saffron, fontSize: 20, marginRight: 10 }}>＋</Text>
              <Text style={{ fontFamily: typography.verseLatin.fontFamily, fontSize: 15, color: colors.saffron }}>
                {isHi ? 'नई साधना बनाएँ' : 'New routine'}
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
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1 },
  check: { width: 22, height: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  newRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
});
