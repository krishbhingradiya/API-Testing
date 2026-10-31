# TaskFlow — Full-Stack Task Management Platform

[![CI Pipeline](https://github.com/krishbhingradiya/API-Testing/actions/workflows/ci.yml/badge.svg)](https://github.com/krishbhingradiya/API-Testing/actions/workflows/ci.yml)
[![Practicals Completed](https://img.shields.io/badge/Practicals-1%20to%2013%20Complete%20(100%25)-success?style=flat-square&logo=checkmarx)](https://github.com/krishbhingradiya/API-Testing)
[![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Container-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## 👨‍🎓 Student & Academic Information

| Field | Details |
|---|---|
| **Student Name** | **Krish Bhingradiya** |
| **Student ID** | **24IT004** |
| **Programme** | B.Tech Information Technology (Semester 5) |
| **Subject** | **Advanced Web Development Frameworks (ITUE301)** |
| **Institution** | Charotar University of Science and Technology (CHARUSAT) |
| **Faculty** | Faculty of Technology and Engineering (CSPIT / FTE) |
| **GitHub Repository** | [https://github.com/krishbhingradiya/API-Testing](https://github.com/krishbhingradiya/API-Testing) |
| **Practicals Status** | **Practical 1 to 13 — 100% Implemented, Tested & Verified** ✅ |

---

## ⚡ Quick Start with Docker (3 Essential Commands)

You can run the entire multi-container full-stack application (Frontend + Backend + Database) in one single step without installing Node.js or MongoDB locally.

```bash
# -------------------------------------------------------------
# 1. START the entire application (builds & runs all containers)
# -------------------------------------------------------------
docker compose up --build -d

# -------------------------------------------------------------
# 2. VIEW live container logs (Press Ctrl+C to exit)
# -------------------------------------------------------------
docker compose logs -f

# -------------------------------------------------------------
# 3. STOP the application and free all resources
# -------------------------------------------------------------
docker compose down
```

> **Alternative npm shortcuts:**  
> You can also run `npm run docker:up`, `npm run docker:logs`, and `npm run docker:down` from the project root.

---

### 🌐 Access Running Services in Your Browser

Once you run `docker compose up --build -d`, open your browser to interact with the system:

| Service | Browser URL | Description |
|---|---|---|
| 🖥️ **Frontend Web App** | **[http://localhost:5173](http://localhost:5173)** | Complete React 18 SPA (Task list, Add/Edit/Delete, Filter, AI Assistant) |
| ⚙️ **Backend REST API** | **[http://localhost:5001/tasks](http://localhost:5001/tasks)** | Express RESTful API with full CRUD and HATEOAS links |
| 📊 **Cache Debug Metrics** | **[http://localhost:5001/debug/cache](http://localhost:5001/debug/cache)** | Live hit/miss counts, hit rate percentage, and active cache keys |
| 🍃 **MongoDB Database** | **`localhost:27017`** | MongoDB database container with persistent volume storage |

---

## 📌 Practical 1 to 13 Completion Summary

All 13 practical exercises prescribed in the **ITUE301** syllabus have been successfully implemented, rigorously tested, and integrated into this single, production-ready repository.

| PR # | Practical Title & Core Topic | Key Implementation / Highlights | Status |
|:---:|---|---|:---:|
| **PR 1** | **Node.js Setup & Modular Architecture** | Project initialization, CommonJS modules, dependency management, `.gitignore` | ✅ **Complete** |
| **PR 2** | **HTTP Server & Request Handling** | Core HTTP request processing, JSON streaming, headers, and status code standards | ✅ **Complete** |
| **PR 3** | **Express.js Framework & Middleware** | Custom logger, JSON body parser, Content-Type enforcement, 404 handler | ✅ **Complete** |
| **PR 4** | **RESTful API & CRUD Architecture** | Complete CRUD endpoints (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) with strict REST standards | ✅ **Complete** |
| **PR 5** | **MongoDB & Mongoose ODM Integration** | Task schema, strict data types, timestamps, enums, database connection pooling | ✅ **Complete** |
| **PR 6** | **HATEOAS (REST Level 3 Maturity)** | Self-descriptive `_links` object on every task resource and collection for hypermedia navigation | ✅ **Complete** |
| **PR 7** | **Validation & Centralized Error Handling** | 24-character hex ObjectId validator, required field checks, custom error response schema | ✅ **Complete** |
| **PR 8** | **React Single Page Application (SPA)** | React 18 + Vite, modern responsive UI, task filtering by status, modal dialogs, toast feedback | ✅ **Complete** |
| **PR 9** | **In-Memory Caching & Optimization** | `node-cache` integration (60s TTL), automated cache invalidation on mutations, `/debug/cache` | ✅ **Complete** |
| **PR 10** | **Event-Driven Architecture (`EventEmitter`)** | Decoupled background notification listeners, non-blocking asynchronous timers via libuv | ✅ **Complete** |
| **PR 11** | **Containerization with Docker Compose** | Multi-container setup (`frontend`, `backend`, `mongodb`), multi-stage builds, named volumes | ✅ **Complete** |
| **PR 12** | **CI/CD Pipeline with GitHub Actions** | Automated CI workflow on push/PR, Jest unit/integration tests, Supertest, status badge | ✅ **Complete** |
| **PR 13** | **AI API Integration (Generative Assistant)** | Multi-provider AI task generator (Gemini / OpenAI / Groq), IP rate limiting, smart UI modal | ✅ **Complete** |

---

## 🏗️ Architecture & Technology Stack

```
                              ┌─────────────────────────────────────────┐
                              │            Client Browser               │
                              │      http://localhost:5173 (React 18)   │
                              └───────────────────┬─────────────────────┘
                                                  │
                                                  │ REST / JSON (HTTP)
                                                  ▼
                              ┌─────────────────────────────────────────┐
                              │          Express.js Backend             │
                              │        http://localhost:5001            │
                              ├─────────────────────────────────────────┤
                              │ • Custom Middleware (Logger, Validator) │
                              │ • REST API Routes (/tasks, /api/ai)     │
                              │ • Level 3 HATEOAS Link Generator        │
                              │ • Event-Driven System (EventEmitter)    │
                              └───────┬─────────────────────────┬───────┘
                                      │                         │
                     In-Memory Cache  │                         │ AI REST API
                    (node-cache, TTL) │                         │ (Gemini / Groq)
                                      ▼                         ▼
                        ┌───────────────────┐     ┌───────────────────────┐
                        │   node-cache RAM  │     │ Google Gemini AI SDK  │
                        │ (Fast HIT ~2-5ms) │     │ (Smart Descriptions)  │
                        └─────────┬─────────┘     └───────────────────────┘
                                  │ Cache MISS
                                  ▼
                        ┌───────────────────┐
                        │  MongoDB Database │
                        │  (Port 27017)     │
                        │  Persistent Vol   │
                        └───────────────────┘
```

### Core Technologies

- **Frontend:** React 18, Vite, Lucide Icons, Modern CSS3 Flexbox/Grid
- **Backend:** Node.js 20 LTS, Express.js 4.x
- **Database:** MongoDB 7.0, Mongoose 8.x ODM
- **Performance:** `node-cache` (In-memory caching with TTL and write-invalidation)
- **Asynchronous Events:** Node.js native `EventEmitter`
- **AI Integration:** Google Gemini API (`@google/genai`), Groq API, OpenAI compatibility
- **DevOps & Containers:** Docker, Docker Compose, Multi-stage Dockerfiles
- **Testing & CI/CD:** Jest, Supertest, GitHub Actions CI Pipeline

---

## 📚 Detailed Practical Breakdown (PR 1 to PR 13)

### 🔹 Practical 1: Node.js Setup & Modular Architecture
- Initialized Node.js project environment with `package.json`.
- Configured modular CommonJS code structure separating routes, controllers, middleware, and models.
- Set up `.gitignore` and `.env.example` to protect secrets and avoid checking in `node_modules`.

### 🔹 Practical 2: Core HTTP Server & Request Handling
- Explored native HTTP request lifecycle, headers, and status codes.
- Handled request methods, route parsing, and JSON stream consumption.

### 🔹 Practical 3: Express.js Framework & Middleware Pipeline
- Constructed an extensible middleware pipeline:
  - **`logger.js`**: Intercepts requests, logs HTTP method, path, status, and duration in milliseconds.
  - **`contentType.js`**: Enforces strict `application/json` headers on incoming mutation payloads.
  - **`notFound.js`**: Catches undefined routes and returns standardized 404 responses.
  - **`errorHandler.js`**: Centralized catch-all handler preventing unhandled process crashes.

### 🔹 Practical 4: RESTful API Design & Full CRUD
- Designed strict RESTful routes following HTTP semantics:
  - `GET /tasks` — Retrieve list of tasks
  - `POST /tasks` — Create a new task (201 Created)
  - `GET /tasks/:id` — Retrieve task by ID (200 OK / 404 Not Found)
  - `PUT /tasks/:id` — Complete task replacement
  - `PATCH /tasks/:id` — Partial task update
  - `DELETE /tasks/:id` — Delete task (200 OK with deleted entity)

### 🔹 Practical 5: MongoDB & Mongoose ODM Integration
- Modeled the `Task` schema in [`src/models/Task.js`](src/models/Task.js) with:
  - `title`: String, required, trimmed, minlength 3, maxlength 100.
  - `description`: String, required, trimmed, maxlength 500.
  - `status`: String enum (`pending`, `in-progress`, `completed`), default `pending`.
  - `priority`: String enum (`low`, `medium`, `high`), default `medium`.
  - `dueDate`: Date, optional deadline.
  - `timestamps`: Automatic `createdAt` and `updatedAt`.
- Implemented robust database connection with automatic reconnection logic.

### 🔹 Practical 6: HATEOAS (Richardson Maturity Model Level 3)
- Implemented hypermedia-driven REST API in [`src/utils/taskLinks.js`](src/utils/taskLinks.js).
- Each returned task contains a dynamic `_links` object providing next possible actions:
  ```json
  "_links": {
    "self": { "href": "/tasks/66b1a234c567890123456789", "method": "GET" },
    "update": { "href": "/tasks/66b1a234c567890123456789", "method": "PUT" },
    "delete": { "href": "/tasks/66b1a234c567890123456789", "method": "DELETE" },
    "collection": { "href": "/tasks", "method": "GET" }
  }
  ```

### 🔹 Practical 7: Input Validation & Centralized Error Handling
- Built [`src/middleware/idValidator.js`](src/middleware/idValidator.js) to validate 24-character hexadecimal MongoDB ObjectIds before database execution, preventing CastError crashes.
- Validates request payloads and returns clean, uniform error JSON:
  ```json
  {
    "success": false,
    "error": "Validation Error",
    "message": "Title and description are required fields"
  }
  ```

### 🔹 Practical 8: React Single Page Application (SPA)
- Created a modern, responsive frontend using **React 18** and **Vite** located in [`frontend/`](frontend/).
- Features:
  - Live task dashboard with real-time statistics (Total, Pending, In-Progress, Completed).
  - Filter tasks by status tabs and search tasks dynamically.
  - Interactive Modal for creating and editing tasks.
  - Beautiful toast notification system for instant feedback on user actions.

### 🔹 Practical 9: In-Memory Caching & Performance Optimization
- Integrated `node-cache` in [`src/utils/cache.js`](src/utils/cache.js) to store frequently read task payloads in RAM.
- **60-second TTL** (Time-To-Live) with automatic garbage collection.
- **Strict Invalidation:** Any mutation (`POST`, `PUT`, `PATCH`, `DELETE`) immediately purges `all_tasks` and `task_<id>` from the cache to prevent stale data.
- Built **`GET /debug/cache`** endpoint displaying live cache hits, misses, hit rate percentage, and active keys.
- **Result:** Read response time drops from ~35ms to **< 2ms** on cache HIT (~94% latency reduction).

### 🔹 Practical 10: Event-Driven Asynchronous Processing
- Designed an event-driven notification architecture using Node's native `EventEmitter` in [`src/events/`](src/events/).
- Decouples HTTP request/response cycle from heavy background operations:
  1. User creates task via `POST /tasks`.
  2. Database saves task and returns **201 Created immediately (~10ms)** to the client.
  3. Shared emitter emits `task-created` event.
  4. Registered listener processes background notification asynchronously via libuv timer (`setTimeout` 2000ms simulation) without delaying the user.
- Emits `task-deleted` on task removal and handles an `error` event channel safely.

### 🔹 Practical 11: Containerization with Docker & Docker Compose
- Created production-ready container configurations:
  - [`Dockerfile`](Dockerfile): Multi-stage, lightweight Node 20 Alpine backend container.
  - [`frontend/Dockerfile`](frontend/Dockerfile): Multi-stage build compiling React assets and serving with Vite preview.
  - [`docker-compose.yml`](docker-compose.yml): Orchestrates `frontend` (port 5173), `backend` (host port 5001), and `mongodb` (port 27017) over a dedicated bridge network `task-network`.
  - Named volume `task-mongo-data` guarantees data persistence even when containers are restarted or rebuilt.

### 🔹 Practical 12: Continuous Integration with GitHub Actions
- Designed automated CI workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
- Automatically triggers on every `push` and `pull_request` to the `main` branch:
  1. Checks out repository code.
  2. Configures Node.js 20 LTS environment with npm caching.
  3. Installs dependencies cleanly.
  4. Executes automated test suite using **Jest** and **Supertest** (`npm test`).
- CI status badge displayed at the top of the repository dynamically reflects build health.

### 🔹 Practical 13: Intelligent AI API Integration (Smart Task Assistant)
- **Model Integration:** Integrated Google's pre-trained **Gemini AI** (`gemini-3.5-flash-lite` / `gemini-3.8-flash`) via `GEMINI_API_KEY` with resilient multi-tier fallback in [`src/services/aiService.js`](src/services/aiService.js).
- **Intelligent Dual-Path Analysis:**
  - **Path A (Unclear/Brief Titles):** Analyzes titles like `"hello"`, `"project"`, or `"1234"` and dynamically asks 2–3 contextual clarification questions.
  - **Path B (Actionable Titles):** Instantly generates comprehensive, professional, structured task descriptions for clear titles.
  - **Multi-Turn Context Synthesis:** User answers to clarification questions are synthesized into an actionable task description with expected outcomes and technical scope.
- **Security & Rate Limiting:** Cooldown-based rate limiting in [`src/middleware/aiRateLimiter.js`](src/middleware/aiRateLimiter.js) prevents quota exhaustion while exempting clarification answer turns.
- **Frontend Integration:** Full interactive UI in both [`TaskModal.jsx`](frontend/src/components/TaskModal.jsx) and [`TaskForm.jsx`](frontend/src/components/TaskForm.jsx) with inline question forms, answer inputs, and instant description insertion.
- **Automated Verification:** Comprehensive test suite in [`tests/ai.test.js`](tests/ai.test.js) verifying classification, question generation, and synthesis.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description | Cache Status | Auth / Rate Limit |
|:---:|---|---|:---:|:---:|
| `GET` | `/tasks` | Retrieve all tasks (with HATEOAS links) | ✅ Cached (TTL 60s) | None |
| `POST` | `/tasks` | Create a new task (emits `task-created`) | 🔄 Purges Cache | Payload validation |
| `GET` | `/tasks/:id` | Retrieve single task by ObjectId | ✅ Cached (TTL 60s) | ObjectId validation |
| `PUT` | `/tasks/:id` | Full update of existing task | 🔄 Purges Cache | ObjectId + Payload validation |
| `PATCH` | `/tasks/:id` | Partial update (e.g., status, priority) | 🔄 Purges Cache | ObjectId validation |
| `DELETE` | `/tasks/:id` | Remove task (emits `task-deleted`) | 🔄 Purges Cache | ObjectId validation |
| `GET` | `/debug/cache` | View real-time cache performance & hit rate | ⚡ Live Metric | None |
| `POST` | `/debug/event-error` | Trigger test error event for listener testing | — | Debug only |
| `POST` | `/api/ai/generate-description` | Intelligent AI description & clarification | — | 🛡️ Cooldown Rate Limited |

---

## 🧪 Testing & Verification

The project includes two comprehensive test suites verifying all practical requirements:

### 1. Jest & Supertest Suite (CI/CD Pipeline)
Used in GitHub Actions automated CI testing:
```bash
npm test
```
*Runs in-memory tests covering route contracts, status codes, HATEOAS structures, cache stats, and AI generation endpoints.*

### 2. Comprehensive 45-Test Integration Suite
Validates all CRUD, validation rules, caching behavior, and event emissions against a running database:
```bash
npm run test:api
```
```text
============================================================
📊 Test Execution Summary:
   Total Tests Run: 45
   Passed: 45
   Failed: 0
   Success Rate: 100%
============================================================
```

---

## 💻 Alternative: Running Locally without Docker

If you prefer to run the project directly on your host machine without Docker:

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on port 27017

### Steps
```bash
# 1. Install root dependencies
npm install

# 2. Install frontend dependencies
npm --prefix frontend install

# 3. Create .env file (or use .env.example)
cp .env.example .env

# 4. Start backend and frontend simultaneously
npm run dev
```

- Backend server: `http://localhost:5001`
- Frontend UI: `http://localhost:5173`

---

## 📁 Project Directory Structure

```text
PR4/
├── .github/
│   └── workflows/
│       └── ci.yml               # Practical 12: GitHub Actions CI workflow
├── Dockerfile                   # Practical 11: Backend Docker container specification
├── docker-compose.yml           # Practical 11: Multi-container orchestration
├── server.js                    # Express entry point & middleware mounting
├── package.json                 # Project configuration & npm scripts
├── test-api.js                  # 45-test comprehensive integration test suite
├── .env.example                 # Environment variables template
│
├── src/
│   ├── models/
│   │   └── Task.js              # Practical 5: Mongoose Task Schema
│   ├── routes/
│   │   ├── taskRoutes.js        # Practical 4, 6, 9, 10: Task CRUD with HATEOAS, Cache & Events
│   │   ├── aiRoutes.js          # Practical 13: Generative AI endpoint
│   │   └── debugRoutes.js       # Practical 9 & 10: Cache stats & event testing
│   ├── middleware/
│   │   ├── logger.js            # Practical 3: HTTP request logger
│   │   ├── contentType.js       # Practical 3: JSON Content-Type validation
│   │   ├── idValidator.js       # Practical 7: MongoDB ObjectId validator
│   │   ├── errorHandler.js      # Practical 3 & 7: Centralized error handling
│   │   ├── notFound.js          # Practical 3: 404 handler
│   │   └── aiRateLimiter.js     # Practical 13: Rate limiter for AI API
│   ├── services/
│   │   └── aiService.js         # Practical 13: Multi-provider AI generation service
│   ├── utils/
│   │   ├── cache.js             # Practical 9: In-memory cache helper
│   │   └── taskLinks.js         # Practical 6: Level 3 HATEOAS link builder
│   └── events/
│       ├── events.js            # Practical 10: Shared EventEmitter instance
│       ├── listeners.js         # Practical 10: Background async notification listeners
│       └── index.js             # Practical 10: Event module barrel
│
├── frontend/                    # Practical 8: React 18 + Vite SPA
│   ├── Dockerfile               # Practical 11: Multi-stage Frontend container specification
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite dev server configuration & API proxy
│   └── src/
│       ├── App.jsx              # Main React container with filter & stats
│       ├── components/
│       │   ├── TaskList.jsx     # Task card grid & empty state
│       │   ├── TaskCard.jsx     # Individual task display with action buttons
│       │   ├── TaskForm.jsx     # Task creation/editing form
│       │   ├── TaskModal.jsx    # Modal wrapper with AI description button
│       │   └── Toast.jsx        # User feedback notification toast
│       └── services/
│           └── api.js           # Axios/Fetch API client communicating with backend
│
├── tests/
│   ├── tasks.test.js            # Practical 12: Jest unit/integration tests for CI
│   └── ai.test.js               # Practical 13: Jest tests for AI integration
│
└── docs/                        # Complete laboratory reports & evidence
    ├── practical-12/            # CI/CD report & execution evidence
    └── practical-13/            # AI API integration report & UI screenshots
```

---

## 🏆 Summary of Accomplishments

- **13 out of 13 Practicals Fully Completed**: Seamlessly synthesized from foundational Node.js concepts to advanced full-stack enterprise architecture.
- **Microservices & Cloud Native Ready**: Fully containerized with Docker Compose for one-click setup across any operating system.
- **Production-Grade Reliability**: In-memory caching, non-blocking libuv background events, comprehensive validation, automated CI pipeline, and rate-limited generative AI.
- **100% Automated Test Pass Rate**: Verified via Jest unit testing in GitHub Actions and a 45-case end-to-end integration test runner.

---

**Developed with precision by Krish Bhingradiya (24IT004)**  
*Charotar University of Science and Technology (CHARUSAT)*
