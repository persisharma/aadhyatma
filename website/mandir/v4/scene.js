// V4 · the shrine scene inside the temple: V2's seven shrine paintings orbiting the sanctum light (copied from
// ../v2-webgl/scene.js). V4 additions: preload() fetches three.js at idle; relight() restarts the lamp intro with a
// sanctum flare (the gold glow of the walk-in condenses into the halo); sanctumPoint() gives the halo's screen
// position so the page can aim the glow at it.
// three.module.min.js (same pinned 0.160.0 build as three.module.js) is used because it is 167 KB gzip vs 258 KB,
// and the budget is 200 KB.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// World layout (units are arbitrary; the camera is fitted to the DOM stage rect on every resize).
const ARCH_W = 2.0;
const ARCH_H = 3.0;
const MARGIN = 0.03;          // a hair of room for the anti-aliased edge
const AURA_MARGIN = 1.1;      // room around the arch for the chosen shrine's aura
const FLOAT = 0.32;           // panels hover above the polished floor
const RING_X = 4.7;
const RING_Z = 4.3;
const PULL = 3.1;             // how far the selected panel comes out of the ring toward the camera
const SIDE_SCALE = 0.66;
const FOV = 30;
const PITCH = 0.2;            // camera looks down ~11.5 degrees
const NUDGE_AMP = 0.3;        // the hint turn: 30% of the way to the next shrine
const NUDGE_MS = 2200;

/* ---------- shaders ---------- */

const PANEL_VERT = /* glsl */ `
varying vec2 vUv;
varying float vDepth;
void main() {
  vUv = uv;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const PANEL_FRAG = /* glsl */ `
uniform sampler2D uMap;
uniform float uMapMix;
uniform vec2 uSize;
uniform vec2 uArch;
uniform vec2 uCover;
uniform vec2 uFocus;
uniform float uSel;
uniform float uBright;
uniform float uTime;
uniform float uSeed;
uniform float uReflect;
uniform vec3 uGold;
uniform vec3 uStone;
uniform float uGlow;
uniform vec3 uWarm;
uniform vec3 uDuskA;
uniform vec3 uDuskB;
uniform vec3 uFog;
uniform vec2 uFogRange;
varying vec2 vUv;
varying float vDepth;

float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
// Rectangle with a semicircular top (the shrine niche), centred, a = half size.
float sdArch(vec2 p, vec2 a) {
  float r = a.x;
  float cy = a.y - r;
  float box = sdBox(p - vec2(0.0, (cy - a.y) * 0.5), vec2(a.x, (cy + a.y) * 0.5));
  float circ = length(p - vec2(0.0, cy)) - r;
  return min(box, circ);
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdArch(p, uArch * 0.5);
  float aa = max(fwidth(d), 1e-4);
  float inside = 1.0 - smoothstep(-aa, aa, d);

  // Painting, cover-cropped into the arch, with a slow living drift (never static, never fast).
  vec2 au = p / uArch + 0.5;
  float t = uTime * 0.045 + uSeed * 6.0;
  float zoom = 1.07 + 0.03 * sin(t) + 0.04 * uSel;
  vec2 drift = vec2(sin(t * 0.83), cos(t * 0.61)) * 0.01;
  vec2 tuv = (au - 0.5) / zoom + drift;
  tuv = tuv * uCover + uFocus;
  vec3 paint = texture2D(uMap, tuv).rgb;
  vec3 dusk = mix(uDuskA, uDuskB, au.y);
  vec3 col = mix(dusk, paint, uMapMix);

  // Grade: unselected shrines sit in the cool dusk, the chosen one is lamp-lit.
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(lum), col, 0.62 + 0.38 * uSel);
  col *= mix(vec3(0.78, 0.78, 0.96), vec3(1.04, 1.0, 0.93), uSel);
  float low = smoothstep(0.42, 0.0, au.y);
  col += uWarm * low * (0.05 + 0.10 * uSel);
  // Niche depth: the painting is set into stone, darker toward the frame.
  float deep = smoothstep(0.0, -0.32, d);
  col *= mix(0.5, 1.0, deep);

  // A fine stone edge at rest; it warms to lamp-gold only while a shrine is arriving (uGlow).
  float rimW = 0.011;
  float rim = smoothstep(-rimW - aa, -rimW + aa, d) * inside;
  float sheen = pow(max(0.0, sin((p.x * 0.8 + p.y * 0.55) * 1.4 - uTime * 0.35 + uSeed * 9.0)), 10.0);
  vec3 edgeCol = mix(uStone * (0.5 + 0.15 * uSel), uGold * (0.8 + 0.5 * sheen), uGlow * uSel);
  col = mix(col, edgeCol, rim);

  col *= uBright;
  float fogF = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  col = mix(col, uFog, fogF * 0.85);

  float alpha = inside;
  if (uReflect > 0.5) alpha *= (1.0 - smoothstep(0.0, 0.42, au.y)) * 0.5;
  if (alpha < 0.002) discard;   // nothing outside the niche writes depth
  gl_FragColor = vec4(col * alpha, alpha);
  #include <colorspace_fragment>
}`;

// The chosen shrine's soft lamp aura, drawn as its own additive plane behind the panel.
const AURA_FRAG = /* glsl */ `
uniform vec2 uSize;
uniform vec2 uArch;
uniform float uSel;
uniform vec3 uWarm;
varying vec2 vUv;
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdArch(vec2 p, vec2 a) {
  float r = a.x;
  float cy = a.y - r;
  float box = sdBox(p - vec2(0.0, (cy - a.y) * 0.5), vec2(a.x, (cy + a.y) * 0.5));
  return min(box, length(p - vec2(0.0, cy)) - r);
}
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = max(sdArch(p, uArch * 0.5), 0.0);
  float g = (exp(-d * 6.0) * 0.09 + exp(-d * 1.8) * 0.025) * (1.0 - smoothstep(0.55, 1.0, d));
  gl_FragColor = vec4(uWarm * g * uSel, 0.0);
  #include <colorspace_fragment>
}`;

const FLOOR_VERT = /* glsl */ `
varying vec3 vWorld;
varying float vDepth;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vec4 mv = viewMatrix * w;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const FLOOR_FRAG = /* glsl */ `
#define MAXD 32
uniform vec3 uBase;
uniform vec3 uWarm;
uniform vec3 uFog;
uniform vec2 uFogRange;
uniform float uTime;
uniform float uLit;
uniform vec4 uDiyas[MAXD];
uniform int uCount;
varying vec3 vWorld;
varying float vDepth;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec2 q = vWorld.xz;
  float r = length(q);
  // Polished dark stone with faint veins.
  float n = noise(q * 0.9) * 0.6 + noise(q * 3.1 + 7.0) * 0.3 + noise(q * 11.0) * 0.1;
  float vein = smoothstep(0.47, 0.5, noise(q * vec2(0.6, 1.7) + n));
  vec3 col = uBase * (0.8 + 0.35 * n) + vec3(0.02, 0.012, 0.02) * vein;
  // The sanctum's pool of light, breathing slowly.
  float breath = 0.9 + 0.1 * sin(uTime * 0.5);
  col += uWarm * exp(-r * r * 0.05) * 0.32 * breath * uLit;
  // Each diya warms the stone under it.
  for (int i = 0; i < MAXD; i++) {
    if (i >= uCount) break;
    vec4 dy = uDiyas[i];
    vec2 dd = q - dy.xy;
    float flick = 0.85 + 0.15 * sin(uTime * (2.3 + dy.z) + dy.z * 10.0);
    col += uWarm * (exp(-dot(dd, dd) * 1.2) * 0.3 + exp(-dot(dd, dd) * 9.0) * 0.35) * flick * dy.w * uLit;
  }
  float fogF = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  col = mix(col, uFog, fogF);
  float alpha = (1.0 - smoothstep(13.0, 24.0, r)) * 0.8;
  gl_FragColor = vec4(col * alpha, alpha);
  #include <colorspace_fragment>
}`;

