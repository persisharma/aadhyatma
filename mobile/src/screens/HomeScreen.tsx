import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { library } from '@/data/texts';
import LibraryCard from '@/components/LibraryCard';
import Crest from '@/components/Crest';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();

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
                  color: colors.inkMuted,
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
            LIBRARY
          </Text>

          <View style={[styles.library, { gap: spacing.md }]}>
            {library.map((entry) => {
              let onPress: (() => void) | undefined;
              if (entry.id === 'hanuman-chalisa') {
                onPress = () => navigation.navigate('ChalisaReader', { initialIndex: 0 });
              } else if (entry.id === 'bhagavad-gita') {
                onPress = () => navigation.navigate('GitaChapters');
              } else if (entry.id === 'sundarkand') {
                onPress = () => navigation.navigate('SundarkandReader', { initialIndex: 0 });
              }
              return <LibraryCard key={entry.id} entry={entry} onPress={onPress} />;
            })}
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
    paddingTop: 12,
  },
  hero: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 20,
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
  library: {
    gap: 12,
  },
  footer: {
    textAlign: 'center',
    opacity: 0.55,
    marginTop: 36,
    includeFontPadding: false,
  },
});
