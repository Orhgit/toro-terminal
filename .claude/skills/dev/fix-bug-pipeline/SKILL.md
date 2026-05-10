---
name: fix-bug-pipeline
description: "End-to-end bug fix workflow: analyze, reproduce, fix, verify, commit. Use whenever the user wants to fix, resolve, or address one or more QA bugs, or hands over a list of bug keys or a parent story to work through."
argument-hint: "Comma-separated bug keys (e.g. RNG-101, RNG-205) OR parent story key (e.g. RNG-4984)"
compatibility: "@repo/linear-client (Linear SDK) — LINEAR_API_KEY env + Playwright MCP"
---

# Fix-Bug Pipeline — Ringobook

You are the bug-fix orchestrator for Ringobook. After the QA pipeline files bugs, you take those bugs and drive them from analysis to verified fix. You stay THIN — spawn agents for heavy work, read their handoff files, and manage the flow with user gates.

## Core Principle

> **Agents = WHO** does the work. **Skills = HOW** to do it well.
> You spawn agents (WHO) and point them to skills (HOW). You coordinate, not execute.

For the full subagent roster and the handoff file layout under `.claude/handoffs/fix-bug/`, read [`references/agents-and-handoffs.md`](references/agents-and-handoffs.md).

## Phase -1 — Constitutional Pre-flight (R166–R169)

### Devil's Advocate (Anti-Sycophancy Gate, R167)

Before accepting the bug report as-is, state BOTH:

1. **One reason the bug description might be incomplete, misattributed, or masking a deeper issue** — e.g., the symptom is real but the root cause is in a different layer than described; the bug only appears under specific tenant/state conditions not mentioned; the reporter reproduced on a stale build
2. **One hidden risk not mentioned in the bug report** — e.g., fixing the symptom breaks a related invariant (R132 tenant scoping, R127 contract immutability, R126 matchService); the fix requires a DB migration that needs the R92 expand/migrate/contract protocol

If you cannot find any concern after genuinely trying → write "Reviewed, no blockers found" explicitly.

**Why:** The same sycophancy pattern (58% rate without challenge) that affects feature planning also affects bug fixing — agents assume the bug report is complete and accurate, then build fixes on a wrong premise.

### Reproduction-First Mandate (RED before GREEN)

No fix is written before reproduction is confirmed. The pipeline enforces this structurally:
- Phase 2 (Reproduce) **must return CONFIRMED or CODE_ONLY** before Phase 3 (Fix) runs
- If reproduction returns CANNOT_REPRODUCE: skip the bug entirely, do not guess at a fix
- A "fix" applied to an unconfirmed bug is a scope violation (R168)

### Auto Mode Restrictions (R166)

These actions are ALWAYS interactive — never autonomous in this pipeline:
- `git push` / `git push --force-with-lease`
- `gh pr create`
- `pnpm db:push`

Commits within the fix loop (Phase 4 "FIXED" path) are permitted autonomously per the pipeline contract. Push is not.

## Phase 0: Consultation Receipt (R72–R76)

First line of output:

`Consulted: RULEBOOK R72–R76, <bug-specific rules>. Binding rules: <ids>.`

## The Pipeline

```
Input: Bug keys OR parent story key
         │
  ┌──────▼───────────────────────────┐
  │ Phase 1: BUG ANALYSIS & RANKING  │
  │  WHO: bug-analyzer agent         │
  │  HOW: bug-analysis skill         │
  └──────┬───────────────────────────┘
    GATE 1: Approve ranked list + handle escalations
         │
  ┌──────▼───────────────────────────┐
  │ Phase 2-4: PER-BUG FIX LOOP     │
  │  For each non-escalated bug:     │
  │   2. Reproduce (bug-reproducer)  │
  │   3. Fix (fixer agent)           │
  │   4. Verify → commit or retry    │
  │      (max 3 attempts per bug)    │
  └──────┬───────────────────────────┘
         │
  ┌──────▼───────────────────────────┐
  │ Phase 5: FULL VERIFICATION PASS  │
  │  WHO: bug-reproducer (parallel)  │
  │  Re-verify ALL bugs together     │
  │  If any fail → re-fix (max 2)    │
  └──────┬───────────────────────────┘
    GATE 2: Verification results
         │
  ┌──────▼───────────────────────────┐
  │ Phase 6: REGRESSION ANALYSIS     │
  │  WHO: regression-analyzer agent  │
  └──────┬───────────────────────────┘
    GATE 3: Final report
         │
         ▼
       Done
```

All three gate presentation templates live in [`references/gate-prompts.md`](references/gate-prompts.md). Never proceed past a gate without explicit user approval.

---

## Phase 1: Bug Analysis & Ranking

**Goal:** Fetch all bugs, analyze difficulty, detect architecture issues, rank easy→hard.

### Step 1a: Parse Input

Extract bug keys from the user's input:

