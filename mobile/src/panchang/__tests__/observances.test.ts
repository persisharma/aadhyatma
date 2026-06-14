import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getObservanceCatalog,
  KATHA_CATALOG,
  OBSERVANCE_RULES,
} from '../festivals';
import {
  getObservancesForDate,
  resolveObservancesForYearLive,
  searchObservances,
} from '../festivalEngine';
import {
  getKathaContent,
  KATHA_CONTENT,
} from '../kathaContent';

function idsFor(date: Date): string[] {
  return getObservancesForDate(date, 'purnimant').map((item) => item.rule.id);
}

test('source catalog captures default and advanced Drik Vrat list entries', () => {
  const defaultRules = getObservanceCatalog();
  const allRules = getObservanceCatalog({ includeHidden: true });

  assert.ok(defaultRules.some((rule) => rule.id === 'sankashti-chaturthi-vrat'));
  assert.ok(defaultRules.some((rule) => rule.id === 'pradosh-vrat-krishna'));
  assert.ok(defaultRules.some((rule) => rule.id === 'masik-shivaratri'));
  assert.ok(defaultRules.some((rule) => rule.id === 'sawan-somwar-vrat'));
  assert.ok(defaultRules.some((rule) => rule.id === 'mangala-gauri-vrat'));
  assert.ok(defaultRules.every((rule) => rule.visibility === 'default'));

  assert.ok(allRules.some((rule) => rule.id === 'mahadwadashi' && rule.visibility === 'advanced'));
  assert.ok(allRules.some((rule) => rule.id === 'karthigai-vrat' && rule.visibility === 'regional'));
  assert.ok(allRules.some((rule) => rule.id === 'iskcon-ekadashi' && rule.visibility === 'advanced'));
  assert.ok(allRules.length > defaultRules.length);
});

test('all surfaced observance rules have source metadata and stable rule types', () => {
  for (const rule of OBSERVANCE_RULES) {
    assert.ok(rule.sourceUrl?.startsWith('https://www.drikpanchang.com/'), `${rule.id} missing sourceUrl`);
    assert.ok(rule.ruleType, `${rule.id} missing ruleType`);
    assert.ok(['festival', 'vrat', 'upavas', 'katha', 'regional'].includes(rule.category), `${rule.id} category`);
    assert.ok(['default', 'advanced', 'regional'].includes(rule.visibility), `${rule.id} visibility`);
  }
});

test('Vrat Katha catalog is linked to internal bilingual content without copied source bodies', () => {
  const satyanarayana = KATHA_CATALOG.find((item) => item.id === 'satyanarayana-vrat-katha');
  const pradosha = KATHA_CATALOG.find((item) => item.id === 'pradosha-vrat-katha');
  const mangalaGauri = KATHA_CATALOG.find((item) => item.id === 'mangala-gauri-vrat-katha');

  assert.ok(satyanarayana);
  assert.ok(pradosha);
  assert.ok(mangalaGauri);
  assert.equal('body' in satyanarayana, false);
  assert.equal(satyanarayana.contentStatus, 'original-content-ready');
  assert.equal(satyanarayana.languageAvailability, 'bilingual');
  assert.ok(satyanarayana.sourceUrl.includes('/vrat-katha/'));
  assert.ok(getKathaContent('satyanarayana-vrat-katha'));
});

