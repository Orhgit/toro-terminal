---
name: e2e-test-writer
description: "Write Playwright end-to-end browser tests grounded in real source code. Use whenever the user asks to add E2E tests, Playwright tests, browser tests, or a user-journey test for a feature."
---

# E2E Test Writer — Ringobook

Write Playwright E2E test specs grounded in real source code. The #1 rule: never guess selectors —
read the component source to find the actual DOM structure, then write tests against it.

This skill exists because hallucinated E2E tests are worse than no tests — they pass trivially
and give false confidence. Every selector, every interaction, and every assertion must be traceable
to real source code.

## Step -1 — Constitutional Pre-flight (R166–R169)

**Source-first (anti-hallucination, R166):** Read the actual component/route source before writing any test. Never fabricate selectors, routes, or behavior from memory.

**File gate (R168):** Only create or modify test files (`*.spec.ts`, `*.test.ts`, `*.e2e.ts`). Before starting, run:
```bash
git diff --name-only HEAD | grep -vE "\.(spec|test|e2e)\.(ts|tsx)$" | grep -v "^$"
```
Any non-test file in that output = scope violation.

**Session cap (R169):** If writing tests for more than 3 flows in one session, stop and confirm with the user before continuing — long E2E sessions drift from the original spec.

## Process

### Step 0: Consultation Receipt (R75)

First line of output:

`Consulted: RULEBOOK R72–R76, R43, R68, R132. Binding rules: R43 (integration tests hit real DB).`

### Step 1: Understand What to Test

Determine the test scope from user input:
- Feature name or Linear ticket → read the acceptance criteria for testable scenarios
- Specific component → read the component source
- Bug fix → read the bug description, write a regression test

**Test data & navigation:** the Ringobook E2E suite seeds a real MySQL test DB (R43) and ships a deterministic tenant. Read `e2e/fixtures/` and `e2e/helpers.ts` for the seeded users, listings, and tenants before hardcoding anything.

### Step 2: Read the Source Code (Mandatory)

Before writing any test, read the actual source components to understand:

1. **DOM structure** — what elements render, what attributes they have
2. **data-testid attributes** — what's already available for testing
3. **ARIA roles** — `role="listitem"`, `aria-selected`, `aria-expanded`
4. **RTL direction** — components use logical properties; selectors should not assume physical left/right
5. **State management** — what triggers loading, error, empty states
6. **User interactions** — click, double-click, right-click, keyboard, form submit

Use the `codebase-explorer` agent or read files directly. Key source locations:

| Feature Area | Where to Read |
|-------------|---------------|
| Shared UI primitives | `packages/ui/src/components/` |
| Design-system tokens & stories | `packages/design-system/` (Storybook) |
| Listings, matches, contracts | `apps/web/src/modules/<feature>/` |
| tRPC routers | `server/routers/` |
| State / hooks | `apps/web/src/hooks/` |
| Mobile shell | `apps/mobile/src/`, `capacitor.config.ts` |

### Step 3: Check Existing Infrastructure

Read these files before writing tests:

- **`e2e/helpers.ts`** — shared selectors, navigation helpers, form helpers, login helpers
- **`e2e/fixtures/`** — test users, seeded listings, tenants
- **`e2e/auth.setup.ts`** — authenticated browser state setup
- **`playwright.config.ts`** — projects, base URL, auth setup

Reuse existing helpers. Don't rewrite what's already there.

### Step 4: Explore the Live DOM (Critical)

Source code tells you what *should* render. The live DOM tells you what *actually* renders.
These often differ — a list may use `role="grid"` vs `role="list"`, a dialog's submit may be a
button or an Enter key.

**Before writing any assertion, create an exploration file:**

```bash
# Auto-ignored by git — safe to experiment
e2e/listing-create.__explore.spec.ts
```

In the explore file:
1. Navigate to the target state
2. Take a snapshot to see the real DOM structure
3. Try the interaction
4. Take another snapshot to see the result

```typescript
test('explore create-listing dialog DOM', async ({ page }) => {
  await goToListingsPage(page);

  const snapshot = await page.accessibility.snapshot();
  console.log(JSON.stringify(snapshot, null, 2));

  await page.getByRole('button', { name: /new listing|מודעה חדשה/i }).click();

  await page.screenshot({ path: 'e2e-report/explore-create-listing.png' });
});
```

**Rule: move code to the real spec only after it works in the exploration file.**

### Step 5: Write the Test

