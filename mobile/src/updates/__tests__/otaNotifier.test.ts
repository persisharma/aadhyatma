import assert from 'node:assert/strict';

import {
  OTA_DEFAULT_BODY,
  OTA_DEFAULT_TITLE,
  planOtaReleaseNotification,
  type OtaReleaseMetadata,
} from '@/notifications/pure';

const metaOff: OtaReleaseMetadata = {
  version: 1,
  notify: false,
  title: '',
  body: '',
};

const metaOnDefault: OtaReleaseMetadata = {
  version: 1,
  notify: true,
  title: '',
  body: '',
};

const metaOnCustom: OtaReleaseMetadata = {
  version: 1,
  notify: true,
  title: 'New chapter',
  body: 'Tap to read.',
};

// notify=false → silent.
{
  const plan = planOtaReleaseNotification({
    metadata: metaOff,
    currentUpdateId: 'abc',
    lastNotifiedUpdateId: null,
    isEmbeddedLaunch: false,
  });
  assert.equal(plan, null, 'notify=false must not fire');
}

// No updateId (dev / Expo Go) → silent.
{
  const plan = planOtaReleaseNotification({
    metadata: metaOnCustom,
    currentUpdateId: null,
    lastNotifiedUpdateId: null,
    isEmbeddedLaunch: false,
  });
  assert.equal(plan, null, 'null updateId must not fire');
}

// Embedded launch → silent (binary just installed).
{
  const plan = planOtaReleaseNotification({
    metadata: metaOnCustom,
    currentUpdateId: 'abc',
    lastNotifiedUpdateId: null,
    isEmbeddedLaunch: true,
  });
  assert.equal(plan, null, 'embedded launch must not fire');
}

// Same updateId already notified → silent (idempotent on relaunch).
{
  const plan = planOtaReleaseNotification({
    metadata: metaOnCustom,
    currentUpdateId: 'abc',
    lastNotifiedUpdateId: 'abc',
    isEmbeddedLaunch: false,
  });
  assert.equal(plan, null, 'same updateId must not re-fire');
}

// Different updateId, notify=true, custom copy → uses custom.
{
  const plan = planOtaReleaseNotification({
    metadata: metaOnCustom,
    currentUpdateId: 'abc',
    lastNotifiedUpdateId: 'prev',
    isEmbeddedLaunch: false,
  });
  assert.deepEqual(plan, { title: 'New chapter', body: 'Tap to read.' });
}

// Different updateId, notify=true, blank copy → uses defaults.
{
  const plan = planOtaReleaseNotification({
    metadata: metaOnDefault,
    currentUpdateId: 'abc',
    lastNotifiedUpdateId: null,
    isEmbeddedLaunch: false,
  });
  assert.deepEqual(plan, { title: OTA_DEFAULT_TITLE, body: OTA_DEFAULT_BODY });
}

// Whitespace-only copy → falls back to defaults.
{
  const plan = planOtaReleaseNotification({
    metadata: { version: 1, notify: true, title: '   ', body: '\n\t ' },
    currentUpdateId: 'abc',
    lastNotifiedUpdateId: null,
    isEmbeddedLaunch: false,
  });
  assert.deepEqual(plan, { title: OTA_DEFAULT_TITLE, body: OTA_DEFAULT_BODY });
}

// Null metadata → silent (e.g. bundle without the descriptor for some reason).
{
  const plan = planOtaReleaseNotification({
    metadata: null,
    currentUpdateId: 'abc',
    lastNotifiedUpdateId: null,
    isEmbeddedLaunch: false,
  });
  assert.equal(plan, null);
}

console.log('otaNotifier: all checks passed');
