import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { missingObservancePortraits, observancePortraits, observanceSubjects } from '@/panchang/observancePortraits';
import { artworkRequest } from '@/data/artworkAsset';

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

test('reused paintings resolve through their existing published cache manifests', () => {
  const ahoi = observancePortraits({ deityEn: 'Ahoi Mata' })[0].source;
  const siddhidatri = observancePortraits({ deityEn: 'Maa Siddhidatri' })[0].source;
  expect(artworkRequest(ahoi)?.remoteUrl).toContain('/devotional-share/');
  expect(artworkRequest(siddhidatri)?.remoteUrl).toContain('/kids-stories/');
  for (const subject of Object.keys(observanceSubjects)) {
    for (const portrait of observancePortraits({ deityEn: subject })) {
      // RN's Jest asset transformer returns an opaque object instead of the
      // numeric native asset handle; only descriptors have a manifest kind.
      if (typeof portrait.source === 'object' && 'kind' in portrait.source) {
        expect(artworkRequest(portrait.source)).not.toBeNull();
      }
    }
  }
});
