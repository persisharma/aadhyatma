# Year-round occasion share cards

Base: main `354c87f0f29f49369886e6bb6c7873fa988b4677` (published timing audit #629).
Branch: `codex/year-round-occasion-cards`.

## Scope and acceptance

Every one of the app catalog's 197 distinct observance IDs has an individual native share-card path, preserving IDs, date rules, regional lenses, calendar system, names and catalog guidance. This is catalog coverage, not a claim to cover every local Hindu tradition or to compute a special muhurat for every observance. The existing 53 timing profiles remain separately audited: 49 recipes produce clocks; four Ghatasthapana profiles provide tradition guidance. The remaining identities show their actual catalog description without inventing a clock. Holi and Holika Dahan, and Maha Navami and Ayudha Puja, retain separate ceremony/date identities.

Approved visual: Card 1, festive hero. A single title, large text-free painting, live timing plaque, floral corners, Vedansh wordmark, date/place and download footer. The hero artwork is never a baked screenshot or hardcoded clock. Longer notes and all five Maha Shivaratri windows increase export height; both next-day endpoint dates remain visible. Catalog-only entries do not print today's date as an occasion date.

Entry points: Panchang below the festival ribbon; Muhurat detail; Vrat/Parv detail. Each row shares only that named occasion through the existing share provider (four card languages, image/text and OS handoff). The compact full Panchang keeps its existing 16 Choghadiya starts, Kaal, Vaas and footer, with the small occasion strip. Unsupported special timing is not described as a local clock needing confirmation.

## Artwork and publication

Ten new text-free scenes are preserved in `mobile/assets/festival-hero/`, with full SHA-256/dimensions and prompts in `festival-hero/`. Govardhan's hill rests on the raised left little finger. Other catalog entries reuse complete existing deity/ritual paintings, not face-only thumbnails. Explicit known identities prevent unknown named deities from silently becoming an unrelated painting.

New heavy paintings use the `festival-hero` R2 prefix; they are not required into the native bundle. `festivalHeroManifest.json` remains `pending` until the publisher downloads every production CDN object and verifies its full source hash. The publication workflow emits a verified manifest and proof as artifacts; it cannot change the app manifest automatically. Never treat an upload dry-run as publication. Capture waits for actual image decode; errors cannot unlock a blank export.

## Evidence (in progress)

- PASS: TypeScript typecheck; existing 137 occasion timing assertions against 115 Drik fixtures; 19 focused component/closed-inventory assertions.
- PASS: all 197 catalog identities and known subject assignments; ten source WebP hashes; instruction routing; whitespace check.
- PENDING: final full mobile suites, full-year route/date coverage, published CDN objects, native matrix/visual comparison, physical devices and Android native export.
- The existing main baseline has unrelated reader/data expectation failures recorded in `festival-muhurat-audit.md`; do not weaken those tests to mark this feature green.
- Native verification is an unsigned simulator Release only; no EAS, OTA, TestFlight or store release. The previous Maestro Settings preflight failed before the app ran. This branch pins Xcode 16.4/iOS 18.5 and emphasizes focused hero exports; a new run must establish its result.

## Date distinctions checked

Drik's 2026 Hindu calendar lists Holika Dahan on 3 March and Holi on 4 March: https://www.drikpanchang.com/calendars/hindu/hinducalendar.html . Maha Navami is 19 October: https://www.drikpanchang.com/navratri/durga-puja/maha-navami-date-time.html . The source-backed clock/withholding ledger remains `festival-muhurat-audit.md`, with primary URL per fixture.

## Release gates

Keep the PR draft until mandatory native visual, CDN and final CI gates are satisfied. Source code and mock tests do not establish installed-app fidelity or a successful exported image.
