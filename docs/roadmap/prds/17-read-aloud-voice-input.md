# PRD-17 — Read-Aloud + Voice Input

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.7.0 (read-aloud meaning) → v1.7.1 (voice search + Gurudev input) |
| **Window** | Weeks 14–19 of Q2 2027 |
| **T-shirt size** | M (~4 dev-weeks) |
| **Owner** | TBA |
| **Depends on** | PRD-02 (audio infra), PRD-11 (Gurudev for voice input target) |

**Bundle-only constraint preserved.** Uses native OS TTS (Apple AVSpeechSynthesizer / Android TextToSpeech) and native speech recognition (`expo-speech-recognition`). No remote TTS / ASR.

---

## 1. Problem

Two large user segments are underserved by a read-only reader:

1. **Elderly / low-literacy users.** A 65-year-old Hanuman bhakt who can recite but can't easily read 12-point Devanagari, or can't read English meaning. Today the app forces *visual* literacy.
2. **Driving / commuting users.** Cannot read while driving but want their morning paath.

Plus voice **input** is the natural modality for AI Gurudev (PRD-11): "Hanuman ne Lanka kaise jalai?" spoken into a phone in a moving auto-rickshaw beats typing.

Both directions — TTS reading the *meaning* of a verse, and voice search / voice Gurudev queries — are pure plumbing on top of OS-native APIs. Low risk, high accessibility moat.

PRD-02 / PRD-10 already cover *audio recitation* (the verse Devanagari, performed by a human). This PRD covers reading the **meaning and commentary** via TTS, plus voice **input** for search and Gurudev.

## 2. Goal

Ship two surfaces:
1. **Read aloud:** A speaker icon on every verse page reads the meaning + commentary aloud in the user's chosen language.
2. **Voice input:** Mic icon on Search and Gurudev.

Measured by:

- ≥ 25% of users use read-aloud at least once within 4 weeks.
- ≥ 40% of TTS sessions complete the verse.
- ≥ 18% of Gurudev queries are voice-initiated.
- ≥ 15% of search queries are voice-initiated.
- Accessibility audit: WCAG 2.1 AA compliance on TTS surfaces.

## 3. Non-goals

- **TTS of the *verse* itself.** Devanagari verses are recited by humans (PRD-02 + PRD-10). OS TTS pronouncing Sanskrit/Awadhi sounds wrong; we don't ship that. TTS is for *meaning* prose.
- **Custom voice cloning.**
- **Multi-voice character TTS** ("hear Krishna speak the Gita").
- **Voice-only navigation** ("open Hanuman Chalisa").
- **Server-side ASR / TTS.** OS-native only.
- **Voice in any language beyond Hindi + English** in v1.

## 4. User stories

> As a 65-year-old user with reduced vision, I want to tap a speaker on each verse and have the Hindi meaning read aloud while I follow with my finger.

> As a parent on a morning school run, I want to play Hanuman Chalisa with its meaning explained aloud verse by verse — auto-advancing.

> As a busy professional driving to work, I want to ask Gurudev a question by speaking, and hear (or read) the answer when I park.

> As a Hindi speaker, I want voice search ("Sundarkand mein Hanuman ka Lanka mein pravesh") to land me on the right reader page.

> As a privacy-conscious user, I want voice input to never leave my device — handled by OS speech recognition.

## 5. Scope

### In scope — v1.7.0 (read-aloud)

1. **Speaker icon on verse page.**
   - Placed near the meaning tab toggle.
   - Tap: TTS reads the currently-visible meaning in the active language.
   - Long-press: opens a small panel — speed (0.75× / 1× / 1.25×), voice (best-available system voice for hi-IN / en-IN), auto-advance toggle.

2. **Reader-wide "Read aloud" mode.**
   - From the section's chapter page, "Read this chapter aloud" CTA.
   - Plays meaning of each verse in sequence, auto-advances reader, plays commentary if present and user opted in.
   - Pause / next / previous / stop controls in a bottom-sheet player.

3. **System TTS integration.**
   - iOS: `AVSpeechSynthesizer` via `expo-speech`.
   - Android: `TextToSpeech` via `expo-speech`.
   - Detect best-available voice for `hi-IN` and `en-IN`; fallback to default if unavailable.
   - First-use sheet: "iOS / Android may need to download Hindi voice in Settings → Accessibility → Spoken Content. We'll guide you." Single tap → opens device Settings.

4. **TTS + audio coexistence.**
   - If verse audio (PRD-02) is playing, TTS button is disabled with a tooltip "Pause audio to use read-aloud."
   - Audio session category prevents both from playing simultaneously.

