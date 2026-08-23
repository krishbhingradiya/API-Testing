/**
 * HATEOAS Link Generator Utility
 * Generates hypermedia links for Task resources based on current state.
 * Uses relative URLs to avoid hardcoding host/port.
 */

/**
 * Generate HATEOAS links for a single task based on its current status.
 * 
 * Status-aware link rules:
 *   pending     → self, update, partialUpdate, start, delete, collection
 *   in-progress → self, update, partialUpdate, complete, delete, collection
 *   completed   → self, update, partialUpdate, delete, collection
 *
 * @param {Object} task - Mongoose task document (must have _id and status)
 * @returns {Object} HATEOAS _links object
 */
function generateTaskLinks(task) {
  const id = task._id;
  const links = {
    self: {
      href: `/tasks/${id}`,
      method: 'GET'
    },
    update: {
      href: `/tasks/${id}`,
      method: 'PUT'
    },
    partialUpdate: {
      href: `/tasks/${id}`,
      method: 'PATCH'
    }
  };

  // Status-aware transition links
  if (task.status === 'pending') {
    links.start = {
      href: `/tasks/${id}`,
      method: 'PATCH'
    };
  } else if (task.status === 'in-progress') {
    links.complete = {
      href: `/tasks/${id}`,
      method: 'PATCH'
    };
  }
  // completed → no transition links

  links.delete = {
    href: `/tasks/${id}`,
    method: 'DELETE'
  };

  links.collection = {
    href: '/tasks',
    method: 'GET'
  };

  return links;
}

/**
 * Convert a Mongoose task document to a plain object and attach HATEOAS _links.
 *
 * @param {Object} task - Mongoose task document
 * @returns {Object} Plain object with _links attached
 */
function addLinksToTask(task) {
  const taskObj = task.toObject ? task.toObject() : { ...task };
  taskObj._links = generateTaskLinks(taskObj);
  return taskObj;
}

/**
 * Generate collection-level HATEOAS links with pagination navigation.
 * Preserves existing query parameters (search, status, limit) across pagination links.
 *
 * Pagination link rules:
 *   - self: current page
 *   - first: always page 1
 *   - last: always last page
 *   - previous: only if current page > 1
 *   - next: only if current page < totalPages
 *   - create: POST /tasks
 *
 * @param {Object} req - Express request object
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} totalPages - Total number of pages
 * @returns {Object} HATEOAS _links object for the collection
 */
function generateCollectionLinks(req, page, limit, totalPages) {
  // Build query string preserving search, status, and other non-pagination params
  const preservedParams = {};
  if (req.query.search) preservedParams.search = req.query.search;
  if (req.query.status) preservedParams.status = req.query.status;
  if (req.query.priority) preservedParams.priority = req.query.priority;

  function buildHref(targetPage) {
    const params = new URLSearchParams(preservedParams);
    params.set('page', targetPage);
    params.set('limit', limit);
    return `/tasks?${params.toString()}`;
  }

  const links = {
    self: {
      href: buildHref(page),
      method: 'GET'
    },
    first: {
      href: buildHref(1),
      method: 'GET'
    }
  };

  if (page > 1) {
    links.previous = {
      href: buildHref(page - 1),
      method: 'GET'
    };
  }

  if (page < totalPages) {
    links.next = {
      href: buildHref(page + 1),
      method: 'GET'
    };
  }

  links.last = {
    href: buildHref(totalPages || 1),
    method: 'GET'
  };

  links.create = {
    href: '/tasks',
    method: 'POST'
  };

  return links;
}

module.exports = {
  generateTaskLinks,
  addLinksToTask,
  generateCollectionLinks
};
