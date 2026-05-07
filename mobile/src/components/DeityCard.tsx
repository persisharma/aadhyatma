import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeContext';
import type { DeityIconKey } from '@/data/deities';
import DeityIcon from './DeityIcon';

type Props = {
  nameHi: string;
  nameEn: string;
  itemCount: string;
  iconKey?: DeityIconKey;
  onPress?: () => void;
};

export default function DeityCard({ nameHi, nameEn, itemCount, iconKey, onPress }: Props) {
  const { colors, typography, radii } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.md,
          shadowColor: '#3C1E0A',
          shadowOpacity: 0.06,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${nameEn}. ${itemCount}.`}
    >
      <LinearGradient
        colors={[colors.cardThumbActiveFrom, colors.cardThumbActiveTo]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <DeityIcon iconKey={iconKey} fallbackText={nameHi.slice(0, 2)} />
      </LinearGradient>

      <View style={styles.meta}>
        <Text
          style={[
            styles.nameHi,
            {
              color: colors.ink,
              fontFamily: typography.cardHindi.fontFamily,
              fontSize: 16,
            },
          ]}
        >
          {nameHi}
        </Text>
        <Text
          style={[
            styles.nameEn,
            {
              color: colors.inkMuted,
              fontFamily: typography.cardLatin.fontFamily,
              fontSize: 12,
            },
          ]}
        >
          {nameEn}
        </Text>
        <Text
          style={[
            styles.count,
            { color: colors.inkMuted, fontSize: 10 },
          ]}
        >
          {itemCount}
        </Text>
      </View>

      <Text style={[styles.chev, { color: colors.saffron }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  nameHi: {
    marginBottom: 1,
  },
  nameEn: {
    fontStyle: 'italic',
    marginBottom: 3,
  },
  count: {
    opacity: 0.9,
  },
  chev: {
    fontSize: 18,
    marginLeft: 8,
  },
});
