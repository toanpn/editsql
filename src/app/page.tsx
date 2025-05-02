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

export default function Home() {
  // State for the uploaded file and tables
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [activeView, setActiveView] = useState<"table" | "sql">("table");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [tables, setTables] = useState<{ name: string }[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setUploadedFile(file);
    
    try {
      // In Phase 5, we'll implement the actual API call to upload the file and get tables
      // For now, just simulate a successful upload after a delay
      setTimeout(() => {
        // In Phase 5, we'll get the actual tables from the API response
        setIsFileUploaded(true);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error uploading file:", error);
      setIsLoading(false);
      // In a real implementation, display an error message to the user
    }
  };

  // Handle table selection
  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    // In Phase 3, we'll implement the actual table data fetching
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center">
        <h1 className="font-bold text-xl">SQLite Editor WebApp</h1>
        <ExportButton isEnabled={isFileUploaded} />
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {!isFileUploaded ? (
          <div className="h-full flex items-center justify-center p-8">
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
                  {activeView === "table" ? <TableViewer /> : <SQLCli />}
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
