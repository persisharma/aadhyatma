import React, { useMemo } from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import { chalisaImages } from '@assets/chalisa';
import { imageKeyForVerse } from '@/data/verseImages';
import type { Verse } from '@/data/hanumanChalisa';
import Ornament from './Ornament';

type Props = {
  verse: Verse;
  width: number;
};

function pillLabel(verse: Verse, englishLabel: string): string {
  if (verse.type === 'doha' && verse.section === 'opening') {
    const num = verse.number ? ` · ${verse.number}` : '';
    return `दोहा${num} · Opening`;
  }
  if (verse.type === 'doha' && verse.section === 'closing') {
    return `समापन दोहा · Closing`;
  }
  if (verse.number != null) {
    return `चौपाई · ${verse.number}`;
  }
  return englishLabel;
}

export default function VersePage({ verse, width }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const imageKey = useMemo(() => imageKeyForVerse(verse.id), [verse.id]);
  const bg = chalisaImages[imageKey];
  const pill = pillLabel(verse, verse.label);

  const a11yLabel = [pill, ...verse.lines, 'Meaning', verse.meaning].join('. ');

  return (
    <View style={[styles.page, { width, backgroundColor: colors.parchment }]}>
      <ImageBackground source={bg} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={[
            colors.overlayTop,
            colors.overlayUpper,
            colors.overlayLower,
            colors.overlayBottom,
          ]}
          locations={[0, 0.4, 0.85, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View
        style={[styles.content, { paddingHorizontal: spacing.screenGutter }]}
        accessible
        accessibilityLabel={a11yLabel}
      >
        <View
          style={[
            styles.pill,
            {
              backgroundColor: colors.saffronTint,
              borderRadius: radii.pill,
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              {
                color: colors.saffronDeep,
                fontSize: typography.versePill.fontSize,
                fontWeight: typography.versePill.fontWeight,
                letterSpacing: typography.versePill.letterSpacing,
              },
            ]}
          >
            {pill}
          </Text>
        </View>

        <View style={styles.verseBlock}>
          {verse.lines.map((line, idx) => (
            <Text
              key={idx}
              style={[
                styles.verseLine,
                {
                  color: colors.ink,
                  fontFamily: typography.verse.fontFamily,
                  fontSize: typography.verse.fontSize,
                  lineHeight: typography.verse.lineHeight,
                },
              ]}
            >
              {line}
            </Text>
          ))}
        </View>

        <Ornament />

        <Text
          style={[
            styles.meaningLabel,
            {
              color: colors.saffronDeep,
              fontFamily: typography.meaningLabel.fontFamily,
              fontSize: typography.meaningLabel.fontSize,
              letterSpacing: typography.meaningLabel.letterSpacing,
            },
          ]}
        >
          अर्थ · Meaning
        </Text>
        <Text
          style={[
            styles.meaning,
            {
              color: colors.inkSoft,
              fontFamily: typography.meaning.fontFamily,
              fontSize: typography.meaning.fontSize,
              lineHeight: typography.meaning.lineHeight,
            },
          ]}
        >
          {verse.meaning}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 18,
  },
  pillText: {
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  verseBlock: {
    gap: 4,
  },
  verseLine: {
    includeFontPadding: false,
  },
  meaningLabel: {
    textTransform: 'uppercase',
    marginBottom: 10,
    includeFontPadding: false,
  },
  meaning: {
    includeFontPadding: false,
  },
});
