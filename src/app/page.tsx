"use client";

import { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import FileUploader from "@/components/FileUploader";
import SidebarTables from "@/components/SidebarTables";
import TableViewer from "@/components/TableViewer";
import SQLCli from "@/components/SQLCli";
import ExportButton from "@/components/ExportButton";
import { AlertCircle } from "lucide-react";

export default function Home() {
  // State for the uploaded file and tables
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [activeView, setActiveView] = useState<"table" | "sql">("table");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [tables, setTables] = useState<{ name: string }[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableDataLoading, setIsTableDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setUploadedFile(file);
    setError(null);
    
    try {
      // Create a FormData object and append the file
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the file to our API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }
      
      // Store the session ID in localStorage for future use
      if (data.sessionId) {
        localStorage.setItem('sessionId', data.sessionId);
        
        // Fetch the table list using the newly created session ID
        const tablesResponse = await fetch(`/api/tables?sessionId=${data.sessionId}`);
        const tablesData = await tablesResponse.json();
        
        if (!tablesResponse.ok) {
          throw new Error(tablesData.error || 'Failed to load tables');
        }
        
        // Set the tables in state
        setTables(tablesData.tables);
      }
      
      // Set file as uploaded
      setIsFileUploaded(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle table selection
  const handleTableSelect = (tableName: string) => {
    // Clear any previous table selection and set the new one
    setSelectedTable(tableName);
    // Set loading state to true - the TableViewer component will handle loading state internally
    setIsTableDataLoading(true);
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">SQLite Editor WebApp</h1>
        <ExportButton className={!isFileUploaded ? 'opacity-50 pointer-events-none' : ''} />
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!isFileUploaded ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            {error && (
              <div className="mb-6 w-full max-w-md p-4 bg-destructive/10 border border-destructive rounded-md text-destructive flex items-start gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            <FileUploader onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-full"
          >
            {/* Sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <SidebarTables 
                tables={tables} 
                onSelectTable={handleTableSelect} 
                selectedTable={selectedTable}
                isLoading={isLoading}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Main Panel */}
            <ResizablePanel defaultSize={80}>
              <div className="h-full flex flex-col">
                {/* View Toggle Tabs */}
                <div className="border-b flex">
                  <button
                    onClick={() => setActiveView("table")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeView === "table"
                        ? "border-b-2 border-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setActiveView("sql")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeView === "sql"
                        ? "border-b-2 border-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    SQL CLI
                  </button>
                </div>

                {/* Active View */}
                <div className="flex-1 overflow-hidden">
                  {activeView === "table" ? (
                    <TableViewer 
                      selectedTable={selectedTable} 
                      isLoading={isTableDataLoading} 
                    />
                  ) : (
                    <SQLCli />
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t p-2 text-center text-xs text-muted-foreground">
        SQLite Editor WebApp - MVP Version
      </footer>
    </main>
  );
}
