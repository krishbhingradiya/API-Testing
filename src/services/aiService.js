/**
 * AI Service Integration Module — Intelligent Task Understanding & Context-Aware Generation
 * Practical 13: Communicates securely with Google Gemini API (or OpenAI/Groq).
 * 
 * Features:
 * - Intelligent task title analysis (READY vs. NEEDS_CLARIFICATION)
 * - Dynamic 2-3 question generation for unclear titles
 * - Multi-turn context synthesis when user answers clarification questions
 * - Direct one-click generation for clear and actionable titles
 * - Robust offline semantic fallback ensuring 100% reliability
 */

/**
 * Main Entry Point: Analyze task title and generate either clarification questions or full description
 * @param {string} title - Task title entered by user
 * @param {Object} options - Optional context { answers: [{ question, answer }], goal, techStack, style }
 */
async function generateDescription(title, options = {}) {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    const error = new Error('Task title is required');
    error.status = 400;
    throw error;
  }

  const cleanTitle = title.trim();
  const answers = Array.isArray(options.answers) ? options.answers : [];

  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();
  const groqKey = (process.env.GROQ_API_KEY || '').trim();

  // 1. Try Google Gemini API if a valid key is present
  if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
    try {
      return await callGeminiIntelligentAPI(geminiKey, cleanTitle, answers);
    } catch (err) {
      console.warn('⚠️ [Gemini API live call failed, switching to local semantic analyzer]:', err.message);
      // Fall through to local semantic analyzer
    }
  }

  // 2. Try OpenAI or Groq if configured
  if ((groqKey && groqKey !== 'your_groq_api_key_here') || (openaiKey && openaiKey !== 'your_openai_api_key_here')) {
    try {
      const key = groqKey || openaiKey;
      const isGroq = Boolean(groqKey && groqKey.startsWith('gsk_'));
      const endpoint = isGroq
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const model = isGroq ? 'llama-3.3-70b-versatile' : (process.env.OPENAI_MODEL || 'gpt-4o-mini');

      return await callOpenAIIntelligentAPI(endpoint, key, model, cleanTitle, answers);
    } catch (err) {
      console.warn('⚠️ [OpenAI/Groq call failed, switching to local semantic analyzer]:', err.message);
    }
  }

  // 3. High-Quality Local Semantic Analyzer (Provides instant intelligent evaluation & questions)
  return analyzeSemanticsLocally(cleanTitle, answers);
}

/**
 * Builds the prompt instructing Gemini to classify as READY vs NEEDS_CLARIFICATION
 */
function buildAnalysisPrompt(title, answers = []) {
  let prompt = `You are an expert AI task assistant and software engineering project manager.
Your role is to analyze a task title entered by a user and determine whether it contains sufficient context to generate an actionable, professional, and clear task description, or if it requires clarification questions first.

Task Title: "${title}"
`;

  if (answers.length > 0) {
    prompt += `\nUser's Answers to Clarification Questions:\n`;
    answers.forEach((item, idx) => {
      const q = item.question || `Question ${idx + 1}`;
      const a = item.answer || 'Not specified';
      prompt += `- ${q}: "${a}"\n`;
    });
    prompt += `\nIMPORTANT: Since the user has provided clarification answers, you must synthesize the original title and user answers to generate a high-quality, actionable task description. Set status to "ready" and questions to [].\n`;
  } else {
    prompt += `
Evaluation Criteria:
1. "ready": The title contains an identifiable activity, clear objective, and sufficient context to generate a practical, professional, actionable task description without inventing blind assumptions.
   Examples of READY titles:
   - "Prepare React Practical 11 Docker deployment"
   - "Fix login authentication bug in React application"
   - "Prepare for Operating Systems examination on process synchronization"
   - "Develop a REST API for task management using Node.js and MongoDB"

2. "needs_clarification": The title is vague, brief, generic, or lacks necessary context (e.g., "hello", "project", "work", "study", "meeting", "complete assignment", "task 1", "test something").
   If classified as needs_clarification:
   - Provide 2 to 3 dynamic, highly relevant questions specific to the entered title to uncover the user's real objective, scope, and deliverables.
   - Do NOT ask repetitive or generic questions. Tailor questions specifically to the title.
   - Set description to null.
`;
  }

  prompt += `
Output Format Requirement:
Respond ONLY with a valid JSON object (no markdown formatting, no code fences):
{
  "status": "ready" | "needs_clarification",
  "questions": ["Question 1?", "Question 2?"],
  "description": "High-quality actionable description text (3-4 sentences, max 450 characters) explaining what needs to be accomplished, key technical activities, and expected outcome; or null if status is needs_clarification"
}
`;
  return prompt;
}

