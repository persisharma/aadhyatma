#!/usr/bin/env bash
set -Eeuo pipefail
PLATFORM=${1:?platform}; DEVICE=${2:?device}; PROFILE=${3:?profile}; VERSION=${4:?version}
OUTPUT="$GITHUB_WORKSPACE/native-update-output"
mkdir -p "$OUTPUT/$PLATFORM-$VERSION-$PROFILE" e2e-shots
run_flow() {
  local case_name=$1 flow=$2
  maestro --device "$DEVICE" test --config .maestro/config.yaml --format junit \
    --output "$OUTPUT/$PLATFORM-$VERSION-$PROFILE/$case_name.xml" -e "CAPTURE=update-$PLATFORM-$VERSION-$PROFILE-$case_name" \
    ".maestro/store-update-native-$flow.yaml" 2>&1 | tee "$OUTPUT/$PLATFORM-$VERSION-$PROFILE/$case_name.log"
}
seed() { python3 scripts/native-store-update-seed.py "$PLATFORM" "$DEVICE" seed "$@"; }
copy_screenshots() {
  python3 - "$PLATFORM" "$VERSION" "$PROFILE" "$OUTPUT" <<'PY'
import pathlib,shutil,sys
platform,version,profile,output=sys.argv[1:]
prefix=f'update-{platform}-{version}-{profile}-'
shots=list((pathlib.Path.home()/'.maestro/tests').rglob(prefix+'*.png'))
if not shots: raise SystemExit('No native screenshots captured for '+prefix)
dest=pathlib.Path(output)/f'{platform}-{version}-{profile}'
for shot in shots: shutil.copy2(shot,dest/shot.name)
PY
}
if [[ "$VERSION" == 1.5.4 ]]; then
  seed --state due
  run_flow native-cutoff hidden
  copy_screenshots
  exit 0
fi
# Prove persistence from a genuinely displayed sheet, without writing the stamp fixture.
seed --state due
run_flow first-display visible
python3 scripts/native-store-update-seed.py "$PLATFORM" "$DEVICE" read > "$OUTPUT/$PLATFORM-$VERSION-$PROFILE/persisted-shown.json"
run_flow later-cold-restart hidden
seed --state recent
run_flow cooldown-71-hours hidden
seed --state expired
run_flow cooldown-73-hours visible
seed --state used
run_flow shared-daily-slot hidden
seed --state due
run_flow background-resume-dismiss lifecycle
python3 scripts/native-store-update-seed.py "$PLATFORM" "$DEVICE" read > "$OUTPUT/$PLATFORM-$VERSION-$PROFILE/lifecycle-persisted-shown.json"
run_flow lifecycle-cold-restart hidden
SYSTEM_SIZES=(standard enlarged)
if [[ -n "${NATIVE_SYSTEM_SIZE:-}" ]]; then
  case "$NATIVE_SYSTEM_SIZE" in standard|enlarged) SYSTEM_SIZES=("$NATIVE_SYSTEM_SIZE");; *) exit 2;; esac
fi
for system_size in "${SYSTEM_SIZES[@]}"; do
  if [[ "$PLATFORM" == ios ]]; then
    if [[ "$system_size" == enlarged ]]; then xcrun simctl ui "$DEVICE" content_size accessibility-extra-large
    else xcrun simctl ui "$DEVICE" content_size large; fi
  else
    if [[ "$system_size" == enlarged ]]; then adb -s "$DEVICE" shell settings put system font_scale 1.5
    else adb -s "$DEVICE" shell settings put system font_scale 1.0; fi
  fi
  for lang in hi en gu kn; do
    for size in M L; do
      seed --state due --lang "$lang" --size "$size"
      run_flow "$lang-$size-$system_size" visible
    done
  done
done
if [[ "$PLATFORM" == ios ]]; then xcrun simctl ui "$DEVICE" content_size large
else adb -s "$DEVICE" shell settings put system font_scale 1.0; fi
seed --state due
run_flow store-handoff handoff
if [[ "$PLATFORM" == android ]]; then
  adb -s "$DEVICE" shell dumpsys activity activities > "$OUTPUT/$PLATFORM-$VERSION-$PROFILE/handoff-activity.txt"
  grep -F 'play.google.com' "$OUTPUT/$PLATFORM-$VERSION-$PROFILE/handoff-activity.txt"
else
  maestro --device "$DEVICE" hierarchy > "$OUTPUT/$PLATFORM-$VERSION-$PROFILE/handoff-hierarchy.txt"
  grep -Ei 'apps.apple.com|App Store' "$OUTPUT/$PLATFORM-$VERSION-$PROFILE/handoff-hierarchy.txt"
fi
run_flow store-return return
copy_screenshots
