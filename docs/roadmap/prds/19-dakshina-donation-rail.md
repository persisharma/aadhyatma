# PRD-19 — Dakshina / Donation Rail (Seva-Framed Monetization)

| | |
|---|---|
| **Status** | Proposed |
| **Target release** | v1.9.0 (paath-dedication donation) → v1.9.1 (temple direct donations) → v1.9.2 (subscription seva) |
| **Window** | Weeks 6–14 of Q4 2027 (legal / compliance from Q2) |
| **T-shirt size** | XL (~10 dev-weeks + parallel compliance / partnership) |
| **Owner** | TBA + finance / compliance lead |
| **Depends on** | PRD-11 (backend), PRD-13 (profile), PRD-18 (temple partnerships overlap) |

**Constraint break:** introduces payments. Uses Razorpay (India) + Apple/Google IAP (subscription) — both off-the-shelf. We don't build a payment processor; we integrate.

---

## 1. Problem

Vedansh has zero monetization surface today. Sri Mandir, Bhakti apps, and even YouTube monetize devotional content via:
1. **Donations to temples** (UPI / Razorpay rail; Sri Mandir reports significant volume).
2. **Online puja / sankalp dakshina** (paying for a priest to perform a puja on your behalf).
3. **Prasad delivery** (e-commerce).
4. **Subscription / "premium"** (gated content, no ads).

We deliberately rejected prasad delivery (out by strategy — logistics) and the cynical "freemium gated scripture" model (counter to our brand). But two healthy monetization angles **fit our product without compromising it**:

1. **Dakshina** — a frictionless way for a user, at the end of a paath / completion of a sankalp, to offer a small amount as gratitude. Goes to either:
   - Vedansh (supports the app + content creators).
   - A partner temple (the cross-link from PRD-18 makes this natural).
2. **Optional "Sadhak Seva" subscription** — ad-free forever (we have no ads anyway), priority Gurudev access (no rate limit), early-access to new sections, member crest on profile, support the project. ₹99/month or ₹999/year.

Both are **opt-in, post-value moments** — not paywalls.

## 2. Goal

Ship a calm, opt-in donation surface tied to spiritual completion moments. Measured by:

- ≥ 4% of MAU make at least one donation in their first 90 days.
- Average donation: ≥ ₹51 (the auspicious cultural anchor).
- ≥ 1.5% subscription conversion of MAU within 6 months.
- Net revenue ≥ ₹50 lakh / month by end of Q1 2028 (proxy: ~₹60 lakh MRR at 250k MAU × 1.5% × ₹99 × 1.6 paid annual).
- Zero compliance incidents (UPI / DPDP / Apple Store).
- ≥ 85% donor satisfaction (post-donation feedback).

## 3. Non-goals

- **Paywalled scripture content.** Hard line. Every verse / commentary stays free forever.
- **Aggressive upsell.** No "you're missing out on Gita Chapter 11 — subscribe!"
- **Donation amounts pre-suggested to be deceptively high.** Default suggestions are ₹11 / ₹21 / ₹51 / ₹108 — culturally anchored, modest.
- **Cryptocurrency / NFTs.**
- **Donor recognition / leaderboard.** Anti-spiritual.
- **Mandatory accounts to donate.** UPI as guest works.
- **In-app puja booking** (Pujapath-as-a-service). Out by strategy — operational complexity Sri Mandir already owns.

## 4. User stories

> As a user who just finished Sundarkand, I want a small unobtrusive option to offer ₹21 as dakshina — to support the app or the temple linked to this stotram.

> As a daily user who values the product, I want to subscribe to Sadhak Seva for ₹99/month, not because content is gated but because the project deserves support.

> As a donor to Mahakaleshwar via the app, I want a transparent receipt showing the trust the money went to, with a UPI reference.

> As a privacy-conscious donor, I want to donate anonymously without an account.

> As a power user of Gurudev, I want unlimited queries — without subscribing, but possibly by donating beyond a threshold ("Sadhak status earned").

## 5. Scope

### In scope — v1.9.0 (paath-dedication donation)

1. **Donation moment surfaces.**
   - **End-of-section completion:** after finishing a Sundarkand / chalisa / chapter, a calm screen: "Sankalp purna. Dakshina arpan karein? / Sankalp complete. Offer dakshina?" — with Skip and Offer options.
   - **End-of-sankalp celebration (PRD-13):** the completion modal has an "Offer dakshina" CTA.
   - **Profile page:** "Support Vedansh" tile.
   - **End-of-darshan (PRD-18):** "Donate to [Temple Name]" CTA after a stream session.

2. **Amount picker.**
   - Default chips: ₹11, ₹21, ₹51, ₹108, ₹501. Custom amount field. Default highlighted: ₹51.
   - Optional "Why am I donating?" tag (free text, ≤ 120 chars) — saved with receipt; never public.

3. **Recipient choice.**
   - "Vedansh seva" (supports the app + content / audio creators).
   - "Linked temple" — only if a temple is linked to the donation moment (PRD-18 partnership data).
   - Single radio toggle; Vedansh default.

