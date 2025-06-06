"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
  PlusCircle,
  CheckCircle2,
  XCircle,
  Trash2
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
  
  // Filtered data based on search term
  const filteredData = useMemo(() => {
    if (!tableData || !searchTerm.trim()) {
      return tableData?.data || [];
    }
    
    // Filter data based on search term (case-insensitive)
    const searchLower = searchTerm.toLowerCase();
    return tableData.data.filter(row => {
      // Check if any column value includes the search term
      return Object.entries(row).some(([, value]) => {
        // Skip null values
        if (value === null) return false;
        // Convert value to string and check if it includes the search term
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [tableData, searchTerm]);
  
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
  
  // Add a state to track when a row was added (used to trigger reload)
  const [lastRowAddedAt, setLastRowAddedAt] = useState<number | null>(null);

  // Add state for delete row confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<{index: number; row: Record<string, unknown>} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch table data when a table is selected or pagination changes or a row is added
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
          `/api/data/${selectedTable}?page=${currentPage}&limit=${pageSize}&sessionId=${sessionId}${lastRowAddedAt ? `&_t=${lastRowAddedAt}` : ''}`
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
  }, [selectedTable, currentPage, pageSize, lastRowAddedAt]);

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
      // Get the row data
      const row = tableData.data[editingCell.rowIndex];
      
      // Find primary key column for the row identifier
      const pkColumn = tableData.columns.find(col => col.pk === 1);
      
      // Create a row identifier - either using primary key or fallback to using all columns
      let rowIdentifier;
      
      if (pkColumn) {
        // If we have a primary key, use it
        rowIdentifier = {
          column: pkColumn.name,
          value: row[pkColumn.name]
        };
      } else {
        // Fallback: Create a composite identifier using all column values except the one being edited
        // This creates a WHERE clause with all columns to uniquely identify the row
        const identifierColumns = tableData.columns
          .filter(col => col.name !== editingCell.columnName)
          .map(col => ({
            column: col.name,
            value: row[col.name]
          }));
        
        if (identifierColumns.length === 0) {
          setEditError("Cannot edit this table - no way to uniquely identify rows");
          setIsEditing(false);
          return;
        }
        
        rowIdentifier = {
          compositeIdentifier: identifierColumns
        };
      }

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
          rowIdentifier,
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
        variant: "default",
        className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
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
      return <span className="text-muted-foreground text-xs italic">NULL</span>;
    }
    
    // Format based on column type
    if (column.type.includes("INT") || column.type.includes("FLOAT") || column.type.includes("REAL")) {
      return <span className="font-mono text-blue-600 dark:text-blue-400">{value}</span>;
    }

    if (typeof value === 'string' && value.length > 100) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help">{value.substring(0, 100)}...</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-md">
            <p className="text-xs whitespace-pre-wrap break-words">{value}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    
    // Default formatting
    return String(value);
  };

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      // Reset to first page when searching
      setCurrentPage(1);
    }
    // Set isSearching to false after a brief delay (to show the search animation)
    setTimeout(() => setIsSearching(false), 300);
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
        title: "Row added",
        description: "New row added successfully",
        variant: "default",
        className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });
      
      // Set the timestamp to trigger a reload
      setLastRowAddedAt(Date.now());
      
    } catch (error) {
      console.error("Error adding row:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to add row',
        variant: "destructive",
        action: <XCircle className="h-5 w-5" />
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

  // Handle row deletion
  const handleDeleteRow = async () => {
    if (!rowToDelete || !tableData) return;
    
    setIsDeleting(true);
    
    try {
      // Get the row data
      const row = rowToDelete.row;
      
      // Find primary key column for the row identifier
      const pkColumn = tableData.columns.find(col => col.pk === 1);
      
      // Create a row identifier - either using primary key or fallback to using all columns
      let rowIdentifier;
      
      if (pkColumn) {
        // If we have a primary key, use it
        rowIdentifier = {
          column: pkColumn.name,
          value: row[pkColumn.name]
        };
      } else {
        // Fallback: Create a composite identifier using all column values
        const identifierColumns = tableData.columns.map(col => ({
          column: col.name,
          value: row[col.name]
        }));
        
        if (identifierColumns.length === 0) {
          throw new Error("Cannot delete from this table - no way to uniquely identify rows");
        }
        
        rowIdentifier = {
          compositeIdentifier: identifierColumns
        };
      }

      // Get session ID
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }

      // Call the delete API
      const response = await fetch(`/api/delete?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableName: tableData.tableName,
          rowIdentifier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete row');
      }

      // Update the data in the local state
      const newData = [...tableData.data];
      newData.splice(rowToDelete.index, 1);
      
      setTableData({
        ...tableData,
        data: newData,
        pagination: {
          ...tableData.pagination,
          totalRows: tableData.pagination.totalRows - 1,
          totalPages: Math.ceil((tableData.pagination.totalRows - 1) / tableData.pagination.limit)
        }
      });
      
      // Close dialog and show success message
      setIsDeleteDialogOpen(false);
      setRowToDelete(null);
      
      toast({
        title: "Row deleted",
        description: "Successfully deleted row from table",
        duration: 3000,
        variant: "default",
        className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });
      
    } catch (error) {
      console.error("Error deleting row:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete row',
        variant: "destructive",
        action: <XCircle className="h-5 w-5" />
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle opening delete dialog
  const handleOpenDeleteDialog = (rowIndex: number, row: Record<string, unknown>) => {
    setRowToDelete({ index: rowIndex, row });
    setIsDeleteDialogOpen(true);
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
            <Button 
              onClick={handleSearch} 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={isSearching || !searchTerm.trim()}
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>

          {/* Search status indicator */}
          {searchTerm.trim() && (
            <div className="py-2 px-4 border-b bg-blue-50 dark:bg-blue-900/20 text-sm flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              <span>
                {filteredData.length === 0 
                  ? "No results found for: " 
                  : `Found ${filteredData.length} results for: `}
                <span className="font-medium">&quot;{searchTerm}&quot;</span>
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-blue-500 hover:text-blue-700" 
                onClick={clearSearch}
              >
                Clear search
              </Button>
            </div>
          )}

          {/* Table content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="border rounded-md">
              <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                <h3 className="text-sm font-medium">Table Data</h3>
                <Button 
                  size="sm" 
                  onClick={() => setIsAddRowDialogOpen(true)} 
                  className="ml-auto bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-800"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
              </div>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    {tableData.columns.map((column) => (
                      <TableHead key={column.name} className="font-medium">
                        <div className="flex items-center">
                          <span className="text-primary">{column.name}</span>
                          {column.pk === 1 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-1 text-xs bg-primary/20 text-primary px-1 rounded-full border border-primary/20">PK</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Primary Key (cannot be edited)</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {column.notnull === 1 && !column.pk && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="ml-1 text-xs bg-amber-500/20 text-amber-500 px-1 rounded-full border border-amber-500/20">!</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">NOT NULL constraint</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="text-xs mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                            {column.type}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                    {/* Add an action column header */}
                    <TableHead className="w-16 text-center font-medium">
                      <span className="text-primary">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableData.data.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={tableData.columns.length + 1} /* +1 for the action column */
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={tableData.columns.length + 1} /* +1 for the action column */
                          className="h-24 text-center"
                        >
                          No matching results found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((row, rowIndex) => (
                        <TableRow key={rowIndex} className="group">
                          {tableData.columns.map((column) => {
                            const cellKey = `${rowIndex}-${column.name}`;
                            const isEditable = column.pk !== 1;
                            const isRecentlyEdited = recentlyEditedCells.has(cellKey);
                            
                            return (
                              <TableCell 
                                key={cellKey}
                                className={`relative ${isEditable ? "cursor-pointer group-hover:bg-muted/30" : ""} ${
                                  isRecentlyEdited ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : ""
                                } transition-all duration-200 ease-in-out`}
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
                                            : "focus-visible:ring-primary/40"
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
                                        className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50" 
                                        onClick={handleSaveEdit}
                                        disabled={isEditing || (validationResult?.isValid === false)}
                                      >
                                        {isEditing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                      </Button>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50" 
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
                                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 rounded-full p-0.5">
                                        <Edit2 className="h-3 w-3 text-primary/70" />
                                      </div>
                                    )}
                                  </>
                                )}
                              </TableCell>
                            );
                          })}
                          {/* Add an action column with delete button */}
                          <TableCell className="w-16 p-2 text-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenDeleteDialog(rowIndex, row);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Delete row</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination controls */}
            {tableData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-2 mt-4">
                <div className="text-sm text-muted-foreground">
                  {searchTerm.trim() 
                    ? `Showing ${filteredData.length} of ${tableData.data.length} total rows`
                    : `Page ${currentPage} of ${tableData.pagination.totalPages}`
                  }
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || !!searchTerm.trim()}
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
                    disabled={currentPage === tableData.pagination.totalPages || !!searchTerm.trim()}
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
                    disabled={!!searchTerm.trim()}
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
                <DialogTitle className="flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  <span>Add New Row to {tableData.tableName}</span>
                </DialogTitle>
                <DialogDescription>
                  Fill in the values for the new row. Fields marked with <span className="text-red-500">*</span> are required.
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
                <Button 
                  onClick={handleAddRow} 
                  disabled={isAddingRow}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isAddingRow ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Row
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Row Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2 text-red-600">
                  <Trash2 className="h-5 w-5" />
                  <span>Delete Row</span>
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this row? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {rowToDelete && (
                  <div className="border rounded-md overflow-hidden">
                    <div className="bg-muted/50 p-2 text-sm font-medium">Row data:</div>
                    <div className="p-3 space-y-2 max-h-[200px] overflow-y-auto">
                      {tableData && tableData.columns.map((column) => (
                        <div key={column.name} className="grid grid-cols-2 gap-2 text-sm">
                          <div className="font-medium">{column.name}:</div>
                          <div className="truncate">
                            {rowToDelete.row[column.name] === null 
                              ? <span className="text-muted-foreground italic">NULL</span> 
                              : String(rowToDelete.row[column.name])}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteRow}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
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