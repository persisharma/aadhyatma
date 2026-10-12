import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useTheme } from '@/theme/ThemeContext';
import AppIcon from '@/components/AppIcon';
import { pick } from '@/utils/localize';
import type { Lang } from '@/data/gita/language';
import { claimPlayback, registerStopper } from '@/audio/playbackArbiter';
import { buildYouTubePlayerHtml, YT_ORIGIN, type YouTubeBridgeEvent } from '@/video/youtubePlayerHtml';
import { youtubeWatchUrl } from '@/video/videoId';
import type { VideoMapping } from '@/data/video/videoMappings';

/**
 * Docked YouTube fallback player. Renders YouTube's official IFrame player inside a
 * WebView at the top of a reader while the verses keep scrolling below. It is the
 * ONLY place a video plays — it never routes through background audio, the lock
 * screen, or the audio-only mini-player (RULEBOOK / YouTube embed terms).
 *
 * Lifecycle contract:
 *  - Mounts only after an explicit "Play video" tap (no autoplay on reader open).
 *  - Claims the playback arbiter on mount, so recorded audio / TTS / japam stop.
 *  - Pauses (never stops/unmounts) when another source claims, when the app leaves
 *    the foreground, and on screen lock; it does NOT auto-resume on return.
 *  - Tears down the WebView, timers and listeners on unmount.
 */

const LOAD_TIMEOUT_MS = 12000;

type Phase = 'loading' | 'ready' | 'error';

export type DockedYouTubePlayerProps = {
  mapping: VideoMapping;
  uiLang: Lang;
  /** Playback progress 0..1, for the reader's auto-scroll. Fires ~2×/sec while playing. */
  onProgress?: (fraction: number) => void;
  onClose: () => void;
};

function spokenLangLabel(lang: VideoMapping['spokenLang'], uiLang: Lang): string {
  const map: Record<VideoMapping['spokenLang'], { hi: string; en: string; gu: string; kn: string }> = {
    hi: { hi: 'हिन्दी', en: 'Hindi', gu: 'હિન્દી', kn: 'ಹಿಂದಿ' },
    sa: { hi: 'संस्कृत', en: 'Sanskrit', gu: 'સંસ્કૃત', kn: 'ಸಂಸ್ಕೃತ' },
    en: { hi: 'अंग्रेज़ी', en: 'English', gu: 'અંગ્રેજી', kn: 'ಇಂಗ್ಲಿಷ್' },
    gu: { hi: 'गुजराती', en: 'Gujarati', gu: 'ગુજરાતી', kn: 'ಗುಜರಾತಿ' },
    kn: { hi: 'कन्नड़', en: 'Kannada', gu: 'કન્નડ', kn: 'ಕನ್ನಡ' },
  };
  return pick(uiLang, map[lang]);
}

