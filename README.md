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
- File size limit: 10MB (for MVP)

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

```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sqlite-editor-webapp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 💡 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
