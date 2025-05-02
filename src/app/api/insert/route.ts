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
    const { tableName, rowData } = body;

    // Validate required fields
    if (!tableName) {
      return NextResponse.json(
        { error: 'Table name is required' },
        { status: 400 }
      );
    }

    if (!rowData || typeof rowData !== 'object' || Object.keys(rowData).length === 0) {
      return NextResponse.json(
        { error: 'Row data is required and must be a non-empty object' },
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

      // Fetch column information to validate data types and constraints
      const columnInfoQuery = `PRAGMA table_info(${tableName})`;
      const columns = db.prepare(columnInfoQuery).all() as Array<{
        name: string;
        type: string;
        notnull: number;
        dflt_value: string | null;
        pk: number;
      }>;
      
      // Check for required columns (NOT NULL without default value)
      const requiredColumns = columns.filter((col) => 
        col.notnull === 1 && 
        col.dflt_value === null && 
        // Skip primary key columns with AUTOINCREMENT 
        !(col.pk === 1 && isAutoIncrementColumn(db, tableName, col.name))
      );
      
      for (const col of requiredColumns) {
        // Skip if the column is provided in rowData or is an autoincrement primary key
        if (rowData[col.name] === undefined) {
          db.close();
          return NextResponse.json({
            error: `Missing required value for column '${col.name}'`,
            status: 400
          });
        }
      }

      // Begin a transaction
      db.prepare('BEGIN TRANSACTION').run();

      try {
        // Prepare column names and placeholders for the INSERT statement
        const columnNames = Object.keys(rowData).filter(colName => 
          // Filter out any column names that don't exist in the table
          columns.some((col) => col.name === colName)
        );
        
        // If no valid columns were provided, return an error
        if (columnNames.length === 0) {
          throw new Error('No valid columns were provided');
        }
        
        const placeholders = columnNames.map(() => '?').join(', ');
        const values = columnNames.map(colName => rowData[colName]);
        
        // Construct and execute the INSERT statement
        const insertQuery = `INSERT INTO "${tableName}" (${columnNames.map(col => `"${col}"`).join(', ')}) VALUES (${placeholders})`;
        const insertStmt = db.prepare(insertQuery);
        
        const result = insertStmt.run(values);
        
        // Fetch the newly inserted row
        // For tables with a rowid or INTEGER PRIMARY KEY, we can get the last inserted id
        const lastRowId = result.lastInsertRowid;
        
        // Find the primary key column (if any)
        const pkColumn = columns.find((col) => col.pk === 1);
        
        let newRow;
        if (pkColumn) {
          // If there's a PK column, use it to fetch the new row
          const selectQuery = `SELECT * FROM "${tableName}" WHERE "${pkColumn.name}" = ?`;
          newRow = db.prepare(selectQuery).get(lastRowId);
        } else {
          // Otherwise, try to match based on provided values
          // This is less reliable but a reasonable fallback
          let whereClause = columnNames.map(col => `"${col}" = ?`).join(' AND ');
          const selectQuery = `SELECT * FROM "${tableName}" WHERE ${whereClause} ORDER BY rowid DESC LIMIT 1`;
          newRow = db.prepare(selectQuery).get(values);
        }

        // Commit the transaction
        db.prepare('COMMIT').run();
        
        // Return success response with the new row data
        return NextResponse.json({ 
          success: true,
          message: 'Row inserted successfully',
          newRow
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
  } catch (error: any) {
    console.error('Error inserting data:', error);
    
    // Check for specific SQLite constraint errors
    const errorMessage = error.message || 'Failed to insert data';
    
    // Handle common SQLite constraints
    let status = 500;
    if (errorMessage.includes('UNIQUE constraint failed')) {
      status = 409; // Conflict
    } else if (errorMessage.includes('FOREIGN KEY constraint failed')) {
      status = 422; // Unprocessable Entity
    } else if (errorMessage.includes('CHECK constraint failed')) {
      status = 422; // Unprocessable Entity
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
}

// Helper function to check if a column is an auto-increment primary key
function isAutoIncrementColumn(db: any, tableName: string, columnName: string): boolean {
  try {
    // Check if the table was created with AUTOINCREMENT
    const createTableSql = db.prepare(`
      SELECT sql FROM sqlite_master 
      WHERE type = 'table' AND name = ?
    `).get(tableName)?.sql;
    
    if (!createTableSql) return false;
    
    // Look for "INTEGER PRIMARY KEY AUTOINCREMENT" pattern for this column
    const pattern = new RegExp(`["']?${columnName}["']?\\s+INTEGER\\s+PRIMARY\\s+KEY\\s+AUTOINCREMENT`, 'i');
    return pattern.test(createTableSql);
  } catch (error) {
    console.error('Error checking for AUTOINCREMENT:', error);
    return false;
  }
} 