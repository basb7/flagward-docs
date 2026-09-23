import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { i18n, NEXT_LOCALE_COOKIE } from '@/lib/i18n';
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

const i18nMiddleware = createI18nMiddleware({
  languages: i18n.languages,
  defaultLanguage: i18n.defaultLanguage,
  hideLocale: i18n.hideLocale,
  cookieName: NEXT_LOCALE_COOKIE,
});

// The default locale has no URL prefix (`hideLocale: 'default-locale'`).
const defaultLocalePrefix = `/${i18n.defaultLanguage}`;

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Redirect `/en/...` to its unprefixed URL before the markdown rewrites,
  // which would otherwise treat `en` as a page slug and 404. This keeps the
  // markdown and HTML representations consistent with the i18n middleware.
  if (
    pathname === defaultLocalePrefix ||
    pathname.startsWith(`${defaultLocalePrefix}/`)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocalePrefix.length) || '/';
    return NextResponse.redirect(url);
  }

  // Persist an explicit language choice across unprefixed URLs: the
  // switcher (components/locale-provider.tsx) writes NEXT_LOCALE only when
  // the reader picks a language, so an unrecognized/absent cookie (e.g. no
  // choice made yet) leaves English untouched. Deliberately not based on
  // Accept-Language -- see odd/tasks/locale-preference.md. Checked before
  // the markdown rewrites so `.md` requests redirect consistently too
  // (e.g. `/quickstart.md` -> `/es/quickstart.md`), and after the `/en`
  // redirect above so `pathname` here is never `/en`-prefixed.
  const localeCookie = request.cookies.get(NEXT_LOCALE_COOKIE)?.value;
  if (
    localeCookie &&
    localeCookie !== i18n.defaultLanguage &&
    i18n.languages.includes(localeCookie as (typeof i18n.languages)[number])
  ) {
    const hasLocalePrefix = i18n.languages.some(
      (lang) =>
        lang !== i18n.defaultLanguage &&
        (pathname === `/${lang}` || pathname.startsWith(`/${lang}/`)),
    );
    if (!hasLocalePrefix) {
      const url = request.nextUrl.clone();
      url.pathname = `/${localeCookie}${pathname === '/' ? '' : pathname}`;
      return NextResponse.redirect(url);
    }
  }

  const result = rewriteSuffix(pathname);
  if (result) {
    return NextResponse.rewrite(new URL(result, request.nextUrl));
  }

  if (isMarkdownPreferred(request)) {
    const result = rewriteDocs(pathname);

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
