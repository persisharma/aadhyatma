import * as Sharing from 'expo-sharing';
import { shareKulParamparaFile } from '@/panchang/kulParamparaShare';
import { subscribeRatingAsks } from '@/contexts/ratingAsk';
import { isRatingInteractionActive } from '@/contexts/ratingInteraction';

const mockWrite = jest.fn();
jest.mock('expo-file-system', () => ({
  Paths: { cache: 'file:///cache' },
  File: class { uri = 'file:///cache/tradition.json'; write = mockWrite; },
}));

beforeEach(() => { jest.clearAllMocks(); });
it('reports the JSON hand-off after sharing and releases the interaction guard', async () => {
  jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(true);
  jest.mocked(Sharing.shareAsync).mockImplementation(async () => {
    expect(isRatingInteractionActive()).toBe(true);
  });
  const asked = jest.fn(); const stop = subscribeRatingAsks(asked);
  try {
    expect(await shareKulParamparaFile('{}', 'tradition.json')).toBe(true);
    expect(mockWrite).toHaveBeenCalledWith('{}');
    expect(asked).toHaveBeenCalledWith('content-shared');
    expect(isRatingInteractionActive()).toBe(false);
  } finally { stop(); }
});

it.each(['unavailable', 'failed'])('does not report an %s hand-off', async (reason) => {
  jest.mocked(Sharing.isAvailableAsync).mockResolvedValue(reason !== 'unavailable');
  jest.mocked(Sharing.shareAsync).mockRejectedValue(new Error('Failed'));
  const asked = jest.fn(); const stop = subscribeRatingAsks(asked);
  try {
    if (reason === 'unavailable') expect(await shareKulParamparaFile('{}', 'x.json')).toBe(false);
    else await expect(shareKulParamparaFile('{}', 'x.json')).rejects.toThrow('Failed');
    expect(asked).not.toHaveBeenCalled();
    expect(isRatingInteractionActive()).toBe(false);
  } finally { stop(); }
});
