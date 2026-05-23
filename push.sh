#!/usr/bin/env bash
# Usage:
#   ./push.sh                                    silent OTA, message from last commit
#   ./push.sh "your message"                     silent OTA with explicit message
#   ./push.sh -n "your message"                  OTA + local "new content" notification (default copy)
#   ./push.sh -n -t "Title" -b "Body" "msg"      OTA + notification with custom copy
#   CHANNEL=preview ./push.sh "msg"              override channel
#
# Notification flow is zero-cost:
#   - The bundled descriptor `mobile/src/data/otaRelease.json` is rewritten
#     with notify=true and the title/body before `eas update` publishes.
#   - The app reads it on the next launch (after the OTA applies) and fires
#     a one-shot LOCAL notification via expo-notifications.
#   - The descriptor is reverted via `git checkout` after publish so the
#     committed default stays notify=false.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="${SCRIPT_DIR}/mobile"
RELEASE_JSON_REL="src/data/otaRelease.json"
RELEASE_JSON_ABS="${MOBILE_DIR}/${RELEASE_JSON_REL}"

if [[ ! -d "${MOBILE_DIR}" ]]; then
  echo "ERROR: mobile/ not found at ${MOBILE_DIR}" >&2
  exit 1
fi

CHANNEL="${CHANNEL:-production}"
NOTIFY=0
NOTIFY_TITLE=""
NOTIFY_BODY=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -n|--notify)
      NOTIFY=1
      shift
      ;;
    -t|--title)
      NOTIFY_TITLE="${2:-}"
      shift 2
      ;;
    -b|--body)
      NOTIFY_BODY="${2:-}"
      shift 2
      ;;
    -h|--help)
      sed -n '2,16p' "$0"
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      echo "ERROR: unknown flag: $1" >&2
      exit 1
      ;;
    *)
      break
      ;;
  esac
done

MESSAGE="${1:-}"

cd "${MOBILE_DIR}"

if [[ -z "${MESSAGE}" ]]; then
  MESSAGE="$(git log -1 --pretty=%s 2>/dev/null || echo "OTA update")"
fi

if [[ -n "$(git status --porcelain "${RELEASE_JSON_REL}" 2>/dev/null)" ]]; then
  echo "ERROR: ${RELEASE_JSON_REL} has uncommitted changes — commit or revert before publishing." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo "WARN: uncommitted changes; OTA bundle will be tagged dirty."
fi

echo "Channel: ${CHANNEL}"
echo "Message: ${MESSAGE}"

# Restore the release descriptor on any exit path so the committed default
# (notify=false) is preserved across interrupted runs.
restore_release_json() {
  if [[ "${NOTIFY}" -eq 1 ]]; then
    git checkout -- "${RELEASE_JSON_REL}" 2>/dev/null || true
  fi
}
trap restore_release_json EXIT

if [[ "${NOTIFY}" -eq 1 ]]; then
  # Default body to the OTA message when none was given; default title stays
  # blank so the in-app default kicks in.
  if [[ -z "${NOTIFY_BODY}" ]]; then
    NOTIFY_BODY="${MESSAGE}"
  fi

  echo "Notification: ON"
  echo "  title: ${NOTIFY_TITLE:-<default>}"
  echo "  body:  ${NOTIFY_BODY}"

  node -e '
    const fs = require("fs");
    const path = process.argv[1];
    const title = process.argv[2];
    const body = process.argv[3];
    const next = { version: 1, notify: true, title, body };
    fs.writeFileSync(path, JSON.stringify(next, null, 2) + "\n");
  ' "${RELEASE_JSON_ABS}" "${NOTIFY_TITLE}" "${NOTIFY_BODY}"
else
  echo "Notification: off"
fi

npx eas-cli update \
  --channel "${CHANNEL}" \
  --message "${MESSAGE}" \
  --non-interactive
