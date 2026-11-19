import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { ArtworkImage } from '@/data/artworkAsset';
import { contentByLang } from '@/utils/localize';
import { isLatinLang, titleFontByLang } from '@/utils/langType';
import AppIcon from './AppIcon';
import ImageZoomViewer from './ImageZoomViewer';

/**
 * Makes a framed picture open in the shared viewer (design.md §93).
 * `children` is the picture as the page already frames it; this adds the whole
 * picture as one tap target and the "expand" chip that says it can be opened.
 */
export default function ZoomableArtwork({ children, source, aspectRatio, title, caption, testID, showLabel = false, onOpen, style }: {
  children: React.ReactNode;
  source: ArtworkImage;
  aspectRatio?: number;
  /** Already localized viewer title. */
  title: string;
  /** Already localized; shown under the picture in the viewer. */
  caption?: string;
  testID?: string;
  /** Spell the action out beside the icon — for pictures whose detail is the lesson. */
  showLabel?: boolean;
  /** Runs before the viewer opens, e.g. to pause hands-free page turning. */
  onOpen?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, radii, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const [open, setOpen] = useState(false);
  const action = contentByLang(lang, 'बड़ा करें', 'Enlarge');
  return (
    <>
      <Pressable testID={testID} accessibilityRole="button"
        accessibilityLabel={`${contentByLang(lang, 'चित्र बड़ा करके देखें', 'View picture larger')}. ${caption ?? title}`}
        onPress={() => { onOpen?.(); setOpen(true); }}
        style={({ pressed }) => [style, pressed && { opacity: 0.86 }]}>
        {children}
        <View pointerEvents="none" style={[styles.chip, showLabel ? styles.chipLabelled : styles.chipIcon,
          { backgroundColor: colors.dayGlassActive, borderColor: colors.divider, borderRadius: radii.pill }]}>
          <AppIcon name="fullscreen" size={showLabel ? 16 : 18} color={colors.iconInk} />
          {showLabel ? <Text maxFontSizeMultiplier={1.25} style={{
            color: colors.iconInk, fontFamily: titleFontByLang(lang),
            ...(isLatinLang(lang) ? typography.listingBodyLatin : typography.listingEyebrow),
          }}>{action}</Text> : null}
        </View>
      </Pressable>
      {open ? <ImageZoomViewer visible onClose={() => setOpen(false)} source={source} aspectRatio={aspectRatio} title={title} caption={caption} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  chip: { position: 'absolute', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  chipIcon: { right: 10, bottom: 10, width: 36, height: 36 },
  chipLabelled: { right: 12, bottom: 12, gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
});
