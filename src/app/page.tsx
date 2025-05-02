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
  // This is a placeholder. Real implementation will be added in later phases
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [activeView, setActiveView] = useState<"table" | "sql">("table");

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
            <FileUploader />
          </div>
        ) : (
          <ResizablePanelGroup
            direction="horizontal"
            className="min-h-full"
          >
            {/* Sidebar */}
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <SidebarTables />
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
