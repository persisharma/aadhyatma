import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { library } from '@/data/texts';
import { deities } from '@/data/deities';
import { getRandomDeityBackground } from '@/data/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import DeityCard from '@/components/DeityCard';
import { useNewContent } from '@/contexts/NewContentContext';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'DeityIndex'>;

export default function DeityIndexScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const { isNew } = useNewContent();
  // The index isn't tied to one deity, so it wears a random deity backdrop —
  // stable while open (useMemo []), fresh on each visit. Matches the image
  // backgrounds every other listing screen carries (see CategoryListScreen).
  const backgroundImage = useMemo(() => getRandomDeityBackground(), []);
  const title = orderTitlesByLanguage(lang, 'देवता', 'By Deity', {
    devPrimary: 16,
    devSecondary: 13,
    latPrimary: 16,
    latSecondary: 13,
  });

  const deityTexts = (deityId: string) =>
    library.filter(
      (e) => !e.hidden && e.status === 'active' && e.deities.includes(deityId as any)
    );

  const getItemCount = (deityId: string): string => {
    const count = deityTexts(deityId).length;
    if (count === 0) return '';
    return `${count} text${count > 1 ? 's' : ''}`;
  };

  // A deity is NEW when any of its texts is still unacknowledged — mirrors the
  // per-text NEW chip its DeityList subsection already shows via LibraryCard.
  const deityHasNew = (deityId: string): boolean =>
    deityTexts(deityId).some((e) => isNew(e.id));

  return (
    <View style={styles.root}>
      <BackgroundLayer source={backgroundImage} />
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
                fontFamily: title.primary.fontFamily,
                fontSize: title.primary.fontSize,
                fontStyle: title.primary.fontStyle,
                color: colors.ink,
              }}
            >
              {title.primary.text}
            </Text>
            <Text
              style={{
                fontFamily: title.secondary.fontFamily,
                fontSize: title.secondary.fontSize,
                fontStyle: title.secondary.fontStyle,
                color: colors.inkMuted,
                marginLeft: 6,
              }}
            >
              · {title.secondary.text}
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
              hasNew={deityHasNew(deity.id)}
              onPress={() => navigation.navigate('DeityDetail', { deityId: deity.id })}
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
