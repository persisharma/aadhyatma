#!/usr/bin/env bash
set -Eeuo pipefail

# Unsigned Release simulator only: no signing credentials or store submission.
BRAND_OUTPUT="${GITHUB_WORKSPACE:-$(pwd)/..}/native-brand-output"
BRAND_DERIVED="${RUNNER_TEMP:-/tmp}/vedansh-brand-derived"
mkdir -p "$BRAND_OUTPUT"
RECORD_PID=''
cleanup() {
  local result=$?
  trap - EXIT
  set +e
  if [[ -n "$RECORD_PID" ]]; then
    kill -INT "$RECORD_PID"
    wait "$RECORD_PID"
  fi
  if [[ $result -ne 0 && -n "${SIMULATOR_UDID:-}" ]]; then
    xcrun simctl io "$SIMULATOR_UDID" screenshot "$BRAND_OUTPUT/failure.png"
    xcrun simctl spawn "$SIMULATOR_UDID" log show --last 5m --style compact \
      --predicate 'process == "Vedansh" OR process == "SpringBoard"' > "$BRAND_OUTPUT/device-failure.log" 2>&1
  fi
  if [[ -d "$HOME/.maestro/tests" ]]; then cp -R "$HOME/.maestro/tests" "$BRAND_OUTPUT/maestro-debug"; fi
  exit "$result"
}
trap cleanup EXIT

git rev-parse HEAD > "$BRAND_OUTPUT/tested-head.txt"
xcodebuild -version > "$BRAND_OUTPUT/toolchain.txt"
maestro --version >> "$BRAND_OUTPUT/toolchain.txt"
xcrun simctl list devices available --json > "$BRAND_OUTPUT/simulators.json"
SIMULATOR_UDID=$(python3 - "$BRAND_OUTPUT/simulators.json" <<'PY'
import json,sys
phones=[d for runtime,devices in json.load(open(sys.argv[1]))['devices'].items()
        if '.iOS-' in runtime for d in devices
        if d.get('isAvailable') and d['name'].startswith('iPhone')]
if not phones: raise SystemExit('No available iPhone simulator')
priority=['iPhone SE (3rd generation)','iPhone 16e','iPhone 17e','iPhone 16','iPhone 17']
phones.sort(key=lambda d:priority.index(d['name']) if d['name'] in priority else len(priority))
print(phones[0]['udid'])
PY
)
export SIMULATOR_UDID
echo "SIMULATOR_UDID=$SIMULATOR_UDID" >> "$GITHUB_ENV"
SIMULATOR_STATE=$(python3 - "$BRAND_OUTPUT/simulators.json" "$SIMULATOR_UDID" <<'PY'
import json,sys
print(next(d['state'] for ds in json.load(open(sys.argv[1]))['devices'].values() for d in ds if d['udid']==sys.argv[2]))
PY
)
if [[ "$SIMULATOR_STATE" != 'Booted' ]]; then xcrun simctl boot "$SIMULATOR_UDID"; fi
xcrun simctl bootstatus "$SIMULATOR_UDID" -b
open -a Simulator --args -CurrentDeviceUDID "$SIMULATOR_UDID"
xcrun simctl ui "$SIMULATOR_UDID" appearance light
xcrun simctl status_bar "$SIMULATOR_UDID" override --time '09:41' --batteryState charged --batteryLevel 100
# Fail before an expensive app compile if XCTest cannot start on this runner.
mkdir -p e2e-shots
maestro --device "$SIMULATOR_UDID" test --config .maestro/config.yaml --format junit --output "$BRAND_OUTPUT/driver.xml" \
  .maestro/brand-driver-check.yaml 2>&1 | tee "$BRAND_OUTPUT/driver.log"
