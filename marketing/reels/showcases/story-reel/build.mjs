// Story reels from the app's sourced content, with Hindi narration (voice.py) and subtitles.
// Styles: Tholu Bommalata puppets (code-drawn), Pattachitra, or the app's painted art (illustrated stories only).
// Each story lives in stories/<id>/ (script.json + scenes.mjs). See README for the style rule.
// Usage: node build.mjs [--story hanuman-surya|dhanteras] [--style puppet|patta|painted|all] [--out <dir>] [--preview] [--bed none|tanpura] [--remux]
import fs from 'node:fs';
import path from 'node:path';
import {spawn, execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {CHARACTERS, PALETTES} from './cast.mjs';
import {shapeSvg} from '../story-styles/characters.mjs';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const preview = process.argv.includes('--preview');
// --bed none (default): narration only, so music can be added in Instagram/Meta at upload. --bed tanpura: synthesised drone.
// --remux: keep the already-rendered picture and only rebuild the audio (fast).
const bed = arg('bed', 'none'), remux = process.argv.includes('--remux');
const story = arg('story', 'hanuman-surya');
const out = path.resolve(arg('out', path.join(root, 'marketing/reels/out/story-reel', story)));
const {FOLK} = await import(`./stories/${story}/scenes.mjs`);
const styles = arg('style', 'all') === 'all' ? ['puppet', 'patta', 'painted'] : [arg('style')];
const W = 1080, H = 1920, FPS = 30;
let T = 0.3;
const url = rel => pathToFileURL(path.join(root, rel)).href;
const esc = t => String(t).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const run = (bin, args) => execFileSync(bin, args, {stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26}).toString();
const script = JSON.parse(fs.readFileSync(path.join(here, 'stories', story, 'script.json'), 'utf8'));
const vo = JSON.parse(fs.readFileSync(path.join(out, 'vo.json'), 'utf8'));
const strip = t => t.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');
// format "ig": curiosity hook, hard cuts with a zoom punch, day chip and big kinetic captions synced to the voice.
const ig = script.format === 'ig';
if (ig) T = 0.08;

// Split narration into short phrases (punctuation, then <= 4 words) timed by character share of the clip.
function captionChunks(text, t0, secs) {
  // Keep a phrase whole (one screen, up to two lines) when it is <= 7 words or <= 34 characters. Otherwise split it
  // near the middle at a natural Hindi break: after से/पर/में/ने/को, before और; never after का/के/की or before a
  // postposition. "?" and "!" stay visible on their phrase.
  const POST = new Set(['का', 'के', 'की', 'से', 'पर', 'में', 'ने', 'को']), GOOD_END = new Set(['से', 'पर', 'में', 'ने', 'को']);
  const split = p => { const w = p.split(/\s+/); if (w.length <= 7 || p.length <= 34) return [p];
    const mid = w.length / 2; let best = Math.round(mid), score = -1e9;
    for (let k = 2; k <= w.length - 2; k++) {
      const sc = -Math.abs(k - mid) + (GOOD_END.has(w[k - 1]) ? 2 : 0) + (w[k] === 'और' ? 1.5 : 0) - (['का', 'के', 'की', 'और'].includes(w[k - 1]) ? 4 : 0) - (POST.has(w[k]) ? 4 : 0) - (['है', 'हैं', 'था', 'थे', 'हुआ', 'हुए'].includes(w[k]) ? 4 : 0);
      if (sc > score) { score = sc; best = k; } }
    return [...split(w.slice(0, best).join(' ')), ...split(w.slice(best).join(' '))]; };
  const phrases = text.replace(/([?!])/g, '$1|').split(/[|,।—…]+/).map(x => x.trim()).filter(Boolean).flatMap(split);
  const weight = phrases.map(p => p.replace(/\s/g, '').length + 3), total = weight.reduce((a, b) => a + b, 0);
  let acc = 0;
  return phrases.map((p, k) => { const s = k === 0 && t0 === 0 ? -0.3 : t0 + secs * acc / total; /* opening phrase already on the first frame */ acc += weight[k]; return {text: p, s, e: k === phrases.length - 1 ? t0 + secs + 0.1 : t0 + secs * acc / total}; });
}
const HL = new Set(script.highlight || []);
const hl = t => t.split(/\s+/).map(w => HL.has(w.replace(/[,।?!]/g, '')) ? `<b>${esc(w)}</b>` : esc(w)).join(' ');

let at = 0;
const scenes = script.scenes.map((sc, i) => {
  const v = vo[i];
  if (!v || v.text !== strip(sc.vo)) throw Error(`Stale narration for ${sc.id}: rerun voice.py`);
  const lead = ig ? (i === 0 ? 0 : 0.08) : (i === 0 ? 0.2 : 0.35), tail = i === script.scenes.length - 1 ? (script.ctaAfterVo ? 2.6 : ig ? 1.0 : 1.4) : (ig ? 0.18 : 0.45);
  const dur = Math.ceil((lead + v.seconds + tail) * FPS) / FPS;
  const r = {...sc, start: at, dur, voAt: at + lead, voFile: path.join(out, v.file), text: v.text, caps: captionChunks(v.text, at + lead, v.seconds)};
  at += dur; return r;
});
const TOTAL = at;
// Optional on-screen counter (format "ig"): ticks when a caption phrase matches script.counter.match.
const counter = ig && script.counter ? {...script.counter, at: scenes.flatMap(sc => sc.caps.filter(c => new RegExp(script.counter.match).test(c.text)).map(c => +c.s.toFixed(3)))} : null;


function puppetBase(type, k) {
  const pal = PALETTES.puppet;
  const dot = d => `<path d="${d}" fill="none" stroke="${pal.deco}" stroke-width="3.4" stroke-dasharray="0.01 12" stroke-linecap="round" opacity=".75"/>`;
  const shape = (d, fill) => `<path d="${d}" fill="${fill}" stroke="#170904" stroke-width="8"/>${dot(d)}`;
  let o = `<rect width="${W}" height="${H}" fill="#2B0E06"/><rect class="glow" width="${W}" height="${H}" fill="url(#lamp)"/>`;
  if (type === 'sky') o += [[-60, 1700, 380, 1180], [240, 1720, 620, 1250], [560, 1700, 1140, 1210]].map(([a, b, c, t]) => shape(`M${a},${b}L${(a + c) / 2},${t}L${c},${b}Z`, '#4A1C0C')).join('');
  if (type === 'forest') for (const [x, h] of [[110, 820], [980, 760], [640, 980]]) o += shape(`M${x - 22},1650 L${x - 22},${h + 160} L${x + 22},${h + 160} L${x + 22},1650Z`, '#5A2A12') + [[0, 0, 120], [-80, 90, 90], [80, 90, 90]].map(([dx, dy, r]) => shape(`M${x + dx - r},${h + dy}a${r},${r * 0.8} 0 1,0 ${2 * r},0a${r},${r * 0.8} 0 1,0 ${-2 * r},0Z`, '#2F6B2E')).join('');
  if (type === 'heaven') for (const x of [60, 930]) o += shape(`M${x},1640 L${x},700 L${x + 90},700 L${x + 90},1640Z`, '#4A1C0C') + `<path d="M${x - 20},700 L${x + 110},700 L${x + 95},660 L${x - 5},660Z" fill="${pal.gold}" stroke="#170904" stroke-width="6"/>`;
  if (type === 'cave') o += shape('M120,1650 L120,980 Q120,640 540,600 Q960,640 960,980 L960,1650Z', '#1E0A04');
  if (type === 'kailash') o += [[-80, 1640, 360, 980], [200, 1640, 720, 860], [560, 1640, 1160, 1000]].map(([a, b, c, t]) => shape(`M${a},${b}L${(a + c) / 2},${t}L${c},${b}Z`, '#5B4A6E')
    + `<path d="M${(a + c) / 2 - 70},${t + 110}L${(a + c) / 2},${t}L${(a + c) / 2 + 70},${t + 110}L${(a + c) / 2 + 30},${t + 90}L${(a + c) / 2},${t + 120}L${(a + c) / 2 - 30},${t + 90}Z" fill="#F3EEDD" stroke="#170904" stroke-width="6"/>`).join('');
  if (type === 'palace') o += shape('M60,1640 L60,1150 L1020,1150 L1020,1640Z', '#5A2210')
    + [[220, 980, 120], [540, 900, 170], [860, 980, 120]].map(([x, y, r]) => shape(`M${x - r},${y + r} L${x - r},${y + 60} A${r},${r} 0 0 1 ${x + r},${y + 60} L${x + r},${y + r}Z`, '#E2A62B') + shape(`M${x - 4},${y + 60 - r} L${x - 4},${y - 10 - r} L${x + 40},${y + 6 - r} L${x + 4},${y + 20 - r} L${x + 4},${y + 60 - r}Z`, '#B8261B')).join('')
    + [180, 380, 700, 900].map(x => shape(`M${x - 50},1640 L${x - 50},1330 A50,50 0 0 1 ${x + 50},1330 L${x + 50},1640Z`, '#2B0E06')).join('');
  if (type === 'ocean') o += `<rect x="0" y="1330" width="${W}" height="320" fill="#1D4F66"/>${dot(`M30,1340 L${W - 30},1340`)}`;
  if (type === 'night') { let seed = 3; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); o += Array.from({length: 70}, () => `<circle cx="${(60 + r() * 960) | 0}" cy="${(600 + r() * 900) | 0}" r="${(2 + r() * 3).toFixed(1)}" fill="#FFE9B8" opacity=".85"/>`).join(''); }
  if (type === 'home') o += shape('M250,1640 L250,880 Q250,700 540,680 Q830,700 830,880 L830,1640Z', '#5A2210') + shape('M300,1640 L300,900 Q300,750 540,735 Q780,750 780,900 L780,1640Z', '#2B0E06')
    + Array.from({length: 9}, (_, k) => shape(`M${290 + k * 56},860 L${318 + k * 56},930 L${346 + k * 56},860Z`, '#2F8A3B')).join('')
    + [[0, '#E2A62B'], [1, '#B8261B'], [2, '#2F8A3B']].map(([k, c]) => shape(`M${540 - 150 + k * 40},1700 a${150 - k * 40},${50 - k * 13} 0 1,0 ${2 * (150 - k * 40)},0 a${150 - k * 40},${50 - k * 13} 0 1,0 ${-2 * (150 - k * 40)},0Z`, c)).join('');
  o += shape(`M0,1640 L${W},1640 L${W},${H} L0,${H}Z`, '#3A1508');
  return o;
}

