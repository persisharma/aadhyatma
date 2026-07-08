#!/usr/bin/env bash
# Production iOS release for Vedansh — build the store binary, submit it to App Store
# Connect, and (optionally) push the listing metadata. Companion to push.sh (which does OTA).
#
# Usage:
#   ./release.sh                     full run: preflight -> tests -> build -> submit  (asks to confirm)
#   ./release.sh --submit-only       submit an EXISTING build (no new build); EAS lists builds to pick from
#   ./release.sh --submit-only --latest   submit the latest build non-interactively
#   ./release.sh --metadata          also run `eas metadata:push`
#   ./release.sh --metadata-only     only push store.config.json listing text
#   ./release.sh --screenshots       upload screenshots via the App Store Connect API
#   ./release.sh --screenshots-only  only upload screenshots
#   ./release.sh --build-only        build the production binary, do not submit
#   ./release.sh --skip-tests        skip the `npm test` gate (not recommended)
#   ./release.sh --tag               after a successful step, git tag v<version> and push it
#   ./release.sh --dry-run           print every command instead of running it
#
# Flags combine, e.g.  ./release.sh --submit-only --metadata --screenshots
#
# Screenshot upload needs the ASC API key locally (never committed): place the .p8 at
# mobile/credentials/asc-api-key.p8 (gitignored) and export ASC_KEY_ID + ASC_ISSUER_ID,
# or set ASC_KEY / ASC_KEY_PATH. See docs/releases/RELEASE.md.
#
# One-time setup (see docs/releases/RELEASE.md):
#   • EXPO_TOKEN or `eas login` (an EAS account with access to the vedansh project).
#   • App Store Connect API key stored with EAS (first `eas submit` prompts for it and saves it;
#     reused non-interactively after). Same key powers `eas metadata:push`.
#   • A NEW marketing version = bump "version" in mobile/app.json first; the build number is
#     auto-incremented by the production profile (eas.json autoIncrement:true).

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="${SCRIPT_DIR}/mobile"
EAS="npx eas-cli"

DO_BUILD=1 DO_SUBMIT=1 DO_METADATA=0 DO_SHOTS=0 RUN_TESTS=1 DO_TAG=0 DRY=0 WANT_LATEST=0
for arg in "$@"; do
  case "$arg" in
    --metadata)        DO_METADATA=1 ;;
    --screenshots)     DO_SHOTS=1 ;;
    --build-only)      DO_SUBMIT=0 ;;
    --submit-only)     DO_BUILD=0 ;;
    --metadata-only)   DO_BUILD=0; DO_SUBMIT=0; DO_METADATA=1 ;;
    --screenshots-only) DO_BUILD=0; DO_SUBMIT=0; DO_SHOTS=1 ;;
    --latest)          WANT_LATEST=1 ;;
    --skip-tests)      RUN_TESTS=0 ;;
    --tag)             DO_TAG=1 ;;
    --dry-run)         DRY=1 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

run() { echo "  + $*"; [[ "$DRY" == 1 ]] || "$@"; }
die() { echo "ERROR: $*" >&2; exit 1; }
confirm() {
  [[ "$DRY" == 1 ]] && return 0
  read -r -p "$1 [y/N] " a; [[ "$a" == "y" || "$a" == "Y" ]] || die "aborted by user"
}

[[ -d "$MOBILE_DIR" ]] || die "mobile/ not found at $MOBILE_DIR"
cd "$MOBILE_DIR"

