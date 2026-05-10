---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

# Frontend Design — Ringobook

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Step -1 — Constitutional Pre-flight (R166–R169)

**Storybook-first (R166):** Check Storybook and `packages/ui` for existing components before creating new ones. Do not reinvent what exists.

**Scope declaration (R168):** Before touching any file, list the exact files to be modified. Do not touch files outside that list.

**RTL-first verification (R169):** Before marking any UI task done, verify the layout renders correctly in RTL (right-to-left) mode. Hebrew text + logical CSS properties (`ps-`, `pe-`, `ms-`, `me-`) are required.

**Auto mode restrictions (R167):** In autonomous mode, frontend-design may read and write component files. It may NOT push to remote, open PRs, or deploy without explicit L2 user authorization.

## Step 0 — Consultation Receipt (R75)

First line of reply:

`Consulted: RULEBOOK R72–R76, R1, R68, R95. Binding rules: R68 (Storybook story in same PR), R1 (400-line cap).`

## Ringobook Context (Non-Negotiable)

Even when going bold on aesthetics, these constraints hold:

- **Hebrew-first, RTL-first.** Every layout must work in `dir="rtl"` with logical properties. The Hebrew name is the primary name; English is secondary.
- **Storybook is the visual source of truth (R68).** Any new visual ship includes a story in `packages/design-system` (or `packages/ui`) in the same PR.
- **Tokens live in `packages/design-system`.** Don't hardcode colors, radii, or spacing — reference tokens so dark mode and brand theme toggles work.
- **`packages/ui` is where shared components live.** Prefer composing existing components; only invent new ones when the design truly has no match.
- **Tailwind 4 + React 19 + Vite 7.** Motion via CSS where possible; add a library (e.g. `framer-motion`) only when the effect genuinely needs it.
- **`packages/core` stays pure TS (R9).** Don't leak DOM or Tailwind classes there.
- **No hardcoded URLs (R95)** — go through the `config` module.
- **File cap 400 lines (R1).** Split generously.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it? (Ringobook users are Israeli real-estate professionals and their clients — Hebrew-fluent, often on mobile.)
- **Tone**: Pick an extreme: brutally minimal, maximalist, editorial, luxury, utilitarian, etc. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (Tailwind, tokens, Storybook, RTL, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work — the key is intentionality, not intensity.

Then implement working code (React + Tailwind, a Storybook story, token references) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail
- Hebrew/RTL-ready out of the gate

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose Hebrew-capable fonts that are beautiful, unique, and interesting. The design-system ships a primary Hebrew display + body pairing — use those as the baseline, and introduce supporting Latin fonts only with care. Avoid generic choices (Inter, Arial, Assistant-as-default). Pair a distinctive display font with a refined body font, both with real Hebrew coverage.
- **Color & Theme**: Commit to a cohesive aesthetic. Use design-system tokens so dark mode and tenant theming keep working. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prefer CSS-only when possible; use Motion libraries only for high-impact moments. One well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density. Respect RTL flow — the visual "start" is on the right.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, or cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the Ringobook context (Israeli real-estate — rooted, trustworthy, modern, Hebrew-first). No two designs should look the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

## Deliverables per Task

Unless the user says otherwise, every frontend-design task ships:

1. The component / page in `packages/ui/` (if shared) or `apps/web/src/` (if app-specific)
2. A Storybook story covering the primary variants (R68)
3. Token references rather than hardcoded values
4. RTL-correct layout (test with `dir="rtl"` and Hebrew content)
5. A default dark-mode rendering that still looks intentional

## Related

- `docs/books/RULEBOOK.md` — R1, R68, R95
- Agents to loop in: `branding-designer`, `ux-adapter`, `i18n-specialist`

Remember: Claude is capable of extraordinary creative work. Don't hold back — but do respect Ringobook's Hebrew-first, token-driven, Storybook-first foundation.
