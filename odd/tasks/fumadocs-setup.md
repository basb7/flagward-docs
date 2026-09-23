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
- [x] T4 — Serve docs at the site root (deployment target `docs.flagward.com`): drop the `/docs` prefix from pages, OG images, markdown routes, proxy rewrites, and content links. Route: direct inline (mechanical, already understood).
- [x] T5 — i18n infrastructure (`en` default, `es`): `defineI18n` with `hideLocale: 'default-locale'` and English fallback, `app/[lang]` routing, proxy combining i18n middleware with markdown rewrites, locale-aware search/OG/llms routes, Spanish UI translations, language switcher. Route: delegated direct (writer trigger: 2+ non-trivial files).
- [x] T6 — Spanish translations for Introduction and Quickstart (neutral professional Spanish). SDK and self-hosting pages fall back to English for now. Route: delegated direct (same writer).
- [x] T7 — Review follow-ups: redirect default-locale-prefixed markdown requests in `proxy.ts` before the rewrites (`/en/x.md`, `/en/x` + `Accept: text/markdown`); fix the Solid accessor example so it reads the flag inside a tracking scope. Route: direct inline (two small, understood edits).
- [x] T8 — Spanish translations for the remaining pages: `sdks/index`, `sdks/react`, `sdks/vue`, `sdks/solid`, `sdks/svelte`, `self-hosting` (neutral professional Spanish), plus Spanish sidebar folder titles if needed. Route: delegated direct (writer trigger: 6 non-trivial files).

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

- T4 done: docs served from the site root for `docs.flagward.com`. Moved
  `app/docs/*` into route group `app/(docs)/`, `og/docs` → `og`,
  `llms.mdx/docs` → `llms.mdx`; `docsRoute = '/'`; removed the `/` → `/docs`
  redirect; rewrote `/docs/...` content links. `proxy.ts` now derives a
  prefix-free pattern and adds a `matcher` excluding `api/`, `og/`, `llms*`,
  `_next/`, and static assets, so the `.md` suffix rewrite cannot loop on
  `/llms.mdx/.../content.md`. Dropped the `metadataBase` TODO (domain confirmed).
  - `npm run build`: pass. `npm run lint`: pass (same 2 scaffold warnings).
  - Smoke (production server): 200 on `/`, `/quickstart`, `/sdks/react`,
    `/self-hosting`, `/quickstart.md`, `/llms.mdx/quickstart/content.md`,
    `/og/quickstart/image.png`, `/llms.txt`, `/api/search`, `/logo.png`;
    `Accept: text/markdown` on `/quickstart` returns markdown; `/docs` 404 (expected,
    never deployed).

- T7 done: `proxy.ts` now redirects `/en` and `/en/...` (307, query preserved)
  to the unprefixed URL before the markdown rewrites run. `solid.mdx` accessor
  example now reads the flag inside JSX (`<Show>`), with a note that a plain
  `if (value())` in the component body runs once. The Solid README uses the
  same `if` snippet only to show `value` is a function; the docs page is where
  the prose and example contradicted each other.
  - `npm run build`: pass. `npm run lint`: pass (same 2 scaffold warnings).
  - Smoke (production server): 307 `/en/quickstart.md` → `/quickstart.md`,
    `/en/quickstart` (HTML and `Accept: text/markdown`) → `/quickstart`,
    `/en` → `/`, query string kept; 200 on `/`, `/quickstart`, `/es/quickstart`,
    `/es/sdks/react`, `.md` routes (en/es), `llms.mdx`, `og`, `llms.txt`,
    `/api/search`, `/sdks/solid`, `/logo.png`.
  - Still open: `proxy.ts` matcher exclusions are unanchored; no unit test for
    `lib/i18n.ts` helpers (no test runner); docs repo URL TODO in `lib/shared.ts`.

