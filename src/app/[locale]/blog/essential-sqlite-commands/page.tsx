import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "5 Essential SQLite Commands Every Developer Should Know | SQLite Editor",
  description: "Master the 5 most important SQLite commands that will help you become more efficient with database management. Perfect for beginners and intermediate developers.",
  keywords: "sqlite commands, essential sqlite commands, sqlite select, sqlite insert, sqlite update, sqlite delete, sqlite create table",
  alternates: {
    canonical: "https://www.sqleditor.online/blog/essential-sqlite-commands",
  },
  openGraph: {
    title: "5 Essential SQLite Commands Every Developer Should Know",
    description: "Master the 5 most important SQLite commands that will help you become more efficient with database management.",
    url: "https://www.sqleditor.online/blog/essential-sqlite-commands",
    images: [
      {
        url: "https://www.sqleditor.online/blog/essential-sqlite-commands.png",
        width: 1200,
        height: 630,
        alt: "5 Essential SQLite Commands Every Developer Should Know",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "5 Essential SQLite Commands Every Developer Should Know",
    description: "Master the 5 most important SQLite commands that will help you become more efficient with database management.",
    images: ["https://www.sqleditor.online/blog/essential-sqlite-commands.png"],
  },
};

export default function BlogPost() {
  return (
    <>
      {/* Article Schema */}
      <Script id="article-schema" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "5 Essential SQLite Commands Every Developer Should Know",
            "description": "Master the 5 most important SQLite commands that will help you become more efficient with database management. Perfect for beginners and intermediate developers.",
            "image": "https://www.sqleditor.online/blog/essential-sqlite-commands.png",
            "author": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SQLite Editor Online",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.sqleditor.online/logo.png"
              }
            },
            "datePublished": "2023-10-15",
            "dateModified": "2023-10-15",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.sqleditor.online/blog/essential-sqlite-commands"
            }
          }
        `}
      </Script>
    
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <article className="max-w-3xl mx-auto prose dark:prose-invert">
          <Link href="/blog" className="text-primary hover:underline mb-6 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <time dateTime="2023-10-15">October 15, 2023</time>
              <span>•</span>
              <span>SQLite, Commands, Beginners</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">5 Essential SQLite Commands Every Developer Should Know</h1>
          
          <p className="lead">
            SQLite is one of the most widely used database engines in the world. Whether you&apos;re building a mobile app, a desktop application, or a simple website, knowing these five essential SQLite commands will help you manage your database more efficiently.
          </p>
          
          <h2 id="create-table">1. CREATE TABLE - Building Your Database Foundation</h2>
          <p>
            The first command every SQLite developer should master is <code>CREATE TABLE</code>. This command allows you to define the structure of your database tables, specifying column names, data types, and constraints.
          </p>
          <pre className="language-sql">
            <code>
{`CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}
            </code>
          </pre>
          <p>
            This example creates a table named &quot;users&quot; with columns for ID, username, email, password, and a timestamp for when the record was created.
          </p>
          
          <h2 id="insert">2. INSERT INTO - Adding Data to Your Tables</h2>
          <p>
            Once you have created your tables, you&apos;ll need to add data to them. The <code>INSERT INTO</code> command allows you to add new records to your tables.
          </p>
          <pre className="language-sql">
            <code>
{`INSERT INTO users (username, email, password)
VALUES ('johndoe', 'john@example.com', 'hashed_password_here');`}
            </code>
          </pre>
          <p>
            This command inserts a new record into the users table with the specified username, email, and password.
          </p>
          
          <h2 id="select">3. SELECT - Retrieving Data from Your Database</h2>
          <p>
            The <code>SELECT</code> command is perhaps the most commonly used SQLite command. It allows you to retrieve data from your database tables.
          </p>
          <pre className="language-sql">
            <code>
{`-- Basic SELECT statement
SELECT * FROM users;

-- SELECT with conditions
SELECT username, email FROM users WHERE id = 1;

-- SELECT with sorting
SELECT * FROM users ORDER BY created_at DESC;`}
            </code>
          </pre>
          <p>
            These examples show how to retrieve all records from the users table, how to select specific columns with a condition, and how to sort the results.
          </p>
          
          <h2 id="update">4. UPDATE - Modifying Existing Data</h2>
          <p>
            The <code>UPDATE</code> command allows you to modify existing records in your database tables.
          </p>
          <pre className="language-sql">
            <code>
{`UPDATE users
SET email = 'new_email@example.com'
WHERE username = 'johndoe';`}
            </code>
          </pre>
          <p>
            This command updates the email address for the user with the username &apos;johndoe&apos;.
          </p>
          
          <h2 id="delete">5. DELETE - Removing Data from Your Tables</h2>
          <p>
            Finally, the <code>DELETE</code> command allows you to remove records from your database tables.
          </p>
          <pre className="language-sql">
            <code>
{`DELETE FROM users
WHERE id = 1;`}
            </code>
          </pre>
          <p>
            This command deletes the user with the ID of 1 from the users table.
          </p>
          
          <h2 id="conclusion">Conclusion</h2>
          <p>
            Mastering these five essential SQLite commands will give you a solid foundation for managing your database. As you become more comfortable with these commands, you can explore more advanced features of SQLite, such as joins, subqueries, and transactions.
          </p>
          <p>
            Ready to practice these commands? Try them out in our <Link href="/" className="text-primary hover:underline">free online SQLite editor</Link>!
          </p>
          
          <div className="mt-8 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-2">Want to learn more about SQLite?</h3>
            <p className="mb-4">Check out these related articles:</p>
            <ul className="space-y-2">
              <li>
                <Link href="/blog/optimize-sqlite-performance" className="text-primary hover:underline">
                  How to Optimize Your SQLite Database for Better Performance
                </Link>
              </li>
              <li>
                <Link href="/blog/sqlite-vs-other-databases" className="text-primary hover:underline">
                  SQLite vs. Other Databases: When to Use SQLite
                </Link>
              </li>
              <li>
                <Link href="/blog/getting-started-sqlite-editor" className="text-primary hover:underline">
                  Getting Started with SQLite Editor Online - A Complete Guide
                </Link>
              </li>
            </ul>
          </div>
        </article>

        {/* Footer */}
        <footer className="border-t py-4 px-4 text-center text-xs text-muted-foreground bg-muted/30">
          <div className="flex justify-center space-x-4 mb-2">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
            <Link href="/faq" className="hover:text-primary">FAQ</Link>
            <Link href="/blog" className="text-primary">Blog</Link>
          </div>
          <p>SQLite Editor Online - Version 0.0.1</p>
          <p className="mt-1">
            Request new features: <a href="mailto:toanphamhsgs@gmail.com" className="text-primary hover:underline">toanphamhsgs@gmail.com</a>
          </p>
        </footer>
      </main>
    </>
  );
} 