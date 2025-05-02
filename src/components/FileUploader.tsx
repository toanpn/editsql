"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const FileUploader = () => {
  // State to track if a file is being dragged over
  const [isDragging, setIsDragging] = React.useState(false);

  // Handler functions (these will be implemented later)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Implementation will come in Phase 2
    console.log("File dropped, will be implemented in Phase 2");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation will come in Phase 2
    console.log("File selected, will be implemented in Phase 2");
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <div
        className={`w-full border-2 border-dashed rounded-lg p-8 h-32 flex flex-col items-center justify-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-gray-300 dark:border-gray-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-center mb-2">
          Drag & drop your SQLite file (.sqlite, .db)
        </p>
        <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
      </div>

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
        >
          Select File
        </Button>
      </div>
    </div>
  );
};

export default FileUploader; 