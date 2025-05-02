import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import Database from 'better-sqlite3';
import fs from 'fs';

// Path to the temporary directory where SQLite files are stored
const TMP_DIR = path.join(process.cwd(), 'tmp');

// List of allowed query types
const ALLOWED_QUERY_TYPES = ['SELECT', 'UPDATE', 'DELETE', 'INSERT', 'CREATE'];

// Maximum number of rows to return for SELECT queries
const MAX_ROWS = 1000;

// Add a type definition for column information
interface ColumnInfo {
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { sql } = body;

    // Validate SQL query
    if (!sql || typeof sql !== 'string' || sql.trim() === '') {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      );
    }

    // Basic security validation of query type
    const queryType = getQueryType(sql);
    if (!queryType || !ALLOWED_QUERY_TYPES.includes(queryType)) {
      return NextResponse.json(
        { error: `Query type '${queryType || 'unknown'}' is not allowed. Only ${ALLOWED_QUERY_TYPES.join(', ')} queries are supported.` },
        { status: 400 }
      );
    }

    // Get the session ID from either query parameters or cookies
    let sessionId = req.nextUrl.searchParams.get('sessionId');
    if (!sessionId) {
      const cookieSessionId = req.cookies.get('sessionId')?.value;
      if (cookieSessionId) {
        sessionId = cookieSessionId;
      }
    }

    // If there's no session ID, return an error
    if (!sessionId) {
      return NextResponse.json(
        { error: 'No session ID provided' },
        { status: 400 }
      );
    }

    // Look for a database file with this session ID
    const files = fs.readdirSync(TMP_DIR);
    const dbFile = files.find(file => file.startsWith(sessionId));

    if (!dbFile) {
      return NextResponse.json(
        { error: 'No database file found for this session' },
        { status: 404 }
      );
    }

    const dbPath = path.join(TMP_DIR, dbFile);

    // Open the database
    // Only use readonly mode for SELECT queries
    const readonly = queryType === 'SELECT';
    const db = new Database(dbPath, { readonly });

    try {
      // Prevent multiple statements in one query for security
      if (sql.includes(';') && sql.trim().split(';').filter(part => part.trim()).length > 1) {
        db.close();
        return NextResponse.json(
          { error: 'Multiple SQL statements are not allowed for security reasons' },
          { status: 400 }
        );
      }

      // Execute the query based on its type
      if (queryType === 'SELECT') {
        // For SELECT queries, return the results as JSON
        try {
          const stmt = db.prepare(sql);
          const results = stmt.all() as Record<string, any>[];
          
          // Limit the number of rows returned
          const limitedResults = results.slice(0, MAX_ROWS);
          const hasMoreRows = results.length > MAX_ROWS;
          
          // Get column information from the first result
          let columns: ColumnInfo[] = [];
          if (limitedResults.length > 0) {
            columns = Object.keys(limitedResults[0]).map(name => ({ name }));
          }
          
          return NextResponse.json({
            success: true,
            queryType,
            results: limitedResults,
            totalRows: results.length,
            hasMoreRows,
            columns,
            message: `Query returned ${results.length} rows${hasMoreRows ? ` (limited to ${MAX_ROWS})` : ''}`
          });
        } catch (error) {
          throw error;
        }
      } else {
        // For non-SELECT queries (UPDATE, DELETE, INSERT, CREATE), return affected rows
        // Use a transaction for data modification queries
        db.prepare('BEGIN TRANSACTION').run();
        
        try {
          const stmt = db.prepare(sql);
          const result = stmt.run();
          
          // Commit the transaction
          db.prepare('COMMIT').run();
          
          return NextResponse.json({
            success: true,
            queryType,
            affectedRows: result.changes,
            lastInsertRowid: result.lastInsertRowid,
            message: `${queryType} operation affected ${result.changes} row(s)`
          });
        } catch (error) {
          // Rollback the transaction in case of error
          db.prepare('ROLLBACK').run();
          throw error;
        }
      }
    } catch (error) {
      // Make sure to close the database connection even if there's an error
      db.close();
      throw error;
    } finally {
      // Close the database connection
      db.close();
    }
  } catch (error) {
    console.error('Error executing SQL query:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute SQL query' },
      { status: 500 }
    );
  }
}

// Helper function to determine the query type
function getQueryType(sql: string): string | null {
  const normalizedSql = sql.trim().toUpperCase();
  
  if (normalizedSql.startsWith('SELECT')) return 'SELECT';
  if (normalizedSql.startsWith('UPDATE')) return 'UPDATE';
  if (normalizedSql.startsWith('DELETE')) return 'DELETE';
  if (normalizedSql.startsWith('INSERT')) return 'INSERT';
  if (normalizedSql.startsWith('CREATE')) return 'CREATE';
  
  return null;
} 