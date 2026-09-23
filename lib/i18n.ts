import { defineI18n } from 'fumadocs-core/i18n';

// Shared between proxy.ts (redirect) and the client locale provider
// (writing the cookie) so the name only lives in one place. Matches the
// landing site's cookie name for a consistent locale cookie across
// properties.
export const NEXT_LOCALE_COOKIE = 'NEXT_LOCALE';

export const i18n = defineI18n({
  languages: ['en', 'es'],
  defaultLanguage: 'en',
  // English has no URL prefix (`/quickstart`); Spanish is prefixed
  // (`/es/quickstart`). Untranslated Spanish pages fall back to English
  // (the `fallbackLanguage` default is `defaultLanguage`, so it doesn't
  // need to be set explicitly).
  hideLocale: 'default-locale',
});

/**
 * `/og` and `/llms.mdx` are route handlers and stay outside `app/[lang]`
 * (see the Fumadocs Next.js i18n guide). They encode the locale as the
 * first slug segment instead (e.g. `/llms.mdx/es/quickstart/content.md`),
 * so this splits an incoming catch-all slug back into `{ locale, slug }`.
 */
export function splitLocaleSlug(slug: string[] | undefined) {
  const [first, ...rest] = slug ?? [];
  const isLocalePrefix =
    first !== undefined &&
    i18n.languages.includes(first as (typeof i18n.languages)[number]) &&
    first !== i18n.defaultLanguage;

  return {
    locale: isLocalePrefix ? first : i18n.defaultLanguage,
    slug: isLocalePrefix ? rest : (slug ?? []),
  };
}

/**
 * Prefix `segments` with the locale, but only when it isn't the default
 * language (matching `hideLocale: 'default-locale'`).
 */
export function withLocaleSegment(segments: string[], locale?: string) {
  if (locale && locale !== i18n.defaultLanguage) return [locale, ...segments];
  return segments;
}
