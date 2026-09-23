import { createGetUrl } from 'fumadocs-core/source';
import { withLocaleSegment } from './i18n';

export const appName = 'Flagward';
export const docsRoute = '/';
export const docsImageRoute = '/og';
export const docsContentRoute = '/llms.mdx';

// TODO: the docs repo URL is pending (this content currently lives in
// flagward-docs, which has no remote yet); update once it does.
export const gitConfig = {
  user: 'basb7',
  repo: 'flagward',
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
