# Practical 9 — In-Memory Caching and Query Optimization

**Subject:** ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**Application:** TaskFlow — Full-Stack Task Management Application

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

## Automated Verification

Run the comprehensive test suite (40 automated tests covering CRUD, Validation, HATEOAS, and Practical 9 Caching):

```bash
npm test
```

Expected output:
```text
📊 Test Execution Summary: 40 Passed, 0 Failed
```