function pattaBase(type) {
  const ol = 'stroke="#120B06" stroke-width="6"';
  let o = `<rect width="${W}" height="${H}" fill="#120B06"/><rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="url(#pf)"/>
    <rect x="78" y="78" width="${W - 156}" height="${H - 156}" fill="#F0B53C"/><rect x="90" y="90" width="${W - 180}" height="${H - 180}" fill="${type === 'cave' ? '#5B1A12' : '#B22E1E'}"/>`;
  let seed = 11; const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 60; k++) { const x = 110 + rand() * (W - 220), y = 620 + rand() * 1040; o += `<g transform="translate(${x | 0},${y | 0})" opacity=".8">${[0, 1, 2, 3, 4].map(q => `<circle cx="${(6 * Math.cos(q * 1.2566)).toFixed(1)}" cy="${(6 * Math.sin(q * 1.2566)).toFixed(1)}" r="3.4" fill="#FFF3D6"/>`).join('')}</g>`; }
  if (type === 'sky') for (let k = 0; k < 7; k++) o += `<path d="M${90 + k * 140},1830 a90,90 0 0 1 180,0Z" fill="#3E7A35" ${ol}/>`;
  if (type === 'forest') for (const x of [150, 930]) o += `<rect x="${x - 12}" y="1150" width="24" height="680" fill="#5A2E14" ${ol}/><circle cx="${x}" cy="1120" r="120" fill="#3E7A35" ${ol}/>${Array.from({length: 16}, (_, q) => `<ellipse cx="${(x + 80 * Math.cos(q * 0.4)).toFixed(0)}" cy="${(1120 + 70 * Math.sin(q * 0.4)).toFixed(0)}" rx="11" ry="6" fill="#FFF7E2"/>`).join('')}`;
  if (type === 'heaven') o += Array.from({length: 8}, (_, k) => `<path d="M${90 + k * 125},700 a62,50 0 0 1 125,0Z" fill="#F8E8C5" ${ol}/>`).join('') + [130, 880].map(x => `<rect x="${x}" y="760" width="70" height="1070" fill="#F0B53C" ${ol}/>`).join('');
  if (type === 'cave') o += `<path d="M150,1830 L150,1000 Q150,660 540,620 Q930,660 930,1000 L930,1830Z" fill="#14100C" ${ol}/><path d="M190,1830 L190,1010 Q190,700 540,662 Q890,700 890,1010 L890,1830" fill="none" stroke="#FFF7E2" stroke-width="2" stroke-dasharray="6 7"/>`;
  return o;
}

