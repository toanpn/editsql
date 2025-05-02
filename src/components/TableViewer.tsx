"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatabaseIcon, Loader2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

// Define types for the API response
interface ColumnInfo {
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | null;
  pk: number;
  cid: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalRows: number;
  totalPages: number;
}

interface TableData {
  tableName: string;
  columns: ColumnInfo[];
  data: Record<string, any>[];
  pagination: PaginationInfo;
}

interface TableViewerProps {
  selectedTable?: string | null;
  isLoading?: boolean;
}

export const TableViewer = ({ selectedTable = null, isLoading: initialLoading = false }: TableViewerProps) => {
  // State for table data
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch table data when a table is selected or pagination changes
  useEffect(() => {
    if (!selectedTable) {
      setTableData(null);
      return;
    }

    const fetchTableData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get session ID from localStorage
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Fetch data from our API route with pagination parameters
        const response = await fetch(
          `/api/data/${selectedTable}?page=${currentPage}&limit=${pageSize}&sessionId=${sessionId}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch table data');
        }

        const data = await response.json();
        setTableData(data);
      } catch (error) {
        console.error("Error fetching table data:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch table data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTableData();
  }, [selectedTable, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (tableData && newPage > 0 && newPage <= tableData.pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle search
  const handleSearch = () => {
    // In a future implementation, we could pass the search term to the API
    // For now, we'll set a flag to indicate searching is happening
    setIsSearching(true);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
  };

  // If no table is selected, show a message
  if (!selectedTable) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <DatabaseIcon className="h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-2">No Table Selected</h3>
        <p>Select a table from the sidebar to view its data</p>
      </div>
    );
  }

  // If loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading table data...</p>
      </div>
    );
  }

  // If there's an error, show the error
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-destructive">
        <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  // If we have table data, show it
  if (tableData) {
    return (
      <div className="h-full flex flex-col">
        <div className="py-2 px-4 border-b">
          <h2 className="font-semibold">Table: {tableData.tableName}</h2>
          <p className="text-xs text-muted-foreground">
            {tableData.pagination.totalRows} rows in total
          </p>
        </div>

        {/* Search bar */}
        <div className="py-2 px-4 border-b flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search data..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchTerm && (
              <button 
                className="absolute right-2 top-2.5"
                onClick={clearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} size="sm">
            Search
          </Button>
        </div>

        {/* Table content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableData.columns.map((column) => (
                    <TableHead key={column.name}>
                      {column.name}
                      {column.pk === 1 && <span className="ml-1 text-xs">(PK)</span>}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.data.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={tableData.columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {tableData.columns.map((column) => (
                        <TableCell key={`${rowIndex}-${column.name}`}>
                          {row[column.name] !== null 
                            ? String(row[column.name]) 
                            : <span className="text-muted-foreground">NULL</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination controls */}
          {tableData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-2 mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {tableData.pagination.totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                  {currentPage} / {tableData.pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === tableData.pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing page size
                  }}
                >
                  <option value="10">10 rows</option>
                  <option value="25">25 rows</option>
                  <option value="50">50 rows</option>
                  <option value="100">100 rows</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback in case tableData is null but we're not loading or showing an error
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <p className="text-muted-foreground">Select a table to view data</p>
    </div>
  );
};

export default TableViewer; 