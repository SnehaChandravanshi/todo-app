const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { readAll, writeAll } = require('../db/fileDb');

// GET /api/todos
router.get('/', (req, res) => {
  let todos = readAll();
  const { status, priority, search, sort, tags, category } = req.query;

  if (status && status !== 'all') {
    if (status === 'completed') todos = todos.filter(t => t.completed);
    else if (status === 'active') todos = todos.filter(t => !t.completed);
  }
  if (priority && priority !== 'all') todos = todos.filter(t => t.priority === priority);
  if (category && category !== 'all') todos = todos.filter(t => t.category === category);
  if (search) {
    const q = search.toLowerCase();
    todos = todos.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
  }
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim().toLowerCase());
    todos = todos.filter(t => (t.tags || []).some(tag => tagList.includes(tag.toLowerCase())));
  }

  if (sort === 'dueDate') todos = todos.sort((a, b) => { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate) - new Date(b.dueDate); });
  else if (sort === 'priority') { const o = { high: 0, medium: 1, low: 2 }; todos = todos.sort((a, b) => (o[a.priority] ?? 3) - (o[b.priority] ?? 3)); }
  else if (sort === 'title') todos = todos.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'order') todos = todos.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  else todos = todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(todos);
});

router.get('/stats', (req, res) => {
  const todos = readAll();
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const overdue = todos.filter(t => t.dueDate && !t.completed && new Date() > new Date(t.dueDate)).length;
  const byPriority = { high: 0, medium: 0, low: 0 };
  todos.forEach(t => { if (byPriority[t.priority] !== undefined) byPriority[t.priority]++; });
  const byCategory = {};
  todos.forEach(t => { const c = t.category || 'Uncategorized'; byCategory[c] = (byCategory[c] || 0) + 1; });

  // completion by day (last 7 days)
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = todos.filter(t => t.completedAt && t.completedAt.startsWith(dateStr)).length;
    days.push({ date: dateStr, completed: count });
  }

  res.json({ total, completed, active, overdue, byPriority, byCategory, completionTrend: days });
});

router.get('/:id', (req, res) => {
  const todos = readAll();
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

router.post('/', (req, res) => {
  const { title, description, priority, dueDate, tags, subtasks, category, recurring } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
  const todos = readAll();
  const now = new Date().toISOString();
  const newTodo = {
    id: uuidv4(),
    title: title.trim(),
    description: description || '',
    priority: priority || 'medium',
    completed: false,
    dueDate: dueDate || null,
    tags: tags || [],
    category: category || 'General',
    recurring: recurring || null,
    subtasks: (subtasks || []).map(s => ({ id: uuidv4(), title: typeof s === 'string' ? s : s.title, completed: false })),
    order: todos.length,
    createdAt: now,
    updatedAt: now,
    completedAt: null
  };
  todos.push(newTodo);
  writeAll(todos);
  res.status(201).json(newTodo);
});

router.put('/:id', (req, res) => {
  const todos = readAll();
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' });
  const { title, description, priority, dueDate, tags, subtasks, completed, category, recurring } = req.body;
  const existing = todos[idx];
  const wasCompleted = existing.completed;
  const nowCompleted = completed !== undefined ? completed : existing.completed;
  todos[idx] = {
    ...existing,
    title: title !== undefined ? title.trim() : existing.title,
    description: description !== undefined ? description : existing.description,
    priority: priority || existing.priority,
    dueDate: dueDate !== undefined ? dueDate : existing.dueDate,
    tags: tags !== undefined ? tags : existing.tags,
    category: category !== undefined ? category : existing.category,
    recurring: recurring !== undefined ? recurring : existing.recurring,
    subtasks: subtasks !== undefined ? subtasks.map(s => ({ id: s.id || uuidv4(), title: s.title, completed: s.completed || false })) : existing.subtasks,
    completed: nowCompleted,
    completedAt: nowCompleted && !wasCompleted ? new Date().toISOString() : (nowCompleted ? existing.completedAt : null),
    updatedAt: new Date().toISOString()
  };
  writeAll(todos);
  res.json(todos[idx]);
});

router.patch('/reorder', (req, res) => {
  const { orderedIds } = req.body;
  const todos = readAll();
  orderedIds.forEach((id, idx) => {
    const t = todos.find(t => t.id === id);
    if (t) t.order = idx;
  });
  writeAll(todos);
  res.json({ message: 'Reordered' });
});

router.patch('/:id/toggle', (req, res) => {
  const todos = readAll();
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' });
  const todo = todos[idx];
  const nowCompleted = !todo.completed;
  todos[idx] = { ...todo, completed: nowCompleted, completedAt: nowCompleted ? new Date().toISOString() : null, updatedAt: new Date().toISOString() };
  writeAll(todos);
  res.json(todos[idx]);
});

router.patch('/:id/subtasks/:subtaskId/toggle', (req, res) => {
  const todos = readAll();
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Todo not found' });
  const todo = todos[idx];
  const subtasks = (todo.subtasks || []).map(s => s.id === req.params.subtaskId ? { ...s, completed: !s.completed } : s);
  todos[idx] = { ...todo, subtasks, updatedAt: new Date().toISOString() };
  writeAll(todos);
  res.json(todos[idx]);
});

router.delete('/:id', (req, res) => {
  const todos = readAll();
  const filtered = todos.filter(t => t.id !== req.params.id);
  if (filtered.length === todos.length) return res.status(404).json({ error: 'Todo not found' });
  writeAll(filtered);
  res.json({ message: 'Deleted' });
});

router.delete('/', (req, res) => {
  if (req.query.clearCompleted === 'true') {
    writeAll(readAll().filter(t => !t.completed));
    return res.json({ message: 'Cleared completed' });
  }
  res.status(400).json({ error: 'No action specified' });
});

module.exports = router;
