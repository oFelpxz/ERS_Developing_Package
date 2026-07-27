import { Hero } from "@/components/sections/hero";
import { Solutions } from "@/components/sections/solutions";
import { Methodology } from "@/components/sections/methodology";
import { Cases } from "@/components/sections/cases";
import { ClientsMarquee } from "@/components/sections/clients-marquee";
import { Contact } from "@/components/sections/contact";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <>
      <Hero t={t} />
      <Solutions locale={locale} t={t} />
      <Methodology t={t} />
      <Cases locale={locale} t={t} />
      <ClientsMarquee t={t} />
      <Contact locale={locale} t={t} />
    </>
  );
}
