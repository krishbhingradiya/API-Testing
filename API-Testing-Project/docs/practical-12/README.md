# Practical 12 — Complete CI/CD Pipeline with GitHub Actions

**Subject:** ADVANCED WEB DEVELOPMENT FRAMEWORKS (ITUE301)  
**Application:** TaskFlow — Full-Stack Task Management Application  
**Repository:** [krishbhingradiya/API-Testing](https://github.com/krishbhingradiya/API-Testing)  
**Workflow File:** [`.github/workflows/ci.yml`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/.github/workflows/ci.yml)  
**Pipeline Status Badge:**  
[![CI Pipeline](https://github.com/krishbhingradiya/API-Testing/actions/workflows/ci.yml/badge.svg)](https://github.com/krishbhingradiya/API-Testing/actions/workflows/ci.yml)

---

## 1. Objective

To design, configure, and automate a production-ready Continuous Integration (CI) pipeline using **GitHub Actions**, **Jest**, and **Supertest** for the full-stack Task Management application. The pipeline automatically checks out code, provisions an isolated Node.js environment, installs dependencies, executes automated API tests on every push to `main`, and enforces code reliability before changes can be merged or deployed.

---

## 2. Understanding CI and CD

| Concept | Definition | Automation Stage | Practical 12 Scope |
|---|---|---|---|
| **Continuous Integration (CI)** | Automated process of building and running automated test suites on every code commit pushed to a shared repository. | Build & Automated Test Execution | **Demonstrated in this Practical** |
| **Continuous Delivery (CD)** | Automatically building, testing, and packaging release artifacts into staging environments, ready for manual approval to production. | Staging / Pre-production deployment | Conceptual baseline |
| **Continuous Deployment (CD)** | Fully automated pipeline where every commit that passes all automated CI checks is immediately deployed directly to production with no human intervention. | Production Deployment | Conceptual baseline |

> **Practical 12 Scope Clarification:** This practical specifically implements and demonstrates **Continuous Integration (CI)**. It automates build validation and test execution upon every code push to the `main` branch. No cloud production deployment is performed or claimed.

---

## 3. Architecture & Data Flow

```text
 Developer commits code
        │
        ▼
   git push origin main
        │
        ▼
 GitHub Actions Webhook Triggered
        │
        ▼
 Spin up clean Virtual Machine (ubuntu-latest)
        │
        ├─► Step 1: actions/checkout@v4 (Clones repository)
        │
        ├─► Step 2: actions/setup-node@v4 (Node.js 20 LTS + npm cache)
        │
        ├─► Step 3: npm install (Installs backend production & dev dependencies)
        │
        └─► Step 4: npm test (Executes Jest & Supertest API test suite)
                │
                ├── [Any Test Fails]  ──► Exit Code 1 ──► ❌ Red Pipeline (Build Failed)
                │                                         (Developer notified immediately)
                │
                └── [All Tests Pass]  ──► Exit Code 0 ──► ✅ Green Pipeline (Build Passed)
                                                          (Status badge updated to passing)
```

---

## 4. GitHub Actions Workflow Configuration (`.github/workflows/ci.yml`)

The pipeline workflow is declared in [`.github/workflows/ci.yml`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/.github/workflows/ci.yml):

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

### Breakdown of Workflow Directives:

1. **`name: CI Pipeline`**: Identifies the pipeline in GitHub's **Actions** tab and on status badges.
2. **`on.push.branches: [ main ]`**: Configures the event trigger so GitHub evaluates and runs this workflow every time new commits reach `main`.
3. **`on.pull_request.branches: [ main ]`**: Runs tests against pull requests before merging to catch defects early.
4. **`runs-on: ubuntu-latest`**: Runs the job on a hosted, ephemeral Linux runner provided by GitHub.
5. **`actions/checkout@v4`**: Fetches git history and checks out files into the runner's `$GITHUB_WORKSPACE`.
6. **`actions/setup-node@v4`**: Provisions Node.js 20 LTS and caches `~/.npm` to accelerate subsequent runs.
7. **`run: npm install`**: Resolves and installs packages declared in `package.json` and `package-lock.json`.
8. **`run: npm test`**: Invokes the Jest test runner defined in `package.json`. If any test throws an assertion error, Jest exits with code 1, immediately failing the GitHub Actions workflow run.

---

## 5. Automated Testing Implementation

Automated API tests are implemented using **Jest** and **Supertest** in [`tests/tasks.test.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/tests/tasks.test.js).

### Architectural Safety Decisions for CI:
- **No Production Database Dependency:** In [`server.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/server.js#L20), MongoDB auto-connection is bypassed when `process.env.NODE_ENV === 'test'`. This ensures tests run in pure memory with zero external database connection latency, eliminating timeout errors on CI runners.
- **Strict Test Isolation:** In `beforeEach`, `cache.flushAll()` and `cache.resetCustomStats()` ensure Practical 9 cache states do not leak between test cases.
- **Express App Export:** `server.js` exports `app` directly without starting a background listener during test imports (`if (require.main === module)`), allowing Supertest to test routes on ephemeral in-memory ports.

### Test Cases Summary:

| # | Test Description | Target Endpoint | Method | Expected HTTP Status | Verification Focus |
|---|---|---|---|---|---|
| 1 | List tasks with HATEOAS collection links | `/tasks` | `GET` | `200 OK` | `res.body.success === true`, `data` array length, HATEOAS pagination `_links` |
| 2 | Runtime in-memory cache statistics | `/debug/cache` | `GET` | `200 OK` | `res.body.success === true`, `hits`, `misses`, `hitRate`, `activeKeys` |
| 3 | Invalid MongoDB ObjectId handling | `/tasks/:id` | `GET` | `400 Bad Request` | Middleware validation catches malformed ID (`invalid-object-id`) |
| 4 | Task creation schema validation | `/tasks` | `POST` | `400 Bad Request` | Mongoose schema validation fails when required `title` / `description` are missing |

---

## 6. Local Execution Commands

Run the test suite locally before pushing to GitHub:

```bash
# 1. Install dependencies
npm install

# 2. Run Jest automated test suite
npm test

# 3. (Optional) Run with test coverage report
npx jest --coverage
```

Expected local test output:
```text
PASS tests/tasks.test.js
  Task Manager REST API & CI Automated Test Suite
    GET /tasks
      ✓ should return HTTP 200 with list of tasks and HATEOAS collection links (15 ms)
    GET /debug/cache
      ✓ should return HTTP 200 with runtime cache statistics (7 ms)
    GET /tasks/:id (Validation Middleware)
      ✓ should return HTTP 400 when an invalid MongoDB ObjectId is provided (7 ms)
    POST /tasks (Payload Validation)
      ✓ should return HTTP 400 when creating a task without required fields (12 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        0.22 s
```

---

## 7. Mandatory Practical Demonstration: Failing & Passing Pipeline

To fulfill academic assessment requirements, you must prove that the pipeline catches errors by intentionally failing a test, observing the Red X on GitHub Actions, and restoring it to a Green checkmark.

### Step 1: Intentionally Break a Test Expectation
Edit [`tests/tasks.test.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/tests/tasks.test.js#L45) and change the expected HTTP status for `GET /tasks`:

```javascript
// Change .expect(200) to .expect(500) intentionally:
const res = await request(app)
  .get('/tasks')
  .expect('Content-Type', /json/)
  .expect(500); // <-- INTENTIONAL FAILURE
```

Verify failure locally:
```bash
npm test
# Result: ✕ should return HTTP 200 ... Expected 500, got 200 (Exit code 1)
```

### Step 2: Commit & Push Broken Test to GitHub
```bash
git add tests/tasks.test.js
git commit -m "test: demonstrate CI failure with broken assertion"
git push origin main
```

### Step 3: Observe the Failed Pipeline (Red X)
1. Go to your repository: `https://github.com/krishbhingradiya/API-Testing`
2. Click the **Actions** tab.
3. You will see the latest run with a **Red X** named `test: demonstrate CI failure with broken assertion`.
4. Click the failed run, select **Run Automated Tests**, and expand the **Execute Automated Test Suite** step.
5. Inspect the error log showing `Expected 500, received 200`.
6. Capture a screenshot and save it to:
   `docs/practical-12/screenshots/ci-failed.png`

### Step 4: Restore Correct Test Assertion & Push
Revert the change in [`tests/tasks.test.js`](file:///Users/JBC/Documents/SEM%205%20Practical/Advance%20WDF/PR4/tests/tasks.test.js#L45) back to:

```javascript
.expect(200); // <-- RESTORED TO 200 OK
```

Verify locally:
```bash
npm test
# Result: 4 passed, 4 total (Exit code 0)
```

Commit and push the fix:
```bash
git add tests/tasks.test.js
git commit -m "fix(test): restore correct assertion and passing CI"
git push origin main
```

### Step 5: Observe the Passing Pipeline (Green Checkmark)
1. Return to **GitHub → Actions**.
2. Notice the new run named `fix(test): restore correct assertion and passing CI` completes with a **Green checkmark**.
3. Capture a screenshot and save it to:
   `docs/practical-12/screenshots/ci-passed.png`

---

## 8. Pipeline Evidence & Screenshots

| Screenshot | Location | Description |
|---|---|---|
| **Failed CI Run (Red X)** | `docs/practical-12/screenshots/ci-failed.png` | Shows failed job with assertion log `expected 500, received 200` |
| **Passing CI Run (Green Checkmark)** | `docs/practical-12/screenshots/ci-passed.png` | Shows all 4 steps green with Jest execution passing |

---

## 9. Answers to Key Viva Questions

### Q1. What is the difference between Continuous Integration and Continuous Deployment, and which does this practical demonstrate?
> **Answer:**  
> - **Continuous Integration (CI)** focuses on integrating code changes from multiple contributors into a shared mainline frequently. On every push or pull request, an automated system checks out the repository, installs dependencies, and runs automated tests to verify that the change did not break existing functionality.  
> - **Continuous Deployment (CD)** takes automated integration a step further: once a commit passes all CI tests and quality gates, the pipeline automatically packages and deploys the application directly into a production environment (e.g., AWS, Render, Docker Hub, Kubernetes) without manual intervention.  
> - **This practical specifically demonstrates Continuous Integration (CI)**. It automatically triggers on every push to `main`, executes unit and integration tests with Jest/Supertest on an Ubuntu runner, and provides instant feedback (pass/fail status badge). It does not deploy the code to a hosting environment.

### Q2. Why does automatically running tests on every push catch problems earlier than manual testing before a release?
> **Answer:**  
> 1. **Immediate Feedback Loop:** When tests execute automatically on every push, developers are notified within seconds of introducing a regression while the context of the code change is still fresh in their minds.
> 2. **Eliminates Human Error & Inconsistency:** Manual testing often skips edge cases, regression paths, or unmaintained modules due to fatigue or time constraints. Automated tests execute deterministically every single time.
> 3. **Prevents "Broken Main" Syndrome:** In collaborative teams, without CI, one broken commit pushed to `main` blocks all other team members. CI flags or blocks defective code before other developers pull it.
> 4. **Drastic Cost Reduction:** Fixing a defect identified minutes after a commit takes a fraction of the time and cost compared to debugging a bug caught weeks later during pre-release staging or production outages.

### Q3. What happens if the test file path is incorrect? Does the workflow fail at the same step as a genuine test failure?
> **Answer:**  
> - **If the test file path or glob pattern is incorrect:** Jest searches for files matching the pattern. By default, if no matching test files are found, Jest reports `No tests found related to files matching ...` and exits with **code 1** (unless `--passWithNoTests` is passed).  
> - **Workflow Failure Step:** Both an incorrect test path and a genuine assertion failure fail at the exact same GitHub Actions workflow step: `Execute Automated Test Suite (Jest & Supertest)` (`run: npm test`).  
> - **Log Differences:**  
>   - In a **path/discovery error**, the logs show: `Pattern did not match any test files`. No test suites execute.
>   - In a **genuine test failure**, the logs show the test suite running, the specific `it(...)` block that failed, the expected vs received values (e.g. `Expected: 200, Received: 500`), and a stack trace pointing to the failed assertion line.

---

## 10. Troubleshooting Guide

| Issue | Root Cause | Solution |
|---|---|---|
| **Workflow not appearing in GitHub Actions** | File placed in wrong directory or wrong filename | Verify path is strictly `.github/workflows/ci.yml`. Hidden `.github` directory must be in repo root. |
| **YAML Syntax Error / Parsing Failure** | Incorrect indentation (tabs instead of spaces) | Ensure strictly 2-space indentation. Never use hard tabs in YAML. |
| **`npm error enoent: package.json not found`** | Workflow executed in wrong directory | If backend is in root, omit `working-directory`. If in a subdirectory, add `defaults.run.working-directory: ./backend`. |
| **`connect ECONNREFUSED 127.0.0.1:27017`** | Server attempting to connect to offline MongoDB in CI | Ensure `server.js` guards `mongoose.connect()` with `if (process.env.NODE_ENV !== 'test')`. |
| **Jest open handle warning / hangs** | Server listener remains active or unclosed timer | Ensure `server.js` guards `app.listen()` with `if (require.main === module)` and run Jest with `--forceExit`. |

---

## 11. Practical 12 Completion Checklist

- [x] Repository inspected; CommonJS structure and root backend verified
- [x] Jest and Supertest installed as devDependencies
- [x] `package.json` test script configured (`"test": "jest --runInBand --detectOpenHandles --forceExit"`)
- [x] Existing scripts preserved (`test:api` for legacy Level 2/3 suite)
- [x] `server.js` safely decoupled for memory testing in CI
- [x] 4 automated API tests created in `tests/tasks.test.js` (`GET /tasks`, `/debug/cache`, `/tasks/:id`, `/tasks`)
- [x] All tests run and verified locally (0.22s execution time, 4 passed)
- [x] `.github/workflows/ci.yml` created with Checkout, Setup Node 20, Install, and Test steps
- [x] Status badge added to `README.md` linked to `krishbhingradiya/API-Testing`
- [x] Step-by-step instructions provided for failing (Red X) and passing (Green checkmark) pipeline demo
- [x] Screenshot folder `docs/practical-12/screenshots/` prepared
- [x] All 3 Viva questions answered thoroughly in documentation