#### File structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAs, seededTenant, TEST_USER } from './helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER);
    await page.goto('/listings');
  });

  test('should do something specific', async ({ page }) => {
    await page.getByRole('button', { name: /new listing|מודעה חדשה/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel(/address|כתובת/i)).toBeVisible();
  });
});
```

#### Selector priority
1. `data-testid` / `data-action` attributes (most stable)
2. ARIA roles with accessible name — tolerant to Hebrew/English both: `getByRole('button', { name: /save|שמור/i })`
3. Text content via regex covering both Hebrew and English (last resort, localization-fragile)

#### RTL & Hebrew specifics
- Never assume `left` or `right` visually — use semantic queries
- Use `/english|hebrew/i` regex in accessible-name matchers so tests don't break when a string flips language
- For form fields, always prefer `getByLabel` over positional selectors

#### Waits
Use condition-based waits, never fixed timeouts:
```typescript
await expect(dialog).toBeVisible();
await page.waitForSelector('[data-testid="listings-list"]', { state: 'visible' });
```

```typescript
// Bad: arbitrary delay
await page.waitForTimeout(2000);
```

#### Assertions
Every test must have `expect()` assertions. A test without assertions always passes
and provides zero value:

```typescript
// Good
await expect(page.getByRole('listitem')).toHaveCount(5);

// Bad: screenshot-only, no verification
await page.screenshot({ path: 'out.png' });
```

#### Integration test DB (R43)
E2E tests run against a real MySQL test DB with seeded data. Never mock DB calls — if a test needs a specific state, seed it through the same tRPC procedures or SQL fixture the rest of the suite uses.

### Step 5b: Add data-testid if Needed

If the source component lacks a stable selector, add a `data-testid` to the source component (and, per R68, update or add the Storybook story):

```tsx
<Button data-testid="listing-submit">{t('submit')}</Button>
<DropZone data-testid="photo-drop-zone" data-droppable={isDroppable} />
```

### Step 6: Verify the Test Runs

```bash
pnpm --filter @ringo/web e2e -- e2e/listing-create.spec.ts --headed
pnpm --filter @ringo/web e2e -- e2e/listing-create.spec.ts --debug
pnpm --filter @ringo/web e2e -- e2e/listing-create.spec.ts --reporter=html
```

## Example

### Example 1: Writing a create-listing flow test

**User says:** "Write an E2E test for creating a listing."

**Process:**
1. Read `apps/web/src/modules/listings/CreateListingDialog.tsx` — find the form structure
2. Check `packages/ui/src/components/Button` — confirm existing `data-testid` attributes
3. Check Storybook for the same dialog — mirror tokens and states
4. Write the test

```typescript
test('creates a listing from the listings page', async ({ page }) => {
  await page.goto('/listings');
  await page.getByRole('button', { name: /new listing|מודעה חדשה/i }).click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await dialog.getByLabel(/address|כתובת/i).fill('דיזנגוף 100, תל אביב');
  await dialog.getByLabel(/price|מחיר/i).fill('4500000');

  await dialog.getByRole('button', { name: /save|שמור/i }).click();

  await expect(page.getByRole('listitem').filter({ hasText: /דיזנגוף 100/ })).toBeVisible();
});
```

### Example 2: Exploration test (debugging selectors)

When unsure about DOM structure, create an exploration file first:

```bash
# Name with .__explore.spec.ts — auto-ignored by git
e2e/listing-create.__explore.spec.ts
```

Use it to inspect the DOM, take screenshots, and find the right selectors.
Once you have working selectors, move the logic into the real spec file.

## Checklist

Before submitting an E2E test:

- [ ] Consultation receipt printed (R75)
- [ ] Selectors verified in a `.__explore.spec.ts` against the live DOM
- [ ] Every selector was found by reading source code, not guessed
- [ ] All tests have `expect()` assertions (no screenshot-only tests)
- [ ] No `waitForTimeout` — use condition-based waits
- [ ] Test uses seeded data from `e2e/fixtures/`, not inline hardcoded values
- [ ] Helpers from `e2e/helpers.ts` reused where applicable
- [ ] New `data-testid` attributes added to source if needed, and Storybook updated (R68)
- [ ] File named `<feature>.spec.ts` (not `.__explore.spec.ts`)
- [ ] RTL & Hebrew-aware selectors (regex covering both languages where applicable)
- [ ] Database side effects clean up after the test (R43 — real DB)

## What NOT to Do

- **Don't guess selectors** — classes like `[class*="dropZone"]` or `button[aria-label*="upload"]` are hallucinated. Read the source first. If you can't find the selector, add a `data-testid`.
- **Don't write assertion-free tests** — `console.log()` + `screenshot()` without `expect()` is not a test.
- **Don't silently skip** — wrapping everything in `if (await el.isVisible().catch(() => false))` masks broken selectors.
- **Don't mock the database** — R43 requires integration tests against a real MySQL instance. Use seeded fixtures.
- **Don't assume DOM structure from source code alone** — source tells you what *should* render; the live DOM tells you what *actually* renders. Always verify with an exploration file first.
- **Don't hardcode physical `left`/`right` selectors** — RTL flips them. Use role + name.
- **Don't skip cleanup** — if a test creates DB rows (listings, contracts, users), it must clean up, otherwise later tests become flaky.

## Related

- `docs/books/RULEBOOK.md` — especially R43, R68, R132
- Agents to loop in: `qa-engineer`, `forms-specialist`, `i18n-specialist`
