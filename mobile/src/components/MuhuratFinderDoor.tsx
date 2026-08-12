import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { scriptTitleFont } from '@/utils/langType';
import ListCard, { CardThumb } from './ListCard';

/**
 * The Panchang tab's door into the Event Muhurat Finder (PRD-16; design.md
 * §33/§60). Sits between the Daily Muhurat glance card and the anga grid. Uses
 * the shared `ListCard` (the app's gradient list-card treatment — same shell as
 * the नित्य साधना / active-tile cards) so it doesn't invent its own look; the
 * only extra is the नया/NEW badge inline with the title.
 */
export default function MuhuratFinderDoor({ onPress }: { onPress: () => void }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();
  const titleFont = scriptTitleFont(lang, typography.cardHindi.fontFamily);

  return (
    <ListCard
      testID="muhurat-finder-door"
      accessibilityLabel={contentByLang(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat')}
      onPress={onPress}
      style={styles.door}
      leading={
        <CardThumb>
          <Text style={{ fontFamily: titleFont, fontSize: 20, color: colors.parchmentSoft }}>मु</Text>
        </CardThumb>
      }
    >
      <View style={styles.titleRow}>
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
      <Text style={{ fontFamily: typography.cardLatin.fontFamily, fontSize: 12.5, color: colors.inkMuted, lineHeight: 19, marginTop: 2 }}>
        {contentByLang(lang, 'गृह प्रवेश · वाहन · नामकरण…', 'Planning something? Griha Pravesh, vehicle, naming…')}
      </Text>
    </ListCard>
  );
}

const styles = StyleSheet.create({
  door: { marginTop: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newBadge: { paddingHorizontal: 7, paddingVertical: 2 },
});
