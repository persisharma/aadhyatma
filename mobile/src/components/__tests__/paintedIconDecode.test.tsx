import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { Image } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { PAINTED_ICON_DECODE } from '../paintedIconDecode';
import StoryIcon from '../StoryIcon';
import MoreIcon from '../MoreIcon';
import FeatureIcon from '../FeatureIcon';
import KundaliArtwork from '../KundaliArtwork';
import { decodedBitmap, frescoSampleSize, platformSampleSize } from '@/utils/androidImageDecode';

function render(element: React.ReactElement): ReactTestRenderer {
  let tree!: ReactTestRenderer;
  act(() => { tree = create(element); });
  return tree;
}
const trees: ReactTestRenderer[] = [];
afterEach(() => { act(() => { trees.splice(0).forEach(tree => tree.unmount()); }); });
const imageProps = (element: React.ReactElement) => {
  const tree = render(element);
  trees.push(tree);
  return tree.root.findByType(Image).props;
};

describe('painted icons ask Android to decode near their drawn size', () => {
  test.each([
    ['StoryIcon', <StoryIcon key="s" name="gayatri" />],
    ['MoreIcon', <MoreIcon key="m" name="star" />],
    ['FeatureIcon', <FeatureIcon key="f" name="routine" />],
    ['KundaliArtwork', <KundaliArtwork key="k" name="sun" />],
  ])('%s', (_name, element) => {
    const props = imageProps(element);
    expect(props.resizeMethod).toBe('resize');
    expect(props.resizeMultiplier).toBe(1.5);
  });

  test('the icon keeps its own size, mode and tint', () => {
    const props = imageProps(<StoryIcon name="gayatri" size={36} tintColor="#B8621B" />);
    expect(props.style).toEqual({ width: 36, height: 36, tintColor: '#B8621B' });
    expect(props.resizeMode).toBe('contain');
    expect(props.fadeDuration).toBe(0);
  });
});

describe('the decode setting never costs sharpness', () => {
  // Every size a painted icon is drawn at (dp), on every density Android ships.
  const drawnAt = [22, 30, 31, 32, 34, 36, 40, 44, 47, 48, 52, 64, 96];
  const densities = [1, 1.5, 1.75, 2, 2.25, 2.625, 2.75, 3, 3.5, 4];
  const masters: [number, number][] = [[512, 512], [256, 256], [768, 512]];

  test('the decoded bitmap is never smaller than the view it fills', () => {
    for (const [sourceWidth, sourceHeight] of masters) {
      for (const dp of drawnAt) {
        for (const density of densities) {
          const view = dp * density;
          const bitmap = decodedBitmap(sourceWidth, sourceHeight, view, view, PAINTED_ICON_DECODE.resizeMultiplier);
          // The strictest way the image can be drawn is `cover`: scaled until
          // BOTH axes fill the view. A master smaller than that cannot be
          // decoded larger than itself.
          const scale = Math.min(1, Math.max(view / sourceWidth, view / sourceHeight));
          const covered = bitmap.width >= Math.floor(sourceWidth * scale) && bitmap.height >= Math.floor(sourceHeight * scale);
          expect({ sourceWidth, dp, density, covered }).toEqual({ sourceWidth, dp, density, covered: true });
        }
      }
    }
  });

  test('a multiplier of 1 would have stretched some icons, which is why it is 1.5', () => {
    // 47 dp on a 3x screen is 141 px; Fresco rounds the sample size up and
    // hands back 128 px, which would be stretched 10%.
    expect(decodedBitmap(512, 512, 141, 141, 1).width).toBe(128);
    expect(decodedBitmap(512, 512, 141, 141, 1.5).width).toBe(256);
  });

  test('it is the saving it claims to be on the screens that matter', () => {
    const whole = decodedBitmap(512, 512, 88, 88, null);
    const bounded = decodedBitmap(512, 512, 88, 88, PAINTED_ICON_DECODE.resizeMultiplier);
    // A 44 dp tile on an xhdpi (2x) phone: 1 MB decoded whole, 64 KB bounded.
    expect(whole.bytes).toBe(512 * 512 * 4);
    expect(bounded).toEqual({ width: 128, height: 128, bytes: 128 * 128 * 4 });
  });

  test('the model matches Fresco’s published thresholds', () => {
    expect(frescoSampleSize(0.7)).toBe(1);
    expect(frescoSampleSize(0.5)).toBe(2);
    expect(frescoSampleSize(0.39)).toBe(2);
    expect(frescoSampleSize(0.38)).toBe(3);
    expect(frescoSampleSize(0.25)).toBe(4);
    expect([1, 2, 3, 4, 5, 7, 8, 9].map(platformSampleSize)).toEqual([1, 2, 2, 4, 4, 4, 8, 8]);
  });
});

describe('exported share cards never inherit a downsampled icon', () => {
  // A capture can be drawn at more pixels than the on-screen view. These are the
  // components `utils/shareVerse` mounts for capture; none may use the bounded
  // decode or a component that applies it.
  const captureSurfaces = [
    'ShareCard.tsx', 'ShareCardMount.tsx', 'ShareStoryCanvas.tsx', 'ShareStoryFrame.tsx', 'ShareFitFrame.tsx',
    'ProseShareCard.tsx', 'PanchangShareCard.tsx', 'DevotionalShareCard.tsx', 'DevotionalFrame.tsx',
    'SuvicharCard.tsx', 'VedanshWordmark.tsx',
  ];
  const bounded = /PAINTED_ICON_DECODE|from '(?:@\/components|\.)\/(?:StoryIcon|MoreIcon|FeatureIcon|KundaliArtwork|CelestialGlyph|CategoryIcon|DeityIcon)'/;

  test.each(captureSurfaces)('%s', (file) => {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    expect(bounded.test(source)).toBe(false);
  });
});
