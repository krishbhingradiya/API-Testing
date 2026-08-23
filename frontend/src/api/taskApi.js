/**
 * Task API Module — Central API layer for all backend CRUD operations
 * 
 * Single source of truth for the backend base URL.
 * Every function returns structured { success, data, error } responses.
 */

const BASE_URL = 'http://localhost:5001';

/**
 * GET /tasks — Fetch all tasks with optional pagination and filters
 * @param {number} page - Page number (default 1)
 * @param {number} limit - Items per page (default 10)
 * @param {Object} filters - Optional { status, priority, search }
 */
export const getTasks = async (page = 1, limit = 10, filters = {}) => {
  try {
    const params = new URLSearchParams({ page, limit });
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`${BASE_URL}/tasks?${params.toString()}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Failed to fetch tasks');
    }

    return { success: true, data: json };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * GET /tasks/:id — Fetch a single task by ID
 */
export const getTaskById = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/tasks/${id}`);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Failed to fetch task');
    }

    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * POST /tasks — Create a new task
 * @param {Object} taskData - { title, description, status?, priority?, dueDate? }
 */
export const createTask = async (taskData) => {
  try {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const json = await res.json();

    if (!res.ok) {
      const errorMsg = json.details
        ? json.details.join(', ')
        : json.error || 'Failed to create task';
      throw new Error(errorMsg);
    }

    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * PUT /tasks/:id — Full update of an existing task
 * @param {string} id - Task MongoDB ObjectId
 * @param {Object} taskData - Updated task fields
 */
export const updateTask = async (id, taskData) => {
  try {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    const json = await res.json();

    if (!res.ok) {
      const errorMsg = json.details
        ? json.details.join(', ')
        : json.error || 'Failed to update task';
      throw new Error(errorMsg);
    }

    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * DELETE /tasks/:id — Delete a task
 * @param {string} id - Task MongoDB ObjectId
 */
export const deleteTask = async (id) => {
  try {
    const res = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || 'Failed to delete task');
    }

    return { success: true, data: json.data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
