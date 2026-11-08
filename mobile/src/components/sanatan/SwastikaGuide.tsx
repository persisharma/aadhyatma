import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeContext';
import { Copy, Panel, useSanatanText } from './Primitives';
import type { Pair } from '@/data/sanatan-parichay';

// All four turns are clockwise when followed outwards from the centre.
// Keep the schematic exact; it must never depend on a font's swastika glyph.
export const SWASTIKA_CROSS = 'M60 17v86M17 60h86';
export const SWASTIKA_BENDS = 'M60 17h43M103 60v43M60 103H17M17 60V17';
const goals: readonly Pair[] = [
  ['धर्म · उचित आचरण', 'Dharma · Right conduct'],
  ['अर्थ · जीवन के संसाधन', 'Artha · Livelihood and resources'],
  ['काम · प्रेम और आनन्द', 'Kama · Love and enjoyment'],
  ['मोक्ष · आध्यात्मिक मुक्ति', 'Moksha · Spiritual liberation'],
];
const steps: readonly { title: Pair; caption: Pair; stage: 0 | 1 | 2 }[] = [
  { title: ['रेखाएँ मिलाएँ', 'Join the lines'], stage: 0,
    caption: ['केन्द्र में खड़ी और आड़ी रेखा मिलाएँ। यह शुरुआती ढाँचा है।', 'Meet a vertical and horizontal line at the centre. This is the starting framework.'] },
  { title: ['चारों सिरे मोड़ें', 'Bend all four tips'], stage: 1,
    caption: ['ऊपर से दाएँ; दाएँ से नीचे; नीचे से बाएँ; बाएँ से ऊपर। चारों मोड़ समकोण पर हों।', 'Top to right; right down; bottom to left; left up. Make all four bends at right angles.'] },
  { title: ['बिन्दु, यदि परम्परा हो', 'Dots, if customary'], stage: 2,
    caption: ['चार खाली भागों में एक-एक बिन्दु लगा सकते हैं। बिना बिन्दुओं का रूप भी मिलता है।', 'You may add one dot in each space. Forms without dots are also used.'] },
];
function Figure({ stage }: { stage: 0 | 1 | 2 }) {
  const { colors } = useTheme();
  return <Svg width="100%" height={160} viewBox="0 0 120 120" accessible={false}>
    <Path d={SWASTIKA_CROSS} stroke={colors.saffronDeep} strokeWidth={7} strokeLinecap="round" fill="none" />
    {stage > 0 && <Path d={SWASTIKA_BENDS} stroke={colors.saffronDeep} strokeWidth={7} strokeLinecap="round" fill="none" />}
    {stage === 2 && [39, 81].flatMap(x => [39, 81].map(y => <Circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill={colors.saffronDeep} />))}
  </Svg>;
}

/** Static, scrollable schematics; captions also describe the geometry to screen readers. */
export default function SwastikaGuide({ mode }: { mode: 'meaning' | 'drawing' }) {
  const t = useSanatanText();
  if (mode === 'meaning') return <View testID="swastika-meaning">
    <Figure stage={2} />
    <Copy heading>{t(['चार पुरुषार्थ', 'Four aims of life'])}</Copy>
    {goals.map(goal => <Copy key={goal[1]}>{t(goal)}</Copy>)}
    <Copy>{t(['यह एक प्रतीकात्मक व्याख्या है; हर लक्ष्य के लिए किसी एक भुजा का स्थान निश्चित नहीं है।', 'This is a symbolic interpretation; each aim need not occupy one fixed arm.'])}</Copy>
  </View>;
  return <View testID="swastika-drawing" style={{ gap: 16 }}>
    <Copy heading>{t(['चित्रों से अभ्यास करें', 'Practise with the diagrams'])}</Copy>
    <Copy>{t(['यह सीखने का क्रम है; विशेष पूजा में अपनी परम्परा की विधि मानें।', 'This is a learning sequence. Follow your tradition for a specific ritual.'])}</Copy>
    {steps.map(step => <View key={step.stage} testID={`swastika-stage-${step.stage}`}>
      <Panel>
        <Copy heading>{`${step.stage + 1}. ${t(step.title)}`}</Copy>
        <Figure stage={step.stage} />
        <Copy>{t(step.caption)}</Copy>
      </Panel>
    </View>)}
  </View>;
}
