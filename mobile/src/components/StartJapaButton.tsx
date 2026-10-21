import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppIcon from '@/components/AppIcon';
import { useTheme } from '@/theme/ThemeContext';
import { radii } from '@/theme/spacing';
import { useGitaLanguage } from '@/data/gita/language';
import { isSlokaJapaSource, slokaJapaId } from '@/data/japam';
import { pick } from '@/utils/localize';
import type { RootStackParamList } from '@/navigation/types';

/**
 * "Start as japa" for a stotram reader (design.md §35.1): opens the JapaMala
 * counter on the shloka on screen, chanted like a mantra — one bead per
 * recitation of that shloka. Pinned to the LEFT edge of the language-toggle
 * row, mirroring the read-aloud pill on the right, so the centred toggle +
 * add-to-routine group keeps its room (§56.2). Renders nothing for a source
 * that is not a stotram.
 */
export default function StartJapaButton({
  sourceId,
  chapter = 1,
  verseIndex,
  navigation,
}: {
  sourceId: string;
  /** Omitted by single-chapter readers (the stuti registry). */
  chapter?: number;
  /** The reader's current page in `chapter`; a title card starts its first shloka. */
  verseIndex: number;
  /** The reader's own navigation — both screens live on the Home stack. */
  navigation: Pick<NativeStackNavigationProp<RootStackParamList>, 'navigate'>;
}) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  if (!isSlokaJapaSource(sourceId)) return null;
  return (
    <Pressable
      onPress={() => {
        const mantraId = slokaJapaId(sourceId, chapter, verseIndex);
        if (mantraId) navigation.navigate('JapamCounter', { mantraId });
      }}
      accessibilityRole="button"
      // English and un-localized, like the read-aloud pill: Maestro taps it literally.
      accessibilityLabel="Start as japa"
      hitSlop={10}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: colors.saffronTint, borderColor: colors.cardActiveBorder },
        pressed && { opacity: 0.6 },
      ]}
    >
      <AppIcon name="repeat" size={14} color={colors.saffronDeep} />
      <Text style={[styles.label, { color: colors.saffronDeep }]} numberOfLines={1}>
        {pick(lang, { hi: 'जप', en: 'Japa', gu: 'જપ', kn: 'ಜಪ' })}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  label: { fontSize: 13, includeFontPadding: false },
});
