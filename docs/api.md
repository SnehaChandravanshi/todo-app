# REST API Reference

Base URL: `http://localhost:4000/api`

All request and response bodies are JSON. All responses return `Content-Type: application/json`.

---

## Endpoints

### `GET /todos`

Returns all todos. Supports query-string filtering, searching, and sorting.

**Query Parameters**

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `status` | string | `all`, `active`, `completed` | Filter by completion state |
| `priority` | string | `all`, `high`, `medium`, `low` | Filter by priority |
| `search` | string | any | Case-insensitive substring match on title and description |
| `sort` | string | `createdAt`, `dueDate`, `priority`, `title` | Sort order |
| `tags` | string | comma-separated | Filter todos that have any of the listed tags |

**Example**
```
GET /todos?status=active&priority=high&sort=dueDate
```

**Response** `200 OK`
```json
[
  {
    "id": "a1b2c3d4-...",
    "title": "Design homepage",
    "description": "Include hero section and nav",
    "priority": "high",
    "completed": false,
    "dueDate": "2025-02-01",
    "tags": ["design", "frontend"],
    "subtasks": [
      { "id": "s1...", "title": "Wireframe", "completed": true }
    ],
    "createdAt": "2025-01-10T10:00:00.000Z",
    "updatedAt": "2025-01-10T12:00:00.000Z",
    "completedAt": null
  }
]
```

---

### `GET /todos/:id`

Returns a single todo by ID.

**Response** `200 OK` — todo object

**Error** `404` `{ "error": "Todo not found" }`

---

### `POST /todos`

Creates a new todo.

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✓ | Todo title |
| `description` | string | | Extended notes |
| `priority` | string | | `high`, `medium` (default), `low` |
| `dueDate` | string | | ISO date string or `null` |
| `tags` | string[] | | Array of tag strings |
| `subtasks` | string[] or object[] | | Subtask titles or `{ title }` objects |

**Example**
```json
{
  "title": "Write unit tests",
  "priority": "high",
  "dueDate": "2025-02-15",
  "tags": ["backend", "testing"],
  "subtasks": ["Write service tests", "Write route tests"]
}
```

**Response** `201 Created` — created todo object

**Error** `400` `{ "error": "Title is required" }`

---

### `PUT /todos/:id`

Full update of a todo. All fields are optional — only provided fields are updated.

**Request Body** — same shape as POST, plus:

| Field | Type | Description |
|-------|------|-------------|
| `completed` | boolean | Mark todo complete/incomplete |
| `subtasks` | object[] | Full subtask array replacement: `[{ id, title, completed }]` |

**Response** `200 OK` — updated todo object

**Behavior notes**
- Setting `completed: true` automatically sets `completedAt` to current timestamp
- Setting `completed: false` clears `completedAt`
- `updatedAt` is always refreshed on any update

---

### `PATCH /todos/:id/toggle`

Toggles the `completed` state of a todo. Shortcut for the common "check off" action.

**Response** `200 OK` — updated todo object

---

### `PATCH /todos/:id/subtasks/:subtaskId/toggle`

Toggles the `completed` state of a single subtask.

**Response** `200 OK` — parent todo object with updated subtasks

---

### `DELETE /todos/:id`

Deletes a todo permanently.

**Response** `200 OK` `{ "message": "Deleted successfully" }`

**Error** `404` `{ "error": "Todo not found" }`

---

### `DELETE /todos?clearCompleted=true`

Bulk-deletes all completed todos.

**Response** `200 OK` `{ "message": "Cleared all completed todos" }`

---

### `GET /health`

Health check endpoint.

**Response** `200 OK` `{ "status": "ok", "timestamp": "..." }`

---

## Error Format

All errors return a JSON body:

```json
{ "error": "Human-readable error message" }
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request (e.g. missing required field) |
| `404` | Resource not found |
| `500` | Unexpected server error |
