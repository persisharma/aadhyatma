import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Lang } from '@/data/gita/language';
import { cleanSender, suvicharArtRequest, suvicharHeroFraction, type SuvicharDeity, type SuvicharFrame } from '@/data/suvichar';
import { subscribeBackgroundAsset, evictBackgroundAsset } from '@/utils/backgroundAssetCache';
import { useTheme } from '@/theme/ThemeContext';
import { suvicharCardType as t } from '@/theme/suvichar';
import { titleFontByLang } from '@/utils/langType';
import { contentByLang, pick } from '@/utils/localize';

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
  const [painted, setPainted] = useState({ hero: false, body: false });
  const [rootHeight, setRootHeight] = useState(0);
  const [measured, setMeasured] = useState(false);
  const [bodyHeight, setBodyHeight] = useState(width * t.aspect * (1 - heroFraction));
  useEffect(() => { onReady(!!uri && painted.hero && painted.body && measured && Math.abs(rootHeight - (width * t.aspect * heroFraction + bodyHeight)) < 1); }, [uri, painted, measured, rootHeight, bodyHeight, width, heroFraction, onReady]);
  const scale = width / t.baseWidth;
  const face = titleFontByLang(lang);
  const text = (size: number) => ({ color: colors.ink, fontFamily: face, fontSize: size * scale, lineHeight: size * scale * t.leading, textAlign: 'center' as const });
  const sender = cleanSender(name);
  const hero = width * t.aspect * heroFraction;
  const backgroundHeight = bodyHeight / (1 - heroFraction);
  const failed = () => { setPainted({ hero: false, body: false }); onFailure(); };
  return <View testID="suvichar-card" onLayout={e => { setRootHeight(e.nativeEvent.layout.height); onHeight?.(e.nativeEvent.layout.height); }} style={{ width, backgroundColor: colors.parchmentSoft }} collapsable={false}>
    <View style={{ height: hero, overflow: 'hidden' }}>
      {uri ? <Image accessible={false} source={{ uri }} resizeMode="stretch" style={{ width, height: width * t.aspect }} onLoad={() => setPainted(p => ({ ...p, hero: true }))} onError={failed} /> : null}
      <Text allowFontScaling={false} style={[text(t.brand), { position: 'absolute', top: 0, left: width * .2, right: width * .2 }]}>{contentByLang(lang, 'वेदांश', 'VEDANSH')}</Text>
    </View>
    <View testID="suvichar-card-body" onLayout={e => { setBodyHeight(e.nativeEvent.layout.height); setMeasured(Number.isFinite(e.nativeEvent.layout.height) && e.nativeEvent.layout.height > 0); }} style={{ minHeight: width * t.aspect * (1 - heroFraction), overflow: 'hidden' }}>
      {uri ? <Image accessible={false} source={{ uri }} resizeMode="stretch" style={{ position: 'absolute', width, height: backgroundHeight, top: -backgroundHeight * heroFraction }} onLoad={() => setPainted(p => ({ ...p, body: true }))} onError={failed} /> : null}
      <View style={{ paddingHorizontal: width * t.horizontalInset, paddingVertical: 8 * scale }}>
        <Text allowFontScaling={false} style={[text(t.label), { color: colors.inkMuted }]}>{pick(lang, { hi: 'आज का सुविचार', en: 'A thought for today', gu: 'આજનો સુવિચાર', kn: 'ಇಂದಿನ ಸುವಿಚಾರ' })}</Text>
        <Text testID="suvichar-card-message" allowFontScaling={false} style={text(t.message)}>{message}</Text>
        <Text allowFontScaling={false} style={[text(t.label), { color: colors.inkMuted }]}>{original ? pick(lang, { hi: 'वेदांश का मौलिक विचार', en: 'An original Vedansh reflection', gu: 'વેદાંશનો મૌલિક વિચાર', kn: 'ವೇದಾಂಶದ ಮೂಲ ಚಿಂತನೆ' }) : pick(lang, { hi: 'आपकी शुभकामना', en: 'Your warm wishes', gu: 'તમારી શુભેચ્છા', kn: 'ನಿಮ್ಮ ಶುಭಾಶಯ' })}</Text>
        {sender ? <Text testID="suvichar-card-sender" allowFontScaling={false} style={text(t.name)}>{pick(lang, { hi: 'सप्रेम', en: 'With love', gu: 'સપ્રેમ', kn: 'ಪ್ರೀತಿಯಿಂದ' })} — {sender}</Text> : null}
        <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.gold, marginTop: 8 * scale, paddingTop: 4 * scale }}>
          <Text allowFontScaling={false} style={text(t.name)}>VEDANSH</Text>
          <Text allowFontScaling={false} style={text(t.label)}>{pick(lang, { hi: 'ऐसे और भक्ति संदेश पाएँ', en: 'Discover more devotional wishes', gu: 'આવા વધુ ભક્તિ સંદેશ મેળવો', kn: 'ಇಂತಹ ಇನ್ನಷ್ಟು ಭಕ್ತಿ ಸಂದೇಶಗಳನ್ನು ಪಡೆಯಿರಿ' })}</Text>
          <Text allowFontScaling={false} style={text(t.label)}>vedansh.app/get</Text>
        </View>
      </View>
    </View>
  </View>;
}
