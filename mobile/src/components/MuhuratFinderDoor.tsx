import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';

/**
 * The Panchang tab's door into the Event Muhurat Finder (PRD-16; design.md
 * §33/§60). Sits between the Daily Muhurat glance card and the anga grid —
 * the reader of "is now auspicious?" is the user with a date decision to
 * make. One row, additive; the glance card and tiles are untouched.
 */
export default function MuhuratFinderDoor({ onPress }: { onPress: () => void }) {
  const { colors, typography, radii, elevation } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  return (
    <Pressable
      testID="muhurat-finder-door"
      accessibilityRole="button"
      accessibilityLabel={contentByLang(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat')}
      onPress={onPress}
      style={[
        styles.door,
        { borderColor: colors.cardActiveBorder, backgroundColor: colors.cardSurface, borderRadius: radii.md },
        elevation.lifted,
      ]}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontFamily: titleFont, fontSize: 15, color: colors.ink, lineHeight: 24 }}>
            {contentByLang(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat')}
          </Text>
          <View style={[styles.newBadge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.sm }]}>
            <Text
              style={{
                fontFamily: typography.versePill.fontFamily,
                fontSize: typography.versePill.fontSize,
                // Tracking splits the shirorekha — no letterSpacing outside en.
                letterSpacing: lang === 'en' ? 1.2 : 0,
                color: colors.newBadgeText,
                textTransform: 'uppercase',
              }}
            >
              {contentByLang(lang, 'नया', 'New')}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12.5, color: colors.inkMuted, lineHeight: 19 }}>
          {contentByLang(lang, 'गृह प्रवेश · वाहन · नामकरण…', 'Planning something? Griha Pravesh, vehicle, naming…')}
        </Text>
      </View>
      <Text style={{ color: colors.saffron, fontSize: 16 }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  door: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
    marginTop: 12,
  },
  newBadge: { paddingHorizontal: 7, paddingVertical: 2 },
});
