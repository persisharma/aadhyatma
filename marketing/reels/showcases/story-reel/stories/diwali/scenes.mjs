// Folk-style choreography for दीपावली · पाँच दिन, पाँच कथाएँ: [character, x, y, scale, rotate, flip, motion, options]
// labels: [x, y, text, size, appearAtFraction]
import './cast.mjs';
const sea = [['waves', 540, 1430, 1, 0, 1, 'drift', {phase: 0}], ['waves2', 540, 1530, 1, 0, -1, 'drift', {phase: 2}]];
const xs = [140, 340, 540, 740, 940];
const row = (t0s) => xs.map((x, k) => ['diya', x, 1500, 1.5, 0, 1, t0s ? 'popAt' : 'idle', t0s ? {t0: t0s[k]} : {}]);
const day = (n, name, y = 700) => [[540, y, `दिन ${n} · ${name}`, 58, 0]];
export const FOLK = {
  hook: {bg: 'home', cast: row([0.08, 0.22, 0.36, 0.5, 0.64]),
    labels: [[540, 1010, '५ दिन · ५ कथाएँ', 92, 0], ...['धनतेरस', 'नरक चतुर्दशी', 'दीपावली', 'गोवर्धन', 'भाई दूज'].map((t, k) => [xs[k], 1630, t, 30, 0.08 + 0.14 * k])]},
  day1: {bg: 'ocean', labels: day('१', 'धनतेरस'), cast: [['dhanvantari', 540, 1300, 1.35, 0, 1, 'emerge'], ...sea]},
  day2: {bg: 'night', labels: day('२', 'नरक चतुर्दशी'), cast: [['krishnaChakra', 270, 1330, 1.1, 0, 1, 'idle'], ['satyabhama', 480, 1350, 1.0, 0, 1, 'idle'], ['narakasura', 830, 1330, 1.2, 0, -1, 'defeat']]},
  day3: {bg: 'palace', labels: day('३', 'दीपावली'), cast: [
    ['rama', 250, 1330, 1.05, 0, 1, 'walkIn'], ['sita', 430, 1350, 0.98, 0, 1, 'walkIn'], ['hanuman', 600, 1440, 0.9, 0, 1, 'walkIn'],
    ['lakshmi', 850, 1030, 0.8, 0, 1, 'popAt', {t0: 0.62}],
    ...[120, 290, 460, 630, 800, 960].map((x, k) => ['diya', x, 1615, 0.85, 0, 1, 'popAt', {t0: 0.18 + 0.07 * k}])]},
  day4: {bg: 'sky', fx: ['rain'], labels: day('४', 'गोवर्धन पूजा', 640), cast: [
    ['indra', 170, 860, 0.7, 0, 1, 'fadeOut'], ['kamadhenu', 260, 1530, 0.72, 0, 1, 'idle'],
    ['krishnaLift', 560, 1340, 1.1, 0, 1, 'idle'], ['giri', 615, 868, 0.95, 0, 1, 'idle'],
    ['annakut', 850, 1560, 0.85, 0, 1, 'popAt', {t0: 0.72}]]},
  day5: {bg: 'home', labels: day('५', 'भाई दूज'), cast: [['yamuna', 370, 1330, 1.15, 0, 1, 'idle'], ['yama', 740, 1330, 1.15, 0, -1, 'idle'], ['diya', 150, 1600, 1, 0, 1, 'idle'], ['diya', 930, 1600, 1, 0, 1, 'idle']]},
  message: {bg: 'home', fx: ['petals'], cast: row(null),
    labels: ['आरोग्य', 'विजय', 'प्रकाश', 'कृतज्ञता', 'प्रेम'].map((t, k) => [xs[k], 1630, t, 34, 0.06 * k])},
  cta: {bg: 'home', cast: row(null)},
};