- Fix (dev console error "Encountered a script tag while rendering React
  component"): the inline anti-flash `<script>` came from next-themes 0.4.6
  inside Fumadocs' `RootProvider`. The theme is already fixed (static `dark`
  class, toggle disabled), so `app/[lang]/layout.tsx` now passes
  `theme={{ enabled: false }}`.
  - `npm run build`: pass. `npm run lint`: pass.
  - Browser (user's `next dev` on :3000): no console error on `/quickstart` or
    `/es/quickstart`; `<html>` keeps `dark`, black background, correct `lang`.
    Remaining dev warning: `/logo.png` `next/image` width/height aspect ratio.

- Fix (dev warning `next/image` one-sided size change on `/logo.png`): Tailwind
  preflight `height: auto` rendered the logo at 30.5px against `height={30}`
  (intrinsic 76×96). `lib/layout.shared.tsx` now pins `height: 30` with
  `width: 'auto'`. Browser: both logo instances render 24×30, warning gone
  after reload. `npm run lint`: pass.

- T8 done: `content/docs/sdks/index.es.mdx`, `sdks/react.es.mdx`,
  `sdks/vue.es.mdx`, `sdks/solid.es.mdx`, `sdks/svelte.es.mdx`, and
  `self-hosting.es.mdx` (dot-parser convention, next to their English
  source). Neutral professional Spanish (no voseo, no regional slang),
  matching `index.es.mdx`/`quickstart.es.mdx` terminology ("flag" kept as
  "flag", "Guía rápida" style); frontmatter `title`/`description`
  translated; code, identifiers, package names, commands, env var names,
  API names, file paths, JSX component names/props, and `<Tabs
  items>`/`<Tab value>` values left unchanged. The Solid page translates
  the already-fixed accessor example (`<Show when={value()}>` plus the note
  that a plain `if (value())` runs once outside a tracking scope).
  - Anchor strategy: searched every `.mdx` file (English and Spanish) for
    `#`-links and found exactly two internal cross-page anchor targets:
    `self-hosting.mdx`'s `## Creating your first flag` (linked from
    `quickstart` as `#creating-your-first-flag`) and `sdks/index.mdx`'s
    `## Live updates` (linked from `quickstart` as `#live-updates`). Both
    headings in the new Spanish pages use Fumadocs' custom heading-id
    syntax, `## Título [#id]`, to keep the English anchor
    (`## Creando tu primera flag [#creating-your-first-flag]`, `##
    Actualizaciones en vivo [#live-updates]`) — verified against the
    installed `remark-heading.js` source (`node_modules/fumadocs-core/dist/mdx-plugins/remark-heading.js`,
    regex `\s*\[#(?<slug>[^]+?)]\s*$` on the heading's trailing text node)
    rather than published docs, since a local context7 query for the syntax
    itself returned no result. `content/docs/sdks/react.mdx`'s `#app`/`#if`
    grep hits are code-block template literals (Vue/Svelte DOM ids), not
    doc links, and `self-hosting.mdx`'s `#environment-variables` points at
    the external GitHub README, not an internal page — neither needed an
    id. `index.es.mdx`/`quickstart.es.mdx` already linked
    `/es/self-hosting#creating-your-first-flag` and `/es/sdks#live-updates`
    correctly (added in T6, resolving via English fallback); no changes
    needed now that the Spanish targets exist natively.
  - `meta.es.json`: none added. `content/docs/meta.json` title "Flagward"
    and `content/docs/sdks/meta.json` title "SDKs" are both brand/product
    names with no Spanish equivalent, consistent with T6's decision that
    page titles (not `meta.json`) drive the sidebar page labels.
  - `npm run build`: pass. `npm run lint`: pass (same 2 pre-existing
    non-blocking `!important` warnings in the scaffold's scroll-lock CSS;
    Biome's `files.includes` doesn't cover `content/**`, consistent with
    T3/T6).
  - Verification (production server, `PORT=3130 npx next start`): 200 on
    `/es/sdks`, `/es/sdks/react`, `/es/sdks/vue`, `/es/sdks/solid`,
    `/es/sdks/svelte`, `/es/self-hosting`, `/es/sdks/react.md`, and English
    `/sdks/react`, `/self-hosting` (confirmed still English via `<title>`
    and body text — "Quick start"/"Creating your first flag" present, no
    Spanish leaked in). Each Spanish page's `<title>` matched its
    translated frontmatter (e.g. `Descripción general | Flagward Docs`,
    `Autoalojamiento | Flagward Docs`); `<html lang="es">` vs `lang="en"`
    confirmed. `id="creating-your-first-flag"` present in the rendered
    `/es/self-hosting`; `id="live-updates"` present in the rendered
    `/es/sdks`. `GET /api/search?query=instalar&locale=es` returned two
    matches under `/es/sdks`.
  - Commit: see git log (`docs: translate sdk and self-hosting pages to
    spanish`).

## Review

- Range `e45deb3..54717f6` (T2+T3): assessed medium (`slice_budget_reached`), consent granted, lineage `review-3f23edc4c0fbd8a1` approved and acknowledged. T1 (root commit) is outside the reviewed range.
- Non-blocking follow-ups: `metadataBase` placeholder domain in `app/layout.tsx` (read from env); Solid example in `content/docs/sdks/solid.mdx` calls `value()` outside a tracking scope.

- T5 done: i18n infrastructure (`en` default, `es`) per the current Fumadocs
  Next.js i18n guide (context7 `/fuma-nama/fumadocs`, `internationalization/next.mdx`,
  confirmed against installed `fumadocs-core`/`fumadocs-ui` types).
  - `lib/i18n.ts` (new): `defineI18n({ languages: ['en', 'es'], defaultLanguage:
    'en', hideLocale: 'default-locale' })`. `fallbackLanguage` left unset — it
    defaults to `defaultLanguage`, which is the required English fallback.
    Also exports `splitLocaleSlug`/`withLocaleSegment`, used by the `/og` and
    `/llms.mdx` route handlers (see below).
  - `lib/source.ts`: `loader({ ..., i18n })`.
  - Moved `app/layout.tsx`, `app/(docs)/layout.tsx`,
    `app/(docs)/[[...slug]]/page.tsx` under `app/[lang]/...` (route handlers —
    `api/search`, `og`, `llms.mdx`, `llms.txt`, `llms-full.txt` — stay outside,
    per the guide). Root `[lang]` layout sets `<html lang={lang}>` and passes
    `i18n={i18nProvider(translations, lang)}` to `RootProvider`; docs layout
    passes `source.getPageTree(lang)` and `baseOptions(lang)`; the page passes
    `lang` to `source.getPage`/`generateMetadata`.
  - `lib/layout.shared.tsx`: `translations = i18n.translations()
    .extend(uiTranslations()).add({ en: { displayName: 'English' }, es: {
    displayName: 'Español', ...all fumadocs-ui chrome keys } })` — neutral
    professional Spanish for every key `fumadocs-ui`'s `.translations/keys.js`
    exposes (search, pagination, page actions, 404, table of contents, etc.).
    `baseOptions` now takes `locale` (unused beyond the signature — nav title
    is the brand name, same in both languages). The language switcher needed
    no extra wiring: in this version it renders automatically from the
    `locales` fumadocs-ui derives off `translations` once `i18n={...}` reaches
    `RootProvider` (`DocsLayout`'s `i18n` prop is deprecated/optional now).
  - `proxy.ts`: kept the existing markdown-negotiation rewrites (they're
    locale-agnostic — `*path` already swallows a leading `/es`) and added
    `createI18nMiddleware({ languages, defaultLanguage, hideLocale,
    cookieName: 'NEXT_LOCALE' })` as the fallthrough, so the site-wide locale
    cookie name matches `flagward-landing`. Same `matcher` exclusions as T4.
  - `app/og/[...slug]/route.tsx` and `app/llms.mdx/[[...slug]]/route.ts`: these
    route handlers live outside `app/[lang]`, so the locale (when non-default)
    is encoded as the *first* slug segment instead of a URL prefix before the
    route name (`/llms.mdx/es/quickstart/content.md`, `/og/es/quickstart/image.png`)
    — the same pattern used in fumadocs' own Waku OG-image i18n example.
    `getPageMarkdownUrl`/`getPageImageUrl` (`lib/shared.ts`) build that via the
    new `withLocaleSegment` helper (not `createGetUrl`'s own `i18n` param,
    which prepends the locale *before* the base route — wrong direction for a
    route handler outside `[lang]`). The handlers parse it back with
    `splitLocaleSlug` and call `source.getPage(slug, locale)`.
  - `app/api/search/route.ts`: unchanged. Per the Fumadocs docs
    ("Internationalization" in `headless/search/orama.mdx`), Orama search
    supports all languages by default via Unicode word segmentation with no
    extra config — verified against the running server: `GET
    /api/search?query=flag&locale=es` returns results scoped to `/es/...`
    URLs. **Tokenizer decision: keep the `createFromSource(source)` default
    (no `localeMap`/`tokenizer` override)** — Spanish is a Latin-script
    language the default segmentation already handles; a custom tokenizer is
    documented only for languages needing different handling (e.g. CJK).
  - `llms.txt`/`llms-full.txt` (`app/llms.txt`, `app/llms-full.txt`):
    unchanged — `docsLlms.index()` already renders a section per language
    when `lang` is omitted and i18n is configured (built into `llms()`); left
    `full()` as-is too (out of scope: no acceptance check asked for a
    locale-specific `llms-full.txt`).
  - Fixed in passing: `generateStaticParams` in the `/og` and `/llms.mdx`
    routes had an inert `lang: page.locale` key (the routes have no `[lang]`
    segment, so Next.js ignored it) — dropped now that the locale is baked
    into `segments` instead.
  - Added the requested `// TODO:` above `gitConfig` in `lib/shared.ts` noting
    the docs repo URL is pending (content lives in `flagward-docs`, which has
    no remote yet); left `gitConfig` and the "Edit on GitHub" link logic
    itself untouched, as instructed.
  - `npm run build`: pass. `npm run lint`: pass (Biome auto-fixed formatting
    on the new/changed files; same 2 pre-existing non-blocking `!important`
    warnings in the scaffold's scroll-lock CSS as T1–T4).
  - Verification (production server, port 3124): 200 on `/`, `/quickstart`,
    `/sdks/react`, `/es`, `/es/quickstart`, `/es/sdks/react` (fallback),
    `/quickstart.md`, `/es/quickstart.md`, `/llms.mdx/quickstart/content.md`,
    `/llms.mdx/es/quickstart/content.md`, `/og/quickstart/image.png`,
    `/og/es/quickstart/image.png`, `/llms.txt`, `/llms-full.txt`,
    `/api/search?query=flag`, `/logo.png`. `Accept: text/markdown` on
    `/es/quickstart` returns Markdown (`# Quickstart (/es/quickstart)`).
    `/es/quickstart` HTML has `lang="es"`; `/quickstart` HTML has `lang="en"`.
    `/en/quickstart` → 307 redirect (to `/quickstart`, per `hideLocale:
    'default-locale'`).
  - Commit: see git log (`feat: add english and spanish i18n`).

- T6 done: `content/docs/index.es.mdx` and `content/docs/quickstart.es.mdx`
  (dot-parser convention, next to their English source). Neutral professional
  Spanish (no voseo, no regional slang); frontmatter `title`/`description`
  translated; code, identifiers, package names, commands, and API names left
  unchanged. Internal links rewritten to `/es/...`, including links to the
  still-untranslated `self-hosting`/`sdks` pages (`/es/self-hosting#creating-your-first-flag`,
  `/es/sdks/react`, `/es/sdks/vue`, `/es/sdks/solid`, `/es/sdks/svelte`,
  `/es/sdks#live-updates`, `/es/sdks`), which resolve via the English
  fallback. No `meta.es.json`: sidebar titles come from each page's own
  frontmatter `title`, not `meta.json`, so none was needed.
  - `npm run build`: pass. `npm run lint`: pass (same 2 pre-existing
    non-blocking warnings; Biome's `files.includes` doesn't cover `content/**`,
    so the new `.mdx` files aren't linted by it, consistent with T3).
  - Verification (production server, port 3124): 200 on `/`, `/quickstart`,
    `/sdks/react`, `/es`, `/es/quickstart`, `/es/sdks/react` (fallback, still
    200), `/quickstart.md`, `/es/quickstart.md`,
    `/llms.mdx/quickstart/content.md`, `/llms.mdx/es/quickstart/content.md`,
    `/og/quickstart/image.png`, `/og/es/quickstart/image.png`, `/llms.txt`,
    `/llms-full.txt`, `/api/search?query=flag`,
    `/api/search?query=bandera&locale=es`, `/logo.png`. `/es/quickstart` HTML:
    `lang="es"`, `<title>Guía rápida | Flagward Docs`.  `/quickstart` HTML:
    `lang="en"`. `/es/sdks/react` (untranslated, fallback): `lang="es"`,
    `<title>React | Flagward Docs` (English content, Spanish `lang`, as
    expected from `fallbackLanguage`). `/en/quickstart` → 307 redirect to
    `/quickstart`. `Accept: text/markdown` on `/es/quickstart` returns
    Spanish Markdown (`# Guía rápida (/es/quickstart)`).
  - Commit: see git log (`docs: add spanish introduction and quickstart`).

- Range `54717f6..6d7291f` (T4–T6): assessed medium (`slice_budget_reached`, 980 lines), consent granted, lineage `review-04ea7ebec8ae2adf` approved and acknowledged.
- Non-blocking follow-ups from that review: markdown rewrites in `proxy.ts` run before the i18n middleware, so `/en/<page>.md` and `/en/<page>` with `Accept: text/markdown` return 404 instead of redirecting; `splitLocaleSlug`/`withLocaleSegment` in `lib/i18n.ts` have no unit test; `proxy.ts` matcher exclusions are unanchored prefixes (a slug starting with `og`/`api` would skip the middleware).

## Next step

None — T1–T6 are complete. Acceptance criteria (`npm run build`, `npm run
lint`, docs render with sidebar/search/branding, English and Spanish both
serve) are met. Deferred/out of scope per the feature's Scope section:
versioning, an OpenAPI reference, a TypeDoc reference, deployment, and
Spanish translations for the SDK/self-hosting pages (they fall back to
English).
