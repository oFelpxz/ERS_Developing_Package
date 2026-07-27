"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";
import type { Dictionary } from "@/i18n/dictionaries";
import { LOCALES, LOCALE_LABEL, localizedPath, type Locale } from "@/i18n/locales";

const LOCALE_FLAG: Record<Locale, string> = {
  pt: '<rect width="20" height="14" rx="2" fill="#009B3A"/><polygon points="10,2 18,7 10,12 2,7" fill="#FEDD00"/><circle cx="10" cy="7" r="3" fill="#002776"/>',
  en: '<rect width="20" height="14" rx="2" fill="#B22234"/><rect y="1.1" width="20" height="1.1" fill="#fff"/><rect y="3.2" width="20" height="1.1" fill="#fff"/><rect y="5.4" width="20" height="1.1" fill="#fff"/><rect y="7.5" width="20" height="1.1" fill="#fff"/><rect y="9.7" width="20" height="1.1" fill="#fff"/><rect y="11.8" width="20" height="1.1" fill="#fff"/><rect width="8" height="7.5" fill="#3C3B6E"/>',
  es: '<rect width="20" height="14" rx="2" fill="#AA151B"/><rect y="3.5" width="20" height="7" fill="#F1BF00"/>',
};

function FlagIcon({ locale }: { locale: Locale }) {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 20 14"
      className="shrink-0 rounded-[2px]"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: LOCALE_FLAG[locale] }}
    />
  );
}

export function Navbar({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);

  const links = [
    { href: "#solutions", label: t.nav.solutions },
    { href: "#methodology", label: t.nav.methodology },
    { href: "#cases", label: t.nav.cases },
    { href: "#contact", label: t.nav.contact },
  ];

  const otherLocales = LOCALES.filter((l) => l !== locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setLangOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("click", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        data-scrolled={scrolled || undefined}
        className="border-b border-transparent transition-colors duration-[320ms] data-[scrolled]:border-white/[0.07] data-[scrolled]:bg-ink-950/80 data-[scrolled]:backdrop-blur-xl"
      >
        <div className="shell flex h-16 items-center justify-between md:h-20">
          <Logo locale={locale} />

          {/* Indexed nav — the same manifest language as the sections. */}
          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {links.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                className="group flex min-h-[44px] items-center gap-2 text-sm text-fg-muted transition-colors duration-[180ms] hover:text-white"
              >
                <span className="index-label tnum transition-colors duration-[180ms] group-hover:text-brand-blue-soft">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <div className="relative" ref={langRef}>
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={langOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setLangOpen((v) => !v);
                }}
                className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 font-mono text-index uppercase text-fg-muted transition-colors duration-[180ms] hover:text-white"
              >
                <FlagIcon locale={locale} />
                {locale.toUpperCase()}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className={`transition-transform duration-[180ms] ${langOpen ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <div
                className={`absolute right-0 top-full pt-3 transition-opacity duration-[180ms] ${
                  langOpen ? "visible opacity-100" : "invisible opacity-0"
                }`}
              >
                <div className="min-w-[168px] border border-white/10 bg-ink-850/95 backdrop-blur-xl">
                  {otherLocales.map((l) => (
                    <Link
                      key={l}
                      href={localizedPath(l, "/")}
                      className="flex min-h-[44px] items-center gap-3 px-4 text-xs text-fg-muted transition-colors duration-[180ms] hover:bg-white/5 hover:text-white"
                    >
                      <FlagIcon locale={l} />
                      {LOCALE_LABEL[l]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <a href="#contact" className="btn-primary !py-2.5 text-xs">
              {t.nav.cta}
            </a>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="relative inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-white/10 text-fg lg:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
              className={`absolute transition-opacity duration-[180ms] ${mobileOpen ? "opacity-0" : "opacity-100"}`}
            >
              <path d="M4 8h16M4 16h16" />
            </svg>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              aria-hidden="true"
              className={`absolute transition-opacity duration-[180ms] ${mobileOpen ? "opacity-100" : "opacity-0"}`}
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 top-16 overflow-y-auto bg-ink-950/98 backdrop-blur-xl transition-opacity duration-[320ms] lg:hidden ${
          mobileOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav className="shell flex flex-col pt-6 pb-16" aria-label="Mobile">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-baseline gap-4 border-b border-white/[0.07] py-5 text-xl font-medium text-fg"
            >
              <span className="index-label tnum text-brand-blue-soft">{String(i + 1).padStart(2, "0")}</span>
              {l.label}
            </a>
          ))}

          <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.07] py-6">
            {LOCALES.map((l) =>
              l === locale ? (
                <span
                  key={l}
                  className="inline-flex min-h-[44px] items-center gap-2 border border-brand-blue px-4 py-2 font-mono text-index uppercase text-white"
                >
                  <FlagIcon locale={l} />
                  {LOCALE_LABEL[l]}
                </span>
              ) : (
                <Link
                  key={l}
                  href={localizedPath(l, "/")}
                  className="inline-flex min-h-[44px] items-center gap-2 border border-white/10 px-4 py-2 font-mono text-index uppercase text-fg-muted transition-colors duration-[180ms] hover:border-white/30 hover:text-white"
                >
                  <FlagIcon locale={l} />
                  {LOCALE_LABEL[l]}
                </Link>
              )
            )}
          </div>

          <a href="#contact" onClick={() => setMobileOpen(false)} className="btn-primary mt-8 justify-center">
            {t.nav.cta}
          </a>
        </nav>
      </div>
    </header>
  );
}
