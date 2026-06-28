# Features & Functionality

## Page 1 — Todo List (`/`)

### Core Actions

| Feature | Description |
|---------|-------------|
| **Create Todo** | Click "New Todo" to open a modal. Fill title (required), description, priority, due date, tags, and subtasks. Press Enter in the title field to submit. |
| **Toggle Complete** | Click the circular checkbox on any card to mark a todo done/undone. The card dims and its title gets a strikethrough. |
| **Delete Todo** | Hover a card to reveal the trash icon. Click to delete with no confirmation (immediate). |
| **Clear Completed** | Footer button appears when completed todos exist. Bulk-deletes all completed todos after a confirm dialog. |
| **Open Detail** | Click anywhere on the card body (not the checkbox or delete icon) to navigate to the todo detail page. |

### Filtering & Sorting

| Feature | Description |
|---------|-------------|
| **Status Filter** | Toggle between All / Active / Completed. Persists with other filters. |
| **Priority Filter** | Dropdown to show only High, Medium, or Low priority todos. |
| **Sort** | Four sort modes: Newest First (default), Due Date (ascending, nulls last), Priority (high→medium→low), Title A–Z. |
| **Search** | Full-text search across title and description. Debounced 300ms. Clear button appears when search is active. |

### Stats Bar

Displays live counts: Total, Active, Completed, and percentage complete. Updates on every action.

### Visual Priority Indicators

Each card shows a colored left border: red (high), amber (medium), green (low), gray (done). A priority badge is also shown inline on the card.

### Overdue Indicators

If a todo has a due date in the past and is not completed, the due date renders in red with "Overdue ·" prefix.

### Subtask Progress (on cards)

If a todo has subtasks, a "x/y" counter is shown in the card meta row with a checklist icon.

---

## Page 2 — Todo Detail (`/todo?id=<uuid>`)

### Display

| Field | Description |
|-------|-------------|
| **Title** | Large heading. Strikethrough if completed. |
| **Priority badge** | Color-coded badge (high/medium/low). |
| **Status badge** | Active (purple) or Completed (green). |
| **Due date** | With days-remaining or overdue counter. |
| **Description** | Full text, preserving line breaks. |
| **Tags** | Shown as pill badges. |
| **Subtasks** | Interactive checklist with progress bar and x/y counter. |
| **Timeline** | Created, Last Updated, and Completed timestamps. |
| **ID** | Raw UUID shown in the footer for reference. |

### Inline Editing

Click **Edit** in the top-right to enter edit mode. All fields become editable inline — no separate page required:

- Title → text input
- Description → textarea
- Priority → button group toggle
- Due date → date picker
- Tags → add/remove tags
- Subtasks → add/remove individually (always live, no edit mode needed)

Click **Save** to persist. Click **Cancel** to discard changes.

### Subtask Management

- Add subtasks via the inline input at the bottom of the Subtasks section (always available, in or out of edit mode).
- Toggle individual subtasks complete/incomplete by clicking their checkboxes.
- Delete individual subtasks with the × button (appears on hover).
- Progress bar fills proportionally as subtasks are completed.

### Delete

**Delete** button in the top-right opens a confirmation dialog, then deletes the todo and redirects to the list.

### Navigation

← Back link in the header returns to the list page, preserving browser history.

---

## Data Model

Each todo stored in JSON has the following shape:

```json
{
  "id": "uuid-v4",
  "title": "string",
  "description": "string",
  "priority": "high | medium | low",
  "completed": false,
  "dueDate": "2025-01-15 | null",
  "tags": ["string"],
  "subtasks": [
    { "id": "uuid-v4", "title": "string", "completed": false }
  ],
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601",
  "completedAt": "ISO 8601 | null"
}
```

---

## Design

- Dark theme with indigo/violet accent (`#6c63ff`)
- Priority-color system: red / amber / green / gray
- Monospace font (JetBrains Mono) for timestamps, IDs, and counters
- CSS Modules scoping — zero style bleed between components
- Responsive down to ~360px viewport width
