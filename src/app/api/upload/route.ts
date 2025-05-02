import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Maximum file size: 10MB (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['.sqlite', '.db'];
const TMP_DIR = path.join(process.cwd(), 'tmp');

// Helper function to validate file type
const isValidFileType = (filename: string): boolean => {
  const lowercaseName = filename.toLowerCase();
  return ALLOWED_FILE_TYPES.some(ext => lowercaseName.endsWith(ext));
};

// Ensure tmp directory exists
async function ensureTmpDir() {
  try {
    await fs.access(TMP_DIR);
  } catch {
    await fs.mkdir(TMP_DIR, { recursive: true });
  }
}

// Generate a unique session ID
function generateSessionId(): string {
  return crypto.randomUUID();
}

export async function POST(req: NextRequest) {
  try {
    // Make sure tmp directory exists
    await ensureTmpDir();

    // Get session ID from cookies
    let sessionId = req.cookies.get('sessionId')?.value;
    
    // Generate a new session ID if none exists
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidFileType(file.name)) {
      return NextResponse.json(
        { error: `Invalid file type. Only ${ALLOWED_FILE_TYPES.join(', ')} files are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File is too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create a filename with the session ID
    const fileExt = path.extname(file.name);
    const newFilename = `${sessionId}${fileExt}`;
    const newFilepath = path.join(TMP_DIR, newFilename);

    // If there's an existing file with this session ID, delete it
    try {
      await fs.access(newFilepath);
      await fs.unlink(newFilepath);
    } catch (error) {
      // File doesn't exist, which is fine
    }

    // Convert File to ArrayBuffer, then Buffer, and save to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(newFilepath, buffer);

    // Create response with session ID cookie
    const response = NextResponse.json({
      success: true,
      sessionId,
      filename: file.name,
      filepath: newFilepath,
    });

    // Set cookie if it doesn't exist
    if (!req.cookies.has('sessionId')) {
      response.cookies.set({
        name: 'sessionId',
        value: sessionId,
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        // In production, you would want to set secure: true
      });
    }

    return response;
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
} 