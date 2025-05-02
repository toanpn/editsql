
# 📄 SQLite Editor WebApp — Design Details (Step 2)

## 🏗 Frontend (React + Next.js)

### Pages/Components
- `/` — Main page with drag-and-drop & file picker.
- Sidebar: List of tables.
- Main panel: Table viewer/editor.
- SQL CLI component.
- Export button component.
- Modals for errors/info.

### State Management
- Local component state + React Context.
- Session-based in-memory storage.

### Libraries
- File uploading: Custom (drag-and-drop area).
- Table viewer: `TanStack Table`.
- SQL highlighting: `react-syntax-highlighter` or `prism-react-renderer`.
- Notifications: `Sonner` (or similar).

---

## 🗄 Backend/Server (Next.js API Routes)

### Endpoints
- **/api/upload**: Parse/upload SQLite files.
- **/api/tables**: Get list of tables.
- **/api/data**: Fetch paginated table data.
- **/api/edit**: Update cell values.
- **/api/sql**: Execute SQL queries.
- **/api/export**: Serve modified file with `_edited` suffix.

### SQLite Handler
- **Library**: `better-sqlite3` (fast, server-side only).

### Functions
- Load SQLite file.
- List tables.
- Fetch paginated data.
- Execute SQL commands.

---

## 🔒 File Lifecycle & Security

- Files stored in memory or `tmp` directory.
- Deleted on browser close/session end.
- Validate file size (<10MB) before processing.

---

## 📝 Notes
- SPA with server-side API routes.
- Shadcn/ui used for consistent UI.
- Designed for modular growth.

