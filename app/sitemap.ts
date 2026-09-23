import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/shared';
import { getPageAlternates, source } from '@/lib/source';

// One entry per page per locale it is really translated into, each with
// the same hreflang cluster as the page metadata (`getPageAlternates` in
// `lib/source.ts`). Fallback URLs (a locale serving default-language
// content) are left out: they canonicalize to the default-language page. No
// `lastModified`: the content source (MDX files) carries no reliable
// last-changed date, and a build-time `new Date()` would just churn every
// entry on every deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  return source.getLanguages().flatMap(({ language, pages }) =>
    pages.flatMap((page) => {
      const { translated, languages, xDefault } = getPageAlternates(page.slugs);
      if (!(translated as string[]).includes(language)) return [];

      const absolute: Record<string, string> = Object.fromEntries(
        Object.entries(languages).map(([lang, url]) => [
          lang,
          `${siteUrl}${url}`,
        ]),
      );
      if (xDefault) absolute['x-default'] = `${siteUrl}${xDefault}`;

      return [
        { url: `${siteUrl}${page.url}`, alternates: { languages: absolute } },
      ];
    }),
  );
}
