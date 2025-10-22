import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Database Schema Design Patterns for SQLite | SQLite Editor",
  description: "Explore proven database design patterns and normalization techniques specifically for SQLite applications. Learn to create efficient, maintainable database schemas.",
  keywords: "sqlite schema design, database design patterns, sqlite normalization, database architecture, sqlite best practices",
  alternates: {
    canonical: "https://www.sqleditor.online/blog/sqlite-schema-design-patterns",
  },
  openGraph: {
    title: "Database Schema Design Patterns for SQLite",
    description: "Explore proven database design patterns and normalization techniques specifically for SQLite applications.",
    url: "https://www.sqleditor.online/blog/sqlite-schema-design-patterns",
  },
};

export default function BlogPost() {
  return (
    <>
      <Script id="article-schema" type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Database Schema Design Patterns for SQLite",
            "description": "Explore proven database design patterns and normalization techniques specifically for SQLite applications. Learn to create efficient, maintainable database schemas.",
            "author": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "datePublished": "2023-11-18",
            "dateModified": "2023-11-18",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.sqleditor.online/blog/sqlite-schema-design-patterns"
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
              <time dateTime="2023-11-18">November 18, 2023</time>
              <span>•</span>
              <span>SQLite, Schema Design, Database Design, Patterns</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">Database Schema Design Patterns for SQLite</h1>
          
          <p className="lead">
            Effective database schema design is the foundation of any successful application. While SQLite&apos;s flexible nature might tempt you to take shortcuts, following proven design patterns will save you countless hours of refactoring and ensure your application scales gracefully. This comprehensive guide explores essential schema design patterns specifically tailored for SQLite.
          </p>
          
          <h2 id="normalization-principles">1. Normalization Principles for SQLite</h2>
          <p>
            Understanding and applying normalization principles helps eliminate data redundancy and improve data integrity.
          </p>
          
          <h3>First Normal Form (1NF)</h3>
          <pre className="language-sql">
            <code>
{`-- ❌ Violates 1NF - Multiple values in single column
CREATE TABLE bad_users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    phone_numbers TEXT  -- "555-0123, 555-0456, 555-0789"
);

-- ✅ Follows 1NF - Atomic values only
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE user_phone_numbers (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    phone_number TEXT NOT NULL,
    phone_type TEXT DEFAULT 'mobile',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`}
            </code>
          </pre>
          
          <h3>Second Normal Form (2NF) and Third Normal Form (3NF)</h3>
          <pre className="language-sql">
            <code>
{`-- ❌ Violates 2NF and 3NF - Transitive dependencies
CREATE TABLE bad_orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    customer_name TEXT,      -- Depends on customer_id, not order_id
    customer_address TEXT,   -- Depends on customer_id, not order_id
    product_id INTEGER,
    product_name TEXT,       -- Depends on product_id, not order_id
    product_price REAL,      -- Depends on product_id, not order_id
    quantity INTEGER,
    order_date TEXT
);

-- ✅ Normalized design - Separate concerns
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL CHECK (price >= 0),
    category_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    total_amount REAL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);`}
            </code>
          </pre>
          
          <h2 id="common-patterns">2. Common SQLite Schema Patterns</h2>
          
          <h3>Lookup Tables and Reference Data</h3>
          <pre className="language-sql">
            <code>
{`-- Create lookup tables for controlled vocabularies
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id INTEGER,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE user_roles (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT -- JSON array of permissions
);

-- Use lookup tables in main entities
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    status_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (status_id) REFERENCES product_statuses(id)
);

-- Populate lookup tables with initial data
INSERT INTO user_roles (name, description, permissions) VALUES
    ('admin', 'Full system access', '["read", "write", "delete", "manage"]'),
    ('editor', 'Content management', '["read", "write"]'),
    ('viewer', 'Read-only access', '["read"]');`}
            </code>
          </pre>
          
          <h3>Many-to-Many Relationships</h3>
          <pre className="language-sql">
            <code>
{`-- Junction table for many-to-many relationships
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table with additional attributes
CREATE TABLE user_project_assignments (
    user_id INTEGER,
    project_id INTEGER,
    role TEXT NOT NULL DEFAULT 'member',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by INTEGER,
    active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (user_id, project_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- Query many-to-many relationships
-- Get all projects for a user
SELECT p.name, p.description, upa.role, upa.assigned_at
FROM projects p
JOIN user_project_assignments upa ON p.id = upa.project_id
WHERE upa.user_id = ? AND upa.active = TRUE;`}
            </code>
          </pre>
          
          <h3>Hierarchical Data (Tree Structures)</h3>
          <pre className="language-sql">
            <code>
{`-- Adjacency List Model - Simple but limited
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id INTEGER,
    level INTEGER DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);

-- Nested Set Model - Efficient for read-heavy operations
CREATE TABLE categories_nested (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    left_bound INTEGER NOT NULL,
    right_bound INTEGER NOT NULL,
    level INTEGER DEFAULT 0
);

-- Path Enumeration Model - Combines benefits of both
CREATE TABLE categories_path (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL, -- e.g., "/1/3/7/"
    level INTEGER DEFAULT 0
);

-- Common queries for hierarchical data
-- Get all descendants (Nested Set Model)
SELECT * FROM categories_nested 
WHERE left_bound > ? AND right_bound < ?
ORDER BY left_bound;

-- Get all ancestors (Path Enumeration)
SELECT * FROM categories_path 
WHERE ? LIKE path || '%'
ORDER BY level;`}
            </code>
          </pre>
          
          <h2 id="temporal-patterns">3. Temporal Data Patterns</h2>
          <p>
            Handle time-based data effectively with these proven patterns:
          </p>
          
          <h3>Audit Trail Pattern</h3>
          <pre className="language-sql">
            <code>
{`-- Base table with audit fields
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER,
    version INTEGER DEFAULT 1,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Separate audit log table for detailed history
CREATE TABLE customer_audit_log (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values TEXT, -- JSON of previous values
    new_values TEXT, -- JSON of new values
    changed_by INTEGER,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Trigger to maintain audit trail
CREATE TRIGGER customer_audit_trigger
    AFTER UPDATE ON customers
BEGIN
    UPDATE customers 
    SET updated_at = CURRENT_TIMESTAMP, 
        version = version + 1
    WHERE id = NEW.id;
    
    INSERT INTO customer_audit_log (
        customer_id, action, old_values, new_values, changed_by
    ) VALUES (
        NEW.id, 
        'UPDATE',
        json_object('name', OLD.name, 'email', OLD.email, 'phone', OLD.phone),
        json_object('name', NEW.name, 'email', NEW.email, 'phone', NEW.phone),
        NEW.updated_by
    );
END;`}
            </code>
          </pre>
          
          <h3>Time-Series Data Pattern</h3>
          <pre className="language-sql">
            <code>
{`-- Time-series table for metrics/measurements
CREATE TABLE sensor_readings (
    id INTEGER PRIMARY KEY,
    sensor_id INTEGER NOT NULL,
    metric_type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    timestamp TIMESTAMP NOT NULL,
    quality_score REAL DEFAULT 1.0, -- Data quality indicator
    metadata TEXT, -- JSON for additional context
    FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

-- Indexes for time-series queries
CREATE INDEX idx_sensor_readings_time ON sensor_readings(timestamp);
CREATE INDEX idx_sensor_readings_sensor_time ON sensor_readings(sensor_id, timestamp);
CREATE INDEX idx_sensor_readings_metric_time ON sensor_readings(metric_type, timestamp);

-- Partitioning-like approach using multiple tables
CREATE TABLE sensor_readings_2023_11 (
    CHECK (timestamp >= '2023-11-01' AND timestamp < '2023-12-01')
) INHERITS (sensor_readings);

-- Aggregate tables for performance
CREATE TABLE sensor_daily_summary (
    sensor_id INTEGER,
    date DATE,
    metric_type TEXT,
    avg_value REAL,
    min_value REAL,
    max_value REAL,
    sample_count INTEGER,
    PRIMARY KEY (sensor_id, date, metric_type)
);`}
            </code>
          </pre>
          
          <h2 id="flexible-schemas">4. Flexible Schema Patterns</h2>
          
          <h3>Entity-Attribute-Value (EAV) Pattern</h3>
          <pre className="language-sql">
            <code>
{`-- EAV pattern for flexible attributes
CREATE TABLE entities (
    id INTEGER PRIMARY KEY,
    entity_type TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attributes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    data_type TEXT NOT NULL, -- 'string', 'number', 'date', 'boolean'
    validation_rules TEXT, -- JSON rules
    description TEXT
);

CREATE TABLE entity_attribute_values (
    entity_id INTEGER,
    attribute_id INTEGER,
    value_text TEXT,
    value_number REAL,
    value_date DATE,
    value_boolean BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (entity_id, attribute_id),
    FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id)
);

-- Query EAV data
SELECT 
    e.name as entity_name,
    a.name as attribute_name,
    CASE 
        WHEN a.data_type = 'string' THEN eav.value_text
        WHEN a.data_type = 'number' THEN CAST(eav.value_number AS TEXT)
        WHEN a.data_type = 'date' THEN eav.value_date
        WHEN a.data_type = 'boolean' THEN CASE WHEN eav.value_boolean THEN 'true' ELSE 'false' END
    END as value
FROM entities e
JOIN entity_attribute_values eav ON e.id = eav.entity_id
JOIN attributes a ON eav.attribute_id = a.id
WHERE e.id = ?;`}
            </code>
          </pre>
          
          <h3>JSON Column Pattern</h3>
          <pre className="language-sql">
            <code>
{`-- Using JSON for flexible attributes (SQLite 3.8.0+)
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER,
    base_price REAL NOT NULL,
    -- Flexible attributes as JSON
    attributes TEXT CHECK (json_valid(attributes)),
    specifications TEXT CHECK (json_valid(specifications)),
    metadata TEXT CHECK (json_valid(metadata)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insert data with JSON attributes
INSERT INTO products (name, category_id, base_price, attributes, specifications) VALUES (
    'Gaming Laptop',
    1,
    1299.99,
    json('{"color": "black", "weight": "2.5kg", "warranty": "2 years"}'),
    json('{"cpu": "Intel i7", "ram": "16GB", "storage": "512GB SSD", "gpu": "RTX 3060"}')
);

-- Query JSON data
SELECT 
    name,
    json_extract(attributes, '$.color') as color,
    json_extract(specifications, '$.cpu') as cpu,
    json_extract(specifications, '$.ram') as ram
FROM products
WHERE json_extract(attributes, '$.warranty') LIKE '%2 years%';

-- Index on JSON fields
CREATE INDEX idx_products_color ON products(json_extract(attributes, '$.color'));`}
            </code>
          </pre>
          
          <h2 id="performance-patterns">5. Performance-Oriented Patterns</h2>
          
          <h3>Denormalization for Read Performance</h3>
          <pre className="language-sql">
            <code>
{`-- Sometimes denormalization improves performance
CREATE TABLE order_summary (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL, -- Denormalized for performance
    customer_email TEXT NOT NULL, -- Denormalized for performance
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    item_count INTEGER DEFAULT 0,
    total_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Maintain denormalized data with triggers
CREATE TRIGGER update_order_totals
    AFTER INSERT ON order_items
BEGIN
    UPDATE order_summary 
    SET item_count = (
        SELECT COUNT(*) FROM order_items WHERE order_id = NEW.order_id
    ),
    total_amount = (
        SELECT SUM(quantity * unit_price) FROM order_items WHERE order_id = NEW.order_id
    )
    WHERE id = NEW.order_id;
END;`}
            </code>
          </pre>
          
          <h3>Computed Columns and Virtual Tables</h3>
          <pre className="language-sql">
            <code>
{`-- Generated columns (SQLite 3.31.0+)
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    base_price REAL NOT NULL,
    tax_rate REAL NOT NULL DEFAULT 0.08,
    -- Computed column
    final_price REAL GENERATED ALWAYS AS (base_price * (1 + tax_rate)) STORED,
    -- Virtual computed column
    price_category TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN base_price < 100 THEN 'Budget'
            WHEN base_price < 500 THEN 'Standard'
            ELSE 'Premium'
        END
    ) VIRTUAL
);

-- Full-text search virtual table
CREATE VIRTUAL TABLE product_search USING fts5(
    name, 
    description, 
    content='products', 
    content_rowid='id'
);

-- Populate FTS table
INSERT INTO product_search(rowid, name, description)
SELECT id, name, description FROM products;`}
            </code>
          </pre>
          
          <h2 id="design-checklist">6. Schema Design Checklist</h2>
          
          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-4">SQLite Schema Design Checklist</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="naming-convention" className="rounded" />
                <label htmlFor="naming-convention">Consistent naming conventions used</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="primary-keys" className="rounded" />
                <label htmlFor="primary-keys">All tables have primary keys</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="foreign-keys" className="rounded" />
                <label htmlFor="foreign-keys">Foreign key constraints properly defined</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="data-types" className="rounded" />
                <label htmlFor="data-types">Appropriate data types chosen</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="null-constraints" className="rounded" />
                <label htmlFor="null-constraints">NOT NULL constraints where appropriate</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="check-constraints" className="rounded" />
                <label htmlFor="check-constraints">CHECK constraints for data validation</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="indexes" className="rounded" />
                <label htmlFor="indexes">Indexes created for frequently queried columns</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="normalization" className="rounded" />
                <label htmlFor="normalization">Appropriate level of normalization</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="audit-trail" className="rounded" />
                <label htmlFor="audit-trail">Audit trail implemented where needed</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="json-validation" className="rounded" />
                <label htmlFor="json-validation">JSON columns have validation constraints</label>
              </div>
            </div>
          </div>
          
          <h2 id="anti-patterns">7. Common Anti-Patterns to Avoid</h2>
          <ul>
            <li><strong>No Primary Keys:</strong> Always define primary keys for referential integrity</li>
            <li><strong>Generic Column Names:</strong> Avoid names like &quot;data&quot;, &quot;info&quot;, &quot;value&quot;</li>
            <li><strong>Over-normalization:</strong> Don&apos;t normalize to the point of performance degradation</li>
            <li><strong>Under-normalization:</strong> Avoid excessive data duplication</li>
            <li><strong>Missing Constraints:</strong> Use constraints to enforce data integrity</li>
            <li><strong>Inconsistent Naming:</strong> Establish and follow naming conventions</li>
            <li><strong>No Indexes:</strong> Create indexes for frequently queried columns</li>
          </ul>
          
          <h2 id="conclusion">Conclusion</h2>
          <p>
            Good database schema design is both an art and a science. While SQLite&apos;s flexibility allows for many approaches, following established patterns and principles will lead to more maintainable, performant, and scalable applications.
          </p>
          <p>
            Remember that schema design is iterative. Start with a solid foundation using these patterns, then refine based on your application&apos;s specific needs and performance characteristics.
          </p>
          <p>
            Ready to implement these patterns? Practice schema design with our <Link href="/" className="text-primary hover:underline">free SQLite editor</Link> and see these concepts in action!
          </p>
          
          <div className="mt-8 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-2">Related Articles</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog/essential-sqlite-commands" className="text-primary hover:underline">
                  5 Essential SQLite Commands Every Developer Should Know
                </Link>
              </li>
              <li>
                <Link href="/blog/optimize-sqlite-performance" className="text-primary hover:underline">
                  How to Optimize Your SQLite Database for Better Performance
                </Link>
              </li>
              <li>
                <Link href="/blog/advanced-sqlite-queries" className="text-primary hover:underline">
                  Advanced SQLite Queries for Data Analysis
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