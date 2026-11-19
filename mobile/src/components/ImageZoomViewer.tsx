import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import type { ArtworkImage } from '@/data/artworkAsset';
import { contentByLang } from '@/utils/localize';
import { isLatinLang, meaningToken, titleFontByLang } from '@/utils/langType';
import { useReducedMotion } from '@/utils/useReducedMotion';
import {
  DOUBLE_TAP_ZOOM, MAX_ZOOM, MIN_ZOOM, RESTING_ZOOM, clampZoom, fitSize, stepZoom, zoomAbout, zoomLabel,
  type Point, type Size, type ZoomState,
} from '@/utils/imageZoom';
import AppIcon, { type AppIconName } from './AppIcon';
import CachedArtwork from './CachedArtwork';

const DOUBLE_TAP_MS = 280;
const TAP_SLOP = 8;

type Props = {
  visible: boolean;
  onClose: () => void;
  source: ArtworkImage;
  /** Width ÷ height of the picture; the frame, not the source pixels, owns layout. */
  aspectRatio?: number;
  /** Already localized. */
  title: string;
  /** Already localized; also read to screen readers as the picture's description. */
  caption?: string;
};

/**
 * The app's one full-screen picture viewer (design.md §93): pinch, drag,
 * double-tap, and − / + buttons so zoom never depends on a gesture.
 * Plain `PanResponder` + `Animated`, so it needs no extra native module and
 * works inside a `Modal` on both platforms.
 */
