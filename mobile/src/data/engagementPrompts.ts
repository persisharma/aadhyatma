import { INSTAGRAM_URL } from '@/data/shareLinks';

/** Owner controls. Change a campaign ID and deliver the bundle to re-arm it once.
 * Keep an ID stable between campaigns; never use an app version or a timestamp here.
 * Social resets preserve the review; review resets explicitly restart the review flow.
 */
export const ENGAGEMENT_PROMPTS = {
  reviewCampaignId: 'initial',
  socialCampaignId: 'initial',
  socialEnabled: true,
  instagramUrl: INSTAGRAM_URL,
  // Owner-supplied Facebook share link; retain its app/browser hand-off target.
  facebookUrl: 'https://www.facebook.com/share/18wwA4vHG4/?mibextid=wwXIfr' as string | null,
};

export type SocialPlatform = 'instagram' | 'facebook';
export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = ['instagram', 'facebook'];

/** HTTPS opens the installed app or browser, without new native scheme queries. */
export function socialPageUrl(platform: SocialPlatform): string | null {
  const raw = platform === 'instagram' ? ENGAGEMENT_PROMPTS.instagramUrl : ENGAGEMENT_PROMPTS.facebookUrl;
  if (!raw) return null;
  const hosts = platform === 'instagram' ? ['instagram.com', 'www.instagram.com']
    : ['facebook.com', 'www.facebook.com', 'm.facebook.com'];
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port &&
      hosts.includes(url.hostname) && url.pathname !== '/' ? raw : null;
  } catch {
    return null;
  }
}

export type SocialPromptState = {
  campaignId: string;
  askCount: number;
  lastAskedAt: number | null;
  confirmed: Partial<Record<SocialPlatform, boolean>>;
};

export function newSocialPromptState(): SocialPromptState {
  return { campaignId: ENGAGEMENT_PROMPTS.socialCampaignId, askCount: 0, lastAskedAt: null, confirmed: {} };
}

export function parseSocialPromptState(raw: unknown): SocialPromptState {
  const fresh = newSocialPromptState();
  if (!raw || typeof raw !== 'object') return fresh;
  const value = raw as Partial<SocialPromptState>;
  if (value.campaignId !== fresh.campaignId) return fresh;
  return {
    campaignId: fresh.campaignId,
    askCount: Number.isSafeInteger(value.askCount) && value.askCount! >= 0 ? value.askCount! : 0,
    lastAskedAt: typeof value.lastAskedAt === 'number' && Number.isFinite(value.lastAskedAt) && value.lastAskedAt > 0
      ? value.lastAskedAt : null,
    confirmed: Object.fromEntries(SOCIAL_PLATFORMS.filter((platform) => value.confirmed?.[platform] === true).map((platform) => [platform, true])),
  };
}

export function pendingSocialPlatforms(state: SocialPromptState): SocialPlatform[] {
  return SOCIAL_PLATFORMS.filter((platform) => socialPageUrl(platform) !== null && !state.confirmed[platform]);
}

/** A first social ask needs a new completed action, never the store-return event.
 * Thereafter reuse rating's two days OR next action cadence. Opening a page is
 * never treated as a confirmed follow; only the user's explicit confirmation is.
 */
export function isEligibleForSocialPrompt(state: SocialPromptState, hasReviewHandoff: boolean,
  completedAction: boolean, now: number): boolean {
  if (!ENGAGEMENT_PROMPTS.socialEnabled || !hasReviewHandoff || !pendingSocialPlatforms(state).length) return false;
  return completedAction || (state.lastAskedAt !== null && now - state.lastAskedAt >= 2 * 86400000);
}
