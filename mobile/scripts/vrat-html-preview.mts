// Generate a self-contained, browsable HTML preview of every un-hidden vrat
// katha — exactly the content the app renders when a user opens an observance.
// Lets you read/test all stories, see the observance->katha linkage, and which
// were newly added vs rewritten this effort.
//
// Run from mobile/:  npx tsx scripts/vrat-html-preview.mts
// Output: .context/vrat-content/katha-preview.html

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { getObservanceCatalog, KATHA_CATALOG } from '../src/panchang/festivals';
import { getKathaContent } from '../src/panchang/kathaContent';

const esc = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// queue tags: which kathas were authored / rewritten this effort
const qPath = '../.context/vrat-content/queue.json';
const tag = new Map<string, string>();
if (existsSync(qPath)) {
  const q = JSON.parse(readFileSync(qPath, 'utf8'));
  for (const t of (Array.isArray(q) ? q : q.tasks ?? q.items ?? [])) {
    const id = t.targetKathaId || t.kathaId;
    if (id) tag.set(id, t.type); // ekadashi | new | rewrite | summary
  }
}
const tagLabel: Record<string, string> = {
  ekadashi: 'NEW (Ekadashi)', new: 'NEW', rewrite: 'REWRITTEN (in-story)', summary: 'summary',
};

const catalog = getObservanceCatalog().filter((o: any) => o.visibility === 'default' && o.kathaId);
const catMeta = new Map(KATHA_CATALOG.map((k: any) => [k.id, k]));

// group observances by kathaId
const byKatha = new Map<string, any[]>();
for (const o of catalog) {
  if (!byKatha.has(o.kathaId)) byKatha.set(o.kathaId, []);
  byKatha.get(o.kathaId)!.push(o);
}

type Row = { kathaId: string; group: string; obs: any[]; content: any; meta: any; tg: string };
const rows: Row[] = [];
for (const [kathaId, obs] of byKatha) {
  const content = getKathaContent(kathaId);
  if (!content) continue;
  const tg = tag.get(kathaId) ?? 'existing';
  const cats = new Set(obs.map((o) => o.category));
  let group = 'Vrat';
  if (kathaId.includes('ekadashi')) group = 'Ekadashi';
  else if (cats.has('festival')) group = 'Festival';
  else if ((catMeta.get(kathaId) as any)?.kind === 'mahatmya') group = 'Mahatmya';
  rows.push({ kathaId, group, obs, content, meta: catMeta.get(kathaId), tg });
}

const groupOrder = ['Ekadashi', 'Festival', 'Vrat', 'Mahatmya'];
rows.sort((a, b) => (groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group)) || a.content.titleEn.localeCompare(b.content.titleEn));

const counts = {
  total: rows.length,
  ['NEW']: rows.filter((r) => r.tg === 'new' || r.tg === 'ekadashi').length,
  ['REWRITTEN']: rows.filter((r) => r.tg === 'rewrite').length,
  existing: rows.filter((r) => r.tg === 'existing').length,
};

function sectionHtml(s: any): string {
  const paras = s.bodyHi.map((hi: string, i: number) =>
    `<div class="para"><p class="hi">${esc(hi)}</p><p class="en">${esc(s.bodyEn[i] ?? '')}</p></div>`).join('');
  return `<div class="section"><h4><span class="hi">${esc(s.titleHi)}</span> <span class="en">${esc(s.titleEn)}</span></h4>${paras}</div>`;
}

function rowHtml(r: Row): string {
  const obsNames = r.obs.map((o) => `${esc(o.nameEn)}`).join(', ');
  const deity = r.obs.find((o) => o.deityEn)?.deityEn;
  const badge = r.tg === 'rewrite' ? 'rewritten' : (r.tg === 'new' || r.tg === 'ekadashi') ? 'new' : 'existing';
  const urls = (r.content.sourceUrls ?? []).map((u: string) => `<a href="${esc(u)}" target="_blank">source</a>`).join(' · ');
  const secs = r.content.sections.map(sectionHtml).join('');
  const hiChars = r.content.sections.reduce((n: number, s: any) => n + s.bodyHi.join('').length, 0);
  const enChars = r.content.sections.reduce((n: number, s: any) => n + s.bodyEn.join('').length, 0);
  const search = `${r.content.titleEn} ${r.content.titleHi} ${obsNames} ${deity ?? ''} ${r.kathaId} ${r.group}`.toLowerCase();
  return `<details class="katha" data-group="${esc(r.group)}" data-badge="${badge}" data-search="${esc(search)}">
  <summary>
    <span class="badge ${badge}">${badge === 'existing' ? 'existing' : (tagLabel[r.tg] ?? r.tg)}</span>
    <span class="grp">${esc(r.group)}</span>
    <span class="title"><span class="hi">${esc(r.content.titleHi)}</span> <span class="en">${esc(r.content.titleEn)}</span></span>
  </summary>
  <div class="body">
    <div class="meta">
      <div><b>Shown for observance(s):</b> ${obsNames}</div>
      ${deity ? `<div><b>Deity:</b> ${esc(deity)}</div>` : ''}
      <div><b>katha id:</b> <code>${esc(r.kathaId)}</code> &nbsp; <b>sections:</b> ${r.content.sections.length} &nbsp; <b>Hi:</b> ${hiChars} chars &nbsp; <b>En:</b> ${enChars} chars</div>
      ${urls ? `<div><b>sources:</b> ${urls}</div>` : ''}
    </div>
    ${secs}
  </div>
</details>`;
}