4. **Payment rails.**
   - **UPI (Razorpay)** — primary for India. Razorpay Standard Checkout opens; user picks UPI app; confirms; we receive callback.
   - **Apple IAP / Google Play Billing** — for App Store policy compliance on subscriptions (v1.9.2). One-time donations *may* be exempt; check policy carefully. Likely path: subs via IAP, one-time donations via UPI (Apple permits external payment for "real-world goods/services" including charitable donations under certain conditions — verify with legal).

5. **Receipt.**
   - Email-receipt (if profile) + in-app receipt (always).
   - Shows: amount, recipient, UPI reference (for temple donations), Vedansh tax-ID (if Vedansh is the recipient + we're 80G-registered — long-running compliance workstream).

6. **Settings / history.**
   - Profile → "Mere yogdaan / My contributions" — list of receipts.
   - "Cancel subscription" available without contacting support.
   - Annual contribution summary (downloadable PDF) for tax filing.

### In scope — v1.9.1 (temple direct donations)

7. Expand temple direct donations from cross-link moments to a dedicated "Donate to a temple" surface in the Darshan tab. Each partner temple's UPI VPA / trust account is captured during PRD-18 partnership signup.

8. **Donation transparency.** A "Where did my donation go?" page shows the partner temple's name, trust registration number, last 12 donations from Vedansh in aggregate (anonymized).

### In scope — v1.9.2 (subscription)

9. **Sadhak Seva subscription.**
   - ₹99/month, ₹999/year (auto-renewing).
   - Benefits:
     - Unlimited Gurudev (PRD-11): removes the 20/day rate limit.
     - Early access to new sections (typically 4 weeks ahead of public).
     - "Sadhak" crest on profile (subtle visual).
     - Annual receipt for the full year.
     - That's it — no exclusive scripture, no exclusive audio.
   - Cancellation: one tap in profile; immediate (access continues till period end).
   - **Family share:** one subscription covers up to 5 family members (PRD-15 circles).

### Out of scope

- Online puja booking.
- Prasad delivery.
- E-commerce (idols, malas).
- Crypto / NFT.
- Paid Gurudev priority tiers beyond the single subscription.
- Donor-only content of any kind.

## 6. UX notes

- **Donation surface tone is reverent and skippable.** Never blocks navigation. Skip is equal-weight visually.
- **No "donate now or lose access" framing.** Ever.
- **Receipts are beautiful** — parchment-styled, deity art if temple recipient, downloadable.
- **Subscription pitch is calm.** A single Profile tile: "Sadhak Seva — support Vedansh." Tap → benefits page. No popups, no banners, no upsell midstream.
- **Default amount auspicious, not high.** ₹51 (5+1 = 6, *sad-akshara* etc.).
- **No optical illusions** ("only ₹3/day!" tricks). Honest amount.
- **Confirmation copy** before payment is unambiguous: "₹51 to Vedansh seva. Aap nishchit hain? / ₹51 to Vedansh. Are you sure?"

## 7. Technical sketch

- **Backend.**
  - New tables: `donations`, `subscriptions`, `donation_receipts`.
  - Razorpay webhook handler verifies signature; updates `donations.status`.
  - IAP receipts validated server-side against Apple / Google.
  - Endpoint: `POST /v1/donations/intent` returns Razorpay order ID; `POST /v1/donations/confirm` verifies + finalizes.
  - Endpoint: `GET /v1/subscriptions/status` returns current entitlement.
  - Subscription entitlements stored once; client refreshes on app open.

- **Mobile.**
  - New `mobile/src/features/donations/`:
    - `DonationSheet.tsx`, `DonationAmountPicker.tsx`, `DonationConfirmation.tsx`, `DonationReceipt.tsx`.
    - `useStartDonation.ts` (intent → Razorpay → confirm).
    - `useSubscription.ts` (IAP integration via `expo-in-app-purchases` or `react-native-iap`).
  - Receipts cached locally; signed (HMAC) for in-app display offline.

- **Razorpay integration.** Standard SDK; pre-built checkout UI.

- **Subscription compliance.**
  - iOS: must use IAP for the subscription. Razorpay path is for one-time donations only on iOS (subject to Apple's evolving policy).
  - Android: Google Play Billing for the subscription. One-time donations via Razorpay UPI permitted (Google's "charitable donations" carve-out, but verify per current policy).
  - Maintain two SKUs across platforms: monthly + yearly.

- **Entitlement service.** Subscription state in backend; mobile fetches on launch + on demand. Offline grace: 7 days from last successful verification.

- **Tests.**
  - `mobile/src/features/donations/__tests__/DonationSheet.test.tsx` — render, default amount, skip path equal weight.
  - `mobile/src/features/donations/__tests__/useStartDonation.test.ts` — intent → Razorpay → confirm → receipt; failure paths.
  - `mobile/src/features/donations/__tests__/useSubscription.test.ts` — entitlement refresh, expiry, restore-purchase.
  - Backend contract tests: Razorpay webhook idempotency, signature verification, IAP receipt validation.
  - Compliance pre-launch test: receipts contain required fields.

## 8. Compliance & legal (start Q2 2027)

- **UPI / payment compliance.** Razorpay handles PCI / RBI compliance; we ensure our entity is registered to receive donations.
- **80G tax registration.** Multi-month process via Income Tax Department; if achieved, donations to Vedansh are tax-deductible — significant credibility lift. Owner: founder + CA.
- **FCRA** (if accepting foreign contributions). Defer to v2; restrict foreign cards / foreign UPI initially.
- **DPDP Act** (India) — donor data handled per privacy policy; receipts retained 7 years per income-tax rules.
- **Apple App Store policy** — confirmed legal review on subscription IAP requirement vs. donation external-payment exception.
- **Google Play policy** — similar review; Play permits charitable donations via external rails more liberally.
- **Trust agreements with partner temples** — explicit donation flow, UPI VPA, monthly reconciliation, signed contract.
- **Receipts** comply with Section 80G if applicable; carry PAN of donor (optional but required for >₹2,000).

## 9. Cost & revenue model

- Razorpay fee: ~2% on Indian UPI (sometimes lower).
- Apple / Google IAP fee: 30% standard, 15% under small-business program (Vedansh likely qualifies).
- Estimated net at scale (250k MAU steady state):
  - One-time donations: 4% × 250k × ₹51 avg = ₹5.1 lakh / month gross; ~₹4.9L net.
  - Subscriptions: 1.5% × 250k × ₹99 = ₹3.7L / month gross; ~₹2.6L net after IAP take.
  - **Total ~₹7.5L / month net (~$9k/mo USD)** — covers AI Gurudev (PRD-11) compute + half the team. Healthy.

## 10. Success metrics & instrumentation

| Metric | Source | Target |
|---|---|---|
| Donation conversion / MAU (first 90 days) | Backend | ≥ 4% |
| Avg donation amount | Backend | ≥ ₹51 |
| Subscription conversion / MAU | Backend | ≥ 1.5% |
| Subscription churn (monthly) | Backend | ≤ 8% |
| Donation surface skip rate | Local | ≤ 70% (high skip is OK — we're not coercing) |
| Refund rate | Backend | ≤ 1.5% |
| Donor satisfaction post-action | Local prompt | ≥ 85% |
| Compliance incidents | Audit | 0 |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Apple rejects donation flow | Legal review upfront; structure as IAP for subscription, external UPI for one-time donations (Apple's charitable carve-out); fallback to IAP for everything if rejected. |
| Donations to temples not transparent → trust erosion | "Where did my donation go?" page; signed agreements with partner trusts; monthly reconciliation visible. |
| Free-tier users feel cheap after subscription introduced | Subscription benefits are real but small; scripture stays 100% free; messaging is "support," not "unlock." |
| Donor fatigue from too-frequent dakshina prompts | Throttle: max 1 donation prompt per user per day; user can disable in settings. |
| Razorpay outage breaks donations | Graceful degraded UX; "Try again later"; no half-charged states (Razorpay handles idempotency). |
| Subscription auto-renew complaints / chargebacks | Clear renewal copy at purchase; pre-renewal reminder email; one-tap cancellation. |
| Tax / 80G complications | CA + tax counsel from day one; clearly mark donations as "may be 80G eligible — confirm with your tax advisor" until certified. |
| Foreign donors (NRI) trigger FCRA | Geo-detect; surface "donations from outside India coming soon" politely; defer. |
| Sub feature scope creep (gated content pressure) | Brand-policy line documented in this PRD; product council sign-off required to change. |

## 12. Definition of done

- v1.9.0: paath-dedication donations live; Razorpay UPI flow verified; receipts emailed + in-app.
- v1.9.1: temple direct donations live for 5 partner temples; transparency page operational.
- v1.9.2: subscription live on iOS + Android; entitlement enforced for Gurudev rate-limit; cancellation one-tap.
- 80G application filed (target: certified within 12 months).
- Refund + cancellation paths tested end-to-end.
- Legal sign-off on each rail; visible policy / T&Cs.
- TestFlight 14-day soak with at least 100 real donations across rails; zero compliance issues.
- Donor satisfaction prompt active and ≥ 85% positive.

## 13. Open questions

1. Apple's evolving stance on external donations — defer subscription only or both? Need legal call.
2. Multi-currency for NRI users (USD on Stripe later)? Defer to v2 with FCRA clearance.
3. Should we surface "your donation funded X verses of Sundarkand audio commissioning"? Tempting — recommend yes in v1.9.1 as soft transparency; not in v1.9.0 (avoid donor-pressure framing).
4. Family share for subscription — 5 members across multiple devices, how enforced? Soft enforcement (device count limit); honor-system primary.
5. Subscription pricing — ₹99 vs ₹49? Recommend ₹99 — anchors as serious; lowering later is easy, raising harder. A/B in TestFlight beta.
6. Do we ever introduce ads as a free tier? **No** — explicit anti-strategy. Document in this PRD permanently.