5. **Karaoke-style highlight on meaning** (extends PRD-10's line-highlight pattern, but for prose).
   - TTS engine fires word-boundary events on iOS; Android emits utterance-progress events.
   - Highlight the current sentence (not word — too jittery for prose).

### In scope — v1.7.1 (voice input)

6. **Voice search.**
   - Mic button in SearchScreen.
   - On tap: `expo-speech-recognition` opens; user speaks; text appears in the search input; search auto-fires.
   - Language auto-detect (`hi-IN` / `en-IN`) with manual override.

7. **Voice Gurudev.**
   - Mic button in GurudevScreen input.
   - Same `expo-speech-recognition` flow; question is sent to backend on stop.
   - Hands-free continuation: once the answer arrives, optional read-aloud of the answer via TTS (extends item 1).

8. **Permissions UX.**
   - First voice tap shows a single sheet explaining the permission ask in plain language.
   - Permission denied → mic icon stays visible but inert; explanation modal explains how to enable.

### Out of scope

- TTS of Devanagari verse text itself.
- Voice-driven navigation.
- Multilingual auto-translation TTS.
- Always-on hot-word.

## 6. UX notes

- Speaker icon: subtle, ink color, never saffron (avoids confusion with the audio play button which IS saffron).
- TTS playback shows a small wave indicator under the verse — visually distinct from the human-audio waveform.
- Highlight on prose: pale saffron underline, not a background — prose blocks shouldn't get a karaoke-style fill.
- Auto-advance: 1.2-second pause between verses (gives the listener time to absorb).
- Voice input recording state: large mic with a pulsing ring; tap-to-stop. Always show a live transcription preview so the user knows what's being heard.
- Voice input never shows a "listening forever" state — auto-stops on 1.5s silence.
- Permission denial copy is helpful, not pushy.

## 7. Technical sketch

- **TTS.**
  - `expo-speech` for both platforms.
  - New `useReadAloud(text: string, lang: 'hi' | 'en')` hook.
  - Sentence-tokenize meaning + commentary client-side (simple regex on `।`, `.`, `?`, `!`).
  - Highlight context state lives in `ReadAloudContext`.

- **Reader integration.**
  - Each `<Pascal>VersePage.tsx` exposes a `meaningTextHi` / `meaningTextEn` prop derivable from data.
  - `ReadAloudContext` knows the current verse and meaning text; on play, walks sentences in order with `expo-speech` queue.

- **Voice input.**
  - `expo-speech-recognition` for both platforms.
  - New `useVoiceInput(onResult, { lang })` hook.
  - SearchScreen and GurudevScreen import the hook.

- **Audio session coordination.**
  - `expo-audio` and `expo-speech` share the iOS audio session category. We set `playback` for verse audio and `playback` mixable for TTS; on collision, prefer audio (TTS button greyed).

- **Tests.**
  - `mobile/src/contexts/__tests__/ReadAloudContext.test.tsx` — start, pause, next, sentence-walking.
  - `mobile/src/hooks/__tests__/useVoiceInput.test.ts` — mock recognition, partial results, final result, no-permission state.
  - `mobile/src/screens/__tests__/SearchScreen.voice.test.tsx` — mic flow inserts transcribed text + fires search.
  - `mobile/src/features/gurudev/__tests__/GurudevScreen.voice.test.tsx` — mic flow inserts question + sends.
  - Accessibility audit script: every interactive TTS / voice element has an `accessibilityLabel`.

## 8. Accessibility

- **Read-aloud is the primary a11y win.** Every verse page passes VoiceOver / TalkBack with meaningful labels.
- **Font-size respect.** Read-aloud highlight inherits user's font-scale setting.
- **Haptic feedback** on TTS start / stop (subtle).
- **Screen-reader interplay.** When VoiceOver is on, read-aloud is suppressed (VoiceOver reads the screen directly); show a notice on first conflict.

## 9. Privacy & data

- Voice recognition is *on-device* by default on modern iOS / Android. Document this in the privacy page.
- Older Android versions may use Google's cloud ASR; surface a one-time notice before first use.
- Transcribed text passed to Gurudev is treated identically to typed input (subject to PRD-11's consent toggles).
- TTS is fully on-device.

## 10. Bundle-size budget

| Asset | Size |
|---|---|
| TTS / ASR (OS-provided) | 0 |
| Code | < 50 KB |

Negligible.

## 11. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Read-aloud usage / WAU | Local | ≥ 25% |
| Read-aloud session completion | Local | ≥ 40% |
| Voice-search usage / search session | Local | ≥ 15% |
| Voice-Gurudev usage / Gurudev session | Local | ≥ 18% |
| TTS permission-failure rate | Local | ≤ 10% (signals the Hindi-voice-download UX is working) |
| Voice transcription accuracy (on a 50-prompt internal set) | Manual | ≥ 92% (English), ≥ 85% (Hindi) |

## 12. Risks

| Risk | Mitigation |
|---|---|
| Hindi TTS voice quality varies across devices | Best-available detection; iOS Siri voices are good; Android varies; surface a "Improve Hindi voice" CTA → Settings. |
| ASR confidence drops on Devanagari technical terms | Add a "did you mean?" suggestion using PRD-16 concept search on the transcribed text. |
| Battery drain from continuous TTS | OS-managed; document chapter-length warning ("≥ 30 min audio output"). |
| User confuses verse audio (PRD-02) with TTS read-aloud | Distinct iconography + tooltips; never play simultaneously. |
| iOS / Android API parity drift | Use `expo-speech` and `expo-speech-recognition` abstractions; QA on both platforms. |
| Privacy concern over voice data | Permission sheet explicit; on-device default; documented. |

## 13. Definition of done

- Read-aloud works on every verse page in both languages, with sentence highlight.
- Reader-wide auto-advance TTS works on all chalisas, aartis, Sundarkand chapters, Gita chapters.
- Voice search works in Hindi + English; transcription accuracy meets target on internal set.
- Voice Gurudev works; transcription flows into PRD-11 unchanged.
- Permission UX validated: granted, denied, denied-then-granted, OS-disabled-Hindi-voice all handled.
- Accessibility manual audit (VoiceOver + TalkBack) green.
- TestFlight 7-day soak: no crashes; user feedback channel positive.

## 14. Open questions

1. Should auto-advance respect verse audio's pause gap (PRD-02 inter-verse spacing) for consistency? Recommend yes.
2. Voice input language auto-detect vs. user-set language? Recommend auto-detect with user-set override (sticky preference).
3. Do we offer a "verse audio + TTS meaning interleaved" mode (recite verse → speak meaning → next verse)? Tempting — defer to v1.7.2 based on demand. Could be the hero UX for new sections.
4. Should we cache the most recent TTS-rendered audio for offline replay? OS doesn't expose this; defer.
5. Accessibility partner / consultant for the v1.7.0 review? Recommend yes — engage NIB India or similar.
