import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { orderTitlesByLanguage } from '@/utils/titleByLanguage';
import type { DeityIconKey } from '@/data/deities';
import DeityIcon from './DeityIcon';
import ListCard, { CARD_TITLE_SIZES, CardThumb, CardTitles } from './ListCard';

type Props = {
  nameHi: string;
  nameEn: string;
  nameGu?: string;
  nameKn?: string;
  /** Count for the accessibility label ("3 texts") — English by the e2e contract. */
  itemCount: string;
  /** The visible count in the reading language; defaults to `itemCount`. */
  meta?: string;
  iconKey?: DeityIconKey;
  onPress?: () => void;
  testID?: string;
  /** When true, shows a "NEW" badge top-right (deity has unseen content). */
  hasNew?: boolean;
};

/**
 * A deity browse row as the shared compact `ListCard` (design.md §8): painted
 * deity thumb, bilingual name, count meta.
 */
export default function DeityCard({ nameHi, nameEn, nameGu, nameKn, itemCount, meta, iconKey, onPress, testID, hasNew }: Props) {
  const { colors, radii } = useTheme();
  const { lang } = useGitaLanguage();

  const ordered = orderTitlesByLanguage(lang, nameHi, nameEn, CARD_TITLE_SIZES);
  // Story catalog names have editorially authored regional spellings. Keep the
  // shared title hierarchy, but use those spellings instead of transliteration.
  const primary = { ...ordered.primary, text: lang === 'gu' ? nameGu ?? ordered.primary.text : lang === 'kn' ? nameKn ?? ordered.primary.text : ordered.primary.text };

  return (
    <ListCard
      size="compact"
      testID={testID}
      onPress={onPress}
      accessibilityLabel={`${nameEn}. ${itemCount}.${hasNew ? ' New.' : ''}`}
      // Deity lists space their cards with the container's `gap`.
      style={styles.inList}
      leading={<CardThumb><DeityIcon iconKey={iconKey} /></CardThumb>}
      overlay={hasNew ? (
        <View
          style={[styles.badge, { backgroundColor: colors.newBadgeBg, borderRadius: radii.pill }]}
          pointerEvents="none"
        >
          <Text style={[styles.badgeText, { color: colors.newBadgeText, letterSpacing: 1.6 }]}>
            NEW
          </Text>
        </View>
      ) : null}
    >
      <CardTitles primary={primary} secondary={ordered.secondary} meta={meta ?? itemCount} />
    </ListCard>
  );
}

const styles = StyleSheet.create({
  inList: { marginBottom: 0 },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});
