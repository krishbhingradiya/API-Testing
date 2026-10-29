# TaskFlow — Full-Stack Task Management Application

[![CI Pipeline](https://github.com/krishbhingradiya/API-Testing/actions/workflows/ci.yml/badge.svg)](https://github.com/krishbhingradiya/API-Testing/actions/workflows/ci.yml)

**Subject:** ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**Repository:** [krishbhingradiya/API-Testing](https://github.com/krishbhingradiya/API-Testing)  

---

# Practical 9 — In-Memory Caching and Query Optimization

---

## Objective

Implement server-side in-memory caching using `node-cache` and measure its impact on API response time, server load, and database query optimization.

---

## Technologies Used

- **Backend Runtime:** Node.js, Express.js
- **Database & ODM:** MongoDB, Mongoose
- **In-Memory Cache:** `node-cache` (Local process memory)
- **Frontend:** React 18, Vite
- **Testing & Verification:** Custom automated test suite (`test-api.js`), Postman

---

## Cache Configuration

- **Library:** `node-cache`
- **Default TTL (`stdTTL`):** `60` seconds (Data automatically expires from cache after 60 seconds)
- **Cleanup Period (`checkperiod`):** `120` seconds (Automatic garbage collection of expired keys)
- **Storage Location:** Server process RAM (In-Memory)

---

## Architecture & Data Flow

### 1. Read Operations (`GET /tasks` and `GET /tasks/:id`)

```text
Incoming GET Request
        │
        ▼
   Cache Check
        │
   ┌────┴───────────────────────────┐
   │                                │
[HIT]                             [MISS]
   │                                │
   ▼                                ▼
Return Data Immediately       Query MongoDB
from RAM (Fast ~1-5ms)              │
                                    ▼
                              Save Data in Cache (TTL = 60s)
                                    │
                                    ▼
                              Return Response to Client (~20-100ms)
```

### 2. Write Operations (`POST`, `PUT`, `PATCH`, `DELETE`)

```text
Incoming Write Request (POST / PUT / PATCH / DELETE)
        │
        ▼
Execute Mutation in MongoDB
        │
        ▼
Database Write Successful?
        ├── NO  ──> Return Error Response (Cache untouched)
        │
        └── YES ──> Invalidate Target Cache Keys
                        │
                        ▼
                    Return Success Response
```

---

## Cached Endpoints & Keys

| Endpoint | Method | Cache Key | Description |
|---|---|---|---|
| `/tasks` | `GET` | `all_tasks` | Caches the full task collection payload |
| `/tasks/:id` | `GET` | `task_<id>` | Caches individual task payload by ObjectId |
| `/debug/cache` | `GET` | *None (Dynamic)* | Returns cache metrics: hits, misses, hit rate, and active keys |

---

## Cache Invalidation Strategy (Preventing Stale Data)

To guarantee consistency between MongoDB and the cache, cache keys are purged immediately upon successful database write operations:

| Operation | Affected Cache Keys Purged | Rationale |
|---|---|---|
| **POST `/tasks`** | `all_tasks` | New task added; next `GET /tasks` must fetch the fresh task list from MongoDB. |
| **PUT `/tasks/:id`** | `all_tasks`, `task_<id>` | Task attributes updated; invalidates both collection list and specific task cache. |
| **PATCH `/tasks/:id`** | `all_tasks`, `task_<id>` | Partial update; invalidates both collection list and specific task cache. |
| **DELETE `/tasks/:id`** | `all_tasks`, `task_<id>` | Task removed; purges collection cache and ensures subsequent `GET /tasks/:id` returns `404 Not Found`. |

---

## Debug Endpoint (`GET /debug/cache`)

Provides real-time runtime statistics on caching performance:

```bash
GET http://localhost:5001/debug/cache
```

**Example JSON Response:**
```json
{
  "success": true,
  "hits": 14,
  "misses": 3,
  "totalRequests": 17,
  "hitRate": "82.35%",
  "activeKeys": [
    "all_tasks",
    "task_66b1a234c567890123456789"
  ],
  "ttlSeconds": 60
}
```

---

## Performance Testing (Postman Measurements)

Use Postman or Thunder Client to record actual response times for your lab report:

### Response Time Comparison Table

| Request # | Operation | Without Cache (MISS) | With Cache (HIT) |
| :---: | :--- | :--- | :--- |
| 1 | `GET /tasks` (Run 1) | `___ ms` | `___ ms` |
| 2 | `GET /tasks` (Run 2) | `___ ms` | `___ ms` |
| 3 | `GET /tasks` (Run 3) | `___ ms` | `___ ms` |

### Average Calculation:

- **Average Response Time Without Cache:**  
  `(___ + ___ + ___) / 3 = ___ ms`

- **Average Response Time With Cache:**  
  `(___ + ___ + ___) / 3 = ___ ms`

---

## Observations

1. **Latency Reduction:** On cache HIT, responses are served directly from Node.js process memory without network I/O to MongoDB, typically reducing response times by 70% to 90%.
2. **Database Offloading:** Repetitive read traffic does not generate database queries, freeing MongoDB connection pool threads for write operations.
3. **Data Consistency:** Immediate cache invalidation on `POST`, `PUT`, and `DELETE` guarantees that clients never receive outdated (stale) records.
4. **TTL Expiration:** Even without write operations, cached entries automatically expire after 60 seconds, ensuring periodic synchronization with the primary database.

---

## Practical 9 Testing Step-by-Step

Follow this exact test sequence in Postman or curl:

1. **Ensure MongoDB and Backend are running:**
   ```bash
   npm run dev
   # Server runs on http://localhost:5001
   ```
2. **Step 1 — First Request (Cache MISS):**
   - Send `GET http://localhost:5001/tasks`
   - Response time is higher (queries MongoDB).
   - Check `GET http://localhost:5001/debug/cache` -> `misses` increments by 1.
3. **Step 2 — Second Request (Cache HIT):**
   - Send `GET http://localhost:5001/tasks` again.
   - Response time drops significantly (served from memory).
   - Check `GET http://localhost:5001/debug/cache` -> `hits` increments by 1.
4. **Step 3 — Third Request (Cache HIT):**
   - Send `GET http://localhost:5001/tasks` once more.
   - Served from cache again.
5. **Step 4 — Cache Invalidation via POST:**
   - Send `POST http://localhost:5001/tasks` with JSON payload:
     ```json
     { "title": "Cache Test Task", "description": "Testing invalidation" }
     ```
   - On success (201 Created), `all_tasks` cache is automatically purged.
6. **Step 5 — Verify Fresh Data after Invalidation:**
   - Send `GET http://localhost:5001/tasks`.
   - Result is a **MISS** and newly created task appears in the response array.
7. **Step 6 — Test Single Task Caching (`GET /tasks/:id`):**
   - Send `GET http://localhost:5001/tasks/<id>` -> 1st call is **MISS**.
   - Send `GET http://localhost:5001/tasks/<id>` -> 2nd call is **HIT**.
8. **Step 7 — Test Update Invalidation (`PUT /tasks/:id`):**
   - Send `PUT http://localhost:5001/tasks/<id>` with updated fields.
   - Both `all_tasks` and `task_<id>` are invalidated.
   - Next `GET /tasks/<id>` fetches updated data (not stale data).
9. **Step 8 — Test Delete Invalidation (`DELETE /tasks/:id`):**
   - Send `DELETE http://localhost:5001/tasks/<id>`.
   - Next `GET /tasks/<id>` returns `404 Not Found`.
10. **Step 9 — Check Final Debug Metrics:**
    - Send `GET http://localhost:5001/debug/cache` to view total hits, misses, and hit rate percentage.

---

## Viva / Analysis Questions

### Q1: Why must the cache be invalidated on every write operation?
> **Answer:**  
> When a client performs a `POST`, `PUT`, or `DELETE` request, the persistent state in MongoDB changes. If the old cached response remains in memory, subsequent `GET` requests would continue serving outdated or deleted data (known as the *stale data problem*). Invalidating the cache after successful writes ensures the very next read queries MongoDB and populates the cache with fresh data.

### Q2: What is a reasonable TTL for a task management context?
> **Answer:**  
> A TTL of **60 seconds** is reasonable for this laboratory demonstration. In real-world applications, the optimal TTL depends on data update frequency:
> - **Shorter TTL (15-30s):** Provides higher data freshness but results in more database queries (lower cache hit rate).
> - **Longer TTL (5-10m):** Delivers greater performance and offloads the database, but risks serving stale data if an invalidation event fails or is missed.

### Q3: Why is `node-cache` not suitable for multi-server/multi-instance deployments?
> **Answer:**  
> `node-cache` stores data inside the heap memory of a single Node.js process. In a distributed multi-server architecture (e.g., behind a load balancer):
> - Server 1 has its own Cache A.
> - Server 2 has its own Cache B.
> 
> If a client creates a task on Server 1, Server 1 invalidates Cache A, but Server 2's Cache B remains stale. For multi-instance architectures, a distributed in-memory store such as **Redis** or **Memcached** is required so all server instances share a single centralized cache.

### Q4: What is a cache HIT?
> **Answer:**  
> A cache **HIT** occurs when the requested resource is found in the cache memory. The server immediately returns the cached data to the client without querying MongoDB.

### Q5: What is a cache MISS?
> **Answer:**  
> A cache **MISS** occurs when the requested resource is not present in the cache (either because it hasn't been cached yet, was invalidated, or expired due to TTL). The server must query MongoDB, save the result in the cache for future requests, and then return the response.

### Q6: Why can the first request be slower than the second request?
> **Answer:**  
> The first request is a cache MISS, requiring round-trip network I/O, database disk reads, query execution, and serialization in MongoDB. The second request is a cache HIT, retrieving pre-serialized JSON directly from Node.js RAM in fractions of a millisecond.

---

## Lab Report Screenshot Checklist

Capture the following screenshots in Postman for your lab practical report:

- [ ] **1. `GET /tasks` First Request (MISS)** — Notice response time (~20-100ms)
- [ ] **2. `GET /tasks` Second Request (HIT)** — Notice reduced response time (~2-10ms)
- [ ] **3. `GET /tasks` Third Request (HIT)** — Consistent low latency
- [ ] **4. `POST /tasks` (New Task Creation)** — Status `201 Created`
- [ ] **5. `GET /tasks` After POST** — Confirms cache invalidation; newly added task is present
- [ ] **6. `GET /tasks/:id` First Request (MISS)** — Initial task fetch from DB
- [ ] **7. `GET /tasks/:id` Second Request (HIT)** — Subsequent fetch from memory cache
- [ ] **8. `PUT /tasks/:id`** — Task update triggering cache invalidation
- [ ] **9. `DELETE /tasks/:id`** — Task deletion triggering cache invalidation
- [ ] **10. `GET /debug/cache`** — Displays `hits`, `misses`, `totalRequests`, `hitRate`, and active keys
- [ ] **11. Postman Response-Time Comparison** — Side-by-side or table comparison of MISS vs HIT timings

---

---

# Practical 10 — Asynchronous Processing with Event-Driven Architecture

**Course / Subject:** ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**Competency / Outcome:** CO4 / PO3, PO5  
**Topic:** Event-Driven Asynchronous Processing with Node.js Native `EventEmitter`

---

## Objective

Implement decoupled, non-blocking asynchronous background processing using Node.js's built-in `EventEmitter` module without external message queues (RabbitMQ, Kafka, Redis Pub/Sub). The HTTP client receives immediate API responses while slow notification tasks are handled asynchronously in the background.

---

## Architecture & Data Flow

```text
HTTP Client (POST /tasks)
       │
       ▼
1. Validate & Save Task to MongoDB (`[API] Task saved to MongoDB at ...`)
       │
       ▼
2. Invalidate Cache (Practical 9: cache.del('all_tasks'))
       │
       ▼
3. Log API Response Timestamp (`[API] Response sent at ...`)
       │
       ▼
4. Send HTTP 201 Created Response to Client (Immediate ~10-20ms)
       │
       ▼
5. Emit "task-created" Event on Shared EventEmitter
       │
       ▼
6. Notification Listener (`listeners.js`)
       ├── Log: [Listener] task-created handler started at ...
       └── Schedule 2000ms Non-Blocking Work (`setTimeout`)
                   │
                   ▼ (2000ms later)
           ├── Log: [Notification] Task "..." created at ...
           ├── Log: [Notification] Assigned user: ...
           └── Log: [Listener] Notification processing completed at ...
```

### Technical Note on Asynchronous Behavior in Node.js

Node.js's native `EventEmitter.prototype.emit()` calls registered listener functions **synchronously** in registration order. The non-blocking asynchronous execution in this practical is achieved by scheduling the heavy/slow notification workload onto the **libuv event loop timer phase** via `setTimeout(..., 2000)`. This allows `emit()` to return control immediately back to Express, ensuring the HTTP response is dispatched without any delay to the user.

---

## Module Structure

| Module | Location | Purpose |
|---|---|---|
| **Shared EventEmitter** | [`src/events/events.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/src/events/events.js) | Exports a single shared singleton instance extending `EventEmitter` |
| **Notification Listeners** | [`src/events/listeners.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/src/events/listeners.js) | Registers `task-created`, `task-deleted`, and `error` listeners |
| **Startup Registration** | [`server.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/server.js) | Imports `listeners.js` once during server boot before routes are mounted |
| **Route Integration** | [`src/routes/taskRoutes.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/src/routes/taskRoutes.js) | Emits `task-created` (POST) and `task-deleted` (DELETE) after DB & cache operations |
| **Debug Endpoint** | [`src/routes/debugRoutes.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/src/routes/debugRoutes.js) | Provides `GET /debug/cache` and `POST /debug/event-error` for testing |

---

## Events & Listeners Reference

| Event Name | Emitted By | Payload | Listener Action |
|---|---|---|---|
| `task-created` | `POST /tasks` | Saved task document | Logs start timestamp, schedules 2-second `setTimeout`, logs task title, assigned user, and completion timestamp |
| `task-deleted` | `DELETE /tasks/:id` | Deleted task document | Logs `[Deletion Listener] Task "<title>" was deleted at <timestamp>` |
| `error` | Any listener exception / `POST /debug/event-error` | `Error` instance | Logs `[Event Error] ${error.message}` to prevent uncaught process termination |

---

## Automated Verification

Run the comprehensive test suite (45 automated tests covering CRUD, Validation, HATEOAS, Practical 9 Caching, and Practical 10 Events):

```bash
npm test
```

Expected output:
```text
📊 Test Execution Summary: 45 Passed, 0 Failed
```

---

---

# Practical 11 — Containerization with Docker and Docker Compose

**Course / Subject:** ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**Competency / Outcome:** CO5 / PO3, PO5  
**Topic:** Containerization and Multi-Container Orchestration with Docker & Docker Compose  

---

## Objective

To containerize the full-stack application using Docker and orchestrate all three services (`frontend`, `backend`, and `mongodb`) together using Docker Compose, enabling the entire application stack to start with a single command (`docker compose up`).

---

## Architecture & Service Topology

```text
docker-compose.yml
 ├── frontend (React + Vite Preview, port 5173:5173)
 ├── backend  (Node.js / Express REST API, port 5000:5000)
 └── mongodb  (Official MongoDB image, port 27017:27017, persistent volume)

Docker Bridge Network: task-app-network
  frontend (browser fetch) ──► backend (Express) ──► mongodb (Mongoose)
```

### Port Mapping & Internal Network

| Service | Internal Container Port | Host Port Mapping | Purpose |
|---|---|---|---|
| **`frontend`** | `5173` | `5173:5173` | React Single Page Application served via Vite preview |
| **`backend`** | `5000` | `127.0.0.1:5000:5000` | Node/Express REST API (binds to localhost avoiding macOS AirPlay Receiver port collision) |
| **`mongodb`** | `27017` | `27017:27017` | MongoDB Database Server |

---

## Key Theory Concepts & Analysis

### Q1: Why does the backend container need to reference the MongoDB container by its service name (`mongodb`) rather than `localhost`?
> **Answer**:  
> Every Docker container runs in its own isolated network namespace with its own private loopback interface (`127.0.0.1` / `localhost`). If the backend container attempted to connect to `localhost:27017`, it would attempt to look for MongoDB inside *its own* container, where MongoDB is not running.  
> When services are connected to a shared user-defined Docker bridge network (`app-network`), Docker Compose activates an embedded DNS server. This DNS automatically maps the service name `mongodb` to the dynamic IP assigned to the MongoDB container on that network, enabling seamless inter-container communication (`mongodb://mongodb:27017/taskdb`).

### Q2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
> **Answer**:  
> - **`EXPOSE`**: Acts purely as documentation and container metadata. It informs developers and container engines which port the application inside the container listens on, but it does **not** publish or bind the port to the host machine.
> - **`ports` (in docker-compose.yml)**: Actively publishes and binds container ports to host machine interfaces (e.g. `host_port:container_port`). It sets up network forwarding rules so that traffic from host browsers or external tools can enter the container.

### Q3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
> **Answer**:  
> 1. **Native Addon Mismatches**: Local `node_modules` may contain C/C++ native binary addons compiled for the host OS and architecture (e.g. macOS ARM64 / Darwin), which fail or crash when executed inside a Linux container (e.g. Alpine Linux).
> 2. **Build Context Bloat**: Copying hundreds of megabytes of `node_modules` drastically slows down the `docker build` context transfer phase.
> 3. **Deterministic Reproducibility**: Running `npm install` or `npm ci` directly inside the container ensures clean, platform-matched dependencies built strictly from `package-lock.json`.

---

## Supplementary Problems Implemented

1. **`.dockerignore` Optimization**:
   - Excludes local `node_modules`, `.env`, temporary logs, git directories, and build artifacts from both backend and frontend build contexts to minimize build context transfer time and prevent secret leakage.
2. **Multi-Stage Build for React Frontend**:
   - `Stage 1 (build)`: Installs dependencies and compiles React JSX into static assets in `/app/dist`.
   - `Stage 2 (production)`: Uses a lightweight `node:20-alpine` runtime image copying only `/app/dist` and the minimal preview server, drastically reducing the final container image footprint.
3. **Named Volume Data Persistence**:
   - Configured named volume `task-mongo-data` (`mongo-data:/data/db`) ensuring all task data and collections persist across container restarts, stops, and rebuilds.

---

## Running the Complete Stack

### 1. Build and Start All Services
```bash
docker compose up --build -d
```

### 2. Verify Running Containers
```bash
docker compose ps
```

### 3. View Aggregated Logs
```bash
docker compose logs -f
```

### 4. Stop All Services
```bash
docker compose down
```

### 5. Access the Running Application
- **Frontend Web UI**: [http://localhost:5173](http://localhost:5173)
- **Backend Health & API**: [http://localhost:5000/tasks](http://localhost:5000/tasks)
- **Cache Debug Endpoint**: [http://localhost:5000/debug/cache](http://localhost:5000/debug/cache)

---
---

# Practical 12 — Continuous Integration with GitHub Actions

**Subject:** ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**Pipeline Status:** [![CI Pipeline](https://github.com/krishbhingradiya/API-Testing/actions/workflows/ci.yml/badge.svg)](https://github.com/krishbhingradiya/API-Testing/actions/workflows/ci.yml)  
**Workflow File:** [`.github/workflows/ci.yml`](.github/workflows/ci.yml)  
**Documentation Report:** [`docs/practical-12/README.md`](docs/practical-12/README.md)

---

## Objective

To design, configure, and automate a production-grade Continuous Integration (CI) pipeline using **GitHub Actions**, **Jest**, and **Supertest** that automatically validates every push to the `main` branch.

---

## CI Workflow Pipeline (`.github/workflows/ci.yml`)

The automated workflow triggers on every push to `main` and on pull requests:

```yaml
name: CI Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  test:
    name: Run Automated Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20 LTS Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm install

      - name: Execute Automated Test Suite (Jest & Supertest)
        run: npm test
```

---

## Automated Test Suite (`tests/tasks.test.js`)

Jest and Supertest execute in-memory tests without requiring a running database:

1. **`GET /tasks`**: Asserts HTTP 200, valid JSON array, item count, and Level 3 HATEOAS collection pagination links.
2. **`GET /debug/cache`**: Asserts HTTP 200 and runtime statistics (`hits`, `misses`, `totalRequests`, `hitRate`, `activeKeys`).
3. **`GET /tasks/:id` (Validation)**: Asserts HTTP 400 Bad Request when an invalid 24-hex MongoDB ObjectId format is supplied.
4. **`POST /tasks` (Schema Validation)**: Asserts HTTP 400 Bad Request when mandatory fields (`title`, `description`) are missing.

---

## Running Tests Locally

```bash
# Run automated Jest test suite
npm test

# Run tests with code coverage analysis
npx jest --coverage
```


