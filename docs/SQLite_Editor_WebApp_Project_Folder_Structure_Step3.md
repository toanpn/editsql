
# 📄 SQLite Editor WebApp — Project Folder Structure (Step 3)

## 📂 Folder Structure

```plaintext
sqlite-editor-webapp/
├── app/
│   ├── api/
│   │   ├── upload/route.ts     # Handle file uploads
│   │   ├── tables/route.ts     # List database tables
│   │   ├── data/route.ts       # Fetch table data
│   │   ├── edit/route.ts       # Edit cell values
│   │   ├── sql/route.ts        # Execute SQL queries
│   │   ├── export/route.ts     # Export the edited file
│   │   └── delete/route.ts     # Delete file on unload
│   ├── components/
│   │   ├── FileUploader.tsx    # Drag-and-drop file upload UI
│   │   ├── SidebarTables.tsx   # List of tables sidebar
│   │   ├── TableViewer.tsx     # Table data viewer + editor
│   │   ├── SQLCli.tsx          # SQL CLI interface
│   │   └── ExportButton.tsx    # Button to export edited file
│   ├── context/
│   │   └── AppContext.tsx      # (optional) State management context
│   ├── styles/                 # Tailwind + Shadcn styles
│   ├── page.tsx                # Main page (SPA)
│   └── layout.tsx              # Page layout
├── public/                     # Static assets
├── sqlite-handler/
│   ├── SQLiteService.ts        # Database operations
│   └── utils.ts                # Utility functions
├── types/                      # TypeScript types
├── tmp/                        # Temporary uploaded files
├── .env                        # Environment variables
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── next.config.js              # Next.js config
├── package.json                # NPM package manifest
```

## 📝 Notes

- **app/api/** → Backend logic (API routes using better-sqlite3).
- **app/components/** → Frontend UI components.
- **sqlite-handler/** → Encapsulates all SQLite operations for reusability.
- **tmp/** → Temporary storage for uploaded SQLite files (auto-deleted).
- **SPA design** → All interactions handled client-side + server-side API routes.
- **Modular structure** → Easy to maintain and scale.

