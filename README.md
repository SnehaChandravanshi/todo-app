# Todo App — Full Stack

A production-quality Todo application built with **React** (multi-page) + **Node.js/Express** REST API. Data persists to a local JSON file.

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd todo-app

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Run

**Terminal 1 — Backend (port 4000)**

```bash
cd backend
npm start
```

**Terminal 2 — Frontend (port 3000)**

```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express app entry point
│   │   ├── routes/todos.js   # All CRUD routes
│   │   └── db/fileDb.js      # JSON file persistence layer
│   ├── data/todos.json       # Auto-created on first run
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/todos.js      # Axios API helpers
│   │   ├── components/
│   │   │   ├── TodoCard.js   # List item card
│   │   │   └── AddTodoModal.js
│   │   ├── pages/
│   │   │   ├── TodoListPage.js    # Route: /
│   │   │   └── TodoDetailPage.js  # Route: /todo?id=<uuid>
│   │   └── index.js          # React Router setup
│   └── package.json
└── docs/
    ├── api.md                # API reference
    └── features.md           # Feature documentation
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Todo list with filters, search, and stats |
| `/todo?id=<uuid>` | Single todo detail view |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, Axios, date-fns |
| Backend | Node.js, Express.js |
| Storage | JSON file (`backend/data/todos.json`) |
| Styling | CSS Modules |

---

See [`docs/features.md`](docs/features.md) for full feature list and [`docs/api.md`](docs/api.md) for the REST API reference.
