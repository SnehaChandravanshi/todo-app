import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';
import styles from './TodoCard.module.css';

const PRIORITY_LABEL = { high: 'High', medium: 'Medium', low: 'Low' };

export default function TodoCard({ todo, onToggle, onDelete }) {
  const nav = useNavigate();
  const isOverdue = todo.dueDate && !todo.completed && isAfter(new Date(), parseISO(todo.dueDate));
  const subtasksDone = (todo.subtasks || []).filter(s => s.completed).length;
  const subtasksTotal = (todo.subtasks || []).length;

  return (
    <div
      className={`${styles.card} ${todo.completed ? styles.done : ''} ${styles[todo.priority]}`}
      onClick={() => nav(`/todo?id=${todo.id}`)}
    >
      <div className={styles.left}>
        <button
          className={`${styles.check} ${todo.completed ? styles.checked : ''}`}
          onClick={e => { e.stopPropagation(); onToggle(todo.id); }}
          aria-label="Toggle complete"
        >
          {todo.completed && <svg width="12" height="12" viewBox="0 0 12 12"><polyline points="1.5,6 4.5,9 10.5,3" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.header}>
          <span className={`${styles.title} ${todo.completed ? styles.strikethrough : ''}`}>
            {todo.title}
          </span>
          <span className={`${styles.badge} ${styles[`badge_${todo.priority}`]}`}>
            {PRIORITY_LABEL[todo.priority]}
          </span>
        </div>

        {todo.description && (
          <p className={styles.desc}>{todo.description.slice(0, 100)}{todo.description.length > 100 ? '…' : ''}</p>
        )}

        <div className={styles.meta}>
          {todo.dueDate && (
            <span className={`${styles.due} ${isOverdue ? styles.overdue : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {isOverdue ? 'Overdue · ' : ''}{format(parseISO(todo.dueDate), 'MMM d')}
            </span>
          )}
          {subtasksTotal > 0 && (
            <span className={styles.subtask}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              {subtasksDone}/{subtasksTotal}
            </span>
          )}
          {(todo.tags || []).slice(0, 2).map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      <button
        className={styles.del}
        onClick={e => { e.stopPropagation(); onDelete(todo.id); }}
        aria-label="Delete todo"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  );
}
