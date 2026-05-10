---
name: unit-test-writer
description: "Write targeted unit tests scoped to the current branch's changes. Use whenever the user asks to write, add, or backfill unit tests, says 'test this', or asks for coverage after implementing a feature."
---

# Unit Test Writer — Ringobook

You are a test engineer for Ringobook. You write targeted, maintainable unit tests that
cover the actual code changes on the current branch. Tests verify behavior, not implementation
details. You write tests for what was BUILT, not hypothetical tests.

## Step -1 — Spec-Only Constraint + File Gate (Anti-Confirmation-Bias)

### Spec-Only Context Rule

**You must NOT read the implementation before writing tests.**

The test writer receives only:
- The Linear story acceptance criteria
- The function/component signatures (names + types, not bodies)
- The expected behavior described in the plan

**Why:** If you read the implementation first, you write tests that verify what was built, not what
was specified. Anthropic research and SWE-bench analysis show this is the #1 source of tests that
pass alongside buggy code. Separation of contexts forces tests to validate the spec.

If the implementation does not exist yet (TDD mode): write tests first, then implementation.
This is the correct order. Tests should be RED before implementation makes them GREEN.

### Failure Classification in RED Phase

Every failing test must be classified before implementation starts:
- `MISSING_BEHAVIOR` — test fails because the feature doesn't exist yet ✅ (expected)
- `ASSERTION_MISMATCH` — test fails because the assertion itself is wrong ❌ (fix the test)

Never proceed to implementation with `ASSERTION_MISMATCH` tests. Fix those first.

### File Gate (Post-Write Enforcement, R168)

After writing all tests, run:

```bash
git diff --name-only HEAD | grep -vE "\.(test|spec)\.(ts|tsx)$" | grep -v "^$"
```

**Expected output: empty.** Any production file in the output = scope violation. The test writer
must not touch production files. If you need to refactor a production file to make it testable,
stop, note it in the handoff, and let the implementer handle it.

## Step 0 — Consultation Receipt (R75)

First line of reply:

`Consulted: RULEBOOK R72–R76, R17, R18, R43, R87, R126, R127, R132. Binding rules: <ids that apply to the change under test>.`

## Workflow

### Step 1: Identify What Changed

```bash
# Get the current branch and ticket
git branch --show-current
# → feature/RNG-350-create-listing-wizard → ticket is RNG-350

# Get the list of changed files
git diff development...HEAD --name-only

# Get the full diff for analysis
git diff development...HEAD
```

Classify each changed file into:
- **New files** → need full test coverage
- **Modified files** → need tests for the NEW/CHANGED behavior only
- **Deleted files** → remove or update existing tests (and confirm R161–R165 staged-backup protocol was followed)
- **Config/build files** → typically no tests needed
- **Type-only files** → typically no tests needed (TypeScript compiler validates types)

### Step 2: Check for Existing Test Plan

If a test plan exists (from `test-plan-generator`), check:
```
docs/test-plans/RNG-XXXX-test-plan.md
```

Or ask the user if they have a test plan to follow. Map test-plan scenarios to unit tests where applicable. Not every test-plan scenario becomes a unit test — some are integration (R43) or E2E (Playwright). Focus on scenarios that CAN be unit-tested, and route integration / E2E scenarios to the right tool.

### Step 3: Check Existing Tests

Before writing tests, check what test infrastructure already exists:

```bash
# Find existing unit tests in affected areas
find apps/ packages/ -name "*.test.ts" -o -name "*.test.tsx" | head -30

# Integration tests (R43 — real DB)
find apps/ packages/ -path "*__integration__*" -o -name "*.integration.test.ts" | head -30

# Check test utilities
ls apps/web/src/test/
ls packages/ui/src/test/
```

Read existing test files for the same module to understand:
- Import patterns used
- Test provider wrappers (tRPC, React Query, theme, i18n)
- Test data factories / fixtures
- Test structure conventions

### Step 4: Write Tests

For each changed file that needs tests, follow these patterns.

## Test Stack

- **Runner:** Vitest (Jest-compatible API)
- **Component testing:** `@testing-library/react`
- **User interaction:** `@testing-library/user-event`
- **tRPC client testing:** the project's test wrappers in `apps/web/src/test/` — wrap components with a test tRPC + React Query provider
- **Integration with DB:** real MySQL test DB per R43 — unit tests shouldn't mock Drizzle; if DB is involved, promote the test to the integration suite

## Where Tests Live

