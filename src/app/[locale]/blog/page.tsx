import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQLite Editor Blog - Tips and Tutorials for SQLite Database Management",
  description: "Learn SQLite database management, tips, and best practices. Our SQLite editor blog offers tutorials, guides, and resources for developers of all levels.",
  keywords: "sqlite tutorials, sqlite tips, sqlite database management, sqlite blog, sqlite best practices, sqlite editor tips",
  alternates: {
    canonical: "https://www.sqleditor.online/blog",
  },
};

const blogPosts = [
  {
    id: 1,
    title: "5 Essential SQLite Commands Every Developer Should Know",
    slug: "essential-sqlite-commands",
    excerpt: "Learn the most important SQLite commands that will help you manage your database more efficiently.",
    date: "2023-10-15",
    tags: ["SQLite", "Commands", "Beginners"]
  },
  {
    id: 2,
    title: "How to Optimize Your SQLite Database for Better Performance",
    slug: "optimize-sqlite-performance",
    excerpt: "Discover techniques to make your SQLite database faster and more efficient for your web applications.",
    date: "2023-09-20",
    tags: ["SQLite", "Performance", "Optimization"]
  },
  {
    id: 3,
    title: "SQLite vs. Other Databases: When to Use SQLite",
    slug: "sqlite-vs-other-databases",
    excerpt: "Compare SQLite with other database systems and learn when SQLite is the best choice for your projects.",
    date: "2023-08-05",
    tags: ["SQLite", "Database Comparison", "Use Cases"]
  },
  {
    id: 4,
    title: "Getting Started with SQLite Editor Online - A Complete Guide",
    slug: "getting-started-sqlite-editor",
    excerpt: "Step-by-step tutorial on how to use our free online SQLite editor for all your database needs.",
    date: "2023-07-12",
    tags: ["SQLite Editor", "Tutorial", "Beginners"]
  },
  {
    id: 5,
    title: "Advanced SQLite Queries for Data Analysis",
    slug: "advanced-sqlite-queries",
    excerpt: "Master complex SQLite queries that will help you extract valuable insights from your data.",
    date: "2023-06-28",
    tags: ["SQLite", "Queries", "Data Analysis", "Advanced"]
  },
  {
    id: 6,
    title: "SQLite Security Best Practices for Web Applications",
    slug: "sqlite-security-best-practices",
    excerpt: "Learn how to secure your SQLite databases and prevent common security vulnerabilities in web applications.",
    date: "2023-12-01",
    tags: ["SQLite", "Security", "Best Practices", "Web Development"]
  },
  {
    id: 7,
    title: "Database Schema Design Patterns for SQLite",
    slug: "sqlite-schema-design-patterns",
    excerpt: "Explore proven database design patterns and normalization techniques specifically for SQLite applications.",
    date: "2023-11-18",
    tags: ["SQLite", "Schema Design", "Database Design", "Patterns"]
  },
  {
    id: 8,
    title: "Migrating from MySQL to SQLite: A Complete Guide",
    slug: "migrating-mysql-to-sqlite",
    excerpt: "Step-by-step guide to migrating your MySQL database to SQLite, including schema conversion and data transfer.",
    date: "2023-10-30",
    tags: ["SQLite", "MySQL", "Migration", "Database Transfer"]
  }
];

export default function BlogPage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">SQLite Editor Blog</h1>
          <p className="text-xl text-muted-foreground">
            Tips, tutorials, and best practices for SQLite database management
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {blogPosts.map((post) => (
            <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow bg-card">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </time>
                  <span>•</span>
                  <span>{post.tags.join(", ")}</span>
                </div>
                
                <h2 className="text-2xl font-bold leading-tight">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </h2>
                
                <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
                
                <div className="pt-2">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-primary hover:underline inline-flex items-center font-medium"
                  >
                    Read more
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="p-8 border rounded-lg bg-muted/30">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">
              Get notified when we publish new SQLite tutorials and guides.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                Try SQLite Editor Now
              </Link>
              <Link 
                href="/faq"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-primary text-primary hover:bg-primary/10 font-medium"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center text-xs text-muted-foreground bg-muted/30 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center space-x-6 mb-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            <Link href="/blog" className="text-primary font-medium">Blog</Link>
          </div>
          <p className="mb-2">SQLite Editor Online - Version 0.0.1</p>
          <p>
            Request new features: <a href="mailto:toanphamhsgs@gmail.com" className="text-primary hover:underline">toanphamhsgs@gmail.com</a>
          </p>
        </div>
      </footer>
    </main>
  );
} 