import { NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import Database from 'better-sqlite3';

// Path to the temporary directory where SQLite files are stored
const TMP_DIR = path.join(process.cwd(), 'tmp');

// Ensure the tmp directory exists
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

export async function POST() {
  try {
    // Generate a session ID (UUID)
    const sessionId = uuidv4();
    
    // Create a new SQLite database file
    const dbFileName = `${sessionId}.db`;
    const dbPath = path.join(TMP_DIR, dbFileName);
    
    // Initialize the database
    const db = new Database(dbPath);
    
    try {
      // Create a sample users table
      db.exec(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          email TEXT UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          category TEXT,
          stock INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Insert some sample data
      const insertUserStmt = db.prepare(`
        INSERT INTO users (username, email) VALUES (?, ?);
      `);
      
      insertUserStmt.run('admin', 'admin@example.com');
      insertUserStmt.run('user1', 'user1@example.com');
      insertUserStmt.run('user2', 'user2@example.com');
      
      // Insert sample products
      const insertProductStmt = db.prepare(`
        INSERT INTO products (name, description, price, category, stock, is_active) 
        VALUES (?, ?, ?, ?, ?, ?);
      `);
      
      insertProductStmt.run('Laptop', 'High-performance laptop with 16GB RAM', 1299.99, 'Electronics', 10, 1);
      insertProductStmt.run('Smartphone', '6.5-inch smartphone with dual camera', 699.99, 'Electronics', 15, 1);
      insertProductStmt.run('Coffee Maker', 'Automatic coffee maker with timer', 49.99, 'Home Appliances', 5, 1);
      insertProductStmt.run('Desk Chair', 'Ergonomic office chair with lumbar support', 199.99, 'Furniture', 8, 1);
      insertProductStmt.run('Headphones', 'Noise-cancelling wireless headphones', 149.99, 'Electronics', 20, 1);
      
      // Return the session ID and table info
      return NextResponse.json({
        success: true,
        message: 'New database created successfully',
        sessionId,
        tables: [{ name: 'users' }, { name: 'products' }],
      });
    } catch (error) {
      // Clean up on error
      db.close();
      
      if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
      }
      
      throw error;
    } finally {
      // Close the database connection
      db.close();
    }
  } catch (error) {
    console.error('Error creating new database:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create new database' },
      { status: 500 }
    );
  }
} 