test('Vrat Katha metadata has no dangling IDs', () => {
  const ruleIds = new Set(OBSERVANCE_RULES.map((rule) => rule.id));
  const kathaIds = new Set(KATHA_CATALOG.map((item) => item.id));
  const contentIds = new Set(KATHA_CONTENT.map((item) => item.id));

  assert.equal(kathaIds.size, KATHA_CATALOG.length, 'duplicate katha ids');
  assert.equal(contentIds.size, KATHA_CONTENT.length, 'duplicate katha content ids');

  for (const item of KATHA_CATALOG) {
    assert.ok(item.sourceUrl.startsWith('https://www.drikpanchang.com/'), `${item.id} sourceUrl`);
    assert.ok(item.sourceAttribution.length > 0, `${item.id} source attribution`);
    assert.ok(item.summaryHi.length > 0, `${item.id} Hindi summary`);
    assert.ok(item.summaryEn.length > 0, `${item.id} English summary`);
    assert.ok(['vrat-katha', 'festival-legend', 'mahatmya'].includes(item.kind), `${item.id} kind`);
    assert.equal(item.contentStatus, 'original-content-ready', `${item.id} content status`);
    assert.equal(item.languageAvailability, 'bilingual', `${item.id} language availability`);
    assert.ok(contentIds.has(item.id), `${item.id} missing internal katha content`);
    assert.ok(item.relatedRuleIds.length > 0, `${item.id} related rules`);

    for (const ruleId of item.relatedRuleIds) {
      assert.ok(ruleIds.has(ruleId), `${item.id} references missing rule ${ruleId}`);
    }
  }

  for (const rule of OBSERVANCE_RULES) {
    if (!rule.kathaId) continue;
    assert.ok(kathaIds.has(rule.kathaId), `${rule.id} references missing katha ${rule.kathaId}`);
  }

  for (const item of KATHA_CONTENT) {
    assert.ok(kathaIds.has(item.id), `${item.id} content has no catalog entry`);
    assert.equal(item.contentStatus, 'original-content-ready', `${item.id} content status`);
    assert.equal(item.languageAvailability, 'bilingual', `${item.id} language availability`);
    assert.ok(item.sections.length >= 2, `${item.id} should include story and meaning sections`);
    for (const section of item.sections) {
      assert.ok(section.titleHi.length > 0, `${item.id}/${section.id} titleHi`);
      assert.ok(section.titleEn.length > 0, `${item.id}/${section.id} titleEn`);
      assert.ok(section.bodyHi.every((paragraph) => paragraph.length > 0), `${item.id}/${section.id} bodyHi`);
      assert.ok(section.bodyEn.every((paragraph) => paragraph.length > 0), `${item.id}/${section.id} bodyEn`);
    }
  }
});

test('default-visible katha content uses full bilingual episode retellings', () => {
  const visibleKathaIds = new Set(
    OBSERVANCE_RULES
      .filter((rule) => rule.visibility === 'default' && rule.kathaId)
      .map((rule) => rule.kathaId as string)
  );

  assert.ok(visibleKathaIds.size > 0, 'expected default-visible rules to expose kathas');

  for (const id of visibleKathaIds) {
    const item = getKathaContent(id);
    assert.ok(item, `${id} missing katha content`);
    assert.ok(item.sections.length >= 4, `${id} should be structured into readable episodes`);
    assert.equal(
      item.sections.some((section) => section.id === 'katha' || section.id === 'mahatva'),
      false,
      `${id} should not use summary-only placeholder sections`
    );
    assert.equal(
      item.sections.some((section) => /summary/i.test(section.titleEn) || section.titleHi.includes('सार')),
      false,
      `${id} should not label full content as a summary`
    );

    const paragraphCountHi = item.sections.reduce((total, section) => total + section.bodyHi.length, 0);
    const paragraphCountEn = item.sections.reduce((total, section) => total + section.bodyEn.length, 0);
    const totalHiLength = item.sections.flatMap((section) => section.bodyHi).join('').length;
    const totalEnLength = item.sections.flatMap((section) => section.bodyEn).join('').length;

    assert.ok(paragraphCountHi >= 6, `${id} should include multiple Hindi paragraphs`);
    assert.ok(paragraphCountEn >= 6, `${id} should include multiple English paragraphs`);
    assert.ok(totalHiLength >= 900, `${id} Hindi retelling is too short for full-story content`);
    assert.ok(totalEnLength >= 1100, `${id} English retelling is too short for full-story content`);
  }
});

test('source-backed Satyanarayana content follows the full five-adhyay story structure', () => {
  const item = getKathaContent('satyanarayana-vrat-katha');

  assert.ok(item, 'Satyanarayana katha content should exist');
  assert.ok(item.sourceUrls && item.sourceUrls.length >= 5, 'Satyanarayana should keep chapter-level source URLs');
  assert.ok(
    item.sourceUrls.every((url) => url.startsWith('https://www.drikpanchang.com/vrat-katha/satyanarayana/chapters/')),
    'Satyanarayana source URLs should point to verified chapter pages'
  );
  assert.deepEqual(
    item.sections.map((section) => section.id),
    ['adhyay-1', 'adhyay-2', 'adhyay-3', 'adhyay-4', 'adhyay-5'],
    'Satyanarayana should follow the five adhyay structure'
  );

  const paragraphCountHi = item.sections.reduce((total, section) => total + section.bodyHi.length, 0);
  const paragraphCountEn = item.sections.reduce((total, section) => total + section.bodyEn.length, 0);
  const totalHiLength = item.sections.flatMap((section) => section.bodyHi).join('').length;
  const totalEnLength = item.sections.flatMap((section) => section.bodyEn).join('').length;

  assert.ok(paragraphCountHi >= 20, 'Satyanarayana Hindi story should read as a full katha, not a summary');
  assert.ok(paragraphCountEn >= 20, 'Satyanarayana English story should read as a full katha, not a summary');
  assert.ok(totalHiLength >= 4200, 'Satyanarayana Hindi retelling is too short for five adhyays');
  assert.ok(totalEnLength >= 5200, 'Satyanarayana English retelling is too short for five adhyays');
});

