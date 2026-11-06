#!/usr/bin/env bash
set -Eeuo pipefail
# Reuse the exact compiled SDK identified in the shared receipt. No release.
SANATAN_REUSE_OUTPUT="${NATIVE_SDK_OUTPUT:-$GITHUB_WORKSPACE/native-sanatan-output}"
SANATAN_APP_ARCHIVE="$GITHUB_WORKSPACE/native-reuse/$(node -p 'require("./scripts/sanatan-native-sdk.json").appArchivePath')"
mkdir -p "$SANATAN_REUSE_OUTPUT"
printf '%s  %s\n' "$(node -p 'require("./scripts/sanatan-native-sdk.json").appArchiveSha256')" "$SANATAN_APP_ARCHIVE" | shasum -a 256 -c -
ditto -x -k "$SANATAN_APP_ARCHIVE" "$RUNNER_TEMP/sanatan-app"
SANATAN_APP="$RUNNER_TEMP/sanatan-app/Vedansh.app"
test "$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$SANATAN_APP/Info.plist")" = 'com.prashantsharma.vedansh'
lipo "$SANATAN_APP/Vedansh" -verify_arch "$(uname -m)"
xcodebuild -version > "$SANATAN_REUSE_OUTPUT/toolchain.txt"
node - "$SANATAN_REUSE_OUTPUT/binary-origin.json" <<'JS'
require('node:fs').writeFileSync(process.argv[2], JSON.stringify(require('./scripts/sanatan-native-sdk.json'), null, 2) + '\n');
JS
if [[ "${SANATAN_REBUNDLE_JS:-0}" == 1 ]]; then
  node scripts/sanatan-native-sdk-compatible.cjs
  node scripts/rebundle-sanatan-simulator.cjs "$SANATAN_APP" "$SANATAN_REUSE_OUTPUT"
fi
xcrun simctl list devices available --json > "$SANATAN_REUSE_OUTPUT/simulators.json"
SIMULATOR_UDID=$(node scripts/select-native-ios-device.cjs "$SANATAN_REUSE_OUTPUT/simulators.json")
export SIMULATOR_UDID
echo "SIMULATOR_UDID=$SIMULATOR_UDID" >> "$GITHUB_ENV"
SIMULATOR_STATE=$(python3 - "$SANATAN_REUSE_OUTPUT/simulators.json" "$SIMULATOR_UDID" <<'PY'
import json,sys
print(next(d['state'] for ds in json.load(open(sys.argv[1]))['devices'].values() for d in ds if d['udid']==sys.argv[2]))
PY
)
if [[ "$SIMULATOR_STATE" != Booted ]]; then xcrun simctl boot "$SIMULATOR_UDID"; fi
xcrun simctl bootstatus "$SIMULATOR_UDID" -b
open -a Simulator --args -CurrentDeviceUDID "$SIMULATOR_UDID"
xcrun simctl status_bar "$SIMULATOR_UDID" override --time '09:41' --batteryState charged --batteryLevel 100
xcrun simctl ui "$SIMULATOR_UDID" appearance light
xcrun simctl install "$SIMULATOR_UDID" "$SANATAN_APP"
# Check XCTest first. The existing infrastructure flow opens only simulator Settings.
mkdir -p e2e-shots
maestro --device "$SIMULATOR_UDID" test --config .maestro/config.yaml --format junit --output "$SANATAN_REUSE_OUTPUT/driver.xml" .maestro/brand-driver-check.yaml 2>&1 | tee "$SANATAN_REUSE_OUTPUT/driver.log"
case "${NATIVE_ACCEPTANCE_SCOPE:-sanatan}" in
  sanatan) bash scripts/native-sanatan-matrix.sh ios "$SIMULATOR_UDID" ;;
  widgets)
    maestro --device "$SIMULATOR_UDID" test --config .maestro/config.yaml --format junit \
      --output "$SANATAN_REUSE_OUTPUT/widgets.xml" .maestro/home-widgets-smoke.yaml 2>&1 | tee "$SANATAN_REUSE_OUTPUT/widgets.log"
    printf '%s\n' 'PASS: verified compiled host/widget SDK with current JS; widget gallery and warm/cold deep-link destinations passed.' > "$SANATAN_REUSE_OUTPUT/result.log"
    ;;
  *) echo 'Unsupported native acceptance scope'; exit 2 ;;
esac
