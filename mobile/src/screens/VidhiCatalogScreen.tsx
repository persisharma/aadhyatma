import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeContext';
import { elevation } from '@/theme/elevation';
import { spacing } from '@/theme/spacing';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import { VIDHI_ENTRIES, type VidhiEntry } from '@/data/vidhi';
import ReaderHeader from '@/components/ReaderHeader';
import type { PanchangStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<PanchangStackParamList, 'VidhiCatalog'>;

/**
 * पूजा विधियाँ — the vidhi catalog (PRD-19, design.md §61). Each row follows
 * the §8 LibraryCard active-variant spec (cardActive gradient, letter thumb,
 * hi-name / latin-italic / sub-meta, saffron ›) rebuilt from the same tokens:
 * LibraryCard itself is coupled to LibraryEntry + the routine sheet, and a
 * vidhi is a procedure, not a library text.
 */
export default function VidhiCatalogScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();

  return (
    <View style={[styles.root, { backgroundColor: colors.parchment }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ReaderHeader
          variant="index"
          title={contentByLang(lang, 'पूजा विधियाँ', 'Puja Vidhis')}
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing.screenGutter }]}
          showsVerticalScrollIndicator={false}
        >
          {VIDHI_ENTRIES.map((entry) => (
            <VidhiCard
              key={entry.id}
              entry={entry}
              onPress={() => navigation.navigate('VidhiDetail', { vidhiId: entry.id })}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function VidhiCard({ entry, onPress }: { entry: VidhiEntry; onPress: () => void }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const { primary, secondary } = orderTitlesByLanguage(lang, entry.titleHi, entry.titleEn, {
    devPrimary: 17,
    devSecondary: 13,
    latPrimary: 19,
    latSecondary: 12,
  });
  const hasKatha = entry.steps.some((step) => step.ref?.kind === 'katha');
  const sub = contentByLang(
    lang,
    `${entry.steps.length} चरण · लगभग ${entry.durationHintMin} मिनट${hasKatha ? ' · कथा सहित' : ''}`,
    `${entry.steps.length} steps · About ${entry.durationHintMin} min${hasKatha ? ' · with katha' : ''}`
  );

  return (
    <Pressable
      onPress={onPress}
      testID={`vidhi-card-${entry.id}`}
      accessibilityRole="button"
      accessibilityLabel={contentByLang(
        lang,
        `${entry.titleHi}। ${entry.steps.length} चरण। खोलने के लिए टैप करें।`,
        `${entry.titleEn}. ${entry.steps.length} steps. Tap to open.`
      )}
      style={({ pressed }) => [
        styles.card,
        { borderRadius: radii.lg, borderColor: colors.cardActiveBorder },
        elevation.raised,
        pressed && { opacity: 0.85 },
      ]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFillObject, { borderRadius: radii.lg }]}
      />
      <LinearGradient
        colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.thumb, { borderRadius: radii.md }]}
      >
        <Text
          style={{
            color: colors.parchmentSoft,
            fontFamily: typography.thumb.fontFamily,
            fontSize: typography.thumb.fontSize,
          }}
        >
          {entry.titleHi.replace(/^श्री\s*/, '').charAt(0)}
        </Text>
      </LinearGradient>
      <View style={styles.meta}>
        <Text
          style={{
            color: colors.ink,
            fontFamily: primary.fontFamily,
            fontSize: primary.fontSize,
            fontStyle: primary.fontStyle,
            letterSpacing: primary.letterSpacing,
            marginBottom: 2,
          }}
        >
          {primary.text}
        </Text>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: secondary.fontFamily,
            fontSize: secondary.fontSize,
            fontStyle: secondary.fontStyle,
            marginBottom: 6,
          }}
        >
          {secondary.text}
        </Text>
        <Text
          style={{
            color: colors.inkMuted,
            fontFamily: typography.cardMeta.fontFamily,
            fontSize: typography.cardMeta.fontSize,
            letterSpacing: typography.cardMeta.letterSpacing,
          }}
        >
          {sub}
        </Text>
      </View>
      <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingTop: 4, paddingBottom: 32 },
  card: {
    position: 'relative',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flex: 1, minWidth: 0 },
  chev: { fontSize: 26, marginLeft: 4 },
});
