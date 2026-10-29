import { useState, useEffect } from 'react';
import { createTask, updateTask, generateTaskDescription } from '../api/taskApi';
import { useToast } from '../context/ToastContext';
import './TaskModal.css';

/**
 * TaskModal — Interactive Modal with Practical 13 AI Integration
 * Features:
 * - AI-powered task description generation (OpenAI / Gemini backend)
 * - Rate-limit & fallback banner handling
 * - Full manual fallback when AI is unavailable
 */
export default function TaskModal({ isOpen, onClose, onSuccess, initialTask = null }) {
  const isEditMode = Boolean(initialTask && initialTask._id);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
  });

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null); // { type: 'success' | 'error', message: '' }

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        status: initialTask.status || 'pending',
        priority: initialTask.priority || 'medium',
        dueDate: initialTask.dueDate ? initialTask.dueDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
      });
    }
    setAiFeedback(null);
  }, [initialTask, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Practical 13: Handle AI Description Generation
   */
  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      setAiFeedback({
        type: 'error',
        message: 'Please enter a task title first so the AI can generate a relevant description.',
      });
      return;
    }

    setAiLoading(true);
    setAiFeedback(null);

    const result = await generateTaskDescription(formData.title.trim());
    setAiLoading(false);

    if (result.success && result.description) {
      setFormData((prev) => ({
        ...prev,
        description: result.description,
      }));
      setAiFeedback({
        type: 'success',
        message: 'AI description generated! Review and edit before saving.',
      });
    } else {
      setAiFeedback({
        type: 'error',
        message: result.message || 'AI generation failed. Please enter the description manually.',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = { ...formData };
    if (!payload.dueDate) delete payload.dueDate;

    const result = isEditMode
      ? await updateTask(initialTask._id, payload)
      : await createTask(payload);

    setSaving(false);

    if (result.success) {
      addToast(
        isEditMode ? 'Task updated successfully!' : 'Task created in MongoDB!',
        'success'
      );
      if (onSuccess) onSuccess();
      onClose();
    } else {
      addToast(result.error || 'Failed to save task', 'error');
    }
  };

  return (
    <div className="task-modal-overlay" onClick={onClose}>
      <div className="task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="task-modal__header">
          <h2 className="task-modal__title">
            {isEditMode ? '✏️ Edit Task (PUT /tasks/:id)' : '⊕ Create New Task (POST /tasks)'}
          </h2>
          <button className="task-modal__close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="task-modal__body">
          <form onSubmit={handleSubmit} className="task-modal-form">
            {/* Task Title */}
            <div className="modal-form-group">
              <label htmlFor="modal-title" className="modal-label">
                Task Title *
              </label>
              <input
                type="text"
                id="modal-title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Implement React + Node + MongoDB full stack flow"
                required
                className="modal-input"
                autoFocus
              />
            </div>

            {/* Description & AI Generator Button */}
            <div className="modal-form-group">
              <div className="modal-label-row">
                <label htmlFor="modal-description" className="modal-label">
                  Description
                </label>
                <button
                  type="button"
                  className="btn-ai-generate"
                  onClick={handleGenerateDescription}
                  disabled={aiLoading}
                  id="btn-generate-ai-description"
                >
                  {aiLoading ? (
                    <>
                      <span className="spinner" style={{ width: '12px', height: '12px' }}></span>
                      Generating...
                    </>
                  ) : (
                    <>✨ Generate description with AI</>
                  )}
                </button>
              </div>

              {/* AI Feedback Banner */}
              {aiFeedback && (
                <div
                  className={`ai-banner ${
                    aiFeedback.type === 'success' ? 'ai-banner--success' : 'ai-banner--error'
                  }`}
                  role="alert"
                >
                  <span>{aiFeedback.type === 'success' ? '✓' : '⚠'}</span>
                  <span>{aiFeedback.message}</span>
                </div>
              )}

              <textarea
                id="modal-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Additional details, requirements, or notes..."
                required
                className="modal-textarea"
                rows={4}
              />

              <div className="ai-disclaimer">
                <span>ⓘ</span>
                <span>
                  AI-generated suggestion: Review and edit this content before saving. AI-generated content may be inaccurate.
                </span>
              </div>
            </div>

            {/* Status & Priority Row */}
            <div className="modal-form-row">
              <div className="modal-form-group">
                <label htmlFor="modal-status" className="modal-label">
                  Initial Status
                </label>
                <select
                  id="modal-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="modal-select"
                >
                  <option value="pending">🟡 To Do (Pending)</option>
                  <option value="in-progress">🔵 In Progress</option>
                  <option value="completed">🟢 Completed</option>
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="modal-priority" className="modal-label">
                  Priority
                </label>
                <select
                  id="modal-priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="modal-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div className="modal-form-group">
              <label htmlFor="modal-dueDate" className="modal-label">
                Due Date
              </label>
              <input
                type="date"
                id="modal-dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="modal-submit-btn"
              disabled={saving}
              id="modal-submit-btn"
            >
              {saving ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  {isEditMode ? 'Updating in MongoDB...' : 'Creating Task in MongoDB...'}
                </>
              ) : (
                <>
                  {isEditMode ? '💾 Update Task in MongoDB' : '⊕ Create Task In MongoDB'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
