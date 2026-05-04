import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import type { SundarkandReading } from '@/data/sundarkand';
import { chalisaImages } from '@assets/chalisa';
import Ornament from './Ornament';

type Props = {
  reading: SundarkandReading;
  width: number;
};

export default function SundarkandPage({ reading, width }: Props) {
  const { colors, typography, radii, spacing } = useTheme();
  const bg = chalisaImages[reading.imageKey] ?? chalisaImages.ram_hanuman;
  const pill = `सुंदरकाण्ड · ${reading.number}`;

  const bodyHiStyle = {
    color: colors.inkSoft,
    fontFamily: typography.meaning.fontFamily,
    fontSize: typography.meaning.fontSize,
    lineHeight: typography.meaning.lineHeight,
  } as const;

  const bodyEnStyle = {
    color: colors.ink,
    fontFamily: typography.meaningEnglish.fontFamily,
    fontSize: typography.meaningEnglish.fontSize,
    lineHeight: typography.meaningEnglish.lineHeight,
  } as const;

  const a11yLabel = [
    pill,
    reading.label,
    reading.labelEn,
    ...reading.lines,
    'Hindi meaning',
    reading.meaningHi,
    'English meaning',
    reading.meaningEn,
  ].join('. ');

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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: spacing.screenGutter },
        ]}
        showsVerticalScrollIndicator={false}
        accessible
        accessibilityLabel={a11yLabel}
      >
        <View
          style={[
            styles.pill,
            { backgroundColor: colors.saffronTint, borderRadius: radii.pill },
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

        <Text
          style={[
            styles.readingTitle,
            {
              color: colors.ink,
              fontFamily: typography.readerTitle.fontFamily,
              fontSize: typography.readerTitle.fontSize,
            },
          ]}
        >
          {reading.label}
        </Text>
        <Text
          style={[
            styles.readingSubtitle,
            {
              color: colors.inkMuted,
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: typography.cardLatin.fontSize,
            },
          ]}
        >
          {reading.labelEn}
        </Text>

        <View style={styles.verseBlock}>
          {reading.lines.map((line, idx) => (
            <Text
              key={`line-${idx}`}
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

        <View style={styles.translitBlock}>
          {reading.transliteration.map((line, idx) => (
            <Text
              key={`translit-${idx}`}
              style={[
                styles.translitLine,
                {
                  color: colors.ink,
                  fontFamily: typography.transliteration.fontFamily,
                  fontSize: typography.transliteration.fontSize,
                  lineHeight: typography.transliteration.lineHeight,
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
            styles.sectionLabel,
            {
              color: colors.saffronDeep,
              fontFamily: typography.meaningLabel.fontFamily,
              fontSize: typography.meaningLabel.fontSize,
              letterSpacing: typography.meaningLabel.letterSpacing,
            },
          ]}
        >
          अर्थ
        </Text>
        <Text style={[styles.body, bodyHiStyle]}>{reading.meaningHi}</Text>

        <Ornament />

        <Text
          style={[
            styles.sectionLabel,
            {
              color: colors.saffronDeep,
              fontFamily: typography.meaningLabel.fontFamily,
              fontSize: typography.meaningLabel.fontSize,
              letterSpacing: typography.meaningLabel.letterSpacing,
            },
          ]}
        >
          Meaning
        </Text>
        <Text style={[styles.body, bodyEnStyle]}>{reading.meaningEn}</Text>

        {reading.commentaryHi.length > 0 || reading.commentaryEn.length > 0 ? (
          <>
            <Ornament />
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.saffronDeep,
                  fontFamily: typography.meaningLabel.fontFamily,
                  fontSize: typography.meaningLabel.fontSize,
                  letterSpacing: typography.meaningLabel.letterSpacing,
                },
              ]}
            >
              व्याख्या · Commentary
            </Text>
            <View style={styles.paragraphs}>
              {reading.commentaryHi.map((paragraph, idx) => (
                <Text key={`commentary-hi-${idx}`} style={[styles.body, bodyHiStyle]}>
                  {paragraph}
                </Text>
              ))}
              {reading.commentaryEn.map((paragraph, idx) => (
                <Text key={`commentary-en-${idx}`} style={[styles.body, bodyEnStyle]}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  pillText: {
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  readingTitle: {
    includeFontPadding: false,
    marginBottom: 4,
  },
  readingSubtitle: {
    includeFontPadding: false,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  verseBlock: {
    gap: 4,
  },
  verseLine: {
    includeFontPadding: false,
  },
  translitBlock: {
    marginTop: 14,
    gap: 2,
  },
  translitLine: {
    includeFontPadding: false,
  },
  sectionLabel: {
    textTransform: 'uppercase',
    marginBottom: 12,
    alignSelf: 'center',
    includeFontPadding: false,
  },
  body: {
    includeFontPadding: false,
  },
  paragraphs: {
    gap: 14,
  },
});
