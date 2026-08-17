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

/** First scene change after `minSec` — the app's first navigation, i.e. the end of the dead prefix. */
function detectContentStartSec(file, minSec = 3) {
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
  return minSec; // fallback
}

/**
 * @param inputs  { rawMov, intro, cta, captions:[{png,startMs,endMs}], voice:{hook,beats[],cta}, music? }
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

  // ── Pass A: trim the dead startup prefix, then time-scale the app footage to EXACTLY
  // appVideoDur so the beats line up with the VO. Maestro's per-command overhead makes the raw
  // capture much longer than planned; speeding up the (mostly static) reading screens is
  // visually invisible and keeps every screen in the reel. ──
  const rawDur = probeDurSec(inputs.rawMov);
  const trimStart = LEAD_TRIM_OVERRIDE != null ? LEAD_TRIM_OVERRIDE : detectContentStartSec(inputs.rawMov);
  const effective = Math.max(1, rawDur - trimStart);
  const ratio = effective / (timeline.appVideoDur / 1000); // >1 → speed up
  console.log(`    app footage: raw ${rawDur.toFixed(1)}s, trim@${trimStart.toFixed(1)}s → fit ${(timeline.appVideoDur/1000).toFixed(1)}s (×${ratio.toFixed(2)})`);
  run([
    '-ss', String(trimStart),
    '-i', inputs.rawMov,
    '-an',
    '-vf',
      `scale=${W}:${H}:force_original_aspect_ratio=decrease,` +
      `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${PAD},` +
      `setpts=PTS/${ratio.toFixed(4)},fps=${FPS},setsar=1,` +
      `tpad=stop_mode=clone:stop_duration=600`,
    '-t', ms(timeline.appVideoDur),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', app,
  ]);

  // ── Pass B: intro + app + cta, then overlay caption PNGs at their cue times ──
  const caps = inputs.captions || [];
  const bIn = [
    '-loop', '1', '-t', ms(timeline.introDur), '-i', inputs.intro,
    '-i', app,
    '-loop', '1', '-t', ms(timeline.ctaDur), '-i', inputs.cta,
  ];
  caps.forEach((c) => bIn.push('-i', c.png)); // caption inputs are 3, 4, …

  const fc = [
    `[0:v]scale=${W}:${H},fps=${FPS},setsar=1[i]`,
    `[1:v]setsar=1[a]`,
    `[2:v]scale=${W}:${H},fps=${FPS},setsar=1[c]`,
    `[i][a][c]concat=n=3:v=1:a=0[bv]`,
  ];
  let last = '[bv]';
  caps.forEach((c, k) => {
    const inLabel = `[${3 + k}:v]`;
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

  if (!opts.keep) for (const f of [app, base, audio]) { try { fs.rmSync(f); } catch {} }
  return outFile;
}