const FLAME_VERT = /* glsl */ `
attribute vec2 aSeed;      // x: phase, y: lit delay (0..1)
uniform float uTime;
uniform float uScale;
uniform float uLit;
varying float vFlick;
varying float vOn;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float on = smoothstep(aSeed.y, aSeed.y + 0.12, uLit);
  vOn = on;
  vFlick = 0.82 + 0.1 * sin(uTime * 7.0 + aSeed.x * 17.0) + 0.08 * sin(uTime * 13.0 + aSeed.x * 5.0);
  gl_PointSize = uScale * (0.6 + 0.4 * on) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const FLAME_FRAG = /* glsl */ `
uniform vec3 uCore;
uniform vec3 uWarm;
varying float vFlick;
varying float vOn;
void main() {
  vec2 c = gl_PointCoord - vec2(0.5, 0.5);
  c.x *= 1.0 + c.y * 1.6;                      // teardrop: narrow toward the tip
  float flame = exp(-dot(c * vec2(9.0, 4.2 / vFlick), c * vec2(9.0, 4.2 / vFlick)) * 1.4);
  float glow = exp(-dot(gl_PointCoord - 0.5, gl_PointCoord - 0.5) * 22.0) * 0.22;
  vec3 col = (uCore * flame * 1.25 + uWarm * glow) * vOn * vFlick;
  vec2 b = (gl_PointCoord - vec2(0.5, 0.74)) / vec2(0.21, 0.085);
  float bowl = (1.0 - smoothstep(0.85, 1.0, length(b))) * step(0.0, b.y + 0.15);
  vec3 clay = mix(vec3(0.16, 0.07, 0.04), uWarm * 0.55, smoothstep(0.4, -0.2, b.y) * (0.4 + 0.6 * vOn));
  col = mix(col, clay, bowl);
  gl_FragColor = vec4(col, bowl);
  #include <colorspace_fragment>
}`;

const EMBER_VERT = /* glsl */ `
attribute vec4 aSeed;      // x0, z0, speed, phase
uniform float uTime;
uniform float uScale;
uniform float uHeight;
uniform float uLit;
varying float vA;
void main() {
  float life = fract(uTime * aSeed.z + aSeed.w);
  vec3 p = vec3(aSeed.x, 0.2 + life * uHeight, aSeed.y);
  p.x += sin(uTime * 0.6 + aSeed.w * 40.0) * 0.35 * life;
  p.z += cos(uTime * 0.45 + aSeed.w * 23.0) * 0.25 * life;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float tw = 0.6 + 0.4 * sin(uTime * 4.0 + aSeed.w * 60.0);
  vA = smoothstep(0.0, 0.12, life) * (1.0 - smoothstep(0.55, 1.0, life)) * tw * uLit;
  gl_PointSize = uScale * (1.0 - 0.5 * life) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

const EMBER_FRAG = /* glsl */ `
uniform vec3 uColor;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  gl_FragColor = vec4(uColor * a * vA, a * vA);
  #include <colorspace_fragment>
}`;

const SPRITE_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// The sanctum light: a tall breathing glow with faint, slowly turning rays.
const HALO_FRAG = /* glsl */ `
uniform float uTime;
uniform float uLit;
uniform float uGlow;
uniform float uFlare;
uniform vec3 uCore;
uniform vec3 uWarm;
uniform vec3 uRose;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * vec2(1.0, 1.35);
  float r = length(p);
  float breath = 0.92 + 0.08 * sin(uTime * 0.5);
  float core = exp(-r * r * 60.0);
  float warm = exp(-r * r * 9.0);
  float wide = exp(-r * 4.2);
  float ang = atan(p.y, p.x);
  float rays = 0.5 + 0.5 * sin(ang * 9.0 + uTime * 0.05) * sin(ang * 5.0 - uTime * 0.04);
  rays = pow(rays, 3.0) * exp(-r * 3.2) * 0.22;
  vec3 col = uCore * core * 0.24 + uWarm * warm * 0.14 + uRose * wide * 0.07 + uWarm * rays * 0.4;
  // Fade to exactly zero before the quad's edge, so the additive glow never shows a seam.
  float edge = 1.0 - smoothstep(0.32, 0.5, length(vUv - 0.5));
  col *= breath * edge * (max(uLit, uFlare) * (0.7 + 0.45 * uGlow) + uFlare * 1.8);
  gl_FragColor = vec4(col, 0.0);
  #include <colorspace_fragment>
}`;

// Incense smoke: domain-warped value noise, drifting up and curling, barely there.
const SMOKE_FRAG = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uAlpha;
uniform vec3 uColor;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.743); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < OCTAVES; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}
void main() {
  vec2 uv = vUv;
  float t = uTime * 0.05 + uSeed * 10.0;
  vec2 q = vec2(uv.x * 2.2, uv.y * 1.4 - t);
  vec2 w = vec2(fbm(q + vec2(0.0, t * 0.6)), fbm(q + vec2(5.2, 1.3)));
  float n = fbm(q + 1.8 * w + vec2(sin(t + uv.y * 3.0) * 0.3, 0.0));
  float column = exp(-pow((uv.x - 0.5 - (w.x - 0.5) * 0.5) * 3.2, 2.0));
  float v = smoothstep(0.42, 0.85, n) * column;
  v *= smoothstep(0.0, 0.25, uv.y) * (1.0 - smoothstep(0.6, 1.0, uv.y));
  v *= smoothstep(0.0, 0.18, uv.x) * (1.0 - smoothstep(0.82, 1.0, uv.x));
  float a = v * uAlpha;
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}`;

/* ---------- the dusk backdrop, painted once into a canvas ---------- */

function paintBackdrop(w, h, starCount) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const horizon = h * 0.62;

  const sky = g.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#07061a');
  sky.addColorStop(0.32, '#141033');
  sky.addColorStop(0.52, '#2d1a45');
  sky.addColorStop(0.6, '#4a2448');
  sky.addColorStop(0.62, '#3a1d3a');
  sky.addColorStop(0.7, '#160d1f');
  sky.addColorStop(1, '#0b0814');
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  // Last light of sandhya, low and wide behind the sanctum.
  const glow = g.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, w * 0.42);
  glow.addColorStop(0, 'rgba(242,154,29,0.30)');
  glow.addColorStop(0.35, 'rgba(194,56,29,0.12)');
  glow.addColorStop(1, 'rgba(42,24,56,0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, w, h);

  // Stars, thinning toward the horizon.
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < starCount; i++) {
    const x = rnd() * w;
    const y = Math.pow(rnd(), 1.6) * horizon * 0.86;
    const a = (1 - y / horizon) * (0.25 + rnd() * 0.75);
    const r = rnd() < 0.06 ? 1.6 : 0.5 + rnd() * 0.8;
    g.fillStyle = `rgba(248,239,224,${a.toFixed(3)})`;
    g.beginPath(); g.arc(x, y, r * (w / 2048), 0, TAU); g.fill();
  }

  // Silhouette of the temple behind the sanctum: a Nagara shikhara with its smaller towers and mandapa roofs.
  const s = (w / 2048) * 0.56;
  g.save();
  g.beginPath();
  const cx = w / 2;
  const tower = (x, base, bw, th, tw) => {
    g.moveTo(x - bw / 2, base);
    g.bezierCurveTo(x - bw / 2, base - th * 0.55, x - tw / 2 - bw * 0.08, base - th * 0.9, x - tw / 2, base - th);
    g.lineTo(x + tw / 2, base - th);
    g.bezierCurveTo(x + tw / 2 + bw * 0.08, base - th * 0.9, x + bw / 2, base - th * 0.55, x + bw / 2, base);
    g.closePath();
    // amalaka + kalash
    g.moveTo(x + tw * 0.95, base - th);
    g.ellipse(x, base - th - 6 * s * (bw / 200), tw * 0.95, 7 * s * (bw / 200), 0, 0, TAU);
    g.moveTo(x + tw * 0.35, base - th - 14 * s * (bw / 200));
    g.ellipse(x, base - th - 22 * s * (bw / 200), tw * 0.35, 12 * s * (bw / 200), 0, 0, TAU);
  };
  const pyramid = (x, base, bw, th) => {
    g.moveTo(x - bw / 2, base);
    for (let k = 0; k < 5; k++) {
      const y = base - (th * k) / 5;
      const hw = (bw / 2) * (1 - k / 5.6);
      g.lineTo(x - hw, y - th / 5);
      g.lineTo(x - hw * 0.93, y - th / 5);
    }
    g.lineTo(x, base - th - 18 * s);
    for (let k = 4; k >= 0; k--) {
      const y = base - (th * k) / 5;
      const hw = (bw / 2) * (1 - k / 5.6);
      g.lineTo(x + hw * 0.93, y - th / 5);
      g.lineTo(x + hw, y - th / 5);
    }
    g.lineTo(x + bw / 2, base);
    g.closePath();
  };
  const plinth = horizon + 6 * s;
  g.rect(cx - 620 * s, plinth - 70 * s, 1240 * s, 120 * s);          // the long colonnade wall
  tower(cx, plinth - 60 * s, 300 * s, 420 * s, 70 * s);               // main shikhara
  tower(cx - 130 * s, plinth - 60 * s, 150 * s, 250 * s, 36 * s);     // urushringas
  tower(cx + 130 * s, plinth - 60 * s, 150 * s, 250 * s, 36 * s);
  pyramid(cx - 330 * s, plinth - 66 * s, 230 * s, 150 * s);           // mandapa roofs
  pyramid(cx + 330 * s, plinth - 66 * s, 230 * s, 150 * s);
  pyramid(cx - 520 * s, plinth - 66 * s, 150 * s, 90 * s);
  pyramid(cx + 520 * s, plinth - 66 * s, 150 * s, 90 * s);
  g.fillStyle = '#120b1d';
  g.fill();
  // Rim of warm light from the sanctum catching the stone.
  g.globalCompositeOperation = 'source-atop';
  const rim = g.createRadialGradient(cx, plinth, 10 * s, cx, plinth, 620 * s);
  rim.addColorStop(0, 'rgba(255,170,80,0.38)');
  rim.addColorStop(0.5, 'rgba(194,90,60,0.12)');
  rim.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rim;
  g.fillRect(0, 0, w, h);
  g.restore();

  // Flag on the shikhara (saffron, the only bright colour up there).
  const top = plinth - 60 * s - 420 * s - 34 * s;
  g.strokeStyle = 'rgba(40,26,40,1)';
  g.lineWidth = 2 * s;
  g.beginPath(); g.moveTo(cx, top); g.lineTo(cx, top - 70 * s); g.stroke();
  g.fillStyle = 'rgba(242,120,40,0.75)';
  g.beginPath(); g.moveTo(cx, top - 70 * s); g.quadraticCurveTo(cx + 40 * s, top - 62 * s, cx + 74 * s, top - 50 * s); g.lineTo(cx, top - 40 * s); g.closePath(); g.fill();

  // Tiny lamps along the colonnade.
  for (let i = 0; i < 26; i++) {
    const x = cx - 600 * s + (i * 1200 * s) / 25;
    if (Math.abs(x - cx) < 160 * s) continue;
    const lg = g.createRadialGradient(x, plinth - 20 * s, 0, x, plinth - 20 * s, 14 * s);
    lg.addColorStop(0, 'rgba(255,214,140,0.9)');
    lg.addColorStop(1, 'rgba(255,160,60,0)');
    g.fillStyle = lg;
    g.fillRect(x - 14 * s, plinth - 34 * s, 28 * s, 28 * s);
  }
  return c;
}

/* ---------- scene ---------- */

export const preload = () => import(/* webpackIgnore: true */ THREE_URL);

export async function createScene(opts) {
  const { canvas, heroEl, stageEl, shrines, artBase, quality, initialIndex = 0, onIndexChange, onReady } = opts;
  const THREE = await import(/* webpackIgnore: true */ THREE_URL);
  const mobile = quality === 'mobile';

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, powerPreference: 'high-performance' });
  } catch (err) {
    throw new Error(`WebGL unavailable: ${err.message}`);
  }
  const dprCap = mobile ? 1.5 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x0e0b1f, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 120);
  const col = (hex) => new THREE.Color(hex);
  const C = {
    gold: col('#ffcc6b'), warm: col('#f29a1d'), core: col('#fff1cf'), rose: col('#c2381d'),
    fog: col('#24152f'), duskA: col('#1a1230'), duskB: col('#3a2240'), base: col('#0c0912'), ember: col('#ffb251'),
    smoke: col('#d9cfe6'), stone: col('#d9a273'),
  };
  const time = { value: 0 };
  const glow = { value: 0 };                // 0 at rest, ~1 while a shrine is changing
  const flare = { value: 0 };               // V4: the walk-in's glow, collapsing into the sanctum halo
  let flareT0 = -1e9;
  const lit = { value: 0 };                 // intro: lamps light up 0 -> 1
  const fogRange = { value: new THREE.Vector2(14, 34) };
  const disposables = [];
  const track = (x) => (disposables.push(x), x);

  // Backdrop
  const bdCanvas = paintBackdrop(mobile ? 1024 : 2048, mobile ? 512 : 1024, mobile ? 260 : 620);
  const bdTex = track(new THREE.CanvasTexture(bdCanvas));
  bdTex.colorSpace = THREE.SRGBColorSpace;
  const backdrop = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), track(new THREE.MeshBasicMaterial({ map: bdTex, depthWrite: false, fog: false })));
  backdrop.renderOrder = -10;
  scene.add(backdrop);

  // Floor (polished stone, warmed by the diyas and the sanctum).
  const n = shrines.length;
  const diyaCount = mobile ? 16 : 28;
  const diyaR = RING_X + 1.25;
  const diyaUniform = [];
  const flamePos = new Float32Array(diyaCount * 3 + 3);
  const flameSeed = new Float32Array(diyaCount * 2 + 2);
  for (let i = 0; i < 32; i++) diyaUniform.push(new THREE.Vector4(0, 0, 0, 0));
  for (let i = 0; i < diyaCount; i++) {
    const a = (i / diyaCount) * TAU;
    const x = Math.sin(a) * diyaR;
    const z = Math.cos(a) * (RING_Z + 1.25);
    flamePos.set([x, 0.16, z], i * 3);
    // light from the back of the circle round to the front, both ways at once
    const around = Math.abs(((a + Math.PI) % TAU) - Math.PI) / Math.PI;
    flameSeed.set([Math.random(), 0.15 + (1 - around) * 0.55], i * 2);
    diyaUniform[i].set(x, z, Math.random() * 3, 1);
  }
  // the sanctum flame itself
  flamePos.set([0, 0.55, 0], diyaCount * 3);
  flameSeed.set([0.5, 0.0], diyaCount * 2);

  const floorMat = track(new THREE.ShaderMaterial({
    vertexShader: FLOOR_VERT, fragmentShader: FLOOR_FRAG, transparent: true, depthWrite: false,
    premultipliedAlpha: true,
    uniforms: {
      uBase: { value: C.base }, uWarm: { value: C.warm }, uFog: { value: C.fog }, uFogRange: fogRange,
      uTime: time, uLit: lit, uDiyas: { value: diyaUniform }, uCount: { value: diyaCount },
    },
  }));
  const floor = new THREE.Mesh(track(new THREE.CircleGeometry(26, 72)), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.renderOrder = -5;
  scene.add(floor);

  // Panels + their floor reflections.
  const planeGeo = track(new THREE.PlaneGeometry(1, 1));
  const size = new THREE.Vector2(ARCH_W + MARGIN * 2, ARCH_H + MARGIN * 2);
  const arch = new THREE.Vector2(ARCH_W, ARCH_H);
  const auraSize = new THREE.Vector2(ARCH_W + AURA_MARGIN * 2, ARCH_H + AURA_MARGIN * 2);
  const panels = shrines.map((s, i) => {
    const mk = (reflect) => {
      const m = track(new THREE.ShaderMaterial({
        vertexShader: PANEL_VERT, fragmentShader: PANEL_FRAG, transparent: true, extensions: { derivatives: true },
        premultipliedAlpha: true, depthWrite: !reflect, depthTest: !reflect,
        side: reflect ? THREE.DoubleSide : THREE.FrontSide,
        uniforms: {
          uMap: { value: null }, uMapMix: { value: 0 }, uSize: { value: size }, uArch: { value: arch },
          uCover: { value: new THREE.Vector2(1, 1) }, uFocus: { value: new THREE.Vector2(0.5, 0.5) },
          uSel: { value: 0 }, uBright: { value: 0 }, uTime: time, uSeed: { value: i / n },
          uReflect: { value: reflect ? 1 : 0 }, uGold: { value: C.gold }, uWarm: { value: C.warm },
          uStone: { value: C.stone }, uGlow: glow,
          uDuskA: { value: C.duskA }, uDuskB: { value: C.duskB }, uFog: { value: C.fog }, uFogRange: fogRange,
        },
      }));
      const mesh = new THREE.Mesh(planeGeo, m);
      mesh.scale.set(size.x, size.y * (reflect ? -1 : 1), 1);
      return mesh;
    };
    const mesh = mk(false);
    const refl = mk(true);
    refl.renderOrder = -6;
    const aura = new THREE.Mesh(planeGeo, track(new THREE.ShaderMaterial({
      vertexShader: SPRITE_VERT, fragmentShader: AURA_FRAG, transparent: true, depthWrite: false,
      premultipliedAlpha: true, blending: THREE.AdditiveBlending,
      uniforms: { uSize: { value: auraSize }, uArch: { value: arch }, uSel: { value: 0 }, uWarm: { value: C.warm } },
    })));
    aura.visible = false;
    scene.add(mesh, refl, aura);
    return { shrine: s, mesh, refl, aura, sel: 0 };
  });

  // Flames (diya ring + the sanctum flame).
  const flameGeo = track(new THREE.BufferGeometry());
  flameGeo.setAttribute('position', new THREE.BufferAttribute(flamePos, 3));
  flameGeo.setAttribute('aSeed', new THREE.BufferAttribute(flameSeed, 2));
  const flameScale = { value: 0 };
  const flames = new THREE.Points(flameGeo, track(new THREE.ShaderMaterial({
    vertexShader: FLAME_VERT, fragmentShader: FLAME_FRAG, transparent: true, depthWrite: false, premultipliedAlpha: true,
    uniforms: { uTime: time, uScale: flameScale, uLit: lit, uCore: { value: C.core }, uWarm: { value: C.warm } },
  })));
  flames.renderOrder = 5;
  scene.add(flames);

  // Sanctum halo.
  const halo = new THREE.Mesh(planeGeo, track(new THREE.ShaderMaterial({
    vertexShader: SPRITE_VERT, fragmentShader: HALO_FRAG, transparent: true, depthWrite: false, premultipliedAlpha: true,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: time, uLit: lit, uGlow: glow, uFlare: flare, uCore: { value: C.core }, uWarm: { value: C.warm }, uRose: { value: C.rose } },
  })));
  halo.position.set(0, ARCH_H * 1.05, -0.6);
  halo.scale.set(7.5, 7.5, 1);
  scene.add(halo);

  // Embers rising from the sanctum and the lamp ring.
  const emberCount = mobile ? 60 : 170;
  const emberSeed = new Float32Array(emberCount * 4);
  for (let i = 0; i < emberCount; i++) {
    const fromCentre = Math.random() < 0.45;
    const a = Math.random() * TAU;
    const r = fromCentre ? Math.random() * 1.1 : diyaR + (Math.random() - 0.5) * 0.6;
    emberSeed.set([Math.sin(a) * r, Math.cos(a) * r * (fromCentre ? 1 : (RING_Z + 1.25) / diyaR), 0.03 + Math.random() * 0.05, Math.random()], i * 4);
  }
  const emberGeo = track(new THREE.BufferGeometry());
  emberGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(emberCount * 3), 3));
  emberGeo.setAttribute('aSeed', new THREE.BufferAttribute(emberSeed, 4));
  const emberScale = { value: 0 };
  const embers = new THREE.Points(emberGeo, track(new THREE.ShaderMaterial({
    vertexShader: EMBER_VERT, fragmentShader: EMBER_FRAG, transparent: true, depthWrite: false, premultipliedAlpha: true,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: time, uScale: emberScale, uHeight: { value: 6.5 }, uLit: lit, uColor: { value: C.ember } },
  })));
  embers.frustumCulled = false;
  embers.renderOrder = 6;
  scene.add(embers);

  // Incense smoke.
  const smokeDefs = mobile
    ? [{ x: 0, y: 3.4, z: -0.6, w: 4.2, h: 7, a: 0.11 }]
    : [
      { x: 0, y: 3.6, z: -0.6, w: 4.6, h: 7.5, a: 0.12 },
      { x: -5.6, y: 2.6, z: 3.2, w: 3.6, h: 6, a: 0.07 },
      { x: 5.9, y: 2.4, z: 2.2, w: 3.4, h: 5.5, a: 0.06 },
    ];
  const smokes = smokeDefs.map((d, i) => {
    const m = new THREE.Mesh(planeGeo, track(new THREE.ShaderMaterial({
      vertexShader: SPRITE_VERT, fragmentShader: SMOKE_FRAG, transparent: true, depthWrite: false,
      premultipliedAlpha: true, defines: { OCTAVES: mobile ? 3 : 4 },
      uniforms: { uTime: time, uSeed: { value: i * 0.37 }, uAlpha: { value: d.a }, uColor: { value: C.smoke } },
    })));
    m.position.set(d.x, d.y, d.z);
    m.scale.set(d.w, d.h, 1);
    m.renderOrder = 7;
    scene.add(m);
    return m;
  });

  /* ---------- textures: decode off the main thread, upload one per frame ---------- */
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const textures = [];
  const uploadQueue = [];
  const loadArt = async (p, i) => {
    const img = new Image();
    img.decoding = 'async';
    img.src = `${artBase}${p.shrine.art}.webp`;
    try {
      await img.decode();
    } catch (err) {
      console.warn(`[v4] art failed to load: ${p.shrine.art}`, err);
      return;
    }
    const tex = track(new THREE.Texture(img));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    textures[i] = tex;
    const aspT = img.naturalWidth / img.naturalHeight;
    const aspA = ARCH_W / ARCH_H;
    const cover = aspT > aspA ? new THREE.Vector2(aspA / aspT, 1) : new THREE.Vector2(1, aspT / aspA);
    const fx = clamp(p.shrine.focus ?? 0.5, cover.x / 2, 1 - cover.x / 2);
    uploadQueue.push({ p, tex, cover, focus: new THREE.Vector2(fx, 0.5) });
  };
  const order = [...shrines.keys()].sort((a, b) => {
    const da = Math.min(Math.abs(a - initialIndex), n - Math.abs(a - initialIndex));
    const db = Math.min(Math.abs(b - initialIndex), n - Math.abs(b - initialIndex));
    return da - db;
  });
  const firstArt = loadArt(panels[order[0]], order[0]);
  order.slice(1).forEach((i) => loadArt(panels[i], i));

  /* ---------- motion state ---------- */
  let pos = initialIndex;               // continuous carousel position (index units)
  let tween = null;                     // { from, to, t0, dur, ease }
  let nudge = null;                     // { t0 }: a short turn toward the next shrine and back
  let nOff = 0;
  let dragging = null;                  // { startPos }
  let lastNearest = initialIndex;
  let vel = 0;
  let breath = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const view = { w: 1, h: 1, stageCx: 0.5, stageCy: 0.5, stageH: 0.6, pxPerItem: 400 };
  const focus = new THREE.Vector3(0, FLOAT + ARCH_H / 2, RING_Z + PULL);
  const camDir = new THREE.Vector3(0, Math.sin(PITCH), Math.cos(PITCH));
  const tmpV = new THREE.Vector3();
  let camDist = 10;
  let introT0 = 0;
  let running = false;
  let active = true;
  let raf = 0;
  let last = 0;

  const wrap = (v) => ((v % n) + n) % n;
  const nearest = () => wrap(Math.round(pos));

  function setTween(to, dur, ease) {
    tween = { from: pos, to, t0: performance.now(), dur, ease };
  }
  function foldNudge() { if (nudge) { pos += nOff; nOff = 0; nudge = null; } }
  function startNudge() { if (dragging || tween || nudge || !running) return; nudge = { t0: performance.now() }; kick(); }
  function goTo(index) {
    foldNudge();
    const cur = tween ? tween.to : Math.round(pos);
    let delta = wrap(index - wrap(cur));
    if (delta > n / 2) delta -= n;
    const to = cur + delta;
    if (to === (tween ? tween.to : pos)) return;
    const dist = Math.abs(to - pos);
    const midFlight = tween && performance.now() - tween.t0 < tween.dur;
    setTween(to, 1150 + 260 * Math.min(dist, 3), midFlight ? easeOut : easeInOut);
    lastNearest = wrap(to);
    kick();
  }
  function dragStart() { foldNudge(); dragging = { startPos: pos }; tween = null; kick(); }
  function dragMove(dxPx) {
    if (!dragging) return;
    pos = dragging.startPos - dxPx / view.pxPerItem;
    reportNearest();
  }
  function dragEnd(vPxPerMs) {
    if (!dragging) return nearest();
    const startPos = dragging.startPos;
    dragging = null;
    // Land on the nearest shrine; a quick flick that did not cross half a shrine still advances one.
    let to = Math.round(pos);
    const start = Math.round(startPos);
    if (to === start && Math.abs(vPxPerMs) > 0.35) to = start - Math.sign(vPxPerMs);
    setTween(to, 700 + 320 * Math.min(Math.abs(to - pos), 3), easeOut);
    tween.fromDrag = true;
    lastNearest = wrap(to);
    kick();
    return wrap(to);
  }
  function reportNearest() {
    if (!dragging && !(tween && tween.fromDrag)) return;
    const k = nearest();
    if (k !== lastNearest) {
      lastNearest = k;
      onIndexChange?.(k);
    }
  }

  /* ---------- layout: fit the camera so the chosen shrine fills the DOM stage ---------- */
  function resize() {
    const hr = heroEl.getBoundingClientRect();
    const sr = stageEl.getBoundingClientRect();
    const w = Math.max(1, Math.round(hr.width));
    const h = Math.max(1, Math.round(hr.height));
    view.w = w; view.h = h;
    view.stageCx = (sr.left - hr.left + sr.width / 2);
    view.stageCy = (sr.top - hr.top + sr.height / 2);
    view.pxPerItem = Math.max(160, sr.width * 0.95);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.setViewOffset(w, h, w / 2 - view.stageCx, h / 2 - view.stageCy, w, h);
    // Height of the arch (incl. a little air) must match the stage height.
    const tanHalf = Math.tan((FOV * Math.PI) / 360);
    camDist = (ARCH_H * 1.06 * h) / (2 * tanHalf * Math.max(120, sr.height));
    // Point sizes are in device pixels.
    const dpr = renderer.getPixelRatio();
    flameScale.value = (mobile ? 24 : 26) * dpr * (h / 900) * 10;
    emberScale.value = (mobile ? 6.5 : 6) * dpr * (h / 900) * 10;
    // Backdrop: far plane that always covers the view.
    const bz = -24;
    const bdDist = camDist + RING_Z + PULL - bz;
    const fh = 2 * bdDist * tanHalf * 1.5;
    const fw = Math.max(fh * camera.aspect * 1.15, fh * 2);
    backdrop.scale.set(fw, fw / 2, 1);
    // Put the painted horizon where the floor visibly fades out, seen from the resting camera.
    const cp = tmpV.copy(camDir).multiplyScalar(camDist).add(focus);
    const edgeZ = -15;
    const horizonY = cp.y * (1 - (cp.z - bz) / (cp.z - edgeZ));
    backdrop.position.set(0, horizonY + 0.12 * (fw / 2) + 0.15, bz);
    kick();
  }

  /* ---------- per-frame ---------- */
  function frame(now) {
    raf = 0;
    if (!running) return;
    const c0 = performance.now();
    const dt = Math.min(64, now - (last || now));
    last = now;
    time.value = now / 1000;

    // Upload at most one texture per frame (avoids a long task).
    const up = uploadQueue.shift();
    if (up) applyUpload(up, now);

    // Intro: the chosen shrine is already where the CSS arch was (seamless handoff); around it the lamps
    // light from the back of the circle to the front and the other shrines emerge from the dusk.
    const intro = clamp((now - introT0) / 2600, 0, 1);
    lit.value = smooth(clamp(intro * 1.15, 0, 1));

    // Carousel position (+ the one-time nudge that shows the ring can turn).
    const prev = pos + nOff;
    let tp = 0;
    if (tween) {
      tp = clamp((now - tween.t0) / tween.dur, 0, 1);
      pos = lerp(tween.from, tween.to, tween.ease(tp));
      if (tp >= 1) { pos = tween.to; tween = null; }
      reportNearest();
    }
    nOff = 0;
    if (nudge) {
      const q = (now - nudge.t0) / NUDGE_MS;
      if (q >= 1) nudge = null; else nOff = NUDGE_AMP * Math.pow(Math.sin(Math.PI * q), 2);
    }
    const shown = pos + nOff;
    const v = (shown - prev) / Math.max(dt, 1) * 16;
    vel = lerp(vel, v, 0.12);
    const moving = Math.min(1, Math.abs(vel) * 45);
    breath = lerp(breath, moving, moving > breath ? 0.08 : 0.035);
    flare.value = 1 - smooth(clamp((now - flareT0) / 2600, 0, 1));
    glow.value = Math.max(breath, flare.value * 0.8);

    // Camera: fitted distance, subtle pointer drift, a small breath back and a lag opposite the motion.
    pointer.sx = lerp(pointer.sx, pointer.x, 0.035);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.035);
    tmpV.copy(camDir).multiplyScalar(camDist * (1 + 0.05 * breath));
    camera.position.copy(focus).add(tmpV);
    camera.position.x += pointer.sx * 0.45 - vel * 18;
    camera.position.y += -pointer.sy * 0.25 + breath * 0.35;
    camera.lookAt(focus.x + pointer.sx * 0.12, focus.y + breath * 0.08, focus.z);

    // Panels on the ring.
    for (let i = 0; i < n; i++) {
      const p = panels[i];
      let off = i - shown;
      off = ((off % n) + n + n / 2) % n - n / 2;
      const a = (off / n) * TAU;
      const s = 1 - smooth(clamp(Math.abs(off), 0, 1));
      const x = Math.sin(a) * RING_X * (1 - 0.15 * s);
      const zr = Math.cos(a) * RING_Z;
      const z = zr + s * PULL;
      const bob = Math.sin(time.value * 0.55 + i * 1.7) * 0.035 * (1 - 0.5 * s);
      const sc = lerp(SIDE_SCALE, 1, s);
      const y = FLOAT + (ARCH_H * sc) / 2 + bob;
      p.mesh.position.set(x, y, z);
      p.mesh.scale.set(size.x * sc, size.y * sc, 1);
      const back = clamp((Math.abs(off) - 1) / 2.5, 0, 1);
      const reveal = Math.max(s * s, smooth(clamp((lit.value - 0.2 - back * 0.3) / 0.45, 0, 1)));
      const faceCam = Math.atan2(camera.position.x - x, camera.position.z - z);
      const yaw = faceCam + Math.sin(a) * 0.55 * (1 - s) + Math.sin(time.value * 0.35 + i) * 0.02;
      p.mesh.rotation.set(-PITCH * s, yaw, 0);
      p.aura.visible = s > 0.01 && breath > 0.01;
      if (p.aura.visible) {
        p.aura.position.set(x - Math.sin(yaw) * 0.05, y, z - Math.cos(yaw) * 0.05);
        p.aura.scale.set(auraSize.x * sc, auraSize.y * sc, 1);
        p.aura.rotation.set(-PITCH * s, yaw, 0);
        p.aura.material.uniforms.uSel.value = s * reveal * breath;
      }
      p.refl.position.set(x, -y, z);
      p.refl.scale.set(size.x * sc, -size.y * sc, 1);
      p.refl.rotation.set(PITCH * s, yaw, 0);
      const bright = lerp(lerp(0.56, 0.36, back), 1.0, s) * reveal;
      const u = p.mesh.material.uniforms;
      const ur = p.refl.material.uniforms;
      u.uSel.value = ur.uSel.value = s;
      u.uBright.value = bright;
      ur.uBright.value = bright * 0.85;
      const mix = p.fadeIn ? smooth(clamp((now - p.fadeIn) / 700, 0, 1)) : 0;
      u.uMapMix.value = ur.uMapMix.value = mix;
    }

    halo.quaternion.copy(camera.quaternion);
    for (const m of smokes) m.quaternion.copy(camera.quaternion);

    renderer.render(scene, camera);
    stats.frames++;
    const cpu = performance.now() - c0;        // main-thread cost of this frame (vsync-independent)
    stats.cpuSum += cpu;
    stats.cpuMax = Math.max(stats.cpuMax, cpu);
    raf = requestAnimationFrame(frame);
  }

  function applyUpload(up, at) {
    renderer.initTexture(up.tex);
    const u = up.p.mesh.material.uniforms;
    const ur = up.p.refl.material.uniforms;
    u.uMap.value = ur.uMap.value = up.tex;
    u.uCover.value.copy(up.cover); ur.uCover.value.copy(up.cover);
    u.uFocus.value.copy(up.focus); ur.uFocus.value.copy(up.focus);
    up.p.fadeIn = at;
  }

  function kick() {
    if (running && !raf) raf = requestAnimationFrame(frame);
  }
  function setActive(on) {
    active = on;
    running = on && ready;
    if (running) { last = 0; kick(); } else if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  function setPointer(nx, ny) { pointer.x = nx; pointer.y = ny; }

  const ro = new ResizeObserver(() => resize());
  ro.observe(heroEl);
  ro.observe(stageEl);

  const stats = { frames: 0, cpuSum: 0, cpuMax: 0 };
  let ready = false;
  resize();

  // Wait for the first painting (the chosen shrine) so the scene never appears empty, then compile and start.
  await firstArt;
  // The chosen shrine's painting goes up before the first frame, fully shown (no fade over the CSS arch).
  const k = uploadQueue.findIndex((q) => q.p === panels[initialIndex]);
  if (k >= 0) applyUpload(uploadQueue.splice(k, 1)[0], -1e9);
  await renderer.compileAsync(scene, camera);
  ready = true;
  introT0 = performance.now();
  running = active;
  kick();
  // Fade in only once a real frame has been drawn.
  requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()));

  function dispose() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    for (const d of disposables) d.dispose?.();
    renderer.dispose();
    renderer.forceContextLoss?.();
  }

  // V4: restart the lamp intro with a bright sanctum (called when the walk-in glow hands over to the scene).
  function relight() { introT0 = performance.now(); flareT0 = introT0; kick(); }
  // V4: the halo's centre in CSS px of the canvas, as the camera rests now.
  function sanctumPoint() {
    tmpV.copy(halo.position).project(camera);
    return { x: (tmpV.x + 1) / 2 * view.w, y: (1 - tmpV.y) / 2 * view.h };
  }

  return { goTo, nudge: startNudge, dragStart, dragMove, dragEnd, setActive, setPointer, resize, dispose, relight, sanctumPoint, stats, get index() { return nearest(); } };
}
