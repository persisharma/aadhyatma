import React from 'react';
import { StyleSheet, TextInput, type StyleProp, type TextInputProps, type TextStyle } from 'react-native';

import { radii } from '@/theme/spacing';
import { useTheme } from '@/theme/ThemeContext';
import { fontFamilies } from '@/theme/typography';

/**
 * The app's single text-input spec (design.md §16).
 *
 * Before this there were three specs for one control class — content-search
 * fields at 44pt in Cormorant 15, Kundali's form inputs at 48pt in Inter 14, and
 * Kundali's modal city search at 46pt — i.e. three heights, two typefaces and
 * two padding values for the same job. The rule now is typographic, and matches
 * how the rest of the system already splits its faces:
 *
 * - `search` — searching *content* (kathas, observances, the catalog). Cormorant
 *   at 15, the same reading face the results are set in, so the query and what
 *   it returns belong to one voice.
 * - `form` — data entry (birth date, time, the city lookup inside that form).
 *   Inter at 14, the UI-chrome face, because the value is data rather than
 *   devotional text. Taller (48) to sit comfortably in a stacked form.
 *
 * Both clear the 44pt touch minimum.
 */
export type TextFieldVariant = 'search' | 'form';

const VARIANTS: Record<TextFieldVariant, TextStyle> = {
  search: {
    height: 44,
    paddingHorizontal: 14,
    fontFamily: fontFamilies.latin,
    fontSize: 15,
  },
  form: {
    height: 48,
    paddingHorizontal: 13,
    fontFamily: fontFamilies.inter,
    fontSize: 14,
  },
};

export default function TextField({
  variant = 'search',
  style,
  ...props
}: Omit<TextInputProps, 'style'> & {
  variant?: TextFieldVariant;
  style?: StyleProp<TextStyle>;
}) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.inkMuted}
      {...props}
      style={[
        styles.base,
        VARIANTS[variant],
        {
          color: colors.ink,
          backgroundColor: colors.parchmentSoft,
          borderColor: colors.divider,
          borderRadius: radii.md,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: { width: '100%', borderWidth: 1 },
});
