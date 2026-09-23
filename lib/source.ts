import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { i18n } from './i18n';
import { docsRoute } from './shared';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
  i18n,
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})

${await page.data.getText('processed')}`,
});

/**
 * Which configured languages have a *real* translation of this page.
 *
 * `source.getPage(slugs, lang)` always returns a page for a configured
 * language, even when that language has no translation: fumadocs-core
 * builds each non-default locale's file storage by inheriting the default
 * locale's files and overwriting only the ones with a real translation
 * (`createContentStorageBuilder().i18n()` in `fumadocs-core/source`), so an
 * untranslated page's `absolutePath` still points at the default
 * language's source file. Comparing `absolutePath` against the default
 * language's page is how we tell a real translation from that fallback.
 */
export function getTranslatedLanguages(slugs: string[]) {
  const defaultPage = source.getPage(slugs, i18n.defaultLanguage);

  return i18n.languages.filter((lang) => {
    if (lang === i18n.defaultLanguage) return defaultPage !== undefined;

    const page = source.getPage(slugs, lang);
    return (
      page !== undefined && page.absolutePath !== defaultPage?.absolutePath
    );
  });
}