test('source-backed seasonal family kathas are full narratives, not compact summaries', () => {
  for (const id of ['karwa-chauth-vrat-katha', 'ahoi-ashtami-vrat-katha']) {
    const item = getKathaContent(id);
    assert.ok(item, `${id} content should exist`);
    assert.ok(item.sourceUrls && item.sourceUrls.length > 0, `${id} should keep verified source URLs`);
    assert.ok(
      item.sourceUrls.every((url) => url.startsWith('https://www.drikpanchang.com/')),
      `${id} source URLs should point to verified source pages`
    );
    assert.ok(item.sections.length >= 5, `${id} should have story episodes before observance meaning`);

    const paragraphCountHi = item.sections.reduce((total, section) => total + section.bodyHi.length, 0);
    const paragraphCountEn = item.sections.reduce((total, section) => total + section.bodyEn.length, 0);
    const totalHiLength = item.sections.flatMap((section) => section.bodyHi).join('').length;
    const totalEnLength = item.sections.flatMap((section) => section.bodyEn).join('').length;

    assert.ok(paragraphCountHi >= 15, `${id} Hindi story should not read like a summary`);
    assert.ok(paragraphCountEn >= 15, `${id} English story should not read like a summary`);
    assert.ok(totalHiLength >= 3000, `${id} Hindi retelling needs fuller source-backed detail`);
    assert.ok(totalEnLength >= 3600, `${id} English retelling needs fuller source-backed detail`);
  }
});

test('source-backed Ganesha Chaturthi content follows the Syamantaka and moon-curse episodes', () => {
  const item = getKathaContent('ganesha-chaturthi-vrat-katha');

  assert.ok(item, 'Ganesha Chaturthi katha content should exist');
  assert.ok(item.sourceUrls && item.sourceUrls.length >= 2, 'Ganesha Chaturthi should keep verified source URLs');
  assert.ok(
    item.sourceUrls.every((url) => url.startsWith('https://www.drikpanchang.com/vrat-katha/ganesha-chaturthi/')),
    'Ganesha Chaturthi source URLs should point to verified Ganesha Chaturthi source pages'
  );
  assert.deepEqual(
    item.sections.map((section) => section.id),
    [
      'vow-and-question',
      'satrajit-and-syamantaka',
      'krishna-clears-blame',
      'second-accusation',
      'moon-curse-origin',
      'chandra-seeks-forgiveness',
      'krishna-observes-vow',
    ],
    'Ganesha Chaturthi should follow the full Syamantaka and moon-curse episode sequence'
  );

  const paragraphCountHi = item.sections.reduce((total, section) => total + section.bodyHi.length, 0);
  const paragraphCountEn = item.sections.reduce((total, section) => total + section.bodyEn.length, 0);
  const totalHiLength = item.sections.flatMap((section) => section.bodyHi).join('').length;
  const totalEnLength = item.sections.flatMap((section) => section.bodyEn).join('').length;

  assert.ok(paragraphCountHi >= 21, 'Ganesha Chaturthi Hindi story should not read like a summary');
  assert.ok(paragraphCountEn >= 21, 'Ganesha Chaturthi English story should not read like a summary');
  assert.ok(totalHiLength >= 4200, 'Ganesha Chaturthi Hindi retelling needs fuller source-backed detail');
  assert.ok(totalEnLength >= 5200, 'Ganesha Chaturthi English retelling needs fuller source-backed detail');
});

test('source-backed Sankashti content uses monthly katha episodes', () => {
  const item = getKathaContent('sankashti-chaturthi-vrat-katha');

  assert.ok(item, 'Sankashti Chaturthi katha content should exist');
  assert.ok(item.sourceUrls && item.sourceUrls.length >= 6, 'Sankashti should keep collection and monthly source URLs');
  assert.ok(
    item.sourceUrls.every((url) => url.startsWith('https://www.drikpanchang.com/vrat-katha/sankashti/')),
    'Sankashti source URLs should point to verified Sankashti source pages'
  );
  assert.deepEqual(
    item.sections.map((section) => section.id),
    ['monthly-cycle', 'bhalachandra', 'vikata', 'ganadhipa', 'lambodara', 'heramba'],
    'Sankashti should be structured as a monthly katha sangrah'
  );

  const paragraphCountHi = item.sections.reduce((total, section) => total + section.bodyHi.length, 0);
  const paragraphCountEn = item.sections.reduce((total, section) => total + section.bodyEn.length, 0);
  const totalHiLength = item.sections.flatMap((section) => section.bodyHi).join('').length;
  const totalEnLength = item.sections.flatMap((section) => section.bodyEn).join('').length;

  assert.ok(paragraphCountHi >= 18, 'Sankashti Hindi story should not read like a summary');
  assert.ok(paragraphCountEn >= 18, 'Sankashti English story should not read like a summary');
  assert.ok(totalHiLength >= 3800, 'Sankashti Hindi retelling needs fuller source-backed detail');
  assert.ok(totalEnLength >= 4600, 'Sankashti English retelling needs fuller source-backed detail');
});

