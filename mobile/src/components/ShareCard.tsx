import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import Ornament from './Ornament';

export type ShareCardProps = {
  sectionNameHi: string;
  sectionNameEn: string;
  verseLabelHi: string;
  verseLabelEn: string;
  linesHi: string[];
  linesEn: string[];
  meaningHi?: string;
  meaningEn?: string;
  lang: 'hi' | 'en';
  width: number;
  height: number;
};

const ShareCard = React.forwardRef<View, ShareCardProps>(function ShareCard(props, ref) {
  const { colors, typography } = useTheme();
  const sectionName = props.lang === 'hi' ? props.sectionNameHi : props.sectionNameEn;
  const verseLabel = props.lang === 'hi' ? props.verseLabelHi : props.verseLabelEn;
  const meaning = props.lang === 'hi' ? props.meaningHi : props.meaningEn;
  const lines = props.lang === 'hi' ? props.linesHi : props.linesEn;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.card,
        {
          width: props.width,
          height: props.height,
          backgroundColor: colors.parchment,
          borderColor: colors.divider,
        },
      ]}
    >
      <View style={styles.headerBand}>
        <Text
          style={[
            styles.headerText,
            {
              color: colors.saffronDeep,
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 13,
            },
          ]}
        >
          {sectionName.toUpperCase()} · {verseLabel.toUpperCase()}
        </Text>
      </View>

      <View style={styles.body}>
        {lines.map((line, i) => (
          <Text
            key={i}
            style={[
              styles.verseLine,
              {
                color: colors.ink,
                fontFamily: typography.verse.fontFamily,
              },
            ]}
          >
            {line}
          </Text>
        ))}
      </View>

      <Ornament />

      {meaning ? (
        <Text
          numberOfLines={5}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
          style={[
            styles.meaning,
            {
              color: colors.inkSoft,
              fontFamily:
                props.lang === 'hi'
                  ? typography.meaning.fontFamily
                  : typography.cardLatin.fontFamily,
            },
          ]}
        >
          {meaning}
        </Text>
      ) : null}

      <View style={[styles.footer, { borderTopColor: colors.divider }]}>
        <Text
          style={[
            styles.wordmarkHi,
            {
              color: colors.ink,
              fontFamily: typography.readerTitle.fontFamily,
            },
          ]}
        >
          वेदांश़
        </Text>
        <Text
          style={[
            styles.wordmarkLatin,
            {
              color: colors.saffronDeep,
              fontFamily: typography.cardLatin.fontFamily,
            },
          ]}
        >
          Vedansh — Sacred Texts, Daily Reading
        </Text>
        <Text
          style={[
            styles.storeLine,
            {
              color: colors.inkMuted,
              fontFamily: typography.cardLatin.fontFamily,
            },
          ]}
        >
          Now available on iOS & Android
        </Text>
      </View>
    </View>
  );
});

export default ShareCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 28,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  headerBand: {
    alignItems: 'center',
    marginBottom: 18,
  },
  headerText: {
    letterSpacing: 2.4,
    includeFontPadding: false,
  },
  body: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  verseLine: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: 'center',
    marginBottom: 2,
    includeFontPadding: false,
  },
  meaning: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
    paddingHorizontal: 12,
    includeFontPadding: false,
  },
  footer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  wordmarkHi: {
    fontSize: 18,
    letterSpacing: 1,
    includeFontPadding: false,
  },
  wordmarkLatin: {
    fontSize: 12,
    letterSpacing: 1.2,
    marginTop: 3,
    fontStyle: 'italic',
    includeFontPadding: false,
  },
  storeLine: {
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
});
