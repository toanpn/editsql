"use client";

import React from "react";

type Table = {
  name: string;
};

interface SidebarTablesProps {
  tables?: Table[];
  onSelectTable?: (tableName: string) => void;
}

export const SidebarTables = ({
  tables = [],
  onSelectTable,
}: SidebarTablesProps) => {
  return (
    <div className="h-full flex flex-col">
      <div className="py-2 px-3 border-b">
        <h2 className="font-semibold text-sm">Database Tables</h2>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {tables.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>No tables available.</p>
            <p className="mt-1 text-xs">Upload a SQLite file to view tables.</p>
          </div>
        ) : (
          <ul className="space-y-1 p-2">
            {tables.map((table) => (
              <li
                key={table.name}
                className="px-2 py-1.5 text-sm rounded-md hover:bg-accent cursor-pointer"
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