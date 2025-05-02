"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Info,
  ChevronsUpDown
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

// Define custom SQL syntax highlighting theme
const sqlSyntaxTheme = {
  ...tomorrow,
  'keyword': { color: '#ff79c6', fontWeight: 'bold' },
  'function': { color: '#8be9fd' },
  'number': { color: '#bd93f9' },
  'operator': { color: '#ff79c6' },
  'string': { color: '#f1fa8c' },
  'comment': { color: '#6272a4', fontStyle: 'italic' }
};

// SQL keywords list for enhanced highlighting
const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'FULL', 'ON', 'GROUP', 'BY',
  'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'DISTINCT', 'AS',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'NULL', 'NOT', 'IS', 'LIKE',
  'BETWEEN', 'IN', 'EXISTS', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'CASCADE', 'DEFAULT', 'AUTOINCREMENT'
];

// Function to enhance SQL highlighting
const enhanceSqlSyntax = (code: string): string => {
  // This is a simple enhancement to make standard SQL format more visible
  // Replace SQL keywords with their uppercase version for better highlighting
  let enhancedCode = code;
  SQL_KEYWORDS.forEach(keyword => {
    // Case insensitive replacement with word boundaries
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    enhancedCode = enhancedCode.replace(regex, keyword);
  });
  return enhancedCode;
};

