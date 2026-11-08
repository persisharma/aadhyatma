import type { PrathaEntry } from './types';

/** Publication independence is adjudicated by the reviewer, never inferred from URL counts. */
export function prathaVerificationIssues(entry: PrathaEntry): string[] {
  if (entry.status !== 'verified') return [];
  const issues: string[] = [];
  const rowRefs = new Set(entry.source.referenceUrls);
  for (const [index, story] of entry.kathas.entries()) {
    const prefix = `${entry.id}.kathas[${index}]`;
    const refs = new Set(story.referenceUrls ?? []);
    if (refs.size < 2 || ![...refs].some((url) => url.startsWith('https://'))) {
      issues.push(`${prefix}: two opened sources required for this story`);
    }
    if ([...refs].some((url) => !rowRefs.has(url))) issues.push(`${prefix}: story source missing from row`);
    if (/समीक्षाधीन|under review|unverified|pending/i.test(`${story.canonHi} ${story.canonEn}`)) {
      issues.push(`${prefix}: unresolved canon`);
    }
    if (['purana', 'shastra', 'kavya', 'agama'].includes(story.tier) && !/\d/.test(story.canonEn)) {
      issues.push(`${prefix}: exact chapter, section or verse required`);
    }
    if (story.tier === 'lok' && !/^लोक-परम्परा(?: \([^)]*\))?$/.test(story.canonHi)) {
      issues.push(`${prefix}: folk canon names no text`);
    }
  }
  return issues;
}

/** PRD-46 §8: ten verified Kartik entries open the pilot; other months cannot unlock it. */
export function isPrathaPilotReady(entries: readonly PrathaEntry[]): boolean {
  return entries.filter((entry) => entry.status === 'verified' && entry.anchors.masa?.includes(8)).length >= 10;
}
