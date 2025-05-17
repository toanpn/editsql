import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQLite Editor Online FAQ - Frequently Asked Questions",
  description: "Find answers to frequently asked questions about SQLite Editor Online. Learn how to use our free SQLite database editor, troubleshoot common issues, and get the most out of our tools.",
  keywords: "sqlite editor faq, sqlite questions, sqlite database questions, sqlite editor help, sqlite editor tutorial, sqlite editor guide, sqlite browser faq, sqlite online help",
  alternates: {
    canonical: "https://www.sqleditor.online/faq",
  },
  openGraph: {
    title: "SQLite Editor Online FAQ - Frequently Asked Questions",
    description: "Find answers to frequently asked questions about SQLite Editor Online. Learn how to use our free SQLite database editor, troubleshoot common issues, and get the most out of our tools.",
    url: "https://www.sqleditor.online/faq",
    siteName: "SQLite Editor Online",
    images: [
      {
        url: "https://www.sqleditor.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "SQLite Editor Online FAQ",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 