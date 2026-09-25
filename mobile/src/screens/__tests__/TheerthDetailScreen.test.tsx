import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, ImageBackground, Text } from 'react-native';
import { backgroundImages } from '@assets/backgrounds';
import { getDeityBackground, getTheerthBackground } from '@/data/backgrounds';
import { getTempleDetailById, templesWithDetails } from '@/data/theerth/temples';

// Rows alone carry no prose now; this screen's assertions all need the reading.
const temples = templesWithDetails();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(require('react-native').View, props, children),
}));

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    SafeAreaView: ({ children, ...p }: React.PropsWithChildren<Record<string, unknown>>) =>
      ReactLib.createElement(View, p, children),
    SafeAreaProvider: ({ children }: React.PropsWithChildren) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language',
);
const TheerthDetailScreen = jest.requireActual<typeof import('../TheerthDetailScreen')>(
  '../TheerthDetailScreen',
).default;

type Props = React.ComponentProps<typeof TheerthDetailScreen>;

const navigation = { goBack: jest.fn(), navigate: jest.fn() } as unknown as Props['navigation'];

function render(templeId: string, lang: 'hi' | 'en') {
  const route = { key: 'd', name: 'TheerthDetail', params: { templeId } } as Props['route'];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <TheerthDetailScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  return tree
    .root.findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

test('renders sourced temple detail content in Hindi', () => {
  const text = render('somnath', 'hi');
  assert.match(text, /सोमनाथ/, 'temple name');
  assert.match(text, /शिव/, 'deity badge');
  assert.match(text, /सोमराज|चन्द्र/, 'Somnath story');
  assert.match(text, /स्रोत/, 'source label');
  assert.doesNotMatch(text, /RULEBOOK §11\.3/, 'placeholder should not render');
});

test('renders sourced statewise temple detail content in English', () => {
  const text = render('srinathji', 'en');
  assert.match(text, /Srinathji/);
  assert.match(text, /Nathdwara/);
  assert.match(text, /Govardhan|Pushtimarg/);
  assert.match(text, /Sources/);
  assert.doesNotMatch(text, /RULEBOOK §11\.3/);
});

test('renders Salasar Balaji extended sections after the origin story (Hindi)', () => {
  const text = render('salasar-balaji', 'hi');
  assert.match(text, /सालासर बालाजी/, 'temple name');
  assert.match(text, /हनुमान/, 'deity badge');
  assert.match(text, /मंदिर स्थापना कथा/, 'sthapana section label');
  assert.match(text, /मोहनदास/, 'sthapana katha body');
  assert.match(text, /सवामणी/, 'traditions section');
  assert.match(text, /मेले और उत्सव/, 'melas section label');
  assert.match(text, /अंजनी माता/, 'journey section body');
  assert.ok(text.indexOf('उद्भव कथा') < text.indexOf('मंदिर स्थापना कथा'), 'sections follow the origin story');
  assert.ok(text.indexOf('अंजनी माता') < text.indexOf('स्रोत'), 'sources footer stays last');
});

test('renders Salasar Balaji extended sections in English', () => {
  const text = render('salasar-balaji', 'en');
  assert.match(text, /Sthapana Katha/);
  assert.match(text, /1754 CE/);
  assert.match(text, /Savamani/);
  assert.match(text, /Chaitra Purnima/);
  assert.match(text, /Anjani Mata/);
  assert.match(text, /Sources/);
});

test('Salasar Balaji shows its commissioned sketch as an in-content illustration', () => {
  const route = { key: 'd', name: 'TheerthDetail', params: { templeId: 'salasar-balaji' } } as Props['route'];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <TheerthDetailScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  const frames = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'theerth-illustration');
  assert.equal(frames.length, 1, 'one illustration frame');
  assert.equal(frames[0].props.accessibilityLabel, 'सालासर बालाजी');
  const img = frames[0].findByType(Image);
  assert.equal(img.props.source, backgroundImages.theerth_salasar_balaji, 'frame shows the Salasar plate');
  assert.equal(tree.root.findAllByType(ImageBackground).length, 1, 'faded background layer still renders');
});

