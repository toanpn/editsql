"use client";

import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  DatabaseIcon, 
  Loader2, 
  PlayIcon, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface SQLCliProps {
  isLoading?: boolean;
}

interface SQLResult {
  success: boolean;
  queryType: string;
  results?: Record<string, any>[];
  columns?: { name: string }[];
  totalRows?: number;
  hasMoreRows?: boolean;
  affectedRows?: number;
  lastInsertRowid?: number;
  message: string;
  error?: string;
}

export const SQLCli = ({ isLoading: initialLoading = false }: SQLCliProps) => {
  // State for SQL query
  const [sqlQuery, setSqlQuery] = useState("");
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [result, setResult] = useState<SQLResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Execute the SQL query
  const handleExecuteQuery = async () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive",
        action: <XCircle className="h-5 w-5" />
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get session ID from localStorage
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found. Please upload a database file first.');
      }

      // Call the SQL API
      const response = await fetch(`/api/sql?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql: sqlQuery,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute SQL query');
      }

      setResult(data);

      // Show success toast
      toast({
        title: "Query executed",
        description: data.message,
        variant: "default",
        className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      setError(error instanceof Error ? error.message : 'Failed to execute SQL query');
      
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to execute SQL query',
        variant: "destructive",
        action: <XCircle className="h-5 w-5" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keydown in textarea (Ctrl+Enter to execute)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExecuteQuery();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="py-2 px-4 border-b">
        <h2 className="font-semibold">SQL Command Line Interface</h2>
        <p className="text-xs text-muted-foreground">
          Execute custom SQL queries against your database
        </p>
      </div>

      {/* Query input */}
      <div className="p-4 border-b">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="sql-query" className="text-sm font-medium">
            Enter your SQL query:
          </label>
          <div className="text-xs text-muted-foreground">
            Press Ctrl+Enter to execute
          </div>
        </div>
        <Textarea
          id="sql-query"
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="SELECT * FROM your_table WHERE condition;"
          className="font-mono min-h-[120px] resize-y"
        />
        <div className="mt-2 flex justify-end">
          <Button 
            onClick={handleExecuteQuery} 
            disabled={isLoading || !sqlQuery.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <PlayIcon className="mr-2 h-4 w-4" />
                Execute Query
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results section */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Executing query...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && result.success && (
          <div className="space-y-4">
            <Alert className={result.queryType === 'SELECT' ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}>
              <Info className="h-4 w-4" />
              <AlertTitle>{result.queryType} Query</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>

            {/* For non-SELECT queries, show affected rows */}
            {result.queryType !== 'SELECT' && result.affectedRows !== undefined && (
              <div className="p-4 border rounded-md bg-muted/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Affected Rows:</h3>
                    <p className="text-2xl font-mono">{result.affectedRows}</p>
                  </div>
                  {result.lastInsertRowid !== undefined && (
                    <div>
                      <h3 className="text-sm font-medium">Last Insert Row ID:</h3>
                      <p className="text-2xl font-mono">{result.lastInsertRowid}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* For SELECT queries, show results table */}
            {result.queryType === 'SELECT' && result.results && result.results.length > 0 && (
              <div className="border rounded-md">
                <div className="p-2 border-b bg-muted/30">
                  <h3 className="text-sm font-medium">
                    Query Results 
                    {result.totalRows && <span className="ml-2 text-xs text-muted-foreground">({result.totalRows} rows)</span>}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        {result.columns?.map((column) => (
                          <TableHead key={column.name} className="font-medium">
                            <span className="text-primary">{column.name}</span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.results.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {result.columns?.map((column) => (
                            <TableCell key={`${rowIndex}-${column.name}`}>
                              {formatCellValue(row[column.name])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {result.hasMoreRows && (
                  <div className="p-2 border-t bg-amber-50 text-amber-800 text-xs">
                    <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                    Results limited to {result.results.length} rows. Use LIMIT clause for more specific results.
                  </div>
                )}
              </div>
            )}

            {/* Show message when no results for SELECT query */}
            {result.queryType === 'SELECT' && result.results && result.results.length === 0 && (
              <div className="border rounded-md p-4 text-center">
                <p className="text-muted-foreground">No rows returned by the query.</p>
              </div>
            )}
          </div>
        )}

        {!isLoading && !error && !result && (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <DatabaseIcon className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">No Query Results</h3>
            <p>Enter a SQL query above and click Execute Query</p>
            <div className="mt-4 text-sm bg-muted/30 p-4 rounded-md max-w-lg">
              <p className="font-medium mb-2">Example queries:</p>
              <pre className="text-xs text-left bg-muted p-2 rounded">SELECT * FROM users LIMIT 10;</pre>
              <pre className="text-xs text-left bg-muted p-2 rounded mt-2">UPDATE products SET price = 19.99 WHERE id = 1;</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format cell values
const formatCellValue = (value: any) => {
  if (value === null) {
    return <span className="text-muted-foreground text-xs italic">NULL</span>;
  }
  
  // Format based on value type
  if (typeof value === 'number') {
    return <span className="font-mono text-blue-600 dark:text-blue-400">{value}</span>;
  }

  if (typeof value === 'string' && value.length > 100) {
    return (
      <span title={value} className="cursor-help">
        {value.substring(0, 100)}...
      </span>
    );
  }
  
  // Default formatting
  return String(value);
};

export default SQLCli; 