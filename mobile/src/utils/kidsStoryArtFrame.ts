import reviewedFrames from '@/components/kidsStoryArtFrames.json';

// These frames remove only visually reviewed blank parchment below the scene.
// New artwork stays full-height until reviewed; caption length never sets a crop.
// Pure (JSON only) so the share paginator can size a scene without the renderer.
const artFrames: Record<string, { retainedHeight: number }> = reviewedFrames;

/** Fraction of the 4:5 source kept after the reviewed bottom-band trim (1 = full height). */
export function kidsStoryArtRetainedHeight(art: string): number {
  return artFrames[art]?.retainedHeight ?? 1;
}
