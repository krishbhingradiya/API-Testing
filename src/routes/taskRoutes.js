const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const validateTaskId = require('../middleware/idValidator');
const { addLinksToTask, generateCollectionLinks } = require('../utils/taskLinks');
const cache = require('../utils/cache');

/**
 * @route   GET /tasks
 * @desc    Get all tasks with optional filtering (status, priority, search) and pagination (page, limit)
 * @status  200 OK
 */
router.get('/', async (req, res, next) => {
  try {
    const isDefaultQuery = Object.keys(req.query).length === 0;

    // 1. Practical 9: Check in-memory cache for all_tasks
    if (isDefaultQuery) {
      const cachedResponse = cache.get('all_tasks');
      if (cachedResponse) {
        cache.recordHit();
        return res.status(200).json(cachedResponse);
      }
      cache.recordMiss();
    }

    const filter = {};

    // Status filter (enum: pending, in-progress, completed)
    if (req.query.status !== undefined) {
      filter.status = req.query.status;
    }

    // Priority filter (enum: low, medium, high)
    if (req.query.priority !== undefined) {
      filter.priority = req.query.priority;
    }

    // Search filter (case-insensitive regex on title)
    if (req.query.search !== undefined && req.query.search.trim() !== '') {
      filter.title = { $regex: req.query.search.trim(), $options: 'i' };
    }

    // Pagination
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const totalCount = await Task.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    const tasks = await Task.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add HATEOAS links to each task
    const tasksWithLinks = tasks.map(task => addLinksToTask(task));

    // Generate collection-level HATEOAS pagination links
    const collectionLinks = generateCollectionLinks(req, page, limit, totalPages);

    const responsePayload = {
      success: true,
      count: tasksWithLinks.length,
      totalCount,
      page,
      totalPages,
      data: tasksWithLinks,
      _links: collectionLinks
    };

    // Store in cache for default GET /tasks
    if (isDefaultQuery) {
      cache.set('all_tasks', responsePayload);
    }

    res.status(200).json(responsePayload);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /tasks/test-error
 * @desc    Test route to deliberately trigger global error handling middleware
 * @status  500 Internal Server Error
 */
router.get('/test-error', (req, res, next) => {
  try {
    throw new Error('Deliberate simulation error to demonstrate Global Error Handler pipeline!');
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /tasks/:id
 * @desc    Get single task by ObjectId with HATEOAS links and Practical 9 in-memory caching
 * @status  200 OK or 404 Not Found
 */
router.get('/:id', validateTaskId, async (req, res, next) => {
  try {
    const cacheKey = `task_${req.params.id}`;
    const cachedTask = cache.get(cacheKey);

    // Practical 9: Check in-memory cache for individual task
    if (cachedTask) {
      cache.recordHit();
      return res.status(200).json(cachedTask);
    }
    cache.recordMiss();

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }

    const taskWithLinks = addLinksToTask(task);
    const responsePayload = {
      success: true,
      data: taskWithLinks,
      _links: taskWithLinks._links
    };

    // Store individual task in cache
    cache.set(cacheKey, responsePayload);

    res.status(200).json(responsePayload);
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /tasks
 * @desc    Create a new task in MongoDB with schema validation & HATEOAS links
 * @status  201 Created or 400 Bad Request
 */
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    // Create task document (triggers Mongoose schema validation)
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      dueDate
    });

    const savedTask = await newTask.save();

    // Practical 9: Invalidate all_tasks cache after successful DB creation
    cache.del('all_tasks');

    const taskWithLinks = addLinksToTask(savedTask);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: taskWithLinks,
      _links: taskWithLinks._links
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /tasks/:id
 * @desc    Full update of existing task by ObjectId with schema validation & regenerated HATEOAS links
 * @status  200 OK, 400 Bad Request, or 404 Not Found
 */
router.put('/:id', validateTaskId, async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (updateData.title && typeof updateData.title === 'string') {
      updateData.title = updateData.title.trim();
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }

    // Practical 9: Invalidate both all_tasks and individual task caches after successful DB update
    cache.del('all_tasks');
    cache.del(`task_${req.params.id}`);

    const taskWithLinks = addLinksToTask(updatedTask);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: taskWithLinks,
      _links: taskWithLinks._links
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /tasks/:id
 * @desc    Partial update of existing task by ObjectId with regenerated HATEOAS links
 * @status  200 OK, 400 Bad Request, or 404 Not Found
 */
router.patch('/:id', validateTaskId, async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (updateData.title && typeof updateData.title === 'string') {
      updateData.title = updateData.title.trim();
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }

    // Practical 9: Invalidate both all_tasks and individual task caches after successful DB partial update
    cache.del('all_tasks');
    cache.del(`task_${req.params.id}`);

    const taskWithLinks = addLinksToTask(updatedTask);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: taskWithLinks,
      _links: taskWithLinks._links
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   DELETE /tasks/:id
 * @desc    Delete task by ObjectId
 * @status  200 OK or 404 Not Found
 */
router.delete('/:id', validateTaskId, async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.params.id} not found`
      });
    }

    // Practical 9: Invalidate both all_tasks and individual task caches after successful DB deletion
    cache.del('all_tasks');
    cache.del(`task_${req.params.id}`);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      data: deletedTask
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
