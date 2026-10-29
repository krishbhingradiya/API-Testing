const request = require('supertest');
const app = require('../server');
const Task = require('../src/models/Task');
const cache = require('../src/utils/cache');

describe('Task Manager REST API & CI Automated Test Suite', () => {
  beforeEach(() => {
    // Reset cache and stats before each test to maintain strict test isolation
    cache.flushAll();
    cache.resetCustomStats();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    cache.flushAll();
    jest.restoreAllMocks();
  });

  describe('GET /tasks', () => {
    it('should return HTTP 200 with list of tasks and HATEOAS collection links', async () => {
      const mockTask = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Complete Practical 12',
        description: 'Set up GitHub Actions CI/CD Pipeline',
        status: 'pending',
        priority: 'high',
        assignedUser: 'DevOps Engineer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock Task.countDocuments and chained Task.find().sort().skip().limit()
      jest.spyOn(Task, 'countDocuments').mockResolvedValue(1);
      const queryMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockTask])
      };
      jest.spyOn(Task, 'find').mockReturnValue(queryMock);

      const res = await request(app)
        .get('/tasks')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.totalCount).toBe(1);
      expect(res.body.data[0].title).toBe('Complete Practical 12');
      expect(res.body.data[0]._links).toBeDefined();
      expect(res.body.data[0]._links.self.href).toBe(`/tasks/${mockTask._id}`);
      expect(res.body._links).toBeDefined();
      expect(res.body._links.self.href).toContain('/tasks');
    });
  });

  describe('GET /debug/cache', () => {
    it('should return HTTP 200 with runtime cache statistics', async () => {
      const res = await request(app)
        .get('/debug/cache')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('hits');
      expect(res.body).toHaveProperty('misses');
      expect(res.body).toHaveProperty('totalRequests');
      expect(res.body).toHaveProperty('hitRate');
      expect(res.body).toHaveProperty('activeKeys');
    });
  });

  describe('GET /tasks/:id (Validation Middleware)', () => {
    it('should return HTTP 400 when an invalid MongoDB ObjectId is provided', async () => {
      const res = await request(app)
        .get('/tasks/invalid-object-id')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid Task ID format. ID must be a valid 24-character hex MongoDB ObjectId.');
    });
  });

  describe('POST /tasks (Payload Validation)', () => {
    it('should return HTTP 400 when creating a task without required fields', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({}) // Missing required title and description
        .expect('Content-Type', /json/)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });
});
