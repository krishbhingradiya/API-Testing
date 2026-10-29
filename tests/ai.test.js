const request = require('supertest');
const app = require('../server');
const aiRateLimiter = require('../src/middleware/aiRateLimiter');
const aiService = require('../src/services/aiService');

describe('Practical 13: AI API Integration Test Suite', () => {
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
        description: mockDescription,
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
        description: 'First generation description.',
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
  });
});
