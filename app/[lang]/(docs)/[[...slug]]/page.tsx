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
import { i18n, type Locale, ogLocales } from '@/lib/i18n';
import {
  docsRepo,
  docsTitle,
  getPageImageUrl,
  getPageMarkdownUrl,
} from '@/lib/shared';
import { getPageAlternates, source } from '@/lib/source';

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

  const { translated, languages, xDefault } = getPageAlternates(page.slugs);
  const requested = (page.locale ?? i18n.defaultLanguage) as Locale;

  // A fallback page (e.g. `/es/<page>` with no Spanish translation) serves
  // the default-language content, so it canonicalizes to that URL and is
  // described with the default locale instead of claiming a translation.
  const isFallback = !translated.includes(requested);
  const locale = isFallback ? (i18n.defaultLanguage as Locale) : requested;
  const canonical = isFallback ? languages[i18n.defaultLanguage] : page.url;

  const alternateLocale = translated
    .filter((lang) => lang !== locale)
    .map((lang) => ogLocales[lang as Locale]);

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical,
      languages: xDefault ? { ...languages, 'x-default': xDefault } : languages,
    },
    openGraph: {
      url: canonical,
      siteName: docsTitle,
      type: page.slugs.length === 0 ? 'website' : 'article',
      locale: ogLocales[locale],
      ...(alternateLocale.length > 0 && { alternateLocale }),
      images: getPageImageUrl(page).url,
    },
  };
}
