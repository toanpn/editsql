# SQLite Editor WebApp

A web application to upload, view, edit, query, and export SQLite database files.

## 🔥 Features

- Drag-and-drop SQLite file upload (.sqlite, .db)
- Table listing and data viewer
- In-place cell editing with auto-save
- SQL CLI (supports SELECT, UPDATE, DELETE, CREATE TABLE)
- Filter data by column and value
- Export modified database (`_edited` suffix)
- Files auto-deleted when page is closed

## 🧩 Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Next.js (TypeScript) |
| Styling/UI | Tailwind CSS + Shadcn/ui |
| Database | better-sqlite3 |
| State | React Context |
| Notifications | Sonner |
| Hosting | Vercel / Netlify compatible |

## 📂 Project Structure

```plaintext
sqlite-editor-webapp/
├── app/
│   ├── api/         # API routes (upload, tables, data, edit, sql, export, delete)
│   ├── components/  # React components (FileUploader, SidebarTables, TableViewer, SQLCli, ExportButton)
│   ├── context/     # AppContext for state management
│   ├── styles/      # Tailwind and UI styles
│   ├── page.tsx     # Main page
│   └── layout.tsx   # Layout file
├── public/
├── sqlite-handler/  # SQLiteService.ts and utils
├── types/           # TypeScript types
├── tmp/             # Temporary uploaded files (auto-deleted)
├── .env
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
