# SQLite Editor WebApp

A web application to upload, view, edit, query, and export SQLite database files.

> 🌐 Try the online version at [litesql.online](https://litesql.online/)

## 🔥 Features

- Drag-and-drop SQLite file upload (.sqlite, .db)
- Table listing and data viewer
- In-place cell editing with auto-save
- SQL CLI (supports SELECT, UPDATE, DELETE, CREATE TABLE)
- Visual table designer with column type and constraint configuration
- Filter data by column and value
- Export modified database (`_edited` suffix)
- Files auto-deleted when page is closed
- File size limit: 10MB (for MVP)

## 🧩 Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19 + Next.js 15 (TypeScript) |
| Styling/UI | Tailwind CSS v4 + Radix UI components |
| Database | better-sqlite3 |
| State Management | React hooks and props |
| Hosting | Vercel / Netlify compatible |

## 📂 Project Structure

```plaintext
sqlite-editor-webapp/
├── src/
│   ├── app/
│   │   ├── api/         # API routes (upload, tables, data, edit, sql, export, insert)
│   │   ├── globals.css  # Global styles
│   │   ├── page.tsx     # Main page
│   │   └── layout.tsx   # Layout file
│   ├── components/      # React components (FileUploader, SidebarTables, TableViewer, SQLCli, ExportButton)
│   │   └── ui/          # UI components
│   └── lib/             # Utility functions
├── public/              # Static assets
├── tmp/                 # Temporary uploaded files (auto-deleted)
├── docs/                # Documentation
├── tailwind.config.ts
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── components.json      # Shadcn UI components config
└── package.json

```

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/toanpn/editsql.git
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