export default function DockedYouTubePlayer({
  mapping,
  uiLang,
  onProgress,
  onClose,
}: DockedYouTubePlayerProps) {
  const { colors } = useTheme();
  const webRef = useRef<WebView>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const html = useMemo(() => buildYouTubePlayerHtml(mapping.videoId, true), [mapping.videoId]);

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    webRef.current?.injectJavaScript('window.__ytPause && window.__ytPause(); true;');
  }, []);
  const play = useCallback(() => {
    // Starting playback re-claims exclusivity, mirroring the recorded/tts/japam sources.
    claimPlayback('youtube');
    webRef.current?.injectJavaScript('window.__ytPlay && window.__ytPlay(); true;');
  }, []);

  // Claim the session as soon as the player opens — the user asked for the video,
  // so any recorded audio / TTS / japam must yield immediately (before load, too).
  useEffect(() => {
    claimPlayback('youtube');
  }, []);

  // Another source (recorded/tts/japam) starting silences the video — pause, don't
  // close, so the user can resume from where they were.
  useEffect(() => registerStopper('youtube', pause), [pause]);

  // Leaving the foreground (home, app switcher) or screen lock pauses playback; we
  // never auto-resume on return (RULEBOOK — no surprise audio).
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') pause();
    });
    return () => sub.remove();
  }, [pause]);

  // If the player never reports ready, fall out of the spinner into the error card
  // instead of hanging forever (offline / blocked network / dead embed).
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setPhase((p) => (p === 'loading' ? 'error' : p));
    }, LOAD_TIMEOUT_MS);
    return clearLoadTimeout;
  }, [clearLoadTimeout]);

  const handleMessage = useCallback(
    (e: WebViewMessageEvent) => {
      let msg: YouTubeBridgeEvent;
      try {
        msg = JSON.parse(e.nativeEvent.data) as YouTubeBridgeEvent;
      } catch {
        return; // ignore anything that isn't our JSON bridge payload
      }
      if (!msg || typeof msg !== 'object' || typeof (msg as { event?: unknown }).event !== 'string') {
        return;
      }
      switch (msg.event) {
        case 'ready':
          clearLoadTimeout();
          setPhase('ready');
          break;
        case 'state':
          setIsPlaying(msg.state === 'playing' || msg.state === 'buffering');
          if (msg.state === 'playing') setPhase('ready');
          break;
        case 'time': {
          const d = Number.isFinite(msg.duration) ? msg.duration : 0;
          const t = Number.isFinite(msg.currentTime) ? msg.currentTime : 0;
          setElapsed(t);
          setDuration(d);
          if (d > 0 && onProgress) onProgress(Math.min(1, Math.max(0, t / d)));
          break;
        }
        case 'error':
          clearLoadTimeout();
          setPhase('error');
          break;
      }
    },
    [clearLoadTimeout, onProgress]
  );

  const retry = useCallback(() => {
    setPhase('loading');
    setIsPlaying(false);
    clearLoadTimeout();
    timeoutRef.current = setTimeout(() => {
      setPhase((p) => (p === 'loading' ? 'error' : p));
    }, LOAD_TIMEOUT_MS);
    webRef.current?.reload();
  }, [clearLoadTimeout]);

  const openInYouTube = useCallback(() => {
    Linking.openURL(youtubeWatchUrl(mapping.videoId)).catch(() => undefined);
  }, [mapping.videoId]);

  const title = uiLang === 'en' ? mapping.titleEn : mapping.titleHi;
  const openLabel = pick(uiLang, {
    hi: 'YouTube में खोलें',
    en: 'Open in YouTube',
    gu: 'YouTube માં ખોલો',
    kn: 'YouTube ನಲ್ಲಿ ತೆರೆ',
  });

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.stage}>
        {phase === 'error' ? (
          <ErrorCard
            colors={colors}
            uiLang={uiLang}
            onRetry={retry}
            onOpen={openInYouTube}
            openLabel={openLabel}
          />
        ) : (
          <>
            <WebView
              ref={webRef}
              originWhitelist={['*']}
              source={{ html, baseUrl: YT_ORIGIN }}
              onMessage={handleMessage}
              // NOTE: we deliberately do NOT flip to the error card on the WebView's
              // onError / onHttpError. A YouTube embed pulls many subresources and a
              // single benign non-2xx (tracking pixel, 204) would otherwise kill the
              // whole player. A real failure surfaces instead via (a) the load timeout
              // when the frame never reports ready, or (b) the jsapi onError event.
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              allowsFullscreenVideo
              style={styles.web}
              // Keep the WebView transparent-free (black) so letterboxing matches YouTube.
              containerStyle={styles.webContainer}
            />
            {phase === 'loading' && (
              <View style={styles.loadingOverlay} pointerEvents="none">
                <ActivityIndicator color="#fff" />
              </View>
            )}
          </>
        )}
      </View>

      {phase !== 'error' && (
        <View style={[styles.strip, { borderBottomColor: colors.border }]}>
          <Pressable
            onPress={() => (isPlaying ? pause() : play())}
            accessibilityRole="button"
            accessibilityLabel={
              isPlaying
                ? pick(uiLang, { hi: 'रोकें', en: 'Pause', gu: 'થોભો', kn: 'ವಿರಾಮ' })
                : pick(uiLang, { hi: 'चलाएँ', en: 'Play', gu: 'ચલાવો', kn: 'ಪ್ಲೇ' })
            }
            hitSlop={8}
            style={[styles.ppBtn, { backgroundColor: colors.saffron }]}
          >
            <AppIcon name={isPlaying ? 'pause' : 'play'} size={13} weight="fill" color="#fff" />
          </Pressable>
          <Text style={[styles.time, { color: colors.inkMuted }]} numberOfLines={1}>
            {fmt(elapsed)} / {fmt(duration)}
          </Text>
          <View style={styles.stripSpacer} />
          <Pressable
            onPress={openInYouTube}
            accessibilityRole="link"
            accessibilityLabel={openLabel}
            hitSlop={8}
            style={styles.openBtn}
          >
            <Text style={[styles.openArrow, { color: colors.ink }]}>↗</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={pick(uiLang, { hi: 'वीडियो बंद करें', en: 'Close video', gu: 'વિડિઓ બંધ કરો', kn: 'ವೀಡಿಯೊ ಮುಚ್ಚಿ' })}
            hitSlop={8}
            style={styles.closeBtn}
          >
            <AppIcon name="close" size={15} color={colors.inkMuted} />
          </Pressable>
        </View>
      )}

      {phase !== 'error' && (
        <View style={styles.meta}>
          <Text style={[styles.title, { color: colors.ink }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.channel, { color: colors.inkMuted }]} numberOfLines={1}>
            {mapping.channel} · {spokenLangLabel(mapping.spokenLang, uiLang)}
          </Text>
        </View>
      )}
    </View>
  );
}

