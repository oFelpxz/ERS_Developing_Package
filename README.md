# ERS Digital — Site Institucional (React)

Reconstrução do site institucional da ERS Digital Consulting em Next.js 16 (App Router) + TypeScript + Tailwind CSS v4, substituindo a versão anterior em Astro (`../ERS Site`).

## Stack

- **Next.js 16** (App Router, Turbopack, static export) — `output: 'export'` gera um site 100% estático em `out/`, hospedável em qualquer CDN/Vercel
- **React 19** + **TypeScript**
- **Tailwind CSS v4** — tokens de design via `@theme` em `src/app/globals.css`
- **next/font** — Inter, Space Grotesk e JetBrains Mono self-hosted (sem chamada externa ao Google Fonts)
- **cobe** — globo 3D (canvas) na Hero
- **Web3Forms** — formulário de contato client-side, sem backend
- i18n PT (padrão, sem prefixo) · EN (`/en`) · ES (`/es`), com hreflang/canonical automáticos via `generateMetadata`

## Estrutura

```
src/
├── app/
│   ├── (pt)/          # rota "/" — root layout + página em português
│   ├── en/            # rota "/en"
│   ├── es/            # rota "/es"
│   └── globals.css    # tokens Tailwind v4 + estilos custom
├── components/
│   ├── layout/        # Navbar, Footer, Logo, ScrollProgress, WhatsAppFloat, SiteShell
│   ├── sections/       # Hero, About, Indicators, Solutions, Methodology, Cases, ClientsMarquee, Certifications, FAQ, Contact
│   ├── globe/          # LogisticsGlobe (cobe)
│   └── reveal.tsx      # wrapper de scroll-reveal (IntersectionObserver)
├── hooks/              # use-count-up
├── i18n/               # locales.ts + dictionaries (pt/en/es .json) + dictionaries.ts
└── lib/                # fonts.ts, seo.ts, globe-data.ts
```

Cada idioma tem seu próprio `layout.tsx` (root layout separado, convenção de "multiple root layouts" do App Router) porque PT não tem prefixo de URL enquanto EN/ES têm — mesma regra de roteamento do site Astro original.

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:3001
```

## Build

```bash
npm run build     # gera ./out/ (export estático)
```

## Editar conteúdo

Quase todo o texto está em `src/i18n/dictionaries/{pt,en,es}.json`.

## Antes do go-live

1. **Web3Forms** — trocar `YOUR_WEB3FORMS_ACCESS_KEY` em `src/components/sections/contact.tsx` pela access key real.
2. **Domínio** — atualizar `SITE_URL` em `src/lib/seo.ts`.
3. **Logos de clientes** — hoje em `public/clients/`; adicionar/remover conforme necessário em `src/components/sections/clients-marquee.tsx`.

## Deploy na Vercel

A Vercel detecta Next.js automaticamente (build `next build`, output `out/` via `output: 'export'`). Basta importar o repositório em [vercel.com/new](https://vercel.com/new).
