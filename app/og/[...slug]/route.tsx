import { generateOGImage } from 'fumadocs-ui/og';
import { notFound } from 'next/navigation';
import { splitLocaleSlug } from '@/lib/i18n';
import { appName, getPageImageUrl } from '@/lib/shared';
import { source } from '@/lib/source';

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/[...slug]'>,
) {
  const { slug } = await params;
  // The locale (when not the default) is the leading slug segment, e.g.
  // `/og/es/quickstart/image.png` — see `getPageImageUrl` in lib/shared.ts.
  const { locale, slug: pageSlug } = splitLocaleSlug(slug);
  const page = source.getPage(pageSlug.slice(0, -1), locale);
  if (!page) notFound();

  return generateOGImage({
    title: page.data.title,
    description: page.data.description,
    site: appName,
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImageUrl(page).segments,
  }));
}