- If comma-separated keys: extract all `RNG-\d+` patterns
- If parent story key: find child bugs via the Linear SDK:

  ```ts
  import { getLinearClient } from "@repo/linear-client";
  const linear = getLinearClient();
  const parent = await linear.issue("RNG-4984");
  const children = await linear.issues({
    filter: {
      parent: { id: { eq: parent.id } },
      labels: { some: { name: { eq: "bug" } } },
    },
  });
  ```
- If no keys found, ask the user for them. Do not proceed without at least one valid key.

### Step 1b: Spawn Bug Analyzer Agent

```
Agent: bug-analyzer (.claude/agents/bug-analyzer.md)
Inputs:
  bug_keys: "<comma-separated keys>"
  output_path: ".claude/handoffs/fix-bug/01-bug-analysis.md"
```

The bug-analyzer will:
1. Read the `bug-analysis` skill for methodology
2. Read `debug-agent` + `ringo-senior-dev` skills for domain knowledge
3. Fetch all bugs from Linear via `@repo/linear-client`, analyze, rank, and write results to handoff file

### Step 1c: Read Results and Present Gate 1

Read `.claude/handoffs/fix-bug/01-bug-analysis.md` and present the ranked list to the user using the **Gate 1** template in [`references/gate-prompts.md`](references/gate-prompts.md). Wait for approval before continuing.

---

## Phase 2-4: Per-Bug Fix Loop

**Goal:** For each non-escalated bug (in ranked order), reproduce → fix → verify → commit.

### Pre-requisite: Ensure App is Running

Before starting the fix loop, verify the dev server is running:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
```

If not running:
1. Start it: `pnpm --filter @ringo/web dev` (run in background)
2. Wait for it to respond (poll every 10s, max 5 min)
3. If it cannot start, ask the user for help

The app **must** be running for Playwright MCP reproduction. The bug-reproducer agent uses Playwright MCP tools (`browser_navigate`, `browser_click`, `browser_press_key`, `browser_snapshot`, `browser_take_screenshot`) to interact with the live app and visually verify bugs. Code-only verification is a last resort, not the default.

Process each bug sequentially (fixes can interact, so no parallel fixing):

```
For each bug in approved order:
  attempt = 0
  max_attempts = 3
```

### Step 2: Reproduce Bug

Spawn bug-reproducer in `reproduce` mode:

```
Agent: bug-reproducer (.claude/agents/bug-reproducer.md)
Inputs:
  bug_key: "RNG-XXX"
  bug_details: [from 01-bug-analysis.md — title, description, steps, category, root cause area]
  mode: "reproduce"
  output_path: ".claude/handoffs/fix-bug/02-reproduce-RNG-XXX.md"
```

Read the result:
- **CONFIRMED** → proceed to Step 3
- **CANNOT_REPRODUCE** → skip this bug, add Linear comment noting it could not be reproduced, move to next bug
- **CODE_ONLY** → proceed to Step 3 (code analysis confirmed the defect)

### Step 3: Fix Bug

Spawn fixer agent with rich context from the bug-analyzer:

```
Agent: implementer (.claude/agents/implementer.md) mode: "fix"
Inputs:
  issues: |
    ### Issue: RNG-XXX — [Bug title]
    - **File:** [root cause file from bug analysis]
    - **Line:** [approximate location]
    - **What's wrong:** [from reproduction + analysis]
    - **How to fix:** [fix approach hint from bug analysis]
    - **Watch out for:** [ripple effects — R132 tenant scoping, R68 Storybook, R145 index plan]
  context: "Bug fix for RNG-XXX. See .claude/handoffs/fix-bug/02-reproduce-RNG-XXX.md for reproduction details."
```

After fixer completes, verify the fix compiles:

```bash
pnpm turbo typecheck
pnpm turbo lint
```

If compilation fails, feed errors back to fixer (within the 3-attempt limit).

### Step 4: Verify Fix

Spawn bug-reproducer in `verify-fix` mode:

```
Agent: bug-reproducer (.claude/agents/bug-reproducer.md)
Inputs:
  bug_key: "RNG-XXX"
  mode: "verify-fix"
  output_path: ".claude/handoffs/fix-bug/04-verify-RNG-XXX.md"
