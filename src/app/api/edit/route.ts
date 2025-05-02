import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import Database from 'better-sqlite3';
import fs from 'fs';

// Path to the temporary directory where SQLite files are stored
const TMP_DIR = path.join(process.cwd(), 'tmp');

export async function POST(req: NextRequest) {
  try {
    // Get the request body
    const body = await req.json();
    const { tableName, rowIdentifier, columnName, newValue } = body;

    // Validate required fields
    if (!tableName) {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 }
      );
    }

    if (!columnName) {
      return NextResponse.json(
        { error: 'Column name is required' },
        { status: 400 }
      );
    }

    if (!rowIdentifier || !rowIdentifier.column || rowIdentifier.value === undefined) {
      return NextResponse.json(
        { error: 'Row identifier (column and value) is required' },
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

      // Validate that the column exists in the table
      const columnInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
      const columnExists = columnInfo.some((col: any) => col.name === columnName);
      
      if (!columnExists) {
        db.close();
        return NextResponse.json(
          { error: 'Column not found' },
          { status: 404 }
        );
      }

      // Check if the identifier column exists
      const identifierColumnExists = columnInfo.some((col: any) => col.name === rowIdentifier.column);
      
      if (!identifierColumnExists) {
        db.close();
        return NextResponse.json(
          { error: 'Identifier column not found' },
          { status: 404 }
        );
      }

      // Begin a transaction
      db.prepare('BEGIN TRANSACTION').run();

      try {
        // Verify that the row exists
        const rowQuery = `SELECT COUNT(*) as count FROM "${tableName}" WHERE "${rowIdentifier.column}" = ?`;
        const { count } = db.prepare(rowQuery).get(rowIdentifier.value) as { count: number };
        
        if (count === 0) {
          throw new Error(`Row with ${rowIdentifier.column} = ${rowIdentifier.value} not found`);
        }

        // Construct and execute the UPDATE statement
        // Using parameterized query to prevent SQL injection
        const updateQuery = `UPDATE "${tableName}" SET "${columnName}" = ? WHERE "${rowIdentifier.column}" = ?`;
        const updateStmt = db.prepare(updateQuery);
        
        // Handle null values
        const valueToUse = newValue === null ? null : newValue;
        
        const result = updateStmt.run(valueToUse, rowIdentifier.value);
        
        // Commit the transaction
        db.prepare('COMMIT').run();
        
        // Return success response
        return NextResponse.json({ 
          success: true,
          message: `Updated ${result.changes} row(s)`,
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
    console.error('Error updating data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update data' },
      { status: 500 }
    );
  }
} 