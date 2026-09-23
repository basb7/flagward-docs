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
- [ ] T2 — Apply Flagward branding (dark palette, logo, favicon, nav title/links).
- [ ] T3 — Initial content skeleton sourced from real READMEs, with framework tabs for SDK examples.

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

## Next step

T2.
