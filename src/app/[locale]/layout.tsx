import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "../globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { locales } from '@/i18n/config';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SQLite Editor Online - Free Web-Based SQLite Database Editor",
  description: "Edit SQLite databases online for free. A powerful web-based SQLite editor with features like table management, SQL query execution, and data export. No installation required. Perfect for developers and database administrators.",
  keywords: "sqlite editor online, edit sqlite online, sqlite database editor, sqlite web editor, online sqlite editor, sqlite online database editor, sqlite browser online, sqlite viewer online, sqlite database viewer, sqlite query editor, sqlite table editor, sqlite database management, sqlite online tool, sqlite web app, free sqlite editor, sql browser",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "SQLite Editor Online - Free Web-Based SQLite Database Editor",
    description: "Edit SQLite databases online for free. A powerful web-based SQLite editor with features like table management, SQL query execution, and data export. Perfect for developers and database administrators.",
    url: "https://www.sqleditor.online",
    siteName: "SQLite Editor Online",
    images: [
      {
        url: "https://www.sqleditor.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "SQLite Editor Online - Free Web-Based SQLite Database Editor",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQLite Editor Online - Free Web-Based SQLite Database Editor",
    description: "Edit SQLite databases online for free. A powerful web-based SQLite editor with features like table management, SQL query execution, and data export. Perfect for developers and database administrators.",
    images: ["https://www.sqleditor.online/og-image.png"],
    creator: "@sqleditor",
    site: "@sqleditor",
  },
  alternates: {
    languages: {
      'en-US': 'https://www.sqleditor.online',
      'zh-CN': 'https://www.sqleditor.online/zh',
      'ru-RU': 'https://www.sqleditor.online/ru',
      'vi-VN': 'https://www.sqleditor.online/vi',
      'de-DE': 'https://www.sqleditor.online/de',
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "oR1GRHiApy1o3X2ntLqEIGOgRCkRfdF8_iJBq8PC9zQ",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Fix for pointer-events issue */}
        <Script id="pointer-events-fix">
          {`
            // Function to reset pointer-events on the body
            function resetPointerEvents() {
              document.body.style.pointerEvents = 'auto';
            }
            
            // Run on initial load
            document.addEventListener('DOMContentLoaded', resetPointerEvents);
            
            // Also run periodically to catch any issues
            setInterval(resetPointerEvents, 1000);
            
            // Run when any dialog or modal might close
            document.addEventListener('click', function() {
              setTimeout(resetPointerEvents, 100);
            });
          `}
        </Script>
        
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-17050259656" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17050259656');
          `}
        </Script>
        
        {/* Google AdSense */}
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2917337706488166"
          crossOrigin="anonymous"
        />
        
        {/* Structured Data for Web Application */}
        <Script id="structured-data" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "SQLite Editor Online",
              "url": "https://www.sqleditor.online",
              "description": "A free web-based SQLite database editor with features like table management, SQL query execution, and data export.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Table Management",
                "SQL Query Execution",
                "Data Export",
                "Interactive Table Viewer",
                "SQL CLI"
              ]
            }
          `}
        </Script>
        {/* Structured Data for Organization */}
        <Script id="organization-data" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SQLite Editor Online",
              "url": "https://www.sqleditor.online",
              "logo": "https://www.sqleditor.online/logo.png",
              "sameAs": [
                "https://twitter.com/sqleditor",
                "https://github.com/sqleditor"
              ]
            }
          `}
        </Script>
        {/* Structured Data for BreadcrumbList */}
        <Script id="breadcrumb-data" type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.sqleditor.online"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Blog",
                  "item": "https://www.sqleditor.online/blog"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "About",
                  "item": "https://www.sqleditor.online/about"
                }
              ]
            }
          `}
        </Script>
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}
      style={{ pointerEvents: 'auto' }}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
