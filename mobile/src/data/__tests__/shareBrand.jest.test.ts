import {
  BRAND_CONTACT_LIMIT,
  BRAND_NAME_LIMIT,
  brandTextLang,
  parseShareBrand,
  resolveShareBrand,
  shareBrandTextLine,
} from '../shareBrand';

const brand = (p: Partial<{ on: boolean; name: string; title: string; contact: string }>) =>
  parseShareBrand(JSON.stringify({ on: true, name: '', title: '', contact: '', ...p }));

describe('Panchang co-branding fallbacks (design.md §33a)', () => {
  it('off or nameless prints the plain card', () => {
    expect(resolveShareBrand(brand({ on: false, name: 'पं. रमेश शर्मा' }))).toBeNull();
    expect(resolveShareBrand(brand({ name: '   ' }))).toBeNull();
    // A title or contact without a name is ignored, and the switch cannot stay on.
    const nameless = brand({ title: 'ज्योतिषाचार्य', contact: '98290 12345' });
    expect(nameless.on).toBe(false);
    expect(resolveShareBrand(nameless)).toBeNull();
  });

  it('a name alone resolves with no title · contact line', () => {
    expect(resolveShareBrand(brand({ name: '  पं.  रमेश   शर्मा ' }))).toEqual({ name: 'पं. रमेश शर्मा', line: null });
  });

  it('title and/or contact follow the name on the footer line', () => {
    expect(resolveShareBrand(brand({ name: 'पं. रमेश', title: 'ज्योतिषाचार्य' }))?.line).toBe('ज्योतिषाचार्य');
    expect(resolveShareBrand(brand({ name: 'पं. रमेश', contact: '98290 12345' }))?.line).toBe('98290 12345');
    expect(resolveShareBrand(brand({ name: 'पं. रमेश', title: 'ज्योतिषाचार्य', contact: '98290 12345' }))?.line)
      .toBe('ज्योतिषाचार्य · 98290 12345');
  });

  it('never adds an honorific and keeps the typed script', () => {
    expect(resolveShareBrand(brand({ name: 'Ramesh Sharma' }))?.name).toBe('Ramesh Sharma');
    expect(resolveShareBrand(brand({ name: 'રમેશ શર્મા' }))?.name).toBe('રમેશ શર્મા');
  });

  it('clamps stored values and survives corrupt storage', () => {
    const long = brand({ name: 'क'.repeat(80), contact: '9'.repeat(80) });
    expect(long.name).toHaveLength(BRAND_NAME_LIMIT);
    expect(long.contact).toHaveLength(BRAND_CONTACT_LIMIT);
    expect(parseShareBrand('{not json')).toEqual({ on: false, name: '', title: '', contact: '' });
    expect(parseShareBrand(null).on).toBe(false);
    expect(parseShareBrand(JSON.stringify({ on: 'yes', name: 7 }))).toEqual({ on: false, name: '', title: '', contact: '' });
  });

  it('draws each typed script in a face that has it', () => {
    expect(brandTextLang('पं. रमेश')).toBe('hi');
    expect(brandTextLang('રમેશ')).toBe('gu');
    expect(brandTextLang('ರಮೇಶ')).toBe('kn');
    expect(brandTextLang('Pt. Ramesh')).toBe('en');
  });

  it('the footer line and Send as text print the same profile', () => {
    expect(shareBrandTextLine(null)).toBeNull();
    expect(shareBrandTextLine({ name: 'पं. रमेश', line: null })).toBe('पं. रमेश');
    expect(shareBrandTextLine({ name: 'पं. रमेश', line: 'ज्योतिषाचार्य' })).toBe('पं. रमेश · ज्योतिषाचार्य');
    expect(shareBrandTextLine(resolveShareBrand(brand({ name: 'पं. रमेश', title: 'ज्योतिषाचार्य', contact: '98290 12345' }))))
      .toBe('पं. रमेश · ज्योतिषाचार्य · 98290 12345');
  });
});