export const SQLCli = ({ isLoading: initialLoading = false }: SQLCliProps) => {
  // State for SQL query
  const [sqlQuery, setSqlQuery] = useState("");
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [result, setResult] = useState<SQLResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHighlighter, setShowHighlighter] = useState(true);
  const [editorFocused, setEditorFocused] = useState(false);
  const [queryStartTime, setQueryStartTime] = useState<number | null>(null);
  const [queryEndTime, setQueryEndTime] = useState<number | null>(null);
  const [caretPosition, setCaretPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

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
    setQueryStartTime(Date.now());
    setQueryEndTime(null);

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
      setQueryEndTime(Date.now());

      // Show success toast
      toast({
        title: "Query executed",
        description: data.message,
        variant: "success",
        action: <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-300" />
      });
    } catch (error) {
      console.error("Error executing SQL query:", error);
      setError(error instanceof Error ? error.message : 'Failed to execute SQL query');
      setQueryEndTime(Date.now());
      
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

  // Calculate query execution time
  const executionTime = queryStartTime && queryEndTime 
    ? ((queryEndTime - queryStartTime) / 1000).toFixed(3) 
    : null;

  // Handle keydown in textarea (Ctrl+Enter to execute)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExecuteQuery();
    }
    
    // Update caret position after keydown
    setTimeout(() => {
      if (textareaRef.current) {
        setCaretPosition(textareaRef.current.selectionStart);
      }
    }, 0);
  };

  // Handle focus on textarea
  const handleFocus = () => {
    setEditorFocused(true);
    if (textareaRef.current) {
      setCaretPosition(textareaRef.current.selectionStart);
    }
  };

  // Handle blur on textarea
  const handleBlur = () => {
    setEditorFocused(false);
    setCaretPosition(null);
  };

  // Handle click in the editor area to focus the textarea
  const handleEditorClick = (e: React.MouseEvent) => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      
      // Try to position caret based on click position (approximation)
      // This is not perfectly accurate but provides a better UX
      const rect = editorRef.current?.getBoundingClientRect();
      if (rect) {
        // Get coordinates relative to the editor
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Approximate character width and line height
        const charWidth = 8.4; // Average character width in pixels for monospace font
        const lineHeight = 20; // Approximate line height in pixels
        
        // Calculate approximate position
        const lines = sqlQuery.split('\n');
        const lineIndex = Math.min(Math.floor(y / lineHeight), lines.length - 1);
        
        let position = 0;
        // Add length of all previous lines plus newline characters
        for (let i = 0; i < lineIndex; i++) {
          position += lines[i].length + 1; // +1 for newline
        }
        
        // Add approximate character position in current line
        const charIndex = Math.min(Math.floor(x / charWidth), lines[lineIndex]?.length || 0);
        position += charIndex;
        
        // Set selection range to place caret
        if (textareaRef.current) {
          textareaRef.current.setSelectionRange(position, position);
          setCaretPosition(position);
        }
      }
    }
  };

  // Update SQL query with enhanced syntax
  const handleSqlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSqlQuery(e.target.value);
    setCaretPosition(e.target.selectionStart);
  };

  // Update caret position when selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      if (textareaRef.current && document.activeElement === textareaRef.current) {
        setCaretPosition(textareaRef.current.selectionStart);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Calculate the position of the caret for display
  const getCaretCoordinates = () => {
    if (caretPosition === null || !editorFocused || !sqlQuery) return null;
    
    const textBeforeCaret = sqlQuery.substring(0, caretPosition);
    const lines = textBeforeCaret.split('\n');
    const currentLineIndex = lines.length - 1;
    const currentLineText = lines[currentLineIndex];
    
    // Calculate position
    const charWidth = 8.2; // px, approximate for monospace font
    const lineHeight = 20; // px, approximate
    const paddingLeft = 8; // px, content padding
    const paddingTop = 8; // px, content padding
    
    return {
      top: (currentLineIndex * lineHeight) + paddingTop,
      left: (currentLineText.length * charWidth) + paddingLeft
    };
  };

  const caretCoordinates = getCaretCoordinates();

  // Handle initial cursor position on empty query
  useEffect(() => {
    if (editorFocused && textareaRef.current && !sqlQuery) {
      setCaretPosition(0);
    }
  }, [editorFocused, sqlQuery]);

  // Ensure cursor is visible when typing
  useEffect(() => {
    if (editorFocused && caretCoordinates && editorRef.current) {
      const scrollableContainer = editorRef.current.querySelector('div');
      if (scrollableContainer) {
        const { top, left } = caretCoordinates;
        const containerHeight = scrollableContainer.clientHeight;
        const containerWidth = scrollableContainer.clientWidth;
        
        // Check if caret is outside visible area
        if (top < scrollableContainer.scrollTop) {
          scrollableContainer.scrollTop = top;
        } else if (top > scrollableContainer.scrollTop + containerHeight - 30) {
          scrollableContainer.scrollTop = top - containerHeight + 30;
        }

        if (left < scrollableContainer.scrollLeft) {
          scrollableContainer.scrollLeft = left;
        } else if (left > scrollableContainer.scrollLeft + containerWidth - 10) {
          scrollableContainer.scrollLeft = left - containerWidth + 10;
        }
      }
    }
  }, [caretCoordinates, editorFocused]);

  return (
    <div className="h-full flex flex-col">
      <div className="py-2 px-4 border-b">
        <h2 className="font-semibold">SQL Command Line Interface</h2>
        <p className="text-xs text-muted-foreground">
          Execute custom SQL queries against your database
        </p>
      </div>

      <ResizablePanelGroup direction="vertical" className="flex-1">
        {/* Query input section */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="p-4 border-b h-full flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="sql-query" className="text-sm font-medium">
                Enter your SQL query:
              </label>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">Ctrl</kbd>
                <span className="text-xs">+</span>
                <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">Enter</kbd>
                <span className="text-xs text-muted-foreground ml-1">to execute</span>
              </div>
            </div>
            
            <div className="relative flex-1 min-h-[120px]" onClick={handleEditorClick} ref={editorRef}>
              {/* Always show the syntax highlighter */}
              <div className={`absolute inset-0 font-mono p-2 border rounded-md ${editorFocused ? 'border-primary' : 'border-input'} bg-background z-0 overflow-auto`}>
                <SyntaxHighlighter 
                  language="sql" 
                  style={sqlSyntaxTheme}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                    fontSize: '0.875rem',
                    height: '100%',
                    whiteSpace: 'pre-wrap',
                    position: 'relative',
                  }}
                  codeTagProps={{
                    style: {
                      display: 'block',
                      fontFamily: 'monospace',
                    }
                  }}
                >
                  {sqlQuery ? enhanceSqlSyntax(sqlQuery) : " "} {/* Use space to ensure height is maintained when empty */}
                </SyntaxHighlighter>
                
                {/* Custom caret indicator */}
                {editorFocused && caretCoordinates && (
                  <div 
                    className="absolute w-[2px] h-[18px] bg-primary pointer-events-none animate-caret-blink" 
                    style={{
                      top: caretCoordinates.top,
                      left: caretCoordinates.left,
                      zIndex: 10,
                    }}
                    aria-hidden="true"
                  />
                )}
              </div>
              <Textarea
                ref={textareaRef}
                id="sql-query"
                value={sqlQuery}
                onChange={handleSqlChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onMouseDown={(e) => {
                  // Update caret position on mouse clicks
                  setTimeout(() => {
                    if (textareaRef.current) {
                      setCaretPosition(textareaRef.current.selectionStart);
                    }
                  }, 0);
                }}
                placeholder="SELECT * FROM your_table WHERE condition;"
                className="font-mono absolute inset-0 resize-none h-full opacity-0"
                style={{ 
                  caretColor: 'transparent', // Hide the native caret
                }}
              />
            </div>
            
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-muted-foreground">
                {executionTime && !isLoading && (
                  <span>Executed in {executionTime}s</span>
                )}
              </div>
              <Button 
                onClick={handleExecuteQuery} 
                disabled={isLoading || !sqlQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800"
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
        </ResizablePanel>

        <ResizableHandle className="bg-muted hover:bg-muted-foreground/20">
          <div className="flex items-center justify-center h-4">
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </ResizableHandle>

        {/* Results section */}
        <ResizablePanel defaultSize={70}>
          <div className="h-full flex flex-col">
            <div className="p-2 border-b bg-muted/30 flex justify-between items-center">
              <h3 className="text-sm font-medium">Query Results</h3>
              {result && result.success && (
                <span className="text-xs text-muted-foreground">
                  {result.queryType === 'SELECT' && result.totalRows !== undefined && `${result.totalRows} rows`}
                  {result.queryType !== 'SELECT' && result.affectedRows !== undefined && `${result.affectedRows} rows affected`}
                  {executionTime && ` • ${executionTime}s`}
                </span>
              )}
            </div>
            
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
                  <Alert className={result.queryType === 'SELECT' ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800" : "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"}>
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
                        <div className="p-2 border-t bg-amber-50 text-amber-800 text-xs dark:bg-amber-900/30 dark:text-amber-200">
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
        </ResizablePanel>
      </ResizablePanelGroup>
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