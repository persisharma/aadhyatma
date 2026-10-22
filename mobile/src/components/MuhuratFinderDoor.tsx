import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import ListCard, { CARD_TITLE_SIZES, CardThumb, CardTitles } from './ListCard';
import StoryIcon from './StoryIcon';

/**
 * The Panchang tab's door into the Event Muhurat Finder (PRD-16; design.md
 * §33/§60). Sits between the Daily Muhurat glance card and the anga grid as the
 * shared regular `ListCard` — painted muhurat thumb, bilingual title, meta. It
 * shares the glance card's gradient, so a 16dp gap keeps the two from reading
 * as one card. The only extra is the नया/NEW badge, top-right like every row's.
 */
export default function MuhuratFinderDoor({ onPress }: { onPress: () => void }) {
  const { colors, typography, radii } = useTheme();
  const { lang } = useGitaLanguage();

  return (
    <ListCard
      testID="muhurat-finder-door"
      accessibilityLabel={contentByLang(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat')}
      onPress={onPress}
      style={styles.door}
      leading={
        <CardThumb>
          <StoryIcon name="muhurat" size={40} />
        </CardThumb>
      }
      overlay={
        <View style={[styles.newBadge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]} pointerEvents="none">
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
      }
    >
      <CardTitles
        {...orderTitlesByLanguage(lang, 'शुभ मुहूर्त खोज', 'Find a Muhurat', CARD_TITLE_SIZES)}
        meta={contentByLang(lang, 'गृह प्रवेश · वाहन · नामकरण…', 'Planning something? Griha Pravesh, vehicle, naming…')}
      />
    </ListCard>
  );
}

const styles = StyleSheet.create({
  door: { marginTop: 16 },
  newBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 2 },
});
