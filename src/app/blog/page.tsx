import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQLite Editor Blog - Tips and Tutorials for SQLite Database Management",
  description: "Learn SQLite database management, tips, and best practices. Our SQLite editor blog offers tutorials, guides, and resources for developers of all levels.",
  keywords: "sqlite tutorials, sqlite tips, sqlite database management, sqlite blog, sqlite best practices, sqlite editor tips",
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

        <div className="space-y-12">
          {blogPosts.map((post) => (
            <article key={post.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <time dateTime={post.date}>{post.date}</time>
                  <span>•</span>
                  <span>{post.tags.join(", ")}</span>
                </div>
                
                <h2 className="text-2xl font-bold">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link>
                </h2>
                
                <p className="text-muted-foreground">{post.excerpt}</p>
                
                <div className="pt-3">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-primary hover:underline inline-flex items-center"
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
      </div>
    </main>
  );
} 