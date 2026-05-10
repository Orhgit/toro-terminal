---
name: git-rebase
description: "Rebase and sync feature branches onto development, including conflict resolution. Use whenever the user asks to rebase, update a branch, sync with development, pull latest, or says a branch is behind or has conflicts."
---

# Git Rebase Agent — Ringobook

Expert git rebase agent that safely rebases feature branches with conflict resolution,
compilation verification, and respect for project conventions.

## Step -1 — Constitutional Pre-flight (R166–R169)

**No force push (R166):** `git push --force` is always forbidden. `--force-with-lease` is permitted only with explicit L2 user authorization.

**Worktree isolation (R168):** If running inside `.claude/worktrees/<x>/`, ALL git commands must use `git -C <worktree-path>`. Verify before every command:
```bash
git -C "$WORKTREE_PATH" branch --show-current
```

**Reversibility check (R169):** Before any rebase, state the rollback procedure:
```bash
git rev-parse HEAD  # save this hash
# Rollback: git reset --hard <saved-hash>
```

**No shallow history (R166):** Never use `--depth`, `--shallow-exclude`, or `--shallow-since`.

## Step 0 — Consultation Receipt (R75)

First line of reply:

`Consulted: RULEBOOK R72–R76, R54, R57. Binding rules: R54 (base is development, not main).`

## Git-flow Context

This project uses a git-flow variant:
- **development**: main integration branch (R54). Feature branches base on this, not on `main`.
- **main**: release branch — after a release, `development` is rebased onto `main` (not merged) to keep history clean
- **Feature branches**: based on `development`, or sometimes on other feature branches
- Feature branches may be merged to `development` at milestones and then continue with new work
- Multiple features run in parallel and may depend on each other

These patterns create situations where a naive `git rebase development` replays too many commits.
Always analyze the topology before rebasing (see Step 2).

## Core Principles

1. **Safety first**: Never lose work. Stash uncommitted changes before starting.
2. **Understand intent**: When resolving conflicts, understand what both sides intended before choosing.
3. **Verify at each step**: Compilation must pass after each conflict resolution — no broken intermediate commits.
4. **No force push**: Rebases need to be checked by the developer before pushing.
5. **Preserve history**: No squashing or reordering unless explicitly asked.
6. **Full history**: Never use `--depth`, `--shallow-*`, or any shallow fetch options.

## Rebase Workflow

### Step 1: Pre-flight Checks

Before starting any rebase:

```bash
# 1. Record current state
git log --oneline -5                    # Know where we are
git status                              # Check for uncommitted changes

# 2. Stash if needed (with descriptive message)
git stash push -m "Pre-rebase stash: <branch-name> onto <target>"

# 3. Fetch latest (full history required — shallow fetches break rebase)
git fetch origin <target-branch>
```

### Step 2: Detect the Right Base Commit

A naive `git rebase <target>` replays ALL commits since the merge-base. This is wrong when:
- The branch was previously based on another feature branch that has since merged to `development`
- The branch was merged to `development` at a milestone and continued with new work
- `development` was rebased onto `main` after a release

**Worktree awareness (R168):** If you are working inside a `.claude/worktrees/<x>/` sub-worktree,
all git commands MUST use `git -C <worktree-path>` explicitly. Bare `git` commands operate on the
main worktree (the repo root) — a different branch. Never assume `git branch --show-current` returns
the worktree's branch when called from a shell whose CWD is the main repo root.

```bash
# If in a sub-worktree, always prefix:
WORKTREE_PATH="/path/to/worktree"
git -C "$WORKTREE_PATH" branch --show-current
git -C "$WORKTREE_PATH" log --oneline -5
```

**Detection: reliable cherry-pick right-only method (O(1), not O(n²))**

```bash
# The definitive way to find commits unique to HEAD vs origin/development
# --cherry-pick: omits commits whose patch-id is equivalent in both branches
# --right-only: shows only commits on the right side (HEAD)
git log --cherry-pick --right-only --oneline origin/development...HEAD
```

This replaces the fragile grep-based loop (which has O(n²) complexity, macOS `wc -l` whitespace
issues, and false positives from similar commit messages). The cherry-pick algorithm uses patch-ids
which are content-based, not message-based.

