// Story-reel style test: 3 stories × 3 art styles as 6.5 s teasers (1080x1920), a 3×3 contact sheet and one
// labelled comparison reel. Puppet (Tholu Bommalata) and Pattachitra figures are original SVG drawn in
// characters.mjs; "painted" uses the app's own reviewed story art. Captions quote the app's sourced story text.
// Usage: node build.mjs [--out <dir>] [--preview]
import fs from 'node:fs';
import path from 'node:path';
import {spawn, execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {CHARACTERS, PALETTES, shapeSvg} from './characters.mjs';

const require = createRequire(import.meta.url);
const {chromium} = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const i0 = process.argv.indexOf('--out');
const out = path.resolve(i0 > -1 ? process.argv[i0 + 1] : path.join(root, 'marketing/reels/out/story-styles'));
const preview = process.argv.includes('--preview');
fs.mkdirSync(out, {recursive: true});
const W = 1080, H = 1920, FPS = 30, DUR = 6.5, SWAP = 4.6;
const url = rel => pathToFileURL(path.join(root, rel)).href;
const esc = t => String(t).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const run = (bin, args) => execFileSync(bin, args, {stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26}).toString();

// Caption text is quoted from the app's sourced kids' stories (hanuman-sun.json hs01/hs02, ganesha-birth.json gb07).
const STORIES = {
  hanuman: {header: 'भाग 1 · हनुमान और सूर्य', main: 'हनुमान ने आकाश में छलाँग लगाई', sub: 'To little Hanuman, the rising sun looked like a ripe fruit',
    end: 'पूरी कथा वेदांश ऐप में पढ़ें', painted: 'mobile/assets/kids-stories/hs-02.webp', label: 'Hanuman & Surya'},
  ganesha: {header: 'भाग 1 · गणेश जन्म', main: 'गणेश, सबसे पहले पूज्य', sub: 'The gods blessed Ganesha to be honoured first in worship',
    end: 'पूरी कथा वेदांश ऐप में पढ़ें', painted: 'mobile/assets/kids-stories/gb-07.webp', label: 'Ganesha'},
  shani: {header: 'भाग 1 · शनि देव और रावण', main: 'शनि देव और रावण', sub: 'Coming soon on Vedansh',
    end: 'जल्द ही वेदांश ऐप में', painted: 'mobile/assets/devotional-share/master-shani.webp', cropTop: 0.42, label: 'Shani & Ravana (unsourced: title mock)'},
};
const STYLE_LABEL = {puppet: 'Tholu Bommalata puppets', patta: 'Pattachitra', painted: "App's painted art"};

// Character placements per story: [char, x, y, scale, rotate, flip, motion]
const CAST = {
  hanuman: [['surya', 800, 780, 1.55, 0, 1, 'sun'], ['hanuman', 300, 1520, 1.75, -28, 1, 'fly']],
  ganesha: [['ganesha', 540, 1290, 1.8, 0, 1, 'rise'], ['mushak', 880, 1592, 1.0, 0, -1, 'scurry']],
  shani: [['ravana', 320, 1300, 1.3, 0, 1, 'inL'], ['shani', 800, 1300, 1.35, 0, -1, 'inR'], ['crow', 905, 740, 0.95, 0, -1, 'hover']],
};

let rng = 7;
const rand = () => ((rng = (rng * 16807) % 2147483647) / 2147483647);

function zigzag(x, y, w, h, n, a, b, vertical) {
  let o = '';
  for (let k = 0; k < n; k++) {
    if (!vertical) { const s = w / n, x0 = x + k * s; o += `<path d="M${x0},${y + h}L${x0 + s / 2},${y}L${x0 + s},${y + h}Z" fill="${k % 2 ? a : b}"/>`; }
    else { const s = h / n, y0 = y + k * s; o += `<path d="M${x},${y0}L${x + w},${y0 + s / 2}L${x},${y0 + s}Z" fill="${k % 2 ? a : b}"/>`; }
  }
  return o;
}

function background(style, story) {
  const pal = PALETTES[style];
  if (style === 'puppet') {
    const dot = (d) => `<path d="${d}" fill="none" stroke="${pal.deco}" stroke-width="3.4" stroke-dasharray="0.01 12" stroke-linecap="round" opacity=".75"/>`;
    let o = `<rect width="${W}" height="${H}" fill="#2B0E06"/>
      <defs><radialGradient id="lamp" cx="50%" cy="52%" r="60%"><stop offset="0" stop-color="#B5561C" stop-opacity=".95"/><stop offset=".55" stop-color="#7A2E10" stop-opacity=".55"/><stop offset="1" stop-color="#2B0E06" stop-opacity="0"/></radialGradient></defs>
      <rect id="glow" width="${W}" height="${H}" fill="url(#lamp)"/>`;
    if (story === 'hanuman') o += [[-60, 1700, 380, 1180], [240, 1720, 620, 1250], [560, 1700, 1140, 1210]].map(([a, b, c, top]) => { const d = `M${a},${b}L${(a + c) / 2},${top}L${c},${b}Z`; return `<path d="${d}" fill="#4A1C0C" stroke="#170904" stroke-width="8"/>${dot(d)}`; }).join('');
    if (story === 'ganesha') { const arch = 'M190,1500 L190,820 Q190,560 540,520 Q890,560 890,820 L890,1500Z'; o += `<path d="${arch}" fill="#5A2210" stroke="#170904" stroke-width="9"/>${dot(arch)}`; }
    if (story === 'shani') for (const x of [60, 930]) { const d = `M${x},1640 L${x},700 L${x + 90},700 L${x + 90},1640Z`; o += `<path d="${d}" fill="#4A1C0C" stroke="#170904" stroke-width="8"/>${dot(d)}<path d="M${x - 20},700 L${x + 110},700 L${x + 95},660 L${x - 5},660Z" fill="${pal.gold}" stroke="#170904" stroke-width="6"/>`; }
    const floor = `M0,1640 L${W},1640 L${W},${H} L0,${H}Z`;
    o += `<path d="${floor}" fill="#3A1508"/>${dot(`M30,1662 L${W - 30},1662`)}`;
    if (story === 'ganesha') for (const x of [250, 830]) o += `<g class="diya" data-x="${x}"><path d="M${x - 60},1610 Q${x},1680 ${x + 60},1610Z" fill="${pal.gold}" stroke="#170904" stroke-width="7"/><path class="flame" d="M${x},1530 Q${x + 26},1585 ${x},1606 Q${x - 26},1585 ${x},1530Z" fill="#FFB43A" stroke="#170904" stroke-width="4"/></g>`;
    o += zigzag(0, 0, W, 54, 22, pal.red, pal.gold) + zigzag(0, H - 54, W, 54, 22, pal.gold, pal.red) + zigzag(0, 54, 34, H - 108, 34, pal.red, pal.gold, true) + `<g transform="translate(${W},0) scale(-1,1)">${zigzag(0, 54, 34, H - 108, 34, pal.red, pal.gold, true)}</g>`;
    return o;
  }
  if (style === 'patta') {
    let o = `<rect width="${W}" height="${H}" fill="#120B06"/>
      <defs><pattern id="pf" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#120B06"/>
      ${[0, 1, 2, 3, 4].map(k => `<ellipse cx="${30 + 11 * Math.cos(k * 1.2566)}" cy="${30 + 11 * Math.sin(k * 1.2566)}" rx="7" ry="7" fill="#FFF7E2"/>`).join('')}<circle cx="30" cy="30" r="6" fill="#F0B53C"/></pattern></defs>
      <rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="url(#pf)"/>
      <rect x="78" y="78" width="${W - 156}" height="${H - 156}" fill="#F0B53C"/>
      <rect x="90" y="90" width="${W - 180}" height="${H - 180}" fill="#B22E1E"/>`;
    rng = 11;
    for (let k = 0; k < 70; k++) { const x = 110 + rand() * (W - 220), y = 600 + rand() * 1050; o += `<g transform="translate(${x.toFixed(0)},${y.toFixed(0)})" opacity=".85">${[0, 1, 2, 3, 4].map(q => `<circle cx="${(6 * Math.cos(q * 1.2566)).toFixed(1)}" cy="${(6 * Math.sin(q * 1.2566)).toFixed(1)}" r="3.4" fill="#FFF3D6"/>`).join('')}</g>`; }
    const outline = 'stroke="#120B06" stroke-width="6"';
    if (story === 'hanuman') for (let k = 0; k < 7; k++) o += `<path d="M${90 + k * 140},1830 a90,90 0 0 1 180,0Z" fill="#3E7A35" ${outline}/><path d="M${120 + k * 140},1830 a60,60 0 0 1 120,0" fill="none" stroke="#FFF7E2" stroke-width="2" stroke-dasharray="5 6"/>`;
    if (story === 'ganesha') o += `<path d="M200,1560 L200,860 Q200,650 380,600 L540,470 L700,600 Q880,650 880,860 L880,1560Z" fill="#F0B53C" ${outline}/><path d="M240,1560 L240,880 Q240,700 400,650 L540,540 L680,650 Q840,700 840,880 L840,1560Z" fill="#22356F" ${outline}/>`;
    for (const x of story === 'ganesha' ? [] : [120, 960]) o += `<rect x="${x - 10}" y="1380" width="20" height="440" fill="#5A2E14" ${outline}/><circle cx="${x}" cy="1360" r="90" fill="#3E7A35" ${outline}/>${Array.from({length: 14}, (_, q) => `<ellipse cx="${x + 60 * Math.cos(q * 0.45)}" cy="${1360 + 55 * Math.sin(q * 0.45)}" rx="9" ry="5" fill="#FFF7E2" transform="rotate(${q * 26} ${x + 60 * Math.cos(q * 0.45)} ${1360 + 55 * Math.sin(q * 0.45)})"/>`).join('')}`;
    if (story === 'shani') o += `<rect x="90" y="1660" width="${W - 180}" height="170" fill="#120B06"/>${Array.from({length: 18}, (_, q) => `<rect x="${90 + q * 50}" y="1680" width="25" height="25" fill="#F8E8C5"/>`).join('')}`;
    return o;
  }
  return '';
}

function castSvg(style, story) {
  return CAST[story].map(([name], n) => {
    const parts = CHARACTERS[name];
    const order = [...parts.filter(p => p.first), ...parts.filter(p => !p.first)];
    return order.map(p => `<g id="c${n}-${p.id}">${p.shapes.map(sh => shapeSvg(sh, style)).join('')}</g>`).join('');
  }).join('');
}

function page(style, story) {
  const st = STORIES[story];
  const dev = "'Noto Serif Devanagari'";
  const card = {
    puppet: `background:#F3DFAE;border:7px solid #170904;box-shadow:inset 0 0 0 5px #F3DFAE,inset 0 0 0 8px #6E1A10;color:#5A1208`,
    patta: `background:#FFF4D8;border:8px double #120B06;box-shadow:0 0 0 6px #F0B53C;color:#120B06`,
    painted: `background:#7A1D0C;border:3px solid #E7B864;color:#FFF4DF;border-radius:20px`}[style];
  const font = style === 'painted' ? "'Mukta'" : dev;
  const cast = CAST[story].map(([name, x, y, sc, rot, flip, motion]) => ({x, y, sc, rot, flip, motion, parts: CHARACTERS[name].map(({shapes, ...p}) => p)}));
  const painted = style !== 'painted' ? '' : st.cropTop
    ? `<img class="pbg" src="${url(st.painted)}" style="object-position:50% 0"><div class="part" style="height:1100px;overflow:hidden"><img src="${url(st.painted)}" style="position:absolute;width:${Math.round(W * 1100 / (st.cropTop * 1456))}px;left:50%;transform:translateX(-50%);top:0"></div>`
    : `<img class="pbg" src="${url(st.painted)}"><img class="part" src="${url(st.painted)}">`;
  return `<!doctype html><html lang="hi"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@600;700&family=Cormorant+Garamond:wght@700&family=Mukta:wght@600;800&display=block">
<style>*{margin:0;box-sizing:border-box}html,body{width:${W}px;height:${H}px;overflow:hidden;background:#140803}
svg{position:absolute;inset:0}
.pbg{position:absolute;inset:-6%;width:112%;height:112%;object-fit:cover;filter:blur(28px) brightness(.55)}
.part{position:absolute;left:0;top:470px;width:${W}px;transform-origin:50% 40%}
.head{position:absolute;left:0;right:0;top:296px;text-align:center;z-index:5}
.pill{display:inline-block;padding:${style === 'painted' ? '6px 26px 2px' : '4px 26px 0'};font:700 34px/1.5 ${font};color:${style === 'puppet' ? '#F3DFAE' : style === 'patta' ? '#120B06' : '#5A1A08'};background:${style === 'puppet' ? '#6E1A10' : style === 'patta' ? '#F0B53C' : '#FFF4DF'};border-radius:${style === 'patta' ? 6 : 30}px;border:${style === 'patta' ? '3px solid #120B06' : style === 'puppet' ? '3px solid #E2A62B' : '0'}}
.card{position:relative;margin:16px auto 0;width:930px;padding:${style === 'painted' ? '14px 26px 16px' : '10px 26px 16px'};${card}}
.card .m{font:${style === 'painted' ? 800 : 700} 62px/1.35 ${font}}
.card .s{font:700 34px/1.2 ${style === 'painted' ? "'Mukta'" : "'Cormorant Garamond'"};opacity:.92}
.card.end{position:absolute;left:75px;top:0;margin:0;opacity:0}
</style></head><body>${painted}
<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${background(style, story)}${style === 'painted' ? '' : castSvg(style, story)}</svg>
<div class="head"><span class="pill">${esc(st.header)}</span>
<div class="card c1"><div class="m">${esc(st.main)}</div><div class="s">${esc(st.sub)}</div></div>
<div class="card end" style="top:${style === 'painted' ? 68 : 66}px"><div class="m">${esc(st.end)}</div><div class="s">Vedansh · वेदांश</div></div></div>
<script>
const CAST=${JSON.stringify(style === 'painted' ? [] : cast)};
const clamp=x=>Math.max(0,Math.min(1,x)),eo=x=>1-Math.pow(1-clamp(x),3),eio=x=>{x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},lerp=(a,b,p)=>a+(b-a)*p;
const back=x=>{x=clamp(x);const c=1.5;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
function place(c,t){let x=c.x,y=c.y,r=c.rot,s=c.sc;
  if(c.motion==='fly'){const p=eio(t/5.2);x=lerp(190,520,p);y=lerp(1700,1230,p)+Math.sin(t*3)*8;}
  if(c.motion==='sun'){s=c.sc*(1+.03*Math.sin(t*2.2));}
  if(c.motion==='rise'){y=c.y+(1-eo(t/.9))*80;}
  if(c.motion==='scurry'){x=lerp(1180,880,eo((t-.6)/1.4));y=c.y-Math.abs(Math.sin(t*9))*6*(t<2?1:0);}
  if(c.motion==='inL'){x=lerp(-200,c.x,eo(t/1.1));}
  if(c.motion==='inR'){x=lerp(1280,c.x,eo((t-.15)/1.1));}
  if(c.motion==='hover'){x=c.x+Math.sin(t*1.3)*30;y=c.y+Math.sin(t*2.1)*18;}
  return new DOMMatrix().translate(x,y).rotate(r).scale(s*c.flip,s);}
window.renderAt=t=>{
  CAST.forEach((c,n)=>{const M=place(c,t),cache={};const by=Object.fromEntries(c.parts.map(p=>[p.id,p]));
    const world=id=>{if(cache[id])return cache[id];const p=by[id];const pm=p.parent?world(p.parent):M;
      const a=(p.base||0)+(p.amp||0)*Math.sin(2*Math.PI*(p.freq||1)*t+(p.phase||0))+(p.spin||0)*t;return cache[id]=pm.translate(p.at[0],p.at[1]).rotate(a);};
    for(const p of c.parts){const m=world(p.id);document.getElementById('c'+n+'-'+p.id).setAttribute('transform','matrix('+[m.a,m.b,m.c,m.d,m.e,m.f].join(',')+')');}});
  const g=document.getElementById('glow');if(g)g.setAttribute('opacity',(.82+.07*Math.sin(t*13)+.05*Math.sin(t*7.3)).toFixed(3));
  document.querySelectorAll('.flame').forEach((f,k)=>{const sc=1+.08*Math.sin(t*11+k)+.05*Math.sin(t*17+k*2);const x=+f.parentNode.dataset.x;f.setAttribute('transform','translate('+x+',1606) scale('+(2-sc).toFixed(3)+','+sc.toFixed(3)+') translate('+(-x)+',-1606)');});
  const art=document.querySelector('.part');if(art)art.style.transform='scale('+(1.02+.07*t/${DUR})+')';
  const c1=document.querySelector('.c1'),e=document.querySelector('.end'),p=document.querySelector('.pill');
  const ci=t<${SWAP}?eo((t+.25)/.45):1-eo((t-${SWAP})/.3);c1.style.opacity=ci;c1.style.transform='scale('+(.85+.15*back((t+.25)/.5))+')';
  e.style.opacity=clamp((t-${SWAP}-.15)/.3);e.style.transform='scale('+(.85+.15*back((t-${SWAP}-.15)/.45))+')';p.style.opacity=1;
};
</script></body></html>`;
}

const music = path.join(out, 'tanpura.wav');
if (!preview) run('python3', [path.join(root, 'marketing/reels/showcases/feature-tour/music.py'), music, String(DUR + 0.2)]);
const browser = await chromium.launch();
const made = [];
try {
  for (const style of ['puppet', 'patta', 'painted']) for (const story of ['hanuman', 'ganesha', 'shani']) {
    const id = `${style}-${story}`, html = path.join(out, `${id}.html`);
    fs.writeFileSync(html, page(style, story));
    const pg = await browser.newPage({viewport: {width: W, height: H}});
    await pg.goto(pathToFileURL(html).href, {waitUntil: 'networkidle'});
    await pg.evaluate(async () => {
      await Promise.all([['700 40px "Noto Serif Devanagari"', 'हिं'], ['700 40px "Cormorant Garamond"', 'Aa'], ['800 40px Mukta', 'हिंAa']].map(([f, s]) => document.fonts.load(f, s)));
      await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode()));
    });
    await pg.evaluate(t => window.renderAt(t), 3.2);
    await pg.screenshot({path: path.join(out, `${id}.jpg`), type: 'jpeg', quality: 90});
    if (!preview) {
      const video = path.join(out, `${id}-video.mp4`);
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', video]);
      const done = new Promise((res, rej) => ff.on('close', c => c ? rej(Error('ffmpeg ' + c)) : res()));
      for (let f = 0; f < Math.round(DUR * FPS); f++) {
        await pg.evaluate(t => window.renderAt(t), f / FPS);
        const buf = await pg.screenshot({type: 'jpeg', quality: 92});
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      }
      ff.stdin.end(); await done;
      const final = path.join(out, `story-${id}.mp4`);
      run('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-i', music, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', 'loudnorm=I=-16:TP=-1.5,aresample=48000', '-c:a', 'aac', '-b:a', '160k', '-ac', '2', '-shortest', '-movflags', '+faststart', final]);
      fs.rmSync(video);
      made.push({id, style, story, file: final});
    }
    await pg.close();
    process.stdout.write(`${id}\n`);
  }
} finally { await browser.close(); }