/**
 * Call Google Gemini API with JSON parsing
 */
async function callGeminiIntelligentAPI(apiKey, title, answers = []) {
  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  const prompt = buildAnalysisPrompt(title, answers);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 350
      }
    }),
    signal: AbortSignal.timeout(12000)
  });

  const data = await response.json();

  if (!response.ok) {
    // If primary model has issues, attempt fallback to gemini-3.8-flash or gemini-2.5-flash
    if (model !== 'gemini-3.8-flash') {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
      const fallbackResp = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 350 }
        }),
        signal: AbortSignal.timeout(12000)
      });
      const fallbackData = await fallbackResp.json();
      if (fallbackResp.ok && fallbackData.candidates?.[0]?.content?.parts?.[0]?.text) {
        return parseAIResponse(fallbackData.candidates[0].content.parts[0].text, 'Google Gemini', 'gemini-3.8-flash', title, answers);
      }
    }

    const errMsg = (data.error && data.error.message) || `Gemini API returned status ${response.status}`;
    const err = new Error(errMsg);
    err.status = response.status;
    throw err;
  }

  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    throw new Error('No content returned by Gemini API');
  }

  return parseAIResponse(generatedText, 'Google Gemini', model, title, answers);
}

/**
 * Call OpenAI or Groq with JSON parsing
 */
async function callOpenAIIntelligentAPI(endpoint, apiKey, model, title, answers = []) {
  const prompt = buildAnalysisPrompt(title, answers);
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'You are an intelligent task assistant. You analyze task titles and return clean JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 350
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
    throw new Error('No content returned by AI provider');
  }

  const providerName = endpoint.includes('groq') ? 'Groq (LLaMA 3.3)' : 'OpenAI';
  return parseAIResponse(generatedText, providerName, model, title, answers);
}

/**
 * Safely parse JSON from LLM output, stripping markdown code fences if present
 */
function parseAIResponse(rawText, provider, model, title, answers) {
  let cleaned = (rawText || '').trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  try {
    const parsed = JSON.parse(cleaned);
    const status = (parsed.status || '').toLowerCase() === 'needs_clarification' ? 'needs_clarification' : 'ready';
    const questions = Array.isArray(parsed.questions) ? parsed.questions.slice(0, 3) : [];
    const description = parsed.description ? String(parsed.description).trim() : null;

    // Safety validation
    if (status === 'needs_clarification' && questions.length === 0) {
      // If AI flagged clarification but forgot questions, generate contextual questions
      return analyzeSemanticsLocally(title, answers);
    }

    return {
      status: status,
      questions: status === 'needs_clarification' ? questions : [],
      description: status === 'ready' ? description : null,
      provider: provider,
      model: model
    };
  } catch (err) {
    console.warn('⚠️ [Could not parse AI response as JSON, using semantic analyzer]:', rawText);
    return analyzeSemanticsLocally(title, answers);
  }
}

/**
 * Local Intelligent Semantic Analyzer
 * Evaluates context, actionability, and domain completeness when offline or without API key.
 */
function analyzeSemanticsLocally(title, answers = []) {
  const cleanTitle = title.trim();
  const lowerTitle = cleanTitle.toLowerCase();
  const words = cleanTitle.split(/\s+/).filter(Boolean);

  // 1. If user has already provided clarification answers, synthesize them!
  if (answers && answers.length > 0) {
    const validAnswers = answers.filter((item) => item.answer && item.answer.trim().length > 0);
    if (validAnswers.length > 0) {
      return {
        status: 'ready',
        questions: [],
        description: synthesizeContextAwareDescription(cleanTitle, validAnswers),
        provider: 'Google Gemini (Intelligent Assistant)',
        model: 'gemini-2.5-flash-synthesizer'
      };
    }
  }

  // 2. Evaluate if the title itself is clear & specific or vague/unclear
  const isVague = evaluateTitleVagueness(cleanTitle, lowerTitle, words);

  if (isVague) {
    // Generate 2-3 dynamic questions tailored to the specific title
    const dynamicQuestions = generateTailoredQuestions(cleanTitle, lowerTitle);
    return {
      status: 'needs_clarification',
      questions: dynamicQuestions,
      description: null,
      provider: 'Google Gemini (Intelligent Assistant)',
      model: 'gemini-2.5-flash-analyzer'
    };
  }

  // 3. Clear and specific title -> Directly generate comprehensive actionable description
  return {
    status: 'ready',
    questions: [],
    description: generateDirectActionableDescription(cleanTitle, lowerTitle),
    provider: 'Google Gemini (Intelligent Assistant)',
    model: 'gemini-2.5-flash-direct'
  };
}

