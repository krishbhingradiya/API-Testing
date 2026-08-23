/**
 * Central API Configuration & Service Layer
 * Practical Lab — Step 2: Base Backend URL Configuration
 */

export let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const FALLBACK_PORTS = ['http://localhost:5001', 'http://localhost:5000', 'http://localhost:3000'];

export function setBaseUrl(newUrl) {
  BASE_URL = newUrl;
}

/**
 * Fetch all tasks from our MongoDB backend /tasks endpoint
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

    return { success: true, data: json.data || json };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
