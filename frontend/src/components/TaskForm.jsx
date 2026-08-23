import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createTask, updateTask, getTaskById } from '../api/taskApi';
import { useToast } from '../context/ToastContext';
import './TaskForm.css';

/**
 * TaskForm — Handles both Create and Edit modes for tasks.
 * In edit mode, pre-fills the form with existing task data fetched by ID.
 */
export default function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState(null);

  // Fetch existing task data in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchTask = async () => {
      setFetchLoading(true);
      const result = await getTaskById(id);
      if (result.success) {
        const task = result.data;
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'pending',
          priority: task.priority || 'medium',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        });
      } else {
        setError(result.error);
        addToast(`Failed to load task: ${result.error}`, 'error');
      }
      setFetchLoading(false);
    };

    fetchTask();
  }, [id, isEditMode, addToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Build payload — only include dueDate if set
    const payload = { ...formData };
    if (!payload.dueDate) delete payload.dueDate;

    const result = isEditMode
      ? await updateTask(id, payload)
      : await createTask(payload);

    setLoading(false);

    if (result.success) {
      addToast(
        isEditMode ? 'Task updated successfully!' : 'Task created successfully!',
        'success'
      );
      navigate('/');
    } else {
      setError(result.error);
      addToast(result.error, 'error');
    }
  };

  if (fetchLoading) {
    return (
      <div className="form-container">
        <div className="form-card">
          <div className="form-skeleton">
            <div className="skeleton-line skeleton-line--title"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line skeleton-line--short"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h2 className="form-title">
            {isEditMode ? '✏️ Edit Task' : '✨ Create New Task'}
          </h2>
          <p className="form-subtitle">
            {isEditMode
              ? 'Update the task details below'
              : 'Fill in the details to add a new task'}
          </p>
        </div>

        {error && (
          <div className="form-error" role="alert">
            <span className="form-error__icon">⚠</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-form" id="task-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title..."
              required
              className="form-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task..."
              required
              className="form-input form-textarea"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input form-select"
              >
                <option value="pending">🟡 Pending</option>
                <option value="in-progress">🔵 In Progress</option>
                <option value="completed">🟢 Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-input form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => navigate('/')}
              id="form-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
              id="form-submit-btn"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditMode ? 'Update Task' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
