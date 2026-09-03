#!/usr/bin/env node
// make-reel.mjs — one command → one MP4.
//
//   node make-reel.mjs sanskar --lang en
//   node make-reel.mjs sanskar --lang hi --tts openai
//   node make-reel.mjs sanskar --lang en --music music/bansuri.mp3
//   node make-reel.mjs sanskar --lang en --reuse-capture   # skip the sim, reuse the last beat clips
//
// Stages: preflight → narrate → timeline → cards → flows → capture → captions → assemble.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { preflight } from './preflight.mjs';
import { narrateReel } from './narrate.mjs';
import { computeTimeline } from './timeline.mjs';
import { captionCues, renderCaptionPngs } from './captions.mjs';
import { renderCards } from './cards.mjs';
import { writeFlows } from './flow.mjs';
import { capture } from './capture.mjs';
import { assemble } from './assemble.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const a = { slug: argv[2], lang: 'en', tts: undefined, music: undefined, reuseCapture: false, keep: false };
  for (let i = 3; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--lang') a.lang = argv[++i];
    else if (v === '--tts') a.tts = argv[++i];
    else if (v === '--music') a.music = argv[++i];
    else if (v === '--reuse-capture') a.reuseCapture = true;
    else if (v === '--keep') a.keep = true;
  }
  return a;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.slug || !['en', 'hi'].includes(args.lang)) {
    console.error('usage: node make-reel.mjs <slug> --lang en|hi [--tts openai|say] [--music <file>] [--reuse-capture] [--keep]');
    process.exit(1);
  }

  const reelPath = path.join(HERE, 'reels', `${args.slug}.reel.mjs`);
  if (!fs.existsSync(reelPath)) { console.error('no reel: ' + reelPath); process.exit(1); }
  const reel = (await import(reelPath)).default;

  console.log(`\n▶ reel: ${reel.slug}  lang: ${args.lang}`);
  const problems = preflight({ needSim: !args.reuseCapture });
  if (problems.length) { console.error('preflight failed:\n  - ' + problems.join('\n  - ')); process.exit(2); }

  const voiceDir = path.join(HERE, 'voice');
  const flowsDir = path.join(HERE, 'flows');
  const workDir = path.join(HERE, 'out', `${reel.slug}-${args.lang}.work`);
  const outDir = path.join(HERE, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `vedansh-${reel.slug}-${args.lang}.mp4`);

  console.log('① narrate');
  const nar = await narrateReel(reel, args.lang, { engine: args.tts, outDir: voiceDir });
  console.log(`  engine=${nar.engine}  hook=${nar.durations.hook}ms cta=${nar.durations.cta}ms beats=[${nar.durations.beats.join(', ')}]ms`);

  console.log('② timeline');
  const timeline = computeTimeline(reel, nar.durations);
  console.log(`  total=${(timeline.total / 1000).toFixed(1)}s (intro ${(timeline.introDur/1000).toFixed(1)} + app ${(timeline.appVideoDur/1000).toFixed(1)} + cta ${(timeline.ctaDur/1000).toFixed(1)})`);

  console.log('③ cards');
  const cards = renderCards(reel, args.lang, workDir, undefined);

  console.log('④ captions');
  const captions = renderCaptionPngs(captionCues(timeline, reel, args.lang), workDir, args.lang, reel.slug);

  console.log('⑤ flows');
  const flows = writeFlows(reel, args.lang, timeline, flowsDir);

  console.log('⑥ capture');
  const clipPaths = reel.beats.map((_, i) => path.join(workDir, `${reel.slug}.${args.lang}.beat${i}.mov`));
  let clips;
  if (args.reuseCapture && clipPaths.every((c) => fs.existsSync(c))) {
    console.log('  reusing ' + clipPaths.length + ' beat clip(s)');
    clips = clipPaths;
  } else {
    clips = await capture(reel, args.lang, flows, workDir);
  }

  console.log('⑦ assemble');
  assemble(
    { clips, intro: cards.intro, cta: cards.cta, captions, voice: nar.files, music: args.music },
    timeline, outFile,
    { workDir, keep: args.keep },
  );

  console.log(`\n✅ ${outFile}`);
}

main().catch((e) => { console.error('\n✖ ' + (e.stack || e.message)); process.exit(1); });
