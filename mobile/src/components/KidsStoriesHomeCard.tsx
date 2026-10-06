import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGitaLanguage } from '@/data/gita/language';
import { useTheme } from '@/theme/ThemeContext';
import { pillTextStyle, titleFontByLang } from '@/utils/langType';
import { pick } from '@/utils/localize';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';

const storyLibraryArt = require('../../assets/kids-stories/story-library.webp');

type Props = {
  onPress: () => void;
  onPressIn: () => void;
  onPressOut: () => void;
};

/** A deity-neutral picture-book door to the story library. */
export default function KidsStoriesHomeCard({ onPress, onPressIn, onPressOut }: Props) {
  const { colors, radii, elevation, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const title = pick(lang, {
    hi: 'बच्चों की चित्र-कथाएँ', en: 'Stories for Kids',
    gu: 'બાળકોની ચિત્રવાર્તાઓ', kn: 'ಮಕ್ಕಳ ಚಿತ್ರકಥೆಗಳು',
  });
  const meta = pick(lang, {
    hi: 'कृष्ण · गणेश · हनुमान', en: 'KRISHNA · GANESHA · HANUMAN',
    gu: 'કૃષ્ણ · ગણેશ · હનુમાન', kn: 'ಕೃಷ್ಣ · ಗಣೇಶ · ಹನುಮಾನ್',
  });
  const action = pick(lang, {
    hi: 'पात्र चुनें', en: 'Choose a deity',
    gu: 'દેવતા પસંદ કરો', kn: 'ದೇವರನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  });
  const fontFamily = titleFontByLang(lang);
  const ordered = orderTitlesByLanguage(lang, 'बच्चों की चित्र-कथाएँ', 'Stories for Kids', {
    devPrimary: 18, devSecondary: 12, latPrimary: 21, latSecondary: 12,
  });
  const primary = { ...ordered.primary, text: lang === 'gu' || lang === 'kn' ? title : ordered.primary.text };

  return (
    <Pressable
      testID="home-kids-stories-card"
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${meta}. ${action}.`}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={({ pressed }) => [styles.card, { borderRadius: radii.lg, borderColor: colors.cardActiveBorder, backgroundColor: colors.cardActiveFrom }, elevation.card, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[colors.cardActiveFrom, colors.cardActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radii.lg }]}
      />
      <Image source={storyLibraryArt} resizeMode="cover" accessible={false} style={styles.cover} />
      <View style={styles.content}>
        <Text style={{ ...pillTextStyle(lang, typography.sectionLabel), color: colors.inkMuted, fontSize: lang === 'en' ? 10 : 12 }} numberOfLines={1}>
          {meta}
        </Text>
        <Text style={{ color: colors.ink, fontFamily: primary.fontFamily, fontSize: primary.fontSize, fontStyle: primary.fontStyle, letterSpacing: primary.letterSpacing, lineHeight: 28 }} numberOfLines={2}>
          {primary.text}
        </Text>
        <Text style={{ color: colors.inkMuted, fontFamily: ordered.secondary.fontFamily, fontSize: ordered.secondary.fontSize, fontStyle: ordered.secondary.fontStyle }} numberOfLines={1}>
          {ordered.secondary.text}
        </Text>
        <View style={styles.actionRow}>
          <Text style={{ color: colors.saffronDeep, fontFamily, fontSize: 14 }} numberOfLines={1}>
            {action}
          </Text>
          <Text style={{ color: colors.saffronDeep, fontSize: 21, lineHeight: 22 }} accessible={false}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 138, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 15 },
  pressed: { opacity: 0.88 },
  cover: { width: 100, height: 100, borderRadius: 12 },
  content: { flex: 1, minWidth: 0, alignSelf: 'stretch', justifyContent: 'center', gap: 6 },
  actionRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 5 },
});
