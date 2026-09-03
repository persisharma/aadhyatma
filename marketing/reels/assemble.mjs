// assemble.mjs — compose the final 1080×1920 reel with ffmpeg.
//
// Passes: (A) normalize app footage to exactly appVideoDur, (B) concat intro+app+cta and overlay
// the caption PNGs at their cue times, (C) build the VO (+optional music) track, (D) mux → out.mp4.
// Captions are image overlays (not burned subtitles) because this ffmpeg has no libass/drawtext.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FFMPEG = process.env.FFMPEG_BIN || 'ffmpeg';
const FFPROBE = process.env.FFPROBE_BIN || 'ffprobe';
const W = 1080, H = 1920, FPS = 30;
const PAD = '0x120A03'; // dark brand ink for letterbox pad
// Fixed lead-trim override (seconds). If unset, we auto-detect the first scene change (the app's
// first navigation away from Home) and trim the Maestro-startup dead prefix there.
const LEAD_TRIM_OVERRIDE = process.env.REEL_LEAD_TRIM_MS ? Number(process.env.REEL_LEAD_TRIM_MS) / 1000 : null;

const ms = (x) => (x / 1000).toFixed(3);
const run = (args) => execFileSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' });

function probeDurSec(file) {
  const out = execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nk=1:nw=1', file], { encoding: 'utf8' }).trim();
  return parseFloat(out) || 0;
}

