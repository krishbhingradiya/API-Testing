const request = require('supertest');
const app = require('../server');
const aiRateLimiter = require('../src/middleware/aiRateLimiter');
const aiService = require('../src/services/aiService');

describe('Practical 13: Intelligent AI Task Understanding & Context-Aware Test Suite', () => {
  beforeEach(() => {
    aiRateLimiter.reset();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    aiRateLimiter.reset();
    jest.restoreAllMocks();
  });

  describe('POST /api/ai/generate-description', () => {
    it('should return HTTP 400 when task title is missing or empty', async () => {
      const res = await request(app)
        .post('/api/ai/generate-description')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Task title is required');
    });

    it('should return HTTP 200 with generated description when AI service succeeds', async () => {
      const mockDescription = 'Develop a comprehensive test suite covering both React frontend and Node.js backend components.';
      jest.spyOn(aiService, 'generateDescription').mockResolvedValue({
        status: 'ready',
        description: mockDescription,
        questions: [],
        provider: 'Google Gemini',
        model: 'gemini-1.5-flash'
      });

      const res = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'react and node js code testing' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.description).toBe(mockDescription);
      expect(res.body.provider).toBe('Google Gemini');
      expect(res.body.model).toBe('gemini-1.5-flash');
    });

    it('should return HTTP 429 when rate limit is exceeded on consecutive requests for the same title', async () => {
      jest.spyOn(aiService, 'generateDescription').mockResolvedValue({
        status: 'ready',
        description: 'First generation description.',
        questions: [],
        provider: 'Google Gemini',
        model: 'gemini-1.5-flash'
      });

      // First request passes
      const firstRes = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'prepare the project presentation' })
        .expect(200);
      expect(firstRes.body.success).toBe(true);

      // Immediate second request for same title triggers 429
      const secondRes = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'prepare the project presentation' })
        .expect('Content-Type', /json/)
        .expect(429);

      expect(secondRes.body.success).toBe(false);
      expect(secondRes.body.rateLimited).toBe(true);
      expect(secondRes.body.message).toContain('Rate limit: Please wait');
      expect(secondRes.headers['retry-after']).toBeDefined();
    });

    it('should return HTTP 503 with friendly fallback when API key is missing without crashing server', async () => {
      const missingKeyError = new Error('AI suggestions are temporarily unavailable (API key not configured). Please enter the task description manually.');
      missingKeyError.code = 'NO_API_KEY';
      missingKeyError.status = 503;

      jest.spyOn(aiService, 'generateDescription').mockRejectedValue(missingKeyError);

      const res = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'unconfigured task title' })
        .expect('Content-Type', /json/)
        .expect(503);

      expect(res.body.success).toBe(false);
      expect(res.body.configured).toBe(false);
      expect(res.body.message).toContain('AI suggestions are temporarily unavailable (API key not configured)');
    });

    // --- NEW INTELLIGENT AI PATH TESTS ---

    it('Path A: should return status needs_clarification with 2-3 dynamic questions for vague title "hello"', async () => {
      const res = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'hello' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('needs_clarification');
      expect(Array.isArray(res.body.questions)).toBe(true);
      expect(res.body.questions.length).toBeGreaterThanOrEqual(2);
      expect(res.body.questions.length).toBeLessThanOrEqual(3);
      expect(res.body.description).toBeNull();
    });

    it('Path A: should return status needs_clarification with tailored questions for "project"', async () => {
      const res = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'project' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('needs_clarification');
      expect(res.body.questions.some(q => q.toLowerCase().includes('project'))).toBe(true);
      expect(res.body.description).toBeNull();
    });

    it('Path B: should directly generate description with status ready for specific title "Prepare React Practical 11 Docker deployment"', async () => {
      const res = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'Prepare React Practical 11 Docker deployment' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ready');
      expect(res.body.questions).toEqual([]);
      expect(typeof res.body.description).toBe('string');
      expect(res.body.description.toLowerCase()).toContain('docker');
    });

    it('Path B: should directly generate description with status ready for "Fix login authentication bug in React application"', async () => {
      const res = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'Fix login authentication bug in React application' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ready');
      expect(res.body.description.toLowerCase()).toContain('authentication');
    });

    it('Multi-Turn Clarification: should synthesize answers into actionable description when user submits clarification', async () => {
      const answers = [
        { question: 'What are you planning to do?', answer: 'I want to complete my React practical assignment' },
        { question: 'What is the main objective?', answer: 'Dockerize my Task Management application' },
        { question: 'What is the expected outcome?', answer: 'Verify frontend, backend and MongoDB containers are healthy' }
      ];

      const res = await request(app)
        .post('/api/ai/generate-description')
        .send({ title: 'hello', answers })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ready');
      expect(res.body.questions).toEqual([]);
      expect(typeof res.body.description).toBe('string');
      expect(res.body.description.toLowerCase()).toContain('react');
      expect(res.body.description.toLowerCase()).toContain('task management');
    });
  });
});
