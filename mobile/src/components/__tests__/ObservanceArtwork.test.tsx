import { observanceThumbnail } from '@/panchang/observanceThumbnails';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { missingObservancePortraits, observancePortraits, observanceSubjects, observanceIllustrations } from '@/panchang/observancePortraits';

test('every default-visible calendar subject has an explicit artwork decision', () => {
  const missing = [...new Set(OBSERVANCE_RULES.filter(rule => rule.visibility === 'default')
    .map(rule => rule.deityEn))].filter(subject => !(subject in observanceSubjects));
  expect(missing).toEqual([]);
  expect(missingObservancePortraits()).toEqual([]);
});

test('named forms get their own portraits and composites retain every named person', () => {
  const get = (deityEn: string) => observancePortraits({ deityEn });
  expect(get('Maa Gauri')[0].source).toEqual({ kind: 'reader-illustration', stem: 'deity-parvati-bhavani' });
  expect(get('Shri Ganesh')[0].source).toEqual({ kind: 'reader-illustration', stem: 'deity-ganesha-modak' });
  expect(get('Bhagwan Mahesh')).toEqual(get('Lord Shiva'));
  expect(get('Sita Ram')).toEqual([...get('Maa Sita'), ...get('Shri Ram')]);
  expect(get('Lord Murugan and Shiva–Parvati')).toEqual([...get('Lord Murugan'), ...get('Lord Shiva'), ...get('Maa Parvati')]);
  expect(observanceSubjects['Kala Bhairava']).toEqual(['bhairava']);
  expect(observanceSubjects['Maharishi Valmiki']).toEqual(['valmiki']);
  expect(get('Guru Parampara')).toEqual([]);
  expect(get('Unknown')).toEqual([]);
});

test('every rule has a painted calendar illustration, including tradition-only entries', () => {
  for (const rule of OBSERVANCE_RULES) {
    expect(observanceIllustrations(rule).length).toBeGreaterThan(0);
    for (const art of observanceIllustrations(rule)) {
      expect(art.frame.zoom).toBe(1);
      expect(art.frame.aspect).toBeGreaterThan(0);
    }
  }
});

test('event scenes override generic deity art without replacing other Gauri observances', () => {
  const karwa = { id: 'karwa-chauth', deityEn: 'Maa Gauri' };
  expect(observanceIllustrations(karwa)[0].source).not.toEqual(observancePortraits(karwa)[0].source);
  expect(observanceIllustrations(karwa, 'upcoming')[0].source).not.toEqual(observanceIllustrations(karwa, 'list')[0].source);
  expect(observanceIllustrations({ id: 'gauri-vrat', deityEn: 'Maa Gauri' })[0].source).toEqual(observancePortraits(karwa)[0].source);
  expect(observanceIllustrations({ id: 'masik-krishna-janmashtami', deityEn: 'Shri Krishna' })[0].source).not.toEqual(observancePortraits({ deityEn: 'Shri Krishna' })[0].source);
  expect(observanceIllustrations({ deityEn: 'Sita Ram' })[0].source).toEqual({ kind: 'reader-illustration', stem: 'deity-rama-darbar' });
});


test('every registered illustration has an immediate bundled painting', () => {
  for (const rule of OBSERVANCE_RULES) {
    for (const art of observanceIllustrations(rule)) {
      const source = observanceThumbnail(art.source);
      // RN assets are numbers on device, opaque objects under the Jest transformer.
      expect(source).toBeDefined();
      expect(typeof source === 'object' && source !== null && 'kind' in source).toBe(false);
    }
  }
});
