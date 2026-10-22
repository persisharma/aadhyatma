// Shared by the local collector and optional Cloudflare Pages adapter.
export const VERSION = 'compact-v3';
export const RETENTION_MS = 30 * 86400000;
const names = new Set(['page_view', 'click', 'section_view', 'button_view', 'offering_open', 'preview_start', 'preview_complete', 'install_prompt', 'store_click', 'smart_download_click', 'search_used']);
const slug = value => typeof value === 'string' && /^[a-z0-9][a-z0-9_.:-]{0,99}$/.test(value) ? value : '';
export function normalizeBatch(input, now = Date.now()) {
  if (!Array.isArray(input) || input.length > 50) throw new Error('Expected up to 50 events');
  return input.map(e => {
    if (!e || !names.has(e.name) || !/^[a-f0-9-]{20,50}$/.test(e.id || '') || !/^[a-f0-9-]{20,50}$/.test(e.visit || '') || e.version !== VERSION) throw new Error('Invalid event');
    return { id: e.id, visit: e.visit, name: e.name, version: VERSION, ts: now, sequence: Number.isSafeInteger(e.sequence) && e.sequence >= 0 && e.sequence < 10000000 ? e.sequence : 0,
      page: e.page === '/hi/' ? '/hi/' : '/', language: e.language === 'hi' ? 'hi' : 'en',
      device: ['mobile', 'tablet', 'desktop'].includes(e.device) ? e.device : 'desktop',
      target: slug(e.target), section: slug(e.section), source: slug(e.source), feature: slug(e.feature),
      platform: ['ios', 'android', 'smart'].includes(e.platform) ? e.platform : '',
      campaign: slug(e.campaign) || 'direct' };
  });
}
export function summarize(all, filters = {}, now = Date.now()) {
  const days = [1, 7, 30].includes(Number(filters.days)) ? Number(filters.days) : 7;
  const events = all.filter(e => e.version === VERSION && e.ts >= now - days * 86400000 &&
    (!filters.device || filters.device === 'all' || e.device === filters.device) &&
    (!filters.language || filters.language === 'all' || e.language === filters.language));
  const unique = list => new Set(list.map(e => e.visit)).size;
  const views = events.filter(e => e.name === 'page_view');
  const clicks = events.filter(e => e.name === 'click');
  const store = events.filter(e => ['store_click', 'smart_download_click'].includes(e.name));
  const prompts = events.filter(e => e.name === 'install_prompt');
  const placements = new Map();
  for (const e of events.filter(e => ['click','button_view'].includes(e.name))) {
    const key = `${e.section}/${e.target}`;
    if (!placements.has(key)) placements.set(key, { section: e.section, target: e.target, views: new Set(), clicked: new Set(), clicks: 0 });
    const p = placements.get(key);
    if(e.name === 'button_view') p.views.add(e.visit);
    else { p.clicks++; p.clicked.add(e.visit); }
  }
  const sections = [...new Set(events.map(e => e.section).filter(Boolean))].map(section => ({
    section, views: unique(events.filter(e => e.section === section && ['section_view','button_view'].includes(e.name))),
    clicks: clicks.filter(e => e.section === section).length,
    storeClicks: store.filter(e => e.source === section).length
  })).sort((a,b) => b.clicks - a.clicks);
  const journeys = new Map(), paths = new Map();
  for (const e of events) {
    if (!journeys.has(e.visit)) journeys.set(e.visit, []);
    journeys.get(e.visit).push(e);
  }
  for (const journey of journeys.values()) {
    const path = [];
    journey.sort((a,b) => a.sequence && b.sequence ? a.sequence-b.sequence : a.ts-b.ts);
    for (const e of journey) {
      if (e.name === 'click' && path.at(-1) !== `${e.section}:${e.target}`) path.push(`${e.section}:${e.target}`);
      if (['store_click','smart_download_click'].includes(e.name)) {
        const key = [...path.slice(-4), `store:${e.platform || 'smart'}`].join(' → ');
        paths.set(key, (paths.get(key) || 0) + 1);
      }
    }
  }
  // Campaigns: landing utm_source per visit; older events without one count as direct.
  const campaignOf = e => e.campaign || 'direct';
  const campaigns = [...new Set(events.map(campaignOf))].map(c => { const ev = events.filter(e => campaignOf(e) === c); return {
    campaign: c, visits: unique(ev.filter(e => e.name === 'page_view')), previews: unique(ev.filter(e => ['offering_open','preview_start'].includes(e.name))),
    installPrompts: unique(ev.filter(e => e.name === 'install_prompt')), storeClicks: ev.filter(e => ['store_click','smart_download_click'].includes(e.name)).length }; })
    .sort((a,b) => b.visits - a.visits || b.storeClicks - a.storeClicks);
  const sources = [...new Set(store.map(e => e.source))].map(source => ({ source: source || 'unspecified', clicks: store.filter(e => e.source === source).length } )).sort((a,b) => b.clicks - a.clicks);
  return { version: VERSION, days, generatedAt: new Date(now).toISOString(), metrics: {
    visits: unique(views), clicks: clicks.length, previews: unique(events.filter(e => e.name === 'offering_open' || e.name === 'preview_start')),
    installPrompts: unique(prompts), storeClicks: store.length, storeVisitors: unique(store)
  }, placements: [...placements.values()].map(p => {
    const exposedClicks = [...p.clicked].filter(id => p.views.has(id)).length;
    return { section: p.section, target: p.target, views: p.views.size, clicks: p.clicks, visitors: p.clicked.size, exposedClicks,
      ctr: p.views.size ? exposedClicks / p.views.size : null };
  }).sort((a,b) => b.clicks - a.clicks), sections, sources, campaigns, paths: [...paths].map(([path, count]) => ({path,count})).sort((a,b) => b.count-a.count).slice(0,20),
    funnel: [ ['Website visit', unique(views)], ['Offering / preview opened', unique(events.filter(e => ['offering_open','preview_start'].includes(e.name)))], ['Install prompt', unique(prompts)], ['App-store / download link', unique(store)] ] };
}
