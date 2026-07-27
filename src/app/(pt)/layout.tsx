import type { Metadata } from "next";
import "../globals.css";
import { LocaleRootLayout } from "@/components/layout/locale-root-layout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("pt");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LocaleRootLayout locale="pt">{children}</LocaleRootLayout>;
}
