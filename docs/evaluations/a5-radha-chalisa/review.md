# A5 — Radha Chalisa

## Scope and branch dependency

A5 only, `radha-chalisa`, deity `radha`, category `chalisa`, addedInVersion 1.5.7. Rebased without conflicts onto main `d1efd28bb5ba76025b9a45b4aa1a74351f9d6420` after A4 #698 merged. The implementation tree is unchanged by this rebase; A4 content and responsive header changes are preserved. A5 PR targets main. No merge, release, native build or version bump authorized here.

Read AGENTS, shared build checklist, current RULEBOOK/design, instruction rules, wiki reader/language pages and Library execution plan. The historical checklist is missing; current policy and the established A1–A4 integration pattern replace it under the owner's existing instruction. No duplicate of this opening found in current content.

## Source decision and collation

Complete prayers read on 2026-11-16:
- Drik Panchang: https://www.drikpanchang.com/lyrics/chalisa/shri-radha/shri-radha-chalisa.html?lang=hi — chosen complete base.
- HinduNidhi: https://hindunidhi.com/shri-radha-chalisa-hindi/ — complete corroborating composition and sequence, numerous transcription variants.
- JaapDaily: https://jaapdaily.com/learn/chalisa/radha-chalisa/ — complete 43-unit text, closely agrees with Drik.

Web retrieval supplied the entire prayers; a successful origin HTTP status is not inferred from cached access. Pavitra Granth returned 403 and is excluded from verified references. These are distinct publications, not proof of independent manuscript lineages. JaapDaily describes its own collation; that claim is not independently verified. No VedPath fallback needed.

Opening: श्री राधे वृषभानुजा, भक्तनि प्राणाधार. Two opening dohas, forty body couplets and one closing doha = 43 pages. Full-text SHA-256 (lines joined by spaces, units by newline): `52fefe451670192d7aa7ae27dd4a480c29bdc2afed75bffde5e8c9e68daf5690`.

The owner authorizes evidence-based edition choices. Retain one complete Drik edition; do not claim universal consensus or blend the witnesses. JaapDaily corroborates the full sequence, with nasal spelling/spacing differences in body 1,18,21,34 and the closing doha. HinduNidhi has extensive transcription differences; material examples are opening वुषभानुजा, body 2 अमित बोध instead of अमित मोद, body 30 तुवा instead of तब, body 38 यदुपति instead of यशुमति, and closing धनश्याम instead of घनश्याम. Drik and JaapDaily agree on the retained forms. Keep Drik's unusual लीला वपु तब unchanged; the gloss conveys the stanza's general meaning without silently emending it.

Aastha's full page was also inspected (https://aastha.app/chalisa/radha-chalisa/), but is not a base source: it compresses body 8/9 into one, publishes 39 body units and changes राधा नाम to राम नाम. The 43-unit count, sequence digest and independent body-9 assertion prevent that omission. Traditional text only; no modern publisher translations or introductions copied. Hindi and English meanings are original editorial prose, checked against each corresponding verse. Benefits/theology are framed as the hymn's devotional outlook. No invented author attribution or weekday prescription.

## Integration and acceptance

Reuse production ChalisaReaderScreen and existing Radha–Krishna background/banner; no new artwork/CDN upload or recording. Append catalog, registry, search, discovery and flat-reader routing, regenerate counts, preserve all existing IDs. Gujarati/Kannada are Hindi rendered in those scripts under current localize.ts, not verified native prose translations. Research references stay internal and never appear in the reader or share content.

- U1/U2: PASS scope, policy, dependency and acceptance established.
- U3/U4: PENDING native; actual-component web preview is separate evidence.
- U5/U6/C7: listing, search, resume/bookmark and reader Back covered by automated tests; fresh/saved cold restart, offline/lifecycle and native journeys PENDING.
- U7/C1/C3: complete sourced payload and existing deity artwork mapped; actual native delivery PENDING.
- U8: PASS sibling A1–A4 patterns checked; no unrelated reader behavior changed.
- U9: executed test results recorded below; native Maestro PENDING.
- U10/U10.1: bounded 43-unit payload; generated counts keep corpus off startup graph. Native lower-end Android responsiveness and ANR/telemetry evidence PENDING; no ANR-free claim.
- U11: PASS rebased onto merged A4 on main without conflicts or implementation-tree changes.
- U12: remote preservation recorded after publication. No cleanup of task work.
- C4/C8/C9: existing sharing, assistive speech, autoslide and accessibility retained; native handoff/playback/layout PENDING.
- C2/C5/C6/C10: N/A (no stories, calendar, reminders or release).

Native matrix: hi/en/gu/kn × Standard/Large × iOS/Android, compact and enlarged OS text all PENDING. Keep draft.

## Validation

PASS initial typecheck, focused data/search/count/route gates (8 node test groups), reader suite (77/77), instruction verifier and whitespace. Full widgets, engine, data, Ask, reader shards 2/3 and lint PASS. Reader shard 1 has 1500 passing tests and the same six pre-existing YouTubeReadyPlayback failures recorded on A4; GitHub CI reruns in its Node 20 environment. Local Chromium capture is blocked by host socket restrictions; the committed GitHub capture workflow supplies web evidence. Native verification remains pending. Actual-component harness imports production reader, data, fonts and artwork through explicit native-service web adapters. It is not a native app or proof of sharing/playback/persistence. Capture covers four scripts × two widths × Standard/Large × opening/middle/closing; meaningful content can extend below static captures.
