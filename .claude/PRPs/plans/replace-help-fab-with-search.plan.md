# Plan: Replace Help FAB with Search FAB on Home Screen

## Summary
Remove the `?` (HelpFloatingButton) from HomeScreen and reposition the `⌕` (SearchFloatingButton) to bottom-right where `?` was. The disclaimer is already accessible from the More tab, making the Home `?` button redundant. This gives search a more thumb-reachable position.

## User Story
As an app user, I want the search button in a thumb-reachable position on the home screen, so that I can quickly search verses without stretching to the top-right.

## Problem → Solution
Home screen has two floating buttons (search top-right, help bottom-right) → Home screen has one floating button (search bottom-right). Disclaimer stays accessible via More tab.

## Metadata
- **Complexity**: Small
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 2 (modify) + 1 (delete)

---

## UX Design

### Before
```
┌─────────────────────────────┐
│  [ॐ crest]           [⌕]   │  ← search top-right
│       वेदांश                │
│  Sacred Texts · Daily...    │
│                             │
│  ┌────┐ ┌────┐             │
│  │ग्रन्थ│ │स्तोत्रम्│           │
│  └────┘ └────┘             │
│  ...categories...           │
│                             │
│                       [?]   │  ← help bottom-right
└─────────────────────────────┘
```

### After
```
┌─────────────────────────────┐
│  [ॐ crest]                  │
│       वेदांश                │
│  Sacred Texts · Daily...    │
│                             │
│  ┌────┐ ┌────┐             │
│  │ग्रन्थ│ │स्तोत्रम्│           │
│  └────┘ └────┘             │
│  ...categories...           │
│                             │
│                       [⌕]   │  ← search bottom-right
└─────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Bottom-right FAB | Opens disclaimer modal | Opens search screen | More thumb-reachable |
| Top-right FAB | Opens search screen | Removed | No longer needed |
| More tab disclaimer | Available | Available (unchanged) | Remains accessible |

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `mobile/src/screens/HomeScreen.tsx` | 1-450 | File being modified |
| P0 | `mobile/src/components/SearchFloatingButton.tsx` | 1-67 | Component being repositioned |
| P1 | `mobile/src/components/HelpFloatingButton.tsx` | 1-64 | Component being removed — positioning pattern |
| P2 | `mobile/src/screens/MoreScreen.tsx` | 27, 315-345 | Confirms disclaimer is already there |

---

## Patterns to Mirror

### FAB_POSITIONING (bottom-right)
// SOURCE: mobile/src/components/HelpFloatingButton.tsx:21-28
```tsx
style={({ pressed }) => [
  styles.button,
  {
    right: spacing.xl,
    bottom: spacing.xl + insets.bottom,
    backgroundColor: colors.parchmentSoft,
    borderColor: colors.divider,
  },
  pressed && { opacity: 0.6 },
]}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `mobile/src/screens/HomeScreen.tsx` | UPDATE | Remove HelpFloatingButton, help modal, all help-related state/imports |
| `mobile/src/components/SearchFloatingButton.tsx` | UPDATE | Change position from `top` to `bottom` |
| `mobile/src/components/HelpFloatingButton.tsx` | DELETE | No remaining consumers |

## NOT Building

- New help/disclaimer button on Home (it exists in More tab)
- Changes to MoreScreen disclaimer flow
- Changes to search functionality itself
- Changes to SearchScreen

---

## Step-by-Step Tasks

### Task 1: Reposition SearchFloatingButton to bottom-right
- **ACTION**: Change `top: spacing.xl + insets.top` to `bottom: spacing.xl + insets.bottom` in SearchFloatingButton.tsx
- **IMPLEMENT**: Replace `top` property with `bottom` in the style object
- **MIRROR**: HelpFloatingButton.tsx line 24 positioning pattern
- **IMPORTS**: No changes
- **GOTCHA**: Must use `insets.bottom` not `insets.top` for bottom positioning
- **VALIDATE**: tsc --noEmit passes

### Task 2: Remove HelpFloatingButton and help modal from HomeScreen
- **ACTION**: Remove all help-related code from HomeScreen.tsx
- **IMPLEMENT**: Remove imports (HelpFloatingButton, helpContent, buildDiscrepancyMailto), remove state (helpVisible), remove callbacks (openHelp, closeHelp, openMailto), remove `<HelpFloatingButton>` JSX, remove entire `<Modal>` block, remove unused imports (Alert, Linking, Modal, useState if no other state, useCallback if no other callbacks)
- **MIRROR**: N/A — pure removal
- **GOTCHA**: Check whether useState and useCallback are still needed after removal. HomeScreen has no other state or callbacks besides help-related ones → remove both from react import.
- **VALIDATE**: tsc --noEmit passes, no unused imports

### Task 3: Delete HelpFloatingButton component
- **ACTION**: Delete mobile/src/components/HelpFloatingButton.tsx
- **IMPLEMENT**: rm mobile/src/components/HelpFloatingButton.tsx
- **GOTCHA**: Verify no other file imports it (confirmed — only HomeScreen)
- **VALIDATE**: tsc --noEmit passes

### Task 4: Update SearchFloatingButton comment
- **ACTION**: Remove the JSDoc comment that says "Top-right circular pill"
- **IMPLEMENT**: Delete lines 10-13 of SearchFloatingButton.tsx
- **VALIDATE**: Visual inspection

---

## Validation Commands

### Static Analysis
```bash
node_modules/.bin/tsc --noEmit
```
EXPECT: Zero type errors

### Unit Tests
```bash
cd mobile && npx tsx --no-warnings src/data/__tests__/searchIndex.test.ts && npx tsx --no-warnings src/data/__tests__/searchNormalize.test.ts
```
EXPECT: All tests pass

---

## Acceptance Criteria
- [ ] Home screen has no `?` button
- [ ] Home screen shows `⌕` search button in bottom-right position
- [ ] Tapping `⌕` navigates to SearchScreen
- [ ] Disclaimer is still accessible from More tab
- [ ] No type errors
- [ ] No test regressions
- [ ] HelpFloatingButton.tsx file deleted

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| User expects ? on Home | Low | Low | Disclaimer is in More tab already |
