"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportButtonProps {
  isEnabled?: boolean;
}

export const ExportButton = ({ isEnabled = false }: ExportButtonProps) => {
  const handleExport = () => {
    // This is a placeholder. Real implementation will come in Phase 4
    console.log("Export functionality will be implemented in Phase 4");
  };

  return (
    <Button
      onClick={handleExport}
      disabled={!isEnabled}
      variant="outline"
      className="flex items-center space-x-2"
    >
      <Download className="h-4 w-4" />
      <span>Export Database</span>
    </Button>
  );
};

export default ExportButton; 