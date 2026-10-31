import { EXPLORE_SECTIONS, sectionForRoute } from '@/data/discovery/sections';
import { HOUR, initialExploreState, parseExploreState, pickExplore, recordDecline, recordShown, recordVisit } from '@/data/discovery/policy';
const start = new Date(2026, 9, 25, 8).getTime(), now = start + 48 * HOUR;
const fresh = () => initialExploreState(start);
it('silently collects first, removes visited sections and stops on exhaustion', () => {
    expect(pickExplore(fresh(), start)).toBeUndefined();
    expect(pickExplore(recordVisit(fresh(), 'routine'), now)?.id).toBe('japam');
    expect(pickExplore({ ...fresh(), visited: EXPLORE_SECTIONS.map(s => s.id) }, now)).toBeUndefined();
});
it('enforces six hours, two shows per local day and the midnight boundary', () => {
    const one = recordShown(fresh(), 'routine', now);
    expect(pickExplore(one, now + 6 * HOUR - 1)).toBeUndefined();
    expect(pickExplore(one, now + 6 * HOUR)?.id).toBe('japam');
    const two = recordShown(one, 'japam', now + 6 * HOUR);
    expect(pickExplore(two, now + 12 * HOUR)).toBeUndefined();
    expect(pickExplore(two, now + 24 * HOUR)).toBeDefined();
    const late = new Date(2026, 9, 27, 23).getTime();
    expect(pickExplore(recordShown(fresh(), 'routine', late), late + 90 * 60000)).toBeUndefined();
});
it('two consecutive declines pause seven days and sections rest fourteen', () => {
    const one = recordDecline(fresh(), 'routine', now);
    expect(pickExplore(one, now)?.id).toBe('japam');
    const two = recordDecline(one, 'japam', now + 6 * HOUR);
    expect(pickExplore(two, now + 7 * 24 * HOUR)).toBeUndefined();
    expect(pickExplore(two, now + 8 * 24 * HOUR)?.id).toBe('puja');
});
it('respects availability, opt-out and regressed clocks', () => {
    expect(pickExplore(fresh(), now, ['routine', 'japam'])?.id).toBe('puja');
    expect(pickExplore({ ...fresh(), enabled: false }, now)).toBeUndefined();
    expect(pickExplore(recordShown(fresh(), 'routine', now), now - HOUR)).toBeUndefined();
});
it('validates the ledger and recognizes every route into a section', () => {
    expect(() => parseExploreState('{bad', now)).toThrow();
    expect(() => parseExploreState(JSON.stringify({ ...fresh(), shown: ['bad'] }), now)).toThrow();
    expect(EXPLORE_SECTIONS).toHaveLength(16);
    for (const s of EXPLORE_SECTIONS)
        for (const r of s.routes)
            expect(sectionForRoute(r)).toBe(s.id);
    expect(sectionForRoute('CategoryList', { categoryId: 'japam' })).toBe('japam');
    expect(sectionForRoute('GharVastuCapture')).toBe('vastu');
    expect(recordVisit(recordVisit(fresh(), 'routine'), 'routine').visited).toEqual(['routine']);
});
