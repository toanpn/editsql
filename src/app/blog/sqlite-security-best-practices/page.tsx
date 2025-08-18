import Link from "next/link";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SQLite Security Best Practices for Web Applications | SQLite Editor",
  description: "Learn essential security practices for SQLite databases in web applications. Prevent SQL injection, secure file access, and implement proper authentication.",
  keywords: "sqlite security, sql injection prevention, database security, sqlite best practices, web application security",
  alternates: {
    canonical: "https://www.sqleditor.online/blog/sqlite-security-best-practices",
  },
  openGraph: {
    title: "SQLite Security Best Practices for Web Applications",
    description: "Learn essential security practices for SQLite databases in web applications. Prevent SQL injection, secure file access, and implement proper authentication.",
    url: "https://www.sqleditor.online/blog/sqlite-security-best-practices",
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
            "headline": "SQLite Security Best Practices for Web Applications",
            "description": "Learn essential security practices for SQLite databases in web applications. Prevent SQL injection, secure file access, and implement proper authentication.",
            "author": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "publisher": {
              "@type": "Organization",
              "name": "SQLite Editor Online"
            },
            "datePublished": "2023-12-01",
            "dateModified": "2023-12-01",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://www.sqleditor.online/blog/sqlite-security-best-practices"
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
              <time dateTime="2023-12-01">December 1, 2023</time>
              <span>•</span>
              <span>SQLite, Security, Best Practices, Web Development</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-6">SQLite Security Best Practices for Web Applications</h1>
          
          <p className="lead">
            While SQLite is inherently more secure than client-server databases due to its serverless nature, web applications using SQLite still face unique security challenges. This comprehensive guide covers essential security practices to protect your SQLite databases from common vulnerabilities and attacks.
          </p>
          
          <h2 id="sql-injection-prevention">1. Preventing SQL Injection Attacks</h2>
          <p>
            SQL injection is the most common database security vulnerability. Here&apos;s how to prevent it in SQLite applications:
          </p>
          
          <h3>Always Use Parameterized Queries</h3>
          <pre className="language-python">
            <code>
{`# ❌ NEVER DO THIS - Vulnerable to SQL injection
user_id = request.GET.get('user_id')
query = f"SELECT * FROM users WHERE id = {user_id}"
cursor.execute(query)

# ✅ ALWAYS DO THIS - Safe parameterized query
user_id = request.GET.get('user_id')
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))

# ✅ Using named parameters (even better)
query = "SELECT * FROM users WHERE id = :user_id AND status = :status"
cursor.execute(query, {"user_id": user_id, "status": "active"})`}
            </code>
          </pre>
          
          <h3>Input Validation and Sanitization</h3>
          <pre className="language-python">
            <code>
{`import re

def validate_user_input(user_id):
    # Validate that user_id is actually a number
    if not isinstance(user_id, (int, str)) or not str(user_id).isdigit():
        raise ValueError("Invalid user ID format")
    
    # Additional validation
    user_id = int(user_id)
    if user_id <= 0 or user_id > 1000000:
        raise ValueError("User ID out of valid range")
    
    return user_id

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        raise ValueError("Invalid email format")
    return email`}
            </code>
          </pre>
          
          <h2 id="file-system-security">2. File System Security</h2>
          <p>
            SQLite databases are files, so file system security is crucial:
          </p>
          
          <h3>Proper File Permissions</h3>
          <pre className="language-bash">
            <code>
{`# Set restrictive permissions on database files
chmod 600 database.sqlite  # Owner read/write only
chmod 700 /path/to/database/directory  # Directory access

# For web applications, ensure web server user owns the file
chown www-data:www-data database.sqlite

# Never store database files in web-accessible directories
# Good: /var/lib/myapp/database.sqlite
# Bad:  /var/www/html/database.sqlite`}
            </code>
          </pre>
          
          <h3>Database File Location</h3>
          <pre className="language-python">
            <code>
{`import os
from pathlib import Path

# ✅ Store databases outside web root
DATABASE_PATH = Path("/var/lib/myapp/data/database.sqlite")

# ✅ Use environment variables for configuration
DATABASE_PATH = Path(os.getenv("DATABASE_PATH", "/var/lib/myapp/database.sqlite"))

# ✅ Validate database path
def get_safe_database_path(config_path):
    path = Path(config_path).resolve()
    
    # Ensure path is not in web directory
    web_root = Path("/var/www").resolve()
    if str(path).startswith(str(web_root)):
        raise ValueError("Database cannot be in web-accessible directory")
    
    # Ensure parent directory exists and is secure
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    
    return str(path)`}
            </code>
          </pre>
          
          <h2 id="authentication-authorization">3. Authentication and Authorization</h2>
          <p>
            Implement proper user authentication and role-based access control:
          </p>
          
          <h3>Secure Password Storage</h3>
          <pre className="language-python">
            <code>
{`import hashlib
import secrets
import hmac

class SecurePasswordManager:
    def hash_password(self, password: str) -> tuple:
        """Hash password with salt using PBKDF2"""
        salt = secrets.token_bytes(32)
        pwdhash = hashlib.pbkdf2_hmac('sha256', 
                                    password.encode('utf-8'), 
                                    salt, 
                                    100000)  # 100,000 iterations
        return salt, pwdhash
    
    def verify_password(self, password: str, salt: bytes, stored_hash: bytes) -> bool:
        """Verify password against stored hash"""
        pwdhash = hashlib.pbkdf2_hmac('sha256',
                                    password.encode('utf-8'),
                                    salt,
                                    100000)
        return hmac.compare_digest(pwdhash, stored_hash)

# Database schema for secure user storage
CREATE_USERS_TABLE = '''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_salt BLOB NOT NULL,
    password_hash BLOB NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP
);
'''`}
            </code>
          </pre>
          
          <h3>Role-Based Access Control</h3>
          <pre className="language-python">
            <code>
{`class AccessControl:
    def __init__(self, db_connection):
        self.conn = db_connection
        
    def check_permission(self, user_id: int, resource: str, action: str) -> bool:
        """Check if user has permission for specific action on resource"""
        query = '''
        SELECT COUNT(*) FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ? AND p.resource = ? AND p.action = ?
        '''
        cursor = self.conn.execute(query, (user_id, resource, action))
        return cursor.fetchone()[0] > 0
    
    def require_permission(self, user_id: int, resource: str, action: str):
        """Decorator to require specific permission"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                if not self.check_permission(user_id, resource, action):
                    raise PermissionError(f"Access denied for {action} on {resource}")
                return func(*args, **kwargs)
            return wrapper
        return decorator

# Database schema for permissions
CREATE_PERMISSIONS_SCHEMA = '''
CREATE TABLE IF NOT EXISTS permissions (
    id INTEGER PRIMARY KEY,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_permissions (
    user_id INTEGER,
    permission_id INTEGER,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (permission_id) REFERENCES permissions (id),
    PRIMARY KEY (user_id, permission_id)
);
'''`}
            </code>
          </pre>
          
          <h2 id="data-encryption">4. Data Encryption</h2>
          <p>
            Protect sensitive data with encryption techniques:
          </p>
          
          <h3>Application-Level Encryption</h3>
          <pre className="language-python">
            <code>
{`from cryptography.fernet import Fernet
import os

class DataEncryption:
    def __init__(self):
        # Store encryption key securely (use environment variable in production)
        key = os.getenv('ENCRYPTION_KEY')
        if not key:
            raise ValueError("Encryption key not found in environment")
        
        self.cipher_suite = Fernet(key.encode())
    
    def encrypt_sensitive_data(self, data: str) -> bytes:
        """Encrypt sensitive data before storing"""
        return self.cipher_suite.encrypt(data.encode())
    
    def decrypt_sensitive_data(self, encrypted_data: bytes) -> str:
        """Decrypt data when retrieving"""
        return self.cipher_suite.decrypt(encrypted_data).decode()

# Usage example
encryptor = DataEncryption()

# Encrypt before storing
encrypted_ssn = encryptor.encrypt_sensitive_data("123-45-6789")
query = "INSERT INTO users (name, encrypted_ssn) VALUES (?, ?)"
cursor.execute(query, ("John Doe", encrypted_ssn))

# Decrypt when retrieving
cursor.execute("SELECT encrypted_ssn FROM users WHERE id = ?", (user_id,))
encrypted_ssn = cursor.fetchone()[0]
ssn = encryptor.decrypt_sensitive_data(encrypted_ssn)`}
            </code>
          </pre>
          
          <h2 id="connection-security">5. Database Connection Security</h2>
          <p>
            Secure your database connections and implement connection pooling safely:
          </p>
          
          <h3>Secure Connection Management</h3>
          <pre className="language-python">
            <code>
{`import sqlite3
import threading
import contextlib
from typing import Generator

class SecureDBManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.local = threading.local()
        
        # Enable foreign key constraints by default
        self._execute_pragma("PRAGMA foreign_keys = ON")
        
        # Set secure journal mode
        self._execute_pragma("PRAGMA journal_mode = WAL")
        
        # Set reasonable timeout
        self._execute_pragma("PRAGMA busy_timeout = 30000")
    
    def _execute_pragma(self, pragma: str):
        """Execute PRAGMA statement on connection"""
        with self.get_connection() as conn:
            conn.execute(pragma)
    
    @contextlib.contextmanager
    def get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Get thread-safe database connection with automatic cleanup"""
        if not hasattr(self.local, 'connection'):
            self.local.connection = sqlite3.connect(
                self.db_path,
                check_same_thread=False,
                isolation_level=None  # Autocommit mode
            )
            
            # Enable row factory for easier data access
            self.local.connection.row_factory = sqlite3.Row
            
        try:
            yield self.local.connection
        except Exception:
            self.local.connection.rollback()
            raise
        finally:
            # Connection cleanup is handled by thread cleanup
            pass
    
    def execute_transaction(self, operations):
        """Execute multiple operations in a single transaction"""
        with self.get_connection() as conn:
            conn.execute("BEGIN IMMEDIATE")
            try:
                for operation in operations:
                    conn.execute(operation['query'], operation.get('params', []))
                conn.commit()
            except Exception:
                conn.rollback()
                raise`}
            </code>
          </pre>
          
          <h2 id="audit-logging">6. Audit Logging and Monitoring</h2>
          <p>
            Implement comprehensive logging to track database access and changes:
          </p>
          
          <h3>Database Audit Trail</h3>
          <pre className="language-python">
            <code>
{`import json
import datetime
from typing import Optional

class DatabaseAuditor:
    def __init__(self, db_manager):
        self.db = db_manager
        self._setup_audit_tables()
    
    def _setup_audit_tables(self):
        """Create audit logging tables"""
        audit_schema = '''
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            table_name TEXT NOT NULL,
            record_id TEXT,
            old_values TEXT,
            new_values TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT
        );
        
        CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
        CREATE INDEX idx_audit_user ON audit_log(user_id);
        CREATE INDEX idx_audit_table ON audit_log(table_name);
        '''
        
        with self.db.get_connection() as conn:
            conn.executescript(audit_schema)
    
    def log_database_action(self, user_id: int, action: str, table_name: str,
                          record_id: Optional[str] = None,
                          old_values: Optional[dict] = None,
                          new_values: Optional[dict] = None,
                          ip_address: Optional[str] = None,
                          user_agent: Optional[str] = None):
        """Log database action for audit trail"""
        
        audit_query = '''
        INSERT INTO audit_log 
        (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        with self.db.get_connection() as conn:
            conn.execute(audit_query, (
                user_id,
                action,
                table_name,
                record_id,
                json.dumps(old_values) if old_values else None,
                json.dumps(new_values) if new_values else None,
                ip_address,
                user_agent
            ))

# Usage in your application
def update_user_profile(user_id: int, new_data: dict, auditor: DatabaseAuditor):
    # Get old values for audit
    old_data = get_user_profile(user_id)
    
    # Update the profile
    update_query = "UPDATE users SET name = ?, email = ? WHERE id = ?"
    with db.get_connection() as conn:
        conn.execute(update_query, (new_data['name'], new_data['email'], user_id))
    
    # Log the action
    auditor.log_database_action(
        user_id=user_id,
        action="UPDATE",
        table_name="users",
        record_id=str(user_id),
        old_values=old_data,
        new_values=new_data,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent')
    )`}
            </code>
          </pre>
          
          <h2 id="backup-recovery">7. Secure Backup and Recovery</h2>
          <p>
            Implement secure backup strategies to protect against data loss:
          </p>
          
          <h3>Automated Encrypted Backups</h3>
          <pre className="language-python">
            <code>
{`import shutil
import gzip
import datetime
from pathlib import Path
from cryptography.fernet import Fernet

class SecureBackupManager:
    def __init__(self, db_path: str, backup_dir: str, encryption_key: bytes):
        self.db_path = Path(db_path)
        self.backup_dir = Path(backup_dir)
        self.cipher_suite = Fernet(encryption_key)
        
        # Ensure backup directory exists with secure permissions
        self.backup_dir.mkdir(mode=0o700, parents=True, exist_ok=True)
    
    def create_backup(self) -> Path:
        """Create encrypted, compressed backup of database"""
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"backup_{timestamp}.sqlite.gz.enc"
        backup_path = self.backup_dir / backup_filename
        
        try:
            # Read and compress database file
            with open(self.db_path, 'rb') as db_file:
                with gzip.open(backup_path.with_suffix('.gz'), 'wb') as gz_file:
                    shutil.copyfileobj(db_file, gz_file)
            
            # Encrypt compressed backup
            with open(backup_path.with_suffix('.gz'), 'rb') as gz_file:
                compressed_data = gz_file.read()
                encrypted_data = self.cipher_suite.encrypt(compressed_data)
            
            # Write encrypted backup
            with open(backup_path, 'wb') as enc_file:
                enc_file.write(encrypted_data)
            
            # Remove unencrypted compressed file
            backup_path.with_suffix('.gz').unlink()
            
            return backup_path
            
        except Exception as e:
            # Clean up partial backup on error
            for temp_file in [backup_path, backup_path.with_suffix('.gz')]:
                if temp_file.exists():
                    temp_file.unlink()
            raise e
    
    def restore_backup(self, backup_path: Path, restore_path: Path):
        """Restore database from encrypted backup"""
        try:
            # Decrypt backup
            with open(backup_path, 'rb') as enc_file:
                encrypted_data = enc_file.read()
                compressed_data = self.cipher_suite.decrypt(encrypted_data)
            
            # Decompress and restore
            with gzip.open(io.BytesIO(compressed_data), 'rb') as gz_file:
                with open(restore_path, 'wb') as db_file:
                    shutil.copyfileobj(gz_file, db_file)
                    
        except Exception as e:
            raise Exception(f"Backup restoration failed: {e}")
    
    def cleanup_old_backups(self, keep_days: int = 30):
        """Remove backups older than specified days"""
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=keep_days)
        
        for backup_file in self.backup_dir.glob("backup_*.sqlite.gz.enc"):
            if backup_file.stat().st_mtime < cutoff_date.timestamp():
                backup_file.unlink()`}
            </code>
          </pre>
          
          <h2 id="security-checklist">8. Security Checklist</h2>
          <p>
            Use this comprehensive checklist to ensure your SQLite application is secure:
          </p>
          
          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="text-lg font-medium mb-4">SQLite Security Checklist</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="param-queries" className="rounded" />
                <label htmlFor="param-queries">All queries use parameterized statements</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="input-validation" className="rounded" />
                <label htmlFor="input-validation">Input validation implemented for all user data</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="file-permissions" className="rounded" />
                <label htmlFor="file-permissions">Database files have restrictive permissions (600 or 640)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="web-root" className="rounded" />
                <label htmlFor="web-root">Database files stored outside web-accessible directories</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="password-hashing" className="rounded" />
                <label htmlFor="password-hashing">Passwords hashed with salt using strong algorithm</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="access-control" className="rounded" />
                <label htmlFor="access-control">Role-based access control implemented</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sensitive-encryption" className="rounded" />
                <label htmlFor="sensitive-encryption">Sensitive data encrypted at application level</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="audit-logging" className="rounded" />
                <label htmlFor="audit-logging">Database actions logged for audit trail</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="backup-strategy" className="rounded" />
                <label htmlFor="backup-strategy">Regular encrypted backups implemented</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="error-handling" className="rounded" />
                <label htmlFor="error-handling">Error messages don&apos;t expose database schema</label>
              </div>
            </div>
          </div>
          
          <h2 id="common-vulnerabilities">9. Common SQLite Vulnerabilities to Avoid</h2>
          <ul>
            <li><strong>SQL Injection:</strong> Always use parameterized queries, never string concatenation</li>
            <li><strong>File System Access:</strong> Restrict database file permissions and location</li>
            <li><strong>Information Disclosure:</strong> Handle errors gracefully without exposing schema details</li>
            <li><strong>Privilege Escalation:</strong> Implement proper role-based access controls</li>
            <li><strong>Data Exposure:</strong> Encrypt sensitive data and use HTTPS for all communications</li>
            <li><strong>Backup Vulnerabilities:</strong> Encrypt backups and store them securely</li>
          </ul>
          
          <h2 id="conclusion">Conclusion</h2>
          <p>
            Securing SQLite applications requires a multi-layered approach covering input validation, file system security, authentication, encryption, and monitoring. While SQLite&apos;s serverless architecture eliminates many network-based vulnerabilities, application-level security remains crucial.
          </p>
          <p>
            Regular security audits, keeping dependencies updated, and following these best practices will help ensure your SQLite-powered applications remain secure against evolving threats.
          </p>
          <p>
            Want to practice secure SQLite operations? Try these techniques in our <Link href="/" className="text-primary hover:underline">secure online SQLite editor</Link>!
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