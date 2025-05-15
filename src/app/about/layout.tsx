import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SqlEditor - Modern SQLite Database Editor",
  description: "Learn about SqlEditor, a modern web-based SQLite database editor with features like interactive table viewing, SQL CLI, and data export capabilities.",
  keywords: "SqlEditor, SQLite, database editor, web-based SQLite, database management, SQL CLI",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 