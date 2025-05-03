import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// Configure font
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SQLite Editor Online - Free Online SQLite Database Editor",
  description: "Edit SQLite databases online for free. A powerful web-based SQLite editor with features like table management, SQL query execution, and data export. No installation required.",
  keywords: "sqlite editor, online sqlite editor, sqlite database editor, edit sqlite online, sqlite web editor, sqlite online database editor",
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
    title: "SQLite Editor Online - Free Online SQLite Database Editor",
    description: "Edit SQLite databases online for free. A powerful web-based SQLite editor with features like table management, SQL query execution, and data export.",
    url: "https://www.sqleditor.online",
    siteName: "SQLite Editor Online",
    images: [
      {
        url: "https://www.sqleditor.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "SQLite Editor Online",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQLite Editor Online - Free Online SQLite Database Editor",
    description: "Edit SQLite databases online for free. A powerful web-based SQLite editor with features like table management, SQL query execution, and data export.",
    images: ["https://www.sqleditor.online/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
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
      </body>
    </html>
  );
}