function folkScene(style, sc, i) {
  const f = FOLK[sc.id];
  let o = `<g class="scene" data-i="${i}">${style === 'puppet' ? puppetBase(f.bg) : pattaBase(f.bg)}`;
  if (f.fx?.includes('dim')) o += `<rect width="${W}" height="${H}" fill="#000" opacity=".22"/>`;
  if (f.fx?.includes('wind')) o += Array.from({length: 6}, (_, k) => `<path class="wind" d="M-200,${780 + k * 150} C200,${700 + k * 150} 600,${860 + k * 150} 1300,${760 + k * 150}" fill="none" stroke="#FFF3D6" stroke-width="${style === 'puppet' ? 6 : 5}" stroke-linecap="round" stroke-dasharray="160 1400" opacity=".7"/>`).join('');
  o += '<!--cast-->';
  o += f.cast.map(([name], n) => {
    const parts = CHARACTERS[name];
    return [...parts.filter(p => p.first), ...parts.filter(p => !p.first)].map(p => `<g id="s${i}c${n}-${p.id}">${p.shapes.map(x => shapeSvg(x, style)).join('')}</g>`).join('');
  }).join('');
  if (f.fx?.includes('rain')) o = o.replace('<!--cast-->', Array.from({length: 46}, (_, k) => `<path class="rain" d="M${(k * 97) % 1100 - 20},${560 + (k * 211) % 1050} l-26,90" stroke="#BFE3F2" stroke-width="5" stroke-linecap="round" opacity=".75"/>`).join('') + '<!--cast-->');
  for (const [x, y, t, size, t0] of f.labels || []) o += `<text class="lbl" data-t0="${t0}" x="${x}" y="${y}" text-anchor="middle" font-family="Noto Serif Devanagari" font-weight="700" font-size="${size}" fill="#F3DFAE" stroke="#170904" stroke-width="${Math.max(4, size / 9)}" paint-order="stroke" opacity="0">${esc(t)}</text>`;
  if (f.fx?.includes('petals')) { let seed = 5; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647); o += Array.from({length: 36}, (_, k) => `<ellipse class="petal" data-x="${(r() * W) | 0}" data-v="${(120 + r() * 160) | 0}" data-p="${r() * 6}" rx="11" ry="6" fill="${k % 3 ? '#F0A98A' : '#F0B53C'}" stroke="#170904" stroke-width="2"/>`).join(''); }
  return o + '</g>';
}

