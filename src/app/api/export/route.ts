import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

// Path to the temporary directory where SQLite files are stored
const TMP_DIR = path.join(process.cwd(), 'tmp');

export async function GET(req: NextRequest) {
  try {
    // Get the session ID from query parameters
    const sessionId = req.nextUrl.searchParams.get('sessionId');
    
    // If no session ID is provided, check cookies
    if (!sessionId) {
      const cookieSessionId = req.cookies.get('sessionId')?.value;
      if (cookieSessionId) {
        return NextResponse.redirect(
          new URL(`/api/export?sessionId=${cookieSessionId}`, req.url)
        );
      } else {
        return NextResponse.json(
          { error: 'No session ID provided' },
          { status: 400 }
        );
      }
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
    
    // Get original filename from dbFile (format: sessionId_originalName.db)
    const filenameParts = dbFile.split('_');
    filenameParts.shift(); // Remove sessionId part
    let originalFilename = filenameParts.join('_'); // Reconstruct original filename
    
    // If we couldn't extract a meaningful filename, use a default
    if (!originalFilename || originalFilename === '') {
      originalFilename = 'database_export.db';
    }
    
    // Create a modified filename to indicate this is an edited version
    let exportFilename = originalFilename;
    if (!exportFilename.includes('_edited')) {
      // Insert '_edited' before the file extension
      const extIndex = exportFilename.lastIndexOf('.');
      if (extIndex !== -1) {
        exportFilename = exportFilename.substring(0, extIndex) + '_edited' + exportFilename.substring(extIndex);
      } else {
        exportFilename = exportFilename + '_edited';
      }
    }

    // Read the file
    const fileBuffer = fs.readFileSync(dbPath);
    
    // Set response headers for file download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${exportFilename}"`);
    headers.set('Content-Type', 'application/vnd.sqlite3');
    headers.set('Content-Length', fileBuffer.length.toString());
    
    // Return the file as the response
    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting database file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export database file' },
      { status: 500 }
    );
  }
} 