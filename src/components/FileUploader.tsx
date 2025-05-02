"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Upload, Database } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// Maximum file size: 10MB (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [".sqlite", ".db"];

interface FileUploaderProps {
  onFileUpload?: (file: File) => void;
}

export const FileUploader = ({ onFileUpload }: FileUploaderProps) => {
  // State to track if a file is being dragged over
  const [isDragging, setIsDragging] = useState(false);
  // State to store the selected file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // State to store validation error message
  const [error, setError] = useState<string | null>(null);
  // State to track upload status
  const [isUploading, setIsUploading] = useState(false);

  // Validate file type and size
  const validateFile = (file: File): boolean => {
    // Reset previous errors
    setError(null);
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    const isValidType = ALLOWED_FILE_TYPES.some(ext => fileName.endsWith(ext));
    if (!isValidType) {
      setError(`Invalid file type. Only ${ALLOWED_FILE_TYPES.join(", ")} files are allowed.`);
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum size is 10MB.`);
      return false;
    }
    
    return true;
  };

  // Handle file selection
  const handleFileSelection = async (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      
      // Only call the onFileUpload callback if validation passes
      if (onFileUpload) {
        setIsUploading(true);
        try {
          await onFileUpload(file);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to upload file');
          setIsUploading(false);
        }
      }
    }
  };

  // Handler functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold mb-2">Open SQLite Database</h2>
        <p className="text-muted-foreground">
          Upload a SQLite database file to view and edit its contents
        </p>
      </div>

      <div
        className={cn(
          "w-full border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-all duration-200 gap-4",
          isDragging
            ? "border-primary bg-primary/5 shadow-md"
            : error
            ? "border-destructive bg-destructive/5"
            : selectedFile
            ? "border-green-500 bg-green-500/5"
            : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="text-center flex flex-col items-center">
            <Database className="h-10 w-10 text-primary mb-4" />
            <p className="font-medium text-lg mb-1">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-center text-lg font-medium">
              Drag & drop your SQLite file here
            </p>
            <p className="text-sm text-muted-foreground">
              Supported formats: {ALLOWED_FILE_TYPES.join(", ")} (Max: 10MB)
            </p>
          </>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="w-full max-w-md">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center w-full max-w-md">
        <Input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".sqlite,.db"
          onChange={handleFileSelect}
        />
        <Button
          className="w-full"
          size="lg"
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            selectedFile ? "Choose Different File" : "Select File"
          )}
        </Button>
      </div>
    </div>
  );
};

export default FileUploader; 