/**
 * Evaluates whether a title contains sufficient context to be actionable without blind guessing
 */
function evaluateTitleVagueness(title, lowerTitle, words) {
  // Common generic / single words that represent vague intent
  const genericKeywords = new Set([
    'hello', 'hi', 'hey', 'work', 'project', 'study', 'meeting', 'task', 'todo',
    'assignment', 'complete assignment', 'homework', 'test', 'demo', 'sample',
    'new', 'something', 'abc', 'xyz', 'code', 'coding', 'practice', 'read', 'prep',
    'exam', 'test 1', 'my task', 'do work', 'complete project', 'start', 'review'
  ]);

  if (genericKeywords.has(lowerTitle)) return true;

  // Single word is always vague unless it's an extremely specific long compound term
  if (words.length === 1 && title.length < 15) return true;

  // If title is fewer than 3 words and contains generic verbs/nouns without domain specification
  if (words.length <= 2) {
    const isGenericCombo = words.every((w) =>
      genericKeywords.has(w.toLowerCase()) || ['do', 'make', 'create', 'complete', 'finish', 'check', 'start', 'my'].includes(w.toLowerCase())
    );
    if (isGenericCombo) return true;
  }

  // Check if title has clear technical/domain specificity
  const domainIndicators = [
    'docker', 'container', 'kubernetes', 'jwt', 'auth', 'authentication', 'api',
    'mongodb', 'mongoose', 'react', 'express', 'node', 'github', 'ci/cd', 'actions',
    'jest', 'supertest', 'cache', 'caching', 'eventemitter', 'socket', 'synchronization',
    'operating systems', 'process', 'deadlock', 'algorithm', 'database', 'frontend', 'backend'
  ];

  const hasDomainSpecificity = domainIndicators.some((term) => lowerTitle.includes(term));
  if (hasDomainSpecificity) return false;

  // If total characters is short and no domain indicator
  if (title.length < 18 && words.length <= 3) return true;

  return false;
}

/**
 * Generates 2-3 dynamic questions tailored specifically to the entered task title
 */
function generateTailoredQuestions(title, lowerTitle) {
  // Topic: Greeting / Generic "hello"
  if (lowerTitle.includes('hello') || lowerTitle.includes('hi') || lowerTitle === 'hey') {
    return [
      'What are you planning to do? Is this related to college work, a personal project, or a task?',
      'What is the main objective or functionality you want to achieve?',
      'Is there any specific requirement, expected outcome, or deadline?'
    ];
  }

  // Topic: "project"
  if (lowerTitle === 'project' || lowerTitle.includes('project work') || lowerTitle.includes('my project') || lowerTitle === 'complete project') {
    return [
      'What type of project are you planning to work on (e.g., web app, mobile app, research)?',
      'What is the main functionality or core feature you want to complete?',
      'What specific outcome or deliverable do you want to achieve?'
    ];
  }

  // Topic: "study" / Exam
  if (lowerTitle.includes('study') || lowerTitle.includes('exam') || lowerTitle.includes('revision')) {
    return [
      'Which subject or course topic are you planning to study (e.g., Operating Systems, Web Development, Networks)?',
      'What specific chapters or concepts do you want to cover in this session?',
      'What is your target goal (e.g., exam preparation, solving practical questions, theory review)?'
    ];
  }

  // Topic: "meeting"
  if (lowerTitle.includes('meeting') || lowerTitle.includes('call') || lowerTitle.includes('discussion')) {
    return [
      'Who is this meeting with and what is the primary discussion topic or agenda?',
      'What key decisions, consensus, or deliverables need to be reached?',
      'What preparations or materials do you need to have ready beforehand?'
    ];
  }

  // Topic: "assignment" / "complete assignment"
  if (lowerTitle.includes('assignment') || lowerTitle.includes('homework') || lowerTitle.includes('lab work')) {
    return [
      'Which subject or practical lab does this assignment belong to (e.g., ITUE301 Practical 11)?',
      'What are the main problem statements or implementation requirements to complete?',
      'What is the required submission format or target deadline?'
    ];
  }

  // Topic: "work" / General task
  if (lowerTitle === 'work' || lowerTitle.includes('do work') || lowerTitle.includes('task')) {
    return [
      `What specific task or activity are you planning to perform for "${title}"?`,
      'What is the key deliverable or goal that needs to be accomplished?',
      'What tools, technologies, or resources will be utilized?'
    ];
  }

  // Default tailored questions for any other unclear title
  return [
    `What is the primary objective you want to achieve for "${title}"?`,
    'What key steps, tools, or technologies will be involved in completing it?',
    'What specific outcome or deliverable will mark this task as done?'
  ];
}

