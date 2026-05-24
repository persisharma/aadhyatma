import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { library } from '@/data/texts';
import { deities } from '@/data/deities';
import DeityCard from '@/components/DeityCard';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'DeityIndex'>;

export default function DeityIndexScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();

  const getItemCount = (deityId: string): string => {
    const count = library.filter(
      (e) =>
        !e.hidden &&
        e.status === 'active' &&
        e.deities.includes(deityId as any)
    ).length;
    if (count === 0) return '';
    return `${count} text${count > 1 ? 's' : ''}`;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.topBar, { paddingHorizontal: spacing.xxl }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={{ color: colors.inkSoft, fontSize: 18 }}>‹</Text>
          </Pressable>
          <View style={styles.titleRow}>
            <Text
              style={{
                fontFamily: typography.readerTitle.fontFamily,
                fontSize: 16,
                color: colors.ink,
              }}
            >
              देवता
            </Text>
            <Text
              style={{
                fontFamily: 'CormorantGaramond_400Regular_Italic',
                fontSize: 13,
                color: colors.inkMuted,
                marginLeft: 6,
              }}
            >
              · By Deity
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          {deities.map((deity) => (
            <DeityCard
              key={deity.id}
              nameHi={deity.nameHi}
              nameEn={deity.nameEn}
              itemCount={getItemCount(deity.id)}
              iconKey={deity.iconKey}
              onPress={() => navigation.navigate('DeityList', { deityId: deity.id })}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scroll: {
    paddingTop: 8,
    paddingBottom: 40,
  },
});
