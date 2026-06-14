#!/usr/bin/env node
/**
 * Generates theerth-ia-prototype.html — a standalone, interactive prototype of
 * the PROPOSED Theerth information architecture, using the real India map +
 * real temple data. For design alignment only; not shipped.
 *
 *   node scripts/gen-theerth-prototype.mjs
 *
 * Model (per review): keep a SEPARATE Pilgrimage listing screen.
 *   Screen 1  Listing  — By Category / By State toggle + cards (no big map).
 *   Screen 2  Drill-in — real India map (scoped) + flat single-subsection list.
 *   Screen 3  Detail   — hero (name+location once) + sourced prose.
 * Everything follows the selected language (हिन्दी / English).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const TEMPLES = path.join(REPO, 'mobile/src/data/theerth/temples.ts');
const MAP = path.join(REPO, 'mobile/src/components/indiaMapPaths.generated.ts');
const OUT = path.join(REPO, 'theerth-ia-prototype.html');

const templesSrc = readFileSync(TEMPLES, 'utf8');
const mapSrc = readFileSync(MAP, 'utf8');

// ---- parse baseTemples ----
const temples = [];
for (const line of templesSrc.split('\n')) {
  const m = line.match(/^\s*\{\s*id:\s*'([^']+)'/);
  if (!m || !/groups:\s*\[/.test(line)) continue;
  const get = (k) => (line.match(new RegExp(`${k}:\\s*'([^']*)'`)) || [])[1];
  const groups = ((line.match(/groups:\s*\[([^\]]*)\]/) || [])[1] || '')
    .split(',').map((s) => s.trim().replace(/'/g, '')).filter(Boolean);
  temples.push({
    id: m[1],
    nameHi: get('nameHi'), nameEn: get('nameEn'),
    cityHi: get('cityHi'), cityEn: get('cityEn'),
    stateHi: get('stateHi'), stateEn: get('stateEn'),
    deity: get('deity'),
    lat: parseFloat((line.match(/lat:\s*([\d.]+)/) || [])[1]),
    lng: parseFloat((line.match(/lng:\s*([\d.]+)/) || [])[1]),
    groups,
  });
}

// ---- parse detail prose (Hi + En) per id ----
const detail = {};
const reBlock = /(\w[\w-]*):\s*\{\s*significanceHi:\s*'([^']*)',\s*significanceEn:\s*'([^']*)',\s*originStoryHi:\s*'([^']*)',\s*originStoryEn:\s*'([^']*)'/g;
let mm;
while ((mm = reBlock.exec(templesSrc))) {
  detail[mm[1]] = { sHi: mm[2], sEn: mm[3], oHi: mm[4], oEn: mm[5] };
}

// ---- parse map ----
const proj = JSON.parse(
  (mapSrc.match(/export const INDIA_PROJECTION[^=]*=\s*(\{[^}]*\})/) || [])[1].replace(/(\w+):/g, '"$1":'),
);
const outline = [...mapSrc.matchAll(/"((?:M)[^"]+Z)",/g)].map((x) => x[1]).filter((p) => /^M/.test(p));
// states: id, nameEn, path
const states = [...mapSrc.matchAll(/id:\s*"([^"]+)",\s*nameEn:\s*"([^"]+)",\s*path:\s*"([^"]+)"/g)]
  .map((x) => ({ id: x[1], nameEn: x[2], path: x[3] }));

const GROUPS = [
  { key: 'jyotirlinga', hi: 'द्वादश ज्योतिर्लिङ्ग', en: 'Dvādaśa Jyotirlinga' },
  { key: 'char-dham', hi: 'चार धाम', en: 'Char Dham' },
  { key: 'chota-char-dham', hi: 'छोटा चार धाम', en: 'Chota Char Dham' },
  { key: 'shakti-peeth', hi: 'शक्ति पीठ', en: 'Shakti Peeth' },
  { key: 'other', hi: 'अन्य प्रसिद्ध तीर्थ', en: 'Other Famous Temples' },
];

const data = { proj, outline, states, temples, detail, groups: GROUPS };

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Theerth IA — Prototype</title>
<style>
  :root{--parch:#F3E7C9;--parchSoft:#F8EFD6;--ink:#2F1E10;--inkSoft:#5A3A1E;--inkMuted:#8A6A47;--saffron:#B8621B;--saffronDeep:#8A3E0B;--gold:#A67C34;--divider:rgba(138,62,11,.18);--tint:rgba(184,98,27,.14)}
  *{box-sizing:border-box;font-family:-apple-system,Segoe UI,Roboto,'Noto Serif Devanagari',serif}
  body{margin:0;background:#cdbf9d;display:flex;flex-wrap:wrap;gap:28px;justify-content:center;padding:28px}
  .note{flex-basis:100%;max-width:880px;color:#3a2a17;background:#fbf4e2;border:1px solid var(--divider);border-radius:12px;padding:14px 18px;font-size:14px;line-height:1.5}
  .note b{color:var(--saffronDeep)}
  .phone{width:330px;height:710px;background:linear-gradient(#F6ECD0,#F1E3BF);border-radius:30px;border:1px solid var(--divider);box-shadow:0 10px 30px rgba(0,0,0,.18);overflow:hidden;display:flex;flex-direction:column;position:relative}
  .cap{flex:none;text-align:center;font-size:11px;color:var(--inkMuted);padding:6px}
  .scr{flex:1;overflow-y:auto}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 16px}
  .topbar .title{text-align:center}
  .back{width:30px;height:30px;border-radius:15px;border:1px solid var(--divider);background:var(--parchSoft);display:flex;align-items:center;justify-content:center;color:var(--inkSoft);cursor:pointer}
  .title{font-size:19px;color:var(--ink);font-weight:600}
  .sub{font-size:12px;color:var(--inkMuted);font-style:italic}
  .langrow{display:flex;justify-content:center;margin:0 0 8px}
  .map{display:block;margin:6px auto 0}
  .hint{text-align:center;font-size:12px;color:var(--inkMuted);font-style:italic;margin:10px 0}
  .toggle{display:flex;gap:4px;background:var(--parchSoft);border:1px solid var(--divider);border-radius:999px;padding:3px;width:fit-content;margin:0 auto 12px}
  .toggle button{border:0;background:transparent;border-radius:999px;padding:7px 18px;font-size:12px;color:var(--inkMuted);cursor:pointer;font-style:italic}
  .toggle button.on{background:var(--tint);color:var(--saffronDeep);font-weight:600;font-style:normal}
  .sech{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--saffronDeep);font-weight:700;margin:14px 16px 8px}
  .card{display:flex;align-items:center;gap:12px;margin:0 16px 10px;padding:13px;border:1px solid var(--divider);border-radius:12px;background:var(--parchSoft);cursor:pointer}
  .card:active{opacity:.85}
  .thumb{width:40px;height:40px;border-radius:8px;background:linear-gradient(135deg,#c98a3c,#a4641f);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex:none}
  .ctext{flex:1;min-width:0}
  .cname{font-size:16px;color:var(--ink)}
  .cmeta{font-size:12px;color:var(--inkMuted);font-style:italic;margin-top:2px}
  .chev{color:var(--saffron);font-size:20px}
  .deity{display:inline-block;font-size:10px;letter-spacing:2px;color:var(--saffronDeep);background:var(--tint);border:1px solid var(--divider);border-radius:999px;padding:3px 10px;margin-top:8px}
  .prose{font-size:14px;color:var(--inkSoft);line-height:1.6;margin:8px 16px;text-align:center}
  .orn{text-align:center;color:var(--saffronDeep);margin:14px 0}
  .lbl{text-align:center;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--saffronDeep);font-weight:700;margin-top:14px}
  .src{font-size:11px;color:var(--inkMuted);font-style:italic;text-align:center;margin:18px 16px}
</style></head>
<body>
<div class="note">
  <b>Theerth — proposed information architecture (prototype).</b> The language toggle works —
  flip <b>हिन्दी / English</b> and everything (state names, temple names, cities, prose) follows it.
  <b>Screen 1</b> is a separate Pilgrimage <b>listing</b> (cards only) with a <b>By Category / By State</b>
  toggle — no ＋ add-to-routine. <b>Screen 2</b> drills into one category/state: the real India map +
  a flat list (Jyotirlinga shows just its temples, no stray "Char Dham" sub-section). <b>Screen 3</b>
  is the temple detail (name + location once, language toggle on top).
</div>
<div class="phone"><div class="cap">Pilgrimage · Theerth</div><div class="scr" id="scr"></div></div>
<div class="note" id="legend" style="max-width:330px;font-size:13px"></div>

<script>
const D = ${JSON.stringify(data)};
const P = D.proj;
let lang='hi', mode='category', current=null;
const px=(lng)=>((lng-P.lngMin)/(P.lngMax-P.lngMin))*P.width;
const py=(lat)=>((P.latMax-lat)/(P.latMax-P.latMin))*P.height;
const T={category:{hi:'श्रेणी',en:'By Category'},state:{hi:'राज्य',en:'By State'},
  pilgrimage:{hi:'तीर्थ',en:'Pilgrimage'},tapState:{hi:'राज्य या श्रेणी चुनें',en:'Pick a state or category'},
  temples:{hi:'तीर्थ',en:'temples'},sig:{hi:'महिमा',en:'Significance'},orig:{hi:'उद्भव कथा',en:'Origin Story'},
  sources:{hi:'स्रोत',en:'Sources'},tapPin:{hi:'पिन छूकर मंदिर की कथा पढ़ें',en:'Tap a pin to read the temple’s story'}};
const tr=(k)=>T[k][lang];
const nm=(t)=>lang==='hi'?t.nameHi:t.nameEn;
const cs=(t)=>lang==='hi'?(t.cityHi+', '+t.stateHi):(t.cityEn+', '+t.stateEn);
const stName=(t)=>lang==='hi'?t.stateHi:t.stateEn;
const gName=(g)=>lang==='hi'?g.hi:g.en;
const inGroup=(t,k)=> k==='other'? t.groups.length===0 : t.groups.includes(k);
const statesList=()=>{const seen={};const out=[];for(const t of D.temples){if(!seen[t.stateEn]){seen[t.stateEn]=1;out.push(t.stateEn);}}return out.sort();};
const W=290,H=Math.round(290*(P.height/P.width));
function mapSVG(pins){
  const st=D.states.map(s=>'<path d="'+s.path+'" fill="none" stroke="#B8621B" stroke-opacity=".25" stroke-width=".6"/>').join('');
  const outl=D.outline.map(d=>'<path d="'+d+'" fill="none" stroke="#8A3E0B" stroke-opacity=".6" stroke-width="1.2"/>').join('');
  const dots=pins.map(t=>'<text x="'+px(t.lng).toFixed(1)+'" y="'+(py(t.lat)+4).toFixed(1)+'" fill="#8A3E0B" font-size="11" text-anchor="middle">॥</text>').join('');
  return '<svg class="map" width="'+W+'" height="'+H+'" viewBox="0 0 '+P.width+' '+P.height+'">'+st+outl+dots+'</svg>';
}
const root=document.getElementById('scr'), legend=document.getElementById('legend');
function show(fn){current=fn;fn();}
window.setLang=(l)=>{lang=l;if(current)current();};
window.setMode=(m)=>{mode=m;listing();};
function topbar(title,sub,onBack){
  return '<div class="topbar">'+(onBack?'<div class="back" onclick="'+onBack+'">‹</div>':'<div style="width:30px"></div>')+
    '<div>'+(title?'<div class="title">'+title+'</div>':'')+(sub?'<div class="sub">'+sub+'</div>':'')+'</div><div style="width:30px"></div></div>'+
    '<div class="langrow"><div class="toggle"><button class="'+(lang==='hi'?'on':'')+'" onclick="setLang(\\'hi\\')">हिन्दी</button>'+
    '<button class="'+(lang==='en'?'on':'')+'" onclick="setLang(\\'en\\')">English</button></div></div>';
}
function viewToggle(){
  return '<div class="toggle"><button class="'+(mode==='category'?'on':'')+'" onclick="setMode(\\'category\\')">'+tr('category')+'</button>'+
    '<button class="'+(mode==='state'?'on':'')+'" onclick="setMode(\\'state\\')">'+tr('state')+'</button></div>';
}
function card(name,meta,glyph,onclick){
  return '<div class="card" onclick="'+onclick+'"><div class="thumb">'+glyph+'</div>'+
    '<div class="ctext"><div class="cname">'+name+'</div>'+(meta?'<div class="cmeta">'+meta+'</div>':'')+'</div><div class="chev">›</div></div>';
}
function listing(){
  legend.innerHTML='<b>Screen 1 — Pilgrimage listing</b> (separate screen, no map). Toggle = By Category / By State. No ＋ buttons. Names follow the language toggle.';
  let h=topbar(tr('pilgrimage'),'',null)+'<div style="height:6px"></div>'+'<div style="display:flex;justify-content:center">'+viewToggle()+'</div>';
  if(mode==='category'){
    for(const g of D.groups){const n=D.temples.filter(t=>inGroup(t,g.key)).length;if(!n)continue;
      h+=card(gName(g),n+' '+tr('temples'),'॥','openCat(\\''+g.key+'\\')');}
  }else{
    for(const s of statesList()){const list=D.temples.filter(t=>t.stateEn===s);
      h+=card(stName(list[0]),list.length+' '+tr('temples'),'ॐ','openState(\\''+s.replace(/'/g,'')+'\\')');}
  }
  root.innerHTML=h;root.scrollTop=0;
}
window.openCat=(k)=>show(()=>{
  const g=D.groups.find(x=>x.key===k),list=D.temples.filter(t=>inGroup(t,k));
  legend.innerHTML='<b>Screen 2 — one category.</b> Map + a flat list of only '+g.en+' temples. No other-category sub-sections.';
  let h=topbar(gName(g),list.length+' '+tr('temples'),'listing()')+mapSVG(list)+'<div class="hint">'+tr('tapPin')+'</div>';
  h+='<div class="sech">'+gName(g)+'</div>'+list.map(rowFor).join('');
  root.innerHTML=h;root.scrollTop=0;
});
window.openState=(s)=>show(()=>{
  const list=D.temples.filter(t=>t.stateEn===s);
  legend.innerHTML='<b>Screen 2 — one state.</b> Map + every temple in that state. State name in the chosen language only.';
  let h=topbar(stName(list[0]),list.length+' '+tr('temples'),'listing()')+mapSVG(list)+'<div class="hint">'+tr('tapPin')+'</div>';
  h+='<div class="sech">'+stName(list[0])+'</div>'+list.map(rowFor).join('');
  root.innerHTML=h;root.scrollTop=0;
});
function rowFor(t){
  return '<div class="card" onclick="openTemple(\\''+t.id+'\\')"><div class="thumb">ॐ</div>'+
    '<div class="ctext"><div class="cname">'+nm(t)+'</div><div class="cmeta">'+cs(t)+'</div></div><div class="chev">›</div></div>';
}
window.openTemple=(id)=>show(()=>{
  const t=D.temples.find(x=>x.id===id),d=D.detail[id]||{};
  legend.innerHTML='<b>Screen 3 — temple detail.</b> Name + location once (hero). Sourced prose, language-aware.';
  const deityHi={shiva:'शिव',vishnu:'विष्णु',krishna:'कृष्ण',rama:'राम',durga:'दुर्गा',ganesha:'गणेश',hanuman:'हनुमान',savitr:'सूर्य',saraswati:'सरस्वती'}[t.deity]||t.deity;
  let h=topbar('','','listing()');
  h+='<div style="text-align:center;margin-top:6px"><div class="title" style="font-size:26px">'+nm(t)+'</div>'+
    '<div class="sub">'+cs(t)+'</div><div class="deity">'+(lang==='hi'?deityHi:t.deity.toUpperCase())+'</div></div>';
  h+='<div class="orn">—— ॥ ——</div><div class="lbl">'+tr('sig')+'</div><div class="prose">'+(lang==='hi'?d.sHi:d.sEn)+'</div>';
  h+='<div class="orn">—— ॥ ——</div><div class="lbl">'+tr('orig')+'</div><div class="prose">'+(lang==='hi'?d.oHi:d.oEn)+'</div>';
  h+='<div class="src">'+tr('sources')+' — '+(lang==='hi'?'मन्दिर ट्रस्ट / पर्यटन':'temple trust / tourism board')+'</div>';
  root.innerHTML=h;root.scrollTop=0;
});
show(listing);
</script>
</body></html>`;

writeFileSync(OUT, html);
process.stdout.write(
  `wrote ${path.relative(REPO, OUT)} — ${temples.length} temples, ${states.length} states, ${Object.keys(detail).length} with prose\n`,
);
