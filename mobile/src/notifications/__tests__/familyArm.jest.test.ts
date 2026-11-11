import * as Notifications from 'expo-notifications';
import {
  armNotificationFamily,
  cancelNotificationFamily,
  resetNotificationFamiliesForTests,
  type FamilySlot,
} from '@/notifications/familyArm';

/**
 * A stateful stand-in for the OS queue, so these tests assert the property that
 * matters — what ends up pending — as well as how much native work it cost.
 */
type Pending = { identifier: string; content: unknown; trigger: unknown };
const mockOs = { pending: new Map<string, Pending>() };

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(async () => [...mockOs.pending.values()]),
  cancelScheduledNotificationAsync: jest.fn(async (identifier: string) => { mockOs.pending.delete(identifier); }),
  scheduleNotificationAsync: jest.fn(async (request: Pending) => { mockOs.pending.set(request.identifier, request); return request.identifier; }),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const read = Notifications.getAllScheduledNotificationsAsync as jest.Mock;
const cancel = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const schedule = Notifications.scheduleNotificationAsync as jest.Mock;

const slot = (identifier: string, date: Date, title = 'दैनिक भक्ति'): FamilySlot => ({
  identifier,
  content: { title, body: 'body', data: { type: 'daily-verse' }, sound: 'default' },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date },
});
const day = (n: number) => new Date(2026, 10, n, 7, 0, 0, 0);
const plan = (...days: number[]) => days.map(n => slot(`daily-verse:2026-11-${n}:0700`, day(n)));
const pendingIds = () => [...mockOs.pending.keys()].sort();
/** Model a new app process over the same OS queue. */
const restartProcess = () => { resetNotificationFamiliesForTests(); jest.clearAllMocks(); };

beforeEach(() => { mockOs.pending.clear(); restartProcess(); });

