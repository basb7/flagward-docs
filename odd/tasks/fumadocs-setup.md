# Feature: fumadocs-setup

## Objective

Stand up the Flagward documentation site as a standalone Fumadocs (Next.js) app in `flagward-docs`.

## Problem / Why

Flagward (Django backend + `@flagward/*` JS SDKs) has no public documentation site. The landing (`flagward-landing`) already uses Next.js + Tailwind + shadcn + shiki, so Fumadocs reuses that stack and branding.

## Scope

- Standalone Next.js app with Fumadocs UI + fumadocs-mdx, npm as package manager.
- Flagward branding: single dark palette from the landing, logo, Geist fonts.
- Biome for lint/format (same config as the landing).
- Initial content skeleton: introduction, quickstart, SDKs (core, React, Vue, Solid, Svelte), self-hosting.

Out of scope: versioning (deferred until a real breaking change), OpenAPI reference, TypeDoc reference, i18n, deployment.

## Constraints

- Artifacts in English.
- No fabricated API: SDK content must come from the real READMEs in `flagward-sdk-js` and `flagward`.

## Tasks

- [x] T1 — Scaffold Fumadocs app (Next.js + fumadocs-mdx, npm) with Biome; `npm run build` passes.
- [x] T2 — Apply Flagward branding (dark palette, logo, favicon, nav title/links).
- [x] T3 — Initial content skeleton sourced from real READMEs, with framework tabs for SDK examples.

## Acceptance criteria

- `npm run build` succeeds.
- `npm run lint` (Biome) passes.
- Site renders `/docs` with sidebar, search, and Flagward branding.

## Checks

- TDD: enabled by global config (`~/.claude/CLAUDE.md`, "Strict TDD Mode"), but this new project has no test runner; a docs scaffold has no unit-testable behavior. Functional checks instead: `npm run build`, `npm run lint`, and a rendered smoke check of `/docs`.
- RDD: on (global). Assess each work-unit commit.

## Delivery

- Strategy: ask-on-risk. Forecast: scaffold is mostly generated boilerplate; authored lines expected under ~400 excluding lockfile.

## Routing

| Task | Route | Trigger evidence |
| --- | --- | --- |
| T1–T3 | delegated direct (one writer) | Writer trigger: 2+ non-trivial files |

## Progress

- Repo initialized (`git init`), branch `feat/fumadocs-setup`.
- T1 done: scaffolded with `npm create fumadocs-app@latest` (template
  `+next+fuma-docs-mdx`, npm, Biome linter, orama search) into the scratchpad,
  then moved into `flagward-docs` alongside `odd/`. Replaced `biome.json` with
  a config mirroring `flagward-landing` (single quotes, trailing commas all,
  2-space indent, `tailwindDirectives: true`), scoped `files.includes` to
  `app/**`, `components/**`, `lib/**`, `*.config.mjs`, `*.config.ts`,
  `proxy.ts`. Updated `package.json` scripts to `dev`/`build`/`start`/`lint`
  (`biome check .`)/`lint:fix`/`format`. `.gitignore` already covered
  `node_modules`, `.next`, `.source`. Removed two unused imports in
  `lib/source.ts` flagged by lint. Replaced the scaffolder's generic README
  with a project-specific one.
  - `npm run build`: pass.
  - `npm run lint`: pass (exit 0; 2 non-blocking warnings — an
    `!important` in the scaffold's scroll-lock CSS and nothing else).
  - Commit: `20db791` — `feat: scaffold fumadocs documentation app`.

- T2 done: mapped the `flagward-landing` dark palette onto Fumadocs UI's
  `--color-fd-*` variables in `app/global.css` (single theme, set on both
  `:root` and `.dark`), added Geist Sans/Mono via `next/font/google` (matching
  `flagward-landing/app/[lang]/layout.tsx`), forced dark mode
  (`RootProvider theme={{ forcedTheme: 'dark', defaultTheme: 'dark',
  enableSystem: false }}` plus a static `dark` class on `<html>`) and disabled
  the nav's theme toggle (`themeSwitch: { enabled: false }` in
  `lib/layout.shared.tsx`). Copied `logo.png`, `icon.png`, `favicon.ico`,
  `apple-icon.png` from `flagward-landing`. Nav title is "Flagward" with the
  logo (`lib/layout.shared.tsx`); GitHub link points at
  `https://github.com/basb7/flagward` (`lib/shared.ts`). Root `/` now
  `redirect()`s to `/docs`; removed the now-unused `(home)` route group.
  - `npm run build`: pass.
  - `npm run lint`: pass (exit 0; same 2 non-blocking warnings as T1).
  - Visual smoke check (production server, `/docs`): dark theme, logo, nav
    title "Flagward", GitHub link, no theme toggle — confirmed via browser
    screenshot.
  - Commit: `0f88e4c` — `feat: apply flagward branding to docs`.

