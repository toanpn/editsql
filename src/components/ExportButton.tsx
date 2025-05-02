"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  className?: string;
}

export const ExportButton = ({ className = "" }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Get session ID from localStorage
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        throw new Error('No session ID found. Please upload a database file first.');
      }

      // For downloads, we need to navigate to the URL directly
      // This will trigger the browser's download behavior
      window.location.href = `/api/export?sessionId=${sessionId}`;
      
      // Show success toast
      toast({
        title: "Download started",
        description: "Your database file is being downloaded",
        duration: 3000,
        className: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      });
      
      // Short timeout before resetting isExporting
      // We can't track the actual download completion
      setTimeout(() => {
        setIsExporting(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error exporting database:", error);
      
      // Show error toast
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Failed to export database',
        variant: "destructive",
        duration: 5000,
      });
      
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className={cn(
        "border-green-600/50 hover:border-green-600 text-green-600 hover:text-green-700 hover:bg-green-50/50 dark:border-green-500/70 dark:text-green-500 dark:hover:text-green-400 dark:hover:bg-green-950/50",
        isExporting && "opacity-80", 
        className
      )}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <FileDown className="mr-2 h-4 w-4" />
          <span>Export Database</span>
        </>
      )}
    </Button>
  );
};

export default ExportButton; 