# Feature: seo

## Objective

Complete the SEO metadata of the docs site for a bilingual (en/es) setup: language alternates, canonical URLs, sitemap, robots, and full Open Graph tags.

## Problem / Why

Per-page title, description, OG image and Twitter card already exist, but the rendered `<head>` has no `hreflang` alternates, no canonical, no `og:url`/`og:locale`/`og:site_name`/`og:type`, and `/sitemap.xml` and `/robots.txt` return 404. Without alternates, search engines can't pair `/quickstart` with `/es/quickstart`, and may show the wrong language or treat them as duplicates.

## Scope

- Per-page `alternates`: `canonical` (self), `languages` for `en`, `es` and `x-default` (→ English URL), only for locales where the page actually exists (no alternate pointing at a fallback page).
- Open Graph: `url`, `siteName`, `type: 'article'` for doc pages (`website` for the index), `locale` + `alternateLocale`.
- `app/sitemap.ts`: every page in every locale, with `alternates.languages`.
- `app/robots.ts`: allow all, point at the sitemap.
- `proxy.ts` matcher: exclude `robots.txt` and `sitemap.xml`.
- One `siteUrl` constant reused by `metadataBase`, sitemap and robots.

Out of scope: structured data (JSON-LD), analytics, Search Console setup.

## Constraints

- Site URL `https://docs.flagward.com`.
- OG locales: `en_US` and `es_ES` (OG requires `language_TERRITORY`; neutral Spanish content, `es_ES` as the conventional default).
- English URLs have no prefix; Spanish under `/es`.
- Keep existing behavior (redirects, markdown rewrites, cookie redirect, OG images).

## Tasks

- [x] T1 — Alternates, canonical, OG fields, sitemap, robots, matcher exclusions. Route: delegated direct (writer trigger: 2+ non-trivial files).

## Acceptance criteria

- `/quickstart` and `/es/quickstart` `<head>` contain `canonical`, `hreflang` en/es/x-default, `og:url`, `og:locale`, `og:locale:alternate`, `og:site_name`, `og:type`.
- `/sitemap.xml` 200 with all en + es pages and `xhtml:link` alternates; `/robots.txt` 200 with `Sitemap:`.
- Both still 200 with `NEXT_LOCALE=es` (no redirect).
- `npm run build`, `npm run lint` pass.

## Checks

- TDD: enabled by global config, no test runner in the project; verified functionally (rendered head, curl).
- RDD: on (global). Assess the work-unit commit.

## Routing

| Task | Route | Trigger evidence |
| --- | --- | --- |
| T1 | delegated direct (one writer) | Writer trigger: page metadata, sitemap, robots, proxy, shared config |

## Progress

- Branch `feat/seo` created from `main` (`f8cb964`).
- T1 done. Changed: `lib/shared.ts` (`siteUrl`, `docsTitle`), `lib/i18n.ts` (`Locale` type, `ogLocales` map), `lib/source.ts` (`getTranslatedLanguages`), `app/[lang]/layout.tsx` (`metadataBase`/title use the new constants), `app/[lang]/(docs)/[[...slug]]/page.tsx` (`alternates`, full OG fields in `generateMetadata`), `app/sitemap.ts` (new), `app/robots.ts` (new), `proxy.ts` (matcher excludes `robots.txt`/`sitemap.xml`).
- Real-translation detection: `source.getPage(slugs, lang)` always returns a page object for a configured language, even without a translation — fumadocs-core's `createContentStorageBuilder().i18n()` builds each non-default locale's file storage by inheriting the default locale's files, so an untranslated page's `absolutePath` still points at the default-language source file. `getTranslatedLanguages` compares `absolutePath` against the default-language page to tell a real translation from that fallback. Confirmed by reading `node_modules/fumadocs-core/dist/dynamic-CSrl9w26.js` (storage builder + indexer) and `fumadocs-mdx/dist/runtime/server.js` (`absolutePath: entry.info.fullPath`).
- `lastModified` omitted from `app/sitemap.ts`: no reliable last-changed date source (MDX files carry none), and `new Date()` at build time would churn every entry on every deploy.
- `changeFrequency`/`priority` omitted from sitemap entries (not meaningful here, per constraints).
- Verification (production build, `PORT=3150 npx next start`):
  - `npm run build`: success. `npm run lint`: passes (formatter auto-fixed one file; 5 pre-existing warnings/1 info unrelated to this change, e.g. `noImportantStyles` in `global.css`, `noDocumentCookie` in `locale-provider.tsx`).
  - `/quickstart`, `/es/quickstart`, `/`, `/es`: `canonical`, `hreflang` en/es/x-default (absolute `https://docs.flagward.com/...`), `og:url`, `og:locale`, `og:locale:alternate`, `og:site_name`, `og:type` (`article` for quickstart, `website` for index), `og:title`/`og:description` all present.
  - `/sitemap.xml`: 200, 16 `<url>` entries (8 pages × 2 locales), each with `xhtml:link` alternates. `/robots.txt`: 200 with `Sitemap: https://docs.flagward.com/sitemap.xml`.
  - With `Cookie: NEXT_LOCALE=es`: `/robots.txt` and `/sitemap.xml` still 200 (no redirect); `/quickstart` still 307 → `/es/quickstart`.
  - Regression: `/en/quickstart` 307 → `/quickstart`; `/api/search?query=flag` 200; `/og/quickstart/image.png` 200; `/quickstart.md` 200.
  - Dev server on `:3000` (untouched, still running): `/quickstart` 200.
- Commit `feat: add hreflang alternates, sitemap, robots and open graph fields` on `feat/seo`. No push, no PR (per instructions).

## Review

- Range `f8cb964..1fe363c`: medium (under budget, 198 lines), consent granted, lineage `review-4e39e5265a1a4bd7` approved and acknowledged.
- Non-blocking follow-ups (latent today: every page exists in both locales):
  - A page that exists only in `es` would crash `generateMetadata` (non-null assertion on the default-language page for `x-default`) and emit an `undefined` URL in the sitemap.
  - Fallback pages (`/es/<page>` serving English content) are self-canonical with `og:locale=es_ES` and appear in the sitemap outside their own hreflang cluster; they should canonicalize to the English URL (and be left out of the sitemap).
  - `getTranslatedLanguages` relies on a fumadocs internal (`absolutePath` of fallback storage) with no automated test.
  - `robots.txt`/`sitemap.xml` matcher exclusions are unanchored prefixes (same as the existing `llms.txt` entry).

## Next step

Feature complete; ready for the user to review/push `feat/seo`.
