import { i18nProvider } from 'fumadocs-ui/i18n';
import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { LocaleProvider } from '@/components/locale-provider';
import { translations } from '@/lib/layout.shared';
import { docsTitle, siteUrl } from '@/lib/shared';
import '../global.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: docsTitle,
    template: `%s | ${docsTitle}`,
  },
  description:
    'Documentation for Flagward: open-source feature flags with local SDK evaluation and real-time updates.',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default async function Layout({
  params,
  children,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;

  return (
    <html
      lang={lang}
      // Flagward ships one dark theme; `dark` is applied directly and
      // next-themes is disabled below, so its inline anti-flash <script>
      // (which React 19 warns about) is never rendered. The nav's theme
      // toggle is disabled too (see lib/layout.shared.tsx).
      className={`dark ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col min-h-screen">
        <LocaleProvider
          theme={{ enabled: false }}
          i18n={i18nProvider(translations, lang)}
        >
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
