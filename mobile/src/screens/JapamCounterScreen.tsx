import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import {
  findJapamMantra,
  JAPAM_BEADS_PER_ROUND,
  type JapamMantra,
} from '@/data/japam';
import { useJapamCounter } from '@/contexts/JapamCounterContext';
import LanguageToggle from '@/components/LanguageToggle';
import Ornament from '@/components/Ornament';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'JapamCounter'>;

export default function JapamCounterScreen({ navigation, route }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { getEntry, increment, resetBeads, clear } = useJapamCounter();

  const mantra: JapamMantra | null = useMemo(
    () => findJapamMantra(route.params.mantraId),
    [route.params.mantraId]
  );

  React.useEffect(() => {
    if (!mantra) {
      const id = setTimeout(() => navigation.goBack(), 0);
      return () => clearTimeout(id);
    }
    return undefined;
  }, [mantra, navigation]);

  const entry = getEntry(mantra?.id ?? '__none__');
  const [confirmKind, setConfirmKind] = useState<'beads' | 'all' | null>(null);
  const lastRoundRef = useRef(entry.rounds);

  const handleTap = useCallback(() => {
    if (!mantra) return;
    const next = increment(mantra.id);
    if (next.rounds > lastRoundRef.current) {
      lastRoundRef.current = next.rounds;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
  }, [increment, mantra]);

  if (!mantra) {
    return <View style={[styles.root, { backgroundColor: colors.parchment }]} />;
  }

  const titleHi = mantra.nameHi;
  const titleEn = mantra.nameEn;

  const beadProgress = entry.count / JAPAM_BEADS_PER_ROUND;
  const beadsLabel = lang === 'hi' ? 'बीज' : 'Beads';
  const roundsLabel = lang === 'hi' ? 'आवृत्ति' : 'Rounds';
  const tapHint = lang === 'hi' ? 'जप के लिए स्पर्श करें' : 'Tap to chant';
  const resetBeadsLabel = lang === 'hi' ? 'बीज पुनः ०' : 'Reset Beads';
  const clearAllLabel = lang === 'hi' ? 'सब साफ़' : 'Clear All';


  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.back,
              {
                backgroundColor: colors.parchmentSoft,
                borderColor: colors.divider,
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
          </Pressable>

          <View style={styles.titleBlock}>
            <Text
              style={[
                lang === 'hi' ? styles.titleHi : styles.titleEn,
                lang === 'hi'
                  ? {
                      color: colors.ink,
                      fontFamily: typography.readerTitle.fontFamily,
                      fontSize: typography.readerTitle.fontSize,
                    }
                  : {
                      color: colors.ink,
                      fontFamily: typography.cardLatin.fontFamily,
                      fontSize: 16,
                    },
              ]}
              numberOfLines={1}
            >
              {lang === 'hi' ? titleHi : titleEn}
            </Text>
          </View>

          <View style={styles.backSpacer} />
        </View>

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <Pressable
          onPress={handleTap}
          accessibilityRole="button"
          accessibilityLabel={`${titleEn}. Tap to count one bead. ${entry.count} of ${JAPAM_BEADS_PER_ROUND} on this round, ${entry.rounds} rounds completed.`}
          style={({ pressed }) => [
            styles.tapArea,
            pressed && styles.tapAreaPressed,
          ]}
        >
          <View style={[styles.tapContent, { paddingHorizontal: spacing.xxl }]}>
            <View style={styles.mantraBlock}>
              {(lang === 'hi' ? mantra.lines : mantra.linesEn).map((line, i) => (
                <Text
                  key={`${lang}-${i}`}
                  style={[
                    lang === 'hi' ? styles.mantraLine : styles.mantraLineEn,
                    lang === 'hi'
                      ? {
                          color: colors.ink,
                          fontFamily: typography.verse.fontFamily,
                          fontSize: typography.verse.fontSize,
                          lineHeight: typography.verse.lineHeight,
                        }
                      : {
                          color: colors.ink,
                          fontFamily: typography.cardLatin.fontFamily,
                          fontSize: 20,
                          lineHeight: 34,
                        },
                  ]}
                >
                  {line}
                </Text>
              ))}
            </View>

            <Ornament />

            <View style={styles.countBlock}>
              <Text
                style={[
                  styles.countNumber,
                  {
                    color: colors.saffronDeep,
                  },
                ]}
              >
                {entry.count}
              </Text>
              <Text
                style={[
                  styles.countDenominator,
                  {
                    color: colors.inkMuted,
                    fontFamily: typography.pageCounter.fontFamily,
                  },
                ]}
              >
                / {JAPAM_BEADS_PER_ROUND} {beadsLabel}
              </Text>

              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.dotRest },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, beadProgress * 100)}%`,
                      backgroundColor: colors.saffron,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.roundsLabel,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {entry.rounds} {roundsLabel}
              </Text>
            </View>

            <Text
              style={[
                styles.tapHint,
                {
                  color: colors.inkMuted,
                  fontFamily: typography.swipeHint.fontFamily,
                  fontSize: typography.swipeHint.fontSize,
                },
              ]}
            >
              {tapHint}
            </Text>
          </View>
        </Pressable>

        <View
          style={[
            styles.actionsRow,
            { paddingHorizontal: spacing.xxl, borderTopColor: colors.divider },
          ]}
        >
          <Pressable
            onPress={() => setConfirmKind('beads')}
            accessibilityRole="button"
            accessibilityLabel="Reset bead count"
            accessibilityState={{ disabled: entry.count === 0 }}
            disabled={entry.count === 0}
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.md,
              },
              pressed && { opacity: 0.7 },
              entry.count === 0 && { opacity: 0.4 },
            ]}
          >
            <Text
              style={[
                styles.actionText,
                {
                  color: colors.saffronDeep,
                  fontFamily: typography.readerTitle.fontFamily,
                },
              ]}
            >
              {resetBeadsLabel}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setConfirmKind('all')}
            accessibilityRole="button"
            accessibilityLabel="Clear bead count and rounds"
            accessibilityState={{ disabled: entry.count === 0 && entry.rounds === 0 }}
            disabled={entry.count === 0 && entry.rounds === 0}
            hitSlop={8}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                borderColor: colors.divider,
                borderRadius: radii.md,
              },
              pressed && { opacity: 0.7 },
              entry.count === 0 && entry.rounds === 0 && { opacity: 0.4 },
            ]}
          >
            <Text
              style={[
                styles.actionText,
                {
                  color: colors.inkMuted,
                  fontFamily: typography.readerTitle.fontFamily,
                },
              ]}
            >
              {clearAllLabel}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal
        visible={confirmKind !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmKind(null)}
      >
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.modalBackdrop }]}
          onPress={() => setConfirmKind(null)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.confirmCard,
              {
                backgroundColor: colors.parchment,
                borderColor: colors.cardActiveBorder,
                borderRadius: radii.lg,
              },
            ]}
          >
            <Text
              style={[
                styles.confirmTitle,
                {
                  color: colors.ink,
                  fontFamily: typography.readerTitle.fontFamily,
                },
              ]}
            >
              {confirmKind === 'beads'
                ? lang === 'hi'
                  ? 'बीज पुनः शून्य करें?'
                  : 'Reset bead count?'
                : lang === 'hi'
                  ? 'सब हटायें?'
                  : 'Clear everything?'}
            </Text>
            <Text
              style={[
                styles.confirmBody,
                {
                  color: colors.inkSoft,
                  fontFamily: typography.cardLatin.fontFamily,
                },
              ]}
            >
              {confirmKind === 'beads'
                ? lang === 'hi'
                  ? 'चालू आवृत्ति की गिनती शून्य हो जायेगी। पूर्ण आवृत्तियाँ सुरक्षित रहेंगी।'
                  : 'The current bead count will reset to 0. Completed rounds are kept.'
                : lang === 'hi'
                  ? 'बीज तथा सभी आवृत्तियाँ मिट जायेंगी। यह क्रिया पूर्ववत् नहीं की जा सकती।'
                  : 'Beads and all rounds will be erased. This cannot be undone.'}
            </Text>

            <Pressable
              onPress={() => {
                if (confirmKind === 'beads') {
                  resetBeads(mantra.id);
                } else if (confirmKind === 'all') {
                  clear(mantra.id);
                  lastRoundRef.current = 0;
                }
                setConfirmKind(null);
              }}
              style={({ pressed }) => [
                styles.confirmPrimary,
                {
                  backgroundColor: colors.saffron,
                  borderRadius: radii.md,
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text
                style={[
                  styles.confirmPrimaryText,
                  {
                    color: colors.onPrimary,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {confirmKind === 'beads' ? resetBeadsLabel : clearAllLabel}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setConfirmKind(null)}
              style={styles.confirmCancel}
              hitSlop={8}
            >
              <Text
                style={[
                  styles.confirmCancelText,
                  {
                    color: colors.inkMuted,
                    fontFamily: typography.cardLatin.fontFamily,
                  },
                ]}
              >
                {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: {
    width: 44,
    height: 44,
  },
  backGlyph: {
    fontSize: 22,
    lineHeight: 24,
    marginTop: -2,
    includeFontPadding: false,
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  titleHi: {
    includeFontPadding: false,
    textAlign: 'center',
  },
  titleEn: {
    fontStyle: 'italic',
    includeFontPadding: false,
    textAlign: 'center',
    marginTop: 2,
  },
  toggleRow: {
    paddingTop: 4,
    paddingBottom: 8,
    alignItems: 'center',
  },
  tapArea: {
    flex: 1,
  },
  tapAreaPressed: {
    opacity: 0.92,
  },
  tapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 12,
  },
  mantraBlock: {
    alignItems: 'center',
    paddingTop: 8,
  },
  mantraLine: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  mantraLineEn: {
    textAlign: 'center',
    fontStyle: 'italic',
    includeFontPadding: false,
    marginTop: 6,
  },
  countBlock: {
    alignItems: 'center',
    width: '100%',
  },
  countNumber: {
    fontSize: 88,
    lineHeight: 94,
    includeFontPadding: false,
    fontWeight: '600',
  },
  countDenominator: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
    includeFontPadding: false,
  },
  progressTrack: {
    width: '78%',
    height: 6,
    borderRadius: 3,
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  roundsLabel: {
    marginTop: 14,
    fontSize: 16,
    includeFontPadding: false,
  },
  tapHint: {
    marginTop: 18,
    fontStyle: 'italic',
    opacity: 0.8,
    includeFontPadding: false,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    includeFontPadding: false,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    paddingVertical: 22,
    paddingHorizontal: 22,
  },
  confirmTitle: {
    fontSize: 18,
    textAlign: 'center',
    includeFontPadding: false,
  },
  confirmBody: {
    marginTop: 10,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    includeFontPadding: false,
  },
  confirmPrimary: {
    marginTop: 18,
    paddingVertical: 13,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPrimaryText: {
    fontSize: 15,
    includeFontPadding: false,
  },
  confirmCancel: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.85,
  },
});
