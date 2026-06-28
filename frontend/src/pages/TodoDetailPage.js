import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO, isAfter, differenceInDays } from 'date-fns';
import { fetchTodo, updateTodo, toggleTodo, toggleSubtask, deleteTodo } from '../api/todos';
import styles from './TodoDetailPage.module.css';

const PRIORITY_COLOR = { high: 'var(--high)', medium: 'var(--medium)', low: 'var(--low)' };

export default function TodoDetailPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const id = params.get('id');

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDue, setEditDue] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');

  const load = useCallback(async () => {
    if (!id) { setError('No todo ID provided'); setLoading(false); return; }
    try {
      const data = await fetchTodo(id);
      setTodo(data);
    } catch {
      setError('Todo not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const startEdit = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
    setEditPriority(todo.priority);
    setEditDue(todo.dueDate ? todo.dueDate.split('T')[0] : '');
    setEditTags([...(todo.tags || [])]);
    setEditing(true);
  };

  const saveEdit = async () => {
    const updated = await updateTodo(id, {
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      dueDate: editDue || null,
      tags: editTags,
    });
    setTodo(updated);
    setEditing(false);
  };

  const handleToggle = async () => {
    const updated = await toggleTodo(id);
    setTodo(updated);
  };

  const handleSubtaskToggle = async (subtaskId) => {
    const updated = await toggleSubtask(id, subtaskId);
    setTodo(updated);
  };

  const handleAddSubtask = async () => {
    const title = newSubtask.trim();
    if (!title) return;
    const updated = await updateTodo(id, {
      subtasks: [...(todo.subtasks || []), { title }]
    });
    setTodo(updated);
    setNewSubtask('');
  };

  const handleDeleteSubtask = async (subtaskId) => {
    const updated = await updateTodo(id, {
      subtasks: (todo.subtasks || []).filter(s => s.id !== subtaskId)
    });
    setTodo(updated);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this todo?')) return;
    await deleteTodo(id);
    nav('/');
  };

  const addEditTag = () => {
    const t = editTagInput.trim().toLowerCase();
    if (t && !editTags.includes(t)) { setEditTags([...editTags, t]); setEditTagInput(''); }
  };

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.center}><div className={styles.spinner} /></div>
    </div>
  );

  if (error) return (
    <div className={styles.page}>
      <div className={styles.center}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.backBtn} onClick={() => nav('/')}>← Back to list</button>
      </div>
    </div>
  );

  const subtasksDone = (todo.subtasks || []).filter(s => s.completed).length;
  const subtasksTotal = (todo.subtasks || []).length;
  const subtaskPct = subtasksTotal ? Math.round((subtasksDone / subtasksTotal) * 100) : 0;
  const isOverdue = todo.dueDate && !todo.completed && isAfter(new Date(), parseISO(todo.dueDate));
  const daysLeft = todo.dueDate && !todo.completed
    ? differenceInDays(parseISO(todo.dueDate), new Date())
    : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => nav('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          All Todos
        </button>
        <div className={styles.headerActions}>
          {!editing ? (
            <>
              <button className={styles.editBtn} onClick={startEdit}>Edit</button>
              <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
            </>
          ) : (
            <>
              <button className={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
              <button className={styles.saveBtn} onClick={saveEdit}>Save</button>
            </>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {/* Title + status */}
        <div className={styles.titleRow}>
          <button
            className={`${styles.checkLarge} ${todo.completed ? styles.checked : ''}`}
            onClick={handleToggle}
          >
            {todo.completed && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </button>
          {editing ? (
            <input
              className={styles.titleInput}
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
            />
          ) : (
            <h1 className={`${styles.titleText} ${todo.completed ? styles.done : ''}`}>
              {todo.title}
            </h1>
          )}
        </div>

        {/* Priority + due */}
        <div className={styles.metaRow}>
          {editing ? (
            <div className={styles.priorities}>
              {['high', 'medium', 'low'].map(p => (
                <button
                  key={p}
                  className={`${styles.priBtn} ${editPriority === p ? styles.priActive : ''}`}
                  style={editPriority === p ? { borderColor: PRIORITY_COLOR[p], color: PRIORITY_COLOR[p] } : {}}
                  onClick={() => setEditPriority(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          ) : (
            <span
              className={styles.priorityBadge}
              style={{ color: PRIORITY_COLOR[todo.priority], background: `${PRIORITY_COLOR[todo.priority]}20`, borderColor: `${PRIORITY_COLOR[todo.priority]}40` }}
            >
              {todo.priority} priority
            </span>
          )}

          {editing ? (
            <input
              type="date"
              className={styles.dateInput}
              value={editDue}
              onChange={e => setEditDue(e.target.value)}
            />
          ) : todo.dueDate && (
            <span className={`${styles.due} ${isOverdue ? styles.overdue : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Due {format(parseISO(todo.dueDate), 'MMM d, yyyy')}
              {daysLeft !== null && (
                <span className={styles.daysLeft}>
                  {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                </span>
              )}
            </span>
          )}

          <span className={`${styles.statusBadge} ${todo.completed ? styles.statusDone : styles.statusActive}`}>
            {todo.completed ? 'Completed' : 'Active'}
          </span>
        </div>

        {/* Description */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Description</h2>
          {editing ? (
            <textarea
              className={styles.textarea}
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              rows={4}
              placeholder="Add a description..."
            />
          ) : todo.description ? (
            <p className={styles.description}>{todo.description}</p>
          ) : (
            <p className={styles.empty}>No description</p>
          )}
        </section>

        {/* Tags */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tags</h2>
          {editing ? (
            <>
              <div className={styles.tagRow}>
                <input
                  className={styles.input}
                  value={editTagInput}
                  onChange={e => setEditTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addEditTag())}
                  placeholder="Add tag..."
                />
                <button className={styles.addTagBtn} onClick={addEditTag}>Add</button>
              </div>
              <div className={styles.tags}>
                {editTags.map(t => (
                  <span key={t} className={styles.tag}>
                    {t}
                    <button onClick={() => setEditTags(editTags.filter(x => x !== t))}>×</button>
                  </span>
                ))}
              </div>
            </>
          ) : (todo.tags || []).length > 0 ? (
            <div className={styles.tags}>
              {todo.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
            </div>
          ) : (
            <p className={styles.empty}>No tags</p>
          )}
        </section>

        {/* Subtasks */}
        <section className={styles.section}>
          <div className={styles.subtaskHeader}>
            <h2 className={styles.sectionTitle}>Subtasks</h2>
            {subtasksTotal > 0 && (
              <span className={styles.subtaskCount}>{subtasksDone}/{subtasksTotal}</span>
            )}
          </div>

          {subtasksTotal > 0 && (
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${subtaskPct}%` }} />
            </div>
          )}

          <div className={styles.subtasks}>
            {(todo.subtasks || []).map(s => (
              <div key={s.id} className={`${styles.subtask} ${s.completed ? styles.subtaskDone : ''}`}>
                <button
                  className={`${styles.subtaskCheck} ${s.completed ? styles.subtaskChecked : ''}`}
                  onClick={() => handleSubtaskToggle(s.id)}
                >
                  {s.completed && <svg width="10" height="10" viewBox="0 0 12 12"><polyline points="1.5,6 4.5,9 10.5,3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                </button>
                <span className={styles.subtaskTitle}>{s.title}</span>
                <button
                  className={styles.subtaskDel}
                  onClick={() => handleDeleteSubtask(s.id)}
                >×</button>
              </div>
            ))}
          </div>

          <div className={styles.addSubtask}>
            <input
              className={styles.input}
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
              placeholder="Add a subtask..."
            />
            <button className={styles.addTagBtn} onClick={handleAddSubtask}>Add</button>
          </div>
        </section>

        {/* Timeline */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Timeline</h2>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <span className={styles.timelineDot} />
              <div>
                <span className={styles.timelineLabel}>Created</span>
                <span className={styles.timelineValue}>
                  {format(parseISO(todo.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </div>
            {todo.updatedAt !== todo.createdAt && (
              <div className={styles.timelineItem}>
                <span className={`${styles.timelineDot} ${styles.dotUpdated}`} />
                <div>
                  <span className={styles.timelineLabel}>Last Updated</span>
                  <span className={styles.timelineValue}>
                    {format(parseISO(todo.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>
            )}
            {todo.completedAt && (
              <div className={styles.timelineItem}>
                <span className={`${styles.timelineDot} ${styles.dotDone}`} />
                <div>
                  <span className={styles.timelineLabel}>Completed</span>
                  <span className={styles.timelineValue}>
                    {format(parseISO(todo.completedAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Meta ID */}
        <div className={styles.idBlock}>
          <span className={styles.idLabel}>Todo ID</span>
          <span className={styles.idValue}>{todo.id}</span>
        </div>
      </main>
    </div>
  );
}
