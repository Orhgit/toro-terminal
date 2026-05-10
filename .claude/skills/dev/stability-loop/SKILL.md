---
name: stability-loop
description: "Run a single test target repeatedly to catch flakes before they reach prod. Use when the user asks to 'run the test multiple times', 'check for flakes', 'is this stable?', 'soak test', or wants confidence that a Vitest/Playwright/feature-tester run is deterministic. Invokable as `/stability-loop <target>`."
compatibility: "vitest, @playwright/test, pnpm. No Linear/MCP dependency — works fully local."
argument-hint: "<target> [--runs N] [--bail-on-first-flake]"
---

# Stability Loop — Ringobook

You repeat a single test target N times in series and report pass-rate, flakes,
and the failure pattern. The premise: a single green run does NOT prove the
test is stable. Two failed prod deploys on 2026-04-30 (Apple throw, google-auth
CJS — see `feedback_runtime_smoke_before_merge`) both passed CI once. This
skill enforces "green N times in a row" before anyone calls a feature stable.

This is NOT a test writer. It runs an existing target. Use `unit-test-writer`
or `e2e-test-writer` to author tests; use this skill to verify they are
deterministic.

## Step -1 — Constitutional Pre-flight (R166–R169)

**No production side-effects (R166):** Stability loop runs diagnostics only. It does NOT restart services, delete logs, clear caches, or modify infrastructure without explicit L2 user authorization.

**Bail-is-safety (R169):** If a check returns an unexpected result, STOP and report — do not proceed to the next step automatically. An unexpected result may indicate a larger incident.

**Read-only report (R167):** The output of a stability loop run is a written status report. No commits, no deployments, no automated remediations.

## Step 0 — Consultation Receipt (R75)

First line of output:

`Consulted: RULEBOOK R43, R72–R76, feedback_runtime_smoke_before_merge, feedback_self_test_before_handoff. Binding: R43 (real DB, no mocks), runtime-smoke (single green ≠ stable).`

## Step 1 — Resolve the target

The user passes `<target>`. Resolve it into one of these runners:

| Target shape | Runner | Example |
|---|---|---|
| Path to `*.test.ts` / `*.test.tsx` | Vitest by file | `node_modules/.bin/vitest run path/to/x.test.ts` |
| Vitest test name (quoted) | Vitest by `--testNamePattern` | `node_modules/.bin/vitest run -t "creates lead"` |
| Path to `*.spec.ts` under `tests/e2e/` or `apps/web/tests/` | Playwright | `node_modules/.bin/playwright test path/to/x.spec.ts` |
| Linear scenario `TC-NN` from a `qa-pipeline` test plan | Spawn `feature-tester` skill on that scenario | (orchestrated, not direct shell) |
| `feature-tester` (no path) | Run the full `feature-tester` skill against current branch | (delegated to skill) |

If the target is ambiguous (could be Vitest or Playwright), ASK the user. Don't
guess — running the wrong runner wastes minutes per iteration × N iterations.

## Step 2 — Resolve N (number of runs)

- Default `N = 5`
- `--runs <int>` overrides (clamp to `[3, 50]`)
- For Playwright targets default to `N = 3` (slower)
- For sub-100ms Vitest targets default to `N = 10` (cheaper, catches more)

Tell the user the chosen N and the estimated total time (run-once duration × N
plus a 10% setup overhead) BEFORE starting. They can interrupt before you burn
time on a misconfigured target.

## Step 3 — One throwaway warm-up run

Run the target ONCE without recording. Reasons:
1. Validate the runner command actually works (no path typo, no missing dep).
2. Warm caches (Vite transform cache, Node module cache, Playwright browser).
3. Get a realistic per-run time estimate.

If the warm-up fails:
- **Compilation / import error** → STOP. Report. Don't loop a broken target.
- **Test failure** → continue (the loop is supposed to measure failure rate).
- **Browser/server not running for Playwright** → STOP and instruct the user
  how to start (`pnpm dev`, `pnpm storybook`, `pnpm --filter @ringo/webhook-gateway dev`).

## Step 4 — Loop

Run the target N times. Per run, capture:

- `run_index` (1..N)
- `started_at` (UTC ISO)
- `duration_ms`
- `exit_code`
- `failed_test_names` (parsed from runner output — Vitest's `❯` markers or
  Playwright's `✘` markers)
- `last_error_excerpt` (last 30 lines of stderr/stdout if non-zero exit)

Implementation note: do **not** parallelize. Flakes often reveal themselves as
order- or timing-dependent — running serially preserves the realistic shape.
Between runs, `sleep 0.5` to let async resources (DB connections, file locks)
settle.

For Vitest also pass `--reporter=json --outputFile=/tmp/stability-vitest-${run_index}.json`
to make per-test results machine-readable.

For Playwright pass `--reporter=json` and save to a per-run file.

## Step 5 — Classify the outcome

After N runs, compute:

- `pass_rate = passes / N`
- `failure_pattern`:
  - **Stable green** — all N runs green
  - **Stable red** — all N runs failed in the same way → deterministic bug, fix the test or the code
  - **Flaky** — same target sometimes passes, sometimes fails → root cause is timing, ordering, or shared state
  - **Drifting** — fails increasing or decreasing over runs → resource leak, accumulated state

Map the pattern to severity:

| Pattern | Severity | Recommended action |
|---|---|---|
| Stable green | OK | Safe to merge |
| Stable red | P0 | Hand off to `bug-analysis` skill |
| Flaky | P0 | Hand off to `debug-agent` skill — flake hunt |
| Drifting | P0 | Hand off to `debug-agent` skill — leak hunt |

A single red run inside a "stable green" sample is enough to drop classification
to **flaky**. Do not round up. The whole point is "single green ≠ stable".

## Step 6 — Write the handoff

Write the report to:

```
.claude/handoffs/stability/<target-slug>-<UTC-timestamp>.md
```

Where `target-slug` is `[a-z0-9_-]+` derived from the target argument
(replace `/`, spaces, quotes with `-`; truncate at 80 chars).

The report MUST contain:

```markdown
# Stability Loop — <target>

**Consulted:** <receipt>
**Target:** <resolved runner command>
**Runs:** N (warm-up + N counted runs)
**Pass rate:** <X> / <N>
**Pattern:** <stable-green | stable-red | flaky | drifting>
**Verdict:** <OK | P0 — see follow-up>

## Per-run results

| # | started_at | duration | exit | failed_tests |
|---|---|---|---|---|
| 1 | ... | ... | ... | ... |
...

## Failure excerpts (only failing runs)

### Run <i> failure
```
<last 30 lines of output>
```

## Follow-up

- [ ] If `flaky`: spawn `debug-agent` with this report
- [ ] If `stable-red`: spawn `bug-analysis` with this report
- [ ] If touched a feature-tester scenario: update the scenario's Linear
      grandchild (`qa-pipeline` Phase 3) with the verdict
```

## Step 7 — Surface the verdict

In the chat reply, give a 5-line summary:

```
Target: <target>
Runs: N
Pass rate: X / N
Pattern: <pattern>
Report: .claude/handoffs/stability/<file>.md
```

If `flaky`/`stable-red`/`drifting`, also surface the **first failing run's
short error excerpt** (first 5 lines of the trace) inline. Do NOT wait for the
user to open the report — they should see the smoking gun in the chat.

## Integration with feature-dev (Phase 4+5)

When `feature-dev` is invoked and reaches Phase 4+5 with `RINGO_REQUIRE_STABILITY=1`
in env, the orchestrator should call this skill on each new test added in
the feature, and require a stable-green verdict before proceeding to Phase 7.

This integration is opt-in (env-flag) for now — once it has run a few weeks
without complaint, promote to default.

## What NOT to do

- Don't run in parallel (`--runInBand` for Vitest, sequential for Playwright).
  Flakes hide under parallelism.
- Don't skip the warm-up run. The first run's compile/install cost will
  artificially raise the duration mean and obscure real flakes.
- Don't classify `(N-1)/N green` as "stable green". One red is enough for
  flaky. The whole skill exists because singletons lie.
- Don't run with N > 50 unless the user explicitly asks. Cost, not value.
- Don't write fixes inside this skill — hand off to `debug-agent` /
  `bug-analysis`. Stability-loop measures, it doesn't repair.
- Don't suppress the failure excerpts to keep the report short. The first
  failing trace is the most valuable artifact in the entire run.

## Related

- `feedback_runtime_smoke_before_merge` — the user memory this skill exists to
  honor (two failed prod deploys 2026-04-30, both with green CI).
- `feature-tester` — sibling skill; this one tells you if feature-tester's
  verdict is reproducible.
- `debug-agent` — handoff target for `flaky` and `drifting` patterns.
- `bug-analysis` — handoff target for `stable-red` patterns.
- `qa-pipeline` Phase 3 — runs each test case once. This skill is the "× N"
  upgrade for cases that look suspicious.
- `RULEBOOK.md` R43 — integration tests against real MySQL. Stability-loop
  inherits this constraint (no mock substitution to make a flake go away).