// 3×3 contact sheet: rows = styles, columns = stories.
const tiles = ['puppet', 'patta', 'painted'].flatMap(st => ['hanuman', 'ganesha', 'shani'].map(sy => path.join(out, `${st}-${sy}.jpg`)));
run('ffmpeg', ['-y', '-loglevel', 'error', ...tiles.flatMap(t => ['-i', t]), '-filter_complex',
  tiles.map((_, k) => `[${k}]scale=360:640[t${k}]`).join(';') + ';' + tiles.map((_, k) => `[t${k}]`).join('') + 'xstack=inputs=9:layout=' +
  Array.from({length: 9}, (_, k) => `${(k % 3) * 366}_${Math.floor(k / 3) * 646}`).join('|') + ':fill=white[o]', '-map', '[o]', '-frames:v', '1', path.join(out, 'variations-3x3.jpg')]);

if (!preview) {
  // One comparison reel with a label on each teaser (font: the app's bundled Noto Serif Devanagari instance).
  const font = path.join(root, 'mobile/assets/fonts/VedanshDevotionalText.ttf');
  const parts = made.map((m, k) => {
    const lab = path.join(out, `lab-${k}.mp4`);
    const text = `${k + 1}/9  ${STYLE_LABEL[m.style]}  ·  ${STORIES[m.story].label}`.replaceAll(':', '\\:').replaceAll("'", '');
    run('ffmpeg', ['-y', '-loglevel', 'error', '-i', m.file, '-vf', `drawtext=fontfile=${font}:text='${text}':x=(w-tw)/2:y=h-150:fontsize=34:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=18`, '-c:a', 'copy', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', lab]);
    return lab;
  });
  const list = path.join(out, 'concat.txt');
  fs.writeFileSync(list, parts.map(p => `file '${p}'`).join('\n'));
  run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', path.join(out, 'story-styles-all-9.mp4')]);
  parts.forEach(p => fs.rmSync(p)); fs.rmSync(list);
}
console.log('done', out);
