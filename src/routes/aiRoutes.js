const express = require('express');
const router = express.Router();
const aiRateLimiter = require('../middleware/aiRateLimiter');
const aiService = require('../services/aiService');

/**
 * @route   POST /api/ai/generate-description
 * @desc    Intelligent AI Task Understanding & Context-Aware Description Generation
 *          - Classifies title as 'needs_clarification' or 'ready'
 *          - If 'needs_clarification', returns 2-3 dynamic questions and description: null
 *          - If 'ready', returns direct actionable task description and questions: []
 *          - When answers are provided, synthesizes multi-turn context into a comprehensive description
 * @access  Public (protected by rate limiter)
 */
router.post('/generate-description', aiRateLimiter, async (req, res) => {
  try {
    const { title, answers, goal, techStack, style } = req.body || {};

    // 1. Validate mandatory task title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required to generate an AI description'
      });
    }

    // 2. Perform intelligent task understanding & generation
    const result = await aiService.generateDescription(title, { answers, goal, techStack, style });

    const status = result.status || (result.description ? 'ready' : 'needs_clarification');
    const questions = Array.isArray(result.questions) ? result.questions : [];
    const description = result.description || null;

    return res.status(200).json({
      success: true,
      status: status,
      questions: questions,
      description: description,
      provider: result.provider || 'Google Gemini',
      model: result.model || 'gemini-2.5-flash'
    });
  } catch (err) {
    console.error('⚠️ [AI Generation Handler Caught Exception]:', err.message);

    // Missing API Key scenario
    if (err.code === 'NO_API_KEY' || err.status === 503) {
      return res.status(503).json({
        success: false,
        configured: false,
        message: 'AI suggestions are temporarily unavailable (API key not configured). Please enter the task description manually.'
      });
    }

    // Timeout scenario
    if (err.name === 'TimeoutError' || err.code === 20 || err.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        message: 'AI request timed out. Please enter task description manually.'
      });
    }

    // Provider / Invalid API Key scenario
    const statusCode = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    return res.status(statusCode).json({
      success: false,
      message: `AI suggestions are temporarily unavailable (${err.message}). Please enter the task description manually.`
    });
  }
});

module.exports = router;