test('temples on a generic deity plate get no in-content illustration', () => {
  const route = { key: 'd', name: 'TheerthDetail', params: { templeId: 'somnath' } } as Props['route'];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <TheerthDetailScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  assert.equal(tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'theerth-illustration').length, 0);
});

const RAJASTHAN_WAVE: Array<{ id: string; hi: RegExp[]; en: RegExp[] }> = [
  { id: 'khatu-shyam', hi: [/खाटू श्याम/, /मंदिर स्थापना कथा/, /रूपसिंह चौहान/, /निशान यात्रा/, /रींगस/], en: [/Sthapana Katha/, /1027 CE/, /Nishan Yatra/, /Phalgun Mela/, /Ringas/] },
  { id: 'karni-mata', hi: [/करणी माता/, /मंदिर स्थापना कथा/, /सुवाप/, /काबा और कुलदेवी/, /देशनोक/], en: [/Sthapana Katha/, /1387/, /Kabas/, /Chaitra/, /Deshnoke/] },
  { id: 'jeen-mata', hi: [/जीण माता/, /मंदिर स्थापना कथा/, /काजल शिखर/, /धोक और झडूला/, /हर्ष पर्वत/], en: [/Sthapana Katha/, /972 CE/, /Jadula/, /Navami/, /Harsh hill/] },
  { id: 'gogaji-gogamedi', hi: [/गोगाजी/, /मंदिर स्थापना कथा/, /ददरेवा/, /छड़ी/, /गोरख टीला/], en: [/Sthapana Katha/, /1911 CE/, /Chhadi/, /Goga Navami/, /Gorakh Tila/] },
  { id: 'tejaji-kharnal', hi: [/तेजाजी/, /मंदिर स्थापना कथा/, /खरनाल/, /तांती/, /सुरसुरा/], en: [/Sthapana Katha/, /1074/, /Tanti/, /Teja Dashami/, /Sursura/] },
  { id: 'ramdevra', hi: [/रामदेव/, /मंदिर स्थापना कथा/, /उंडू-काश्मीर/, /कपड़े का घोड़ा/, /राम सरोवर/], en: [/Sthapana Katha/, /1352 CE/, /Cloth Horse/, /Bhadwa/, /Ram Sarovar/] },
  { id: 'khandoba-jejuri', hi: [/खंडोबा/, /मंदिर स्थापना कथा/, /राघो मंबाजी/, /भंडारा और येळकोट/, /कडेपठार/], en: [/Sthapana Katha/, /1637 CE/, /Bhandara and Yelkot/, /Champa Shashthi/, /Kadepathar/] },
  { id: 'mahasu-devta-hanol', hi: [/महासू/, /मंदिर स्थापना कथा/, /हूण भाट/, /महासू का न्याय-दरबार/, /ठडियार/], en: [/Sthapana Katha/, /Huna Bhat/, /The Court of Mahasu/, /Jagra/, /Thadiyar/] },
  { id: 'sabarimala', hi: [/अय्यप्पन/, /मंदिर स्थापना कथा/, /कण्डरारु शंकररु/, /व्रत, इरुमुडि और अठारह सीढ़ियाँ/, /निलक्कल/], en: [/Sthapana Katha/, /18 May 1951/, /Vratham, Irumudi and the Eighteen Steps/, /Makaravilakku/, /Nilakkal/] },
  { id: 'vetrimalai-murugan', hi: [/मुरुगन/, /मंदिर स्थापना कथा/, /रॉस द्वीप/, /कावडि और मुरुगन-व्रत/, /सेल्युलर जेल/], en: [/Sthapana Katha/, /1926 CE/, /Kavadi and Murugan Vows/, /Thai Poosam/, /Cellular Jail/] },
];

for (const temple of RAJASTHAN_WAVE) {
  test(`renders ${temple.id} extended sections after the origin story (Hindi)`, () => {
    const text = render(temple.id, 'hi');
    for (const re of temple.hi) assert.match(text, re);
    assert.ok(text.indexOf('उद्भव कथा') < text.indexOf('मंदिर स्थापना कथा'), 'sections follow the origin story');
    assert.ok(text.indexOf('यात्रा और आसपास') < text.indexOf('स्रोत'), 'sources footer stays last');
  });

  test(`renders ${temple.id} extended sections in English`, () => {
    const text = render(temple.id, 'en');
    for (const re of temple.en) assert.match(text, re);
    assert.match(text, /Journey and Around/);
    assert.match(text, /Sources/);
  });
}

