
# SQLite Editor WebApp - MVP Specifications

## 1. Overview

A web application that allows users to upload SQLite files (`.sqlite` or `.db`), view table data, edit data in two modes, and export the modified file.

## 2. Detailed Features

### 2.1. File Upload

- Supports **drag-and-drop** or **file selection** from the device.
- Accepted formats: `.sqlite`, `.db`.
- **File size limit**: maximum 10 MB (MVP phase).
- Automatically reads and displays the list of tables upon successful upload.

### 2.2. Display Table List and Data

- **Left sidebar**: Displays a list of tables in the database.
- **Right section**: Displays the data of the selected table.
- **Pagination**: Yes, default 50 rows per page.
- **Search & Filter**: Supports filtering by column and keyword search.

### 2.3. Data Editing

#### 2.3.1. Mode 1: In-place Editing

- Allows users to edit data directly within the table cells.
- **Auto-save**: Changes are saved automatically when the user leaves the input cell (blur event).
- No confirmation or warning required before saving.

#### 2.3.2. Mode 2: SQL CLI

- Provides an interface to input SQL commands.
- **Supported commands**: `SELECT`, `UPDATE`, `DELETE`, `CREATE TABLE`.
- **Result display**:
  - `SELECT`: Displays the result table.
  - `UPDATE`/`DELETE`: Shows the number of affected rows.
  - Syntax errors: Displays error messages similar to the actual SQLite CLI.
- **SQL syntax highlighting**: Supported if easy to integrate. Autocomplete is not required.

### 2.4. Export File

- **Export button** is always visible.
- Exported file will append the suffix `_edited` to the filename.
- Example: `filename_edited.db`.

### 2.5. File Lifecycle Management

- Files are temporarily stored during the session.
- **Automatically deleted** when the user closes the web page.
- Future plan: Users with accounts can save files for longer periods.

## 3. UI/UX

- **SPA (Single Page Application)**.
- **Framework**: React.
- **SSR/SEO**: Next.js.
- **UI styling**:
  - **Tailwind CSS**.
  - **Component library**: Shadcn/ui.

## 4. Constraints and MVP Scope

- No action history (undo/redo) support.
- No SQL autocomplete.
- No versioning or edit history tracking.
- File size limit: 10MB.

## 5. Future Expansion Plans (Post-MVP)

- Allow account users to save files permanently.
- Increase file size limits for subscription plans.
- Add warnings for dangerous operations (`DELETE`, `DROP`).
- SQL autocomplete.
- Action history and undo/redo support.

## 6. Proposed Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Next.js |
| Styling/UI | Tailwind CSS + Shadcn/ui |
| Database processing | SQLite (based on uploaded files) |
| Hosting | Options: Vercel, Netlify, or custom server |

---

**Requested by:** [Your Name - Project Owner]  
**Analyzed by:** Project Manager (ChatGPT assistant)

Last updated: May 02, 2025
