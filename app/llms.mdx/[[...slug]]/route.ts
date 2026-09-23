import { notFound } from 'next/navigation';
import { splitLocaleSlug } from '@/lib/i18n';
import { getPageMarkdownUrl } from '@/lib/shared';
import { docsLlms, source } from '@/lib/source';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/llms.mdx/[[...slug]]'>,
) {
  const { slug } = await params;
  // The locale (when not the default) is the leading slug segment, e.g.
  // `/llms.mdx/es/quickstart/content.md` — see `getPageMarkdownUrl` in
  // lib/shared.ts.
  const { locale, slug: pageSlug } = splitLocaleSlug(slug);
  const page = source.getPage(pageSlug.slice(0, -1), locale);
  if (!page) notFound();

  return new Response(await docsLlms.page(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
}
