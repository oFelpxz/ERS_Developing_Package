import pt from "./dictionaries/pt.json";
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";
import type { Locale } from "./locales";

const dictionaries = { pt, en, es } satisfies Record<Locale, typeof pt>;

export type Dictionary = typeof pt;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
