#!/usr/bin/env bash
# Usage:
#   ./push.sh                                    silent OTA, message from last commit
#   ./push.sh "your message"                     silent OTA with explicit message
#   ./push.sh -n "your message"                  OTA + push notification (default copy)
#   ./push.sh -n -t "Title" -b "Body" "msg"      OTA + push notification (custom copy)
#   CHANNEL=preview ./push.sh "msg"              override channel
#
# -n triggers two notification paths (cheap belt-and-braces):
#   1) REMOTE PUSH via Expo Push API to every device registered in Supabase
#      (`scripts/send-push.mjs`). Reaches users even with the app closed.
#      Requires .env with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
#   2) LOCAL FALLBACK fired by the app on its next cold start, in case the
#      remote push didn't land (offline, token expired, etc.). Driven by
#      `mobile/src/data/otaRelease.json` — rewritten before publish, reverted
#      after, so the committed default stays notify=false.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="${SCRIPT_DIR}/mobile"
RELEASE_JSON_REL="src/data/otaRelease.json"
RELEASE_JSON_ABS="${MOBILE_DIR}/${RELEASE_JSON_REL}"
SEND_PUSH_SCRIPT="${SCRIPT_DIR}/scripts/send-push.mjs"

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

# Capture eas-cli JSON output so we can pull the new update IDs for the push
# payload. We still want the user-facing progress to stream, so tee to stderr.
EAS_OUTPUT="$(npx eas-cli update \
  --channel "${CHANNEL}" \
  --message "${MESSAGE}" \
  --json \
  --non-interactive)"

# Echo the raw JSON to the terminal so the user sees what shipped.
echo "${EAS_OUTPUT}"

if [[ "${NOTIFY}" -eq 1 ]]; then
  # Send the remote push only AFTER the OTA bundle is live, so a tap-to-open
  # lands on the new content.
  if [[ ! -f "${SEND_PUSH_SCRIPT}" ]]; then
    echo "WARN: ${SEND_PUSH_SCRIPT} missing — skipping remote push." >&2
  elif [[ ! -f "${SCRIPT_DIR}/.env" ]] && [[ -z "${SUPABASE_URL:-}" ]]; then
    echo "WARN: no .env at repo root and SUPABASE_URL not exported — skipping remote push." >&2
    echo "      Copy .env.example to .env and fill in your Supabase keys to enable." >&2
  else
    # Extract one updateId (any platform — they share the same JS bundle).
    UPDATE_ID="$(node -e '
      try {
        const data = JSON.parse(process.argv[1]);
        const updates = Array.isArray(data) ? data : (data.updates ?? []);
        const first = updates.find((u) => u && u.id) ?? {};
        process.stdout.write(first.id ?? "");
      } catch { process.stdout.write(""); }
    ' "${EAS_OUTPUT}")"

    PUSH_TITLE_ARG="${NOTIFY_TITLE:-Vedansh}"
    echo "Sending remote push (title: ${PUSH_TITLE_ARG})..."
    node "${SEND_PUSH_SCRIPT}" \
      --title "${PUSH_TITLE_ARG}" \
      --body "${NOTIFY_BODY}" \
      ${UPDATE_ID:+--update-id "${UPDATE_ID}"} || \
      echo "WARN: remote push send failed; users will still see the local fallback on next open." >&2
  fi
fi