```

Handle the result:

- **FIXED** →
  1. Commit the fix using `fix(RNG-XXX): ...` (Conventional Commits) on `development`
  2. Transition the bug to **Done** in Linear using the flow in [`references/linear-templates.md`](references/linear-templates.md)
  3. Post the "Bug Fix Applied" Linear comment from the same file
  4. Move to next bug
- **STILL_BROKEN** →
  - If `attempt < max_attempts`: increment attempt, feed failure details back to fixer, retry Step 3
  - If `attempt == max_attempts`: mark as **UNRESOLVED**, move to next bug
- **PARTIALLY_FIXED** → treat as STILL_BROKEN (retry or mark unresolved)

### Per-Bug Progress Report

After each bug, print the one-line progress update from [`references/gate-prompts.md`](references/gate-prompts.md) ("Progress Report").

---

## Phase 5: Full Verification Pass

**Goal:** Re-verify ALL fixed bugs together to catch interactions between fixes.

### Step 5a: Spawn Parallel Verification

For each bug that was marked FIXED in Phase 4, spawn bug-reproducer in `verify-fix` mode **in parallel**:

```
For each FIXED bug:
  Agent: bug-reproducer
  Inputs:
    bug_key: "RNG-XXX"
    mode: "verify-fix"
    output_path: ".claude/handoffs/fix-bug/04-verify-RNG-XXX.md"  (overwrite)
```

### Step 5b: Aggregate Results

Collect all results into `.claude/handoffs/fix-bug/05-full-verification.md`:

```markdown
## Full Verification Pass

**Cycle:** 1 of 2
**Date:** <today>
**Branch:** <current branch>

| # | Key | Title | Result |
|---|-----|-------|--------|
| 1 | RNG-101 | [title] | FIXED |
| 2 | RNG-205 | [title] | STILL_BROKEN |

**Summary:** X passed, Y failed
```

### Step 5c: Re-fix Loop

If any bugs are STILL_BROKEN and this is cycle 1 of 2:
1. For each STILL_BROKEN bug: re-spawn fixer with updated context (what was tried, what failed)
2. Re-verify those bugs
3. Update the verification file

If still failing after cycle 2: mark as UNRESOLVED.

### Gate 2 and Unresolved Handling

Present the **Gate 2** template from [`references/gate-prompts.md`](references/gate-prompts.md) and wait for the user's decision. For every unresolved bug, transition the status back to **Todo** in Linear and post the "Automated Fix Attempted — Not Resolved" comment from [`references/linear-templates.md`](references/linear-templates.md).

---

## Phase 6: Regression Analysis

**Goal:** Analyze all bug fixes for potential regression risks.

### Step 6a: Spawn Regression Analyzer

```
Agent: reviewer (.claude/agents/reviewer.md) focus: "regression"
Inputs:
  base_branch: "development"
  output_path: ".claude/handoffs/fix-bug/06-regression.md"
```

### Step 6b: Gate 3 — Final Report

Read `.claude/handoffs/fix-bug/06-regression.md` and present the **Gate 3** final-report template from [`references/gate-prompts.md`](references/gate-prompts.md).

---

## Error Handling

| Situation | Action |
|-----------|--------|
| App not running (localhost:5173 unreachable) | Start it with `pnpm --filter @ringo/web dev`; wait for ready; if still fails, ask user for help. Do NOT fall back to code-only silently — Playwright MCP verification is required. |
| Linear API fails | Save progress locally, report error, continue with next bug |
| Fixer introduces new compilation errors | Feed errors back, count as attempt, retry |
| All bugs are ESCALATED | Present at Gate 1, recommend canceling pipeline |
| User says "stop" at any gate | Generate partial report with progress so far |

## Per-Bug Checklist

For each bug passing through the pipeline, confirm:

- [ ] Consultation receipt printed (R75)
- [ ] Bug reproduced (via Playwright MCP or code-only with justification)
- [ ] Root cause identified (not just symptom described)
- [ ] Fix applied and compilation passes (`pnpm turbo typecheck` + `pnpm turbo lint`)
- [ ] Regression check done (no new errors in related features, tenant scoping preserved)
- [ ] Commit message references bug key (`fix(RNG-XXX): ...`)
- [ ] Linear status transitioned and comment added
- [ ] Storybook story updated if UI changed (R68)
- [ ] Index plan attached if a new query was introduced (R145)

## What NOT to Do

- Do not fix bugs yourself — spawn the fixer agent. You are the orchestrator, not the implementer.
- Do not skip reproduction — always confirm the bug exists before trying to fix it
- Do not batch commits — one commit per bug with `fix(RNG-XXX): [description]`
- Do not force Linear transitions — if the target workflow state is unavailable, skip and note
- Do not proceed past gates without user approval
- Do not fix escalated bugs — they need architecture discussion first
- Do not run bug fixes in parallel — fixes can interact, process sequentially
- Do not target `main` — base is `development` (R54)
- **Do not skip the Devil's Advocate phase** — a bug fix that starts from a wrong premise wastes more time than the fix saves
- **Do not write a fix before CONFIRMED reproduction** — the RED-before-GREEN mandate is structural; violating it means fixing symptoms instead of causes
- **Do not run `git push` or `gh pr create` autonomously** — always L2 authorization (R166). Surface to user and wait.

## Related

- `docs/books/RULEBOOK.md` — especially R54, R68, R132, R145
- Agents to loop in: `qa-engineer`, `backend-engineer`, `observability-engineer`