// Picked from the data rather than hard-coded: the §12.6 rollout keeps
// converting bare rows into full readings, so naming one here would break the
// moment that temple is enriched.
const bareTemple = temples.find((t) => !t.sections?.length);

(bareTemple ? test : test.skip)(
  'temples without extended sections render only the two core sections',
  () => {
    const text = render(bareTemple!.id, 'en');
    assert.doesNotMatch(text, /Sthapana Katha/);
    assert.equal((text.match(/Significance/g) ?? []).length, 1);
    assert.equal((text.match(/Origin Story/g) ?? []).length, 1);
  },
);

// Blanket cover for the rollout: every temple that carries the five §12.6
// sections must actually render all five headings in both languages. This is
// what lets an enrichment wave add temples without touching this file.
describe('every enriched temple renders its full reading', () => {
  const enriched = temples.filter((t) => t.sections?.length);

  test.each(enriched.map((t) => [t.id] as const))('%s renders five sections in Hindi', (id) => {
    const text = render(id, 'hi');
    for (const section of getTempleDetailById(id)!.sections!) {
      assert.ok(
        text.includes(section.titleHi),
        `${id}: Hindi heading "${section.titleHi}" is missing from the detail screen`,
      );
    }
    assert.match(text, /स्रोत/);
  });

  test.each(enriched.map((t) => [t.id] as const))('%s renders five sections in English', (id) => {
    const text = render(id, 'en');
    for (const section of getTempleDetailById(id)!.sections!) {
      assert.ok(
        text.includes(section.titleEn),
        `${id}: English heading "${section.titleEn}" is missing from the detail screen`,
      );
    }
    assert.match(text, /Sources/);
  });
});

test('shows a not-found message for an unknown temple id', () => {
  const text = render('does-not-exist', 'en');
  assert.match(text, /not found/i);
});

test('renders Khatu Shyam as a Krishna lokdevta with sourced prose', () => {
  const text = render('khatu-shyam', 'en');
  assert.match(text, /Khatu Shyam/, 'temple name');
  assert.match(text, /KRISHNA/, 'deity badge maps the lokdevta to Krishna');
  assert.match(text, /Barbarika|Krishna|Shyam/, 'Khatu Shyam origin story');
  assert.match(text, /Sources/, 'sourced prose footer');
  assert.doesNotMatch(text, /RULEBOOK/, 'placeholder should not render');
});

test('Khatu Shyam uses its dedicated Theerth background plate', () => {
  const route = { key: 'd', name: 'TheerthDetail', params: { templeId: 'khatu-shyam' } } as Props['route'];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <TheerthDetailScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  const layers = tree.root.findAllByType(ImageBackground);
  assert.equal(layers.length, 1, 'detail screen renders one background layer');
  assert.equal(
    layers[0].props.source,
    getTheerthBackground('khatu-shyam', 'krishna'),
    'Khatu Shyam routes through the Theerth background override',
  );
  assert.equal(
    getTheerthBackground('khatu-shyam', 'krishna'),
    backgroundImages.theerth_khatu_shyam,
    'Khatu Shyam resolves to its dedicated Theerth background',
  );
});

test('renders the temple deity background (Somnath → Shiva)', () => {
  const route = { key: 'd', name: 'TheerthDetail', params: { templeId: 'somnath' } } as Props['route'];
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="en">
        <TheerthDetailScreen navigation={navigation} route={route} />
      </GitaLanguageProvider>,
    );
  });
  const layers = tree.root.findAllByType(ImageBackground);
  assert.equal(layers.length, 1, 'detail screen renders one deity background layer');
  assert.equal(
    layers[0].props.source,
    getDeityBackground('shiva'),
    'Somnath (Shiva temple) uses the Shiva deity background',
  );
});
