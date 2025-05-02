"use client";

import React from "react";
import { Loader2 } from "lucide-react";

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
      <div className="py-2 px-3 border-b flex justify-between items-center">
        <h2 className="font-semibold text-sm">Database Tables</h2>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      </div>
      
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Loading tables...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>No tables available.</p>
            <p className="mt-1 text-xs">Upload a SQLite file to view tables.</p>
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {tables.map((table) => (
              <li
                key={table.name}
                className={`px-2 py-1.5 text-sm rounded-md hover:bg-accent cursor-pointer transition-colors
                  ${selectedTable === table.name ? 'bg-accent font-medium' : ''}
                `}
                onClick={() => onSelectTable?.(table.name)}
              >
                {table.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SidebarTables; 