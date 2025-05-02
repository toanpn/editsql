"use client";

import React from "react";
import { Loader2, Database, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Table = {
  name: string;
};

interface SidebarTablesProps {
  tables?: Table[];
  onSelectTable?: (tableName: string) => void;
  selectedTable?: string | null;
  isLoading?: boolean;
}

export const SidebarTables = ({
  tables = [],
  onSelectTable,
  selectedTable = null,
  isLoading = false,
}: SidebarTablesProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="py-3 px-4 border-b flex justify-between items-center bg-muted/50">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Database Tables</h2>
        </div>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      
      <div className="overflow-y-auto flex-1 p-1">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary/70" />
            <p>Loading tables...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center justify-center h-full">
            <Table2 className="w-8 h-8 mb-3 text-muted-foreground/70" />
            <p>No tables available</p>
            <p className="mt-2 text-xs">Upload a SQLite file to view tables</p>
          </div>
        ) : (
          <ul className="space-y-0.5 p-2">
            {tables.map((table) => (
              <li
                key={table.name}
                className={cn(
                  "px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex items-center gap-2",
                  selectedTable === table.name 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted/80 text-foreground/90"
                )}
                onClick={() => onSelectTable?.(table.name)}
              >
                <Table2 className={cn(
                  "h-3.5 w-3.5",
                  selectedTable === table.name ? "text-primary" : "text-muted-foreground"
                )} />
                <span className="truncate">{table.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SidebarTables; 