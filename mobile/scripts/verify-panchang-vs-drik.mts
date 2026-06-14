// Verification harness — compares our panchang engine (Ujjain) against
// drikpanchang.com day-by-day for both Amanta and Purnimanta, over a date window.
// Fetches drik HTML (cached to /tmp/drik-cache), parses it, and diffs every field.
// Not part of the app build. Run from the mobile/ directory, e.g.:
//   START=2026-03-01 END=2027-06-15 npx tsx scripts/verify-panchang-vs-drik.mts
//   EMIT_FIXTURE=1 CACHED_ONLY=1 START=2026-03-01 END=2026-07-10 npx tsx scripts/verify-panchang-vs-drik.mts
// Note: drikpanchang rate-limits bulk fetches with a reCAPTCHA; throttle with POOL=1 DELAY=3000.
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { computePanchangForDate } from '../src/panchang/engine';
import {
  TITHI_NAMES_EN, NAKSHATRA_NAMES_EN, YOGA_NAMES_EN,
  KARANA_NAMES_EN, LUNAR_MONTH_NAMES_EN,
} from '../src/panchang/names';

const GEONAME = 1253914; // Ujjain, Madhya Pradesh (matches engine's hardcoded location)
const CACHE = '/tmp/drik-cache';
// Window: configurable via env. Covers a few months back, this month, and a year forward.
const START = process.env.START ?? '2026-06-01';
const END = process.env.END ?? '2026-06-07';

mkdirSync(CACHE, { recursive: true });

