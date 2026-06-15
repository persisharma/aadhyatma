import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import LanguageToggle from '@/components/LanguageToggle';
import { getKathaContent } from '@/panchang/kathaContent';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'VratKathaReader'>;

export default function VratKathaReaderScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { lang } = useGitaLanguage();
  const isHindi = lang === 'hi';
  const katha = getKathaContent(route.params.kathaId);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.parchmentHighlight, colors.parchmentGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.back}
          >
            <Text style={{ fontSize: 28, lineHeight: 28, color: colors.saffronDeep }}>‹</Text>
          </Pressable>
          <Text
            numberOfLines={1}
            style={[styles.headerTitle, { color: colors.ink, fontFamily: typography.readerTitle.fontFamily }]}
          >
            {katha ? (isHindi ? katha.titleHi : katha.titleEn) : (isHindi ? 'कथा' : 'Katha')}
          </Text>
          <LanguageToggle />
        </View>

        {!katha ? (
          <View style={styles.empty}>
            <Text style={{ color: colors.inkMuted, fontFamily: typography.meaning.fontFamily, fontSize: 14 }}>
              {isHindi ? 'यह कथा अभी उपलब्ध नहीं है।' : 'This katha is not available yet.'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.xxl }]}
            showsVerticalScrollIndicator={false}
          >
            {katha.sections.map((section) => {
              const body = isHindi ? section.bodyHi : section.bodyEn;
              return (
                <View key={section.id} style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.saffronDeep }]}>
                    {isHindi ? section.titleHi : section.titleEn}
                  </Text>
                  {body.map((paragraph, index) => (
                    <Text
                      key={index}
                      style={[styles.para, { color: colors.ink, fontFamily: typography.meaning.fontFamily }]}
                    >
                      {paragraph}
                    </Text>
                  ))}
                </View>
              );
            })}
            <Text style={[styles.source, { color: colors.inkMuted }]}>
              {isHindi ? katha.sourceNoteHi : katha.sourceNoteEn}
            </Text>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  back: { width: 30, alignItems: 'flex-start' },
  headerTitle: { flex: 1, fontSize: 18 },
  scroll: { paddingTop: 6, paddingBottom: 36 },
  section: { marginBottom: 22 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, marginBottom: 10 },
  para: { fontSize: 16, lineHeight: 27, marginBottom: 12 },
  source: { fontSize: 11, lineHeight: 16, marginTop: 4, fontStyle: 'italic' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
