"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const SQLCli = () => {
  const [sqlCommand, setSqlCommand] = React.useState("");
  
  const handleRunSQL = () => {
    // This is a placeholder. Real implementation will come in Phase 4
    console.log("SQL command will be executed in Phase 4:", sqlCommand);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="py-2 px-4 border-b">
        <h2 className="font-semibold">SQL Command Line</h2>
        <p className="text-xs text-muted-foreground">
          Execute SQL commands (SELECT, UPDATE, DELETE, CREATE TABLE)
        </p>
      </div>

      <div className="flex-1 p-4 flex flex-col space-y-4">
        <Textarea
          className="flex-1 min-h-[100px] font-mono text-sm"
          placeholder="Enter SQL command here... 
Examples:
SELECT * FROM table_name;
UPDATE table_name SET column = value WHERE condition;
DELETE FROM table_name WHERE condition;
CREATE TABLE table_name (column_1 type, column_2 type...);"
          value={sqlCommand}
          onChange={(e) => setSqlCommand(e.target.value)}
        />
        
        <Button className="self-end" onClick={handleRunSQL}>
          Run SQL
        </Button>
        
        <div className="border rounded-md p-4 flex-1 bg-muted/50">
          <p className="text-center text-sm text-muted-foreground">
            Results will appear here (to be implemented in Phase 4)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SQLCli; 