import type { Metadata } from "next";
import "../globals.css";
import { LocaleRootLayout } from "@/components/layout/locale-root-layout";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <LocaleRootLayout locale="en">{children}</LocaleRootLayout>;
}