function ErrorCard({
  colors,
  uiLang,
  onRetry,
  onOpen,
  openLabel,
}: {
  colors: ReturnType<typeof useTheme>['colors'];
  uiLang: Lang;
  onRetry: () => void;
  onOpen: () => void;
  openLabel: string;
}) {
  return (
    <View style={[styles.errCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.errTitle, { color: colors.ink }]}>
        {pick(uiLang, {
          hi: 'यह वीडियो नहीं चल सका',
          en: 'Can’t play this video',
          gu: 'આ વિડિઓ ચલાવી શકાતો નથી',
          kn: 'ಈ ವೀಡಿಯೊ ಪ್ಲೇ ಆಗಲಿಲ್ಲ',
        })}
      </Text>
      <Text style={[styles.errBody, { color: colors.inkMuted }]}>
        {pick(uiLang, {
          hi: 'आप ऑफ़लाइन हैं या वीडियो हटाया/निजी/प्रतिबंधित हो सकता है।',
          en: 'You’re offline, or the video was removed, made private, or can’t be embedded here.',
          gu: 'તમે ઑફલાઇન છો, અથવા વિડિઓ દૂર/ખાનગી/પ્રતિબંધિત હોઈ શકે છે.',
          kn: 'ನೀವು ಆಫ್‌ಲೈನ್ ಆಗಿದ್ದೀರಿ, ಅಥವಾ ವೀಡಿಯೊ ತೆಗೆದು/ಖಾಸಗಿ/ನಿರ್ಬಂಧಿತ ಆಗಿರಬಹುದು.',
        })}
      </Text>
      <Pressable onPress={onRetry} accessibilityRole="button" style={[styles.retryBtn, { backgroundColor: colors.saffron }]}>
        <AppIcon name="reset" size={15} color="#fff" />
        <Text style={styles.retryText}>
          {pick(uiLang, { hi: 'पुनः प्रयास', en: 'Retry', gu: 'ફરી પ્રયાસ', kn: 'ಮರುಪ್ರಯತ್ನ' })}
        </Text>
      </Pressable>
      <Pressable onPress={onOpen} accessibilityRole="link" style={styles.errOpen}>
        <Text style={[styles.errOpenText, { color: colors.saffronDeep }]}>↗ {openLabel}</Text>
      </Pressable>
    </View>
  );
}

function fmt(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  // 16:9, but never below the 200px minimum the embed terms require.
  stage: { width: '100%', aspectRatio: 16 / 9, minHeight: 200, backgroundColor: '#000' },
  web: { flex: 1, backgroundColor: '#000' },
  webContainer: { backgroundColor: '#000' },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  strip: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  ppBtn: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  time: { fontSize: 12, fontStyle: 'italic' },
  stripSpacer: { flex: 1 },
  openBtn: { paddingHorizontal: 2 },
  openArrow: { fontSize: 16, fontWeight: '600' },
  closeBtn: { paddingLeft: 2 },
  meta: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 16 },
  channel: { fontSize: 13, fontStyle: 'italic', marginTop: 2 },
  errCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 20, gap: 10 },
  errTitle: { fontSize: 18, fontWeight: '700' },
  errBody: { fontSize: 14, fontStyle: 'italic', textAlign: 'center', lineHeight: 20 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 12, paddingHorizontal: 22, paddingVertical: 10, marginTop: 4 },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  errOpen: { paddingVertical: 4 },
  errOpenText: { fontSize: 14, fontWeight: '600' },
});
