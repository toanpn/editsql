import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import Database from 'better-sqlite3';
import fs from 'fs';

// Path to the temporary directory where SQLite files are stored
const TMP_DIR = path.join(process.cwd(), 'tmp');

// Type for composite identifier
interface IdentifierColumn {
  column: string;
  value: unknown;
}

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { tableName, rowIdentifier } = body;

    // Validate required fields
    if (!tableName) {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 }
      );
    }

    // Check that rowIdentifier is valid (either single column or composite)
    if (!rowIdentifier || 
        (!rowIdentifier.compositeIdentifier && (!rowIdentifier.column || rowIdentifier.value === undefined))) {
      return NextResponse.json(
        { error: 'Valid row identifier is required' },
        { status: 400 }
      );
    }

    // If using composite identifier, verify it's an array with at least one identifier
    if (rowIdentifier.compositeIdentifier && 
        (!Array.isArray(rowIdentifier.compositeIdentifier) || rowIdentifier.compositeIdentifier.length === 0)) {
      return NextResponse.json(
        { error: 'Composite identifier must be a non-empty array' },
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
    // Not using readonly mode since we need to make changes
    const db = new Database(dbPath);

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

      // Get column info for validation
      const columnInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
        name: string;
        type: string;
        notnull: number;
        dflt_value: string | null;
        pk: number;
      }>;
      
      // If using a single column identifier, check if it exists
      if (rowIdentifier.column) {
        const identifierColumnExists = columnInfo.some(col => col.name === rowIdentifier.column);
        
        if (!identifierColumnExists) {
          db.close();
          return NextResponse.json(
            { error: 'Identifier column not found' },
            { status: 404 }
          );
        }
      }
      
      // If using composite identifier, validate all columns exist
      if (rowIdentifier.compositeIdentifier) {
        for (const identifier of rowIdentifier.compositeIdentifier as IdentifierColumn[]) {
          const identifierColumnExists = columnInfo.some(col => col.name === identifier.column);
          
          if (!identifierColumnExists) {
            db.close();
            return NextResponse.json(
              { error: `Identifier column '${identifier.column}' not found` },
              { status: 404 }
            );
          }
        }
      }

      // Begin a transaction
      db.prepare('BEGIN TRANSACTION').run();

      try {
        // Prepare WHERE clause
        let whereClause: string;
        let whereParams: unknown[];
        
        if (rowIdentifier.compositeIdentifier) {
          // Composite identifier - build a WHERE clause with AND conditions
          const identifiers = rowIdentifier.compositeIdentifier as IdentifierColumn[];
          whereClause = identifiers.map(id => `"${id.column}" = ?`).join(' AND ');
          whereParams = identifiers.map(id => id.value);
        } else {
          // Single column identifier
          whereClause = `"${rowIdentifier.column}" = ?`;
          whereParams = [rowIdentifier.value];
        }
        
        // Check if the row exists
        const rowQuery = `SELECT COUNT(*) as count FROM "${tableName}" WHERE ${whereClause}`;
        const { count } = db.prepare(rowQuery).get(...whereParams) as { count: number };
        
        if (count === 0) {
          throw new Error(`Row not found with the specified identifiers`);
        }

        // Construct and execute the DELETE statement
        // Using parameterized query to prevent SQL injection
        const deleteQuery = `DELETE FROM "${tableName}" WHERE ${whereClause}`;
        const deleteStmt = db.prepare(deleteQuery);
        
        // Execute delete with parameters
        const result = deleteStmt.run(...whereParams);
        
        // Commit the transaction
        db.prepare('COMMIT').run();
        
        // Return success response
        return NextResponse.json({ 
          success: true,
          message: `Deleted ${result.changes} row(s)`,
          affectedRows: result.changes
        });
      } catch (error) {
        // Rollback the transaction in case of error
        db.prepare('ROLLBACK').run();
        throw error;
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
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete data' },
      { status: 500 }
    );
  }
} 