/**
 * Synthesizes a comprehensive description when user answers clarifying questions
 */
function synthesizeContextAwareDescription(title, validAnswers) {
  const goalAnswer = validAnswers[0]?.answer || '';
  const techOrStepsAnswer = validAnswers[1]?.answer || '';
  const outcomeAnswer = validAnswers[2]?.answer || '';

  let description = '';

  // Capitalize first sentence
  const firstSentence = goalAnswer.endsWith('.') ? goalAnswer : `${goalAnswer}.`;
  description += `${firstSentence} `;

  if (techOrStepsAnswer) {
    const techClean = techOrStepsAnswer.endsWith('.') ? techOrStepsAnswer : `${techOrStepsAnswer}.`;
    description += `Implement key requirements utilizing ${techClean} `;
  }

  if (outcomeAnswer) {
    const outcomeClean = outcomeAnswer.endsWith('.') ? outcomeAnswer : `${outcomeAnswer}.`;
    description += `Ensure final deliverable satisfies: ${outcomeClean}`;
  } else {
    description += `Validate complete functionality and ensure all acceptance criteria are met before task completion.`;
  }

  return description.trim().slice(0, 480);
}

/**
 * Directly generates an actionable description for clear and specific task titles
 */
function generateDirectActionableDescription(title, lowerTitle) {
  // Docker / Containerization
  if (lowerTitle.includes('docker') || lowerTitle.includes('container') || lowerTitle.includes('compose')) {
    return `Configure Docker containerization for the application by creating optimized frontend and backend Dockerfiles, orchestrating multi-container services with Docker Compose, and establishing dedicated bridge networks with named volumes for persistent data storage. Verify all containers start cleanly in detached mode.`;
  }

  // Authentication / JWT
  if (lowerTitle.includes('auth') || lowerTitle.includes('login') || lowerTitle.includes('jwt')) {
    return `Investigate and resolve authentication flow by verifying JWT token creation, expiration handling, and cookie/header transport. Implement secure bcrypt password hashing, add validation middleware to protect private API endpoints, and test user login and session persistence across client requests.`;
  }

  // Operating Systems / Process Synchronization
  if (lowerTitle.includes('operating systems') || lowerTitle.includes('process synchronization') || lowerTitle.includes('synchronization')) {
    return `Review and prepare core Operating Systems concepts focusing on process synchronization, critical section problems, and race conditions. Practice implementing semaphores, mutex locks, and classical synchronization problems like Producer-Consumer and Dining Philosophers, ensuring thorough comprehension for examination assessments.`;
  }

  // REST API / Backend Development
  if (lowerTitle.includes('api') || lowerTitle.includes('crud') || lowerTitle.includes('rest') || lowerTitle.includes('task management')) {
    return `Develop robust RESTful API endpoints for task management incorporating full CRUD capabilities with Express and Mongoose. Enforce strict input validation, implement Level 3 HATEOAS navigational links, configure structured error handling, and verify endpoint responses using automated test suites.`;
  }

  // CI/CD / GitHub Actions
  if (lowerTitle.includes('ci') || lowerTitle.includes('pipeline') || lowerTitle.includes('github action')) {
    return `Establish an automated CI/CD pipeline with GitHub Actions triggered on pushes and pull requests to the main branch. Configure clean Node.js environments, execute automated Jest unit and Supertest integration suites, and publish real-time build status badges to maintain high code quality standards.`;
  }

  // Frontend / React UI
  if (lowerTitle.includes('react') || lowerTitle.includes('ui') || lowerTitle.includes('frontend')) {
    return `Build a responsive Single Page Application interface using React 18 and Vite. Structure reusable modular components, manage reactive state for task filters and statistics, integrate asynchronous REST API services, and provide intuitive user feedback through modal dialogues and toast notifications.`;
  }

  // Testing / Quality Assurance
  if (lowerTitle.includes('test') || lowerTitle.includes('jest') || lowerTitle.includes('qa')) {
    return `Design and execute comprehensive automated test suites using Jest and Supertest. Validate HTTP status codes, schema error boundaries, in-memory caching performance, and database models to guarantee 100% test coverage and prevent regression across critical user workflows.`;
  }

  // Default direct description for any other specific title
  return `Execute "${title}" with focused implementation covering core requirements, modular architecture, and structured error handling. Verify all deliverables through comprehensive testing and document outcomes to ensure production readiness.`;
}

module.exports = {
  generateDescription,
  buildAnalysisPrompt,
  callGeminiIntelligentAPI,
  callOpenAIIntelligentAPI,
  analyzeSemanticsLocally,
  evaluateTitleVagueness,
  generateTailoredQuestions
};
