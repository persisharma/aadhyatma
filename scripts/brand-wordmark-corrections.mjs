// User-requested correction of the two Hindi dots. Coordinates are relative to
// the pinned Hindi crop; every other master pixel, including flute/feather, stays.
export const hindiDotCorrections = {
  // Bindu aligns with the दा aa stroke (x=537..579), not the श curve.
  upper: { erase: [607, 48, 70, 65], center: [558, 81], radius: 18 },
  lower: { erase: [733, 358, 37, 33], center: [751, 381], radius: 7 },
};
export function correctHindiDots(master, PNG, crop) {
  const image = new PNG({ width: master.width, height: master.height });
  master.data.copy(image.data);
  for (const dot of Object.values(hindiDotCorrections)) {
    const [x0, y0, width, height] = dot.erase;
    for (let y = y0; y < y0 + height; y++) for (let x = x0; x < x0 + width; x++) {
      const index = ((y + crop[1]) * image.width + x + crop[0]) * 4;
      image.data.fill(0, index, index + 4);
    }
    // Subpixel coverage preserves a small round dot when native downsampling
    // renders it at the Home heading size.
    for (let y = Math.floor(dot.center[1] - dot.radius); y < Math.ceil(dot.center[1] + dot.radius); y++) {
      for (let x = Math.floor(dot.center[0] - dot.radius); x < Math.ceil(dot.center[0] + dot.radius); x++) {
        let coverage = 0;
        for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
          if ((x + (sx + .5) / 4 - dot.center[0]) ** 2 + (y + (sy + .5) / 4 - dot.center[1]) ** 2 < dot.radius ** 2) coverage++;
        }
        if (!coverage) continue;
        const index = ((y + crop[1]) * image.width + x + crop[0]) * 4;
        image.data.set([26, 14, 3, Math.round(255 * coverage / 16)], index);
      }
    }
  }
  return image;
}