export default function ImageZoomViewer({ visible, onClose, source, aspectRatio = 1.5, title, caption }: Props) {
  const { colors, typography } = useTheme();
  const { lang } = useGitaLanguage();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const t = (hi: string, en: string) => contentByLang(lang, hi, en);

  const [view, setView] = useState<Size>({ width: 0, height: 0 });
  const [level, setLevel] = useState(MIN_ZOOM);
  const fit = fitSize(view, aspectRatio);

  const scale = useRef(new Animated.Value(1)).current;
  const offsetX = useRef(new Animated.Value(0)).current;
  const offsetY = useRef(new Animated.Value(0)).current;
  // The gesture reads live geometry through refs: one responder outlives many renders.
  const state = useRef<ZoomState>(RESTING_ZOOM);
  const geometry = useRef({ fit, view, origin: { x: 0, y: 0 }, reduceMotion });
  geometry.current.fit = fit;
  geometry.current.view = view;
  geometry.current.reduceMotion = reduceMotion;
  const viewport = useRef<View>(null);

  const apply = useRef((next: ZoomState, animated = false) => {
    state.current = next;
    if (animated && !geometry.current.reduceMotion) {
      Animated.parallel([
        Animated.timing(scale, { toValue: next.scale, duration: 180, useNativeDriver: true }),
        Animated.timing(offsetX, { toValue: next.x, duration: 180, useNativeDriver: true }),
        Animated.timing(offsetY, { toValue: next.y, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(next.scale);
      offsetX.setValue(next.x);
      offsetY.setValue(next.y);
    }
  }).current;
  const settle = (next: ZoomState) => { apply(next, true); setLevel(next.scale); };

  // Every opening starts at the whole picture.
  useEffect(() => {
    if (visible) { apply(RESTING_ZOOM); setLevel(MIN_ZOOM); }
  }, [visible, apply]);
  // A rotated or resized viewport must not strand the picture off-screen.
  useEffect(() => {
    if (view.width) apply(clampZoom(state.current, fit, view));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.width, view.height]);

  const responder = useMemo(() => {
    let start: ZoomState = RESTING_ZOOM;
    let pinch: { distance: number; focal: Point } | null = null;
    let panBase: Point = { x: 0, y: 0 };
    let lastTap = 0;
    const fromCentre = (pageX: number, pageY: number): Point => {
      const { origin, view: box } = geometry.current;
      return { x: pageX - origin.x - box.width / 2, y: pageY - origin.y - box.height / 2 };
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { start = state.current; pinch = null; panBase = { x: 0, y: 0 }; },
      onPanResponderMove: (event: GestureResponderEvent, gesture) => {
        const { fit: picture, view: box } = geometry.current;
        const touches = event.nativeEvent.touches;
        if (touches.length >= 2) {
          const [a, b] = touches;
          const distance = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
          if (!pinch) {
            if (distance <= 0) return;
            start = state.current;
            pinch = { distance, focal: fromCentre((a.pageX + b.pageX) / 2, (a.pageY + b.pageY) / 2) };
            return;
          }
          apply(zoomAbout(start, start.scale * (distance / pinch.distance), pinch.focal, picture, box));
          return;
        }
        if (pinch) {
          // One finger lifted: carry on as a drag from where the pinch left the picture.
          pinch = null;
          start = state.current;
          panBase = { x: gesture.dx, y: gesture.dy };
        }
        apply(clampZoom({ scale: start.scale, x: start.x + gesture.dx - panBase.x, y: start.y + gesture.dy - panBase.y }, picture, box));
      },
      onPanResponderRelease: (event: GestureResponderEvent, gesture) => {
        const { fit: picture, view: box } = geometry.current;
        const wasTap = !pinch && Math.abs(gesture.dx) < TAP_SLOP && Math.abs(gesture.dy) < TAP_SLOP;
        pinch = null;
        if (wasTap) {
          const now = Date.now();
          if (now - lastTap < DOUBLE_TAP_MS) {
            lastTap = 0;
            const focal = fromCentre(event.nativeEvent.pageX, event.nativeEvent.pageY);
            const next = state.current.scale > MIN_ZOOM + 0.01
              ? RESTING_ZOOM
              : zoomAbout(state.current, DOUBLE_TAP_ZOOM, focal, picture, box);
            apply(next, true);
            setLevel(next.scale);
            return;
          }
          lastTap = now;
        }
        setLevel(state.current.scale);
      },
      onPanResponderTerminate: () => { pinch = null; setLevel(state.current.scale); },
    });
  }, [apply]);

  const step = (direction: 1 | -1) =>
    settle(zoomAbout(state.current, stepZoom(state.current.scale, direction), { x: 0, y: 0 }, fit, view));

  const glass = { backgroundColor: colors.nightGlass, borderColor: colors.nightGlassBorder };
  const body = meaningToken(lang, typography).fontFamily;
  const round = (testID: string, icon: AppIconName, label: string, onPress: () => void, disabled = false) => (
    <Pressable testID={testID} onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      accessibilityState={{ disabled }} style={({ pressed }) => [styles.target, (pressed || disabled) && { opacity: disabled ? 0.4 : 0.7 }]}>
      <View style={[styles.round, glass]}><AppIcon name={icon} size={20} color={colors.nightInk} /></View>
    </Pressable>
  );

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent supportedOrientations={['portrait']}>
      <View testID="image-viewer" style={[styles.root, { backgroundColor: colors.skyNightTop, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.bar}>
          {round('image-viewer-close', 'close', t('चित्र बन्द करें', 'Close picture'), onClose)}
          <Text accessibilityRole="header" maxFontSizeMultiplier={1.25} style={[styles.title, {
            color: colors.nightInk, fontFamily: titleFontByLang(lang), fontSize: typography.readerTitle.fontSize,
            fontStyle: isLatinLang(lang) ? 'italic' : 'normal',
          }]}>{title}</Text>
          <Text testID="image-viewer-zoom-level" accessibilityLabel={`${t('ज़ूम', 'Zoom')} ${zoomLabel(level)}`} accessibilityLiveRegion="polite"
            style={[styles.level, { color: colors.nightInkSoft, fontFamily: typography.pageCounter.fontFamily, fontSize: typography.pageCounter.fontSize }]}>
            {zoomLabel(level)}
          </Text>
        </View>

        <View ref={viewport} testID="image-viewer-stage" style={styles.stage} accessible accessibilityRole="image"
          accessibilityLabel={caption ?? title}
          onLayout={event => {
            const { width, height } = event.nativeEvent.layout;
            setView(previous => previous.width === width && previous.height === height ? previous : { width, height });
            viewport.current?.measureInWindow((x, y) => { geometry.current.origin = { x, y }; });
          }}
          {...responder.panHandlers}>
          {fit.width > 0 && (
            <Animated.View testID="image-viewer-picture" style={{
              width: fit.width, height: fit.height, overflow: 'hidden',
              transform: [{ translateX: offsetX }, { translateY: offsetY }, { scale }],
            }}>
              <CachedArtwork source={source} style={styles.fill} resizeMode="cover" />
            </Animated.View>
          )}
        </View>

        <View style={styles.footer}>
          {caption ? <Text style={{ color: colors.nightInkSoft, fontFamily: body, textAlign: 'center', ...typography.listingScope }}>{caption}</Text> : null}
          <View style={styles.controls}>
            {round('image-viewer-zoom-out', 'minus', t('चित्र छोटा करें', 'Zoom out'), () => step(-1), level <= MIN_ZOOM + 0.01)}
            <Text style={[styles.hint, { color: colors.nightInkMuted, fontFamily: body, ...(isLatinLang(lang) ? typography.listingBodyLatin : typography.listingBody) }]}>
              {t('चुटकी या दो बार टैप से बड़ा करें', 'Pinch or double-tap to zoom')}
            </Text>
            {round('image-viewer-zoom-in', 'plus', t('चित्र बड़ा करें', 'Zoom in'), () => step(1), level >= MAX_ZOOM - 0.01)}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { flex: 1, minWidth: 0, textAlign: 'center' },
  level: { minWidth: 48, textAlign: 'right', fontStyle: 'italic' },
  stage: { flex: 1, minHeight: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  footer: { alignItems: 'center', gap: 12, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 14 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  hint: { flexShrink: 1, minWidth: 0, textAlign: 'center' },
  target: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
