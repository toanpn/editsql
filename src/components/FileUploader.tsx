"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

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
  const handleFileSelection = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      
      // Only call the onFileUpload callback if validation passes
      if (onFileUpload) {
        setIsUploading(true);
        // In a real implementation, you might want to add error handling here
        onFileUpload(file);
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
    <div className="w-full flex flex-col items-center space-y-4">
      <div
        className={`w-full border-2 border-dashed rounded-lg p-8 h-32 flex flex-col items-center justify-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : error
            ? "border-destructive bg-destructive/10"
            : selectedFile
            ? "border-green-500 bg-green-500/10"
            : "border-gray-300 dark:border-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="text-center">
            <p className="font-medium mb-1">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <p className="text-center mb-2">
              Drag & drop your SQLite file (.sqlite, .db)
            </p>
            <p className="text-xs text-muted-foreground">Maximum file size: 10MB</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center text-destructive text-sm gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
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
          onClick={() => document.getElementById("file-upload")?.click()}
          disabled={isUploading}
        >
          {selectedFile ? "Choose Different File" : "Select File"}
        </Button>
      </div>
    </div>
  );
};

export default FileUploader; 