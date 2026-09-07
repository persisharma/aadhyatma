import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation, type NavigationProp } from '@react-navigation/native';

import { moreTabTarget } from '@/navigation/entryRoutes';
import type { TabParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeContext';
import { useTourTarget } from '@/components/tour/tourTargets';

/**
 * अन्य, as a header control (design.md §17).
 *
 * अन्य used to be the fifth bottom tab. The bar now carries
 * होम · भक्ति · पंचांग · व्रत · ज्योतिष, so the hub it opened — settings,
 * language, notifications, japam alarms, wishlist, profile, widgets, पितृ
 * स्मरण, कुल परम्परा — moved to this icon at the top-right of every tab root.
 *
 * Only the tab BUTTON went away: `MoreTab` and its whole stack are still
 * registered and mounted lazily exactly as before, so every existing
 * `navigate('MoreTab', moreTabTarget(...))` caller and every notification deep
 * link into that stack keeps working untouched.
 *
 * It is deliberately one flat control and not a menu of its own: the handover's
 * §6 criterion is that a tab root shows exactly ONE row of chrome, so this sits
 * beside the segment control / screen title rather than adding a second row.
 */
export default function AppHeaderMenuButton() {
  const { colors, radii } = useTheme();
  const navigation = useNavigation<NavigationProp<TabParamList>>();
  // Feature-tour spotlight anchor (design.md §47). अन्य no longer has a bar slot
  // for the tour's ring-the-tab fallback to point at, so its step rings this
  // measured icon instead.
  const menuRef = useTourTarget('headerMenu');

  return (
    <Pressable
      ref={menuRef}
      collapsable={false}
      onPress={() => navigation.navigate('MoreTab', moreTabTarget('MoreHome'))}
      accessibilityRole="button"
      // English label, like the rest of the chrome's a11y strings, so the
      // Maestro flows match it in any reading language.
      accessibilityLabel="More"
      testID="header-menu"
      hitSlop={8}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: colors.divider,
          backgroundColor: colors.parchmentSoft,
          borderRadius: radii.pill,
        },
        pressed && { opacity: 0.6 },
      ]}
    >
      {/* A drawn menu-2 glyph rather than a text character: the bar widths stay
          exact at any OS font scale, which a glyph in a scaled Text would not. */}
      <View style={[styles.bar, { backgroundColor: colors.inkSoft }]} />
      <View style={[styles.bar, styles.barShort, { backgroundColor: colors.inkSoft }]} />
      <View style={[styles.bar, { backgroundColor: colors.inkSoft }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    // 36 pt visual with hitSlop 8 clears the 44 pt touch floor without making
    // the chrome row taller than the segment control beside it.
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bar: {
    width: 15,
    height: 1.5,
    borderRadius: 1,
  },
  barShort: {
    width: 10,
    alignSelf: 'flex-start',
    marginLeft: 10.5,
  },
});