describe('armNotificationFamily', () => {
  test('leaves the OS holding exactly the plan', async () => {
    await expect(armNotificationFamily('daily-verse', plan(12, 13, 14))).resolves.toBe(3);
    expect(pendingIds()).toEqual(['daily-verse:2026-11-12:0700', 'daily-verse:2026-11-13:0700', 'daily-verse:2026-11-14:0700']);
  });

  test('an identical plan in the same process costs no native call at all', async () => {
    await armNotificationFamily('daily-verse', plan(12, 13, 14));
    jest.clearAllMocks();
    await expect(armNotificationFamily('daily-verse', plan(12, 13, 14))).resolves.toBe(3);
    expect(read).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    expect(schedule).not.toHaveBeenCalled();
  });

  test('the first arm of a new process re-registers every slot, even when the store already lists them', async () => {
    // A force-stop clears an app's alarms but not the store they are listed in.
    // Only scheduling again restores them, so "already pending" must never be
    // taken as "already armed" across a process boundary.
    await armNotificationFamily('daily-verse', plan(12, 13, 14));
    restartProcess();
    await armNotificationFamily('daily-verse', plan(12, 13, 14));
    expect(schedule).toHaveBeenCalledTimes(3);
    // ...but nothing that is about to be scheduled again is cancelled first.
    expect(cancel).not.toHaveBeenCalled();
    expect(read).toHaveBeenCalledTimes(1);
  });

  test('a rolled window cancels only the slot that left the plan', async () => {
    await armNotificationFamily('daily-verse', plan(12, 13, 14));
    jest.clearAllMocks();
    await armNotificationFamily('daily-verse', plan(13, 14, 15));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith('daily-verse:2026-11-12:0700');
    expect(pendingIds()).toEqual(['daily-verse:2026-11-13:0700', 'daily-verse:2026-11-14:0700', 'daily-verse:2026-11-15:0700']);
  });

  test.each([
    ['copy', () => [slot('daily-verse:2026-11-12:0700', day(12), 'Daily Bhakti')]],
    ['fire instant', () => [slot('daily-verse:2026-11-12:0700', new Date(2026, 10, 12, 8, 0))]],
    ['payload', () => [{ ...slot('daily-verse:2026-11-12:0700', day(12)), content: { title: 'दैनिक भक्ति', body: 'body', data: { type: 'daily-verse', verseIndex: 4 }, sound: 'default' } }]],
  ])('a changed %s under the same identifier is re-armed', async (_what, changed) => {
    await armNotificationFamily('daily-verse', plan(12));
    jest.clearAllMocks();
    const next = changed() as FamilySlot[];
    await armNotificationFamily('daily-verse', next);
    expect(schedule).toHaveBeenCalledTimes(1);
    expect(mockOs.pending.get('daily-verse:2026-11-12:0700')).toEqual(next[0]);
  });

  test('never touches another family’s slots', async () => {
    mockOs.pending.set('vrat-reminder:ekadashi:dayOf:2026-11-20', { identifier: 'vrat-reminder:ekadashi:dayOf:2026-11-20', content: {}, trigger: {} });
    mockOs.pending.set('japam-alarm:abc', { identifier: 'japam-alarm:abc', content: {}, trigger: {} });
    mockOs.pending.set('daily-verse:2026-11-01:0700', { identifier: 'daily-verse:2026-11-01:0700', content: {}, trigger: {} });
    await armNotificationFamily('daily-verse', plan(12));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledWith('daily-verse:2026-11-01:0700');
    expect(pendingIds()).toEqual(['daily-verse:2026-11-12:0700', 'japam-alarm:abc', 'vrat-reminder:ekadashi:dayOf:2026-11-20']);
  });

  test('an empty plan clears the family', async () => {
    await armNotificationFamily('daily-verse', plan(12, 13));
    await expect(armNotificationFamily('daily-verse', [])).resolves.toBe(0);
    expect(pendingIds()).toEqual([]);
  });

  test('a slot that fails to schedule is skipped, and the plan is tried again next time', async () => {
    schedule.mockRejectedValueOnce(new Error('OS budget full'));
    await expect(armNotificationFamily('daily-verse', plan(12, 13))).resolves.toBe(1);
    jest.clearAllMocks();
    await expect(armNotificationFamily('daily-verse', plan(12, 13))).resolves.toBe(2);
    expect(schedule).toHaveBeenCalledTimes(2);
    expect(pendingIds()).toEqual(['daily-verse:2026-11-12:0700', 'daily-verse:2026-11-13:0700']);
  });

  test('a failed read rejects and is not mistaken for an armed plan', async () => {
    read.mockRejectedValueOnce(new Error('store unavailable'));
    await expect(armNotificationFamily('daily-verse', plan(12))).rejects.toThrow('store unavailable');
    await expect(armNotificationFamily('daily-verse', plan(12))).resolves.toBe(1);
    expect(pendingIds()).toEqual(['daily-verse:2026-11-12:0700']);
  });

  test('overlapping re-arms of one family run in order and leave exactly the later plan', async () => {
    const first = armNotificationFamily('daily-verse', plan(12, 13, 14));
    const second = armNotificationFamily('daily-verse', plan(20, 21));
    await Promise.all([first, second]);
    expect(pendingIds()).toEqual(['daily-verse:2026-11-20:0700', 'daily-verse:2026-11-21:0700']);
  });

  test('families arming together share one read of the pending list', async () => {
    await Promise.all([
      armNotificationFamily('daily-verse', plan(12)),
      armNotificationFamily('vrat-reminder', [slot('vrat-reminder:ekadashi:dayOf:2026-11-20', day(20))]),
      armNotificationFamily('festive-reminder', [slot('festive-reminder:diwali:2026-11-08', day(8))]),
      armNotificationFamily('return-reminder', [slot('return-reminder:2026-11-14', day(14))]),
    ]);
    expect(read).toHaveBeenCalledTimes(1);
    expect(pendingIds()).toHaveLength(4);
  });

  test('a family never reuses a read that began before its own last write finished', async () => {
    const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
    await armNotificationFamily('daily-verse', plan(12));
    // Long after that launch wave, another family starts a read that is slow to
    // come back. What it returns is the queue as it stood when the read BEGAN.
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 60_000);
    let releaseRead!: () => void;
    read.mockImplementationOnce(() => {
      const snapshot = [...mockOs.pending.values()];
      return new Promise(resolve => { releaseRead = () => resolve(snapshot); });
    });
    const other = armNotificationFamily('vrat-reminder', [slot('vrat-reminder:x:dayOf:2026-11-20', day(20))]);
    await flush();
    // While it is in flight this family re-arms twice. The first may share that
    // read (it began after this family's last write). The second may not: the
    // list predates the slot the first one is about to schedule.
    const rolled = armNotificationFamily('daily-verse', plan(13));
    const rolledAgain = armNotificationFamily('daily-verse', plan(14));
    await flush();
    releaseRead();
    await Promise.all([other, rolled, rolledAgain]);
    expect(pendingIds()).toEqual(['daily-verse:2026-11-14:0700', 'vrat-reminder:x:dayOf:2026-11-20']);
    jest.restoreAllMocks();
  });

  test('a read is not reused once its wave is over', async () => {
    await armNotificationFamily('daily-verse', plan(12));
    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 60_000);
    await armNotificationFamily('vrat-reminder', [slot('vrat-reminder:x:dayOf:2026-11-20', day(20))]);
    expect(read).toHaveBeenCalledTimes(2);
    jest.restoreAllMocks();
  });
});

describe('cancelNotificationFamily', () => {
  test('cancels only the family’s own slots', async () => {
    mockOs.pending.set('japam-alarm:abc', { identifier: 'japam-alarm:abc', content: {}, trigger: {} });
    await armNotificationFamily('daily-verse', plan(12, 13));
    await cancelNotificationFamily('daily-verse');
    expect(pendingIds()).toEqual(['japam-alarm:abc']);
  });

  test('cancelling an already-empty family again costs no native call', async () => {
    await cancelNotificationFamily('daily-verse');
    jest.clearAllMocks();
    await cancelNotificationFamily('daily-verse');
    expect(read).not.toHaveBeenCalled();
  });

  test('a plan armed after a cancel is scheduled, and a cancel after an arm clears it', async () => {
    await cancelNotificationFamily('daily-verse');
    await armNotificationFamily('daily-verse', plan(12));
    expect(pendingIds()).toEqual(['daily-verse:2026-11-12:0700']);
    await cancelNotificationFamily('daily-verse');
    expect(pendingIds()).toEqual([]);
    // The same plan again must not be skipped as "already armed".
    await armNotificationFamily('daily-verse', plan(12));
    expect(pendingIds()).toEqual(['daily-verse:2026-11-12:0700']);
  });
});