const body = rows.map(rowHtml).join('\n');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vrat Katha Preview — Aadhyatma</title>
<style>
  :root{--bg:#fdf6e9;--card:#fffaf0;--ink:#3a2c18;--muted:#9a7b4f;--accent:#b5651d;--line:#ecdcc0;}
  *{box-sizing:border-box}
  body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:var(--bg);color:var(--ink);line-height:1.6}
  header{position:sticky;top:0;background:var(--bg);border-bottom:1px solid var(--line);padding:14px 18px;z-index:5}
  h1{margin:0 0 6px;font-size:20px;color:var(--accent)}
  .sum{font-size:13px;color:var(--muted)}
  .sum b{color:var(--ink)}
  .controls{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center}
  input[type=search]{flex:1;min-width:180px;padding:8px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);font-size:14px}
  .btn{padding:6px 12px;border:1px solid var(--line);border-radius:999px;background:var(--card);cursor:pointer;font-size:13px;color:var(--ink)}
  .btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}
  main{padding:14px 18px;max-width:860px;margin:0 auto}
  details.katha{background:var(--card);border:1px solid var(--line);border-radius:12px;margin:10px 0;overflow:hidden}
  summary{display:flex;gap:10px;align-items:center;padding:12px 14px;cursor:pointer;list-style:none}
  summary::-webkit-details-marker{display:none}
  .title{font-weight:600}
  .grp{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
  .badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;text-transform:uppercase;letter-spacing:.03em}
  .badge.new{background:#1b7f4d;color:#fff}
  .badge.rewritten{background:#b5651d;color:#fff}
  .badge.existing{background:#e7d9bf;color:#6b563a}
  .body{padding:0 16px 14px;border-top:1px solid var(--line)}
  .meta{font-size:12.5px;color:var(--muted);margin:10px 0 14px;display:grid;gap:3px}
  .meta b{color:var(--ink)} code{background:#f0e6d2;padding:1px 5px;border-radius:5px}
  .section{margin:14px 0;padding-top:6px;border-top:1px dashed var(--line)}
  .section h4{margin:6px 0 8px;font-size:15px}
  .para{margin:0 0 12px}
  .para p{margin:0 0 3px}
  p.hi{font-size:15.5px}
  p.en{color:#5c4a30;font-size:14px}
  h4 .en{color:var(--muted);font-weight:500;font-size:13px}
  /* language toggle */
  body.only-hi .en{display:none} body.only-en .hi{display:none}
  .hidden{display:none!important}
</style></head>
<body>
<header>
  <h1>🪔 Vrat Katha Preview — Aadhyatma</h1>
  <div class="sum"><b>${counts.total}</b> un-hidden kathas shown on the Panchang screen &nbsp;·&nbsp;
    <span class="badge new">new</span> <b>${counts['NEW']}</b> newly authored &nbsp;
    <span class="badge rewritten">rewritten</span> <b>${counts['REWRITTEN']}</b> commentary→in-story &nbsp;
    <span class="badge existing">existing</span> <b>${counts.existing}</b> already in-story</div>
  <div class="controls">
    <input id="q" type="search" placeholder="Filter by name, deity, id…">
    <button class="btn lang active" data-lang="both">Both</button>
    <button class="btn lang" data-lang="hi">हिन्दी</button>
    <button class="btn lang" data-lang="en">English</button>
    <span style="width:8px"></span>
    <button class="btn grp active" data-grp="all">All</button>
    <button class="btn grp" data-grp="Ekadashi">Ekadashi</button>
    <button class="btn grp" data-grp="Festival">Festival</button>
    <button class="btn grp" data-grp="Vrat">Vrat</button>
    <button class="btn grp" data-grp="Mahatmya">Mahatmya</button>
    <button class="btn" id="expand">Expand all</button>
  </div>
</header>
<main>${body}</main>
<script>
  const q=document.getElementById('q'), items=[...document.querySelectorAll('details.katha')];
  let grp='all';
  function apply(){const t=q.value.trim().toLowerCase();for(const el of items){const okS=!t||el.dataset.search.includes(t);const okG=grp==='all'||el.dataset.group===grp;el.classList.toggle('hidden',!(okS&&okG));}}
  q.addEventListener('input',apply);
  document.querySelectorAll('.btn.lang').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.btn.lang').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.body.classList.remove('only-hi','only-en');if(b.dataset.lang==='hi')document.body.classList.add('only-hi');if(b.dataset.lang==='en')document.body.classList.add('only-en');}));
  document.querySelectorAll('.btn.grp').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.btn.grp').forEach(x=>x.classList.remove('active'));b.classList.add('active');grp=b.dataset.grp;apply();}));
  let open=false;document.getElementById('expand').addEventListener('click',e=>{open=!open;items.forEach(el=>{if(!el.classList.contains('hidden'))el.open=open;});e.target.textContent=open?'Collapse all':'Expand all';});
</script>
</body></html>`;

const out = '../.context/vrat-content/katha-preview.html';
writeFileSync(out, html);
console.log(`wrote ${out}`);
console.log(`kathas: ${counts.total} (new ${counts['NEW']}, rewritten ${counts['REWRITTEN']}, existing ${counts.existing})`);
