import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Migrating from MySQL to SQLite: A Complete Guide | SQLite Editor",
  description: "Step-by-step guide to migrating your MySQL database to SQLite, including schema conversion, data transfer, and application code updates.",
  keywords: "mysql to sqlite migration, database migration, mysql sqlite conversion, database transfer guide",
  alternates: {
    canonical: "https://www.sqleditor.online/blog/migrating-mysql-to-sqlite",
  },
  openGraph: {
    title: "Migrating from MySQL to SQLite: A Complete Guide",
    description: "Step-by-step guide to migrating your MySQL database to SQLite, including schema conversion, data transfer, and application code updates.",
    url: "https://www.sqleditor.online/blog/migrating-mysql-to-sqlite",
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
            "headline": "Migrating from MySQL to SQLite: A Complete Guide",
            "description": "Step-by-step guide to migrating your MySQL database to SQLite, including schema conversion, data transfer, and application code updates.",
            "author": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "datePublished": "2023-10-30",
            "dateModified": "2023-10-30",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.sqleditor.online/blog/migrating-mysql-to-sqlite"
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
              <time dateTime="2023-10-30">October 30, 2023</time>
              <span>•</span>
              <span>SQLite, MySQL, Migration, Database Transfer</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">Migrating from MySQL to SQLite: A Complete Guide</h1>
          
          <p className="lead">
            Migrating from MySQL to SQLite can significantly simplify your application deployment and reduce infrastructure complexity. Whether you&apos;re moving to SQLite for development simplicity, reduced hosting costs, or embedded applications, this comprehensive guide will walk you through every step of the migration process.
          </p>
          
          <h2 id="why-migrate">Why Migrate from MySQL to SQLite?</h2>
          <p>
            Before diving into the migration process, let&apos;s understand when and why you might want to migrate:
          </p>
          
          <h3>Benefits of SQLite</h3>
          <ul>
            <li><strong>Zero Configuration:</strong> No server setup or maintenance required</li>
            <li><strong>Single File Database:</strong> Easy backup, deployment, and distribution</li>
            <li><strong>Reduced Complexity:</strong> No network configuration or user management</li>
            <li><strong>Lower Resource Usage:</strong> Minimal memory and CPU overhead</li>
            <li><strong>ACID Compliance:</strong> Full transaction support like MySQL</li>
            <li><strong>Cross-Platform:</strong> Database files work across all platforms</li>
          </ul>
          
          <h3>When SQLite is a Good Choice</h3>
          <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
            <ul className="text-green-700 dark:text-green-300 mb-0">
              <li>Small to medium-sized applications (under 100GB)</li>
              <li>Read-heavy workloads with occasional writes</li>
              <li>Development and testing environments</li>
              <li>Desktop or mobile applications</li>
              <li>Embedded systems or IoT devices</li>
              <li>Prototype and MVP development</li>
            </ul>
          </div>
          
          <h2 id="pre-migration-analysis">1. Pre-Migration Analysis</h2>
          <p>
            Before starting the migration, analyze your current MySQL database to identify potential challenges:
          </p>
          
          <h3>Database Size Assessment</h3>
          <pre className="language-sql">
            <code>
{`-- Check database size
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'your_database_name'
GROUP BY table_schema;

-- Check individual table sizes
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)',
    table_rows AS 'Rows'
FROM information_schema.TABLES 
WHERE table_schema = 'your_database_name'
ORDER BY (data_length + index_length) DESC;`}
            </code>
          </pre>
          
          <h3>Feature Compatibility Check</h3>
          <pre className="language-sql">
            <code>
{`-- Check for MySQL-specific features that need conversion
-- Stored procedures (not supported in SQLite)
SHOW PROCEDURE STATUS WHERE db = 'your_database_name';

-- Functions (not supported in SQLite)
SHOW FUNCTION STATUS WHERE db = 'your_database_name';

-- Triggers (supported but syntax differs)
SELECT * FROM information_schema.triggers 
WHERE trigger_schema = 'your_database_name';

-- Views (supported)
SELECT * FROM information_schema.views 
WHERE table_schema = 'your_database_name';

-- Check data types used
SELECT DISTINCT data_type, column_type 
FROM information_schema.columns 
WHERE table_schema = 'your_database_name'
ORDER BY data_type;`}
            </code>
          </pre>
          
          <h2 id="schema-conversion">2. Schema Conversion</h2>
          <p>
            Converting your MySQL schema to SQLite requires understanding the differences between the two database systems:
          </p>
          
          <h3>Data Type Mapping</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-gray-300 p-3 text-left">MySQL Type</th>
                  <th className="border border-gray-300 p-3 text-left">SQLite Type</th>
                  <th className="border border-gray-300 p-3 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3">INT, INTEGER</td>
                  <td className="border border-gray-300 p-3">INTEGER</td>
                  <td className="border border-gray-300 p-3">Direct mapping</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border border-gray-300 p-3">VARCHAR(n), TEXT</td>
                  <td className="border border-gray-300 p-3">TEXT</td>
                  <td className="border border-gray-300 p-3">SQLite ignores length limits</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">DECIMAL, NUMERIC</td>
                  <td className="border border-gray-300 p-3">REAL or TEXT</td>
                  <td className="border border-gray-300 p-3">Use TEXT for exact precision</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border border-gray-300 p-3">DATETIME, TIMESTAMP</td>
                  <td className="border border-gray-300 p-3">TEXT or INTEGER</td>
                  <td className="border border-gray-300 p-3">Use ISO8601 text or Unix timestamp</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3">BOOLEAN</td>
                  <td className="border border-gray-300 p-3">INTEGER</td>
                  <td className="border border-gray-300 p-3">0 = FALSE, 1 = TRUE</td>
                </tr>
                <tr className="bg-muted/30">
                  <td className="border border-gray-300 p-3">ENUM</td>
                  <td className="border border-gray-300 p-3">TEXT + CHECK</td>
                  <td className="border border-gray-300 p-3">Use CHECK constraint</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <h3>Schema Conversion Examples</h3>
          <pre className="language-sql">
            <code>
{`-- MySQL schema
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash CHAR(60) NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    balance DECIMAL(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE
);

-- Converted SQLite schema
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    balance TEXT DEFAULT '0.00', -- Use TEXT for exact decimal precision
    is_verified INTEGER DEFAULT 0 CHECK (is_verified IN (0, 1))
);

-- Trigger to handle updated_at (replaces MySQL's ON UPDATE)
CREATE TRIGGER update_users_timestamp 
    AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;`}
            </code>
          </pre>
          
          <h2 id="data-migration-methods">3. Data Migration Methods</h2>
          
          <h3>Method 1: Using mysqldump and sqlite3</h3>
          <pre className="language-bash">
            <code>
{`#!/bin/bash
# Export MySQL data
mysqldump -u username -p --compact --no-create-info --single-transaction \
    database_name > mysql_data.sql

# Convert MySQL dump to SQLite format
sed -i 's/`//g' mysql_data.sql  # Remove backticks
sed -i 's/ENGINE=InnoDB//g' mysql_data.sql  # Remove engine specification
sed -i 's/AUTO_INCREMENT=[0-9]*//g' mysql_data.sql  # Remove auto_increment values

# Import into SQLite
sqlite3 database.sqlite < mysql_data.sql`}
            </code>
          </pre>
          
          <h3>Method 2: Using Python Script</h3>
          <pre className="language-python">
            <code>
{`import mysql.connector
import sqlite3
import json
from decimal import Decimal
from datetime import datetime

class MySQLToSQLiteMigrator:
    def __init__(self, mysql_config, sqlite_path):
        self.mysql_config = mysql_config
        self.sqlite_path = sqlite_path
        self.mysql_conn = None
        self.sqlite_conn = None
    
    def connect(self):
        """Connect to both databases"""
        self.mysql_conn = mysql.connector.connect(**self.mysql_config)
        self.sqlite_conn = sqlite3.connect(self.sqlite_path)
        
    def get_table_list(self):
        """Get list of tables to migrate"""
        cursor = self.mysql_conn.cursor()
        cursor.execute("SHOW TABLES")
        return [table[0] for table in cursor.fetchall()]
    
    def convert_value(self, value, column_type):
        """Convert MySQL values to SQLite compatible format"""
        if value is None:
            return None
        
        if isinstance(value, Decimal):
            return str(value)  # Keep precision for decimals
        elif isinstance(value, datetime):
            return value.isoformat()  # Convert to ISO8601
        elif isinstance(value, bytes):
            return value.decode('utf-8', errors='ignore')
        else:
            return value
    
    def migrate_table(self, table_name):
        """Migrate a single table"""
        print(f"Migrating table: {table_name}")
        
        # Get table structure
        mysql_cursor = self.mysql_conn.cursor()
        mysql_cursor.execute(f"DESCRIBE {table_name}")
        columns = mysql_cursor.fetchall()
        
        # Get all data
        mysql_cursor.execute(f"SELECT * FROM {table_name}")
        rows = mysql_cursor.fetchall()
        
        if not rows:
            print(f"  No data in {table_name}")
            return
        
        # Prepare SQLite insert
        column_count = len(columns)
        placeholders = ','.join(['?' for _ in range(column_count)])
        
        sqlite_cursor = self.sqlite_conn.cursor()
        
        # Insert data in batches
        batch_size = 1000
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            converted_batch = []
            
            for row in batch:
                converted_row = []
                for j, value in enumerate(row):
                    column_type = columns[j][1]  # Get column type
                    converted_value = self.convert_value(value, column_type)
                    converted_row.append(converted_value)
                converted_batch.append(tuple(converted_row))
            
            # Insert batch
            try:
                sqlite_cursor.executemany(
                    f"INSERT INTO {table_name} VALUES ({placeholders})",
                    converted_batch
                )
                self.sqlite_conn.commit()
                print(f"  Inserted {len(batch)} rows")
            except sqlite3.Error as e:
                print(f"  Error inserting batch: {e}")
                self.sqlite_conn.rollback()
    
    def migrate_all(self):
        """Migrate all tables"""
        tables = self.get_table_list()
        
        for table in tables:
            try:
                self.migrate_table(table)
            except Exception as e:
                print(f"Error migrating {table}: {e}")
        
        print("Migration completed!")
    
    def close(self):
        """Close connections"""
        if self.mysql_conn:
            self.mysql_conn.close()
        if self.sqlite_conn:
            self.sqlite_conn.close()

# Usage
mysql_config = {
    'user': 'your_username',
    'password': 'your_password',
    'host': 'localhost',
    'database': 'your_database'
}

migrator = MySQLToSQLiteMigrator(mysql_config, 'migrated_database.sqlite')
migrator.connect()
migrator.migrate_all()
migrator.close()`}
            </code>
          </pre>
          
          <h3>Method 3: Using Online Tools</h3>
          <p>
            Several online tools can help with MySQL to SQLite migration:
          </p>
          <ul>
            <li><strong>DB Browser for SQLite:</strong> Import from various formats</li>
            <li><strong>SQLiteStudio:</strong> Built-in import from MySQL</li>
            <li><strong>Online Converters:</strong> Web-based conversion tools</li>
          </ul>
          
          <h2 id="application-code-updates">4. Application Code Updates</h2>
          
          <h3>Connection String Changes</h3>
          <pre className="language-python">
            <code>
{`# Before (MySQL)
import mysql.connector

connection = mysql.connector.connect(
    host='localhost',
    user='username',
    password='password',
    database='mydb'
)

# After (SQLite)
import sqlite3

connection = sqlite3.connect('database.sqlite')

# Using SQLAlchemy (recommended)
from sqlalchemy import create_engine

# Before
engine = create_engine('mysql+pymysql://user:pass@localhost/dbname')

# After  
engine = create_engine('sqlite:///database.sqlite')`}
            </code>
          </pre>
          
          <h3>Query Modifications</h3>
          <pre className="language-sql">
            <code>
{`-- MySQL specific functions that need replacement
-- LIMIT with OFFSET
-- MySQL: SELECT * FROM users LIMIT 10 OFFSET 20
-- SQLite: SELECT * FROM users LIMIT 10 OFFSET 20  (same syntax)

-- Date functions
-- MySQL: SELECT NOW(), CURDATE(), DATE_ADD(NOW(), INTERVAL 1 DAY)
-- SQLite: SELECT datetime('now'), date('now'), datetime('now', '+1 day')

-- String functions
-- MySQL: SELECT CONCAT(first_name, ' ', last_name) FROM users
-- SQLite: SELECT first_name || ' ' || last_name FROM users

-- Conditional logic
-- MySQL: SELECT IF(age >= 18, 'Adult', 'Minor') FROM users
-- SQLite: SELECT CASE WHEN age >= 18 THEN 'Adult' ELSE 'Minor' END FROM users

-- Auto-increment last insert ID
-- MySQL: SELECT LAST_INSERT_ID()
-- SQLite: SELECT last_insert_rowid()`}
            </code>
          </pre>
          
          <h3>Handling Transactions</h3>
          <pre className="language-python">
            <code>
{`# SQLite transaction handling
import sqlite3

def transfer_money(from_user, to_user, amount):
    conn = sqlite3.connect('database.sqlite')
    try:
        conn.execute('BEGIN IMMEDIATE')  # Start immediate transaction
        
        # Debit from source
        conn.execute(
            'UPDATE users SET balance = balance - ? WHERE id = ?',
            (amount, from_user)
        )
        
        # Credit to destination
        conn.execute(
            'UPDATE users SET balance = balance + ? WHERE id = ?',
            (amount, to_user)
        )
        
        conn.commit()
        print("Transfer completed successfully")
        
    except sqlite3.Error as e:
        conn.rollback()
        print(f"Transfer failed: {e}")
        
    finally:
        conn.close()`}
            </code>
          </pre>
          
          <h2 id="testing-validation">5. Testing and Validation</h2>
          
          <h3>Data Integrity Checks</h3>
          <pre className="language-python">
            <code>
{`def validate_migration(mysql_config, sqlite_path):
    """Validate that migration was successful"""
    
    # Connect to both databases
    mysql_conn = mysql.connector.connect(**mysql_config)
    sqlite_conn = sqlite3.connect(sqlite_path)
    
    mysql_cursor = mysql_conn.cursor()
    sqlite_cursor = sqlite_conn.cursor()
    
    # Get table list from MySQL
    mysql_cursor.execute("SHOW TABLES")
    mysql_tables = set(table[0] for table in mysql_cursor.fetchall())
    
    # Get table list from SQLite
    sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    sqlite_tables = set(table[0] for table in sqlite_cursor.fetchall())
    
    print(f"MySQL tables: {len(mysql_tables)}")
    print(f"SQLite tables: {len(sqlite_tables)}")
    
    # Check each table
    for table in mysql_tables:
        if table not in sqlite_tables:
            print(f"❌ Table {table} missing in SQLite")
            continue
        
        # Count rows
        mysql_cursor.execute(f"SELECT COUNT(*) FROM {table}")
        mysql_count = mysql_cursor.fetchone()[0]
        
        sqlite_cursor.execute(f"SELECT COUNT(*) FROM {table}")
        sqlite_count = sqlite_cursor.fetchone()[0]
        
        if mysql_count == sqlite_count:
            print(f"✅ Table {table}: {mysql_count} rows")
        else:
            print(f"❌ Table {table}: MySQL={mysql_count}, SQLite={sqlite_count}")
    
    mysql_conn.close()
    sqlite_conn.close()`}
            </code>
          </pre>
          
          <h2 id="performance-optimization">6. Post-Migration Optimization</h2>
          
          <h3>Create Necessary Indexes</h3>
          <pre className="language-sql">
            <code>
{`-- Analyze your query patterns and create appropriate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Composite indexes for complex queries
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Partial indexes for filtered queries
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Update table statistics
ANALYZE;`}
            </code>
          </pre>
          
          <h3>Configure SQLite Settings</h3>
          <pre className="language-sql">
            <code>
{`-- Optimize SQLite configuration
PRAGMA journal_mode = WAL;        -- Better concurrency
PRAGMA synchronous = NORMAL;      -- Balanced safety/performance
PRAGMA cache_size = 10000;        -- Larger cache
PRAGMA temp_store = memory;       -- Use memory for temp tables
PRAGMA mmap_size = 268435456;     -- Memory-mapped I/O (256MB)`}
            </code>
          </pre>
          
          <h2 id="common-challenges">7. Common Migration Challenges</h2>
          
          <h3>Handling Large Datasets</h3>
          <pre className="language-python">
            <code>
{`# For large datasets, use streaming and batching
def migrate_large_table(table_name, mysql_conn, sqlite_conn):
    mysql_cursor = mysql_conn.cursor()
    sqlite_cursor = sqlite_conn.cursor()
    
    # Use server-side cursor for large datasets
    mysql_cursor.execute(f"SELECT * FROM {table_name}")
    
    batch_size = 1000
    batch = []
    
    while True:
        row = mysql_cursor.fetchone()
        if row is None:
            break
            
        batch.append(row)
        
        if len(batch) >= batch_size:
            # Insert batch
            sqlite_cursor.executemany(
                f"INSERT INTO {table_name} VALUES ({placeholders})",
                batch
            )
            sqlite_conn.commit()
            batch = []
            
    # Insert remaining rows
    if batch:
        sqlite_cursor.executemany(
            f"INSERT INTO {table_name} VALUES ({placeholders})",
            batch
        )
        sqlite_conn.commit()`}
            </code>
          </pre>
          
          <h2 id="migration-checklist">Migration Checklist</h2>
          
          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-4">MySQL to SQLite Migration Checklist</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="size-analysis" className="rounded" />
                <label htmlFor="size-analysis">Database size analysis completed</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="schema-converted" className="rounded" />
                <label htmlFor="schema-converted">Schema converted to SQLite format</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="data-migrated" className="rounded" />
                <label htmlFor="data-migrated">All data successfully migrated</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="triggers-converted" className="rounded" />
                <label htmlFor="triggers-converted">Triggers converted to SQLite syntax</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="indexes-created" className="rounded" />
                <label htmlFor="indexes-created">Necessary indexes created</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="code-updated" className="rounded" />
                <label htmlFor="code-updated">Application code updated</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="tests-passing" className="rounded" />
                <label htmlFor="tests-passing">All tests passing with SQLite</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="performance-tested" className="rounded" />
                <label htmlFor="performance-tested">Performance testing completed</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="backup-strategy" className="rounded" />
                <label htmlFor="backup-strategy">Backup strategy implemented</label>
              </div>
            </div>
          </div>
          
          <h2 id="conclusion">Conclusion</h2>
          <p>
            Migrating from MySQL to SQLite can significantly simplify your application architecture while maintaining data integrity and performance. The key to successful migration lies in careful planning, thorough testing, and understanding the differences between the two database systems.
          </p>
          <p>
            Remember that SQLite excels in specific use cases. If your application has high concurrency requirements or very large datasets, you might want to reconsider the migration or implement it gradually.
          </p>
          <p>
            Ready to explore SQLite&apos;s capabilities? Try working with your migrated database using our <Link href="/" className="text-primary hover:underline">free SQLite editor</Link>!
          </p>
          
          <div className="mt-8 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-2">Related Articles</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog/sqlite-vs-other-databases" className="text-primary hover:underline">
                  SQLite vs. Other Databases: When to Use SQLite
                </Link>
              </li>
              <li>
                <Link href="/blog/sqlite-schema-design-patterns" className="text-primary hover:underline">
                  Database Schema Design Patterns for SQLite
                </Link>
              </li>
              <li>
                <Link href="/blog/optimize-sqlite-performance" className="text-primary hover:underline">
                  How to Optimize Your SQLite Database for Better Performance
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