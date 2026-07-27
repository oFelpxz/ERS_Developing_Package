import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { WhatsAppFloat } from "./whatsapp-float";
import { ScrollProgress } from "./scroll-progress";
import { GridRules } from "./grid-rules";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = getDictionary(locale);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-brand-blue focus:px-4 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      {/* The drawing sheet everything is set on. */}
      <GridRules />

      <ScrollProgress />
      <Navbar locale={locale} t={t} />

      <main id="main" className="relative z-10">
        {children}
      </main>

      <Footer locale={locale} t={t} />
      <WhatsAppFloat t={t} />
    </>
  );
}
