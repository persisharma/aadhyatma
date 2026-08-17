// captions.mjs — lower-third caption overlays as transparent PNGs (rendered by headless Chrome,
// so we get the brand fonts incl. Devanagari) plus their timing cues. This build of ffmpeg has no
// libass/drawtext, so captions are composited as image overlays, not burned subtitles.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1080, H = 1920;

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Noto+Serif+Devanagari:wght@600&display=swap" rel="stylesheet">`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** PURE: which caption text shows when. Absolute ms times from the timeline. */
export function captionCues(timeline, reel, lang) {
  return timeline.beats.map((b, i) => {
    const beat = reel.beats[i];
    const text = (beat.caption && beat.caption[lang]) || beat.narration[lang];
    return { index: i, text, startMs: b.captionStart, endMs: b.captionEnd };
  });
}

function captionHtml(text, lang) {
  const font = lang === 'hi' ? `'Noto Serif Devanagari'` : `'Cormorant Garamond'`;
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:${W}px; height:${H}px; background:transparent; overflow:hidden; }
  .wrap { position:absolute; left:70px; right:70px; bottom:250px; text-align:center; }
  .cap {
    display:inline-block; background:rgba(18,10,3,0.74); color:#F3E7C9;
    font-family:${font}, Georgia, serif; font-weight:600; font-size:58px; line-height:1.24;
    padding:22px 36px; border-radius:24px; border:1px solid rgba(232,200,135,0.35);
    -webkit-font-smoothing:antialiased; box-shadow:0 18px 50px rgba(0,0,0,0.45);
  }
</style></head><body><div class="wrap"><span class="cap">${esc(text)}</span></div></body></html>`;
}

function renderFrame(html, outPng) {
  const tmpHtml = outPng.replace(/\.png$/, '.html');
  fs.writeFileSync(tmpHtml, html);
  execFileSync(
    CHROME,
    [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--force-device-scale-factor=1', `--window-size=${W},${H}`,
      '--virtual-time-budget=6000', '--default-background-color=00000000',
      `--screenshot=${outPng}`, 'file://' + tmpHtml,
    ],
    { stdio: 'pipe', timeout: 60000 },
  );
  if (!fs.existsSync(outPng)) throw new Error('caption render failed: ' + outPng);
  return outPng;
}

/** Render a transparent PNG per cue. Returns cues augmented with { png }. */
export function renderCaptionPngs(cues, outDir, lang, slug) {
  fs.mkdirSync(outDir, { recursive: true });
  return cues.map((c) => ({
    ...c,
    png: renderFrame(captionHtml(c.text, lang), path.join(outDir, `${slug}-${lang}-cap-${c.index}.png`)),
  }));
}
