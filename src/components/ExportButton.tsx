"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
        variant: "default",
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
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to export database',
        variant: "destructive",
      });
      
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export Database
        </>
      )}
    </Button>
  );
};

export default ExportButton; 