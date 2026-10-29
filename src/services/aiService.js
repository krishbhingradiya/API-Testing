/**
 * AI Service Integration Module
 * Practical 13: Communicates securely with LLM APIs (Gemini or OpenAI/Groq).
 * Validates credentials, sets generation parameters, and handles timeouts gracefully.
 */

async function generateDescription(title) {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    const error = new Error('Task title is required');
    error.status = 400;
    throw error;
  }

  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();
  const groqKey = (process.env.GROQ_API_KEY || '').trim();

  // If no API key is configured in backend .env
  if (!geminiKey && !openaiKey && !groqKey) {
    const error = new Error('AI suggestions are temporarily unavailable (API key not configured). Please enter the task description manually.');
    error.code = 'NO_API_KEY';
    error.status = 503;
    throw error;
  }

  const prompt = `You are an expert technical project manager. Write a concise, actionable, and professional task description (2-3 sentences) for a task with the title: "${title.trim()}". Be specific about objectives, deliverables, and requirements. Output only the plain text description without quotes, formatting, or prefixes.`;

  // 1. Try Gemini API if GEMINI_API_KEY is present
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    return await callGeminiAPI(geminiKey, prompt);
  }

  // 2. Try Groq or OpenAI API if configured
  if ((groqKey && groqKey !== 'your_groq_api_key_here') || (openaiKey && openaiKey !== 'your_openai_api_key_here')) {
    const key = groqKey || openaiKey;
    const isGroq = Boolean(groqKey && groqKey.startsWith('gsk_'));
    const endpoint = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';
    const model = isGroq ? 'llama-3.3-70b-versatile' : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

    return await callOpenAICompatibleAPI(endpoint, key, model, prompt);
  }

  // Fallback if keys are only placeholder templates
  const error = new Error('AI suggestions are temporarily unavailable (API key not configured). Please enter the task description manually.');
  error.code = 'NO_API_KEY';
  error.status = 503;
  throw error;
}

/**
 * Call Google Gemini API
 */
async function callGeminiAPI(apiKey, prompt) {
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250
      }
    }),
    signal: AbortSignal.timeout(12000)
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = (data.error && data.error.message) || `Gemini API returned status ${response.status}`;
    const err = new Error(errMsg);
    err.status = response.status;
    throw err;
  }

  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    throw new Error('No description returned by Gemini API');
  }

  return {
    description: generatedText.trim(),
    provider: 'Google Gemini',
    model: model
  };
}

/**
 * Call OpenAI or Groq API (OpenAI-compatible chat completions)
 */
async function callOpenAICompatibleAPI(endpoint, apiKey, model, prompt) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are an expert technical project manager assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 250
    }),
    signal: AbortSignal.timeout(12000)
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = (data.error && data.error.message) || `AI API returned status ${response.status}`;
    const err = new Error(errMsg);
    err.status = response.status;
    throw err;
  }

  const generatedText = data.choices?.[0]?.message?.content;
  if (!generatedText) {
    throw new Error('No description returned by AI provider');
  }

  return {
    description: generatedText.trim(),
    provider: endpoint.includes('groq') ? 'Groq (LLaMA 3.3)' : 'OpenAI',
    model: model
  };
}

module.exports = {
  generateDescription,
  callGeminiAPI,
  callOpenAICompatibleAPI
};
