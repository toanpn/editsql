# SQLite Editor WebApp - Implementation Plan (MVP)

**Phase 1: Project Setup & Basic Layout**

- [x] 1.  **Initialize Next.js Project:**
    *   Use `create-next-app`.
    *   Configure TypeScript, Tailwind CSS during setup.
- [x] 2.  **Install Dependencies:**
    *   `shadcn/ui`: Initialize and add necessary components (e.g., `button`, `input`, `table`, `resizable`, `textarea`).
    *   A server-side SQLite library (e.g., `better-sqlite3`).
    *   Libraries for file handling if needed (though Next.js API routes might suffice initially).
- [x] 3.  **Basic UI Layout:**
    *   Create the main app layout using `Resizable` components from `shadcn/ui` for a two-panel view (left sidebar for tables, right main area for data/CLI).
    *   Set up basic placeholders for the file upload area, table list, data display, and SQL CLI.

**Phase 2: File Handling & Core Backend**

- [x] 4.  **File Upload Component (Frontend):**
    *   Implement a drag-and-drop area and a file input button.
    *   Use React state to manage the uploaded file object.
    *   Basic validation for file type (`.sqlite`, `.db`) and size (10MB limit) on the client-side.
- [x] 5.  **File Upload API Route (Backend - Next.js API Route):**
    *   Create an API route (`/api/upload`) to receive the uploaded file (using `multipart/form-data`).
    *   Implement server-side validation (type, size).
    *   Temporarily store the uploaded file on the server (e.g., in a temporary directory or in memory if small enough, keeping file lifecycle in mind - session-based storage). Associate the stored file with the user's session.
- [x] 6.  **Database Reading API Route (Backend):**
    *   Create an API route (`/api/tables`) that takes the session's associated file path.
    *   Use the SQLite library (`better-sqlite3`) to open the database file.
    *   Query the `sqlite_master` table to get a list of user tables.
    *   Return the list of table names as JSON.
- [x] 7.  **Table List Display (Frontend):**
    *   When a file is successfully uploaded, call the `/api/tables` endpoint.
    *   Display the fetched table names in the left sidebar.
    *   Make table names clickable.

**Phase 3: Data Display & In-Place Editing**

- [x] 8.  **Table Data API Route (Backend):**
    *   Create an API route (`/api/data/[tableName]`) that accepts a table name and optional pagination parameters (page, limit=50).
    *   Use the SQLite library to execute a `SELECT * FROM [tableName] LIMIT ? OFFSET ?` query.
    *   Include logic to fetch column names/types if needed for the table header.
    *   Return the paginated data and total row count (for pagination controls) as JSON.
- [x] 9.  **Data Table Component (Frontend):**
    *   When a table name is clicked in the sidebar, call the `/api/data/[tableName]` endpoint.
    *   Use `shadcn/ui`'s `Table` component to display the fetched data.
    *   Implement pagination controls based on the total row count and current page.
    *   Implement basic Search/Filter UI elements (input fields per column or a general search box). Client-side filtering can be done first for simplicity, or add backend filtering logic to the API route later.
- [ ] 10. **In-Place Editing API Route (Backend):**
    *   Create an API route (`/api/edit`) that accepts table name, row identifier (e.g., `ROWID` or primary key), column name, and the new value.
    *   Construct and execute an `UPDATE` SQL statement using the SQLite library.
    *   Return success/failure status.
- [ ] 11. **In-Place Editing (Frontend):**
    *   Make table cells editable (e.g., replace `<td>` content with an `<input>` on click).
    *   On blur (losing focus) of the input, call the `/api/edit` endpoint with the changes.
    *   Update the local state to reflect the change immediately (optimistic update) or refetch the data.

**Phase 4: SQL CLI & Export**

- [ ] 12. **SQL Execution API Route (Backend):**
    *   Create an API route (`/api/sql`) that accepts a raw SQL string.
    *   Use the SQLite library to execute the command against the session's database file.
    *   Handle different command types:
        *   `SELECT`: Return results as JSON.
        *   `UPDATE`/`DELETE`/`CREATE`: Return affected row count or success status.
        *   Errors: Catch errors from the SQLite library and return formatted error messages.
    *   *Security:* Add basic validation to prevent excessively complex or potentially harmful queries beyond the allowed `SELECT`, `UPDATE`, `DELETE`, `CREATE TABLE`.
- [ ] 13. **SQL CLI Component (Frontend):**
    *   Create a `Textarea` component for SQL input.
    *   Add a "Run SQL" button that calls the `/api/sql` endpoint.
    *   Display results:
        *   Render a table for `SELECT` results.
        *   Show messages for other commands or errors.
    *   (Optional) Integrate a simple syntax highlighting library if time permits.
- [ ] 14. **File Export API Route (Backend):**
    *   Create an API route (`/api/export`).
    *   Read the (potentially modified) database file associated with the session.
    *   Set appropriate headers (`Content-Disposition: attachment; filename="original_filename_edited.db"`, `Content-Type: application/vnd.sqlite3` or `application/octet-stream`).
    *   Stream the file content back to the client.
- [ ] 15. **Export Button (Frontend):**
    *   Add an "Export" button.
    *   On click, trigger a download by navigating the browser to the `/api/export` endpoint (e.g., using `window.location.href` or creating an anchor tag).

**Phase 5: Styling, Refinement & Deployment**

- [ ] 16. **Styling:** Apply Tailwind and `shadcn/ui` utilities consistently across all components for a clean look and feel.
- [ ] 17. **Error Handling:** Implement robust error handling on both frontend and backend (network errors, database errors, validation errors). Display user-friendly error messages.
- [ ] 18. **Testing:** Manually test all features with various SQLite files and edge cases (empty tables, large datasets within limits, different data types, invalid SQL).
- [ ] 19. **Deployment:** Deploy the Next.js application to a platform like Vercel or Netlify. Configure necessary environment variables if any. 