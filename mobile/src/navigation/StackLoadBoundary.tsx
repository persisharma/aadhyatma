import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useOptionalGitaLanguage, type Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { fontFamilies } from '@/theme/typography';
import { scriptTitleFont } from '@/utils/langType';

/**
 * Error boundary for the app root and for each tab stack.
 *
 * Without one, a chunk that fails to evaluate rejects the lazy payload (or any
 * screen throws while rendering) and the throw propagates to the root: the whole
 * tree unmounts and the app is a dead screen with no way back — indistinguishable,
 * to the user, from a launch that never finishes. Contained here, the failure costs
 * one tab: the bar stays up, the other tabs still work, and Retry remounts the
 * subtree (a failed lazy screen then re-attempts its import).
 *
 * Home runs the action App registers (`setErrorBoundaryHomeAction`), then remounts
 * the subtree so the failed tab is fresh the next time it is opened.
 */
let homeAction: (() => void) | null = null;

/** App wires navigation-to-Home here; kept out of this file so the fallback stays dependency-light. */
export function setErrorBoundaryHomeAction(action: (() => void) | null) {
  homeAction = action;
}

const retryListeners = new Set<() => void>();

/** Run `fn` whenever any boundary is retried (e.g. to drop a cached `React.lazy` rejection). */
export function onStackRetry(fn: () => void): () => void {
  retryListeners.add(fn);
  return () => retryListeners.delete(fn);
}

export default class StackLoadBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean; attempt: number }
> {
  state = { failed: false, attempt: 0 };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  private remount = () => {
    retryListeners.forEach((fn) => fn());
    this.setState((s) => ({ failed: false, attempt: s.attempt + 1 }));
  };

  render() {
    if (this.state.failed) {
      return (
        <StackLoadFallback
          onRetry={this.remount}
          onHome={() => {
            homeAction?.();
            this.remount();
          }}
        />
      );
    }
    // The key makes Retry a real remount even if React would otherwise reuse the tree.
    return <React.Fragment key={this.state.attempt}>{this.props.children}</React.Fragment>;
  }
}

// The fallback must render even when the thing that broke is a context, so every
// context read is guarded and falls back to fixed values.
const SAFE_COLORS = { parchment: '#FBF5E6', ink: '#2B1D12', saffron: '#C8601A' };

// Hooks may not sit inside try/catch (rules of hooks), so each read is one that
// cannot throw: the language through its non-throwing accessor, the theme through
// a context that always has a default value.
function useSafeLang(): Lang {
  return useOptionalGitaLanguage()?.lang ?? 'hi';
}

function useSafeColors(): { parchment: string; ink: string; saffron: string } {
  const colors = useTheme()?.colors;
  return colors
    ? { parchment: colors.parchment, ink: colors.ink, saffron: colors.saffron }
    : SAFE_COLORS;
}

function StackLoadFallback({
  onRetry,
  onHome,
}: {
  onRetry: () => void;
  onHome: () => void;
}) {
  const colors = useSafeColors();
  const lang = useSafeLang();
  const text = contentByLang(lang, 'कुछ खुल नहीं सका', 'Something could not open');
  const retry = contentByLang(lang, 'पुनः प्रयास', 'Retry');
  const home = contentByLang(lang, 'होम', 'Home');
  const labelFont = lang === 'en' ? fontFamilies.inter : scriptTitleFont(lang, fontFamilies.devanagariBold);
  return (
    <View
      accessibilityLabel={text}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.parchment }}
    >
      <Text
        style={{
          color: colors.ink,
          fontFamily: scriptTitleFont(lang, fontFamilies.devanagariBold),
          fontSize: 17,
          textAlign: 'center',
        }}
      >
        {text}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={retry}
        testID="error-boundary-retry"
        style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 999, backgroundColor: colors.saffron }}
      >
        <Text style={{ color: colors.parchment, fontFamily: labelFont, fontSize: 13 }}>{retry}</Text>
      </Pressable>
      <Pressable
        onPress={onHome}
        accessibilityRole="button"
        accessibilityLabel={home}
        testID="error-boundary-home"
        style={{ marginTop: 10, paddingVertical: 10, paddingHorizontal: 22 }}
      >
        <Text style={{ color: colors.saffron, fontFamily: labelFont, fontSize: 13 }}>{home}</Text>
      </Pressable>
    </View>
  );
}
