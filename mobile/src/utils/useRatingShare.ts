import { beginRatingInteraction } from '@/contexts/ratingInteraction';
import { useCallback } from 'react';
import { Share } from 'react-native';
import { useRatingAsk } from '@/contexts/ratingAsk';

/** Text/CSV hand-offs outside ShareProvider use the same completed-share moment. */
export function useRatingShare() {
  const requestRatingAsk = useRatingAsk();
  return useCallback(async (...args: Parameters<typeof Share.share>) => {
    const finish = beginRatingInteraction();
    try {
      const result = await Share.share(...args);
      if (result.action === Share.sharedAction) requestRatingAsk('content-shared');
      return result;
    } catch {
      // An unavailable share target never earns a rating prompt.
      return undefined;
    } finally {
      finish();
    }
  }, [requestRatingAsk]);
}
