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
import { AlertCircle, Database } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <main className="flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-background to-muted p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <h1 className="font-bold text-xl">SQLite Editor WebApp</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ExportButton className={cn(
            "transition-all duration-200",
            !isFileUploaded && "opacity-50 pointer-events-none"
          )} />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!isFileUploaded ? (
          <div className="h-full flex flex-col items-center justify-center p-8 max-w-3xl mx-auto">
            {error && (
              <Alert variant="destructive" className="mb-6 w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FileUploader onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-full"
          >
            {/* Sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="border-r bg-muted/30">
              <SidebarTables 
                tables={tables} 
                onSelectTable={handleTableSelect} 
                selectedTable={selectedTable}
                isLoading={isLoading}
              />
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-border" />

            {/* Main Panel */}
            <ResizablePanel defaultSize={80}>
              <div className="h-full flex flex-col">
                {/* View Toggle Tabs */}
                <div className="border-b flex">
                  <button
                    onClick={() => setActiveView("table")}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors relative",
                      activeView === "table"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setActiveView("sql")}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors relative",
                      activeView === "sql"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
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
      <footer className="border-t py-2 px-4 text-center text-xs text-muted-foreground bg-muted/30">
        <p>SQLite Editor WebApp - MVP Version</p>
      </footer>
    </main>
  );
}