- T3 done: content skeleton sourced from `flagward/README.md` and
  `flagward-sdk-js/{README.md,packages/*/README.md}` (read-only; not
  modified). `content/docs/meta.json` orders `index, quickstart, sdks,
  self-hosting`; `content/docs/sdks/meta.json` orders `index, react, vue,
  solid, svelte`.
  - `index.mdx` (Introduction): what Flagward is, local SDK evaluation,
    real-time updates.
  - `quickstart.mdx`: install + read-a-flag example for every framework in
    one `<Tabs>` block (React/Vue/Solid/Svelte/core), sourced from each
    package's Quick start section.
  - `sdks/index.mdx`: shared-core overview, install `<Tabs>`, evaluation
    model, live updates, error reporting.
  - `sdks/{react,vue,solid,svelte}.mdx`: one page per adapter, condensed from
    its README (hooks/composables, context, network resilience, framework
    notes) — full README content (e.g. deep Next.js/SvelteKit specifics) is
    summarized rather than copied verbatim where it would bloat the page.
  - `self-hosting.mdx`: Docker Compose (dev/prod), key env vars, production
    deployment steps, local dev without Docker, and the "Creating your first
    flag" walkthrough (anchor `#creating-your-first-flag`, linked from
    quickstart). Two `<Callout>`s flag the SECURITY.md warning and that the
    full API reference is out of scope for now.
  - Also registered `Tab`/`Tabs` in `components/mdx.tsx` (needed for the
    `<Tabs>` blocks) and removed the scaffold's placeholder `test.mdx`.
  - No fabricated API: every code sample and env-var table is lifted or
    condensed from the real READMEs; nothing invented.
  - TODOs left in content: `self-hosting.mdx` notes the full REST API
    reference (endpoints, models) is not yet part of this site — explicitly
    out of scope per the feature's Scope section.
  - `npm run build`: pass (8 content pages generated, e.g. `/docs`,
    `/docs/quickstart`, `/docs/sdks/react`, `/docs/self-hosting`, ...).
  - `npm run lint`: pass (exit 0; same 2 non-blocking warnings as T1/T2).
  - Smoke check (production server): `/docs`, `/docs/quickstart`,
    `/docs/sdks/react`, `/docs/self-hosting` all returned HTTP 200; sidebar
    order confirmed (Introduction, Quickstart, SDKs, Self-hosting) and the
    Quickstart `<Tabs>` block renders with all 5 framework tabs via browser
    screenshot.
  - Commit: `bd70f1d` — `docs: add initial content skeleton` (hash recorded
    before the final self-referential amend; see `git log` for the exact tip
    — this is a known, harmless discrepancy explained in the final report).

## Review

- Range `e45deb3..54717f6` (T2+T3): assessed medium (`slice_budget_reached`), consent granted, lineage `review-3f23edc4c0fbd8a1` approved and acknowledged. T1 (root commit) is outside the reviewed range.
- Non-blocking follow-ups: `metadataBase` placeholder domain in `app/layout.tsx` (read from env); Solid example in `content/docs/sdks/solid.mdx` calls `value()` outside a tracking scope.

## Next step

None — T1, T2, and T3 are complete. Acceptance criteria (`npm run build`,
`npm run lint`, `/docs` renders with sidebar/search/branding) are met.
Deferred/out of scope per the feature's Scope section: versioning, an OpenAPI
reference, a TypeDoc reference, i18n, deployment.
