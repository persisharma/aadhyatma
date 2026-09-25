import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';

/**
 * PRD-06 Track C — बैकअप व पुनर्स्थापन. The screen shows what THIS device
 * holds (grouped counts), exports through the share sheet, and restores only
 * after a preview + confirm, then reloads. The device glue (`backupIo`) is
 * mocked so expo-file-system / document-picker / sharing stay out of Jest; the
 * pure format is pinned by `src/backup/__tests__/backup.test.ts`.
 */

jest.mock('expo-linear-gradient', () => {
  const r = require('react');
  const { View: RNView } = require('react-native');
  return { LinearGradient: ({ children, ...p }: Record<string, unknown>) => r.createElement(RNView, p, children) };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), getState: () => ({ routeNames: [] }) }),
}));

const mockReadBackupEnvelope = jest.fn();
const mockExportBackup = jest.fn();
const mockPickBackupFile = jest.fn();
const mockApplyRestore = jest.fn();
const mockReloadAfterRestore = jest.fn();
jest.mock('@/backup/backupIo', () => ({
  readBackupEnvelope: () => mockReadBackupEnvelope(),
  exportBackup: () => mockExportBackup(),
  pickBackupFile: () => mockPickBackupFile(),
  applyRestore: (e: unknown) => mockApplyRestore(e),
  reloadAfterRestore: () => mockReloadAfterRestore(),
}));

let mockLastBackupAt: number | null | undefined = null;
jest.mock('@/backup/backupMeta', () => ({
  useLastBackupAt: () => mockLastBackupAt,
}));

import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { buildBackupEnvelope } from '@/backup/envelope';

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>('@/data/gita/language');
const BackupScreen = jest.requireActual<typeof import('../BackupScreen')>('../BackupScreen').default;

const deviceEnvelope = buildBackupEnvelope(
  [
    ['@vedansh:kundali-profiles:v1', '{"activeId":"p1","people":[{"id":"p1"},{"id":"p2"}]}'],
    ['@vedansh/pitru-smaran', '{"version":1,"entries":[{"id":"a"}]}'],
    ['@vedansh/bookmarks', '[{"id":"x"},{"id":"y"},{"id":"z"}]'],
    ['@vedansh/language', 'en'],
  ],
  { now: new Date('2026-09-25T00:00:00Z'), appVersion: 'test' }
);

function render(lang: 'hi' | 'en' = 'en') {
  const navigation = { goBack: jest.fn() } as never;
  const route = { key: 'Backup', name: 'Backup' } as never;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <BackupScreen navigation={navigation} route={route} />
          </GitaLanguageProvider>
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return tree;
}

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function textOf(tree: TestRenderer.ReactTestRenderer, testID: string): string {
  const target = tree.root.findAllByProps({ testID })[0];
  const collect = (children: unknown): string =>
    Array.isArray(children) ? children.map(collect).join('') : typeof children === 'string' ? children : '';
  return collect(target.props.children);
}

function press(tree: TestRenderer.ReactTestRenderer, testID: string) {
  act(() => {
    tree.root.findByProps({ testID }).props.onPress();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockLastBackupAt = null;
  mockReadBackupEnvelope.mockResolvedValue(deviceEnvelope);
  mockExportBackup.mockResolvedValue('shared');
  mockApplyRestore.mockResolvedValue(4);
  mockReloadAfterRestore.mockResolvedValue(true);
});

describe('BackupScreen — what this phone holds', () => {
  test('groups count what the device would export; empty groups say so', async () => {
    const tree = render('en');
    await flush();
    expect(textOf(tree, 'backup-count-family')).toBe('3'); // 2 people + 1 pitru entry
    expect(textOf(tree, 'backup-count-practice')).toBe('3'); // 3 bookmarks
    expect(textOf(tree, 'backup-count-follows')).toBe('Nothing yet');
    expect(textOf(tree, 'backup-count-preferences')).toBe('1');
    expect(textOf(tree, 'backup-last')).toBe('No backup yet');
  });

  test('shows the last backup date once one exists', async () => {
    mockLastBackupAt = new Date(2026, 8, 20).getTime();
    const tree = render('en');
    await flush();
    expect(textOf(tree, 'backup-last')).toMatch(/^Last backup · /);
  });

  test('Hindi chrome', async () => {
    const tree = render('hi');
    await flush();
    expect(textOf(tree, 'backup-count-follows')).toBe('कुछ नहीं');
    expect(textOf(tree, 'backup-last')).toBe('अभी तक कोई बैकअप नहीं');
  });
});

describe('BackupScreen — export', () => {
  test('the export button hands off to exportBackup and shows no notice on success', async () => {
    const tree = render('en');
    await flush();
    press(tree, 'backup-export');
    await flush();
    expect(mockExportBackup).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByProps({ testID: 'backup-notice' })).toHaveLength(0);
  });

  test('no share sheet → an honest notice, nothing thrown', async () => {
    mockExportBackup.mockResolvedValue('unavailable');
    const tree = render('en');
    await flush();
    press(tree, 'backup-export');
    await flush();
    expect(textOf(tree, 'backup-notice')).toBe('The share sheet is not available here.');
  });

  test('a write failure → retry notice', async () => {
    mockExportBackup.mockRejectedValue(new Error('disk'));
    const tree = render('en');
    await flush();
    press(tree, 'backup-export');
    await flush();
    expect(textOf(tree, 'backup-notice')).toBe('Could not create the backup — try again.');
  });
});

