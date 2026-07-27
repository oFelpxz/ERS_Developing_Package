"use client";

import { useState, type FormEvent } from "react";
import { Reveal, RuleDraw } from "@/components/reveal";
import { SectionHead } from "@/components/section-head";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

const WEB3FORMS_ACCESS_KEY = "YOUR_WEB3FORMS_ACCESS_KEY";

type Status = { kind: "idle" } | { kind: "pending" } | { kind: "success" } | { kind: "error"; mailto: string };

/**
 * Underlined fields rather than boxed inputs: on a ruled page, another set of
 * rectangles would fight the grid. The rule under each field *is* the grid.
 */
export function Contact({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const phoneDigits = t.contact.channels.phone.replace(/\D/g, "");
  const waDigits = t.contact.channels.whatsapp.replace(/\D/g, "");
  const addressLabel = locale === "pt" ? "Endereço" : locale === "es" ? "Dirección" : "Address";
  const phoneLabel = locale === "pt" ? "Telefone" : locale === "es" ? "Teléfono" : "Phone";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setStatus({ kind: "pending" });

    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setStatus({ kind: "success" });
        form.reset();
      } else {
        throw new Error("submit failed");
      }
    } catch {
      const body = ["name", "email", "company", "role", "message"]
        .map((k) => `${k}: ${formData.get(k) ?? ""}`)
        .join("\n");
      const mailto = `mailto:${t.contact.channels.email}?subject=${encodeURIComponent(
        "Novo contato — ERS Digital"
      )}&body=${encodeURIComponent(body)}`;
      setStatus({ kind: "error", mailto });
    }
  }

  const channels = [
    { label: "E-mail", value: t.contact.channels.email, href: `mailto:${t.contact.channels.email}` },
    { label: phoneLabel, value: t.contact.channels.phone, href: `tel:${phoneDigits}` },
    { label: "WhatsApp", value: t.contact.channels.whatsapp, href: `https://wa.me/${waDigits}`, external: true },
    { label: addressLabel, value: t.contact.channels.address },
  ];

  return (
    <section id="contact" className="section">
      <div className="shell">
        <div className="grid12">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <SectionHead index="05" kicker={t.contact.eyebrow} title={t.contact.title} lead={t.contact.subtitle} />
          </div>
        </div>

        <div className="grid12 mt-16 md:mt-24">
          {/* Form */}
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <Reveal>
              <form onSubmit={handleSubmit} noValidate={false}>
                <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
                <input type="hidden" name="subject" value="Novo contato — ERS Digital" />
                <input type="hidden" name="from_name" value="ERS Digital — Site" />
                <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />

                <div className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="name">
                      {t.contact.form.name}
                    </label>
                    <input className="field" type="text" id="name" name="name" required autoComplete="name" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="email">
                      {t.contact.form.email}
                    </label>
                    <input className="field" type="email" id="email" name="email" required autoComplete="email" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="company">
                      {t.contact.form.company}
                    </label>
                    <input className="field" type="text" id="company" name="company" autoComplete="organization" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="role">
                      {t.contact.form.role}
                    </label>
                    <input className="field" type="text" id="role" name="role" autoComplete="organization-title" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="field-label" htmlFor="message">
                      {t.contact.form.message}
                    </label>
                    <textarea className="field min-h-[120px] resize-y" id="message" name="message" required />
                  </div>
                </div>

                <div className="mt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-fg-muted">{t.contact.form.reply}</p>
                  <button type="submit" className="btn-primary" disabled={status.kind === "pending"}>
                    {t.contact.form.submit}
                    <svg
                      className="btn-arrow"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* aria-live so the outcome is announced, not just shown. */}
                <div aria-live="polite" className="mt-6 min-h-[1.25rem]">
                  {status.kind === "pending" && <p className="text-sm text-fg-muted">…</p>}
                  {status.kind === "success" && <p className="text-sm text-emerald-400">{t.contact.form.success}</p>}
                  {status.kind === "error" && (
                    <p className="text-sm text-red-400">
                      {t.contact.form.error}{" "}
                      <a href={status.mailto} className="underline underline-offset-2 hover:text-white">
                        {t.contact.form.errorFallbackCta}
                      </a>
                    </p>
                  )}
                </div>
              </form>
            </Reveal>
          </div>

          {/* Channels — a ruled index, not a stack of icon cards. */}
          <Reveal delay={120} className="col-span-4 mt-16 md:col-span-8 lg:col-span-4 lg:col-start-9 lg:mt-0">
            <RuleDraw />
            <dl>
              {channels.map((ch) => (
                <div key={ch.label} className="border-b border-white/[0.07] py-5">
                  <dt className="index-label">{ch.label}</dt>
                  <dd className="mt-2 text-sm text-white">
                    {ch.href ? (
                      <a
                        href={ch.href}
                        {...(ch.external ? { target: "_blank", rel: "noopener" } : {})}
                        className="link-row min-h-[32px] !text-white hover:!text-brand-blue-soft"
                      >
                        {ch.value}
                      </a>
                    ) : (
                      ch.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
