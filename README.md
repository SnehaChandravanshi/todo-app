<div align="center">

<br/>

```
                                  ███████╗██╗      ██████╗ ██╗    ██╗████████╗ █████╗ ███████╗██╗  ██╗
                                  ██╔════╝██║     ██╔═══██╗██║    ██║╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
                                  █████╗  ██║     ██║   ██║██║ █╗ ██║   ██║   ███████║███████╗█████╔╝ 
                                  ██╔══╝  ██║     ██║   ██║██║███╗██║   ██║   ██╔══██║╚════██║██╔═██╗ 
                                  ██║     ███████╗╚██████╔╝╚███╔███╔╝   ██║   ██║  ██║███████║██║  ██╗
                                  ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
```

### **A premium full-stack task management system**
### built for teams that ship fast and think clearly.

<br/>

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-7c5cfc?style=for-the-badge)

<br/>

> *"Most todo apps get out of your way. FlowTask gets ahead of you."*

<br/>

---

</div>

## ✦ What is FlowTask?

FlowTask is not another CRUD exercise. It is a **production-grade task management platform** with a glassmorphism dark UI, real-time analytics, drag-and-drop board, and a clean REST API — built end-to-end in a single sprint.

Three views. One keyboard shortcut. Zero friction.

---

##  Feature Matrix

### Core
| Feature | Status |
|---------|--------|
| Create / Edit / Delete tasks | ✅ |
| Mark complete / incomplete | ✅ |
| Priority levels — High · Medium · Low | ✅ |
| Due dates with overdue detection | ✅ |
| Subtasks with progress bar | ✅ |
| Tags | ✅ |
| Categories — Work · Personal · Health · Finance · Learning | ✅ |
| Recurring tasks — Daily · Weekly · Monthly | ✅ |

### Views
| Feature | Status |
|---------|--------|
| **List View** — filterable, sortable, drag-and-drop | ✅ |
| **Kanban Board** — columns by priority + done | ✅ |
| **Analytics Dashboard** — charts, KPIs, trends | ✅ |

### Search & Filters
| Feature | Status |
|---------|--------|
| Full-text search (title + description) | ✅ |
| Filter by status · priority · category | ✅ |
| Sort by newest · due date · priority · title · custom order | ✅ |
| Bulk clear completed | ✅ |

### UX
| Feature | Status |
|---------|--------|
| Glassmorphism dark theme | ✅ |
| Collapsible sidebar with live counters | ✅ |
| Drag-and-drop reordering (persisted) | ✅ |
| Toast notifications | ✅ |
| `Ctrl+K` / `⌘K` → instant create | ✅ |
| Completion progress pill | ✅ |
| 7-day completion trend chart | ✅ |
| Priority breakdown pie chart | ✅ |
| Category distribution bar chart | ✅ |

---

##  Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  React 18  ·  React Router v6  ·  Recharts          │
│  @hello-pangea/dnd  ·  Axios  ·  date-fns           │
│  Plus Jakarta Sans  ·  JetBrains Mono               │
├─────────────────────────────────────────────────────┤
│                    BACKEND                          │
│  Node.js  ·  Express.js  ·  UUID v4                 │
│  JSON file persistence                              │
└─────────────────────────────────────────────────────┘
```

---

##  Getting Started

### Prerequisites
- Node.js `v16+`
- npm

### Clone & Run

```bash
# Clone
git clone https://github.com/SnehaChandravanshi/todo-app.git
cd todo-app
```

```bash
# Terminal 1 — Backend (port 4000)
cd backend
npm install
npm start
```

```bash
# Terminal 2 — Frontend (port 3000)
cd frontend
npm install
npm start
```

Open **http://localhost:3000** — you're in.

>  **Shortcut:** Press `Ctrl+K` anywhere to instantly open the create task modal.

---

##  REST API

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/todos` | List todos — supports `?status=&priority=&category=&search=&sort=` |
| `GET` | `/todos/stats` | Analytics data — counts, trends, breakdowns |
| `GET` | `/todos/:id` | Single todo |
| `POST` | `/todos` | Create todo |
| `PUT` | `/todos/:id` | Update todo |
| `PATCH` | `/todos/:id/toggle` | Toggle complete |
| `PATCH` | `/todos/reorder` | Persist drag-drop order |
| `PATCH` | `/todos/:id/subtasks/:sid/toggle` | Toggle subtask |
| `DELETE` | `/todos/:id` | Delete todo |
| `DELETE` | `/todos?clearCompleted=true` | Bulk delete completed |

Full API docs → [`docs/api.md`](docs/api.md)

---

## 📁 Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express entry point + CORS
│   │   ├── routes/
│   │   │   └── todos.js          # All 10 API endpoints
│   │   └── db/
│   │       └── fileDb.js         # JSON persistence layer
│   ├── data/
│   │   └── todos.json            # Auto-created on first run
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── todos.js          # Axios API client
│   │   ├── components/
│   │   │   ├── AddTodoModal.js   # Create task modal
│   │   │   └── AddTodoModal.css
│   │   ├── pages/
│   │   │   ├── TodoListPage.js   # / — main list + kanban + analytics
│   │   │   ├── TodoListPage.css
│   │   │   ├── TodoDetailPage.js # /todo?id=<uuid> — task detail
│   │   │   └── TodoDetailPage.module.css
│   │   ├── index.js              # React Router setup
│   │   └── index.css             # Global design tokens
│   └── package.json
│
└── docs/
    ├── api.md                    # API reference
    └── features.md               # Feature documentation
```

---

## 📄 Documentation

| Doc | Description |
|-----|-------------|
| [`docs/api.md`](docs/api.md) | Complete REST API reference with request/response examples |
| [`docs/features.md`](docs/features.md) | Full feature documentation |

---

##  Roadmap

- [ ] User authentication (JWT)
- [ ] PostgreSQL / MongoDB backend
- [ ] Real-time collaboration (WebSockets)
- [ ] Email reminders for due tasks
- [ ] Dark / light theme toggle
- [ ] Mobile app (React Native)
- [ ] CSV export

---

<div align="center">

<br/>

Built with focus by **Sneha Chandravanshi**

[![GitHub](https://img.shields.io/badge/GitHub-SnehaChandravanshi-7c5cfc?style=for-the-badge&logo=github)](https://github.com/SnehaChandravanshi)

<br/>

*FlowTask — because your tasks deserve better than a sticky note.*

</div>