If the count of unique commits is LOW (e.g., 5 when you expected 20), investigate whether commits
were already merged via a different branch.

**If `--cherry-pick` is unavailable or gives surprising results**, fall back to the message-based
detection as a secondary check — but never use it as the primary method.

Heuristics for identifying unique vs duplicate commits:
- **Author**: Commits by other users are likely from a merged dependency branch
- **Commit messages**: RNG ticket numbers help — if the ticket isn't yours, it's likely a duplicate
- **Ask the user** to confirm the boundary before proceeding

**Deciding simple vs `--onto` rebase:**

| Situation | Approach |
|-----------|----------|
| No duplicates, branch directly based on target | Simple: `git rebase origin/development` |
| Many duplicates, unique commits form a contiguous block at the end | `--onto`: replay only the unique block |
| Unique commits scattered among duplicates | `--onto` from last DUP before contiguous tail, then verify isolated unique commits are already in target |

```bash
# Simple case:
git rebase origin/development

# --onto case (IMPORTANT: use branch name, not HEAD, to avoid detached HEAD):
git rebase --onto origin/development <last-duplicate> feature/branch-name
```

**Handling "isolated" unique commits before the contiguous block:**

When unique commits appear scattered among DUPs (e.g., #175 unique, #176-191 DUPs, #192-197 unique), the isolated ones (#175) are almost always already in the target — they were merged along with the DUP branch. **Always verify by commit message search, never by hash** (hashes change after rebase):

```bash
# CORRECT: search by message (finds rebased copies)
git log --oneline origin/development --grep="Add matchService indexes" | head -1

# WRONG: search by hash (won't find rebased copies)
git branch -r --contains 94bb469a1
```

If the isolated commit IS in the target → safe to skip (the `--onto` approach handles this automatically).
If it's NOT in the target → cherry-pick it after the rebase completes.

### Step 3: Analyze Conflict Risk

Before starting the rebase, identify likely conflict areas:

```bash
# Files changed on both sides (use the correct base for comparison)
comm -12 \
  <(git diff --name-only <base>..HEAD | sort) \
  <(git diff --name-only <base>..<target> | sort)
```

Review overlapping files to anticipate conflicts. Pay special attention to:
- **Barrel files** (`index.ts`): Import/export additions from both sides
- **Package files** (`package.json`, `pnpm-lock.yaml`): Dependency changes
- **Config files** (`eslint.config.js`, `tsconfig*.json`, `turbo.json`): Rule/setting changes
- **Shared Drizzle schema** (`packages/database/src/schema/`): column additions must not clash
- **tRPC routers** (`server/routers/`): procedure additions from both sides

### Step 4: Execute Rebase

```bash
# Simple case (no duplicates):
git rebase <target>

# With --onto (use branch name, not HEAD — avoids detached HEAD):
git rebase --onto <target> <last-duplicate> <branch-name>
```

If conflicts occur, handle them one at a time (see Conflict Resolution below).

### Step 5: Post-rebase Verification

After successful rebase:

```bash
# 1. Verify the commit history looks correct
git log --oneline -20

# 2. Compile + lint the whole workspace
pnpm turbo typecheck
pnpm turbo lint

# 3. Verify the rebase only introduced our changes
git diff origin/development..HEAD --stat          # Files we changed on top of development
git diff <old-base>..origin/development --stat    # Files development gained since our old base

# 4. Restore stashed changes if any
git stash pop
```

### Step 6: Report Results

Summarize:
- How many commits were replayed (and how many skipped if `--onto` was used)
- How many conflicts were resolved (and how)
- Any compilation fixes applied
- Final commit log comparison

## Conflict Resolution Strategy

### Decision Framework

For each conflict:

1. **Read both sides**: Understand what each change intended
2. **Check commit messages**: They explain the "why"
3. **Determine category** (see below)
4. **Resolve with confidence or ask**

### Conflict Categories

**Auto-resolvable (proceed without asking):**

| Pattern | Resolution |
|---------|-----------|
| Import additions from both sides | Keep both, maintain import order rules |
| Barrel `index.ts` re-exports | Keep both export lines |
| New files added on both sides (no overlap) | Keep both |
| Whitespace/formatting only | Accept the rebase target's formatting |
| `pnpm-lock.yaml` conflicts | Accept target, then `pnpm install` |
| Comment-only changes | Keep the more informative version |

**Requires judgment (attempt but verify):**

| Pattern | Approach |
|---------|----------|
| Same function modified differently | Understand both intents, merge logic |
| Type / Zod schema divergence | Ensure both sets of changes are compatible (R18 at boundary) |
| Config changes (ESLint, tsconfig) | Merge rules/settings from both sides |
| Drizzle schema column additions | Keep both columns; re-check migrations |
| tRPC router additions | Keep both procedures; re-check input schemas |
| Test file conflicts | Keep both test cases |

**Stop and ask (do not guess):**

| Pattern | Why |
|---------|-----|
| Deleted vs modified (one side deletes, other modifies) | Intent is ambiguous; see R161–R165 |
| Architectural changes (file moves vs edits) | Risk of losing work |
| Business logic conflicts (matchService, contracts) | Domain knowledge needed (R126/R127) |
| tenant_id filter changes | R132 impact — don't guess |

### Import Conflict Resolution

When resolving import conflicts:

1. Keep all unique imports from both sides
2. Apply the project's import order (node builtins → externals → `@ringo/*` workspaces → relative)
3. Remove any duplicate imports
4. Prefer `import type` for type-only imports where enforced
5. After resolving, grep the file for all symbols that were in HEAD's imports — if any are missing from the resolved imports, re-add them.

### Compilation Check During Rebase

After resolving conflicts for each commit, **before running `git rebase --continue`**:

```bash
pnpm turbo typecheck 2>&1 | grep "error TS" | head -5
pnpm turbo lint 2>&1 | grep "warning\|error" | head -5

# If errors found, fix them before continuing. Then stage fixes:
git add <fixed-files>
```

Only proceed with `git rebase --continue` when compilation is clean.

## Special Scenarios

### `pnpm-lock.yaml` Conflicts

Always resolve by accepting the target branch version, then regenerating:

```bash
git checkout <target> -- pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
```

### Drizzle Schema Conflicts

If both sides added columns to the same table:
- Keep both columns
- Check the migration files; you likely need a new migration that includes both
- Re-run `pnpm --filter @ringo/database generate` if the project uses generated migrations
- Check that R132 tenant_id rules still hold

### ESLint Config Conflicts

Merge rules from both sides. The project requires `--max-warnings 0`, so any new rule must be compatible.

### `development` Rebased After Release

After a release, `development` is rebased onto `main`. This means:
- The merge-base between your branch and `development` may be very old
- Many commits on `development` will have new hashes (from the rebase)
- Use commit message matching (not hash matching) to detect duplicates

## Checklist

Before and after every rebase, verify:

- [ ] Consultation receipt printed (R75)
- [ ] Uncommitted changes stashed (with descriptive message)
- [ ] Target branch is `development` (R54), fetched with full history
- [ ] Duplicate commits detected and `--onto` used if needed
- [ ] Conflict resolution preserves intent from both sides
- [ ] Compilation + lint pass after rebase
- [ ] Commit count matches expectations (no dropped or duplicated commits)
- [ ] Stashed changes restored

## What NOT to Do

- **Never** `git rebase -i` (interactive) unless explicitly asked
- **Never** `--no-verify` or skip hooks
- **Never** force push — use `--force-with-lease` when push is explicitly authorized by the user (R166: push is always L2 authorization — never autonomous)
- **Never** use `--depth`, `--shallow-*`, or any history-limiting options
- **Never** resolve a conflict you don't understand — surface it
- **Never** `git rebase --skip` without explaining what commit is being dropped and why
- **Never** modify commits beyond what's needed for conflict resolution
- **Never** rebase onto `main` — the base is always `development` (R54)
- **Never** use bare `git` commands in a sub-worktree context — always `git -C <worktree-path>` (memory: feedback_git_in_worktrees)
- **Never** use the grep-based duplicate detection loop as the primary method — use `git log --cherry-pick --right-only` instead

## Related

- `docs/books/RULEBOOK.md` — R54, R57
- Agents to loop in: `release-devops`
