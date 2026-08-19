import Image from "next/image";
import { Logo } from "./logo";
import { RuleDraw } from "@/components/reveal";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

/**
 * Official SAP credential badge (SAP S/4HANA Cloud Private Edition,
 * Transportation Management). Square, edge-to-edge artwork with real alpha on
 * its rounded corners — kept as PNG, not flattened to JPG, so those corners
 * stay transparent against the dark credential plate instead of showing a
 * white square. Source: assets-src/certifications/tm-badge.png.
 */
const SAP_BADGE_SRC = "/certifications/tm-badge.png";
const SAP_BADGE_SIZE = { width: 480, height: 480 };

export function Footer({ locale, t }: { locale: Locale; t: Dictionary }) {
  const year = new Date().getFullYear();
  const phoneDigits = t.contact.channels.phone.replace(/\D/g, "");
  const waDigits = t.contact.channels.whatsapp.replace(/\D/g, "");

  const columns = [
    {
      title: t.footer.columns.solutions,
      items: t.solutions.items.map((s) => ({ label: s.title, href: "#solutions" })),
    },
    {
      title: t.footer.columns.company,
      items: [
        { label: t.nav.cases, href: "#cases" },
        { label: t.nav.methodology, href: "#methodology" },
      ],
    },
    {
      title: t.footer.columns.contact,
      items: [
        { label: t.contact.channels.email, href: `mailto:${t.contact.channels.email}` },
        { label: t.contact.channels.phone, href: `tel:${phoneDigits}` },
        { label: "WhatsApp", href: `https://wa.me/${waDigits}`, external: true },
        {
          label: "LinkedIn",
          href: "https://www.linkedin.com/in/ers-digital-consulting-89491030a/",
          external: true,
        },
      ],
    },
  ];

  return (
    <footer className="relative z-10 mt-[var(--section-y)] border-t border-white/[0.07] bg-ink-950">
      <div className="shell py-20">
        <div className="grid12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Logo locale={locale} />
            <p className="measure-tight mt-5 text-sm leading-relaxed text-fg-muted">{t.footer.tagline}</p>
            {/* Credential plate — the badge is mounted, not pasted: corner
                brackets from the site's own panel language, a hairline surround,
                and enough dark inset that the white never touches the page. */}
            <div className="panel-frame credential-plate mt-10 inline-flex max-w-full items-center gap-5 p-4 pr-6">
              <Image
                src={SAP_BADGE_SRC}
                alt={t.certifications.certs[0]}
                width={SAP_BADGE_SIZE.width}
                height={SAP_BADGE_SIZE.height}
                className="credential-badge h-[68px] w-[68px] shrink-0 rounded-[3px] object-contain"
              />
              <div className="min-w-0">
                <span className="index-label block text-brand-blue-soft">{t.certifications.certsTitle}</span>
                <span className="mt-2 block text-sm leading-snug text-fg">{t.certifications.certs[0]}</span>
              </div>
            </div>
          </div>

          {columns.map((col, i) => (
            <div
              key={col.title}
              className={`col-span-4 mt-12 md:col-span-4 lg:mt-0 ${
                i === 0 ? "lg:col-span-3 lg:col-start-6" : i === 1 ? "lg:col-span-2" : "lg:col-span-2"
              }`}
            >
              <h3 className="index-label text-fg-muted">{col.title}</h3>
              <RuleDraw className="mt-4" />
              <ul className="mt-4 space-y-3">
                {col.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      {...("external" in item && item.external ? { target: "_blank", rel: "noopener" } : {})}
                      className="link-row text-sm"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-3 border-t border-white/[0.07] pt-8 md:flex-row md:items-center">
          <p className="font-mono text-index uppercase text-fg-dim">
            © {year} ERS Digital Consulting — {t.footer.rights}
          </p>
          <span className="font-mono text-index uppercase text-fg-dim">{t.footer.privacy}</span>
        </div>
      </div>
    </footer>
  );
}
