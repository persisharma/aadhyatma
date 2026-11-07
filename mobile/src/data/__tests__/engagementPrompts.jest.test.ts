import { ENGAGEMENT_PROMPTS, isEligibleForSocialPrompt, newSocialPromptState,
  parseSocialPromptState, pendingSocialPlatforms, socialPageUrl } from '@/data/engagementPrompts';
import { afterRated, parseRatingPromptState, RATING_PROMPT_DEFAULTS } from '@/data/ratingPrompt';

const original = { ...ENGAGEMENT_PROMPTS };
const now = 1794096000000;
afterEach(() => Object.assign(ENGAGEMENT_PROMPTS, original));

it('waits for a hand-off and a new action, never just a store return or cold start', () => {
  const state = newSocialPromptState();
  expect(isEligibleForSocialPrompt(state, false, true, now)).toBe(false);
  expect(isEligibleForSocialPrompt(state, true, false, now)).toBe(false);
  expect(isEligibleForSocialPrompt(state, true, true, now)).toBe(true);
});
it('repeats on two days OR next action, then stops for explicitly confirmed pages', () => {
  const state = { ...newSocialPromptState(), askCount: 1, lastAskedAt: now };
  expect(isEligibleForSocialPrompt(state, true, false, now + 2 * 86400000 - 1)).toBe(false);
  expect(isEligibleForSocialPrompt(state, true, false, now + 2 * 86400000)).toBe(true);
  expect(isEligibleForSocialPrompt(state, true, true, now + 1)).toBe(true);
  expect(isEligibleForSocialPrompt({ ...state, confirmed: { instagram: true } }, true, true, now)).toBe(false);
});
it('keeps Facebook pending independently and does not guess an absent URL', () => {
  expect(socialPageUrl('facebook')).toBeNull();
  ENGAGEMENT_PROMPTS.facebookUrl = 'https://www.facebook.com/test-vedansh-page';
  expect(pendingSocialPlatforms({ ...newSocialPromptState(), confirmed: { instagram: true } })).toEqual(['facebook']);
  ENGAGEMENT_PROMPTS.socialEnabled = false;
  expect(isEligibleForSocialPrompt(newSocialPromptState(), true, true, now)).toBe(false);
});
it.each(['http://facebook.com/page', 'https://evil.example/page', 'https://facebook.com.evil.example/page',
  'https://user:pass@facebook.com/page', 'https://facebook.com/', 'garbage'])(
  'rejects an invalid social target: %s', (url) => {
    ENGAGEMENT_PROMPTS.facebookUrl = url;
    expect(socialPageUrl('facebook')).toBeNull();
  });
it('defensively hydrates corrupt social counters and confirmations', () => {
  expect(parseSocialPromptState(null)).toEqual(newSocialPromptState());
  expect(parseSocialPromptState({ campaignId: 'initial', askCount: -2, lastAskedAt: Infinity,
    confirmed: { instagram: 'yes', facebook: true } })).toEqual({ ...newSocialPromptState(), confirmed: { facebook: true } });
});
it('a social reset is applied once and preserves the review and other app data', () => {
  const reviewed = { ...afterRated(RATING_PROMPT_DEFAULTS, now), social: {
    ...newSocialPromptState(), askCount: 9, lastAskedAt: now, confirmed: { instagram: true, facebook: true },
  } };
  ENGAGEMENT_PROMPTS.socialCampaignId = 'diwali-2026';
  const reset = parseRatingPromptState(JSON.stringify(reviewed));
  expect(reset.outcome).toBe('rated');
  expect(reset.storeHandoffCount).toBe(1);
  expect(reset.social).toEqual(newSocialPromptState());
  const answered = { ...reset, social: { ...reset.social, confirmed: { instagram: true } } };
  expect(parseRatingPromptState(JSON.stringify(answered))).toEqual(answered);
});
it('a separate review campaign can intentionally restart rating without clearing social confirmations', () => {
  const reviewed = { ...afterRated(RATING_PROMPT_DEFAULTS, now), social: {
    ...newSocialPromptState(), confirmed: { instagram: true },
  } };
  ENGAGEMENT_PROMPTS.reviewCampaignId = 'review-relaunch-2026';
  const reset = parseRatingPromptState(JSON.stringify(reviewed));
  expect(reset).toMatchObject({ campaignId: 'review-relaunch-2026', outcome: 'pending', storeHandoffCount: 0,
    social: { confirmed: { instagram: true } } });
  expect(parseRatingPromptState(JSON.stringify(reset))).toEqual(reset);
});
it('initial rollout preserves pre-campaign declines and low-rating pauses', () => {
  expect(parseRatingPromptState(JSON.stringify({ outcome: 'declined' })).outcome).toBe('declined');
  expect(parseRatingPromptState(JSON.stringify({ lowRatedAt: now })).lowRatedAt).toBe(now);
});
