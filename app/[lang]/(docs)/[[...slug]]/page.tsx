import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/docs/page';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import { i18n, ogLocales } from '@/lib/i18n';
import {
  docsRepo,
  docsTitle,
  getPageImageUrl,
  getPageMarkdownUrl,
} from '@/lib/shared';
import { getTranslatedLanguages, source } from '@/lib/source';

export default async function Page(props: PageProps<'/[lang]/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const MDX = page.data.body;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${docsRepo.user}/${docsRepo.repo}/blob/${docsRepo.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(
  props: PageProps<'/[lang]/[[...slug]]'>,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug, params.lang);
  if (!page) notFound();

  const locale = (page.locale ??
    i18n.defaultLanguage) as keyof typeof ogLocales;
  const translatedLanguages = getTranslatedLanguages(page.slugs);

  // Only list locales where this page really has a translation (never a
  // fallback page pointing at the English source) -- see
  // `getTranslatedLanguages` in `lib/source.ts`.
  const languages: Record<string, string> = Object.fromEntries(
    translatedLanguages.map((lang) => [
      lang,
      source.getPage(page.slugs, lang)!.url,
    ]),
  );
  languages['x-default'] = source.getPage(
    page.slugs,
    i18n.defaultLanguage,
  )!.url;

  const alternateLocale = translatedLanguages
    .filter((lang) => lang !== locale)
    .map((lang) => ogLocales[lang]);

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
      languages,
    },
    openGraph: {
      url: page.url,
      siteName: docsTitle,
      type: page.slugs.length === 0 ? 'website' : 'article',
      locale: ogLocales[locale],
      ...(alternateLocale.length > 0 && { alternateLocale }),
      images: getPageImageUrl(page).url,
    },
  };
}
