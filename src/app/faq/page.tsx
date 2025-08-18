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
    answer: "SQLite Editor Online is a free web-based tool that allows you to edit and manage SQLite databases directly in your browser. It offers features like table management, SQL query execution, data export, in-place editing, and schema modification without requiring any installation.",
  },
  {
    question: "Is SQLite Editor Online free to use?",
    answer: "Yes, SQLite Editor Online is completely free to use. There are no hidden fees, subscriptions, or premium features that require payment. All features are available to everyone at no cost.",
  },
  {
    question: "Do I need to create an account to use SQLite Editor Online?",
    answer: "No, you don't need to create an account to use SQLite Editor Online. Simply upload your SQLite database file and start working with it immediately. No registration, login, or personal information is required.",
  },
  {
    question: "Is my database data secure when I use SQLite Editor Online?",
    answer: "Yes, your data is completely secure. We process your database file directly in your browser using WebAssembly technology, which means your data never leaves your computer. We don't store, transmit, or have access to your database content. All operations are performed client-side.",
  },
  {
    question: "What file size limits are there for database uploads?",
    answer: "You can upload SQLite database files up to 50MB in size. This limit is in place to ensure optimal performance in the browser environment. For larger databases, consider compressing your data or removing unnecessary records before uploading.",
  },
  {
    question: "Can I execute SQL commands in SQLite Editor Online?",
    answer: "Yes, SQLite Editor Online includes a powerful SQL CLI (Command Line Interface) that allows you to execute any valid SQLite commands against your database. This includes SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, ALTER TABLE, and more advanced operations like window functions and CTEs.",
  },
  {
    question: "How do I export my modified database?",
    answer: "After making changes to your database, you can use the Export button in the top-right corner of the application to download the modified database file to your computer. The exported file will have an '_edited' suffix to distinguish it from your original file.",
  },
  {
    question: "What browsers are supported by SQLite Editor Online?",
    answer: "SQLite Editor Online works in all modern browsers, including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience. The tool requires WebAssembly support, which is available in all modern browsers.",
  },
  {
    question: "Can I use SQLite Editor Online on mobile devices?",
    answer: "Yes, SQLite Editor Online is responsive and works on mobile devices, though the experience is optimized for larger screens due to the nature of database management tasks. For the best experience, we recommend using a tablet or desktop computer.",
  },
  {
    question: "How do I report bugs or request features?",
    answer: "If you encounter any issues or have feature requests, please email us at toanphamhsgs@gmail.com. We appreciate your feedback and contributions to making SQLite Editor Online better. Include details about your browser, the issue you're experiencing, and steps to reproduce it.",
  },
  {
    question: "Can I edit table schemas and create new tables?",
    answer: "Yes! You can modify your database structure using SQL commands in the CLI. Create new tables with CREATE TABLE, add columns with ALTER TABLE, create indexes, and drop tables. The tool supports all standard SQLite DDL (Data Definition Language) operations.",
  },
  {
    question: "How do I import data from CSV files?",
    answer: "Currently, SQLite Editor Online doesn't have a built-in CSV import feature. However, you can create a table structure using SQL commands and then use INSERT statements to add your data. For large CSV files, consider converting them to SQLite format using a desktop tool first, then uploading the SQLite file.",
  },
  {
    question: "What happens to my data when I close the browser tab?",
    answer: "When you close the browser tab or navigate away from SQLite Editor Online, all your data and changes are cleared from memory for security purposes. Make sure to export your database before closing to save your changes permanently.",
  },
  {
    question: "Can I work with multiple databases at the same time?",
    answer: "Currently, SQLite Editor Online supports working with one database at a time. If you need to work with multiple databases, you can open them in separate browser tabs. Each tab will maintain its own database session independently.",
  },
  {
    question: "Does the editor support foreign keys and constraints?",
    answer: "Yes, SQLite Editor Online fully supports foreign keys, check constraints, unique constraints, and other SQLite constraints. You can view existing constraints in table schemas and create new ones using SQL commands. Foreign key enforcement follows SQLite's standard behavior.",
  },
  {
    question: "How do I search for specific data across tables?",
    answer: "You can search for data using SQL queries in the CLI. Use SELECT statements with WHERE clauses to find specific records, or use LIKE operators for pattern matching. For full-text search across multiple tables, you can write queries with UNION clauses or use SQLite's FTS (Full-Text Search) if your database has FTS tables.",
  },
  {
    question: "Can I undo changes I made to the database?",
    answer: "SQLite Editor Online doesn't have a built-in undo feature. However, your original database file remains unchanged until you explicitly export the modified version. If you make a mistake, you can always re-upload your original file to start over. We recommend making regular exports as backups.",
  },
  {
    question: "What SQLite features are supported?",
    answer: "SQLite Editor Online supports all standard SQLite features including: all data types (TEXT, INTEGER, REAL, BLOB), indexes, triggers, views, foreign keys, check constraints, window functions, CTEs (Common Table Expressions), JSON functions, date/time functions, and mathematical functions.",
  },
  {
    question: "How do I optimize query performance in the editor?",
    answer: "To optimize query performance: 1) Create indexes on frequently queried columns using CREATE INDEX, 2) Use LIMIT clauses for large result sets, 3) Use EXPLAIN QUERY PLAN to analyze query execution, 4) Avoid SELECT * in favor of specific column names, and 5) Use WHERE clauses to filter data early in your queries.",
  },
  {
    question: "Can I view and edit BLOB (binary) data?",
    answer: "SQLite Editor Online can display BLOB data, but editing binary data directly isn't supported through the interface. You can view BLOB columns and use SQL functions to work with binary data. For complex binary data manipulation, consider using a specialized SQLite desktop application.",
  },
  {
    question: "Does the editor support SQLite extensions?",
    answer: "No, SQLite Editor Online uses a standard SQLite build and doesn't support custom extensions. However, it includes all built-in SQLite functions including JSON functions, date/time functions, mathematical functions, and string functions that cover most common use cases.",
  },
  {
    question: "How can I backup my work while using the editor?",
    answer: "Since all work is done in browser memory, we recommend: 1) Export your database regularly (every 10-15 minutes of work), 2) Keep your original database file safe as a backup, 3) For important work, consider exporting with different names (database_backup1.db, database_backup2.db) to maintain version history.",
  },
  {
    question: "Can I share my database with others?",
    answer: "You can share your database by exporting it from SQLite Editor Online and sending the .db file to others. They can then upload it to their own instance of SQLite Editor Online. Since everything runs client-side, there's no built-in sharing feature, but standard file sharing methods work perfectly.",
  },
  {
    question: "What's the difference between SQLite Editor Online and desktop SQLite tools?",
    answer: "SQLite Editor Online offers the convenience of browser-based access with no installation required, perfect for quick edits and analysis. Desktop tools may offer more advanced features like plugins, custom themes, and better performance with very large databases. Our online editor is ideal for databases under 50MB and provides all essential SQLite functionality.",
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-muted-foreground">
              Find answers to common questions about SQLite Editor Online
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold mb-3" id={`faq-${index}`}>{faq.question}</h2>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="mb-6 text-muted-foreground">
              If you couldn&apos;t find the answer you were looking for, feel free to contact us or check out our comprehensive guides.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                Try SQLite Editor Now
              </Link>
              <Link 
                href="/blog/getting-started-sqlite-editor"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium"
              >
                Getting Started Guide
              </Link>
              <Link 
                href="/blog"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-primary text-primary hover:bg-primary/10 font-medium"
              >
                Browse Tutorials
              </Link>
            </div>
            
            <div className="mt-8 p-6 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold mb-3">Need More Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contact us directly for technical support or feature requests:
              </p>
              <a 
                href="mailto:toanphamhsgs@gmail.com" 
                className="inline-flex items-center text-primary hover:underline font-medium"
              >
                toanphamhsgs@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center text-xs text-muted-foreground bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/faq" className="text-primary font-medium">FAQ</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
          </div>
          <p className="mb-2">SQLite Editor Online - Version 0.0.1</p>
          <p>
            Request new features: <a href="mailto:toanphamhsgs@gmail.com" className="text-primary hover:underline">toanphamhsgs@gmail.com</a>
          </p>
        </div>
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