import React, { Component, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useTheme } from '@/theme/ThemeContext';

export type BrandParticleProps = { onComplete: () => void; onReady?: () => void | Promise<void> };

class SurfaceBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

/** Loaded only after preferences/accessibility resolve; uses the approved canvas verbatim. */
export default function BrandParticleWebView({ onComplete, onReady }: BrandParticleProps) {
  const { colors } = useTheme();
  // Keep the 170KB composition and WebView execution off the static launch path.
  const source = useMemo(() => {
    const document = require('@/branding/approvedParticleDocument.json') as { html: string };
    return { html: document.html, baseUrl: 'about:blank' };
  }, []);
  const visible = useRef(false);
  const active = useRef(true);
  const started = useRef(false);
  const webview = useRef<WebView>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const show = useCallback(() => {
    if (visible.current || !active.current) return;
    visible.current = true;
    // The ready document is held at frame zero. Start only after native splash
    // dismissal resolves, rather than consuming the animation behind it.
    void Promise.resolve().then(() => onReady?.()).then(() => {
      if (!active.current) return;
      started.current = true;
      webview.current?.injectJavaScript('window.__vedanshStart && window.__vedanshStart(); true;');
    }).catch(onComplete);
  }, [onReady, onComplete]);
  const message = useCallback((event: WebViewMessageEvent) => {
    let payload: unknown;
    try { payload = JSON.parse(event.nativeEvent.data); } catch { return; }
    if (!payload || typeof payload !== 'object' || !('type' in payload)) return;
    if (payload.type === 'brand-ready') show();
    if (payload.type === 'brand-complete' && started.current && active.current) onComplete();
  }, [onComplete, show]);
  return <SurfaceBoundary onError={onComplete}>
    <WebView ref={webview} testID="brand-particle-webview" source={source} onMessage={message}
      style={[styles.fill, { backgroundColor: colors.brandIvory }]} originWhitelist={['about:blank']}
      onShouldStartLoadWithRequest={request => request.url === 'about:blank'}
      onError={onComplete} onHttpError={onComplete} onContentProcessDidTerminate={onComplete}
      onRenderProcessGone={onComplete} javaScriptEnabled domStorageEnabled={false}
      scrollEnabled={false} bounces={false} showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false} setSupportMultipleWindows={false}
      allowsInlineMediaPlayback={false} mediaPlaybackRequiresUserAction
      accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
  </SurfaceBoundary>;
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
