import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SQLite Editor Online - Our Story & Features",
  description: "Learn about SQLite Editor Online, a free web-based SQLite database editor. Discover our features, our mission, and how you can support this free tool.",
  keywords: "sqlite editor about, about sql editor online, sqlite editor features, sqlite database editor, sqlite web editor, online sqlite editor, sqlite browser online, sqlite viewer online",
  alternates: {
    canonical: "https://www.sqleditor.online/about",
  },
  openGraph: {
    title: "About SQLite Editor Online - Our Story & Features",
    description: "Learn about SQLite Editor Online, a free web-based SQLite database editor. Discover our features, our mission, and how you can support this free tool.",
    url: "https://www.sqleditor.online/about",
    siteName: "SQLite Editor Online",
    images: [
      {
        url: "https://www.sqleditor.online/og-image.png",
        width: 1200,
        height: 630,
        alt: "About SQLite Editor Online",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 