"use client";

import React, { useState } from "react";
import { Loader2, Database, Table2, MoreVertical, Trash2, AlertCircle } from "lucide-react";
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