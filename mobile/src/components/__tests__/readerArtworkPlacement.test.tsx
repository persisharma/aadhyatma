import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { GitaLanguageProvider } from '@/data/gita/language';
import { getGitaChapter } from '@/data/gita';
import { getGitaSaarChapter } from '@/data/gita-saar';
import { getShivaStrotamChapter } from '@/data/shiva-strotam';
import { getSundarkandChapter } from '@/data/sundarkand';
import { getBajrangBaanChapter } from '@/data/bajrang-baan';
import { getSanskar } from '@/data/sanskar';
import { backgroundImages } from '@assets/backgrounds';
import VersePage from '../VersePage';
import GitaVersePage from '../GitaVersePage';
import GitaSaarVersePage from '../GitaSaarVersePage';
import ShivaStrotamVersePage from '../ShivaStrotamVersePage';
import SundarkandVersePage from '../SundarkandVersePage';
import BajrangBaanVersePage from '../BajrangBaanVersePage';
import SanskarVersePage from '../SanskarVersePage';
import KathaSectionPage from '../KathaSectionPage';
import ProseReadingCard from '../ProseReadingCard';
import GarudPuranPage from '../GarudPuranPage';
import { getGarudPuranChapter } from '@/data/garud-puran';
import ReadingBanner from '../ReadingBanner';
import BackgroundLayer from '../BackgroundLayer';
import { readingParchment } from '@/data/backgroundAsset';

// Keep actual reader layout; only native image I/O is outside this test's scope.
jest.mock('../CachedArtwork', () => () => null);

const linesVerse = {
  id: 'doha-1', labelHi: 'दोहा', labelEn: 'Doha',
  lines: ['परीक्षण'], linesEn: ['Verse remains readable'],
  meaningHi: 'अर्थ', meaningEn: 'Meaning remains readable',
};
const cases: [string, (showIllustration: boolean) => React.ReactElement][] = [
  ['Chalisa/Aarti', show => <VersePage verse={linesVerse} sourceId="hanuman-chalisa" width={375} showIllustration={show} />],
  ['Gita', show => <GitaVersePage verse={getGitaChapter(1).verses[0]} sourceId="bhagavad-gita" width={375} showIllustration={show} />],
  ['Gita Saar', show => <GitaSaarVersePage verse={getGitaSaarChapter(1).verses[0]} sourceId="gita-saar" width={375} showIllustration={show} />],
  ['Stotram', show => <ShivaStrotamVersePage verse={getShivaStrotamChapter(1).verses[0]} sourceId="shiva-strotam" width={375} showIllustration={show} />],
  ['Ramayan', show => <SundarkandVersePage verse={getSundarkandChapter(1).verses[0]} sourceId="sundarkand" width={375} showIllustration={show} />],
  ['Bajrang Baan', show => <BajrangBaanVersePage verse={getBajrangBaanChapter(1).verses[0]} sourceId="bajrang-baan" width={375} showIllustration={show} />],
  ['Sanskar', show => <SanskarVersePage verse={getSanskar('prabhati-shloka').verses[0]} sourceId="prabhati-shloka" width={375} showIllustration={show} />],
];

const wrap = (element: React.ReactElement) => <GitaLanguageProvider initialLang="en">{element}</GitaLanguageProvider>;
const text = (tree: TestRenderer.ReactTestRenderer) => tree.root.findAllByType(Text).map(node => node.props.children);

test.each(cases)('%s: later cards remove the banner frame while keeping all reading text', (_, page) => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(wrap(page(true))); });
  expect(tree.root.findAllByType(ReadingBanner)).toHaveLength(1);
  const reading = text(tree);
  act(() => { tree.update(wrap(page(false))); });
  expect(tree.root.findAllByType(ReadingBanner)).toHaveLength(0);
  expect(tree.root.findAllByProps({ testID: 'prose-reading-illustration' })).toHaveLength(0);
  expect(text(tree)).toEqual(reading);
  act(() => tree.unmount());
});

test.each(cases)('%s: every card keeps its themed background whether or not it shows the banner', (_, page) => {
  let tree!: TestRenderer.ReactTestRenderer;
  for (const show of [true, false]) {
    act(() => { tree = TestRenderer.create(wrap(page(show))); });
    const [layer] = tree.root.findAllByType(BackgroundLayer);
    expect(layer.props.source).toBeTruthy();
    expect(layer.props.source).not.toBe(readingParchment);
    act(() => tree.unmount());
  }
});

test('Katha has a banner only on its first section, including when a later section is opened directly', () => {
  const section = { id: 'part', titleHi: 'कथा', titleEn: 'Katha', bodyHi: ['कथा पाठ'], bodyEn: ['All story paragraphs remain readable.'] };
  let tree!: TestRenderer.ReactTestRenderer;
  const page = (index: number) => wrap(<KathaSectionPage section={section} index={index} total={3} width={375} />);
  act(() => { tree = TestRenderer.create(page(2)); });
  expect(tree.root.findAllByType(ReadingBanner)).toHaveLength(0);
  expect(text(tree)).toContain('All story paragraphs remain readable.');
  act(() => tree.update(page(0)));
  expect(tree.root.findAllByType(ReadingBanner)).toHaveLength(1);
  act(() => tree.update(page(1)));
  expect(tree.root.findAllByType(ReadingBanner)).toHaveLength(0);
  expect(text(tree)).toContain('All story paragraphs remain readable.');
  act(() => tree.unmount());
});

test('a single continuous prose reading keeps its one opening illustration', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<ProseReadingCard illustration={backgroundImages.category_granth_open_scripture}><Text>Complete continuous story</Text></ProseReadingCard>); });
  expect(tree.root.findAllByType(ReadingBanner)).toHaveLength(1);
  expect(text(tree)).toContain('Complete continuous story');
  act(() => tree.unmount());
});

test('Garud Puran reserves artwork only for the opening page and preserves continuation text', () => {
  const chapter = getGarudPuranChapter(5);
  let tree!: TestRenderer.ReactTestRenderer;
  const page = (index: number) => wrap(<GarudPuranPage verse={chapter.verses[index]} source={chapter.source} width={375} />);
  act(() => { tree = TestRenderer.create(page(0)); });
  expect(tree.root.findAllByType(ReadingBanner)).toHaveLength(1);
  act(() => { tree.update(page(1)); });
  expect(tree.root.findAllByType(ReadingBanner)).toHaveLength(0);
  expect(text(tree)).toContain(chapter.verses[1].bodyEn[0]);
  act(() => tree.unmount());
});