# Reuse only the preserved simulator binary for this exact production source/toolchain.
# Test-driver and Maestro-only changes do not require another native compilation.
BRAND_FINGERPRINT=$(python3 - <<'PYCODE'
import hashlib, subprocess
rows=subprocess.check_output(['git','ls-tree','-rz','HEAD','mobile'], cwd='..').split(b'\0')
keep=[r+b'\0' for r in rows if r and not r.split(b'\t',1)[1].startswith(b'mobile/.maestro/') and r.split(b'\t',1)[1]!=b'mobile/scripts/native-brand-ios.sh']
print(hashlib.sha256(b''.join(keep)).hexdigest())
PYCODE
)
printf '%s\n' "$BRAND_FINGERPRINT" > "$BRAND_OUTPUT/production-fingerprint.txt"
BRAND_APP=''
if [[ "$BRAND_FINGERPRINT" == 'd650ead88b7885fd86470e523f884fb8fdd3f8c450988f18dbc4d960014f3cd2' && "$(uname -m)" == arm64 && "$(xcodebuild -version)" == $'Xcode 16.4\nBuild version 16F6' && -n "${GH_TOKEN:-}" ]]; then
  BRAND_REUSE="${RUNNER_TEMP:-/tmp}/vedansh-brand-reuse"
  mkdir -p "$BRAND_REUSE"
  if gh api "repos/$GITHUB_REPOSITORY/actions/artifacts/13162410761/zip" > "$BRAND_REUSE/artifact.zip" &&
     unzip -jo "$BRAND_REUSE/artifact.zip" 'native-brand-output/Vedansh-simulator.zip' -d "$BRAND_REUSE" &&
     echo 'b24da182f5f12127d24e27c7fe13e39c0635d7a223c7c242a1eba523de2f6ff2  '"$BRAND_REUSE/Vedansh-simulator.zip" | shasum -a 256 -c - &&
     ditto -x -k "$BRAND_REUSE/Vedansh-simulator.zip" "$BRAND_REUSE/app"; then
    BRAND_APP="$BRAND_REUSE/app/Vedansh.app"
    test -d "$BRAND_APP"
    printf '%s\n' 'Reused immutable artifact 13162410761, source merge 988c8fd7394439baade2414f2fc7af2fe2f9cc9e; exact production fingerprint, archive SHA-256, architecture and Xcode match.' > "$BRAND_OUTPUT/binary-origin.txt"
  fi
fi
if [[ -z "$BRAND_APP" ]]; then
BRAND_WORKSPACE=$(python3 - <<'PY'
from pathlib import Path
print(next(Path('ios').glob('*.xcworkspace')))
PY
)
xcodebuild -workspace "$BRAND_WORKSPACE" -scheme Vedansh -configuration Release \
  -sdk iphonesimulator -destination "id=$SIMULATOR_UDID" \
  -derivedDataPath "$BRAND_DERIVED" ARCHS="$(uname -m)" ONLY_ACTIVE_ARCH=YES CODE_SIGNING_ALLOWED=NO build \
  2>&1 | tee "$BRAND_OUTPUT/native-build.log"
BRAND_APP=$(python3 - "$BRAND_DERIVED" <<'PY'
from pathlib import Path
import sys
apps=list((Path(sys.argv[1])/'Build/Products/Release-iphonesimulator').glob('*.app'))
if len(apps)!=1: raise SystemExit(f'Expected one host app, found {len(apps)}')
print(apps[0])
PY
)
printf '%s\n' 'Fresh Release compilation from tested-head.txt' > "$BRAND_OUTPUT/binary-origin.txt"
fi
xcrun simctl install "$SIMULATOR_UDID" "$BRAND_APP"
# Preserve a successful compile even when a later UI-driver/flow step fails.
ditto -c -k --sequesterRsrc --keepParent "$BRAND_APP" "$BRAND_OUTPUT/Vedansh-simulator.zip"
mkdir -p e2e-shots
# Complete consent/setup once, then record the actual cold/warm lifecycle flow.
maestro --device "$SIMULATOR_UDID" test --config .maestro/config.yaml --format junit --output "$BRAND_OUTPUT/setup.xml" \
  .maestro/_launch.yaml 2>&1 | tee "$BRAND_OUTPUT/setup.log"
xcrun simctl io "$SIMULATOR_UDID" recordVideo --codec=h264 "$BRAND_OUTPUT/lifecycle.mp4" \
  > "$BRAND_OUTPUT/recording.log" 2>&1 &
RECORD_PID=$!
sleep 1
maestro --device "$SIMULATOR_UDID" test --config .maestro/config.yaml --format junit --output "$BRAND_OUTPUT/lifecycle.xml" \
  .maestro/brand-lifecycle.yaml 2>&1 | tee "$BRAND_OUTPUT/lifecycle.log"
printf '%s\n' 'PASS: unsigned native Release build, install, cold reveal, three warm returns without reveal, and second killed-process reveal.' > "$BRAND_OUTPUT/result.txt"
printf '%s\n' 'PENDING: physical-device, Android, targeted notification/widget and four-language/size visual checks.' >> "$BRAND_OUTPUT/result.txt"