test('source-backed Pradosha content covers the weekday katha variants', () => {
  const item = getKathaContent('pradosha-vrat-katha');

  assert.ok(item, 'Pradosha katha content should exist');
  assert.ok(item.sourceUrls && item.sourceUrls.length >= 8, 'Pradosha should keep collection and weekday source URLs');
  assert.ok(
    item.sourceUrls.every((url) => url.startsWith('https://www.drikpanchang.com/vrat-katha/pradosha/')),
    'Pradosha source URLs should point to verified Pradosha source pages'
  );
  assert.deepEqual(
    item.sections.map((section) => section.id),
    ['ravi', 'soma', 'bhauma', 'budha', 'brihaspati', 'shukra', 'shani', 'pradosha-message'],
    'Pradosha should preserve the seven weekday katha structure'
  );

  const paragraphCountHi = item.sections.reduce((total, section) => total + section.bodyHi.length, 0);
  const paragraphCountEn = item.sections.reduce((total, section) => total + section.bodyEn.length, 0);
  const totalHiLength = item.sections.flatMap((section) => section.bodyHi).join('').length;
  const totalEnLength = item.sections.flatMap((section) => section.bodyEn).join('').length;

  assert.ok(paragraphCountHi >= 16, 'Pradosha Hindi story should not read like a summary');
  assert.ok(paragraphCountEn >= 16, 'Pradosha English story should not read like a summary');
  assert.ok(totalHiLength >= 4200, 'Pradosha Hindi retelling needs fuller source-backed detail');
  assert.ok(totalEnLength >= 5200, 'Pradosha English retelling needs fuller source-backed detail');
});

test('recurring tithi vrats resolve month by month for future years', () => {
  const observances = resolveObservancesForYearLive(2027, 'purnimant');
  const sankashti = observances.filter((item) => item.rule.id === 'sankashti-chaturthi-vrat');
  const pradosh = observances.filter((item) => item.rule.id.startsWith('pradosh-vrat-'));
  const purnima = observances.filter((item) => item.rule.id === 'purnima-vrat');

  assert.ok(sankashti.length >= 11, `expected monthly Sankashti, got ${sankashti.length}`);
  assert.ok(pradosh.length >= 22, `expected fortnightly Pradosh, got ${pradosh.length}`);
  assert.ok(purnima.length >= 11, `expected monthly Purnima Vrat, got ${purnima.length}`);
  assert.ok(pradosh.every((item) => item.rule.kathaId === 'pradosha-vrat-katha'));
});

test('non-January Sankranti dates are generated from solar ingress rules', () => {
  const ids = idsFor(new Date(2026, 1, 14));

  assert.ok(ids.includes('kumbha-sankranti'), `expected Kumbha Sankranti on 2026-02-14, got ${ids.join(', ')}`);
});

test('weekday-in-lunar-month vrats are generated without annual crawling', () => {
  const observances = resolveObservancesForYearLive(2028, 'purnimant');
  const sawanSomwar = observances.filter((item) => item.rule.id === 'sawan-somwar-vrat');
  const mangalaGauri = observances.filter((item) => item.rule.id === 'mangala-gauri-vrat');

  assert.ok(sawanSomwar.length >= 3, `expected Sawan Mondays, got ${sawanSomwar.length}`);
  assert.ok(mangalaGauri.length >= 3, `expected Mangala Gauri Tuesdays, got ${mangalaGauri.length}`);
  assert.ok(sawanSomwar.every((item) => item.date.getDay() === 1));
  assert.ok(mangalaGauri.every((item) => item.date.getDay() === 2));
});

test('search returns default observances and can include hidden captured catalog entries', () => {
  const visible = searchObservances('satyanarayana');
  const hidden = searchObservances('mahadwadashi', { includeHidden: true });

  assert.ok(visible.some((rule) => rule.id === 'shree-satyanarayan-vrat'));
  assert.ok(visible.some((rule) => rule.kathaId === 'satyanarayana-vrat-katha'));
  assert.equal(searchObservances('mahadwadashi').length, 0);
  assert.ok(hidden.some((rule) => rule.id === 'mahadwadashi'));
});
