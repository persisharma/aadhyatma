#!/usr/bin/env python3
"""Run the complete corpus on a dedicated root-capable Android emulator."""
import json
import os
import pathlib
import subprocess
import sys
import time

device, apk, output = sys.argv[1:4]
out = pathlib.Path(output)
out.mkdir(parents=True, exist_ok=True)
adb = os.environ.get('ADB', '/opt/homebrew/share/android-commandlinetools/platform-tools/adb')
package = 'com.prashantsharma.vedansh'


def call(*args, check=True):
    return subprocess.run([adb, '-s', device, *args], check=check,
                          capture_output=True, text=True)


if not device.startswith('emulator-'):
    raise SystemExit('Use a dedicated emulator; this runner clears its installed app')
call('root')
call('wait-for-device')
if call('shell', 'id', '-u').stdout.strip() != '0':
    raise SystemExit('A root-capable Google APIs emulator is required to collect Release app evidence')
call('install', '-r', apk)
call('shell', 'pm', 'clear', package)
call('shell', 'svc', 'wifi', 'disable')
call('shell', 'svc', 'data', 'disable')
call('logcat', '-c')
call('shell', 'am', 'start', '-n', package + '/.MainActivity')
remote = '/data/user/0/' + package + '/files/'
deadline, changed = time.monotonic() + 10800, time.monotonic()
previous = None
while time.monotonic() < deadline:
    result = call('shell', 'cat', remote + 'library-audit.json', check=False)
    try:
        data = json.loads(result.stdout)
    except (json.JSONDecodeError, ValueError):
        data = None
    if data:
        state = (data['status'], data['verses'], data['renders'], len(data['failures']))
        if state != previous:
            print('status=%s verses=%s renders=%s failures=%s' % state, flush=True)
            previous, changed = state, time.monotonic()
            (out / 'library-audit-progress.json').write_text(json.dumps(data, indent=2))
        if data['status'] != 'running':
            (out / 'library-audit-final.json').write_text(json.dumps(data, indent=2))
            assert data['status'] == 'passed' and not data['failures'], data['failures']
            assert not data.get('config'), 'A diagnostic subset cannot certify the full corpus'
            assert data['verses'] == 25395 and data['renders'] == 101580
            assert len(data['documents']) == 114
            for doc in data['documents']:
                assert doc['checked'] == doc['expected'], doc
                assert set(doc['renders']) == {'hi', 'en', 'gu', 'kn'}, doc
                assert all(n == doc['expected'] for n in doc['renders'].values()), doc
            print('PASS. Evidence: ' + str(out / 'library-audit-final.json'), flush=True)
            sys.exit(0)
    if time.monotonic() - changed > 90:
        current = call('shell', 'cat', remote + 'library-audit-current.json', check=False)
        (out / 'library-audit-current.json').write_text(current.stdout)
        (out / 'audit-stall-logcat.log').write_text(call('logcat', '-d').stdout)
        raise SystemExit('FAIL: native audit stalled; inspect current verse and logcat')
    time.sleep(10)
raise SystemExit('FAIL: native audit exceeded three hours')
