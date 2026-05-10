---
name: pull-request-creator
description: "Create GitHub PRs with proper Linear mapping and description. Use whenever the user asks to create, open, or push a PR, says a branch is ready for review or ready to merge, or even casually asks to 'push and open a PR'."
compatibility: "@repo/linear-client (Linear SDK) — LINEAR_API_KEY env"
---

# Pull Request Creator — Ringobook

You create comprehensive GitHub Pull Requests that include structured summaries, commit-to-Linear-sub-issue
mapping, architecture context, test plans derived from Linear regression sub-issues, and links to regression
analysis. This ensures every PR is self-documenting and QA-ready.

## Step -1 — Constitutional Pre-flight (R166–R169)

**Auto mode restrictions (R166):** These actions are ALWAYS interactive — never run autonomously:
- `git push` / `git push --force-with-lease`
- `gh pr create`

Both require explicit L2 authorization (user runtime confirmation). If invoked from an orchestrator
(e.g., `/feature-dev`), surface to the user and wait for approval before executing.

**Scope audit (R168):** Before creating the PR, verify scope integrity:

```bash
# Files changed on this branch
git diff --name-only development...HEAD | sort > /tmp/actual_files.txt

# Authorized scope (from ssu-scope.json if present)
jq -r '.authorized_files[]' .claude/ssu-scope.json 2>/dev/null | sort > /tmp/auth_files.txt

# Any actual file NOT covered by the authorized list is a scope violation
comm -23 /tmp/actual_files.txt /tmp/auth_files.txt
```

If any unauthorized files appear in the diff, surface them to the user before creating the PR.
Do not silently include files that weren't part of the approved task scope.

**Reversibility (R169):** Creating a PR is irreversible in the sense that it notifies reviewers
and creates a GitHub record. Confirm the branch is ready (typecheck + lint + tests pass) before executing.

## Step 0 — Consultation Receipt (R75)

First line of reply:

`Consulted: RULEBOOK R72–R76, R54, R68, R145. Binding rules: R54 (base is development), R68 (Storybook story), R145 (index plan for new queries).`

## When to Use

- After implementation is complete and all commits are pushed
- When the user says "create PR", "open PR", "submit PR", "pull request"

## Process

### Step 1: Gather Context

Run these commands to understand what's being submitted:

```bash
git status                                  # Check clean working tree
git log --oneline <base>..HEAD              # All commits in the PR
git diff <base>...HEAD --stat               # Files changed summary
```

Where `<base>` is the target branch. Default to `development` (R54); use a parent feature branch only if the user explicitly says so.

### Step 2: Extract Linear Story Info

1. **Extract Linear ticket key** from the branch name (e.g., `feature/RNG-4797-save-on-send` → `RNG-4797`)
2. **Fetch the story** via `@repo/linear-client`:
   ```ts
   import { getLinearClient } from "@repo/linear-client";
   const linear = getLinearClient();
   const issue = await linear.issue("RNG-4797");
   const children = await linear.issues({ filter: { parent: { id: { eq: issue.id } } } });
   ```
3. **Find regression test sub-issue** — look for a child labeled `regression` or titled "Regression test plan …"
4. **Collect all sub-issue keys** to map commits to sub-issues

### Step 3: Build Commit-to-Sub-Issue Map

For each commit on the branch:
- Parse the `RNG-XXXX` key from the commit message
- Match to the corresponding Linear sub-issue title
- Build a table: Commit hash | Sub-issue key | Description

### Step 4: Build Test Plan

1. **Check for a regression test sub-issue** (e.g., RNG-4883) under the parent story
2. **Read its description** via `linear.issue(...)` — it contains structured test cases
3. **Extract all test case checkboxes** (lines starting with `- [ ]`)
4. **Group by risk level** (Critical, Medium, Low) based on the section headers
5. **Include a link** to the full regression sub-issue for QA reference

If no regression sub-issue exists, build a minimal test plan from the commits:
- For each changed area, add 1-2 verification items
- Flag that a full regression analysis is recommended

### Step 5: Create the PR

Use `gh pr create` with this structure:

