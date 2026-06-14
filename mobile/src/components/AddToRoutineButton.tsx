import React from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutineSheet } from '@/contexts/RoutineSheetContext';

/**
 * Reader top-bar affordance: opens the add-to-routine sheet for the current
 * source, pre-selecting the chapter being read (when provided).
 */
export default function AddToRoutineButton({
  sourceId,
  chapter,
}: {
  sourceId: string;
  chapter?: number;
}) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  const { openAddToRoutine } = useRoutineSheet();
  return (
    <Pressable
      onPress={() => openAddToRoutine(sourceId, chapter)}
      accessibilityRole="button"
      accessibilityLabel={lang === 'hi' ? 'साधना में जोड़ें' : 'Add to routine'}
      hitSlop={12}
    >
      <Text style={{ color: colors.saffron, fontSize: 22, lineHeight: 24 }}>＋</Text>
    </Pressable>
  );
}
