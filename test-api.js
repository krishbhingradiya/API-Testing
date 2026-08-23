/**
 * Automated Verification Script for Task Management REST API
 * Tests MongoDB Mongoose Integration, Schema Validation, Enum Constraints,
 * ObjectId Validation, 404 Handlers, Centralized Error Pipeline,
 * and Level 3 HATEOAS (Hypermedia As The Engine Of Application State).
 */
const http = require('http');
const mongoose = require('mongoose');

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting Automated Test Suite (Level 2 + Level 3 HATEOAS)');
  console.log('----------------------------------------------------\n');

  let mongoServer = null;
  const defaultUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskdb';

  // Attempt connection to local MongoDB first
  try {
    await mongoose.connect(defaultUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ Connected to local MongoDB at: ${defaultUri}`);
  } catch (err) {
    console.log('ℹ️ Local MongoDB connection failed or timed out. Initializing MongoMemoryServer...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGO_URI = mongoUri;
    await mongoose.connect(mongoUri);
    console.log(`📦 Connected to In-Memory MongoDB Server at: ${mongoUri}`);
  }

  const app = require('./server.js');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const BASE_URL = `http://localhost:${port}`;

  function makeRequest(path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: { ...headers }
      };

      let dataString = '';
      if (body !== null) {
        dataString = typeof body === 'string' ? body : JSON.stringify(body);
        if (!headers['Content-Type'] && !headers['content-type'] && headers['Content-Type'] !== null) {
          options.headers['Content-Type'] = 'application/json';
        }
        options.headers['Content-Length'] = Buffer.byteLength(dataString);
      }

      const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          try {
            const parsed = responseBody ? JSON.parse(responseBody) : {};
            resolve({ status: res.statusCode, headers: res.headers, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, rawBody: responseBody });
          }
        });
      });

      req.on('error', err => reject(err));
      if (body !== null) req.write(dataString);
      req.end();
    });
  }

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  let createdTaskId = null;

  // ============================================================
  // SECTION 1: EXISTING LEVEL 2 TESTS (adapted for new model)
  // ============================================================
  console.log('\n--- Level 2 Core Tests ---\n');

  // Test 1: GET /tasks
  await assertTest('GET /tasks should return 200 OK and array of tasks', async () => {
    const res = await makeRequest('/tasks');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.body.success || !Array.isArray(res.body.data)) throw new Error('Invalid response structure');
  });

  // Test 2: POST /tasks with valid payload and title trimming
  await assertTest('POST /tasks should trim title, set defaults (status: pending, priority: medium), and return 201 Created', async () => {
    const res = await makeRequest('/tasks', 'POST', {
      title: '   MongoDB & Mongoose Schema Test   ',
      description: 'Testing database integration'
    });
    if (res.status !== 201) throw new Error(`Expected status 201, got ${res.status}`);
    if (res.body.data.title !== 'MongoDB & Mongoose Schema Test') {
      throw new Error(`Title trim failed. Expected trimmed title, got '${res.body.data.title}'`);
    }
    if (res.body.data.status !== 'pending') throw new Error('Default status should be pending');
    if (res.body.data.priority !== 'medium') throw new Error('Default priority should be medium');
    if (!res.body.data._id) throw new Error('Missing MongoDB _id in response');
    createdTaskId = res.body.data._id;
  });

  // Test 3: POST /tasks with explicit enum priority 'high'
  await assertTest('POST /tasks with priority "high" should accept enum value', async () => {
    const res = await makeRequest('/tasks', 'POST', {
      title: 'Urgent Task',
      description: 'High priority task',
      priority: 'high'
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (res.body.data.priority !== 'high') throw new Error('Priority was not set to high');
  });

  // Test 4: Mongoose Schema Validation - Missing required title field
  await assertTest('POST /tasks without title should return 400 Bad Request with structured JSON validation error', async () => {
    const res = await makeRequest('/tasks', 'POST', { description: 'No title provided' });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    if (res.body.error !== 'Validation Error' || !Array.isArray(res.body.details)) {
      throw new Error('Response is not structured JSON validation error format');
    }
  });

  // Test 5: Mongoose Enum Validation - Invalid priority value
  await assertTest('POST /tasks with invalid priority "super-high" should return 400 validation error', async () => {
    const res = await makeRequest('/tasks', 'POST', { title: 'Invalid Enum Task', description: 'Test', priority: 'super-high' });
    if (res.status !== 400) throw new Error(`Expected status 400, got ${res.status}`);
    if (res.body.error !== 'Validation Error') throw new Error('Expected structured validation error');
  });

  // Test 6: GET /tasks/:id (Single task by valid ObjectId)
  await assertTest('GET /tasks/:id should return single task document with 200 OK', async () => {
    const res = await makeRequest(`/tasks/${createdTaskId}`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.data._id !== createdTaskId) throw new Error('Document ID mismatch');
  });

  // Test 7: GET /tasks/:id with invalid hex ObjectId format
  await assertTest('GET /tasks/invalid-id should return 400 Bad Request via idValidator', async () => {
    const res = await makeRequest('/tasks/invalid-123-abc');
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // Test 8: GET /tasks/:id with non-existent valid ObjectId
  await assertTest('GET /tasks/507f1f77bcf86cd799439011 should return 404 Not Found JSON', async () => {
    const res = await makeRequest('/tasks/507f1f77bcf86cd799439011');
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    if (!res.body.error) throw new Error('Missing error message in 404 response');
  });

  // Test 9: PUT /tasks/:id (Update task)
  await assertTest('PUT /tasks/:id should update task document and return 200 OK', async () => {
    const res = await makeRequest(`/tasks/${createdTaskId}`, 'PUT', { status: 'in-progress', priority: 'low' });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.body.data.status !== 'in-progress' || res.body.data.priority !== 'low') {
      throw new Error('Task document was not updated properly');
    }
  });

  // Test 10: DELETE /tasks/:id
  await assertTest('DELETE /tasks/:id should delete task document and return 200 OK', async () => {
    const res = await makeRequest(`/tasks/${createdTaskId}`, 'DELETE');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // Test 11: GET deleted task should return 404
  await assertTest('GET /tasks/:id for deleted task should return 404 Not Found', async () => {
    const res = await makeRequest(`/tasks/${createdTaskId}`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  // Test 12: Global Error Handler test route (/tasks/test-error)
  await assertTest('GET /tasks/test-error should trigger global error handler returning status 500', async () => {
    const res = await makeRequest('/tasks/test-error');
    if (res.status !== 500) throw new Error(`Expected 500, got ${res.status}`);
    if (res.body.error !== 'Something went wrong') throw new Error('Global error handler response mismatch');
  });

  // ============================================================
  // SECTION 2: LEVEL 3 HATEOAS TESTS
  // ============================================================
  console.log('\n--- Level 3 HATEOAS Tests ---\n');

  // Create a fresh task for HATEOAS testing
  let hateoasTaskId = null;
  const createRes = await makeRequest('/tasks', 'POST', {
    title: 'HATEOAS Test Task',
    description: 'Task for testing Level 3 HATEOAS links'
  });
  hateoasTaskId = createRes.body.data._id;

  // HATEOAS Test 1: GET /tasks/:id contains _links.self
  await assertTest('HATEOAS: GET /tasks/:id contains _links.self', async () => {
    const res = await makeRequest(`/tasks/${hateoasTaskId}`);
    if (!res.body._links || !res.body._links.self) throw new Error('Missing _links.self');
    if (res.body._links.self.href !== `/tasks/${hateoasTaskId}`) throw new Error('Incorrect self href');
    if (res.body._links.self.method !== 'GET') throw new Error('Incorrect self method');
  });

  // HATEOAS Test 2: GET /tasks/:id contains update link
  await assertTest('HATEOAS: GET /tasks/:id contains _links.update', async () => {
    const res = await makeRequest(`/tasks/${hateoasTaskId}`);
    if (!res.body._links || !res.body._links.update) throw new Error('Missing _links.update');
    if (res.body._links.update.method !== 'PUT') throw new Error('Incorrect update method');
  });

  // HATEOAS Test 3: GET /tasks/:id contains partialUpdate link
  await assertTest('HATEOAS: GET /tasks/:id contains _links.partialUpdate', async () => {
    const res = await makeRequest(`/tasks/${hateoasTaskId}`);
    if (!res.body._links || !res.body._links.partialUpdate) throw new Error('Missing _links.partialUpdate');
    if (res.body._links.partialUpdate.method !== 'PATCH') throw new Error('Incorrect partialUpdate method');
  });

  // HATEOAS Test 4: GET /tasks/:id contains delete link
  await assertTest('HATEOAS: GET /tasks/:id contains _links.delete', async () => {
    const res = await makeRequest(`/tasks/${hateoasTaskId}`);
    if (!res.body._links || !res.body._links.delete) throw new Error('Missing _links.delete');
    if (res.body._links.delete.method !== 'DELETE') throw new Error('Incorrect delete method');
  });

  // HATEOAS Test 5: GET /tasks/:id contains collection link
  await assertTest('HATEOAS: GET /tasks/:id contains _links.collection', async () => {
    const res = await makeRequest(`/tasks/${hateoasTaskId}`);
    if (!res.body._links || !res.body._links.collection) throw new Error('Missing _links.collection');
    if (res.body._links.collection.href !== '/tasks') throw new Error('Incorrect collection href');
    if (res.body._links.collection.method !== 'GET') throw new Error('Incorrect collection method');
  });

  // HATEOAS Test 6: Pending task contains start link
  await assertTest('HATEOAS: Pending task contains _links.start', async () => {
    const res = await makeRequest(`/tasks/${hateoasTaskId}`);
    if (res.body.data.status !== 'pending') throw new Error('Task is not pending');
    if (!res.body._links.start) throw new Error('Missing _links.start for pending task');
    if (res.body._links.start.method !== 'PATCH') throw new Error('Incorrect start method');
  });

  // HATEOAS Test 7: In-progress task contains complete link
  await assertTest('HATEOAS: In-progress task contains _links.complete', async () => {
    // Transition to in-progress
    await makeRequest(`/tasks/${hateoasTaskId}`, 'PATCH', { status: 'in-progress' });
    const res = await makeRequest(`/tasks/${hateoasTaskId}`);
    if (res.body.data.status !== 'in-progress') throw new Error('Task is not in-progress');
    if (!res.body._links.complete) throw new Error('Missing _links.complete for in-progress task');
    if (res.body._links.complete.method !== 'PATCH') throw new Error('Incorrect complete method');
  });

  // HATEOAS Test 8: Completed task does not contain complete link
  await assertTest('HATEOAS: Completed task does NOT contain _links.complete or _links.start', async () => {
    // Transition to completed
    await makeRequest(`/tasks/${hateoasTaskId}`, 'PATCH', { status: 'completed' });
    const res = await makeRequest(`/tasks/${hateoasTaskId}`);
    if (res.body.data.status !== 'completed') throw new Error('Task is not completed');
    if (res.body._links.complete) throw new Error('Completed task should NOT have _links.complete');
    if (res.body._links.start) throw new Error('Completed task should NOT have _links.start');
  });

  // HATEOAS Test 9: GET /tasks contains task-level HATEOAS links
  await assertTest('HATEOAS: GET /tasks contains _links on each task in the data array', async () => {
    const res = await makeRequest('/tasks');
    if (!Array.isArray(res.body.data) || res.body.data.length === 0) throw new Error('No tasks in response');
    const firstTask = res.body.data[0];
    if (!firstTask._links) throw new Error('First task missing _links');
    if (!firstTask._links.self) throw new Error('First task missing _links.self');
    if (!firstTask._links.delete) throw new Error('First task missing _links.delete');
  });

  // HATEOAS Test 10: GET /tasks contains collection-level links
  await assertTest('HATEOAS: GET /tasks contains collection-level _links with create', async () => {
    const res = await makeRequest('/tasks');
    if (!res.body._links) throw new Error('Missing collection-level _links');
    if (!res.body._links.self) throw new Error('Missing collection _links.self');
    if (!res.body._links.create) throw new Error('Missing collection _links.create');
    if (res.body._links.create.method !== 'POST') throw new Error('Incorrect create method');
  });

  // HATEOAS Test 11: Pagination contains first link
  await assertTest('HATEOAS: Pagination contains _links.first', async () => {
    const res = await makeRequest('/tasks?page=1&limit=2');
    if (!res.body._links || !res.body._links.first) throw new Error('Missing _links.first');
    if (!res.body._links.first.href.includes('page=1')) throw new Error('first link should point to page 1');
  });

  // Create more tasks for pagination testing
  for (let i = 0; i < 5; i++) {
    await makeRequest('/tasks', 'POST', {
      title: `Pagination Test Task ${i + 1}`,
      description: `Pagination task ${i + 1}`
    });
  }

  // HATEOAS Test 12: Pagination contains next link when applicable
  await assertTest('HATEOAS: Pagination contains _links.next when more pages exist', async () => {
    const res = await makeRequest('/tasks?page=1&limit=2');
    if (!res.body._links.next) throw new Error('Missing _links.next when more pages exist');
    if (!res.body._links.next.href.includes('page=2')) throw new Error('next link should point to page 2');
  });

  // HATEOAS Test 13: Pagination contains previous link when applicable
  await assertTest('HATEOAS: Pagination contains _links.previous when on page > 1', async () => {
    const res = await makeRequest('/tasks?page=2&limit=2');
    if (!res.body._links.previous) throw new Error('Missing _links.previous on page 2');
    if (!res.body._links.previous.href.includes('page=1')) throw new Error('previous link should point to page 1');
  });

  // HATEOAS Test 14: Pagination preserves search/status/limit query parameters
  await assertTest('HATEOAS: Pagination preserves search/status/limit query parameters', async () => {
    const res = await makeRequest('/tasks?search=Pagination&status=pending&page=1&limit=2');
    if (!res.body._links) throw new Error('Missing _links');
    const selfHref = res.body._links.self.href;
    if (!selfHref.includes('search=Pagination')) throw new Error('self link missing search param');
    if (!selfHref.includes('status=pending')) throw new Error('self link missing status param');
    if (!selfHref.includes('limit=2')) throw new Error('self link missing limit param');
  });

  // HATEOAS Test 15: POST /tasks returns HATEOAS links
  await assertTest('HATEOAS: POST /tasks returns _links in response', async () => {
    const res = await makeRequest('/tasks', 'POST', {
      title: 'POST HATEOAS Test',
      description: 'Testing POST response links'
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.body._links) throw new Error('Missing _links in POST response');
    if (!res.body._links.self) throw new Error('Missing _links.self in POST response');
    if (!res.body._links.update) throw new Error('Missing _links.update in POST response');
    if (!res.body._links.start) throw new Error('Newly created pending task should have _links.start');
  });

  // HATEOAS Test 16: PATCH /tasks/:id regenerates links according to new status
  await assertTest('HATEOAS: PATCH /tasks/:id regenerates links based on new status', async () => {
    // Create a fresh pending task
    const createRes = await makeRequest('/tasks', 'POST', {
      title: 'PATCH Transition Test',
      description: 'Testing PATCH status transition links'
    });
    const taskId = createRes.body.data._id;

    // PATCH to in-progress — should now have "complete" but not "start"
    const patchRes = await makeRequest(`/tasks/${taskId}`, 'PATCH', { status: 'in-progress' });
    if (patchRes.status !== 200) throw new Error(`Expected 200, got ${patchRes.status}`);
    if (!patchRes.body._links.complete) throw new Error('in-progress task should have _links.complete after PATCH');
    if (patchRes.body._links.start) throw new Error('in-progress task should NOT have _links.start after PATCH');

    // Cleanup
    await makeRequest(`/tasks/${taskId}`, 'DELETE');
  });

  // HATEOAS Test 17: PUT /tasks/:id regenerates links according to new status
  await assertTest('HATEOAS: PUT /tasks/:id regenerates links based on new status', async () => {
    // Create a fresh pending task
    const createRes = await makeRequest('/tasks', 'POST', {
      title: 'PUT Transition Test',
      description: 'Testing PUT status transition links'
    });
    const taskId = createRes.body.data._id;

    // PUT to completed — should NOT have "start" or "complete"
    const putRes = await makeRequest(`/tasks/${taskId}`, 'PUT', { status: 'completed' });
    if (putRes.status !== 200) throw new Error(`Expected 200, got ${putRes.status}`);
    if (putRes.body._links.start) throw new Error('completed task should NOT have _links.start after PUT');
    if (putRes.body._links.complete) throw new Error('completed task should NOT have _links.complete after PUT');
    if (!putRes.body._links.self) throw new Error('completed task should still have _links.self');

    // Cleanup
    await makeRequest(`/tasks/${taskId}`, 'DELETE');
  });

  // HATEOAS Test 18: Invalid task IDs still return proper error (no HATEOAS needed)
  await assertTest('HATEOAS: Invalid task IDs still return existing proper 400 error', async () => {
    const res = await makeRequest('/tasks/not-a-valid-id');
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (!res.body.error) throw new Error('Missing error message');
  });

  // HATEOAS Test 19: Existing validation tests continue to pass (missing required description)
  await assertTest('HATEOAS: Existing validation - POST without description returns 400', async () => {
    const res = await makeRequest('/tasks', 'POST', { title: 'No Description Task' });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    if (res.body.error !== 'Validation Error') throw new Error('Expected validation error');
  });

  // HATEOAS Test 20: Existing DELETE tests continue to pass
  await assertTest('HATEOAS: DELETE returns 200 and existing response format', async () => {
    const createRes = await makeRequest('/tasks', 'POST', {
      title: 'Delete HATEOAS Test',
      description: 'Task to be deleted for HATEOAS test'
    });
    const taskId = createRes.body.data._id;
    const deleteRes = await makeRequest(`/tasks/${taskId}`, 'DELETE');
    if (deleteRes.status !== 200) throw new Error(`Expected 200, got ${deleteRes.status}`);
    if (!deleteRes.body.success) throw new Error('Delete response should have success: true');
    if (!deleteRes.body.message) throw new Error('Delete response should have a message');
  });

  // ============================================================
  // CLEANUP & SUMMARY
  // ============================================================

  // Clean up the HATEOAS test task
  await makeRequest(`/tasks/${hateoasTaskId}`, 'DELETE');

  console.log('\n----------------------------------------------------');
  console.log(`📊 Test Execution Summary: ${passed} Passed, ${failed} Failed`);
  console.log('----------------------------------------------------');

  server.close();
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