function page(style) {
  const dev = style === 'painted' ? "'Mukta'" : "'Noto Serif Devanagari'";
  const card = {puppet: 'background:#F3DFAE;border:7px solid #170904;box-shadow:inset 0 0 0 5px #F3DFAE,inset 0 0 0 8px #6E1A10;color:#5A1208',
    patta: 'background:#FFF4D8;border:8px double #120B06;box-shadow:0 0 0 6px #F0B53C;color:#120B06',
    painted: 'background:#7A1D0C;border:3px solid #E7B864;color:#FFF4DF;border-radius:20px'}[style];
  const folk = style !== 'painted';
  if (!folk && scenes.some(sc => !sc.pages)) throw Error(`${story} has no painted pages: use --style puppet (style rule: unillustrated stories use puppets)`);
  const casts = scenes.map(sc => folk ? FOLK[sc.id].cast.map(([name, x, y, s, rot, flip, m, o]) => ({x, y, s, rot, flip, m, o: o || {}, parts: CHARACTERS[name].map(({shapes, ...p}) => p)})) : []);
  const painted = folk ? '' : scenes.map((sc, i) => `<div class="pscene" data-i="${i}">${sc.pages.map((p, k) => { const f = `mobile/assets/kids-stories/${p.slice(0, 2)}-${p.slice(2)}.webp`; return `<div class="pp" data-k="${k}"><img class="pbg" src="${url(f)}"><img class="part" src="${url(f)}"></div>`; }).join('')}</div>`).join('');
  return `<!doctype html><html lang="hi"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@600;700&family=Mukta:wght@600;800&display=block">
<style>*{margin:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;overflow:hidden;background:#140803}
svg{position:absolute;inset:0}.pscene,.pp{position:absolute;inset:0;opacity:0}
.pbg{position:absolute;inset:-6%;width:112%;height:112%;object-fit:cover;filter:blur(28px) brightness(.55)}
.part{position:absolute;left:0;top:600px;width:${W}px;transform-origin:50% 45%}
.head{position:absolute;left:0;right:0;top:290px;text-align:center;z-index:5}
.pill{display:inline-block;padding:4px 24px 0;font:700 32px/1.5 ${dev};color:${style === 'puppet' ? '#F3DFAE' : style === 'patta' ? '#120B06' : '#5A1A08'};background:${style === 'puppet' ? '#6E1A10' : style === 'patta' ? '#F0B53C' : '#FFF4DF'};border-radius:${style === 'patta' ? 6 : 30}px;border:${style === 'patta' ? '3px solid #120B06' : style === 'puppet' ? '3px solid #E2A62B' : '0'}}
.sub{position:absolute;left:60px;width:960px;top:62px;padding:12px 26px 10px;font:700 46px/1.42 ${dev};opacity:0;${card}}
.chip{position:absolute;left:0;right:0;top:300px;text-align:center;opacity:0;z-index:6}
.chip span{display:inline-block;padding:8px 28px 2px;border-radius:999px;background:#FFC94A;color:#2B0E06;font:800 38px/1.4 'Mukta';box-shadow:0 8px 20px rgba(0,0,0,.35);transform:rotate(-2deg)}
.cap{position:absolute;left:50px;width:980px;top:470px;text-align:center;font:800 84px/1.18 'Mukta';color:#FFFFFF;-webkit-text-stroke:0;paint-order:stroke;text-shadow:0 0 2px #000,0 4px 0 #000,0 6px 18px rgba(0,0,0,.7);opacity:0;z-index:6}
.cap b{color:#FFC94A}
.brand{position:absolute;left:0;right:0;top:176px;text-align:center;z-index:7}
.brand span{display:inline-flex;align-items:center;gap:12px;padding:6px 22px 6px 8px;border-radius:999px;background:rgba(20,8,3,.62);border:2px solid rgba(226,166,43,.75);color:#FFF1D5;font:700 30px/1 'Mukta'}
.brand img{width:46px;height:46px;border-radius:12px}
.brand i{font-style:normal;color:#FFC94A}
.cta .h{margin-top:12px;font:700 34px/1.3 'Mukta';color:#6E1A10}
.ctr{position:absolute;left:0;right:0;top:388px;text-align:center;z-index:6;opacity:0}
.ctr span{display:inline-block;padding:4px 22px 0;border-radius:999px;background:#6E1A10;border:3px solid #E2A62B;color:#FFE7B0;font:700 32px/1.45 'Mukta'}
.ctr b{color:#FFC94A}
.cta{position:absolute;left:110px;width:860px;top:690px;padding:30px 30px 26px;border-radius:30px;background:#FFF1D5;border:4px solid #E2A62B;box-shadow:0 26px 60px rgba(0,0,0,.45);text-align:center;opacity:0;z-index:6}
.cta .row{display:flex;justify-content:center;align-items:center;gap:22px}.cta .icon{width:110px;height:110px;border-radius:26px}.cta .mark{height:96px}
.cta .t{margin-top:10px;font:700 40px/1.4 'Noto Serif Devanagari';color:#5A3A1E}
.cta .b{margin:16px auto 0;width:560px;padding:14px 0 8px;border-radius:999px;background:linear-gradient(180deg,#C4321A,#8E1B08);color:#FFF4DF;font:700 44px/1.3 'Noto Serif Devanagari'}
.flash{position:absolute;inset:0;background:#FFF6D8;opacity:0;z-index:4;pointer-events:none}
</style></head><body>${painted}
<svg viewBox="0 0 ${W} ${H}"><defs><radialGradient id="lamp" cx="50%" cy="52%" r="60%"><stop offset="0" stop-color="#B5561C" stop-opacity=".95"/><stop offset=".55" stop-color="#7A2E10" stop-opacity=".55"/><stop offset="1" stop-color="#2B0E06" stop-opacity="0"/></radialGradient>
<pattern id="pf" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#120B06"/>${[0, 1, 2, 3, 4].map(k => `<ellipse cx="${30 + 11 * Math.cos(k * 1.2566)}" cy="${30 + 11 * Math.sin(k * 1.2566)}" rx="7" ry="7" fill="#FFF7E2"/>`).join('')}<circle cx="30" cy="30" r="6" fill="#F0B53C"/></pattern></defs>
${folk ? scenes.map((sc, i) => folkScene(style, sc, i)).join('') : ''}
${style === 'puppet' ? `<g>${zig()}</g>` : ''}</svg>
<div class="flash"></div>
${script.brand ? `<div class="brand"><span><img src="${url('mobile/assets/icon.png')}">${esc(script.brand.name)} · <i>${esc(script.brand.handle)}</i></span></div>` : ''}${counter ? `<div class="ctr"><span>${esc(counter.label)}: <b class="n">0</b>/${counter.total}</span></div>` : ''}${ig ? scenes.map((sc, i) => `<div class="chip" data-i="${i}"><span>${esc(sc.chip || script.title)}</span></div>` + sc.caps.map(c => `<div class="cap" data-s="${c.s.toFixed(3)}" data-e="${c.e.toFixed(3)}">${hl(c.text)}</div>`).join('')).join('')
  : `<div class="head"><span class="pill">${esc(script.title)}</span>${scenes.map((sc, i) => `<div class="sub" data-i="${i}">${esc(sc.text)}</div>`).join('')}</div>`}
<div class="cta"><div class="row"><img class="icon" src="${url('mobile/assets/icon.png')}"><img class="mark" src="${url('mobile/assets/branding/wordmarks/hindi.png')}"></div><div class="t">${esc(script.cta.line)}</div><div class="b">${esc(script.cta.button)}</div>${script.brand ? `<div class="h">फ़ॉलो करें ${esc(script.brand.handle)}</div>` : ''}</div>
<script>
const CTA_AT=${script.ctaAfterVo ? (scenes.at(-1).voAt + scenes.at(-1).vo.seconds + 0.15).toFixed(3) : 'null'};
const CTR=${JSON.stringify(counter ? counter.at : null)},IG=${ig},SHK=${JSON.stringify(scenes.map(sc => (style !== 'painted' && FOLK[sc.id] && FOLK[sc.id].shake) || []))};
const SC=${JSON.stringify(scenes.map(s => ({start: s.start, dur: s.dur, id: s.id, pages: s.pages ? s.pages.length : 0})))},CASTS=${JSON.stringify(casts)},FX=${JSON.stringify(scenes.map(s => (folk ? FOLK[s.id].fx : null) || []))},T=${T};
const clamp=x=>Math.max(0,Math.min(1,x)),eo=x=>1-Math.pow(1-clamp(x),3),eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},lerp=(a,b,p)=>a+(b-a)*p;
const back=x=>{x=clamp(x);const c=1.5;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const MO={idle:()=>({}),sunPulse:(c,u)=>({s:c.s*(1+.03*Math.sin(u*2.2))}),
 flyIn:(c,u,d)=>{const p=eio(u/d);return{x:lerp(190,520,p),y:lerp(1700,1230,p)+Math.sin(u*3)*8}},
 flyIn2:(c,u,d)=>{const p=eio(u/d);return{x:lerp(150,600,p),y:lerp(1650,1080,p)+Math.sin(u*3)*8}},
 follow:(c,u,d)=>{const p=eo(u/d);return{x:lerp(-150,320,p),y:lerp(1750,1330,p)+Math.sin(u*2)*10}},
 walkLeft:(c,u,d)=>({x:lerp(c.x,140,eio(u/d)),y:c.y-Math.abs(Math.sin(u*5))*8}),
 hungry:(c,u)=>({y:c.y+Math.sin(u*4)*6,rot:Math.sin(u*2)*4}),
 sunRise:(c,u,d)=>({y:lerp(1520,900,eo(u/(d*.8)))}),reach:(c,u)=>({y:c.y-Math.abs(Math.sin(u*3))*10}),
 rahuPass:(c,u,d)=>{const p=u/d;if(p<.5)return{x:lerp(1350,880,eo(p/.5)),y:900};return{x:lerp(880,-350,eio((p-.5)/.5)),y:lerp(900,1100,(p-.5)/.5),rot:-(p-.5)*30}},
 appearLate:(c,u,d)=>{const p=clamp((u-.5*d)/(.35*d));return{op:p,y:c.y+(1-eo(p))*60}},
 fall:(c,u,d)=>{if(u<.56*d){const q=eo(u/(.56*d));return{x:lerp(60,430,q),y:lerp(1260,1060,q)}}const f=u-.56*d;return{x:430+f*110,y:1060+f*f*130,rot:-25+Math.min(f,1.1)*190}},
 grieve:(c,u)=>({y:c.y+Math.sin(u*1.5)*4}),revive:(c,u,d)=>{const p=clamp((u-.12*d)/.6);return{s:c.s*(.45+.55*back(p)),op:clamp(p*2.5)}},
 hover:(c,u)=>({y:c.y+Math.sin(u*2)*12}),
 emerge:(c,u,d)=>({y:lerp(1850,c.y,eo(u/(d*.45)))}),emergeFast:(c,u,d)=>({y:lerp(1480,c.y,eo(u/.8))}),
 churn:(c,u)=>({rot:c.rot+Math.sin(u*2.4)*5}),tug:(c,u)=>({x:c.x-Math.sin(u*2.4)*14,rot:c.rot-Math.sin(u*2.4)*4*c.flip}),
 popAt:(c,u,d)=>{const p=clamp((u-(c.o.t0||0)*d)/.55);return{s:c.s*(.3+.7*back(p)),op:clamp(p*3),y:c.y-(1-eo(p))*-120}},
 drift:(c,u)=>({x:c.x+Math.sin(u*.9+(c.o.phase||0))*34}),
 walkTo:(c,u,d)=>({x:lerp(-220,c.o.x,eo(u/(d*.45))),y:c.y-(u<d*.45?Math.abs(Math.sin(u*6))*8:0)}),
 slideTo:(c,u,d)=>{const p=eio((u-(c.o.t0||0)*d)/(d*.35));return{x:lerp(c.x,c.o.x,p),y:c.y-Math.abs(Math.sin(p*Math.PI))*40}},
 walkIn:(c,u,d)=>({x:lerp(-220,c.x,eo(u/(d*.42))),y:c.y-(u<d*.42?Math.abs(Math.sin(u*6))*8:0)}),
 defeat:(c,u,d)=>{const f=clamp((u-.55*d)/(.3*d));return{rot:c.rot+f*70*c.flip,y:c.y+f*180,op:1-f*.75}},
 fadeOut:(c,u,d)=>({op:1-clamp((u-.6*d)/(.25*d)),y:c.y+Math.sin(u*1.5)*8})};
const vis=(i,t)=>{const s=SC[i],u=t-s.start,last=i===SC.length-1;if(u<0||(!last&&u>s.dur+T))return 0;return Math.min(i===0?1:clamp(u/T),last?1:1-clamp((u-s.dur)/T));};
window.renderAt=t=>{
  document.querySelectorAll('.scene').forEach((g,i)=>{const o=vis(i,t);g.setAttribute('opacity',o);g.style.display=o>0?'':'none';if(!o)return;
    if(IG){const u0=t-SC[i].start,k=1+.07*(1-eo(u0/.35));let sx=0,sy=0;for(const f of SHK[i]){const q=u0-f*SC[i].dur;if(q>0&&q<.35){const a=(1-q/.35)*12;sx=Math.sin(q*90)*a;sy=Math.cos(q*77)*a;}}
      g.setAttribute('transform','translate('+(540+sx)+','+(960+sy)+') scale('+k+') translate(-540,-960)');}
    const u=t-SC[i].start,d=SC[i].dur;
    CASTS[i].forEach((c,n)=>{const r={x:c.x,y:c.y,rot:c.rot,s:c.s,op:1,...MO[c.m](c,u,d)};
      const M=new DOMMatrix().translate(r.x,r.y).rotate(r.rot).scale(r.s*c.flip,r.s),by={},cache={};c.parts.forEach(p=>by[p.id]=p);
      const world=id=>{if(cache[id])return cache[id];const p=by[id],pm=p.parent?world(p.parent):M;const a=(p.base||0)+(p.amp||0)*Math.sin(2*Math.PI*(p.freq||1)*t+(p.phase||0))+(p.spin||0)*t;return cache[id]=pm.translate(p.at[0],p.at[1]).rotate(a);};
      c.parts.forEach(p=>{const m=world(p.id),el=document.getElementById('s'+i+'c'+n+'-'+p.id);el.setAttribute('transform','matrix('+[m.a,m.b,m.c,m.d,m.e,m.f].join(',')+')');el.setAttribute('opacity',r.op);});});
    g.querySelectorAll('.glow').forEach(e=>e.setAttribute('opacity',(.82+.07*Math.sin(t*13)+.05*Math.sin(t*7.3)).toFixed(3)));
    g.querySelectorAll('.lbl').forEach(e=>{const p=clamp((u-(+e.dataset.t0)*d)/.4);e.setAttribute('opacity',p);});
    g.querySelectorAll('.rain').forEach((e,k)=>{const y=((u*900+k*137)%1100);e.setAttribute('transform','translate(0,'+(y-550).toFixed(0)+')');e.setAttribute('opacity',(.75*(1-clamp((u-.8*d)/(.15*d)))).toFixed(2));});
    g.querySelectorAll('.wind').forEach((e,k)=>e.setAttribute('stroke-dashoffset',(-(u*900+k*260)%1560).toFixed(0)));
    g.querySelectorAll('.petal').forEach(e=>{const x=+e.dataset.x+Math.sin(u*1.6+ +e.dataset.p)*40,y=520+((u*+e.dataset.v+ +e.dataset.p*200)%1300);e.setAttribute('cx',x.toFixed(1));e.setAttribute('cy',y.toFixed(1));e.setAttribute('opacity',clamp(u/1.2));});
  });
  document.querySelectorAll('.pscene').forEach((g,i)=>{const o=vis(i,t);g.style.opacity=o;if(!o)return;const u=t-SC[i].start,d=SC[i].dur,n=SC[i].pages;
    g.querySelectorAll('.pp').forEach((p,k)=>{const a=n===1?1:(k===0?1-clamp((u-d/2)/.4):clamp((u-d/2)/.4));p.style.opacity=a;
      p.querySelector('.part').style.transform='scale('+((i+k)%2?1.1-.07*u/d:1.03+.07*u/d)+')';});});
  document.querySelectorAll('.sub').forEach((e,i)=>{const s=SC[i],u=t-s.start;const o=Math.min(clamp((u-.05)/.25),vis(i,t)?1:0)*(u<s.dur?1:1-clamp((u-s.dur)/T));e.style.opacity=o;});
  const vi=SC.findIndex(s=>s.id==='vajra'),fl=document.querySelector('.flash');
  if(vi>=0&&FX[vi].includes('flash')){const u=t-SC[vi].start-.56*SC[vi].dur;fl.style.opacity=u<0||u>.6?0:(u<.06?u/.06:1-(u-.06)/.54)*.9;}else fl.style.opacity=0;
  if(CTR){const el=document.querySelector('.ctr'),n=CTR.filter(x=>t>=x).length,last=CTR.filter(x=>t>=x).pop();el.style.opacity=1;el.querySelector('.n').textContent=n;
    const q=last===undefined?9:t-last;el.style.transform='scale('+(q<.35?1+.25*(1-q/.35):1)+')';}
  if(IG){document.querySelectorAll('.chip').forEach((e,i)=>{const s=SC[i],u=t-s.start;const on=u>=0&&u<s.dur+(i===SC.length-1?99:0);e.style.opacity=on?(i===0?1:clamp(u/.12)):0;e.style.transform='scale('+(on?(.7+.3*back(u/.3)):1)+')';});
    document.querySelectorAll('.cap').forEach(e=>{const s=+e.dataset.s,en=+e.dataset.e,u=t-s;const on=t>=s&&t<en;e.style.opacity=on?clamp(u/.06):0;e.style.transform='scale('+(on?(.82+.18*back(u/.18)):1)+')';});}
  const L=SC[SC.length-1],cu=t-(CTA_AT!==null?CTA_AT:L.start+.4),cta=document.querySelector('.cta');cta.style.opacity=clamp(cu/.3);cta.style.transform='translateY('+(1-back(cu/.5))*80+'px)';
};
</script></body></html>`;
}