/** First scene change after `minSec` (fallback detector). */
function detectSceneChangeSec(file, minSec) {
  try {
    const out = execFileSync(
      FFMPEG,
      ['-hide_banner', '-i', file, '-vf', "select='gt(scene,0.1)',metadata=print:file=-", '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    for (const m of out.matchAll(/pts_time:([0-9.]+)/g)) {
      const t = parseFloat(m[1]);
      if (t >= minSec) return t;
    }
  } catch {}
  return minSec;
}

/**
 * End of the app-launch prefix = the first sustained "warm" (app cream/saffron) frame.
 * The iOS springboard + splash read BLUE (chroma UAVG > VAVG); the Vedansh app reads WARM
 * (VAVG > UAVG). Trimming to the first warm frame reliably drops the launch screens from the cold
 * open — the correct fix vs "first scene change", which can land mid-springboard. Falls back to
 * scene-change, then `minSec`. This is the guard that keeps launch screens out of every reel.
 */
function detectContentStartSec(file, minSec = 1) {
  try {
    const out = execFileSync(
      FFMPEG,
      ['-hide_banner', '-i', file, '-vf', "select='not(mod(n,10))',signalstats,metadata=print:file=-", '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 27 },
    );
    const rows = [];
    const re = /pts_time:([0-9.]+)[\s\S]*?UAVG=([0-9.]+)[\s\S]*?VAVG=([0-9.]+)/g;
    let m;
    while ((m = re.exec(out))) rows.push({ t: +m[1], u: +m[2], v: +m[3] });
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const sustained = i + 1 >= rows.length || rows[i + 1].v > rows[i + 1].u;
      if (r.t >= minSec && r.v > r.u + 4 && sustained) return Math.max(0, r.t - 0.1);
    }
  } catch {}
  return detectSceneChangeSec(file, Math.max(minSec, 3));
}

/**
 * @param inputs  { clips:[mov per beat], intro, cta, captions:[{png,startMs,endMs}], voice:{hook,beats[],cta}, music? }
 * @param timeline output of computeTimeline
 * @param outFile  final mp4 path
 * @param opts     { workDir, keep }
 */
export function assemble(inputs, timeline, outFile, opts = {}) {
  const work = opts.workDir || path.dirname(outFile);
  fs.mkdirSync(work, { recursive: true });
  const app = path.join(work, 'app.mp4');
  const base = path.join(work, 'base.mp4');
  const audio = path.join(work, 'audio.m4a');

  // ── Pass A: per-beat trim + time-scale. Each beat was recorded as its OWN clip; scale each to
  // EXACTLY its caption window (outDurs[i]) and concat → app.mp4. This keeps every beat's footage
  // under its own VO/caption — uniform-scaling one continuous capture drifts them whenever beats
  // carry uneven navigation weight (a 1-tap beat vs. an 8-tap "go to My Vrat" beat). Maestro's
  // per-command overhead makes each clip longer than its slot; speeding up the (mostly static)
  // screens is visually invisible and keeps every screen in the reel. ──
  // Per-beat output ms; beat 0 also carries the hook time (segStart 0). Σ = appVideoDur.
  const outDurs = timeline.beats.map((b, i) => (i === 0 ? b.segEnd : b.segEnd - b.segStart));
  const segFiles = [];
  inputs.clips.forEach((clip, i) => {
    const clipDur = probeDurSec(clip);
    // Beat 0 opens the reel → trim to the first warm app frame (drops any launch/settle screen).
    // Later beats resume on live app content, so just shave the short foreground blip.
    const trimStart = i === 0
      ? (LEAD_TRIM_OVERRIDE != null ? LEAD_TRIM_OVERRIDE : detectContentStartSec(clip))
      : (clipDur > 1 ? 0.2 : 0); // never trim a short/glitched clip down to nothing
    const effective = Math.max(0.3, clipDur - trimStart);
    const outSec = outDurs[i] / 1000;
    const ratio = effective / outSec; // >1 → speed up
    const seg = path.join(work, `appseg${i}.mp4`);
    console.log(`    beat ${i}: clip ${clipDur.toFixed(1)}s, trim@${trimStart.toFixed(1)}s → ${outSec.toFixed(1)}s (×${ratio.toFixed(2)})`);
    // `simctl recordVideo` clips are VARIABLE-frame-rate — a static dwell records almost no frames,
    // so its tail has none. `fps=${FPS}` FIRST converts VFR→CFR, cloning the held frame across the
    // dwell so the full clip duration survives (a per-beat clip ends on its dwell, so without this
    // the dwell is dropped and the seg comes out short). Trim via the filter — an `-ss` INPUT seek
    // corrupts frame timing on these sparse clips. tpad + `-t` then pin the seg to exactly outDur.
    run([
      '-i', clip,
      '-an',
      '-vf',
        `scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
        `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${PAD},` +
        `fps=${FPS},trim=start=${trimStart.toFixed(3)},setpts=(PTS-STARTPTS)/${ratio.toFixed(4)},setsar=1,` +
        `tpad=stop_mode=clone:stop_duration=600`,
      '-t', ms(outDurs[i]),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', seg,
    ]);
    segFiles.push(seg);
  });
  const concatList = path.join(work, 'appconcat.txt');
  fs.writeFileSync(concatList, segFiles.map((f) => `file '${f}'`).join('\n') + '\n');
  run(['-f', 'concat', '-safe', '0', '-i', concatList, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', app]);

  // ── Pass B: cold open — app first (hook overlays it), then a short CTA card. No intro card. ──
  const caps = inputs.captions || [];
  const bIn = ['-i', app, '-loop', '1', '-t', ms(timeline.ctaDur), '-i', inputs.cta];
  caps.forEach((c) => bIn.push('-i', c.png)); // caption inputs are 2, 3, …

  const fc = [
    `[0:v]setsar=1[a]`,
    `[1:v]scale=${W}:${H},fps=${FPS},setsar=1[c]`,
    `[a][c]concat=n=2:v=1:a=0[bv]`,
  ];
  let last = '[bv]';
  caps.forEach((c, k) => {
    const inLabel = `[${2 + k}:v]`;
    const outLabel = k === caps.length - 1 ? '[vout]' : `[v${k}]`;
    fc.push(`${last}${inLabel}overlay=0:0:enable='between(t,${ms(c.startMs)},${ms(c.endMs)})'${outLabel}`);
    last = outLabel;
  });
  const mapV = caps.length ? '[vout]' : '[bv]';
  run([...bIn, '-filter_complex', fc.join(';'), '-map', mapV, '-r', String(FPS), '-pix_fmt', 'yuv420p', '-c:v', 'libx264', base]);

  // ── Pass C: VO (hook@0, beat i @ voStart, cta @ voStart) + optional music bed ──
  const voiceFiles = [inputs.voice.hook, ...inputs.voice.beats, inputs.voice.cta];
  const delays = [0, ...timeline.beats.map((b) => b.voStart), timeline.cta.voStart];
  const aIn = [];
  voiceFiles.forEach((f) => aIn.push('-i', f));
  if (inputs.music) aIn.push('-i', inputs.music);

  const afc = [];
  const labels = [];
  voiceFiles.forEach((_, k) => {
    afc.push(
      `[${k}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,` +
        `adelay=${Math.round(delays[k])}:all=1[a${k}]`,
    );
    labels.push(`[a${k}]`);
  });
  afc.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:dropout_transition=0[vomix]`);
  afc.push(`[vomix]apad,atrim=0:${ms(timeline.total)},loudnorm=I=-16:TP=-1.5:LRA=11[vo]`);
  let audioOut = '[vo]';
  if (inputs.music) {
    const mi = voiceFiles.length;
    afc.push(
      `[${mi}:a]aresample=44100,aformat=sample_fmts=fltp:channel_layouts=stereo,` +
        `aloop=loop=-1:size=2000000000,atrim=0:${ms(timeline.total)},volume=0.12[mus]`,
    );
    afc.push(`[vo][mus]amix=inputs=2:normalize=0[mix]`);
    audioOut = '[mix]';
  }
  run([...aIn, '-filter_complex', afc.join(';'), '-map', audioOut, '-c:a', 'aac', '-b:a', '192k', audio]);

  // ── Pass D: mux ──
  run([
    '-i', base, '-i', audio,
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart',
    outFile,
  ]);

  // Safety net: a reel must open on app content, never the iOS launch/springboard (blue).
  try {
    const s = execFileSync(
      FFMPEG,
      ['-hide_banner', '-ss', '0.4', '-i', outFile, '-frames:v', '1', '-vf', 'signalstats,metadata=print:file=-', '-f', 'null', '-'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    const u = +(s.match(/UAVG=([0-9.]+)/)?.[1] || 0);
    const v = +(s.match(/VAVG=([0-9.]+)/)?.[1] || 0);
    if (u > v) {
      console.log(`  ⚠ WARNING: reel opens on a blue/launch-looking frame (UAVG ${u.toFixed(0)} > VAVG ${v.toFixed(0)}). The trim may have leaked the app-launch screen — set REEL_LEAD_TRIM_MS or check detectContentStartSec.`);
    }
  } catch {}

  if (!opts.keep) for (const f of [app, base, audio, concatList, ...segFiles]) { try { fs.rmSync(f); } catch {} }
  return outFile;
}
