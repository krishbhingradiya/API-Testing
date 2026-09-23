import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, deleteTask } from '../api/taskApi';
import { useToast } from '../context/ToastContext';
import TaskCard from './TaskCard';
import ConfirmDialog from './ConfirmDialog';
import './TaskList.css';

/**
 * TaskList — Main container that fetches and displays all tasks.
 * Features: loading/error states, pagination, search/filter, confirmation dialog,
 * and optimistic UI for newly created tasks.
 */
export default function TaskList() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch tasks from backend — re-fetches on page/filter changes
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filters = {};
    if (searchQuery.trim()) filters.search = searchQuery.trim();
    if (statusFilter) filters.status = statusFilter;
    if (priorityFilter) filters.priority = priorityFilter;

    const result = await getTasks(page, 12, filters);

    if (result.success) {
      setTasks(result.data.data || []);
      setTotalPages(result.data.totalPages || 1);
      setTotalCount(result.data.totalCount || 0);
    } else {
      setError(result.error);
      addToast(`Failed to load tasks: ${result.error}`, 'error');
    }

    setLoading(false);
  }, [page, searchQuery, statusFilter, priorityFilter, addToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Debounced search — resets to page 1 on filter change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePriorityChange = (e) => {
    setPriorityFilter(e.target.value);
    setPage(1);
  };

  // Delete flow with confirmation dialog
  const handleDeleteRequest = (id, title) => {
    setDeleteTarget({ id, title });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const result = await deleteTask(deleteTarget.id);

    if (result.success) {
      addToast(`"${deleteTarget.title}" deleted successfully!`, 'success');
      // Re-fetch to sync UI with server state
      fetchTasks();
    } else {
      addToast(`Failed to delete: ${result.error}`, 'error');
    }

    setDeleting(false);
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  // Pagination handlers
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter || priorityFilter;

  return (
    <div className="task-list-container">
      {/* Semantic Header */}
      <header className="task-list__header">
        <h1 className="task-list__title">Task Dashboard</h1>
        <p className="task-list__subtitle">Organize, track, and manage your tasks efficiently</p>
      </header>

      {/* Toolbar: Search, Filters, Create Button */}
      <div className="task-toolbar">
        <div className="task-toolbar__search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
            id="search-tasks-input"
            aria-label="Search tasks"
          />
        </div>

        <div className="task-toolbar__filters">
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="filter-select"
            id="filter-status"
            aria-label="Filter tasks by status"
          >
            <option value="">All Statuses</option>
            <option value="pending">🟡 Pending</option>
            <option value="in-progress">🔵 In Progress</option>
            <option value="completed">🟢 Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={handlePriorityChange}
            className="filter-select"
            id="filter-priority"
            aria-label="Filter tasks by priority"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {hasActiveFilters && (
            <button className="btn btn--ghost" onClick={clearFilters} id="clear-filters-btn">
              ✕ Clear
            </button>
          )}
        </div>

        <button
          className="btn btn--primary btn--create"
          onClick={() => navigate('/create')}
          id="create-task-btn"
        >
          <span>+</span> New Task
        </button>
      </div>

      {/* Results count */}
      {!loading && !error && (
        <div className="task-list__count">
          {totalCount === 0
            ? 'No tasks found'
            : `Showing ${tasks.length} of ${totalCount} task${totalCount !== 1 ? 's' : ''}`}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="task-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="task-card-skeleton">
              <div className="skeleton-badges">
                <div className="skeleton-badge"></div>
                <div className="skeleton-badge skeleton-badge--sm"></div>
              </div>
              <div className="skeleton-title"></div>
              <div className="skeleton-desc"></div>
              <div className="skeleton-desc skeleton-desc--short"></div>
              <div className="skeleton-footer"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="task-list__error">
          <div className="error-icon">⚠️</div>
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={fetchTasks} id="retry-btn">
            ↻ Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && tasks.length === 0 && (
        <div className="task-list__empty">
          <div className="empty-icon">📋</div>
          <h2>{hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}</h2>
          <p>
            {hasActiveFilters
              ? 'Try adjusting your filters or search query.'
              : 'Create your first task to get started!'}
          </p>
          {!hasActiveFilters && (
            <button
              className="btn btn--primary"
              onClick={() => navigate('/create')}
              id="create-first-task-btn"
            >
              ✨ Create First Task
            </button>
          )}
        </div>
      )}

      {/* Task Grid */}
      {!loading && !error && tasks.length > 0 && (
        <>
          <div className="task-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={handleDeleteRequest}
                isOptimistic={task._optimistic}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="task-pagination">
              <button
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={page <= 1}
                id="prev-page-btn"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={page >= totalPages}
                id="next-page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Task"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ''
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
