import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { useRoutines } from '@/contexts/RoutineContext';
import { RoutineShell, RoutineButton } from '@/components/RoutineShell';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RoutineList'>;

export default function RoutineListScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { routines } = useRoutines();
  const isHi = lang === 'hi';

  return (
    <RoutineShell
      titleHi="मेरी साधनाएँ"
      titleEn="My Routines"
      onBack={() => navigation.goBack()}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xxl, paddingTop: 8, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {routines.length === 0 && (
          <Text
            style={{
              fontFamily: typography.meaning.fontFamily,
              fontSize: 14,
              color: colors.inkMuted,
              textAlign: 'center',
              marginVertical: 40,
            }}
          >
            {isHi ? 'अभी कोई साधना नहीं' : 'No routines yet'}
          </Text>
        )}

        {routines.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => navigation.navigate('RoutineDetail', { routineId: r.id })}
            accessibilityRole="button"
            style={{
              borderWidth: 1,
              borderColor: colors.divider,
              backgroundColor: colors.parchmentSoft,
              borderRadius: radii.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
            }}
          >
            <View style={styles.cardTop}>
              <Text style={{ fontFamily: typography.cardHindi.fontFamily, fontSize: 16, color: colors.ink, flexShrink: 1 }}>
                {r.nameHi || r.nameEn}
              </Text>
              <View style={{ backgroundColor: colors.saffronTint, borderRadius: radii.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ ...typography.versePill, color: colors.saffronDeep }}>
                  {r.mode === 'weekday' ? (isHi ? 'वार' : 'WEEKDAY') : isHi ? 'दैनिक' : 'DAILY'}
                </Text>
              </View>
            </View>
            <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12, color: colors.inkMuted, marginTop: 4 }}>
              {isHi ? `${r.items.length} वस्तुएँ` : `${r.items.length} items`}
            </Text>
          </Pressable>
        ))}

        <RoutineButton
          label={isHi ? 'नई साधना बनाएँ' : 'New routine'}
          variant="ghost"
          onPress={() => navigation.navigate('RoutineCreate')}
        />
      </ScrollView>
    </RoutineShell>
  );
}

const styles = StyleSheet.create({
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
});
