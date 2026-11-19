# Home banner card parity — 6 November 2026

The supplied native Home screenshot shows Kids Stories and Sanatan Parichay
using different banner structures. This follow-up to merged PR #624 makes both
use `HomeBannerCard`, extending design.md §87's Home entry specification.

## Layout contract

- One shared active-card gradient, border, theme radius and elevation.
- A fixed 100×100 artwork slot on the left. The Kids cover remains 100×100;
  Sanatan keeps the entire approved landscape scene in `FramedPainting` at 3:2.
- The same script-aware bilingual title hierarchy and inline labelled action
  on the right. Text wraps; the 138pt minimum height can grow with system text.
- Home owns the 12pt gap and bottom spacing around the two cards. Suspense
  placeholders keep the same gap, avoiding a new spacing jump during lazy load.
- Preserve both Home test IDs and press/press-in/press-out callbacks. Keep the
  Kids cover manifest/cache/offline placeholder and lazy learning entry intact.
- Do not substitute a short Home action for lesson content: the complete
  Sanatan introductions and source credits are unchanged.

## Verification

The existing image-geometry, four-script Home-frame and Kids cache/placeholder
regressions pass, as does TypeScript. The browser harness renders the actual
two components together. Compact/regular widths, four scripts and M/L were
checked, including explicitly simulated 150% text sizing. Browser rendering
does not establish native iOS/Android appearance or system-text acceptance.
The browser uses the Kids cover placeholder: the CDN request was unavailable
in this environment. The native cover request and cache behavior are unchanged.

Visual inspection also exposed a Gujarati letter inside the existing Kannada
Kids title. Correct that character and retain a primary-script regression.

The broader suite has unrelated failures on unchanged main 354c87f:
`DeityIcon.test.tsx`, `dailyBhaktiShare.test.ts`, `RoutineTodayVisual.test.tsx`
and three assertions in `dohaScopes.test.ts`. Record these as failures, not
as a clean full-suite pass. The local tsx CLI also hits its IPC-socket denial;
Node suites use the package scripts' exact file lists with `node --import tsx`.

Native banner inspection and final CI remain required before acceptance. No
merge, OTA or store release is part of this follow-up.
