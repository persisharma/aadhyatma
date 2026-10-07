import { createMetaActivationController, type MetaActivationDependencies } from '../metaActivationController';

function harness(platform: 'ios' | 'android' = 'ios') {
  let state: ReturnType<MetaActivationDependencies['currentState']> = 'active';
  const deps: MetaActivationDependencies = {
    platform,
    currentState: () => state,
    getPermission: jest.fn().mockResolvedValue({ status: 'denied', canAskAgain: false }),
    requestPermission: jest.fn().mockResolvedValue({ status: 'granted', canAskAgain: true }),
    activate: jest.fn().mockResolvedValue(true),
  };
  const controller = createMetaActivationController(deps);
  const setState = (next: NonNullable<typeof state>) => { state = next; controller.onStateChange(next); };
  return { deps, controller, setState };
}

test('denied/restricted ATT still permits generic activation without requesting again', async () => {
  const { deps, controller } = harness();
  await controller.start();
  expect(deps.requestPermission).not.toHaveBeenCalled();
  expect(deps.activate).toHaveBeenCalledTimes(1);
  expect(deps.activate).toHaveBeenCalledWith();
});

test('a permission-sheet inactive/active cycle does not duplicate activation', async () => {
  const { deps, controller, setState } = harness();
  (deps.getPermission as jest.Mock).mockResolvedValue({ status: 'undetermined', canAskAgain: true });
  let finish!: (result: { status: string; canAskAgain: boolean }) => void;
  (deps.requestPermission as jest.Mock).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  const first = controller.start();
  await Promise.resolve();
  setState('inactive');
  setState('active');
  finish({ status: 'granted', canAskAgain: true });
  await first;
  await controller.start();
  expect(deps.requestPermission).toHaveBeenCalledTimes(1);
  expect(deps.activate).toHaveBeenCalledTimes(1);
});

test('foreground return rechecks ATT after settings revocation', async () => {
  const { deps, controller, setState } = harness();
  (deps.getPermission as jest.Mock).mockResolvedValueOnce({ status: 'granted', canAskAgain: true });
  await controller.start();
  setState('background');
  setState('active');
  await controller.start();
  expect(deps.getPermission).toHaveBeenCalledTimes(2);
  expect(deps.requestPermission).not.toHaveBeenCalled();
  expect(deps.activate).toHaveBeenCalledTimes(2);
});

test('an active transition during permission completion is not lost', async () => {
  const { deps, controller, setState } = harness();
  const first = controller.start();
  setState('inactive');
  // The permission continuation sees inactive, then the active notification
  // arrives before its pending promise has cleared.
  queueMicrotask(() => setState('active'));
  await first;
  await controller.start();
  expect(deps.activate).toHaveBeenCalledTimes(1);
});

test('another permission dialog defers ATT instead of consuming its one request', async () => {
  const { deps, controller, setState } = harness();
  (deps.getPermission as jest.Mock).mockResolvedValue({ status: 'undetermined', canAskAgain: true });
  const first = controller.start();
  setState('inactive');
  await first;
  expect(deps.requestPermission).not.toHaveBeenCalled();
  expect(deps.activate).not.toHaveBeenCalled();
  setState('active');
  await controller.start();
  expect(deps.requestPermission).toHaveBeenCalledTimes(1);
  expect(deps.activate).toHaveBeenCalledTimes(1);
});

test('an ATT request that showed no prompt can be retried on a later active transition', async () => {
  const { deps, controller, setState } = harness();
  (deps.getPermission as jest.Mock).mockResolvedValue({ status: 'undetermined', canAskAgain: true });
  (deps.requestPermission as jest.Mock).mockResolvedValueOnce({ status: 'undetermined', canAskAgain: true });
  await controller.start();
  setState('inactive');
  setState('active');
  await controller.start();
  expect(deps.requestPermission).toHaveBeenCalledTimes(2);
  expect(deps.activate).toHaveBeenCalledTimes(1);
});

test('backgrounding during ATT defers native activation until foreground', async () => {
  const { deps, controller, setState } = harness();
  let finish!: (result: { status: string; canAskAgain: boolean }) => void;
  (deps.getPermission as jest.Mock).mockResolvedValue({ status: 'undetermined', canAskAgain: true });
  (deps.requestPermission as jest.Mock).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  const first = controller.start();
  await Promise.resolve();
  setState('background');
  finish({ status: 'denied', canAskAgain: false });
  await first;
  expect(deps.activate).not.toHaveBeenCalled();
  setState('active');
  await controller.start();
  expect(deps.activate).toHaveBeenCalledTimes(1);
  expect(deps.requestPermission).toHaveBeenCalledTimes(1);
});

test('Android activation never invokes ATT', async () => {
  const { deps, controller } = harness('android');
  await controller.start();
  expect(deps.getPermission).not.toHaveBeenCalled();
  expect(deps.requestPermission).not.toHaveBeenCalled();
  expect(deps.activate).toHaveBeenCalledTimes(1);
});

test('a tracking error does not escape and a later foreground retries', async () => {
  const { deps, controller, setState } = harness();
  (deps.activate as jest.Mock).mockRejectedValueOnce(new Error('network/configuration'));
  await expect(controller.start()).resolves.toBeUndefined();
  setState('background');
  setState('active');
  await controller.start();
  expect(deps.activate).toHaveBeenCalledTimes(2);
});

test('stopping during an asynchronous permission read prevents activation', async () => {
  const { deps, controller } = harness();
  const first = controller.start();
  controller.stop();
  await first;
  expect(deps.activate).not.toHaveBeenCalled();
});
