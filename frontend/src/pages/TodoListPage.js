import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format, isAfter, parseISO, differenceInDays } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchTodos, fetchStats, createTodo, toggleTodo, deleteTodo, clearCompleted, reorderTodos } from '../api/todos';
import AddTodoModal from '../components/AddTodoModal';
import './TodoListPage.css';

const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Finance', 'Learning'];
const VIEWS = ['list', 'kanban', 'analytics'];

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

export default function TodoListPage() {
  const nav = useNavigate();
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('list');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('createdAt');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toastId = useRef(0);

  const addToast = (msg, type = 'success') => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (status !== 'all') params.status = status;
      if (priority !== 'all') params.priority = priority;
      if (category !== 'all') params.category = category;
      if (debouncedSearch) params.search = debouncedSearch;
      const [data, statsData] = await Promise.all([fetchTodos(params), fetchStats()]);
      setTodos(data);
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  }, [status, priority, category, sort, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowModal(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleCreate = async (data) => {
    await createTodo(data);
    addToast('Todo created ✓');
    load();
  };

  const handleToggle = async (id, e) => {
    e.stopPropagation();
    await toggleTodo(id);
    load();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteTodo(id);
    addToast('Deleted', 'error');
    load();
  };

  const handleClearCompleted = async () => {
    await clearCompleted();
    addToast('Cleared completed');
    load();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setTodos(items);
    await reorderTodos(items.map(t => t.id));
  };

  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = todos.filter(t => !t.completed).length;
  const pct = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  const kanbanCols = {
    high: todos.filter(t => t.priority === 'high' && !t.completed),
    medium: todos.filter(t => t.priority === 'medium' && !t.completed),
    low: todos.filter(t => t.priority === 'low' && !t.completed),
    done: todos.filter(t => t.completed),
  };

  return (
    <div className="app">
      <Toast toasts={toasts} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">✦</div>
          {sidebarOpen && <span className="brand-name">FlowTask</span>}
        </div>

        <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {sidebarOpen && (
          <>
            <div className="sidebar-section">
              <span className="sidebar-label">Views</span>
              {VIEWS.map(v => (
                <button key={v} className={`sidebar-item ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
                  <span className="sidebar-icon">{v === 'list' ? '☰' : v === 'kanban' ? '⊞' : '◉'}</span>
                  <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
                </button>
              ))}
            </div>

            <div className="sidebar-section">
              <span className="sidebar-label">Categories</span>
              <button className={`sidebar-item ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
                <span className="sidebar-icon">◈</span><span>All</span>
              </button>
              {CATEGORIES.map(c => (
                <button key={c} className={`sidebar-item ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                  <span className="sidebar-icon">◆</span><span>{c}</span>
                  {stats?.byCategory?.[c] && <span className="sidebar-badge">{stats.byCategory[c]}</span>}
                </button>
              ))}
            </div>

            {stats && (
              <div className="sidebar-stats">
                <div className="mini-stat">
                  <span className="mini-stat-num" style={{color:'var(--purple)'}}>{stats.active}</span>
                  <span className="mini-stat-label">Active</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-num" style={{color:'var(--low)'}}>{stats.completed}</span>
                  <span className="mini-stat-label">Done</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-stat-num" style={{color:'var(--high)'}}>{stats.overdue}</span>
                  <span className="mini-stat-label">Overdue</span>
                </div>
              </div>
            )}
          </>
        )}
      </aside>

      {/* Main */}
      <main className="main">
        {/* Header */}
        <header className="topbar">
          <div className="topbar-left">
            <h1 className="page-title">
              {view === 'list' && 'All Tasks'}
              {view === 'kanban' && 'Board View'}
              {view === 'analytics' && 'Analytics'}
            </h1>
            {stats && (
              <div className="progress-pill">
                <div className="progress-pill-bar" style={{width: `${pct}%`}} />
                <span>{pct}% complete</span>
              </div>
            )}
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input className="search-input" placeholder="Search… (⌘K to create)" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <span>+</span> New Task
            </button>
          </div>
        </header>

        {/* Filter bar */}
        {view !== 'analytics' && (
          <div className="filterbar">
            <div className="filter-tabs">
              {['all','active','completed'].map(s => (
                <button key={s} className={`filter-tab ${status === s ? 'active' : ''}`} onClick={() => setStatus(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="filter-selects">
              <select className="glass-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="all">All Priorities</option>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
              <select className="glass-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="createdAt">Newest First</option>
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title A–Z</option>
                <option value="order">Custom Order</option>
              </select>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <span>Loading tasks…</span>
            </div>
          ) : view === 'analytics' ? (
            <AnalyticsView stats={stats} todos={todos} />
          ) : view === 'kanban' ? (
            <KanbanView cols={kanbanCols} onToggle={handleToggle} onDelete={handleDelete} onNavigate={(id) => nav(`/todo?id=${id}`)} />
          ) : (
            <ListView
              todos={todos}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onNavigate={(id) => nav(`/todo?id=${id}`)}
              onDragEnd={handleDragEnd}
              onAdd={() => setShowModal(true)}
              search={debouncedSearch}
              completedCount={completedCount}
              onClearCompleted={handleClearCompleted}
            />
          )}
        </div>
      </main>

      {showModal && <AddTodoModal onClose={() => setShowModal(false)} onSave={handleCreate} categories={CATEGORIES} />}
    </div>
  );
}

function TodoCard({ todo, onToggle, onDelete, onNavigate, dragHandleProps }) {
  const isOverdue = todo.dueDate && !todo.completed && isAfter(new Date(), parseISO(todo.dueDate));
  const daysLeft = todo.dueDate && !todo.completed ? differenceInDays(parseISO(todo.dueDate), new Date()) : null;
  const subtasksDone = (todo.subtasks || []).filter(s => s.completed).length;
  const subtasksTotal = (todo.subtasks || []).length;

  return (
    <div className={`todo-card priority-${todo.priority} ${todo.completed ? 'completed' : ''}`} onClick={() => onNavigate(todo.id)}>
      <div className="card-drag" {...dragHandleProps}>⠿</div>
      <button className={`card-check ${todo.completed ? 'checked' : ''}`} onClick={e => onToggle(todo.id, e)}>
        {todo.completed && <span>✓</span>}
      </button>
      <div className="card-body">
        <div className="card-header-row">
          <span className={`card-title ${todo.completed ? 'done' : ''}`}>{todo.title}</span>
          <span className={`priority-dot priority-dot-${todo.priority}`} />
        </div>
        {todo.description && <p className="card-desc">{todo.description.slice(0, 80)}{todo.description.length > 80 ? '…' : ''}</p>}
        <div className="card-meta">
          {todo.category && <span className="card-cat">{todo.category}</span>}
          {todo.dueDate && (
            <span className={`card-due ${isOverdue ? 'overdue' : ''}`}>
              ⏱ {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : format(parseISO(todo.dueDate), 'MMM d')}
            </span>
          )}
          {subtasksTotal > 0 && (
            <span className="card-subtasks">
              ☑ {subtasksDone}/{subtasksTotal}
            </span>
          )}
          {(todo.tags || []).slice(0, 2).map(t => <span key={t} className="card-tag">#{t}</span>)}
          {todo.recurring && <span className="card-recurring">↻ {todo.recurring}</span>}
        </div>
      </div>
      <button className="card-del" onClick={e => onDelete(todo.id, e)}>✕</button>
    </div>
  );
}

function ListView({ todos, onToggle, onDelete, onNavigate, onDragEnd, onAdd, search, completedCount, onClearCompleted }) {
  if (todos.length === 0) return (
    <div className="empty-state">
      <div className="empty-icon">✦</div>
      <p className="empty-title">{search ? `No results for "${search}"` : 'Nothing here yet'}</p>
      <p className="empty-sub">Start by creating your first task</p>
      {!search && <button className="btn-primary" onClick={onAdd}>Create task</button>}
    </div>
  );

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todos">
          {(provided) => (
            <div className="todo-list" ref={provided.innerRef} {...provided.droppableProps}>
              {todos.map((todo, idx) => (
                <Draggable key={todo.id} draggableId={todo.id} index={idx}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className={snapshot.isDragging ? 'dragging' : ''}>
                      <TodoCard todo={todo} onToggle={onToggle} onDelete={onDelete} onNavigate={onNavigate} dragHandleProps={provided.dragHandleProps} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {completedCount > 0 && (
        <div className="list-footer">
          <span>{completedCount} completed</span>
          <button className="btn-ghost-danger" onClick={onClearCompleted}>Clear completed</button>
        </div>
      )}
    </>
  );
}

function KanbanView({ cols, onToggle, onDelete, onNavigate }) {
  const colConfig = [
    { key: 'high', label: '🔴 High Priority', color: 'var(--high)' },
    { key: 'medium', label: '🟡 Medium Priority', color: 'var(--medium)' },
    { key: 'low', label: '🟢 Low Priority', color: 'var(--low)' },
    { key: 'done', label: '✓ Completed', color: 'var(--text-faint)' },
  ];
  return (
    <div className="kanban">
      {colConfig.map(col => (
        <div key={col.key} className="kanban-col">
          <div className="kanban-header">
            <span style={{color: col.color}}>{col.label}</span>
            <span className="kanban-count">{cols[col.key].length}</span>
          </div>
          <div className="kanban-cards">
            {cols[col.key].map(todo => (
              <TodoCard key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} onNavigate={onNavigate} dragHandleProps={{}} />
            ))}
            {cols[col.key].length === 0 && <div className="kanban-empty">No tasks here</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsView({ stats, todos }) {
  if (!stats) return null;
  const pieData = [
    { name: 'High', value: stats.byPriority.high, color: 'var(--high)' },
    { name: 'Medium', value: stats.byPriority.medium, color: 'var(--medium)' },
    { name: 'Low', value: stats.byPriority.low, color: 'var(--low)' },
  ].filter(d => d.value > 0);

  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="analytics">
      <div className="analytics-cards">
        <div className="analytics-card">
          <span className="analytics-num" style={{color:'var(--purple)'}}>{stats.total}</span>
          <span className="analytics-label">Total Tasks</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-num" style={{color:'var(--low)'}}>{stats.completed}</span>
          <span className="analytics-label">Completed</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-num" style={{color:'var(--cyan)'}}>{stats.active}</span>
          <span className="analytics-label">Active</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-num" style={{color:'var(--high)'}}>{stats.overdue}</span>
          <span className="analytics-label">Overdue</span>
        </div>
        <div className="analytics-card">
          <span className="analytics-num" style={{background:'var(--gradient)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{pct}%</span>
          <span className="analytics-label">Completion Rate</span>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card">
          <h3 className="chart-title">Completions — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.completionTrend}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c5cfc" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#7c5cfc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fill:'#8080aa', fontSize:11}} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{fill:'#8080aa', fontSize:11}} allowDecimals={false} />
              <Tooltip contentStyle={{background:'#0a0a12', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#f0f0ff'}} />
              <Area type="monotone" dataKey="completed" stroke="#7c5cfc" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">By Priority</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{background:'#0a0a12', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, color:'#f0f0ff'}} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="chart-empty">No data yet</div>}
          <div className="pie-legend">
            {pieData.map(d => (
              <span key={d.name} className="pie-legend-item">
                <span className="pie-dot" style={{background:d.color}} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">By Category</h3>
          <div className="cat-bars">
            {Object.entries(stats.byCategory || {}).map(([cat, count]) => (
              <div key={cat} className="cat-bar-row">
                <span className="cat-bar-label">{cat}</span>
                <div className="cat-bar-track">
                  <div className="cat-bar-fill" style={{width: `${(count / stats.total) * 100}%`}} />
                </div>
                <span className="cat-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
