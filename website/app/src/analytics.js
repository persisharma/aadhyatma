import { VERSION } from '../analytics/core.mjs';
let queue = [], visit, campaign, started = false, timer, sequence = 0;
// Campaign = the landing utm_source (e.g. instagram, poster), kept for the whole visit
// so downloads can be attributed. Only a short slug is kept; nothing else from the URL.
const landingCampaign = () => { try { const v = (new URLSearchParams(location.search).get('utm_source') || '').toLowerCase(); return /^[a-z0-9][a-z0-9_.-]{0,39}$/.test(v) ? v : 'direct'; } catch { return 'direct'; } };
const randomId = () => window.crypto?.randomUUID?.() || Array.from(window.crypto?.getRandomValues?.(new Uint8Array(16)) || Array.from({length:16},()=>Math.floor(Math.random()*256)), b=>b.toString(16).padStart(2,'0')).join('');
const disabled = () => navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true;
const device = () => innerWidth < 768 ? 'mobile' : innerWidth < 1100 ? 'tablet' : 'desktop';
function visitId() {
  if(visit) return visit;
  try {
    const saved = JSON.parse(sessionStorage.getItem('vedansh-visit') || 'null');
    visit = saved?.expires > Date.now() ? saved.id : randomId();
    sequence = saved?.id === visit ? saved.sequence || 0 : 0;
    campaign = saved?.id === visit && saved.campaign ? saved.campaign : landingCampaign();
    sessionStorage.setItem('vedansh-visit',JSON.stringify({id:visit,campaign,expires:Date.now()+30*60000}));
  } catch { visit = randomId(); campaign = landingCampaign(); }
  return visit;
}
export function track(name, data = {}) {
  try {
  if(typeof window === 'undefined' || disabled()) return;
  // Only declared identifiers; never DOM text, search queries, input values, or URL parameters other than the utm_source slug.
  const id = visitId();
  sequence++;
  try { sessionStorage.setItem('vedansh-visit',JSON.stringify({id,sequence,campaign,expires:Date.now()+30*60000})); } catch {}
  queue.push({ id:randomId(), visit:id, sequence, name, version:VERSION,
    page:location.pathname === '/hi/' ? '/hi/' : '/', language:document.documentElement.lang === 'hi' ? 'hi' : 'en', device:device(),
    target:data.target || '', section:data.section || '', feature:data.feature || '', source:data.source || '', platform:data.platform || '', campaign: campaign || 'direct' });
  window.dispatchEvent(new CustomEvent('vedansh:conversion',{detail:{name,...data}}));
  if(queue.length >= 20) flush();
  else if(!timer) timer = setTimeout(flush, 800);
  } catch { /* Measurement must never interrupt an install or preview. */ }
}
async function flush() {
  clearTimeout(timer); timer = null;
  if(!queue.length) return;
  const batch = queue.splice(0,50);
  try {
    const response = await fetch('/api/events',{method:'POST',referrerPolicy:'no-referrer',headers:{'Content-Type':'application/json'},body:JSON.stringify(batch),keepalive:true});
    if(!response.ok && response.status >= 500) queue = [...batch,...queue].slice(-100);
  } catch { queue = [...batch,...queue].slice(-100); }
}
export function startAnalytics() {
  if(started || disabled()) return;
  started = true;
  track('page_view');
  const sectionOf = el => el.closest('[data-section]')?.dataset.section || 'page';
  const seen = new Set(), timers = new Map();
  const observer = new IntersectionObserver(entries => {
    for(const {target:el,isIntersecting,intersectionRatio} of entries) {
      const kind = el.matches('[data-track]') ? 'button_view' : 'section_view';
      const target = el.dataset.track || el.dataset.section;
      const key = `${kind}:${sectionOf(el)}:${target}`;
      if(!isIntersecting || intersectionRatio < .5 || document.visibilityState !== 'visible') { clearTimeout(timers.get(el)); timers.delete(el); continue; }
      if(seen.has(key) || timers.has(el)) continue;
      timers.set(el,setTimeout(() => {
        timers.delete(el);
        if(document.visibilityState !== 'visible' || !el.isConnected || el.closest('[inert]') || getComputedStyle(el).visibility === 'hidden' || el.disabled) return;
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, Math.min(innerWidth - 1, rect.left + rect.width / 2));
        const y = Math.max(0, Math.min(innerHeight - 1, rect.top + rect.height / 2));
        const at = document.elementFromPoint(x,y);
        if(!at || !(el.contains(at) || at.contains(el))) return;
        const visible = Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0));
        if(visible < rect.height*.5) return;
        seen.add(key);
        track(kind,{target,section:sectionOf(el)});
      },1000));
    }
  },{threshold:[0,.5]});
  let observed = new WeakMap();
  function scan() {
    document.querySelectorAll('[data-track],[data-section-view]').forEach(el => {
      const key = `${sectionOf(el)}:${el.dataset.track || el.dataset.section}`;
      if(observed.get(el) !== key) { clearTimeout(timers.get(el)); timers.delete(el); observer.unobserve(el); observed.set(el,key); observer.observe(el); }
    });
  }
  scan();
  new MutationObserver(changes => {
    if(changes.some(c => ['open','inert','data-section'].includes(c.attributeName))) {
      observer.disconnect(); observed = new WeakMap();
      for(const timeout of timers.values()) clearTimeout(timeout);
      timers.clear();
    }
    scan();
  }).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','data-track','inert','data-section']});
  document.addEventListener('click',e => {
    const el = e.target.closest('button[data-track],a[data-track],summary[data-track]');
    if(el && !el.disabled) track('click',{target:el.dataset.track,section:sectionOf(el)});
  },true);
  document.addEventListener('change',e => {
    const el = e.target.closest('select[data-track],input[type="range"][data-track]');
    if(el) track('click',{target:el.dataset.track,section:sectionOf(el)});
  });
  document.addEventListener('submit',e => {
    if(e.target.matches('[role="search"]')) track('search_used',{target:'search',section:'header'});
  });
  document.addEventListener('visibilitychange',() => {
    if(document.visibilityState === 'hidden') {
      for(const timeout of timers.values()) clearTimeout(timeout);
      timers.clear(); flush();
    } else { observer.disconnect(); document.querySelectorAll('[data-track],[data-section-view]').forEach(el => observer.observe(el)); flush(); }
  });
  window.addEventListener('pagehide',flush);
}
