"use client";

import React, { useState } from "react";
import { Loader2, Database, Table2, MoreVertical, Trash2, AlertCircle, PlusCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Table = {
  name: string;
};

interface SidebarTablesProps {
  tables?: Table[];
  onSelectTable?: (tableName: string) => void;
  selectedTable?: string | null;
  isLoading?: boolean;
  onTableListChanged?: () => void;
}

// SQLite data types
const SQLITE_TYPES = ["INTEGER", "TEXT", "REAL", "BLOB", "NULL"];

type ColumnDefinition = {
  name: string;
  type: string;
  primaryKey: boolean;
  notNull: boolean;
  unique: boolean;
  autoIncrement: boolean;
  defaultValue: string;
};

export const SidebarTables = ({
  tables = [],
  onSelectTable,
  selectedTable = null,
  isLoading = false,
  onTableListChanged,
}: SidebarTablesProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Create table state
  const [createTableOpen, setCreateTableOpen] = useState(false);
  const [newTableName, setNewTableName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    { 
      name: "id", 
      type: "INTEGER", 
      primaryKey: true, 
      notNull: true, 
      unique: false, 
      autoIncrement: true,
      defaultValue: "" 
    }
  ]);

  // Handle adding a new column
  const addColumn = () => {
    setColumns([
      ...columns,
      { 
        name: "", 
        type: "TEXT", 
        primaryKey: false, 
        notNull: false, 
        unique: false, 
        autoIncrement: false,
        defaultValue: "" 
      }
    ]);
  };

  // Handle removing a column
  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  // Handle updating column definition
  const updateColumn = (index: number, field: keyof ColumnDefinition, value: string | boolean) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = {
      ...updatedColumns[index],
      [field]: value
    };
    
    // If making a column primary key, unset other primary keys
    if (field === 'primaryKey' && value === true) {
      updatedColumns.forEach((col, i) => {
        if (i !== index) {
          updatedColumns[i] = { ...col, primaryKey: false };
        }
      });
    }
    
    setColumns(updatedColumns);
  };

  // Generate SQL for table creation
  const generateCreateTableSQL = () => {
    if (!newTableName.trim()) return "";
    
    const columnDefs = columns.map(col => {
      let def = `"${col.name}" ${col.type}`;
      
      // Add constraints
      const constraints = [];
      
      if (col.primaryKey) {
        constraints.push("PRIMARY KEY");
        if (col.autoIncrement && col.type === "INTEGER") {
          constraints.push("AUTOINCREMENT");
        }
      }
      
      if (col.notNull) constraints.push("NOT NULL");
      if (col.unique) constraints.push("UNIQUE");
      
      if (col.defaultValue.trim()) {
        constraints.push(`DEFAULT ${col.defaultValue}`);
      }
      
      if (constraints.length > 0) {
        def += ` ${constraints.join(" ")}`;
      }
      
      return def;
    }).join(", ");
    
    return `CREATE TABLE "${newTableName}" (${columnDefs});`;
  };

  // Handle creating a new table
  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a table name",
        variant: "destructive",
      });
      return;
    }
    
    if (columns.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one column",
        variant: "destructive",
      });
      return;
    }
    
    // Check if any column has no name
    if (columns.some(col => !col.name.trim())) {
      toast({
        title: "Error",
        description: "All columns must have a name",
        variant: "destructive",
      });
      return;
    }
    
    const sql = generateCreateTableSQL();
    setIsCreating(true);
    
    try {
      // Get session ID from localStorage
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }
      
      // Call the SQL API to execute CREATE TABLE
      const response = await fetch(`/api/sql?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }
      
      // Reset form and close dialog
      setCreateTableOpen(false);
      setNewTableName("");
      setColumns([
        { 
          name: "id", 
          type: "INTEGER", 
          primaryKey: true, 
          notNull: true, 
          unique: false, 
          autoIncrement: true,
          defaultValue: "" 
        }
      ]);
      
      // Show success message
      setTimeout(() => {
        toast({
          title: "Table created",
          description: `The table "${newTableName}" has been created successfully.`,
          duration: 3000,
        });
        
        // Refresh table list
        if (onTableListChanged) {
          onTableListChanged();
        }
      }, 150);
      
    } catch (error) {
      console.error("Error creating table:", error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create table',
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle deleting a table
  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    
    setIsDeleting(true);
    
    try {
      // Get session ID from localStorage
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found');
      }
      
      // Call the SQL API to execute DROP TABLE
      const response = await fetch(`/api/sql?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: `DROP TABLE IF EXISTS "${tableToDelete}";`
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete table');
      }
      
      // Immediately reset the dialog state before any other UI updates
      setConfirmDeleteOpen(false);
      
      // If the deleted table was selected, clear selection
      if (selectedTable === tableToDelete && onSelectTable) {
        onSelectTable('');
      }
      
      // Show success message after dialog is closed
      setTimeout(() => {
        toast({
          title: "Table deleted",
          description: `The table "${tableToDelete}" has been deleted successfully.`,
          duration: 3000,
        });
        
        // Refresh table list after a small delay
        if (onTableListChanged) {
          onTableListChanged();
        }
      }, 150);
      
    } catch (error) {
      console.error("Error deleting table:", error);
      
      // Immediately reset the dialog state on error too
      setConfirmDeleteOpen(false);
      
      // Show error toast after dialog is closed
      setTimeout(() => {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : 'Failed to delete table',
          variant: "destructive",
        });
      }, 150);
    } finally {
      // Clear deletion state
      setIsDeleting(false);
      setTableToDelete(null);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, tableName: string) => {
    e.stopPropagation(); // Prevent the table selection
    setTableToDelete(tableName);
    setConfirmDeleteOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="py-3 px-4 border-b flex justify-between items-center bg-muted/50">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-sm">Database Tables</h2>
        </div>
        <div className="flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => setCreateTableOpen(true)}
            title="Create new table"
          >
            <PlusCircle className="h-4 w-4 text-primary" />
          </Button>
        </div>
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
            <p className="mt-2 text-xs">Create a new table or upload a SQLite file</p>
            <Button 
              className="mt-4" 
              size="sm" 
              variant="outline"
              onClick={() => setCreateTableOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Create Table
            </Button>
          </div>
        ) : (
          <ul className="space-y-0.5 p-2">
            {tables.map((table) => (
              <li
                key={table.name}
                className={cn(
                  "px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between",
                  selectedTable === table.name 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted/80 text-foreground/90"
                )}
                onClick={() => onSelectTable?.(table.name)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Table2 className={cn(
                    "h-3.5 w-3.5 flex-shrink-0",
                    selectedTable === table.name ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="truncate">{table.name}</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <div className="p-1 rounded-sm hover:bg-muted">
                      <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="right">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive gap-2"
                      onClick={(e) => handleDeleteClick(e, table.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Create Table Dialog */}
      <Dialog open={createTableOpen} onOpenChange={setCreateTableOpen}>
        <DialogContent className="sm:max-w-[650px] w-[95vw] flex flex-col max-h-[85vh] p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-card z-10">
            <DialogTitle className="text-xl">Create New Table</DialogTitle>
            <DialogDescription>
              Define your table structure. Add columns and specify their data types and constraints.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-2 mb-6">
              <label htmlFor="tableName" className="text-sm font-medium">
                Table Name
              </label>
              <Input
                id="tableName"
                placeholder="Enter table name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium">Columns</label>
              
              {columns.map((column, index) => (
                <div key={index} className="border rounded-md shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-muted/40 border-b">
                    <h4 className="text-sm font-medium">Column {index + 1}</h4>
                    {index > 0 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => removeColumn(index)}
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium">Name</label>
                        <Input
                          placeholder="Column name"
                          value={column.name}
                          onChange={(e) => updateColumn(index, 'name', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium">Type</label>
                        <select 
                          value={column.type}
                          onChange={(e) => updateColumn(index, 'type', e.target.value)}
                          className="h-8 border rounded-md bg-transparent text-sm px-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {SQLITE_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium">Default Value (optional)</label>
                        <Input
                          placeholder="Default value"
                          value={column.defaultValue}
                          onChange={(e) => updateColumn(index, 'defaultValue', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium">Constraints</label>
                        <div className="grid grid-cols-2 gap-y-2">
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={column.primaryKey}
                              onChange={(e) => updateColumn(index, 'primaryKey', e.target.checked)}
                              className="rounded-sm w-3.5 h-3.5"
                            />
                            Primary Key
                          </label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={column.notNull}
                              onChange={(e) => updateColumn(index, 'notNull', e.target.checked)}
                              className="rounded-sm w-3.5 h-3.5"
                            />
                            NOT NULL
                          </label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={column.unique}
                              onChange={(e) => updateColumn(index, 'unique', e.target.checked)}
                              className="rounded-sm w-3.5 h-3.5"
                            />
                            Unique
                          </label>
                          {column.type === "INTEGER" && column.primaryKey && (
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={column.autoIncrement}
                                onChange={(e) => updateColumn(index, 'autoIncrement', e.target.checked)}
                                className="rounded-sm w-3.5 h-3.5"
                              />
                              Autoincrement
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addColumn} 
                className="flex items-center justify-center py-3 border-dashed"
                type="button"
                size="sm"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Column
              </Button>
            </div>
            
            <div className="mt-6 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">SQL Preview</label>
              </div>
              <div className="bg-muted/30 rounded-md overflow-hidden">
                <pre className="bg-muted/20 p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                  {generateCreateTableSQL() || "-- Enter table details to generate SQL"}
                </pre>
              </div>
            </div>
          </div>
          
          <DialogFooter className="px-6 py-4 border-t sticky bottom-0 bg-card z-10 mt-auto" style={{ position: 'relative'}}>
            <Button variant="outline" onClick={() => setCreateTableOpen(false)} disabled={isCreating} className="min-w-[100px]">
              Cancel
            </Button>
            <Button onClick={handleCreateTable} disabled={isCreating} className="min-w-[150px]">
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Table
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Table Confirmation Dialog */}
      {confirmDeleteOpen && (
        <AlertDialog open={confirmDeleteOpen} onOpenChange={(open) => {
          setConfirmDeleteOpen(open);
          // If dialog is closed without taking action, clean up state to prevent UI issues
          if (!open) {
            setTableToDelete(null);
            setIsDeleting(false);
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Delete Table?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the table <strong>&quot;{tableToDelete}&quot;</strong>? This will permanently remove all data in this table and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTable}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Table
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default SidebarTables; 