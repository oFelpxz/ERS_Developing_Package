export type Locale = "pt" | "en" | "es";

export const LOCALES: Locale[] = ["pt", "en", "es"];
export const DEFAULT_LOCALE: Locale = "pt";

export const LOCALE_LABEL: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

export const HTML_LANG: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en",
  es: "es",
};

export const OG_LOCALE: Record<Locale, string> = {
  pt: "pt_BR",
  en: "en_US",
  es: "es_ES",
};

/** pt is unprefixed (default), en/es are prefixed — matches the previous Astro routing. */
export function localizedPath(locale: Locale, path: string = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const base = clean === "/" ? "" : clean;
  return locale === DEFAULT_LOCALE ? base || "/" : `/${locale}${base}`;
}
