import { createGetUrl } from 'fumadocs-core/source';
import { withLocaleSegment } from './i18n';

export const appName = 'Flagward';
export const docsTitle = 'Flagward Docs';
export const siteUrl = 'https://docs.flagward.com';
export const docsRoute = '/';
export const docsImageRoute = '/og';
export const docsContentRoute = '/llms.mdx';

// The product repository, linked from the nav.
export const productRepo = {
  user: 'basb7',
  repo: 'flagward',
};

// This site's own repository, used for "Edit on GitHub" links.
export const docsRepo = {
  user: 'basb7',
  repo: 'flagward-docs',
  branch: 'main',
};

// `/llms.mdx` and `/og` are route handlers outside `app/[lang]`, so the
// locale (when not the default) is encoded as the first slug segment
// instead of a URL prefix before the route name — see `lib/i18n.ts`.
const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = withLocaleSegment(
    [...page.slugs, 'content.md'],
    page.locale,
  );

  return { segments, url: getContentUrl(segments) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = withLocaleSegment([...page.slugs, 'image.png'], page.locale);

  return { segments, url: getImageUrl(segments) };
}