# ── Preflight ──
echo "=== preflight ==="
command -v node >/dev/null || die "node not on PATH"
WHOAMI="$($EAS whoami 2>/dev/null | grep -viE 'eas-cli@|upgrade|npm install|Proceeding' | grep -v '^$' | head -1)"
[[ -n "$WHOAMI" ]] || die "not logged in to EAS — set EXPO_TOKEN or run 'eas login'"
VERSION="$(node -p "require('./app.json').expo.version")"
BUILDNO="$(node -p "require('./app.json').expo.ios.buildNumber")"
BRANCH="$(git -C "$SCRIPT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
echo "  EAS user : $WHOAMI"
echo "  version  : $VERSION (ios buildNumber $BUILDNO — will auto-increment on build)"
echo "  git      : branch '$BRANCH'"
if [[ -n "$(git -C "$SCRIPT_DIR" status --porcelain 2>/dev/null)" ]]; then
  echo "  WARN: working tree has uncommitted changes."
fi

# ── Tests (gate the BUILD only; submitting an existing binary doesn't re-test) ──
if [[ "$RUN_TESTS" == 1 && "$DO_BUILD" == 1 ]]; then
  echo "=== test gate (npm test) ==="
  run npm test || die "tests failed — fix before releasing (or pass --skip-tests to override)"
fi

# ── Build ──
if [[ "$DO_BUILD" == 1 ]]; then
  echo "=== build (ios, production) ==="
  confirm "Build a NEW production iOS binary for v$VERSION?"
  run $EAS build --platform ios --profile production --non-interactive || die "build failed"
fi

# ── Submit (uses an EXISTING build; does NOT build a new one) ──
if [[ "$DO_SUBMIT" == 1 ]]; then
  echo "=== submit an existing build to App Store Connect ==="
  # First run may prompt for the ASC API key; EAS saves it for later runs.
  if [[ "$WANT_LATEST" == 1 ]]; then
    confirm "Submit the LATEST production build of v$VERSION?"
    run $EAS submit --platform ios --profile production --latest || die "submit failed"
  else
    echo "  interactive: EAS will list existing builds — pick the one to submit (no new build)."
    run $EAS submit --platform ios --profile production || die "submit failed"
  fi
fi

# ── Metadata ──
if [[ "$DO_METADATA" == 1 ]]; then
  echo "=== push listing metadata (store.config.json) ==="
  run $EAS metadata:lint || die "store.config.json invalid"
  confirm "Push App Store listing metadata from store.config.json?"
  run $EAS metadata:push || die "metadata push failed"
fi

# ── Screenshots (App Store Connect API; key from env/gitignored .p8, never committed) ──
if [[ "$DO_SHOTS" == 1 ]]; then
  echo "=== upload screenshots to the $VERSION App Store version ==="
  # ASC ids from a gitignored env file: prefer the per-worktree copy, else the shared home copy
  # (~/.appstoreconnect/vedansh-asc.env) so any worktree works without re-setup. Never in git.
  ENVF="${MOBILE_DIR}/credentials/asc.env"
  [[ -f "$ENVF" ]] || ENVF="$HOME/.appstoreconnect/vedansh-asc.env"
  [[ -f "$ENVF" ]] && { set -a; . "$ENVF"; set +a; echo "  loaded ASC ids from $ENVF"; }
  KIT="${SCRIPT_DIR}/.context/appstore-${VERSION}"
  [[ -d "$KIT/frames" ]] || die "no frames at $KIT/frames — generate them first (see $KIT/README.md)"
  confirm "Upload screenshots from $KIT/frames to the $VERSION version?"
  run node "${SCRIPT_DIR}/scripts/asc-upload-screenshots.mjs" --kit "$KIT" --version "$VERSION" || die "screenshot upload failed"
fi

# ── Tag ──
if [[ "$DO_TAG" == 1 ]]; then
  echo "=== git tag v$VERSION ==="
  run git -C "$SCRIPT_DIR" tag -a "v$VERSION" -m "Release v$VERSION (iOS build auto-incremented)"
  run git -C "$SCRIPT_DIR" push origin "v$VERSION"
fi

echo "=== done ==="
echo "Next in App Store Connect: attach screenshots + preview (.context/appstore-<ver>/frames + video),"
echo "confirm 'Data Not Collected', then submit for review (or it's queued if metadata automaticRelease)."
