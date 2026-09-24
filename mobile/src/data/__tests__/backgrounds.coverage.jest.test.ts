// Jest suite (note the `.jest.test.ts` suffix — see jest.config.js). This must
// run under Jest, not tsx: it transitively require()s the background PNGs via
// @/data/backgrounds, which plain `tsx --test` can't parse but Jest's
// react-native preset stubs as asset modules.
//
// Coverage contract: every active, user-reachable surface (category tile, deity
// tile, library source + reader, aarti, japa mantra) must resolve to a
// background image — getSourceBackground returns null when a source id is
// unmapped, so a missing mapping fails the assertion. Guards new content shipping
// without its background art.
import { aartiIdByIndex } from '@/data/aarti';
import { backgroundImages } from '@assets/backgrounds';
import {
  getCategoryBackground,
  getDeityBackground,
  getReaderBackground,
  getSourceBackground,
  getTheerthBackground,
} from '@/data/backgrounds';
import { categories } from '@/data/categories';
import { deities } from '@/data/deities';
import { japamMantras } from '@/data/japam';
import { library } from '@/data/texts';
import { getTempleById } from '@/data/theerth/temples';

const dedicatedTheerthBackgroundIds = [
  'khatu-shyam',
  'vetrimalai-murugan',
  'sabarimala',
  'gogaji-gogamedi',
  'tejaji-kharnal',
  'khandoba-jejuri',
  'mahasu-devta-hanol',
  'ramdevra',
  'salasar-balaji',
  'karni-mata',
  'jeen-mata',
] as const;

describe('background coverage', () => {
  test('every active category tile has a background', () => {
    for (const category of categories.filter((item) => item.status === 'active')) {
      expect(getCategoryBackground(category.id)).toBeTruthy();
    }
  });

  test('every deity tile has a background', () => {
    for (const deity of deities) {
      expect(getDeityBackground(deity.id)).toBeTruthy();
    }
  });

  test('deities with existing dedicated art use their semantic background', () => {
    expect(getDeityBackground('vishnu')).toBe(backgroundImages.source_vishnu_narayana);
    expect(getDeityBackground('savitr')).toBe(backgroundImages.source_gayatri_savitri_sun);
    expect(getDeityBackground('kartikeya')).toBe(backgroundImages.theerth_vetrimalai_murugan);
  });

  test.each([
    ['lakshmi', 'deity_lakshmi'],
    ['surya', 'deity_surya'],
    ['radha', 'deity_radha_krishna'],
    ['kubera', 'deity_kubera'],
    ['ganga', 'deity_ganga'],
    ['parvati', 'deity_parvati_bhavani'],
    ['narasimha', 'deity_narasimha_prahlad'],
    ['dattatreya', 'deity_dattatreya'],
    ['shani', 'deity_shani'],
    ['kali', 'deity_kali'],
    ['navagraha', 'deity_navagraha_icons'],
  ] as const)('%s uses its dedicated commissioned background', (deityId, assetKey) => {
    expect(getDeityBackground(deityId)).toBe(backgroundImages[assetKey]);
  });

  test('Kavacham uses its dedicated protection background', () => {
    expect(getCategoryBackground('kavacham')).toBe(
      backgroundImages.category_kavacham_protection,
    );
  });

  test('Konark Sun Temple resolves to the dedicated Surya background', () => {
    const temple = getTempleById('konark-sun');
    expect(temple?.deity).toBe('surya');
    expect(getTheerthBackground('konark-sun', temple!.deity)).toBe(
      backgroundImages.deity_surya,
    );
  });

  test.each([
    ['mahalakshmi-ashtakam', 'deity_lakshmi'],
    ['surya-ashtakam', 'deity_surya'],
    ['radhashtakam', 'deity_radha_krishna'],
    ['kubera-stotram', 'deity_kubera'],
    ['gangashtakam', 'deity_ganga'],
    ['bhavani-ashtakam', 'deity_parvati_bhavani'],
    ['narasimha-ashtakam', 'deity_narasimha_prahlad'],
    ['datta-ashtakam', 'deity_dattatreya'],
    ['shani-ashtakam', 'deity_shani'],
    ['kalika-ashtakam', 'deity_kali'],
    ['navagraha-stotram', 'deity_navagraha_icons'],
  ] as const)('%s uses its commissioned reader background', (sourceId, assetKey) => {
    expect(getSourceBackground(sourceId)).toBe(backgroundImages[assetKey]);
    expect(getReaderBackground(sourceId)).toBe(backgroundImages[assetKey]);
  });

  test('Subrahmanya Ashtakam uses the existing Murugan background', () => {
    expect(getSourceBackground('subrahmanya-ashtakam')).toBe(
      backgroundImages.theerth_vetrimalai_murugan,
    );
    expect(getReaderBackground('subrahmanya-ashtakam')).toBe(
      backgroundImages.theerth_vetrimalai_murugan,
    );
  });

  test('every active, non-hidden library source has a source + reader background', () => {
    // Theerth entries open a map + per-temple detail, not a verse reader, so they
    // are exempt from the source/reader background contract (mirrors the
    // exemption in backgrounds.ts assertBackgroundCoverage).
    for (const entry of library.filter(
      (item) => item.status === 'active' && !item.hidden && item.category !== 'theerth',
    )) {
      expect(getSourceBackground(entry.id)).toBeTruthy();
      expect(getReaderBackground(entry.id, { id: 'coverage', stanza: 1 })).toBeTruthy();
    }
  });

  test('every aarti has a source background', () => {
    for (const aartiId of aartiIdByIndex) {
      expect(getSourceBackground(aartiId)).toBeTruthy();
    }
  });

  test('every japa mantra has a source background', () => {
    for (const mantra of japamMantras) {
      expect(getSourceBackground(mantra.id)).toBeTruthy();
    }
  });

  test('dedicated Theerth backgrounds are wired for commissioned shrine plates', () => {
    for (const templeId of dedicatedTheerthBackgroundIds) {
      const temple = getTempleById(templeId);
      expect(temple).toBeTruthy();
      expect(getTheerthBackground(templeId, temple!.deity)).toBeTruthy();
      expect(getTheerthBackground(templeId, temple!.deity)).not.toBe(getDeityBackground(temple!.deity));
    }
  });
});