function zig() {
  const pal = PALETTES.puppet; let o = '';
  const row = (y, h, a, b) => { for (let k = 0; k < 22; k++) { const s = W / 22, x = k * s; o += `<path d="M${x},${y + h}L${x + s / 2},${y}L${x + s},${y + h}Z" fill="${k % 2 ? a : b}"/>`; } };
  row(0, 54, pal.red, pal.gold); row(H - 54, 54, pal.gold, pal.red);
  for (const side of [0, 1]) for (let k = 0; k < 34; k++) { const s = (H - 108) / 34, y = 54 + k * s; o += side ? `<path d="M${W},${y}L${W - 34},${y + s / 2}L${W},${y + s}Z" fill="${k % 2 ? pal.red : pal.gold}"/>` : `<path d="M0,${y}L34,${y + s / 2}L0,${y + s}Z" fill="${k % 2 ? pal.red : pal.gold}"/>`; }
  return o;
}

fs.mkdirSync(out, {recursive: true});
const music = path.join(out, 'tanpura.wav');
if (!preview && bed === 'tanpura' && !fs.existsSync(music)) run('python3', [path.join(root, 'marketing/reels/showcases/feature-tour/music.py'), music, String(TOTAL), String(scenes.at(-1).start)]);
const browser = await chromium.launch();
try {
  for (const style of styles) {
    if (remux) { mixAudio(path.join(out, `${story}-${style}.mp4`), path.join(out, `${story}-${style}-${bed === 'none' ? 'voice' : bed}.mp4`)); continue; }
    const html = path.join(out, `${style}.html`); fs.writeFileSync(html, page(style));
    const pg = await browser.newPage({viewport: {width: W, height: H}});
    await pg.goto(pathToFileURL(html).href, {waitUntil: 'networkidle'});
    await pg.evaluate(async () => { await Promise.all([['700 40px "Noto Serif Devanagari"', 'हिं'], ['800 40px Mukta', 'हिं']].map(([f, s]) => document.fonts.load(f, s))); await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
    const stills = path.join(out, `stills-${style}`); fs.rmSync(stills, {recursive: true, force: true}); fs.mkdirSync(stills);
    const stillAt = new Map(scenes.map(s => [Math.round((s.start + s.dur * 0.62) * FPS), s.id]));
    const frames = Math.round(TOTAL * FPS), video = path.join(out, `${style}-video.mp4`);
    const ff = preview ? null : spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', video]);
    const done = ff && new Promise((res, rej) => ff.on('close', c => c ? rej(Error('ffmpeg ' + c)) : res()));
    for (let f = 0; f < frames; f++) {
      if (preview && !stillAt.has(f)) continue;
      await pg.evaluate(t => window.renderAt(t), f / FPS);
      const buf = await pg.screenshot({type: 'jpeg', quality: 92});
      if (stillAt.has(f)) fs.writeFileSync(path.join(stills, `${String(f).padStart(4, '0')}-${stillAt.get(f)}.jpg`), buf);
      if (ff && !ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    await pg.close();
    run('ffmpeg', ['-y', '-loglevel', 'error', '-pattern_type', 'glob', '-i', path.join(stills, '*.jpg'), '-vf', 'scale=240:426,tile=9x1:padding=4:color=white', '-frames:v', '1', path.join(out, `review-${style}.jpg`)]);
    if (preview) { console.log(style, 'stills'); continue; }
    ff.stdin.end(); await done;
    const final = path.join(out, `${story}-${style}.mp4`);
    mixAudio(video, final);
    fs.rmSync(video); console.log(final);
  }
} finally { await browser.close(); }

function mixAudio(videoSrc, final) {
  const vox = scenes.map((s, k) => `[${k + 1}:a]aresample=48000,highpass=f=90,equalizer=f=220:t=q:w=1:g=2.5,equalizer=f=6500:t=q:w=2:g=-3,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,aecho=0.85:0.5:38|61:0.14|0.09,aformat=channel_layouts=stereo,adelay=${Math.round(s.voAt * 1000)}:all=1,apad=whole_dur=${TOTAL}[v${k}]`).join(';');
  const mixVo = `${scenes.map((_, k) => `[v${k}]`).join('')}amix=inputs=${scenes.length}:normalize=0:duration=longest`;
  const inputs = ['-i', videoSrc, ...scenes.flatMap(s => ['-i', s.voFile])];
  let graph;
  if (bed === 'tanpura') {
    inputs.push('-i', music);
    graph = `${vox};${mixVo},volume=1.5,asplit[vo][key];[${scenes.length + 1}:a]volume=0.8[bd];[bd][key]sidechaincompress=threshold=0.015:ratio=6:attack=15:release=400[duck];[duck][vo]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`;
  } else graph = `${vox};${mixVo},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`;
  run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', graph, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-t', String(TOTAL), '-movflags', '+faststart', final]);
  console.log(final);
}
