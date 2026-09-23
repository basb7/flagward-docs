import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { i18n } from '@/lib/i18n';
import { docsContentRoute, docsRoute } from '@/lib/shared';

// Strip the trailing slash so a root `docsRoute` ('/') yields `{/*path}`.
// `*path` also swallows a leading `/es` locale segment as-is, so these
// patterns stay locale-agnostic: `/es/quickstart.md` rewrites to
// `/llms.mdx/es/quickstart/content.md`, matching how `getPageMarkdownUrl`
// (lib/shared.ts) encodes the locale for that route (outside `app/[lang]`).
const docsPrefix = docsRoute.replace(/\/$/, '');

const { rewrite: rewriteDocs } = rewritePath(
  `${docsPrefix}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsPrefix}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

// Matches the `NEXT_LOCALE` cookie name used by the landing site
// (flagward-landing) for a consistent locale cookie across properties.
const i18nMiddleware = createI18nMiddleware({
  languages: i18n.languages,
  defaultLanguage: i18n.defaultLanguage,
  hideLocale: i18n.hideLocale,
  cookieName: 'NEXT_LOCALE',
});

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const result = rewriteSuffix(request.nextUrl.pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(request.nextUrl.pathname);

    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl), {
        // this URL has two representations, selected by `Accept`
        headers: { Vary: 'Accept' },
      });
    }
  }

  return i18nMiddleware(request, event);
}

export const config = {
  // Docs are served from the site root, so keep the markdown rewrites away
  // from API, OG image, llms routes, Next.js internals, and static assets.
  matcher: [
    '/((?!api/|og/|llms\\.mdx/|llms\\.txt|llms-full\\.txt|_next/|.*\\.(?:png|ico|svg|jpg|jpeg|webp)$).*)',
  ],
};
