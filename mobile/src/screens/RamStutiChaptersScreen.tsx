import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { ramStutiChaptersManifest, ramStutiTitleHi, ramStutiTitleEn } from '@/data/ram-stuti';
import { useGitaLanguage } from '@/data/gita/language';
import { getSourceBackground } from '@/data/backgrounds';
import BackgroundLayer from '@/components/BackgroundLayer';
import LanguageToggle from '@/components/LanguageToggle';
import GitaChapterCard from '@/components/GitaChapterCard';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'RamStutiChapters'>;

export default function RamStutiChaptersScreen({ navigation }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();

  const title = lang === 'hi' ? ramStutiTitleHi : ramStutiTitleEn;
  const titleFontFamily =
    lang === 'hi' ? typography.readerTitle.fontFamily : typography.cardLatin.fontFamily;
  const titleFontSize = lang === 'hi' ? 22 : 20;
  const titleItalic = lang === 'en';

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <BackgroundLayer source={getSourceBackground('ram-stuti')} />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={16}
            style={({ pressed }) => [
              styles.back,
              { backgroundColor: colors.parchmentSoft, borderColor: colors.divider },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.backGlyph, { color: colors.inkSoft }]}>‹</Text>
          </Pressable>
          <Text
            style={[styles.title, { color: colors.ink, fontFamily: titleFontFamily, fontSize: titleFontSize, fontStyle: titleItalic ? 'italic' : 'normal' }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <View style={styles.backSpacer} />
        </View>

        <View style={styles.toggleRow}>
          <LanguageToggle />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.screenGutter, gap: spacing.md }]}
          showsVerticalScrollIndicator={false}
        >
          {ramStutiChaptersManifest.map((chapter) => (
            <GitaChapterCard
              key={chapter.chapter}
              chapter={chapter}
              onPress={() => navigation.navigate('RamStutiReader', { chapter: chapter.chapter })}
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
  topBar: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  backSpacer: { width: 44, height: 44 },
  backGlyph: { fontSize: 22, lineHeight: 24, marginTop: -2, includeFontPadding: false },
  title: { flex: 1, textAlign: 'center', includeFontPadding: false },
  toggleRow: { paddingVertical: 8, paddingBottom: 16, alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
});
