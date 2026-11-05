// Original jointed figures drawn as SVG paths, for the Tholu Bommalata (puppet) and Pattachitra style tests.
// Each character is a flat, draw-ordered list of parts. A part rotates about its pivot `at` (in its parent's
// space): angle = base + amp·sin(2π·freq·t + phase) + spin·t. Shape colours are semantic keys resolved per style.
const ell = (cx, cy, rx, ry) => `M${cx - rx},${cy}a${rx},${ry} 0 1,0 ${2 * rx},0a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;
const rr = (x, y, w, h, r) => `M${x + r},${y}h${w - 2 * r}a${r},${r} 0 0 1 ${r},${r}v${h - 2 * r}a${r},${r} 0 0 1 ${-r},${r}h${-(w - 2 * r)}a${r},${r} 0 0 1 ${-r},${-r}v${-(h - 2 * r)}a${r},${r} 0 0 1 ${r},${-r}Z`;
const poly = (...p) => 'M' + p.map(q => q.join(',')).join('L') + 'Z';
const s = (d, c, o = {}) => ({d, c, ...o});
const flat = {dots: false}; // small details: no perforation/decoration line
const mirror = d => d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (m, x, y) => `${-x},${y}`); // only for absolute M/L/C/Q paths
const eye = (x, y, w, h) => [s(`M${x - w},${y} Q${x},${y - h * 2} ${x + w},${y} Q${x},${y + h} ${x - w},${y}Z`, 'white', flat), s(ell(x, y - h * 0.3, h * 0.9, h * 0.9), 'black', flat)];
const limb = (len, w, skin) => [s(rr(-w / 2, 0, w, len, w / 2 - 1), skin), s(ell(0, len + 6, w * 0.58, w * 0.58), skin)];

export const CHARACTERS = {
  hanuman: [
    {id: 'body', at: [0, 0], amp: 2, freq: 0.6, shapes: [
      s(ell(0, 0, 60, 82), 'hanu'),
      s('M-45,-45 Q0,-5 45,-45 L40,-32 Q0,8 -40,-32Z', 'gold'),
      s('M-60,25 Q0,62 60,25 L56,92 Q0,118 -56,92Z', 'red'),
      s(rr(-60, 16, 120, 16, 6), 'gold')]},
    {id: 'tail', parent: 'body', at: [-45, 55], amp: 12, freq: 0.9, first: true, shapes: [
      s('M0,0 C-70,10 -120,-30 -115,-110 C-113,-140 -85,-150 -80,-125 C-78,-112 -92,-108 -95,-100 C-98,-40 -60,-12 4,-14Z', 'hanu')]},
    {id: 'legBack', parent: 'body', at: [-18, 75], base: 28, amp: 9, freq: 0.9, phase: 1.4, first: true, shapes: limb(95, 30, 'hanu')},
    {id: 'armBack', parent: 'body', at: [-30, -45], base: 45, amp: 12, freq: 1, phase: 0.6, first: true, shapes: limb(88, 28, 'hanu')},
    {id: 'legFront', parent: 'body', at: [22, 78], base: -8, amp: 9, freq: 0.9, phase: 2.6, shapes: limb(95, 30, 'hanu')},
    {id: 'head', parent: 'body', at: [5, -78], amp: 4, freq: 0.7, shapes: [
      s(ell(-42, -62, 17, 20), 'face'),
      s(ell(5, -62, 60, 58), 'hanu'),
      s(ell(25, -55, 42, 38), 'face'),
      s(ell(44, -36, 28, 18), 'face'),
      ...eye(30, -68, 11, 6),
      s('M30,-26 Q44,-18 58,-28 Q44,-22 30,-26Z', 'black', flat),
      s(poly([-40, -108], [50, -108], [38, -128], [5, -162], [-28, -128]), 'gold'),
      s(rr(-42, -114, 94, 14, 5), 'red'),
      s(ell(5, -128, 7, 7), 'red', flat)]},
    {id: 'armFront', parent: 'body', at: [32, -45], base: -100, amp: 9, freq: 1.1, phase: 2, shapes: [...limb(92, 28, 'hanu'), s(rr(-15, 62, 30, 10, 4), 'gold', flat)]},
  ],
  surya: [
    {id: 'rays', at: [0, 0], spin: 14, shapes: Array.from({length: 16}, (_, k) => {
      const a = (k * Math.PI) / 8, w = 0.16, R = k % 2 ? 148 : 178;
      const p = (r, t) => [Math.round(r * Math.cos(t)), Math.round(r * Math.sin(t))];
      return s(poly(p(100, a - w), p(R, a), p(100, a + w)), k % 2 ? 'sunIn' : 'sun');
    })},
    {id: 'disc', at: [0, 0], amp: 3, freq: 0.5, shapes: [
      s(ell(0, 0, 112, 112), 'sun'), s(ell(0, 0, 88, 88), 'sunIn'),
      ...eye(-33, -14, 21, 9), ...eye(33, -14, 21, 9),
      s('M0,-8 L-9,18 L9,18Z', 'sun', flat),
      s('M-22,34 Q0,50 22,34 Q0,42 -22,34Z', 'red', flat),
      
      s(ell(0, -50, 6, 11), 'red', flat)]},
  ],
  ganesha: [
    {id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [
      s(ell(0, 30, 118, 108), 'ganesha'), s(ell(0, -55, 88, 58), 'ganesha'),
      s(ell(0, 40, 8, 6), 'maroon', flat),
      s('M-70,-80 Q0,-10 70,-80 L64,-66 Q0,6 -64,-66Z', 'gold'),
      s('M-175,105 C-150,72 150,72 175,105 L165,165 C60,190 -60,190 -165,165Z', 'red'),
      s('M-168,148 C-60,176 60,176 168,148 L165,165 C60,190 -60,190 -165,165Z', 'gold'),
      s(ell(-55, 160, 42, 16), 'ganesha'), s(ell(65, 165, 42, 16), 'ganesha')]},
    {id: 'armUL', parent: 'body', at: [-80, -70], base: 140, amp: 6, freq: 0.8, first: true, shapes: [
      ...limb(85, 26, 'ganesha'), s(rr(-4, 92, 8, 110, 3), 'gold', flat),
      s(poly([-4, 190], [-48, 172], [-54, 218], [-4, 206]), 'white')]},
    {id: 'armUR', parent: 'body', at: [80, -70], base: -140, amp: 6, freq: 0.8, phase: 1.5, first: true, shapes: [
      ...limb(85, 26, 'ganesha'), s(ell(-12, 112, 9, 19), 'pink'), s(ell(12, 112, 9, 19), 'pink'), s(ell(0, 110, 11, 24), 'pink')]},
    {id: 'earL', parent: 'head', at: [-70, -75], amp: 7, freq: 1.3, shapes: [
      s('M0,-40 C-80,-70 -125,10 -85,70 C-60,100 -15,85 0,55Z', 'ganesha'),
      s('M-12,-22 C-70,-40 -95,15 -70,55 C-50,72 -22,62 -12,40Z', 'pink', flat)]},
    {id: 'earR', parent: 'head', at: [70, -75], amp: 7, freq: 1.3, phase: Math.PI, shapes: [
      s(mirror('M0,-40 C-80,-70 -125,10 -85,70 C-60,100 -15,85 0,55Z'), 'ganesha'),
      s(mirror('M-12,-22 C-70,-40 -95,15 -70,55 C-50,72 -22,62 -12,40Z'), 'pink', flat)]},
    {id: 'head', parent: 'body', at: [0, -105], amp: 3, freq: 0.6, shapes: [
      s(ell(0, -75, 92, 85), 'ganesha'),
      s(poly([-62, -140], [62, -140], [48, -190], [18, -230], [0, -268], [-18, -230], [-48, -190]), 'gold'),
      s(rr(-66, -152, 132, 20, 8), 'red'),
      s(ell(0, -182, 10, 10), 'red', flat), s(ell(-30, -166, 6, 6), 'green', flat), s(ell(30, -166, 6, 6), 'green', flat),
      s('M0,-120 L-8,-102 L8,-102Z', 'red', flat),
      ...eye(-34, -82, 17, 7), ...eye(34, -82, 17, 7)]},
    {id: 'tusk', parent: 'head', at: [26, -32], shapes: [s(poly([0, 0], [34, 26], [6, 14]), 'white')]},
    {id: 'trunk', parent: 'head', at: [0, -38], amp: 7, freq: 0.7, phase: 0.5, shapes: [
      s('M-24,0 C-28,70 0,125 55,135 C78,138 84,114 66,108 C36,100 22,60 24,0Z', 'ganesha'),
      s(ell(66, 122, 10, 8), 'pink', flat)]},
    {id: 'armLL', parent: 'body', at: [-85, -30], base: 28, amp: 4, freq: 0.8, shapes: [
      ...limb(80, 26, 'ganesha'), s('M-38,92 Q0,134 38,92Z', 'gold'),
      s('M-20,92 Q-11,68 -2,92Z', 'cream', flat), s('M-3,92 Q6,64 15,92Z', 'cream', flat), s('M12,92 Q20,72 28,92Z', 'cream', flat)]},
    {id: 'armLR', parent: 'body', at: [85, -30], base: -58, amp: 5, freq: 0.8, phase: 1, shapes: [
      s(rr(-13, 0, 26, 80, 12), 'ganesha'), s(ell(0, 92, 21, 25), 'ganesha'), s(ell(0, 92, 6, 6), 'red', flat)]},
  ],
  mushak: [
    {id: 'body', at: [0, 0], amp: 4, freq: 2, shapes: [
      s('M-46,0 C-80,-10 -90,20 -112,10 L-110,17 C-88,30 -78,0 -46,7Z', 'mouse'),
      s(ell(0, 0, 46, 28), 'mouse'), s(ell(42, -8, 22, 18), 'mouse'), s(ell(34, -26, 10, 10), 'pink', flat),
      s(ell(50, -12, 4, 4), 'black', flat)]},
  ],
  shani: [
    {id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [
      s(ell(0, -150, 62, 42), 'shani'),
      s('M-60,-140 L60,-140 L95,170 L-95,170Z', 'robe'),
      s('M-95,150 L95,150 L95,170 L-95,170Z', 'gold'),
      s(rr(-60, -62, 120, 22, 6), 'gold'),
      s('M-48,-178 Q0,-130 48,-178 L44,-164 Q0,-118 -44,-164Z', 'gold'),
      s(ell(-35, 176, 30, 12), 'shani'), s(ell(40, 176, 30, 12), 'shani')]},
    {id: 'halo', parent: 'body', at: [0, -190], spin: 8, first: true, shapes: [
      s(ell(0, -55, 98, 98), 'halo'), ...Array.from({length: 12}, (_, k) => { const a = k * Math.PI / 6; return s(ell(Math.round(88 * Math.cos(a)), Math.round(-55 + 88 * Math.sin(a)), 7, 7), 'gold', flat); })]},
    {id: 'armBack', parent: 'body', at: [-48, -150], base: 14, amp: 5, freq: 0.7, first: true, shapes: limb(100, 28, 'shani')},
    {id: 'head', parent: 'body', at: [0, -190], amp: 3, freq: 0.5, shapes: [
      s(ell(0, -50, 48, 56), 'shani'),
      ...eye(-17, -56, 12, 5), ...eye(17, -56, 12, 5),
      s('M-22,-24 C-10,-32 10,-32 22,-24 C10,-27 -10,-27 -22,-24Z', 'black', flat),
      s(poly([-45, -95], [45, -95], [35, -140], [0, -188], [-35, -140]), 'gold'),
      s(rr(-48, -106, 96, 16, 6), 'red'), s(ell(0, -130, 8, 8), 'blue', flat)]},
    {id: 'armFront', parent: 'body', at: [48, -150], base: -18, amp: 4, freq: 0.7, phase: 1, shapes: [...limb(100, 28, 'shani'), s(rr(-15, 70, 30, 10, 4), 'gold', flat)]},
    {id: 'staff', parent: 'armFront', at: [0, 106], base: 18, amp: 0, shapes: [
      s(rr(-6, -250, 12, 400, 5), 'gold', flat),
      s(poly([-32, -300], [-22, -255], [-8, -258], [0, -330], [8, -258], [22, -255], [32, -300], [14, -246], [-14, -246]), 'gold')]},
  ],
  crow: [
    {id: 'body', at: [0, 0], amp: 3, freq: 1.2, shapes: [
      s(poly([-40, 0], [-98, -16], [-98, 16]), 'crow'),
      s(rr(-6, 22, 5, 24, 2), 'gold', flat), s(rr(10, 22, 5, 24, 2), 'gold', flat),
      s(ell(0, 0, 48, 28), 'crow'), s(ell(42, -22, 22, 20), 'crow'),
      s(poly([60, -27], [90, -18], [60, -11]), 'gold'), s(ell(48, -26, 4, 4), 'white', flat)]},
    {id: 'wing', parent: 'body', at: [-5, -8], base: -8, amp: 26, freq: 2.4, shapes: [s('M0,0 C-30,-62 -84,-72 -104,-40 C-72,-30 -42,-10 0,10Z', 'crow')]},
  ],
  ravana: (() => {
    const head = (id, x, y, k, phase, first) => ({id, parent: 'body', at: [x, y], amp: 3, freq: 0.6, phase, first, shapes: [
      s(ell(0, 0, 34 * k, 40 * k), 'ravana'),
      s(poly([-30 * k, -30 * k], [30 * k, -30 * k], [22 * k, -62 * k], [0, -98 * k], [-22 * k, -62 * k]), 'gold'),
      ...eye(-12 * k, -4 * k, 9 * k, 4 * k), ...eye(12 * k, -4 * k, 9 * k, 4 * k),
      s(`M${-22 * k},${16 * k} C${-10 * k},${7 * k} ${10 * k},${7 * k} ${22 * k},${16 * k} C${10 * k},${13 * k} ${-10 * k},${13 * k} ${-22 * k},${16 * k}Z`, 'black', flat)]});
    return [
      ...[-140, -70, 0, 70, 140].map((x, n) => head(`back${n}`, x, -330, 0.78, n, true)),
      {id: 'armBack', parent: 'body', at: [-62, -170], base: 32, amp: 5, freq: 0.7, first: true, shapes: [
        ...limb(110, 30, 'ravana'), s(ell(-22, 122, 56, 56), 'gold'), s(ell(-22, 122, 40, 40), 'red'), s(ell(-22, 122, 10, 10), 'gold', flat)]},
      {id: 'body', at: [0, 0], amp: 1.5, freq: 0.5, shapes: [
        s(rr(-20, -230, 40, 40, 10), 'ravana'),
        s('M-75,-195 L75,-195 L65,-20 L-65,-20Z', 'armor'),
        s(ell(0, -122, 46, 38), 'gold'),
        s('M-70,-15 L70,-15 L95,150 L-95,150Z', 'red'),
        s('M-90,128 L90,128 L95,150 L-95,150Z', 'gold'),
        s(rr(-72, -34, 144, 22, 8), 'gold'),
        s(rr(-56, 140, 34, 70, 12), 'ravana'), s(rr(22, 140, 34, 70, 12), 'ravana'),
        s(ell(-38, 214, 30, 12), 'ravana'), s(ell(40, 214, 30, 12), 'ravana')]},
      ...[[-170, 0.92], [-85, 0.95], [85, 0.95], [170, 0.92]].map(([x, k], n) => head(`front${n}`, x, -250, k, n + 0.5)),
      head('main', 0, -262, 1.15, 0.2),
      {id: 'armFront', parent: 'body', at: [66, -170], base: -138, amp: 7, freq: 0.8, phase: 1.2, shapes: [...limb(110, 30, 'ravana'), s(rr(-16, 74, 32, 10, 4), 'gold', flat)]},
      {id: 'sword', parent: 'armFront', at: [0, 118], shapes: [s(rr(-8, 8, 16, 175, 6), 'white'), s(rr(-24, 0, 48, 11, 4), 'gold')]},
    ];
  })(),
};

export const PALETTES = {
  puppet: {gold: '#E2A62B', red: '#B8261B', green: '#2F8A3B', blue: '#1E3C8F', black: '#1A0E08', cream: '#F2DFAE', white: '#F3EEDD', maroon: '#6E1A10', pink: '#E79A76',
    hanu: '#C9512A', face: '#F1D3A0', ganesha: '#E7B24A', shani: '#2A3778', robe: '#1E1A2E', halo: '#3B2C6E', ravana: '#A3321F', armor: '#24160F', sun: '#F0A92C', sunIn: '#D5461E', mouse: '#7B6A5A', crow: '#1C1712',
    outline: '#170904', deco: '#FFE9B8'},
  patta: {gold: '#F0B53C', red: '#C2301F', green: '#3E7A35', blue: '#22356F', black: '#120B06', cream: '#F8E8C5', white: '#FFF9EC', maroon: '#7E1C12', pink: '#F0A98A',
    hanu: '#D9822B', face: '#F7DDB4', ganesha: '#F2C7A2', shani: '#2A2E66', robe: '#1B2240', halo: '#F0B53C', ravana: '#3D7A5C', armor: '#1B2240', sun: '#F4B63B', sunIn: '#E0532A', mouse: '#8C7B6B', crow: '#15110D',
    outline: '#120B06', deco: '#FFF7E2'},
};

// Draw one shape: puppet = thick outline with a perforated (dotted) line along it; pattachitra = outline with a fine dashed inner line.
export function shapeSvg(shape, style) {
  const pal = PALETTES[style], fill = pal[shape.c] || shape.c;
  const sw = shape.dots === false ? (style === 'puppet' ? 3 : 2.5) : (style === 'puppet' ? 9 : 6); // fine features get a fine outline
  const base = `<path d="${shape.d}" fill="${fill}" stroke="${pal.outline}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  if (shape.dots === false) return base;
  return base + (style === 'puppet'
    ? `<path d="${shape.d}" fill="none" stroke="${pal.deco}" stroke-width="3.6" stroke-dasharray="0.01 12" stroke-linecap="round"/>`
    : `<path d="${shape.d}" fill="none" stroke="${pal.deco}" stroke-width="1.6" stroke-dasharray="5 6"/>`);
}
