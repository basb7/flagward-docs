# Feature: locale-preference

## Objective

Remember the reader's language choice: after picking Spanish in the language switcher, unprefixed URLs (e.g. `/quickstart`) open the Spanish version (`/es/quickstart`).

## Problem / Why

Today the locale lives only in the URL. With `hideLocale: 'default-locale'`, the Fumadocs i18n middleware treats every unprefixed path as English and ignores both the `NEXT_LOCALE` cookie and `Accept-Language`; the language switcher navigates with `router.push` and stores nothing. A reader who chose Spanish lands on English whenever they follow an unprefixed link.

## Scope

- Set the `NEXT_LOCALE` cookie only when the reader explicitly picks a language in the switcher (both `es` and `en`).
- In `proxy.ts`, redirect unprefixed paths to the same path under `/es` when `NEXT_LOCALE=es`.

Out of scope: `Accept-Language` auto-detection (deliberately rejected: it would force Spanish on readers whose browser is Spanish but who read technical docs in English); sharing the cookie with `flagward-landing` across subdomains.

## Constraints

- Cookie name `NEXT_LOCALE` (same as the landing). `path=/`, `SameSite=Lax`, one-year `max-age`.
- No cookie → current behavior unchanged (English at unprefixed URLs).
- Choosing English in the switcher must stick (cookie `en`, no redirect).
- Crawlers send no cookies, so indexing of both locales is unaffected.
- Keep existing behavior: `/en/...` → unprefixed redirect, markdown rewrites, matcher exclusions.

## Tasks

- [x] T1 — Persist the switcher choice in `NEXT_LOCALE` and redirect unprefixed paths to `/es` when it is `es`. Route: delegated direct (writer trigger: client provider wrapper + proxy + layout).

## Acceptance criteria

- `curl -H 'Cookie: NEXT_LOCALE=es' /quickstart` → 307 to `/es/quickstart`; without the cookie or with `en` → 200 English.
- Browser: pick Español → cookie set; open `/quickstart` → lands on `/es/quickstart`. Pick English → cookie `en`; `/quickstart` stays English.
- `npm run build` and `npm run lint` pass.

## Checks

- TDD: enabled by global config, but the project has no test runner; verified functionally (curl + browser).
- RDD: on (global). Assess the work-unit commit.

## Routing

| Task | Route | Trigger evidence |
| --- | --- | --- |
| T1 | delegated direct (one writer) | Writer trigger: 2+ non-trivial files |

## Progress

- Branch `feat/locale-preference` created from `main` (`3c41202`).
- T1 implemented:
  - `lib/i18n.ts` — exported `NEXT_LOCALE_COOKIE = 'NEXT_LOCALE'`, used by both `proxy.ts` and the new client provider so the name lives in one place.
  - `components/locale-provider.tsx` (new, `'use client'`) — wraps `RootProvider` and supplies `onLocaleChange`: writes the cookie (`path=/; max-age=31536000; SameSite=Lax`, `Secure` added only over HTTPS) then reproduces fumadocs-ui's default `I18nProvider` `onChange` path logic (read from `node_modules/fumadocs-ui/dist/contexts/i18n.js`) using `next/navigation`'s `usePathname`/`useRouter` — the same hooks `fumadocs-core/framework/next.js`'s `NextProvider` feeds into `FrameworkProvider`. (`fumadocs-core/framework`'s hooks were tried first but they throw "You need to wrap your application inside `FrameworkProvider`" when called above `RootProvider`, since that context is only established inside it — `next/navigation` avoids the ordering problem.)
  - `app/[lang]/layout.tsx` — renders `<LocaleProvider>` instead of `<RootProvider>` directly (a server component can't hand a client component a function prop, hence the wrapper).
  - `proxy.ts` — after the existing `/en` redirect and before the markdown rewrites: if the path has no locale prefix and the `NEXT_LOCALE` cookie is a known non-default language, 307-redirect to the same path prefixed with that locale (root `/` → `/es`, query string preserved via `URL.clone()`). Unknown/absent/`en` cookie values fall through unchanged. Checked against `i18n.languages`/`i18n.defaultLanguage` rather than hardcoding `es`.
  - `.md` paths: the redirect runs before `rewriteSuffix`, so `/quickstart.md` with `NEXT_LOCALE=es` redirects to `/es/quickstart.md` (verified by curl), which the markdown rewrite then handles the same way it already handles any `/es/...` path (locale-agnostic `*path` swallow) — no special-casing needed.
- Verification (production server on :3140, `PORT=3140 npx next start`, stopped after):
  - `npm run build`: pass. `npm run lint` (biome check): pass, exit 0 (3 pre-existing/expected warnings: 2 in `app/global.css`, 1 `noDocumentCookie` on the intentional direct cookie write in `locale-provider.tsx`).
  - curl: no cookie `/quickstart` → 200 `lang="en"`; cookie `en` → 200; cookie `es` → 307 `Location: /es/quickstart`; cookie `es` `/` → 307 `/es`; cookie `es` `/sdks/react?x=1` → 307 `/es/sdks/react?x=1`; cookie `es` `/es/quickstart` → 200 (no loop); cookie `fr` → 200 English.
  - curl `.md`: cookie `es` `/quickstart.md` → 307 `/es/quickstart.md`; no cookie `/quickstart.md` → 200 English markdown.
  - Regression: `/en/quickstart` → 307 `/quickstart`; `/api/search?query=flag` → 200; `/og/quickstart/image.png` → 200; `/llms.txt` → 200; `Accept: text/markdown` on `/es/quickstart` → 200 Spanish markdown.
  - `curl -o /dev/null -w '%{http_code}' http://localhost:3000/quickstart` (user's dev server, untouched) → 200.
  - Browser (dev server, :3000, Claude Browser tools): `/quickstart` → opened language popover, chose Español → URL `/es/quickstart`, `document.cookie` contains `NEXT_LOCALE=es`; navigated to `/sdks/react` → landed on `/es/sdks/react`; chose English → URL `/sdks/react`, cookie `NEXT_LOCALE=en`; navigated to `/quickstart` → stayed English. Left in English state (no reset needed).
- Commit: `feat: remember the reader's language choice` on `feat/locale-preference`.

## Review

- Range `3c41202..a67566c`: assessed medium (under budget, 164 lines); the stop hook required review, consent granted, lineage `review-fa0a16725f029a2e` approved and acknowledged.
- Non-blocking follow-ups: no automated tests for the proxy cookie redirect or the copied switcher path logic (no test runner); possible Next.js client router cache serving a prefetched cookie-es 307 after switching to English (not reproduced in the browser check); cookie-dependent responses carry no `Vary: Cookie` / cache-control, which matters if a shared cache/CDN is added.
- Checked the non-doc-route concern: with `NEXT_LOCALE=es`, `/api/search`, `/og/...`, `/llms.txt`, `/llms-full.txt`, `/llms.mdx/...`, `/logo.png`, `/favicon.ico` all return 200 (excluded by the matcher, no redirect).

## Next step

None — T1 (the only task) is done. Delivery (push/PR) is the user's decision.
