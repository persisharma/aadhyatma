import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, InteractionManager, StyleSheet, View, type ImageResizeMode, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { bundledReadingFallback } from '@/data/backgroundAsset';
import { artworkRequest, type ArtworkImage } from '@/data/artworkAsset';
import { evictBackgroundAsset, subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';
import { ArtworkCaptureContext } from './ArtworkCaptureContext';

// Some embedded/test surfaces expose navigation hooks without a navigator context.
const OptionalNavigationContext = NavigationContext ?? React.createContext<undefined>(undefined);

export type CachedArtworkProps = {
  source?: ArtworkImage | null;
  style?: StyleProp<ViewStyle>;
  resizeMode?: ImageResizeMode;
  fallback?: React.ReactNode;
  imageStyle?: StyleProp<ImageStyle>;
};

/** Paint local art immediately; remote art never gates text, navigation or layout. */
export default function CachedArtwork({ source, style, resizeMode = 'cover', fallback, imageStyle }: CachedArtworkProps) {
  const navigation = useContext(OptionalNavigationContext);
  const capture = useContext(ArtworkCaptureContext);
  const captureDone = useRef<(() => void) | undefined>(undefined);
  const fallbackLoaded = useRef(false);
  const remoteFailed = useRef(false);
  const request = artworkRequest(source);
  const url = request?.remoteUrl;
  const [resolved, setResolved] = useState<{ url: string; uri: string } | null>(null);
  const [loadedUri, setLoadedUri] = useState<string | null>(null);
  const uri = resolved && resolved.url === url ? resolved.uri : null;
  const visibleUri = useRef<string | null>(null);
  visibleUri.current = uri;
  useEffect(() => {
    remoteFailed.current = false;
  }, [url]);
  useEffect(() => {
    if (!capture || !url) return;
    const done = capture.register();
    captureDone.current = done;
    if ((uri && loadedUri === uri) || (remoteFailed.current && fallbackLoaded.current)) done();
    return () => { done(); captureDone.current = undefined; };
    // A new capture/source registers once; native events settle its paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capture, url]);
  useEffect(() => {
    visibleUri.current = uri;
    return () => { visibleUri.current = null; };
  }, [uri]);

  useEffect(() => {
    if (!request) return;
    let active = true;
    let unsubscribe: (() => void) | undefined;
    let scheduled: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;
    const stop = () => {
      active = false;
      scheduled?.cancel();
      scheduled = undefined;
      unsubscribe?.();
      unsubscribe = undefined;
    };
    const start = () => {
      if (scheduled || unsubscribe) return;
      active = true;
      scheduled = InteractionManager.runAfterInteractions(() => {
        scheduled = undefined;
        if (!active) return;
        unsubscribe = subscribeBackgroundAsset(request, local => {
          if (active) {
            setResolved(local ? { url: request.remoteUrl, uri: local } : null);
            if (!local) {
              remoteFailed.current = true;
              if (fallbackLoaded.current) captureDone.current?.();
            }
          }
        });
      });
    };
    if (!navigation || navigation.isFocused()) start();
    const removeFocus = navigation?.addListener('focus', start);
    const removeBlur = navigation?.addListener('blur', stop);
    return () => { stop(); removeFocus?.(); removeBlur?.(); };
    // Manifest descriptors are stable by URL, independent of JSX object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, navigation]);

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={style}>
      {typeof source !== 'number' && fallback ? fallback : (
        <Image source={typeof source === 'number' ? source : bundledReadingFallback} style={[styles.image, typeof source === 'number' ? imageStyle : undefined]} resizeMode={resizeMode}
          onLoad={() => {
            fallbackLoaded.current = true;
            if (remoteFailed.current) captureDone.current?.();
          }}
          onError={() => { if (remoteFailed.current) captureDone.current?.(); }} />
      )}
      {uri ? (
        <Image
          key={uri}
          source={{ uri }}
          style={[styles.image, imageStyle, { opacity: loadedUri === uri ? 1 : 0 }]}
          resizeMode={resizeMode}
          onLoad={() => {
            if (visibleUri.current !== uri) return;
            setLoadedUri(uri);
            captureDone.current?.();
          }}
          onError={() => {
            if (visibleUri.current !== uri) return;
            setResolved(null);
            setLoadedUri(null);
            remoteFailed.current = true;
            if (fallbackLoaded.current) captureDone.current?.();
            if (request) void evictBackgroundAsset(request);
          }}
        />
      ) : null}
    </View>
  );
}

// Static require() supplies intrinsic dimensions. Explicit dimensions keep a
// 1024px painting from zooming into its corner inside a small illustration plate.
const styles = StyleSheet.create({ image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' } });