```markdown
## Summary
- [Bullet points from story acceptance criteria or commit descriptions]
- [Keep to 3-5 bullets max]

## Changes

| Commit | Sub-issue | Description |
|--------|-----------|-------------|
| `abc1234` | RNG-XXXX | Short description from commit |
| `def5678` | RNG-YYYY | Short description from commit |

## Rule Impact (RULEBOOK)

- [ ] R68 — Storybook story added/updated for visual changes
- [ ] R145 — EXPLAIN / index plan for new queries: <link or pasted output>
- [ ] R132 — tenant_id scoping verified on all new queries
- [ ] R18 — Zod at all new boundaries
- [ ] R87 — money fields are integer minor units
- [ ] R127 — no UPDATE on signed_contracts rows
- [ ] R126 — two-listing writes via matchService only

## Architecture Change
[Only if the PR changes architecture — show before/after]

## Test Plan

### Critical
- [ ] Test case from regression sub-issue

### Medium
- [ ] Test case from regression sub-issue

### Low
- [ ] Test case from regression sub-issue

Full regression plan: [RNG-XXXX](https://linear.app/<org>/issue/RNG-XXXX)

Generated with Claude Code.
```

### Step 6: Set PR Options

- `--base development` (R54) unless the user explicitly says otherwise
- `--title`: `RNG-XXXX <Story title>` (under 70 chars)
- `--body`: The full markdown body via HEREDOC
- Do NOT auto-assign reviewers unless the user asks

### Step 7: Pre-flight Quality Checks

Before running `gh pr create`, run locally:

```bash
pnpm turbo typecheck
pnpm turbo lint
pnpm turbo test -- --run
```

A PR that fails these on CI wastes reviewer time. Do not skip this step.

## PR Title Convention

Format: `RNG-{ticket} {Short description}`

Examples:
- `RNG-4797 Match two listings via matchService flow`
- `RNG-350 Create/edit listing wizard`

Keep under 70 characters. Use the Linear story title if it fits.

## Test Plan Quality Checklist

Before submitting the PR, verify the test plan:
- [ ] Covers all **critical** paths (the main feature being delivered)
- [ ] Includes **regression** checks (existing features that could break)
- [ ] Has an **environment matrix** hint if multi-platform (web / Android / Expo)
- [ ] Links to the **full regression sub-issue** in Linear for QA deep-dive
- [ ] Each test case is **actionable** (a QA person can execute it without ambiguity)
- [ ] Covers RTL and Hebrew where relevant

## Common Patterns

### Feature branch → development (default)
```bash
gh pr create --base development \
  --title "RNG-350 Create/edit listing wizard" \
  --body "..."
```

### Feature branch → parent feature branch
```bash
gh pr create --base feature/RNG-2673-match-engine \
  --title "RNG-4797 Match two listings via matchService flow" \
  --body "..."
```

## Error Handling

- **No regression sub-issue found**: Create a minimal test plan from commits, suggest creating one
- **Linear unreachable**: Build PR from git log only, note that Linear links are missing
- **No Linear key in branch name**: Ask the user for the story key
- **Commits don't have RNG keys**: Use commit messages as-is without sub-issue mapping

## What NOT to Do

- **Don't create a PR without running typecheck + lint + tests** — a PR that fails CI on basic checks wastes reviewer time.
- **Don't target `main`** — base is always `development` unless explicitly overridden (R54).
- **Don't write the PR title as a commit hash** — the PR title must follow the `RNG-{ticket} {Short description}` convention and stay under 70 characters.
- **Don't skip the test plan section** — every PR needs a test plan with actionable checkboxes.
- **Don't omit the Rule Impact checklist** — PRs that add queries without confirming R132 / R145 don't get merged.
- **Don't run `git push` or `gh pr create` autonomously** — both are always L2 authorization (R166). Surface to the user and wait.
- **Don't skip the scope audit** — creating a PR that includes unauthorized files bypasses R168 and poisons the review record.
- **Don't create a PR for a branch with uncommitted changes** — the reviewer sees a diff that doesn't reflect the actual working tree.

## Related

- `docs/books/RULEBOOK.md` — especially R54, R68, R145
- Agents to loop in: `qa-engineer`, `release-devops`
