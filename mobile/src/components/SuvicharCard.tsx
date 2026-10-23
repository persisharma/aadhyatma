import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '@/data/gita/language';
import { cleanSender, suvicharArtRequest, suvicharBrandSlot, suvicharFooterBand, suvicharHeroFraction, type SuvicharDeity, type SuvicharFrame } from '@/data/suvichar';
import { subscribeBackgroundAsset, evictBackgroundAsset } from '@/utils/backgroundAssetCache';
import { useTheme } from '@/theme/ThemeContext';
import { suvicharCardType as t } from '@/theme/suvichar';
import { fontFamilies } from '@/theme/typography';
import { titleFontByLang } from '@/utils/langType';
import { pick } from '@/utils/localize';

const brandMark = require('@assets/branding/brand-mark.png');

type Props = {
  deity: SuvicharDeity; frame: SuvicharFrame; message: string; name: string; lang: Lang; width: number;
  onReady: (ready: boolean) => void; onHeight?: (height: number) => void; original?: boolean;
};
/** Keep the artwork subscription alive while names/messages are being typed. */
export default function SuvicharCard(props: Props) {
  const request = suvicharArtRequest(props.deity, props.frame);
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    if (!request) return;
    return subscribeBackgroundAsset(request, setUri);
  }, [request?.remoteUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  const failed = () => { setUri(null); if (request) void evictBackgroundAsset(request); };
  return <MeasuredCard key={JSON.stringify([props.message, props.name, props.lang, props.width])}
    {...props} uri={uri} onFailure={failed} />;
}
function MeasuredCard({ deity, frame, message, name, lang, width, onReady, onHeight, original = true, uri, onFailure }: Props & {
  uri: string | null; onFailure: () => void;
}) {
  const { colors } = useTheme();
  const heroFraction = suvicharHeroFraction(deity, frame);
  const band = suvicharFooterBand(frame);
  const brand = suvicharBrandSlot(frame);
  const full = width * t.aspect;
  const hero = full * heroFraction;
  const footer = full * (1 - band.start);
  const [painted, setPainted] = useState({ hero: false, body: false, footer: false, mark: false });
  const [rootHeight, setRootHeight] = useState(0);
  const [measured, setMeasured] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(full * (band.start - heroFraction));
  useEffect(() => { onReady(!!uri && painted.hero && painted.body && painted.footer && painted.mark && measured && Math.abs(rootHeight - (hero + bodyHeight + footer)) < 1); }, [uri, painted, measured, rootHeight, bodyHeight, hero, footer, onReady]);
  const scale = width / t.baseWidth;
  const face = titleFontByLang(lang);
  const text = (size: number) => ({ color: colors.ink, fontFamily: face, fontSize: size * scale, lineHeight: size * scale * t.leading, textAlign: 'center' as const });
  const sender = cleanSender(name);
  // Only the paper between the painting and the footer rule stretches with the text.
  const backgroundHeight = bodyHeight / (band.start - heroFraction);
  const failed = () => { setPainted(p => ({ hero: false, body: false, footer: false, mark: p.mark })); onFailure(); };
  return <View testID="suvichar-card" onLayout={e => { setRootHeight(e.nativeEvent.layout.height); onHeight?.(e.nativeEvent.layout.height); }} style={{ width, backgroundColor: colors.parchmentSoft }} collapsable={false}>
    <View style={{ height: hero, overflow: 'hidden' }}>
      {uri ? <Image accessible={false} source={{ uri }} resizeMode="stretch" style={{ width, height: full }} onLoad={() => setPainted(p => ({ ...p, hero: true }))} onError={failed} /> : null}
      <View testID="suvichar-card-brand" style={{ position: 'absolute', left: 0, right: 0, top: full * brand.top, height: full * (brand.bottom - brand.top), alignItems: 'center', justifyContent: 'center' }}>
        <BrandBadge scale={scale} onPainted={() => setPainted(p => ({ ...p, mark: true }))} />
      </View>
    </View>
    <View testID="suvichar-card-body" onLayout={e => { setBodyHeight(e.nativeEvent.layout.height); setMeasured(Number.isFinite(e.nativeEvent.layout.height) && e.nativeEvent.layout.height > 0); }} style={{ minHeight: full * (band.start - heroFraction), justifyContent: 'center', overflow: 'hidden' }}>
      {uri ? <Image accessible={false} source={{ uri }} resizeMode="stretch" style={{ position: 'absolute', width, height: backgroundHeight, top: -backgroundHeight * heroFraction }} onLoad={() => setPainted(p => ({ ...p, body: true }))} onError={failed} /> : null}
      <View style={{ paddingHorizontal: width * t.horizontalInset, paddingVertical: 8 * scale }}>
        <Text allowFontScaling={false} style={[text(t.label), { color: colors.inkMuted }]}>{pick(lang, { hi: 'आज का सुविचार', en: 'A thought for today', gu: 'આજનો સુવિચાર', kn: 'ಇಂದಿನ ಸುವಿಚಾರ' })}</Text>
        <Text testID="suvichar-card-message" allowFontScaling={false} style={text(t.message)}>{message}</Text>
        <View testID="suvichar-card-divider" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 * scale, marginVertical: 6 * scale }}>
          <View style={{ width: 36 * scale, height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.gold }} /><Diamond size={3.5 * scale} />
          <View style={{ width: 36 * scale, height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.gold }} />
        </View>
        {original ? null : <Text allowFontScaling={false} style={[text(t.label), { color: colors.inkMuted }]}>{pick(lang, { hi: 'आपकी शुभकामना', en: 'Your warm wishes', gu: 'તમારી શુભેચ્છા', kn: 'ನಿಮ್ಮ ಶುಭಾಶಯ' })}</Text>}
        {sender ? <Text testID="suvichar-card-sender" allowFontScaling={false} style={text(t.name)}>{pick(lang, { hi: 'सप्रेम', en: 'With love', gu: 'સપ્રેમ', kn: 'ಪ್ರೀತಿಯಿಂದ' })} — {sender}</Text> : null}
        <Text testID="suvichar-card-download" allowFontScaling={false} style={[text(t.download), { color: colors.saffronDeep, marginTop: 6 * scale, marginHorizontal: width * .14 }]}>{pick(lang, { hi: 'ऐसे और संदेशों के लिए वेदांश ऐप डाउनलोड करें', en: 'Download the Vedansh app for more wishes like this', gu: 'આવા વધુ સંદેશ માટે વેદાંશ ઍપ ડાઉનલોડ કરો', kn: 'ಇಂತಹ ಇನ್ನಷ್ಟು ಸಂದೇಶಗಳಿಗೆ ವೇದಾಂಶ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' })}</Text>
      </View>
    </View>
    <View testID="suvichar-card-footer" style={{ height: footer, overflow: 'hidden' }}>
      {uri ? <Image accessible={false} source={{ uri }} resizeMode="stretch" style={{ position: 'absolute', width, height: full, top: -full * band.start }} onLoad={() => setPainted(p => ({ ...p, footer: true }))} onError={failed} /> : null}
      <View style={{ position: 'absolute', left: width * t.horizontalInset, right: width * t.horizontalInset, top: full * (band.textTop - band.start), height: full * (band.textBottom - band.textTop), justifyContent: 'center' }}>
        <Text allowFontScaling={false} numberOfLines={1} style={[text(t.footer), { color: colors.inkSoft }]}>vedansh.app/get</Text>
      </View>
    </View>
  </View>;
}
function Diamond({ size }: { size: number }) {
  const { colors } = useTheme();
  return <View style={{ width: size, height: size, backgroundColor: colors.gold, transform: [{ rotate: '45deg' }] }} />;
}
/** The app-icon + वेदांश lockup in a paper pill: fits every frame's top space and covers the letter frame's rule. */
function BrandBadge({ scale, onPainted }: { scale: number; onPainted: () => void }) {
  const { colors, radii } = useTheme();
  return <View testID="suvichar-card-badge" style={{ flexDirection: 'row', alignItems: 'center', gap: 5 * scale, paddingVertical: 1.5 * scale, paddingLeft: 2.5 * scale,
    paddingRight: 8 * scale, borderWidth: 1, borderColor: colors.gold, borderRadius: radii.pill, backgroundColor: colors.parchmentSoft }}>
    {/* A bundled mark that fails to decode still leaves the wordmark, so it never blocks sharing. */}
    <Image accessible={false} source={brandMark} style={{ width: 15 * scale, height: 15 * scale, borderRadius: 7.5 * scale }} onLoad={onPainted} onError={onPainted} />
    {/* Devanagari has no descenders, so its ink rides high in the line box; drop it onto the icon's centre. */}
    <Text allowFontScaling={false} style={{ fontFamily: fontFamilies.devanagariBold, fontSize: t.badge * scale, lineHeight: 16 * scale, color: colors.saffronDeep,
      transform: [{ translateY: t.badge * scale * .22 }] }}>वेदांश</Text>
  </View>;
}
