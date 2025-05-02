import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import Database from 'better-sqlite3';
import fs from 'fs';

// Path to the temporary directory where SQLite files are stored
const TMP_DIR = path.join(process.cwd(), 'tmp');

// Default pagination values
const DEFAULT_LIMIT = 50;
const DEFAULT_PAGE = 1;

export async function GET(
  req: NextRequest,
  context: { params: { tableName: string } }
) {
  try {
    const { tableName } = context.params;
    
    // Get pagination parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || `${DEFAULT_PAGE}`, 10);
    const limit = parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10);
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page number' },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit. Must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Get the session ID from either query parameters or cookies
    let sessionId = searchParams.get('sessionId');
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
    const db = new Database(dbPath, { readonly: true });

    try {
      // Validate that the table exists
      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type = 'table' AND name = ?
      `).get(tableName);
      
      if (!tableExists) {
        db.close();
        return NextResponse.json(
          { error: 'Table not found' },
          { status: 404 }
        );
      }
      
      // Fetch column information
      const columnInfoQuery = `PRAGMA table_info(${tableName})`;
      const columns = db.prepare(columnInfoQuery).all();
      
      // Fetch total row count for pagination
      const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
      const { count } = db.prepare(countQuery).get() as { count: number };
      
      // Fetch paginated data
      const dataQuery = `SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`;
      const rows = db.prepare(dataQuery).all(limit, offset);

      // Close the database connection
      db.close();

      return NextResponse.json({
        tableName,
        columns,
        data: rows,
        pagination: {
          page,
          limit,
          totalRows: count,
          totalPages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      // Make sure to close the database connection even if there's an error
      db.close();
      throw error;
    }
  } catch (error) {
    console.error('Error getting table data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table data' },
      { status: 500 }
    );
  }
} 