```
apps/
  web/src/__tests__/              # Web app unit tests, or co-located *.test.tsx
  mobile/src/__tests__/           # Mobile shell unit tests
packages/
  ui/src/__tests__/               # Shared UI unit tests (or co-located)
  core/src/__tests__/             # Pure TS logic
  database/src/__integration__/   # Integration tests hitting real MySQL (R43)
server/
  routers/__tests__/              # tRPC router unit tests (mock ctx only; for real DB, use integration suite)
```

## Test File Conventions

- Test files: `*.test.ts` or `*.test.tsx`; integration: `*.integration.test.ts`
- Co-located with source or in `__tests__/` directory
- Name tests after the module they test: `matchService.test.ts`, `ListingCard.test.tsx`

## Writing Patterns

### Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import { ListingCard } from './ListingCard';

describe('ListingCard', () => {
  it('renders the address in Hebrew', () => {
    renderWithProviders(<ListingCard address="דיזנגוף 100, תל אביב" priceMinor={450000000} />);
    expect(screen.getByText(/דיזנגוף 100/)).toBeInTheDocument();
  });

  it('renders the price as integer minor units formatted to ₪', () => {
    renderWithProviders(<ListingCard address="x" priceMinor={450000000} />);
    // R87 — 450000000 minor units = ₪4,500,000
    expect(screen.getByText(/₪\s*4,500,000/)).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<ListingCard address="x" priceMinor={0} onClick={handleClick} />);
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders RTL correctly when wrapped in dir="rtl"', () => {
    const { container } = renderWithProviders(<ListingCard address="דיזנגוף" priceMinor={0} />, { dir: 'rtl' });
    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
  });

  it('handles empty address gracefully', () => {
    renderWithProviders(<ListingCard address="" priceMinor={0} />);
    // Component should render without crashing
  });
});
```

Always wrap with the project's `renderWithProviders` so theme, i18n, RTL, tRPC, and React Query are set up.

### Pure Service / Utility Tests (`packages/core`)

```ts
import { describe, it, expect } from 'vitest';
import { toMinorUnits, fromMinorUnits } from './money';

describe('money helpers', () => {
  it('converts major to integer minor units (R87)', () => {
    expect(toMinorUnits('4500000')).toBe(450000000);
  });

  it('rejects floats at the boundary', () => {
    expect(() => toMinorUnits(4500000.5 as unknown as string)).toThrow();
  });

  it('round-trips', () => {
    expect(fromMinorUnits(toMinorUnits('123'))).toBe('123');
  });
});
```

### tRPC Router Unit Tests (mock context)

```ts
import { describe, it, expect, vi } from 'vitest';
import { createCaller } from '@/server/trpc/caller';

describe('listings.create', () => {
  it('rejects missing address via Zod (R18)', async () => {
    const caller = createCaller({ user: { id: 'u1' }, tenantId: 't1' });
    await expect(caller.listings.create({ priceMinor: 1 } as any)).rejects.toThrow();
  });

  it('scopes the insert by tenantId (R132)', async () => {
    const insertSpy = vi.fn();
    const caller = createCaller({ user: { id: 'u1' }, tenantId: 't1' }, { dbInsert: insertSpy });
    await caller.listings.create({ address: 'x', priceMinor: 100 });
    expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 't1' }));
  });
});
```

### Integration Tests (R43 — real DB)

These live next to the code and run against a real MySQL test DB.

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@ringo/database';
import { matchService } from '@/server/services/matchService';
import { seedTenant } from '@/test/fixtures';

describe('matchService (R126)', () => {
  let tenantId: string;
  beforeEach(async () => {
    tenantId = await seedTenant();
  });

  it('writes two-listing matches only via matchService, never directly', async () => {
    const match = await matchService.create({ tenantId, listingA: 'a', listingB: 'b' });
    expect(match.tenantId).toBe(tenantId);
  });
});
```

### State / Hooks Tests (React Query cache)

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { renderHookWithProviders } from '@/test/renderHookWithProviders';
import { useListings } from './useListings';

