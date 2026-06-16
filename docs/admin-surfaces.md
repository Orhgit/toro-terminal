# Admin surfaces

The repo has three "admin"-shaped UIs. They share the same database but
serve completely different audiences, so they live in separate apps with
separate deploys, middleware, and security postures.

If you find yourself thinking "this looks duplicated, let me consolidate",
read this first.

| App | URL prefix | Audience | Auth requirement | Indexed by Google |
|---|---|---|---|---|
| `apps/web` (`/admin/super/*`, `/admin/leads`, `/admin/add-property`) | `<root>/admin/*` of public site | super_admin staff (1–3 people) | session cookie + `role === "super_admin"` | No (`robots: noindex` on `/admin/*` via [`apps/web/app/robots.ts`](../apps/web/app/robots.ts) and middleware) |
| `apps/admin` | separate dev port `4001` | internal staff / ops (5–20 people: agent-studio, marketing-tasks, pipeline-monitor) | session check (TODO — currently mock; tracked in RIN-416) | No (`robots: { index: false }` in [`apps/admin/app/layout.tsx`](../apps/admin/app/layout.tsx)) |
| `apps/mission-control` | separate dev port `4003` | paying tenants (100s of customers, per-org views) | session + `organization_id` scoping | No (`robots: { index: false }` in [`apps/mission-control/app/layout.tsx`](../apps/mission-control/app/layout.tsx)) |

## Why three?

**Different audience size + risk profile.**

- `apps/web/admin/super` is a tiny tool for *us* to manage *all* tenants.
  Lives in apps/web because the super_admin role is part of the same
  identity model as public users; the middleware in
  [`apps/web/middleware.ts`](../apps/web/middleware.ts) routes them.

- `apps/admin` is the *staff* tool — internal employees who curate
  marketing assets across tenants. Different deploy cadence, different
  permissions, ideally hosted on an internal-only domain.

- `apps/mission-control` is the *tenant SaaS dashboard*. Paying customers
  log in here to manage their own listings. **This is the product** — it
  should never be conflated with internal tooling.

## Naming smells (not duplication)

- `apps/admin/app/mission-control/page.tsx` is a *pipeline monitor* — an
  ops view of "how is the AI marketing pipeline doing across all tenants".
  Not the same as the per-tenant `apps/mission-control` SaaS dashboard.
  The shared name is unfortunate; consider renaming the staff route to
  `/admin/pipeline` to remove the ambiguity.

- `apps/web/app/admin` includes some routes (`/admin/leads`,
  `/admin/add-property`) that don't really belong to super-admin and
  arguably should move to `apps/mission-control` as tenant tools. This
  is a real refactor (moves code across apps + updates middleware), best
  done as its own focused PR.

## What we did NOT do

The QA audit (RIN-391) flagged these as "duplicate admin". We chose not
to consolidate because the three apps serve genuinely different audiences
and merging them would require unifying middleware, deploy pipelines, and
permission models — a 1–2 week refactor with no functional benefit.

The actionable cleanup (rename `apps/admin/app/mission-control` →
`pipeline-monitor`, move tenant-shaped routes out of `apps/web/app/admin`)
is tracked as a follow-up in RIN-391.
