"use client";

import React, { useEffect, useState, useRef } from "react";
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
import { 
  DatabaseIcon, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  Check, 
  AlertCircle,
  Info,
  Edit2,
  PlusCircle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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

interface EditingCell {
  rowIndex: number;
  columnName: string;
  originalValue: any;
}

// New interface for type validation result
interface ValidationResult {
  isValid: boolean;
  formattedValue: any;
  error?: string;
}

export const TableViewer = ({ selectedTable = null, isLoading: initialLoading = false }: TableViewerProps) => {
  // State for table data
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);
  
  // State for editing
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // New state for validation feedback
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // Track if a value has been changed from its original
  const [isValueChanged, setIsValueChanged] = useState(false);
  
  // Track cells that were successfully edited
  const [recentlyEditedCells, setRecentlyEditedCells] = useState<Set<string>>(new Set());

  // New state for add row dialog
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [addRowErrors, setAddRowErrors] = useState<Record<string, string>>({});

  // Fetch table data when a table is selected or pagination changes
  useEffect(() => {
    if (!selectedTable) {
      setTableData(null);
      return;
    }

    const fetchTableData = async () => {
      setIsLoading(true);
      setError(null);
      // Reset editing state when changing tables or pages
      setEditingCell(null);
      setEditValue("");
      setEditError(null);

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

  // Focus the input when editing a cell
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);
  
  // Effect to clear the recently edited cells highlight after 3 seconds
  useEffect(() => {
    if (recentlyEditedCells.size > 0) {
      const timer = setTimeout(() => {
        setRecentlyEditedCells(new Set());
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [recentlyEditedCells]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (tableData && newPage > 0 && newPage <= tableData.pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle cell click to start editing
  const handleCellClick = (rowIndex: number, columnName: string, value: any) => {
    // Don't allow editing primary keys for simplicity
    const isPrimaryKey = tableData?.columns.find(col => col.name === columnName)?.pk === 1;
    if (isPrimaryKey) return;

    setEditingCell({ rowIndex, columnName, originalValue: value });
    setEditValue(value === null ? "" : String(value));
    setIsValueChanged(false);
    setValidationResult(null);
    setEditError(null);
  };

  // Handle editing input change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    
    // Check if value has changed from original
    if (editingCell) {
      const originalValue = editingCell.originalValue === null ? "" : String(editingCell.originalValue);
      setIsValueChanged(newValue !== originalValue);
    }
    
    // Perform real-time validation based on column type
    if (tableData && editingCell) {
      const column = tableData.columns.find(col => col.name === editingCell.columnName);
      
      if (column) {
        validateValue(newValue, column);
      }
    }
  };
  
  // Validate value against column type
  const validateValue = (value: string, column: ColumnInfo): ValidationResult => {
    let result: ValidationResult = { isValid: true, formattedValue: value };
    
    // Handle empty value
    if (value === "") {
      // Empty is valid for nullable fields (becomes NULL)
      if (column.notnull === 0) {
        result = { isValid: true, formattedValue: null };
      } 
      // For non-null numeric fields, convert to 0
      else if (column.type.includes("INT") || column.type.includes("FLOAT") || column.type.includes("REAL")) {
        result = { isValid: true, formattedValue: 0 };
      }
      // Non-null text fields - empty string is valid
      else {
        result = { isValid: true, formattedValue: "" };
      }
    } 
    // Handle numeric types
    else if (column.type.includes("INT")) {
      // For INTEGER type, must be a whole number
      if (!/^-?\d+$/.test(value)) {
        result = { 
          isValid: false, 
          formattedValue: value,
          error: "Must be a whole number" 
        };
      } else {
        result = { isValid: true, formattedValue: parseInt(value, 10) };
      }
    } 
    else if (column.type.includes("FLOAT") || column.type.includes("REAL") || column.type.includes("DOUBLE")) {
      // For floating point types, can be any number
      if (!/^-?\d*\.?\d*$/.test(value) || isNaN(parseFloat(value))) {
        result = { 
          isValid: false, 
          formattedValue: value,
          error: "Must be a valid number" 
        };
      } else {
        result = { isValid: true, formattedValue: parseFloat(value) };
      }
    }
    // Add more type validations as needed (e.g., DATE, BOOLEAN, etc.)
    
    setValidationResult(result);
    return result;
  };

  // Handle saving the edit
  const handleSaveEdit = async () => {
    if (!editingCell || !tableData) return;
    
    // If no change, just cancel
    if (!isValueChanged) {
      handleCancelEdit();
      return;
    }
    
    // Revalidate before saving
    const column = tableData.columns.find(col => col.name === editingCell.columnName);
    if (!column) {
      setEditError("Column information not found");
      return;
    }
    
    const validation = validateValue(editValue, column);
    if (!validation.isValid) {
      setEditError(validation.error || "Invalid value for this column type");
      return;
    }

    setIsEditing(true);
    setEditError(null);

    try {
      // Find primary key column for the row identifier
      const pkColumn = tableData.columns.find(col => col.pk === 1);
      if (!pkColumn) {
        // If no PK, use the first column as identifier (not ideal but a fallback)
        throw new Error("No primary key found for this table");
      }

      // Get the row data
      const row = tableData.data[editingCell.rowIndex];
      const pkValue = row[pkColumn.name];

      // Get session ID
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      // Call the edit API
      const response = await fetch(`/api/edit?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: tableData.tableName,
          rowIdentifier: {
            column: pkColumn.name,
            value: pkValue,
          },
          columnName: editingCell.columnName,
          newValue: validation.formattedValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update data');
      }

      // Update the data in the local state
      const newData = [...tableData.data];
      newData[editingCell.rowIndex][editingCell.columnName] = validation.formattedValue;
      setTableData({
        ...tableData,
        data: newData
      });

      // Add to recently edited cells
      const cellKey = `${editingCell.rowIndex}-${editingCell.columnName}`;
      setRecentlyEditedCells(prev => new Set(prev).add(cellKey));
      
      // Show success toast
      toast({
        title: "Value updated",
        description: `Successfully updated ${editingCell.columnName}`,
        duration: 3000,
      });

      // Clear editing state
      setEditingCell(null);
      setEditValue("");
      setValidationResult(null);
    } catch (error) {
      console.error("Error saving edit:", error);
      setEditError(error instanceof Error ? error.message : 'Failed to update data');
    } finally {
      setIsEditing(false);
    }
  };

  // Handle canceling the edit
  const handleCancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
    setEditError(null);
    setValidationResult(null);
  };

  // Handle keydown events in the edit input
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // Format cell display value based on its type
  const formatCellValue = (value: any, column: ColumnInfo) => {
    if (value === null) {
      return <span className="text-muted-foreground">NULL</span>;
    }
    
    // Format based on column type
    if (column.type.includes("INT") || column.type.includes("FLOAT") || column.type.includes("REAL")) {
      return <span className="font-mono">{value}</span>;
    }
    
    // Default formatting
    return String(value);
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

  // Reset new row form when dialog opens or table changes
  useEffect(() => {
    if (isAddRowDialogOpen && tableData) {
      // Initialize with empty values
      const initialData: Record<string, any> = {};
      tableData.columns.forEach(column => {
        // Skip likely auto-increment primary keys (INTEGER PRIMARY KEY)
        if (!(column.pk === 1 && column.type.toUpperCase().includes('INTEGER'))) {
          initialData[column.name] = null;
        }
      });
      setNewRowData(initialData);
      setAddRowErrors({});
    }
  }, [isAddRowDialogOpen, tableData?.tableName]);

  // Handle adding a new row
  const handleAddRow = async () => {
    if (!tableData) return;
    
    // Validate all fields
    const errors: Record<string, string> = {};
    let hasErrors = false;

    tableData.columns.forEach(column => {
      // Skip likely auto-increment primary keys
      if (column.pk === 1 && column.type.toUpperCase().includes('INTEGER')) {
        return;
      }

      // Required fields (NOT NULL without default)
      if (column.notnull === 1 && column.dflt_value === null && newRowData[column.name] === null) {
        errors[column.name] = "This field is required";
        hasErrors = true;
        return;
      }

      // Type validation for non-null values
      if (newRowData[column.name] !== null) {
        const validation = validateValue(String(newRowData[column.name]), column);
        if (!validation.isValid) {
          errors[column.name] = validation.error || "Invalid value";
          hasErrors = true;
          return;
        }

        // Update with formatted value
        newRowData[column.name] = validation.formattedValue;
      }
    });

    if (hasErrors) {
      setAddRowErrors(errors);
      return;
    }

    setIsAddingRow(true);
    setAddRowErrors({});

    try {
      // Get session ID
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      // Call the insert API
      const response = await fetch(`/api/insert?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: tableData.tableName,
          rowData: newRowData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to insert row');
      }

      const result = await response.json();

      // Add the new row to the table data
      if (result.newRow) {
        // If we're on the last page or there's only one page, add to current page
        const isLastPage = currentPage === tableData.pagination.totalPages;
        if (isLastPage) {
          const newData = [...tableData.data, result.newRow];
          setTableData({
            ...tableData,
            data: newData,
            pagination: {
              ...tableData.pagination,
              totalRows: tableData.pagination.totalRows + 1,
              totalPages: Math.ceil((tableData.pagination.totalRows + 1) / tableData.pagination.limit)
            }
          });
        } else {
          // If not on the last page, just update the pagination counts
          setTableData({
            ...tableData,
            pagination: {
              ...tableData.pagination,
              totalRows: tableData.pagination.totalRows + 1,
              totalPages: Math.ceil((tableData.pagination.totalRows + 1) / tableData.pagination.limit)
            }
          });
        }
      }

      // Close the dialog and show success message
      setIsAddRowDialogOpen(false);
      toast({
        title: "Success",
        description: "New row added successfully",
      });
    } catch (error) {
      console.error("Error adding row:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add row',
        variant: "destructive",
      });
    } finally {
      setIsAddingRow(false);
    }
  };

  // Handle input change for new row form
  const handleNewRowInputChange = (columnName: string, value: string) => {
    setNewRowData(prev => ({
      ...prev,
      [columnName]: value === "" ? null : value
    }));

    // Clear error for this field if exists
    if (addRowErrors[columnName]) {
      setAddRowErrors(prev => {
        const updated = { ...prev };
        delete updated[columnName];
        return updated;
      });
    }
  };

  // Helper function to check if a column is likely an auto-increment primary key
  const isAutoIncrementColumn = (columnName: string): boolean => {
    // This is a simplified check - in a real app you'd query the database
    // For SQLite, INTEGER PRIMARY KEY columns are typically auto-increment
    const column = tableData?.columns.find(col => col.name === columnName);
    return column?.pk === 1 && (column?.type.toUpperCase().includes('INTEGER'));
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
      <TooltipProvider>
        <div className="h-full flex flex-col">
          <div className="py-2 px-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Table: {tableData.tableName}</h2>
              <Button 
                size="sm" 
                onClick={() => setIsAddRowDialogOpen(true)} 
                className="ml-auto"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {tableData.pagination.totalRows} rows in total
              </p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground gap-1 cursor-help">
                    <Info className="h-3 w-3" />
                    <span>Editing instructions</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-semibold mb-1">Editing instructions:</p>
                    <ul className="text-xs list-disc pl-4 space-y-1">
                      <li>Click on any non-primary key cell to edit</li>
                      <li>Press Enter to save, Esc to cancel</li>
                      <li>Empty value will be NULL if column allows nulls</li>
                      <li>Primary key columns cannot be edited</li>
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Edit error message */}
          {editError && (
            <div className="py-2 px-4 border-b bg-destructive/10 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{editError}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto" 
                onClick={() => setEditError(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

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
                        <div className="flex items-center">
                          <span>{column.name}</span>
                          {column.pk === 1 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-1 text-xs bg-primary/10 text-primary px-1 rounded">PK</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Primary Key (cannot be edited)</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {column.notnull === 1 && !column.pk && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-1 text-xs bg-amber-500/10 text-amber-500 px-1 rounded">!</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">NOT NULL constraint</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {column.type}
                        </div>
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
                        {tableData.columns.map((column) => {
                          const cellKey = `${rowIndex}-${column.name}`;
                          const isEditable = column.pk !== 1;
                          const isRecentlyEdited = recentlyEditedCells.has(cellKey);
                          
                          return (
                            <TableCell 
                              key={cellKey}
                              className={`relative ${isEditable ? "cursor-pointer hover:bg-muted/50" : ""} ${
                                isRecentlyEdited ? "bg-green-100 dark:bg-green-900/20" : ""
                              }`}
                              onClick={() => isEditable && handleCellClick(rowIndex, column.name, row[column.name])}
                            >
                              {editingCell?.rowIndex === rowIndex && editingCell?.columnName === column.name ? (
                                <div className="flex items-center gap-1">
                                  <div className="relative flex-1">
                                    <Input
                                      ref={inputRef}
                                      value={editValue}
                                      onChange={handleEditChange}
                                      onKeyDown={handleEditKeyDown}
                                      className={`h-7 py-1 ${
                                        validationResult && !validationResult.isValid 
                                          ? "border-red-500 focus-visible:ring-red-500" 
                                          : ""
                                      }`}
                                      disabled={isEditing}
                                    />
                                    {validationResult && !validationResult.isValid && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertCircle className="absolute right-2 top-1.5 h-4 w-4 text-red-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs">{validationResult.error}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-6 w-6" 
                                      onClick={handleSaveEdit}
                                      disabled={isEditing || (validationResult?.isValid === false)}
                                    >
                                      {isEditing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-6 w-6" 
                                      onClick={handleCancelEdit}
                                      disabled={isEditing}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {formatCellValue(row[column.name], column)}
                                  {isEditable && (
                                    <Edit2 className="h-3 w-3 text-muted-foreground/50 absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  )}
                                </>
                              )}
                            </TableCell>
                          );
                        })}
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

          {/* Add Row Dialog */}
          <Dialog open={isAddRowDialogOpen} onOpenChange={setIsAddRowDialogOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Row to {tableData.tableName}</DialogTitle>
                <DialogDescription>
                  Fill in the values for the new row. Fields marked with * are required.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {tableData.columns.map((column) => {
                  // Skip auto-increment primary keys in the form
                  if (column.pk === 1 && column.type.toUpperCase().includes('INTEGER')) {
                    return (
                      <div key={column.name} className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor={column.name} className="text-right">
                          {column.name}
                          <span className="ml-1 text-xs bg-primary/10 text-primary px-1 rounded">PK (auto)</span>
                        </Label>
                        <div className="col-span-3 text-sm text-muted-foreground">
                          Will be automatically generated
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={column.name} className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={column.name} className="text-right">
                        {column.name}
                        {column.pk === 1 && (
                          <span className="ml-1 text-xs bg-primary/10 text-primary px-1 rounded">PK</span>
                        )}
                        {column.notnull === 1 && column.dflt_value === null && (
                          <span className="ml-1 text-xs text-red-500">*</span>
                        )}
                      </Label>
                      <div className="col-span-3">
                        <div className="text-xs text-muted-foreground mb-1">
                          {column.type} {column.dflt_value ? `(Default: ${column.dflt_value})` : ''}
                        </div>
                        <Input
                          id={column.name}
                          value={newRowData[column.name] === null ? '' : newRowData[column.name]}
                          onChange={(e) => handleNewRowInputChange(column.name, e.target.value)}
                          placeholder={column.notnull === 0 ? "NULL if empty" : ""}
                          className={addRowErrors[column.name] ? "border-red-500" : ""}
                        />
                        {addRowErrors[column.name] && (
                          <p className="text-xs text-red-500 mt-1">{addRowErrors[column.name]}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddRowDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddRow} disabled={isAddingRow}>
                  {isAddingRow ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Row"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
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