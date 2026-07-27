import Image from "next/image";
import Link from "next/link";
import { localizedPath, type Locale } from "@/i18n/locales";

interface LogoProps {
  locale: Locale;
  className?: string;
}

export function Logo({ locale, className = "" }: LogoProps) {
  return (
    <Link
      href={localizedPath(locale, "/")}
      className={`inline-flex min-h-[44px] items-center ${className}`}
      aria-label="ERS Digital Consulting"
    >
      <Image
        src="/logo/ers-logo-ghost.png"
        alt="ERS Digital Consulting"
        width={682}
        height={247}
        priority
        className="h-9 w-auto"
      />
    </Link>
  );
}
