// timeline.mjs — PURE timing math for a reel. No I/O, fully unit-tested.
//
// COLD-OPEN + CONTINUOUS-FLOW model (v3, Instagram-first):
//  - NO branded intro card. The reel opens on live app footage in frame 0 with the HOOK as an
//    on-screen caption + voice — so viewers see value instantly (a 3–4s intro card kills retention).
//  - The narration runs line-to-line with only a tiny breath (no dead air); assemble.mjs time-scales
//    the app footage to ride that continuous VO, so screens change *with* the words, like a reel.
//  - Brand/CTA is a short card at the END only.
// The hook + every beat are "lines" laid over one continuous app-video region [0 .. appVideoDur].
// `dwell` is a capture-only floor (Maestro needs the screen to sit still to act); assemble
// compresses the real capture down to appVideoDur.

export const TIMING = {
  GAP_MS: 150, // breath between lines — small, to keep narration continuous
  MIN_CTA_MS: 2000, // short end card
  CTA_LEAD_MS: 400, // pad after the CTA line on its card
  MIN_CAPTURE_DWELL_MS: 2200, // per-beat capture-hold floor (reliability only, not the final cut)
};

/** Capture-hold floor for a beat (used only to generate the Maestro flow, not the final cut). */
export function beatCaptureDwell(voDurMs, t = TIMING) {
  return Math.max(t.MIN_CAPTURE_DWELL_MS, Math.round(voDurMs) + t.GAP_MS);
}

/**
 * @param reel      the reel definition ({ beats, ... })
 * @param durations { hook:ms, cta:ms, beats:[ms per beat] } — measured VO clip lengths
 * @returns { introDur(=0), appVideoDur, ctaDur, total, hook, beats[], cta }  (all ms)
 */
export function computeTimeline(reel, durations, t = TIMING) {
  if (!durations || !Array.isArray(durations.beats)) {
    throw new Error('computeTimeline: durations.beats[] is required');
  }
  if (durations.beats.length !== reel.beats.length) {
    throw new Error(
      `computeTimeline: durations.beats has ${durations.beats.length} entries, reel has ${reel.beats.length} beats`,
    );
  }

  const hookDur = durations.hook || 0;
  // The hook overlays the opening app footage.
  const hook = { voStart: 0, voDur: hookDur, captionStart: 0, captionEnd: hookDur };

  const beats = [];
  let cursor = hookDur + t.GAP_MS; // beats begin right after the hook line, over the same app video
  for (let i = 0; i < reel.beats.length; i++) {
    const voDur = durations.beats[i] || 0;
    const voStart = cursor;
    beats.push({
      index: i,
      segStart: cursor,
      segEnd: cursor + voDur + t.GAP_MS,
      voStart,
      voDur,
      captionStart: voStart,
      captionEnd: voStart + voDur,
      dwell: beatCaptureDwell(voDur, t), // capture-only floor
    });
    cursor += voDur + t.GAP_MS;
  }

  const appVideoDur = cursor; // hook + beats all ride this one continuous app region (no intro card)
  const ctaDur = Math.max(t.MIN_CTA_MS, (durations.cta || 0) + t.CTA_LEAD_MS);
  return {
    introDur: 0, // cold open — no intro card
    appVideoDur,
    ctaDur,
    total: appVideoDur + ctaDur,
    hook,
    beats,
    cta: { start: appVideoDur, voStart: appVideoDur, voDur: durations.cta || 0 },
  };
}
