"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const TableViewer = () => {
  // This is a placeholder. Real implementation will come in Phase 3
  const mockColumns = ["id", "name", "created_at"];
  const mockData = [
    { id: 1, name: "Example 1", created_at: "2023-01-01" },
    { id: 2, name: "Example 2", created_at: "2023-01-02" },
    { id: 3, name: "Example 3", created_at: "2023-01-03" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="py-2 px-4 border-b">
        <h2 className="font-semibold">Table Data</h2>
        <p className="text-xs text-muted-foreground">
          Select a table from the sidebar to view data
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {mockColumns.map((column) => (
                  <TableHead key={column}>{column}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((row) => (
                <TableRow key={row.id}>
                  {mockColumns.map((column) => (
                    <TableCell key={`${row.id}-${column}`}>
                      {row[column as keyof typeof row]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          Displaying mock data. Real data will be implemented in Phase 3.
        </div>
      </div>
    </div>
  );
};

export default TableViewer; 