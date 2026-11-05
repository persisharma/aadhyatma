// Voiced variants of the bhajan cut: lays voice.py's clips over the rendered videos (video stream copied, no re-render).
// The bhajan ducks under the voice; the voice gets a warm EQ, gentle compression and a short room echo.
// Usage: node mix.mjs [--out <dir>]   (after build.mjs and voice.py)
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const i = process.argv.indexOf('--out');
const out = path.resolve(i > -1 ? process.argv[i + 1] : path.join(root, 'marketing/reels/out/bhajan-cut'));
const board = JSON.parse(fs.readFileSync(path.join(here, 'storyboard.json'), 'utf8'));
const beats = JSON.parse(fs.readFileSync(path.join(here, 'beats.json'), 'utf8'));
const vo = JSON.parse(fs.readFileSync(path.join(out, 'vo.json'), 'utf8'));
const run = args => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], {stdio: ['ignore', 'pipe', 'pipe']});
const strip = s => s.replace(/\{([^|}]+)\|[^}]+\}/g, '$1');

let b = 0;
const start = {};
for (const s of board.shots) { start[s.id] = beats.beats[b]; b += s.beats; }
const label = {hf_alpha: 'female', hm_omega: 'male'};
const lines = board.voiceOver.lines;

for (const voice of board.voiceOver.voices) for (const lang of ['hi', 'en']) for (const fmt of ['9x16', '4x5']) {
  const base = path.join(out, `vedansh-bhajan-cut-${lang}-${fmt}.mp4`);
  const total = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', base]).toString());
  const clips = lines.map((line, k) => {
    const row = vo.find(r => r.voice === voice && r.lang === lang && r.i === k);
    if (!row || row.text !== strip(line[lang])) throw Error(`Stale voice clip ${voice}/${lang}/${k}: rerun voice.py`);
    const at = start[line.shot] + line.offset;
    if (at + row.seconds > total - 0.2) throw Error(`${voice}/${lang}/${k} overruns the video`);
    return {file: path.join(out, row.file), at};
  });
  const inputs = ['-i', base, '-ss', String(beats.start), '-t', String(total), '-i', path.join(root, board.audio.file), ...clips.flatMap(c => ['-i', c.file])];
  const chain = clips.map((c, k) => `[${k + 2}:a]aresample=48000,highpass=f=90,equalizer=f=220:t=q:w=1:g=2.5,equalizer=f=6500:t=q:w=2:g=-3,` +
    `acompressor=threshold=-20dB:ratio=3:attack=5:release=120,aecho=0.85:0.5:38|61:0.14|0.09,aformat=channel_layouts=stereo,adelay=${Math.round(c.at * 1000)}:all=1,apad[v${k}]`).join(';');
  const fade = (total - board.audio.fadeOut).toFixed(3);
  const graph = `${chain};${clips.map((_, k) => `[v${k}]`).join('')}amix=inputs=${clips.length}:normalize=0:duration=longest,volume=1.5,asplit[vo][key];` +
    `[1:a]afade=t=in:d=0.02,afade=t=out:st=${fade}:d=${board.audio.fadeOut},aformat=channel_layouts=stereo,aresample=48000,volume=0.7[bed];` +
    `[bed][key]sidechaincompress=threshold=0.012:ratio=10:attack=12:release=380[duck];` +
    `[duck][vo]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`;
  const file = path.join(out, `vedansh-bhajan-cut-${lang}-voice-${label[voice]}-${fmt}.mp4`);
  run([...inputs, '-filter_complex', graph, '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ac', '2', '-t', String(total), '-movflags', '+faststart', file]);
  console.log(path.basename(file));
}
