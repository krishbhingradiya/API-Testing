import { useNavigate } from 'react-router-dom';
import './TaskCard.css';

/**
 * TaskCard — Renders a single task with status badge, priority indicator,
 * action buttons (edit/delete), and hover micro-animations.
 */

const STATUS_CONFIG = {
  pending: { label: 'Pending', emoji: '🟡', className: 'status--pending' },
  'in-progress': { label: 'In Progress', emoji: '🔵', className: 'status--in-progress' },
  completed: { label: 'Completed', emoji: '🟢', className: 'status--completed' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', className: 'priority--low' },
  medium: { label: 'Medium', className: 'priority--medium' },
  high: { label: 'High', className: 'priority--high' },
};

export default function TaskCard({ task, onDelete, isOptimistic }) {
  const navigate = useNavigate();
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`task-card ${isOptimistic ? 'task-card--optimistic' : ''}`}>
      {isOptimistic && <div className="task-card__saving-badge">Saving...</div>}

      <div className="task-card__header">
        <div className="task-card__badges">
          <span className={`task-card__status ${status.className}`}>
            {status.emoji} {status.label}
          </span>
          <span className={`task-card__priority ${priority.className}`}>
            {priority.label}
          </span>
        </div>
      </div>

      <h3 className="task-card__title">{task.title}</h3>
      <p className="task-card__description">{task.description}</p>

      <div className="task-card__footer">
        <div className="task-card__meta">
          {task.dueDate && (
            <span className="task-card__date">📅 {formatDate(task.dueDate)}</span>
          )}
          {task.createdAt && (
            <span className="task-card__created">
              Created {formatDate(task.createdAt)}
            </span>
          )}
        </div>

        {!isOptimistic && (
          <div className="task-card__actions">
            <button
              className="task-card__btn task-card__btn--edit"
              onClick={() => navigate(`/edit/${task._id}`)}
              title="Edit task"
              id={`edit-btn-${task._id}`}
            >
              ✏️
            </button>
            <button
              className="task-card__btn task-card__btn--delete"
              onClick={() => onDelete(task._id, task.title)}
              title="Delete task"
              id={`delete-btn-${task._id}`}
            >
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
