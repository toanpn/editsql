import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";
import { Database } from "lucide-react"; 

export const metadata: Metadata = {
  title: "SQLite Editor Online FAQ - Frequently Asked Questions",
  description: "Find answers to frequently asked questions about SQLite Editor Online. Learn how to use our free SQLite database editor, troubleshoot common issues, and get the most out of our tools.",
  keywords: "sqlite editor faq, sqlite questions, sqlite database questions, sqlite editor help, sqlite editor tutorial, sqlite editor guide",
};

const faqs = [
  {
    question: "What is SQLite Editor Online?",
    answer: "SQLite Editor Online is a free web-based tool that allows you to edit and manage SQLite databases directly in your browser. It offers features like table management, SQL query execution, and data export without requiring any installation.",
  },
  {
    question: "Is SQLite Editor Online free to use?",
    answer: "Yes, SQLite Editor Online is completely free to use. There are no hidden fees, subscriptions, or premium features that require payment.",
  },
  {
    question: "Do I need to create an account to use SQLite Editor Online?",
    answer: "No, you don't need to create an account to use SQLite Editor Online. Simply upload your SQLite database file and start working with it immediately.",
  },
  {
    question: "Is my database data secure when I use SQLite Editor Online?",
    answer: "Yes, your data is secure. We process your database file directly in your browser using WebAssembly technology, which means your data never leaves your computer. We don't store or have access to your database content.",
  },
  {
    question: "What file size limits are there for database uploads?",
    answer: "You can upload SQLite database files up to 50MB in size. This limit is in place to ensure optimal performance in the browser environment.",
  },
  {
    question: "Can I execute SQL commands in SQLite Editor Online?",
    answer: "Yes, SQLite Editor Online includes a SQL CLI (Command Line Interface) that allows you to execute any valid SQLite commands against your database.",
  },
  {
    question: "How do I export my modified database?",
    answer: "After making changes to your database, you can use the Export button in the top-right corner of the application to download the modified database file to your computer.",
  },
  {
    question: "What browsers are supported by SQLite Editor Online?",
    answer: "SQLite Editor Online works in all modern browsers, including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience.",
  },
  {
    question: "Can I use SQLite Editor Online on mobile devices?",
    answer: "Yes, SQLite Editor Online is responsive and works on mobile devices, though the experience is optimized for larger screens due to the nature of database management tasks.",
  },
  {
    question: "How do I report bugs or request features?",
    answer: "If you encounter any issues or have feature requests, please visit our GitHub repository and open an issue. We appreciate your feedback and contributions to making SQLite Editor Online better.",
  }
];

export default function FAQPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-background to-muted p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-xl">SqlEditor</h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="text-sm hover:text-primary">Home</Link>
            <Link href="/about" className="text-sm hover:text-primary">About</Link>
            <Link href="/faq" className="text-sm font-medium text-primary">FAQ</Link>
            <Link href="/blog" className="text-sm hover:text-primary">Blog</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about SQLite Editor Online
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold mb-3" id={`faq-${index}`}>{faq.question}</h2>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="mb-6">
              If you couldn&apos;t find the answer you were looking for, feel free to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Try SQLite Editor
              </Link>
              <Link 
                href="/about"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-4 px-4 text-center text-xs text-muted-foreground bg-muted/30">
        <div className="flex justify-center space-x-4 mb-2">
          <Link href="/" className="hover:text-primary">Home</Link>
          <Link href="/about" className="hover:text-primary">About</Link>
          <Link href="/faq" className="text-primary">FAQ</Link>
          <Link href="/blog" className="hover:text-primary">Blog</Link>
        </div>
        <p>SQLite Editor Online - Version 0.0.1</p>
        <p className="mt-1">
          Request new features: <a href="mailto:toanphamhsgs@gmail.com" className="text-primary hover:underline">toanphamhsgs@gmail.com</a>
        </p>
      </footer>

      {/* FAQPage Structured Data */}
      <Script id="faq-structured-data" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              ${faqs.map((faq, index) => `
                {
                  "@type": "Question",
                  "name": "${faq.question}",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "${faq.answer}"
                  }
                }${index < faqs.length - 1 ? ',' : ''}
              `).join('')}
            ]
          }
        `}
      </Script>
    </main>
  );
} 