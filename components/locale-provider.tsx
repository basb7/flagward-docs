'use client';

import {
  RootProvider,
  type RootProviderProps,
} from 'fumadocs-ui/provider/next';
import { usePathname } from 'next/navigation';
import { NEXT_LOCALE_COOKIE } from '@/lib/i18n';

type LocaleProviderProps = RootProviderProps & {
  i18n: NonNullable<RootProviderProps['i18n']>;
};

/**
 * Wraps `RootProvider` to persist the reader's explicit language choice.
 *
 * `RootProvider`'s `i18n` prop only accepts data (no `onLocaleChange`) when
 * built in a server component, since a function can't cross the server ->
 * client boundary as a prop. This client component receives the same
 * serializable `i18n` data and adds the handler here instead.
 */
export function LocaleProvider({ i18n, ...props }: LocaleProviderProps) {
  const pathname = usePathname();

  const onLocaleChange = (value: string) => {
    // Cookie is written only on this explicit switcher action -- never from
    // Accept-Language -- so a Spanish-browser reader who reads the docs in
    // English isn't silently redirected (see odd/tasks/locale-preference.md).
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${NEXT_LOCALE_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax${secure}`;

    // Reproduce fumadocs-ui's default `I18nProvider` `onChange` path logic
    // (fumadocs-ui/dist/contexts/i18n.js) verbatim: providing our own
    // `onLocaleChange` replaces that default entirely, so we still have to
    // compute the same target path ourselves.
    const { locale, defaultLanguage, hideLocale } = i18n;
    let path = pathname;
    if (
      hideLocale === 'never' ||
      (hideLocale === 'default-locale' && locale !== defaultLanguage)
    ) {
      const end = pathname.indexOf('/', 1);
      path = end === -1 ? '/' : pathname.slice(end);
    }
    if (hideLocale !== 'default-locale' || value !== defaultLanguage) {
      path = `/${value}${path === '/' ? '' : path}`;
    }
    // Hard navigation instead of `router.push`: the client router cache may
    // hold a response prefetched under the previous cookie (e.g. the proxy's
    // 307 to `/es`), which would undo an English choice. A full request goes
    // through `proxy.ts` with the new cookie.
    window.location.assign(path);
  };

  return <RootProvider {...props} i18n={{ ...i18n, onLocaleChange }} />;
}