describe('BackupScreen — restore', () => {
  let alertSpy: jest.SpyInstance;
  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });
  afterEach(() => {
    alertSpy.mockRestore();
  });

  test('cancelling the picker writes nothing and shows nothing', async () => {
    mockPickBackupFile.mockResolvedValue({ picked: false });
    const tree = render('en');
    await flush();
    press(tree, 'backup-restore');
    await flush();
    expect(mockApplyRestore).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(tree.root.findAllByProps({ testID: 'backup-notice' })).toHaveLength(0);
  });

  test.each([
    ['not-a-backup', 'This is not a Vedansh backup file.'],
    ['corrupt', 'This is not a Vedansh backup file.'],
    ['newer-version', 'This backup is from a newer Vedansh version — update the app first.'],
    ['kul-parampara-file', 'This is a Kul Parampara hand-on file, not a full backup.'],
    ['empty', 'This backup holds nothing to restore.'],
  ])('an invalid file (%s) is reported, never written', async (reason, message) => {
    mockPickBackupFile.mockResolvedValue({ picked: true, result: { ok: false, reason } });
    const tree = render('en');
    await flush();
    press(tree, 'backup-restore');
    await flush();
    expect(mockApplyRestore).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(textOf(tree, 'backup-notice')).toBe(message);
  });

  test('a valid file previews its groups, and Cancel on the confirm writes nothing', async () => {
    mockPickBackupFile.mockResolvedValue({ picked: true, result: { ok: true, envelope: deviceEnvelope } });
    alertSpy.mockImplementation((_title, _message, buttons) => {
      const cancel = (buttons as { style?: string; onPress?: () => void }[]).find((b) => b.style === 'cancel');
      cancel?.onPress?.();
    });
    const tree = render('en');
    await flush();
    press(tree, 'backup-restore');
    await flush();
    expect(alertSpy).toHaveBeenCalledTimes(1);
    const [title, message] = alertSpy.mock.calls[0];
    expect(title).toBe('Restore from this file?');
    expect(message).toContain('Family & Jyotish · 3');
    expect(message).toContain('Practice & reading · 3');
    expect(message).not.toContain('Reminders & alarms');
    expect(message).toContain('will be replaced by the file');
    expect(mockApplyRestore).not.toHaveBeenCalled();
    expect(mockReloadAfterRestore).not.toHaveBeenCalled();
  });

  test('confirming writes the envelope and reloads; no notice when the reload succeeds', async () => {
    mockPickBackupFile.mockResolvedValue({ picked: true, result: { ok: true, envelope: deviceEnvelope } });
    alertSpy.mockImplementation((_title, _message, buttons) => {
      const confirm = (buttons as { style?: string; onPress?: () => void }[]).find((b) => b.style === 'destructive');
      confirm?.onPress?.();
    });
    const tree = render('en');
    await flush();
    press(tree, 'backup-restore');
    await flush();
    expect(mockApplyRestore).toHaveBeenCalledWith(deviceEnvelope);
    expect(mockReloadAfterRestore).toHaveBeenCalledTimes(1);
    expect(tree.root.findAllByProps({ testID: 'backup-notice' })).toHaveLength(0);
  });

  test('when the runtime cannot reload, the user is told to reopen the app', async () => {
    mockPickBackupFile.mockResolvedValue({ picked: true, result: { ok: true, envelope: deviceEnvelope } });
    mockReloadAfterRestore.mockResolvedValue(false);
    alertSpy.mockImplementation((_title, _message, buttons) => {
      (buttons as { style?: string; onPress?: () => void }[]).find((b) => b.style === 'destructive')?.onPress?.();
    });
    const tree = render('en');
    await flush();
    press(tree, 'backup-restore');
    await flush();
    expect(mockApplyRestore).toHaveBeenCalledTimes(1);
    expect(textOf(tree, 'backup-notice')).toBe('Restored. Close and reopen Vedansh to see your data.');
  });

  test('a storage failure during the write is reported', async () => {
    mockPickBackupFile.mockResolvedValue({ picked: true, result: { ok: true, envelope: deviceEnvelope } });
    mockApplyRestore.mockRejectedValue(new Error('storage'));
    alertSpy.mockImplementation((_title, _message, buttons) => {
      (buttons as { style?: string; onPress?: () => void }[]).find((b) => b.style === 'destructive')?.onPress?.();
    });
    const tree = render('en');
    await flush();
    press(tree, 'backup-restore');
    await flush();
    expect(mockReloadAfterRestore).not.toHaveBeenCalled();
    expect(textOf(tree, 'backup-notice')).toBe('Could not restore — try again.');
  });
});
