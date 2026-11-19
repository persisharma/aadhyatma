# Daan integration: PR #703 and merged #705

Live check: #705 merged at `13e51c100b2b463a13bb56cf8f64d7a54932e55e`; #703 open draft at `ac0aec45ec094a7510d7d08f1befc09af9b51c28`, based on main `341b25fa`. This follow-up is stacked on #703; it must not target main until its two shared utilities are present.

## Finding
No textual conflict or overwritten Daan fix. Comparing original audit `d7d31748` and current audit showed DaanEntryScreen and DaanLedgerContext never adopted KeyboardAwareScrollView or setItemWithRetry. #705's invalid-input guard is intact, but a valid save still navigated immediately and silently swallowed storage failure.

## Resolution
- Reuse #703's shared keyboard wrapper without changing amount parsing, draft fields, tithi/date or Gupt sanitization.
- Await durable add success before Back; retry once through the existing helper. On failure show a localized inline error, announce it, retain the draft and allow a deliberate retry.
- Prevent repeat submissions and editing during an in-flight save. Do not navigate from an unmounted/unfocused form after a late completion.
- Serialize mutations against the latest persisted state so retries cannot resurrect removals or discard another add. This necessarily makes removal durable too: a failed deletion stays visible and can be retried; confirmation identity/privacy behavior remains.

## Evidence
Focused integration: amount matrix and real-provider storage/CSV; iOS inset/Android height-avoidance props; invalid draft retention; two failed writes then manual recovery; transient retry; delayed storage and repeated taps; concurrent add/remove; failed deletion and retry. Native keyboard behavior is not proven by component props.

Full local gates, TypeScript, lint and browser rerender results are recorded in the PR as they finish. Native iOS/Android, VoiceOver/TalkBack, enlarged OS text, Maestro and device performance remain PENDING. No native build, merge, OTA or release performed. The amount parser and historical storage schema are unchanged. Applicable U1–U12, C4/C7/C9; scripture/artwork/audio/calendar/releases N/A. Preserve a draft PR and tested remote head.
