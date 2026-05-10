import React, { useState, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
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
import { helpContent, buildDiscrepancyMailto } from '@/data/help/content';
import CategoryCard from '@/components/CategoryCard';
import CategoryIcon, { type CategoryIconKey } from '@/components/CategoryIcon';
import Crest from '@/components/Crest';
import HelpFloatingButton from '@/components/HelpFloatingButton';
import type { HomeStackParamList } from '@/navigation/types';
import type { ContentCategory } from '@/data/texts';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, spacing, radii } = useTheme();
  const [helpVisible, setHelpVisible] = useState(false);
  const hi = helpContent.hi;
  const en = helpContent.en;

  const openHelp = useCallback(() => setHelpVisible(true), []);
  const closeHelp = useCallback(() => setHelpVisible(false), []);
  const openMailto = useCallback(() => {
    const url = buildDiscrepancyMailto();
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url).catch(() => undefined);
        } else {
          Alert.alert('Email', 'Please email us at incardible.app@gmail.com');
        }
      })
      .catch(() => {
        Alert.alert('Email', 'Please email us at incardible.app@gmail.com');
      });
  }, []);

  // Build tile list: 3 active categories + deity virtual tile + 3 coming-soon
  const activeCategories = categories.filter((c) => c.status === 'active');
  const comingCategories = categories.filter((c) => c.status === 'coming');

  const categoryIcons: Record<CategoryIconKey, React.ReactNode> = {
    granth: <CategoryIcon iconKey="granth" />,
    stotram: <CategoryIcon iconKey="stotram" />,
    chalisa: <CategoryIcon iconKey="chalisa" />,
    japam: <CategoryIcon iconKey="japam" />,
    deity: <CategoryIcon iconKey="deity" />,
    aarti: <CategoryIcon iconKey="aarti" />,
    bhajan: <CategoryIcon iconKey="bhajan" />,
    veda: <CategoryIcon iconKey="veda" />,
  };

  type TileItem = {
    key: string;
    nameHi: string;
    nameEn: string;
    status: 'active' | 'coming';
    icon?: React.ReactNode;
    onPress?: () => void;
  };

  const tiles: TileItem[] = [
    ...activeCategories.map((c) => ({
      key: c.id,
      nameHi: c.nameHi,
      nameEn: c.nameEn,
      status: c.status,
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
    ...comingCategories.map((c) => ({
      key: c.id,
      nameHi: c.nameHi,
      nameEn: c.nameEn,
      status: c.status,
      icon: categoryIcons[c.id],
      onPress: undefined,
    })),
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

      <HelpFloatingButton onPress={openHelp} />

      <Modal
        visible={helpVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeHelp}
      >
        <View style={[styles.modalRoot, { backgroundColor: colors.parchment }]}>
          <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <Text
                accessibilityRole="header"
                accessibilityLabel={`${en.title}. ${hi.title}.`}
                style={[
                  styles.modalTitle,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                    fontSize: 20,
                  },
                ]}
              >
                {en.title} / {hi.title}
              </Text>
              <Pressable
                onPress={closeHelp}
                accessibilityRole="button"
                accessibilityLabel="Close help"
                hitSlop={16}
                style={({ pressed }) => [styles.modalClose, pressed && { opacity: 0.7 }]}
              >
                <Text style={[styles.closeButton, { color: colors.saffron }]}>✕</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.modalScroll,
                { paddingHorizontal: spacing.xxl },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={[
                  styles.modalSectionHeading,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {en.disclaimerHeading}
              </Text>
              {en.disclaimerParagraphs.map((para, i) => (
                <Text
                  key={`en-${i}`}
                  style={[
                    styles.modalPara,
                    {
                      color: colors.inkSoft,
                      fontFamily: typography.meaning.fontFamily,
                      fontSize: 14,
                      lineHeight: 24,
                    },
                  ]}
                >
                  {para}
                </Text>
              ))}

              <View style={[styles.langDivider, { borderBottomColor: colors.divider }]} />

              <Text
                style={[
                  styles.modalSectionHeading,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                  },
                ]}
              >
                {hi.disclaimerHeading}
              </Text>
              {hi.disclaimerParagraphs.map((para, i) => (
                <Text
                  key={`hi-${i}`}
                  style={[
                    styles.modalPara,
                    {
                      color: colors.inkSoft,
                      fontFamily: typography.meaning.fontFamily,
                      fontSize: 14,
                      lineHeight: 24,
                    },
                  ]}
                >
                  {para}
                </Text>
              ))}

              <View style={[styles.langDivider, { borderBottomColor: colors.divider }]} />

              <Text
                accessibilityRole="header"
                accessibilityLabel={`${en.reportHeading}. ${hi.reportHeading}.`}
                style={[
                  styles.modalSectionHeading,
                  {
                    color: colors.ink,
                    fontFamily: typography.readerTitle.fontFamily,
                    marginTop: 8,
                  },
                ]}
              >
                {en.reportHeading} / {hi.reportHeading}
              </Text>
              <Text
                style={[
                  styles.modalPara,
                  {
                    color: colors.inkSoft,
                    fontFamily: typography.meaning.fontFamily,
                    fontSize: 14,
                    lineHeight: 24,
                  },
                ]}
              >
                {en.reportIntro}
              </Text>
              <Text
                style={[
                  styles.modalPara,
                  {
                    color: colors.inkSoft,
                    fontFamily: typography.meaning.fontFamily,
                    fontSize: 14,
                    lineHeight: 24,
                  },
                ]}
              >
                {hi.reportIntro}
              </Text>
              <Pressable
                onPress={openMailto}
                accessibilityRole="button"
                accessibilityLabel={`${en.reportButtonLabel}. ${hi.reportButtonLabel}.`}
                style={[
                  styles.emailButton,
                  {
                    backgroundColor: colors.saffron,
                    borderRadius: radii.md,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.emailButtonText,
                    { fontFamily: typography.readerTitle.fontFamily },
                  ]}
                >
                  {en.reportButtonLabel} / {hi.reportButtonLabel}
                </Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
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
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    includeFontPadding: false,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalClose: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingTop: 24,
    paddingBottom: 48,
  },
  modalSectionHeading: {
    fontSize: 16,
    marginBottom: 12,
    includeFontPadding: false,
  },
  modalPara: {
    marginBottom: 14,
    includeFontPadding: false,
  },
  langDivider: {
    borderBottomWidth: 1,
    marginVertical: 20,
    opacity: 0.5,
  },
  emailButton: {
    marginTop: 16,
    paddingVertical: 14,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
