import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useGitaLanguage } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import { fontFamilies } from '@/theme/typography';
import { scriptTitleFont } from '@/utils/langType';

/**
 * Error boundary for a tab whose stack loads behind `React.lazy`.
 *
 * Without one, a chunk that fails to evaluate rejects the lazy payload and the
 * throw propagates to the root: the whole tree unmounts and the app is a dead
 * screen with no way back — indistinguishable, to the user, from a launch that
 * simply never finishes. Contained here, the failure costs one tab: the bar
 * stays up, the other tabs still work, and Retry re-attempts the chunk.
 */
export default class StackLoadBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <StackLoadFallback onRetry={() => this.setState({ failed: false })} />;
    }
    return this.props.children;
  }
}

function StackLoadFallback({ onRetry }: { onRetry: () => void }) {
  const { colors } = useTheme();
  const { lang } = useGitaLanguage();
  return (
    <View
      accessibilityLabel="Panchang could not load"
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
        {contentByLang(lang, 'पंचांग खुल नहीं सका', 'Panchang could not open')}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 22, borderRadius: 999, backgroundColor: colors.saffron }}
      >
        <Text style={{ color: colors.parchment, fontFamily: fontFamilies.inter, fontSize: 13 }}>
          {contentByLang(lang, 'पुनः प्रयास', 'Retry')}
        </Text>
      </Pressable>
    </View>
  );
}
