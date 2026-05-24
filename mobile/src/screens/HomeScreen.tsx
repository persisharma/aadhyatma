import React from 'react';
import {
  Dimensions,
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
import Crest from '@/components/Crest';
import SearchFloatingButton from '@/components/SearchFloatingButton';
import UpdateBanner from '@/components/UpdateBanner';
import type { HomeStackParamList } from '@/navigation/types';
import type { ContentCategory } from '@/data/texts';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();

  const categoryIcons: Record<CategoryIconKey, React.ReactNode> = {
    granth: <CategoryIcon iconKey="granth" />,
    stotram: <CategoryIcon iconKey="stotram" />,
    chalisa: <CategoryIcon iconKey="chalisa" />,
    japam: <CategoryIcon iconKey="japam" />,
    deity: <CategoryIcon iconKey="deity" />,
    aarti: <CategoryIcon iconKey="aarti" />,
  };

  type TileItem = {
    key: string;
    nameHi: string;
    nameEn: string;
    status: 'active';
    icon?: React.ReactNode;
    onPress: () => void;
  };

  const tiles: TileItem[] = [
    ...categories.map((c) => ({
      key: c.id,
      nameHi: c.nameHi,
      nameEn: c.nameEn,
      status: 'active' as const,
      icon: categoryIcons[c.id],
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
          <UpdateBanner />
          <View style={styles.hero}>
            <Crest />
            <Text
              style={[
                styles.title,
                {
                  color: colors.ink,
                  fontFamily: typography.screenTitle.fontFamily,
                  fontSize: typography.screenTitle.fontSize,
                  letterSpacing: typography.screenTitle.letterSpacing,
                },
              ]}
            >
              वेदांश़
            </Text>
            <Text
              style={[
                styles.subtitle,
                {
                  color: colors.inkSoft,
                  fontFamily: typography.subtitle.fontFamily,
                  fontSize: typography.subtitle.fontSize,
                  letterSpacing: typography.subtitle.letterSpacing,
                },
              ]}
            >
              Sacred Texts · Daily Reading
            </Text>
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
        </ScrollView>
      </SafeAreaView>

      <SearchFloatingButton onPress={() => navigation.navigate('Search')} />
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
  title: {
    textAlign: 'center',
    includeFontPadding: false,
  },
  subtitle: {
    marginTop: 6,
    fontStyle: 'italic',
    includeFontPadding: false,
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