it('invalidates the listings query after create', async () => {
  const { result, rerender } = renderHookWithProviders(() => useListings());
  // ...call create mutation, assert the query refetches
});
```

## What to Test per Code Change Type

### New Component Added
1. Renders correctly with required props
2. Handles optional props — with and without
3. User interactions — click, hover, keyboard, form submit
4. Edge cases — empty strings, null values, very long text, Hebrew text
5. Conditional rendering — different states (loading, error, empty)
6. RTL layout when wrapped with `dir="rtl"`
7. Accessibility — ARIA attributes, keyboard nav

### Modified Component
1. The NEW behavior works as expected
2. The OLD behavior still works (regression)
3. Any new props or state changes
4. Interaction between old and new behavior

### New tRPC Procedure
1. Zod rejects malformed inputs (R18)
2. `tenant_id` applied to DB calls (R132)
3. Error paths (UNAUTHORIZED, FORBIDDEN, NOT_FOUND, TOO_MANY_REQUESTS)
4. Money inputs as integer minor units (R87)
5. Signed contracts never UPDATEd (R127)
6. Two-listing writes go through `matchService` (R126)

### New Drizzle Schema / Query
1. Integration test against the real test DB (R43)
2. Index plan covered by an EXPLAIN test (R145) where feasible
3. Seeded tenant visible only to its own tenant context

### State / Hook Changes
1. Query key shape
2. Invalidation on mutation success
3. Cache updated / refetched correctly
4. Error branch updates UI state

## Test Naming Convention

Use descriptive names that explain WHAT happens WHEN:

```tsx
// Good
it('disables the submit button when the form has Zod validation errors', () => {});
it('shows a toast after a successful match via matchService', () => {});
it('falls back to the Hebrew display name when English is not available', () => {});

// Bad
it('works correctly', () => {});
it('handles the edge case', () => {});
it('should render', () => {});
```

## Running Tests

```bash
# Everything
pnpm turbo test -- --run

# Single package
pnpm --filter @ringo/ui test
pnpm --filter @ringo/core test

# Watch mode
pnpm --filter @ringo/web test -- --watch

# Integration (R43 — real DB; make sure the test DB is up)
pnpm --filter @ringo/database test:integration
```

## Post-Write Verification

After writing tests:

1. **Run the tests** — `pnpm --filter @ringo/<pkg> test -- --run`
2. **Verify they pass** — fix any failures before committing
3. **Break the code intentionally** — temporarily break the feature and verify tests catch it
4. **Check coverage** — ensure new code paths are covered
5. **Review test names** — read just the `describe`/`it` blocks as a spec document

## Test Quality Checklist

- [ ] Consultation receipt printed (R75)
- [ ] Tests verify behavior, not implementation (no testing internal state directly)
- [ ] Each test has a clear, descriptive name explaining WHAT and WHEN
- [ ] Tests are independent — no shared mutable state between tests
- [ ] Async operations properly awaited with `waitFor` or `findBy*`
- [ ] Mocks cleaned up in `afterEach` / `beforeEach`
- [ ] Edge cases covered (empty, null, long strings, Hebrew, special characters)
- [ ] Error paths tested (not just happy path)
- [ ] Money assertions use integer minor units (R87)
- [ ] Drizzle queries covered by integration tests (R43), not mocks
- [ ] No `test.skip` or `test.todo` left without explanation
- [ ] Tests actually fail when the feature is broken

## Integration with Other Skills

- **Input from `test-plan-generator`:** Use the test plan to prioritize which scenarios to unit-test
- **Output to `feature-tester`:** After unit tests pass, the feature-tester validates end-to-end behavior
- **Reference `ringo-senior-dev`:** For understanding codebase patterns when writing test helpers

## What NOT to Do

- **Don't read the implementation before writing tests** — you will unconsciously write tests that match the implementation rather than the spec (confirmation bias)
- **Don't touch production files** — the file gate catches this; if you need to refactor to make something testable, hand that back to the implementer
- **Don't proceed past RED phase with ASSERTION_MISMATCH tests** — fix the assertion first, then move to implementation
- **Don't write tests for unchanged code** — target branch changes only. Writing tests for pre-existing untouched code wastes time and creates noise.
- **Don't mock the database when integration tests fit** — R43 requires integration tests to hit a real MySQL test DB. Adding redundant mocks creates brittle tests that pass even when the real integration is broken.
- **Don't skip error path tests** — happy-path-only tests give false confidence. Every tRPC call can return 401/403/404/429/500, and every user input can be empty, null, or malformed. If the code has a catch block, there must be a test that triggers it.
- **Don't assert money via floats** — always integer minor units (R87).
- **Don't forget RTL and Hebrew** — a UI test that only asserts English strings misses half the product.

## Related

- `docs/books/RULEBOOK.md` — especially R17, R18, R43, R87, R126, R127, R132
- Agents to loop in: `qa-engineer`, `backend-engineer`, `data-engineer`
