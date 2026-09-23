import type { MetadataRoute } from 'next';
import { i18n } from '@/lib/i18n';
import { siteUrl } from '@/lib/shared';
import { getTranslatedLanguages, source } from '@/lib/source';

// One entry per page per locale (including English-fallback pages, which
// are still real, crawlable URLs), each with hreflang alternates limited to
// its actual translations plus `x-default` -- see
// `getTranslatedLanguages` in `lib/source.ts`. No `lastModified`: the
// content source (MDX files) carries no reliable last-changed date, and a
// build-time `new Date()` would just churn every entry on every deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  return source.getLanguages().flatMap(({ pages }) =>
    pages.map((page) => {
      const languages: Record<string, string> = Object.fromEntries(
        getTranslatedLanguages(page.slugs).map((lang) => [
          lang,
          `${siteUrl}${source.getPage(page.slugs, lang)?.url}`,
        ]),
      );
      languages['x-default'] =
        `${siteUrl}${source.getPage(page.slugs, i18n.defaultLanguage)?.url}`;

      return {
        url: `${siteUrl}${page.url}`,
        alternates: { languages },
      };
    }),
  );
}
