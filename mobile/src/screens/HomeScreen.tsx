import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { categories } from '@/data/categories';
import CategoryCard from '@/components/CategoryCard';
import CategoryIcon, { type CategoryIconKey } from '@/components/CategoryIcon';
import HomeWordmark from '@/components/HomeWordmark';
import SearchFloatingButton from '@/components/SearchFloatingButton';
import RoutineBanner from '@/components/RoutineBanner';
import type { HomeStackParamList } from '@/navigation/types';
import type { ContentCategory } from '@/data/texts';
import { useNewContent } from '@/contexts/NewContentContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { hasNewInCategory, devSimulateUpgrade, devResetNewState } = useNewContent();

  // The docked RoutineBanner (rendered below) sits at `spacing.sm` above the tab
  // bar and stands ~60px tall at most. Lift the search FAB above it so it isn't
  // hidden behind / overlapped by the banner.
  const searchFabBottom = spacing.sm + 60 + spacing.md;

  const categoryIcons: Record<CategoryIconKey, React.ReactNode> = {
    granth: <CategoryIcon iconKey="granth" />,
    stotram: <CategoryIcon iconKey="stotram" />,
    chalisa: <CategoryIcon iconKey="chalisa" />,
    japam: <CategoryIcon iconKey="japam" />,
    deity: <CategoryIcon iconKey="deity" />,
    aarti: <CategoryIcon iconKey="aarti" />,
    theerth: <CategoryIcon iconKey="theerth" />,
    sanskar: <CategoryIcon iconKey="sanskar" />,
  };

  type TileItem = {
    key: string;
    nameHi: string;
    nameEn: string;
    status: 'active';
    icon?: React.ReactNode;
    onPress: () => void;
    hasNew?: boolean;
  };

  const tiles: TileItem[] = [
    ...categories.map((c) => ({
      key: c.id,
      nameHi: c.nameHi,
      nameEn: c.nameEn,
      status: 'active' as const,
      icon: categoryIcons[c.id],
      hasNew: hasNewInCategory(c.id),
      onPress: () => navigation.navigate('CategoryList', { categoryId: c.id as ContentCategory }),
    })),
    {
      key: 'deity',
      nameHi: 'देवता',
      nameEn: 'By Deity',
      status: 'active' as const,
      icon: categoryIcons['deity'],
      onPress: () => navigation.navigate('DeityIndex'),
    },
  ];

  const screenWidth = Dimensions.get('window').width;
  const gridPadding = spacing.xxl;
  const gridGap = 10;
  const tileWidth = (screenWidth - 2 * gridPadding - gridGap) / 2;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingHorizontal: spacing.xxl,
              paddingBottom: spacing.xxl * 3,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <HomeWordmark />
          </View>

          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.inkMuted,
                fontSize: typography.sectionLabel.fontSize,
                fontWeight: typography.sectionLabel.fontWeight,
                letterSpacing: typography.sectionLabel.letterSpacing,
              },
            ]}
          >
            CATEGORIES
          </Text>

          <View style={[styles.grid, { gap: gridGap }]}>
            {tiles.map((tile) => (
              <View key={tile.key} style={{ width: tileWidth }}>
                <CategoryCard
                  nameHi={tile.nameHi}
                  nameEn={tile.nameEn}
                  status={tile.status}
                  icon={tile.icon}
                  onPress={tile.onPress}
                  hasNew={tile.hasNew}
                />
              </View>
            ))}
          </View>

          <Text
            style={[
              styles.footer,
              {
                color: colors.inkMuted,
                fontFamily: typography.footerMantra.fontFamily,
                fontSize: typography.footerMantra.fontSize,
                letterSpacing: typography.footerMantra.letterSpacing,
              },
            ]}
          >
            ॥ श्रीरामचन्द्र चरणौ शरणं प्रपद्ये ॥
          </Text>

          {__DEV__ && (
            <View style={{ marginTop: 24, marginBottom: 160, flexDirection: 'row', gap: 10, alignSelf: 'center' }}>
              <Pressable
                testID="dev-seed-new-content"
                onPress={devSimulateUpgrade}
                accessibilityLabel="DEV simulate update"
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  opacity: 0.6,
                }}
              >
                <Text style={{ color: colors.inkMuted, fontSize: 11 }}>🔧 seed NEW</Text>
              </Pressable>
              <Pressable
                testID="dev-reset-new-content"
                onPress={devResetNewState}
                accessibilityLabel="DEV reset new state"
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: colors.divider,
                  opacity: 0.6,
                }}
              >
                <Text style={{ color: colors.inkMuted, fontSize: 11 }}>🔧 reset</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <SearchFloatingButton
        onPress={() => navigation.navigate('Search')}
        bottomOffset={searchFabBottom}
      />
      <RoutineBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingTop: 4,
  },
  hero: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    textAlign: 'center',
    opacity: 0.55,
    marginTop: 36,
    includeFontPadding: false,
  },
});
