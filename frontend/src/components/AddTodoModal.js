import React, { useState } from 'react';
import './AddTodoModal.css';

export default function AddTodoModal({ onClose, onSave, categories = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [category, setCategory] = useState('General');
  const [recurring, setRecurring] = useState('');
  const [error, setError] = useState('');

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(''); }
  };
  const addSubtask = () => {
    const s = subtaskInput.trim();
    if (s) { setSubtasks([...subtasks, s]); setSubtaskInput(''); }
  };
  const handleSubmit = () => {
    if (!title.trim()) { setError('Title is required'); return; }
    onSave({ title, description, priority, dueDate: dueDate || null, tags, subtasks, category, recurring: recurring || null });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New Task</h2>
            <p className="modal-sub">Add details to stay organized</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-body">
          <div className="modal-field">
            <label className="modal-label">Title *</label>
            <input className="modal-input" value={title} onChange={e => { setTitle(e.target.value); setError(''); }}
              placeholder="What needs to be done?" autoFocus onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea className="modal-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add details…" rows={3} />
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Priority</label>
              <div className="pri-group">
                {[['high','🔴'],['medium','🟡'],['low','🟢']].map(([p, icon]) => (
                  <button key={p} className={`pri-btn pri-${p} ${priority === p ? 'active' : ''}`} onClick={() => setPriority(p)}>
                    {icon} {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-field">
              <label className="modal-label">Category</label>
              <select className="modal-select" value={category} onChange={e => setCategory(e.target.value)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Due Date</label>
              <input type="date" className="modal-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="modal-field">
              <label className="modal-label">Recurring</label>
              <select className="modal-select" value={recurring} onChange={e => setRecurring(e.target.value)}>
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Tags</label>
            <div className="modal-inline">
              <input className="modal-input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag…" />
              <button className="modal-add-btn" onClick={addTag}>Add</button>
            </div>
            <div className="chip-row">
              {tags.map(t => (
                <span key={t} className="chip">#{t}<button onClick={() => setTags(tags.filter(x => x !== t))}>×</button></span>
              ))}
            </div>
          </div>

          <div className="modal-field">
            <label className="modal-label">Subtasks</label>
            <div className="modal-inline">
              <input className="modal-input" value={subtaskInput} onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())} placeholder="Add subtask…" />
              <button className="modal-add-btn" onClick={addSubtask}>Add</button>
            </div>
            <div className="subtask-list">
              {subtasks.map((s, i) => (
                <div key={i} className="subtask-row">
                  <span>□ {s}</span>
                  <button onClick={() => setSubtasks(subtasks.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose}>Cancel</button>
          <button className="modal-save" onClick={handleSubmit}>Create Task</button>
        </div>
      </div>
    </div>
  );
}
