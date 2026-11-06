#!/usr/bin/env bash
set -Eeuo pipefail
OUTPUT="$GITHUB_WORKSPACE/native-update-output"
DEVICE=emulator-5554
mkdir -p "$OUTPUT" e2e-shots
trap 'rc=$?; adb -s "$DEVICE" logcat -d > "$OUTPUT/android-device.log" 2>&1 || true; adb -s "$DEVICE" exec-out screencap -p > "$OUTPUT/android-final.png" || true; cp e2e-shots/update-*.png "$OUTPUT/" 2>/dev/null || true; exit "$rc"' EXIT
adb -s "$DEVICE" root
adb -s "$DEVICE" wait-for-device
adb -s "$DEVICE" shell setprop persist.sys.timezone Asia/Kolkata
git rev-parse HEAD > "$OUTPUT/tested-head.txt"
for VERSION in 1.5.3 1.5.4; do
  node scripts/native-store-update-config.cjs "$VERSION" | tee "$OUTPUT/android-$VERSION-config.json"
  npx expo prebuild --platform android --no-install
  (cd android; ./gradlew assembleRelease -PreactNativeArchitectures=x86_64 --no-daemon --max-workers=2 \
    '-Dorg.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g -XX:+ExitOnOutOfMemoryError' \
    -Pkotlin.compiler.execution.strategy=in-process --console=plain) 2>&1 | tee "$OUTPUT/android-$VERSION-build.log"
  APK=android/app/build/outputs/apk/release/app-release.apk
  cp "$APK" "$OUTPUT/Vedansh-update-fixture-$VERSION.apk"
  adb -s "$DEVICE" install -r "$APK"
  adb -s "$DEVICE" shell dumpsys package com.prashantsharma.vedansh > "$OUTPUT/android-$VERSION-package.txt"
  grep -F "versionName=$VERSION" "$OUTPUT/android-$VERSION-package.txt"
  adb -s "$DEVICE" shell pm grant com.prashantsharma.vedansh android.permission.POST_NOTIFICATIONS || true
  for PROFILE in compact wide; do
    if [[ "$PROFILE" == compact ]]; then adb -s "$DEVICE" shell wm size 960x2016
    else adb -s "$DEVICE" shell wm size 1320x2868; fi
    adb -s "$DEVICE" shell wm density 480
    adb -s "$DEVICE" shell wm size > "$OUTPUT/android-$PROFILE-size.txt"
    adb -s "$DEVICE" shell wm density >> "$OUTPUT/android-$PROFILE-size.txt"
    bash scripts/native-store-update-matrix.sh android "$DEVICE" "$PROFILE" "$VERSION"
  done
done
printf '%s\n' 'PASS: Android native runtime fixtures, persisted cooldown, daily slot, language/size matrix and browser/store handoff.' > "$OUTPUT/android-result.txt"
