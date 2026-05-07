# Deity Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Deity list initials with original-A symbolic deity icons and a Krishna bansuri plus peacock-feather plume.

**Architecture:** Add an icon key to each deity metadata entry, render the icon inside the existing `DeityCard` avatar, and keep all card layout and navigation behavior unchanged. Use a small component for deterministic custom symbols where platform emoji is not enough.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript strict, existing `useTheme()` colors and `expo-linear-gradient`.

---

### Task 1: Deity Icon Contract

**Files:**
- Create: `mobile/src/data/deities.icon-contract.ts`
- Modify: `mobile/src/data/deities.ts`

- [ ] **Step 1: Write the failing type contract**

Create `mobile/src/data/deities.icon-contract.ts`:

```ts
import { deities, type DeityIconKey } from './deities';
import type { Deity } from './texts';

const expectedIcons: Record<Deity, DeityIconKey> = {
  rama: 'bowArrow',
  krishna: 'bansuriPeacockFeather',
  shiva: 'trishul',
  hanuman: 'gada',
  durga: 'lotus',
  ganesha: 'modak',
};

for (const deity of deities) {
  const iconKey: DeityIconKey = deity.iconKey;
  if (iconKey !== expectedIcons[deity.id]) {
    throw new Error(`Unexpected icon for ${deity.id}: ${iconKey}`);
  }
}
```

- [ ] **Step 2: Run typecheck to verify it fails**

Run: `cd mobile && npm run typecheck`

Expected: FAIL because `DeityIconKey` and `iconKey` do not exist yet.

- [ ] **Step 3: Add icon metadata**

Update `mobile/src/data/deities.ts` so `DeityMeta` includes `iconKey: DeityIconKey`, export the `DeityIconKey` union, and assign all six icons.

- [ ] **Step 4: Run typecheck to verify metadata passes**

Run: `cd mobile && npm run typecheck`

Expected: PASS unless UI code still needs prop updates.

### Task 2: Icon Rendering

**Files:**
- Create: `mobile/src/components/DeityIcon.tsx`
- Modify: `mobile/src/components/DeityCard.tsx`
- Modify: `mobile/src/screens/DeityIndexScreen.tsx`

- [ ] **Step 1: Create icon renderer**

Create `DeityIcon` with these render paths:

- `bowArrow`: centered `🏹`
- `trishul`: centered `🔱`
- `lotus`: centered `🪷`
- `bansuriPeacockFeather`: bansuri/flute plus a single diagonal peacock-feather plume with green/teal strands and yellow-green eye detail
- `gada`: compact filled gada made from React Native views
- `modak`: compact filled modak made from React Native views

- [ ] **Step 2: Wire card props**

Add `iconKey?: DeityIconKey` to `DeityCard` props and render `<DeityIcon iconKey={iconKey} fallbackText={nameHi.slice(0, 2)} />` inside the existing `LinearGradient`.

- [ ] **Step 3: Pass icon keys from the screen**

Pass `iconKey={deity.iconKey}` from `DeityIndexScreen` to `DeityCard`.

- [ ] **Step 4: Verify**

Run:

```bash
cd mobile
npm run typecheck
npm run lint
```

Expected: both commands pass.
