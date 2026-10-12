import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import YoutubePlayer, { PLAYER_STATES, type YoutubeIframeRef } from 'react-native-youtube-iframe';
import { useTheme } from '@/theme/ThemeContext';
import AppIcon from '@/components/AppIcon';
import { pick } from '@/utils/localize';
import type { Lang } from '@/data/gita/language';
import { claimPlayback, registerStopper } from '@/audio/playbackArbiter';
import { youtubeWatchUrl } from '@/video/videoId';
import type { VideoMapping } from '@/data/video/videoMappings';

/**
 * Docked YouTube fallback player. Renders YouTube's official embed (via
 * react-native-youtube-iframe, which wraps react-native-webview + the IFrame
 * Player API) at the top of a reader while the verses keep scrolling below. It is
 * the ONLY place a video plays — it never routes through background audio, the
 * lock screen, or the audio-only mini-player (RULEBOOK / YouTube embed terms).
 *
 * Why the library (not a hand-rolled WebView): on iOS WKWebView a
 * `loadHTMLString` page gets an opaque origin, so YouTube rejects the embed with
 * error 150/152 even for embeddable videos. react-native-youtube-iframe sets the
 * origin/base-url correctly, which is what makes playback actually work on device.
 * It adds no native module (pure JS over the already-bundled react-native-webview),
 * so it ships via OTA without a new build.
 *
 * Lifecycle contract:
 *  - Mounts only after an explicit "Play video" tap (no autoplay on reader open).
 *  - Claims the playback arbiter on mount, so recorded audio / TTS / japam stop.
 *  - Pauses (never unmounts) when another source claims, when the app leaves the
 *    foreground, and on screen lock; it does NOT auto-resume on return.
 *  - Clears its timers/listeners on unmount.
 */

const LOAD_TIMEOUT_MS = 15000;
// Half-second polling keeps a verse flip within ~0.5s of its cue.
const PROGRESS_POLL_MS = 500;

type Phase = 'loading' | 'ready' | 'error';

export type DockedYouTubePlayerProps = {
  mapping: VideoMapping;
  uiLang: Lang;
  /** Playback position in seconds, for the reader's cue-sheet auto-scroll. Fires ~2×/sec while playing. */
  onProgress?: (seconds: number) => void;
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
  const { width } = useWindowDimensions();
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  // The user tapped "Play video", so autoplay is the intended, gesture-initiated start.
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  // Bump to force-remount the player on retry (the lib has no imperative reload).
  const [reloadKey, setReloadKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 16:9, never below YouTube's 200px minimum embed viewport.
  const playerHeight = Math.max(200, Math.round(width * (9 / 16)));

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pause = useCallback(() => setPlaying(false), []);
  const play = useCallback(() => {
    // Starting playback re-claims exclusivity, mirroring recorded/tts/japam.
    claimPlayback('youtube');
    setPlaying(true);
  }, []);

  // Claim the session as soon as the player opens — the user asked for the video,
  // so any recorded audio / TTS / japam must yield immediately.
  useEffect(() => {
    claimPlayback('youtube');
  }, []);

  // Another source starting silences the video — pause, don't unmount.
  useEffect(() => registerStopper('youtube', pause), [pause]);

  // Leaving the foreground / screen lock pauses playback; never auto-resume.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') pause();
    });
    return () => sub.remove();
  }, [pause]);

  // Fall out of the spinner into the error card if the player never reports ready.
  const armLoadTimeout = useCallback(() => {
    clearLoadTimeout();
    timeoutRef.current = setTimeout(() => {
      setPhase((p) => (p === 'loading' ? 'error' : p));
    }, LOAD_TIMEOUT_MS);
  }, [clearLoadTimeout]);

  useEffect(() => {
    armLoadTimeout();
    return clearLoadTimeout;
  }, [armLoadTimeout, clearLoadTimeout]);

  const onReady = useCallback(() => {
    clearLoadTimeout();
    setPhase('ready');
  }, [clearLoadTimeout]);

  const onError = useCallback(() => {
    clearLoadTimeout();
    setPhase('error');
  }, [clearLoadTimeout]);

  const onChangeState = useCallback((state: PLAYER_STATES) => {
    if (state === PLAYER_STATES.PLAYING) {
      setPhase('ready');
      setPlaying(true);
    } else if (state === PLAYER_STATES.PAUSED || state === PLAYER_STATES.ENDED) {
      setPlaying(false);
    }
  }, []);

  // Report progress for the reader's auto-scroll while actually playing.
  useEffect(() => {
    if (phase !== 'ready' || !playing) return undefined;
    const id = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      Promise.all([p.getCurrentTime(), p.getDuration()])
        .then(([t, d]) => {
          const cur = Number.isFinite(t) ? t : 0;
          const dur = Number.isFinite(d) ? d : 0;
          setElapsed(cur);
          setDuration(dur);
          onProgress?.(cur);
        })
        .catch(() => undefined);
    }, PROGRESS_POLL_MS);
    return () => clearInterval(id);
  }, [phase, playing, onProgress]);

  const retry = useCallback(() => {
    setPhase('loading');
    setPlaying(true);
    setReloadKey((k) => k + 1);
    armLoadTimeout();
  }, [armLoadTimeout]);

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
      <View style={[styles.stage, { height: playerHeight }]}>
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
            <YoutubePlayer
              key={reloadKey}
              ref={playerRef}
              height={playerHeight}
              play={playing}
              videoId={mapping.videoId}
              onReady={onReady}
              onError={onError}
              onChangeState={onChangeState}
              forceAndroidAutoplay
              initialPlayerParams={{ rel: false, controls: true }}
              webViewProps={{
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
              }}
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
            onPress={() => (playing ? pause() : play())}
            accessibilityRole="button"
            accessibilityLabel={
              playing
                ? pick(uiLang, { hi: 'रोकें', en: 'Pause', gu: 'થોભો', kn: 'ವಿರಾಮ' })
                : pick(uiLang, { hi: 'चलाएँ', en: 'Play', gu: 'ચલાવો', kn: 'ಪ್ಲೇ' })
            }
            hitSlop={8}
            style={[styles.ppBtn, { backgroundColor: colors.saffron }]}
          >
            <AppIcon name={playing ? 'pause' : 'play'} size={13} weight="fill" color="#fff" />
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
  stage: { width: '100%', backgroundColor: '#000' },
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
