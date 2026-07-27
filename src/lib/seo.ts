import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { HTML_LANG, LOCALES, localizedPath, OG_LOCALE, type Locale } from "@/i18n/locales";

export const SITE_URL = "https://ersdigital.com.br";

export function buildMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);

  const languages = Object.fromEntries(
    LOCALES.map((l) => [HTML_LANG[l], localizedPath(l, "/")])
  );

  return {
    metadataBase: new URL(SITE_URL),
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: localizedPath(locale, "/"),
      languages,
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      locale: OG_LOCALE[locale],
      url: localizedPath(locale, "/"),
    },
    icons: {
      icon: "/favicon.png",
    },
  };
}