function parseISO(s: string): Date { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function iso(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function ddmmyyyy(d: Date): string { return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; }

function datesInWindow(): Date[] {
  const out: Date[] = []; const s = parseISO(START); const e = parseISO(END);
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) out.push(new Date(d));
  return out;
}

const CACHED_ONLY = process.env.CACHED_ONLY === '1';
const POOL = Number(process.env.POOL ?? 6);
const DELAY = Number(process.env.DELAY ?? 0); // ms between requests per worker (politeness)

function cacheFile(d: Date): string { return `${CACHE}/${GEONAME}-${ddmmyyyy(d).replace(/\//g, '-')}.html`; }
function cached(d: Date): string | null { const f = cacheFile(d); if (existsSync(f)) { const c = readFileSync(f, 'utf8'); if (c.length > 50000) return c; } return null; }

async function fetchDay(d: Date): Promise<string | null> {
  const c = cached(d); if (c) return c;
  if (CACHED_ONLY) return null;
  const url = `https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=${GEONAME}&date=${ddmmyyyy(d)}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } });
      const html = await res.text();
      if (html.length > 50000 && !/recaptcha/i.test(html)) { writeFileSync(cacheFile(d), html); return html; }
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  return null; // give up on this day; do not abort the run
}

// ---- drik HTML parsing ----
type DrikDay = {
  date: string; sunrise: string; sunset: string; moonrise: string;
  tithi: string; paksha: string; nakshatra: string; yoga: string; karana: string;
  weekday: string; vikramSamvat: string;
  purnimanta: { name: string; adhik: boolean; kshaya: boolean };
  amanta: { name: string; adhik: boolean; kshaya: boolean };
};

function to24(t: string): string { // "04:37 PM" -> "16:37"
  const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return '';
  let h = Number(m[1]); const min = m[2]; const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12; if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function parseDrik(html: string, date: string): DrikDay {
  let h = html.replace(/<div class="dpElementInfoPopupWrapper"[\s\S]*?<\/div>/g, ' ').replace(/<img[^>]*>/g, ' ');
  const re = /dpTableKey">\s*(?:<a[^>]*>)?\s*([^<]+?)\s*(?:<\/a>)?\s*<\/div>\s*<div class="dpTableCell dpTableValue">([\s\S]*?)<\/div>/g;
  const pairs: [string, string][] = []; let m: RegExpExecArray | null;
  while ((m = re.exec(h))) {
    const k = m[1].trim();
    const v = m[2].replace(/<[^>]+>/g, ' ').replace(/&#?[a-z0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    pairs.push([k, v]);
  }
  const first = (key: string) => (pairs.find((p) => p[0] === key) ?? ['', ''])[1];
  // Lunar-month rows share a rowspan key, so scan ALL value cells for the suffix.
  const allValues: string[] = [];
  const reV = /dpTableCell dpTableValue">([\s\S]*?)<\/div>/g; let mv: RegExpExecArray | null;
  while ((mv = reV.exec(h))) allValues.push(mv[1].replace(/<[^>]+>/g, ' ').replace(/&#?[a-z0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim());
  const monthFrom = (suffix: string) => {
    const raw = allValues.find((v) => new RegExp(`-\\s*${suffix}`).test(v)) ?? '';
    return {
      name: raw.replace(/\(.*?\)/g, '').replace(/-\s*(Purnimanta|Amanta).*/, '').trim(),
      adhik: /Adhik/i.test(raw), kshaya: /Kshaya/i.test(raw),
    };
  };
  const firstWord = (s: string) => s.replace(/\bupto\b.*/i, '').split(',')[0].trim();
  return {
    date,
    sunrise: to24(first('Sunrise')), sunset: to24(first('Sunset')), moonrise: to24(first('Moonrise')),
    tithi: firstWord(first('Tithi')), nakshatra: firstWord(first('Nakshatra')),
    yoga: firstWord(first('Yoga')), karana: firstWord(first('Karana')),
    weekday: first('Weekday'),
    paksha: /shukla/i.test(first('Paksha')) ? 'shukla' : (/krishna/i.test(first('Paksha')) ? 'krishna' : ''),
    vikramSamvat: (first('Vikram Samvat').match(/\d{4}/) ?? [''])[0],
    purnimanta: monthFrom('Purnimanta'), amanta: monthFrom('Amanta'),
  };
}

// ---- normalization (drik spelling -> engine canonical) ----
// Sanskrit transliteration treats v/w interchangeably; no two distinct panchang
// elements differ only by v/w, so fold w->v before comparing.
function norm(s: string): string { return s.toLowerCase().replace(/w/g, 'v').replace(/[^a-z]/g, ''); }
const NAK_ALIAS: Record<string, string> = { mula: 'moola', mrigashirsha: 'mrigashira', dhanishtha: 'dhanishta', shatabhishaj: 'shatabhisha', shatataraka: 'shatabhisha', purvaashadha: 'purvashadha', uttaraashadha: 'uttarashadha' };
const YOGA_ALIAS: Record<string, string> = { vishkambh: 'vishkambha', ayushmana: 'ayushman', vyatipaata: 'vyatipata', variyan: 'variyana', dhritti: 'dhriti', shobhan: 'shobhana' };
const KAR_ALIAS: Record<string, string> = { bhadra: 'vishti', baalava: 'balava', garaja: 'gara', nagava: 'naga', kinstughna: 'kimstughna', kimstughan: 'kimstughna', chatushpaada: 'chatushpada', shakuna: 'shakuni' };
const MON_ALIAS: Record<string, string> = { ashwina: 'ashwin', kartika: 'kartik', margasirsa: 'margashirsha', margashirsa: 'margashirsha', pausa: 'pausha', vaisakha: 'vaishakha', jyaistha: 'jyeshtha', asadha: 'ashadha', sravana: 'shravana' };
const TITHI_ALIAS: Record<string, string> = { sashthi: 'shashthi', chaturdasi: 'chaturdashi' };

function idxOf(names: string[], alias: Record<string, string>, value: string): number {
  const n = norm(value); const a = alias[n] ?? n;
  for (let i = 0; i < names.length; i++) { if (norm(names[i]) === a || norm(names[i]) === n) return i % names.length; }
  return -1;
}

type FieldResult = { field: string; ok: boolean; engine: string; drik: string };
const _cache = new Map<string, string>();
function cacheGet(d: Date): string { return _cache.get(iso(d))!; }

function compareDay(d: Date) {
  const date = iso(d);
  const drik = parseDrik(cacheGet(d), date);
  const eP = computePanchangForDate(d, { calendarSystem: 'purnimant' });
  const eA = computePanchangForDate(d, { calendarSystem: 'amanta' });
  const results: FieldResult[] = [];
  const add = (field: string, ok: boolean, engine: string, drik2: string) => results.push({ field, ok, engine, drik: drik2 });
  const eq = (names: string[], alias: Record<string, string>, e: string, dv: string) => {
    const ie = idxOf(names, alias, e); const id = idxOf(names, alias, dv); return ie !== -1 && ie === id;
  };

  const dWeek = ['ravi', 'soma', 'mangala', 'budha', 'guru', 'shukra', 'shani'].findIndex((p) => norm(drik.weekday).startsWith(p));
  add('weekday', eP.vara.index === dWeek, eP.vara.nameEn, drik.weekday);
  add('paksha', eP.tithi.paksha === drik.paksha, eP.tithi.paksha, drik.paksha);
  add('tithi', eq(TITHI_NAMES_EN, TITHI_ALIAS, eP.tithi.nameEn, drik.tithi), eP.tithi.nameEn, drik.tithi);
  add('nakshatra', eq(NAKSHATRA_NAMES_EN, NAK_ALIAS, eP.nakshatra.nameEn, drik.nakshatra), eP.nakshatra.nameEn, drik.nakshatra);
  add('yoga', eq(YOGA_NAMES_EN, YOGA_ALIAS, eP.yoga.nameEn, drik.yoga), eP.yoga.nameEn, drik.yoga);
  add('karana', eq(KARANA_NAMES_EN, KAR_ALIAS, eP.karana.nameEn, drik.karana), eP.karana.nameEn, drik.karana);
  add('purnimanta-month', eq(LUNAR_MONTH_NAMES_EN, MON_ALIAS, eP.lunarMonth.nameEn, drik.purnimanta.name), eP.lunarMonth.nameEn, drik.purnimanta.name + (drik.purnimanta.adhik ? ' (Adhik)' : ''));
  add('amanta-month', eq(LUNAR_MONTH_NAMES_EN, MON_ALIAS, eA.lunarMonth.nameEn, drik.amanta.name), eA.lunarMonth.nameEn, drik.amanta.name + (drik.amanta.adhik ? ' (Adhik)' : ''));
  add('adhik-flag', eP.lunarMonth.isAdhik === (drik.purnimanta.adhik || drik.amanta.adhik), String(eP.lunarMonth.isAdhik), String(drik.purnimanta.adhik || drik.amanta.adhik));
  add('vikram-samvat', String(eP.vikramSamvat) === drik.vikramSamvat, String(eP.vikramSamvat), drik.vikramSamvat);

  const eSr = `${String(eP.sunrise.getHours()).padStart(2, '0')}:${String(eP.sunrise.getMinutes()).padStart(2, '0')}`;
  const eSs = `${String(eP.sunset.getHours()).padStart(2, '0')}:${String(eP.sunset.getMinutes()).padStart(2, '0')}`;
  const minDiff = (a: string, b: string) => { const pa = a.split(':').map(Number); const pb = b.split(':').map(Number); return Math.abs((pa[0] * 60 + pa[1]) - (pb[0] * 60 + pb[1])); };
  add('sunrise(<=3m)', drik.sunrise !== '' && minDiff(eSr, drik.sunrise) <= 3, eSr, drik.sunrise);
  add('sunset(<=3m)', drik.sunset !== '' && minDiff(eSs, drik.sunset) <= 3, eSs, drik.sunset);

  return { date, drik, results };
}

async function main() {
  const allDates = datesInWindow();

  // EMIT_DUMP: write engine-only expected values + drik URLs (no fetching). Used to
  // hand off day-by-day browser verification to a browser MCP agent.
  if (process.env.EMIT_DUMP) {
    const hhmm = (x: Date) => `${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`;
    const dump = allDates.map((d) => {
      const p = computePanchangForDate(d, { calendarSystem: 'purnimant' });
      const a = computePanchangForDate(d, { calendarSystem: 'amanta' });
      return {
        date: iso(d),
        drikUrl: `https://www.drikpanchang.com/panchang/day-panchang.html?geoname-id=${GEONAME}&date=${ddmmyyyy(d)}`,
        weekday: p.vara.nameEn,
        expected: {
          tithi: p.tithi.nameEn, paksha: p.tithi.paksha,
          nakshatra: p.nakshatra.nameEn, yoga: p.yoga.nameEn, karana: p.karana.nameEn,
          purnimantaMonth: p.lunarMonth.nameEn, amantaMonth: a.lunarMonth.nameEn,
          vikramSamvat: p.vikramSamvat, sunrise: hhmm(p.sunrise), sunset: hhmm(p.sunset),
        },
      };
    });
    mkdirSync('../.context', { recursive: true });
    const out = `../.context/panchang-engine-dump.json`;
    writeFileSync(out, JSON.stringify({
      location: 'Ujjain, Madhya Pradesh (drik geoname-id=1253914)',
      generatedFor: { START, END }, count: dump.length, days: dump,
    }, null, 2));
    console.log(`Wrote engine dump (${dump.length} days) to mobile/${out}`);
    return;
  }

  console.log(`Window ${allDates.length} days (${START} .. ${END}); POOL=${POOL} DELAY=${DELAY} CACHED_ONLY=${CACHED_ONLY}`);
  let i = 0, miss = 0;
  async function worker() { while (i < allDates.length) { const idx = i++; const d = allDates[idx]; const html = await fetchDay(d); if (html) _cache.set(iso(d), html); else miss++; if (DELAY) await new Promise((r) => setTimeout(r, DELAY)); if ((idx + 1) % 25 === 0) process.stdout.write(`  processed ${idx + 1}/${allDates.length} (missing ${miss})\n`); } }
  await Promise.all(Array.from({ length: POOL }, worker));

  const dates = allDates.filter((d) => _cache.has(iso(d)));
  console.log(`Available for comparison: ${dates.length}/${allDates.length} days (missing ${allDates.length - dates.length})`);
  const days = dates.map(compareDay);
  const fields = days[0].results.map((r) => r.field);
  const fail: Record<string, { date: string; engine: string; drik: string }[]> = {};
  for (const f of fields) fail[f] = [];
  for (const day of days) for (const r of day.results) if (!r.ok) fail[r.field].push({ date: day.date, engine: r.engine, drik: r.drik });

  console.log('\n=== FIELD ACCURACY ===');
  for (const f of fields) {
    const n = fail[f].length; const total = days.length;
    console.log(`${f.padEnd(18)} ${total - n}/${total} ok` + (n ? `   (${n} mismatches)` : '   OK'));
  }
  console.log('\n=== MISMATCH DETAIL (first 40 per field) ===');
  for (const f of fields) {
    if (!fail[f].length) continue;
    console.log(`\n# ${f} (${fail[f].length})`);
    for (const x of fail[f].slice(0, 40)) console.log(`  ${x.date}: engine="${x.engine}" drik="${x.drik}"`);
  }
  const adhik = days.filter((d) => d.drik.purnimanta.adhik || d.drik.amanta.adhik).map((d) => d.date);
  if (adhik.length) console.log(`\n=== ADHIK MAAS on drik: ${adhik.length} days, ${adhik[0]} .. ${adhik[adhik.length - 1]} ===`);
  else console.log('\n=== No Adhik Maas in window per drik ===');

  writeFileSync('/tmp/panchang-compare.json', JSON.stringify({ window: { START, END }, days }, null, 2));
  console.log('\nWrote full report to /tmp/panchang-compare.json');

  if (process.env.EMIT_FIXTURE) {
    const nameAt = (names: string[], alias: Record<string, string>, v: string) => { const i = idxOf(names, alias, v); return i === -1 ? '' : names[i]; };
    const dWeekIdx = (w: string) => ['ravi', 'soma', 'mangala', 'budha', 'guru', 'shukra', 'shani'].findIndex((p) => norm(w).startsWith(p));
    const fixture = days.map((day) => ({
      date: day.date,
      weekday: dWeekIdx(day.drik.weekday),
      paksha: day.drik.paksha,
      tithi: nameAt(TITHI_NAMES_EN, TITHI_ALIAS, day.drik.tithi),
      nakshatra: nameAt(NAKSHATRA_NAMES_EN, NAK_ALIAS, day.drik.nakshatra),
      yoga: nameAt(YOGA_NAMES_EN, YOGA_ALIAS, day.drik.yoga),
      karana: nameAt(KARANA_NAMES_EN, KAR_ALIAS, day.drik.karana),
      purnimantaMonth: nameAt(LUNAR_MONTH_NAMES_EN, MON_ALIAS, day.drik.purnimanta.name),
      amantaMonth: nameAt(LUNAR_MONTH_NAMES_EN, MON_ALIAS, day.drik.amanta.name),
      isAdhik: day.drik.purnimanta.adhik || day.drik.amanta.adhik,
      vikramSamvat: Number(day.drik.vikramSamvat),
      sunrise: day.drik.sunrise,
      sunset: day.drik.sunset,
    }));
    const dir = 'src/panchang/__tests__/fixtures';
    mkdirSync(dir, { recursive: true });
    const path = `${dir}/drikpanchang-ujjain.json`;
    writeFileSync(path, JSON.stringify({
      source: 'drikpanchang.com day-panchang, geoname-id=1253914 (Ujjain, Madhya Pradesh)',
      note: 'Reference panchang values captured for regression testing. Names normalized to engine canonical spelling. Factual astronomical data.',
      window: { START, END }, geoname: GEONAME, days: fixture,
    }, null, 2));
    console.log(`Wrote fixture (${fixture.length} days) to ${path}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
