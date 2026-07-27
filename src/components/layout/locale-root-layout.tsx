import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { HTML_LANG, type Locale } from "@/i18n/locales";
import { SiteShell } from "./site-shell";

/**
 * No client-side gate here on purpose.
 *
 * Scroll reveals are hidden by CSS `@media (scripting: enabled)`, so the
 * no-JS fallback costs nothing at runtime: no inline script mutating <html>
 * (which desynced from the server markup and tripped a hydration mismatch),
 * and no <script> rendered from a component (which React never executes on
 * the client anyway).
 */
export function LocaleRootLayout({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={HTML_LANG[locale]} className={`${fontVariables} scroll-smooth`}>
      <body className="min-h-screen overflow-x-hidden antialiased">
        <SiteShell locale={locale}>{children}</SiteShell>
      </body>
    </html>
  );
}
