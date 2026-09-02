"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    const segments = pathname.split('/').filter(Boolean);
    const isLocaleInPath = locales.some(loc => loc === segments[0]);
    
    let newPath: string;
    if (isLocaleInPath) {
      segments[0] = newLocale;
      newPath = `/${segments.join('/')}`;
    } else {
      newPath = newLocale === 'en' ? pathname : `/${newLocale}${pathname}`;
    }
    
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}`;
    router.push(newPath);
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <span className="text-2xl leading-none">{localeFlags[locale]}</span>
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={`cursor-pointer ${locale === loc ? "bg-accent" : ""}`}
          >
            <span className="text-xl mr-2">{localeFlags[loc]}</span>
            <span className="flex-1">{localeNames[loc]}</span>
            {locale === loc && <span className="ml-2 text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

