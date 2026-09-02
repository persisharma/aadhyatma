import React, { useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { purposes } from '@/data/purposes';
import { getRandomDeityBackground } from '@/data/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import CategoryCard from '@/components/CategoryCard';
import CategoryIcon from '@/components/CategoryIcon';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BrowseByPurpose'>;

export default function BrowseByPurposeScreen({ navigation }: Props) {
  const { colors, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const backgroundImage = useMemo(() => getRandomDeityBackground(), []);
  const title = orderTitlesByLanguage(lang, 'उद्देश्य', 'By Purpose', {
    devPrimary: 16,
    devSecondary: 13,
    latPrimary: 16,
    latSecondary: 13,
  });
  const screenWidth = Dimensions.get('window').width;
  const gridGap = 10;
  const tileWidth = (screenWidth - 2 * spacing.xxl - 2 * gridGap) / 3;

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
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl, gap: gridGap }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.grid, { gap: gridGap }]}>
            {purposes.map((purpose) => (
              <View key={purpose.id} style={{ width: tileWidth }}>
                <CategoryCard
                  nameHi={purpose.nameHi}
                  nameEn={purpose.nameEn}
                  displayNameEn={purpose.shortNameEn}
                  status="active"
                  icon={<CategoryIcon iconKey={purpose.iconKey} />}
                  onPress={() => navigation.navigate('PurposeList', { purposeId: purpose.id })}
                  variant="launcher"
                />
              </View>
            ))}
          </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
