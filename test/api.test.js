const assert = require('node:assert/strict');
const { once } = require('node:events');
const { after, before, test } = require('node:test');
const mongoose = require('mongoose');

const databaseName = `taskmanager_test_${process.pid}`;
const mongoUri = `mongodb://127.0.0.1:27017/${databaseName}`;
const app = require('../app');

let server;
let baseUrl;

before(async () => {
  await mongoose.connect(mongoUri);
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }

  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});

async function sendRequest(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  return {
    status: response.status,
    body: await response.json()
  };
}

test('retorna llista buida i errors 400/404 coherents', async () => {
  const list = await sendRequest('/api/tasks');
  assert.equal(list.status, 200);
  assert.deepEqual(list.body, []);

  const invalidId = await sendRequest('/api/tasks/not-an-id');
  assert.equal(invalidId.status, 400);

  const missingTask = await sendRequest('/api/tasks/000000000000000000000001');
  assert.equal(missingTask.status, 404);
});

test('valida dades i gestiona la data de finalització durant el cicle CRUD', async () => {
  const invalidTask = await sendRequest('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Tasca incompleta' })
  });
  assert.equal(invalidTask.status, 400);
  assert.ok(invalidTask.body.details.length > 0);

  const created = await sendRequest('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Tasca de prova',
      cost: 10,
      hours_estimated: 2,
      completed: true
    })
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.completed, true);
  assert.ok(created.body.finished_at);

  const updated = await sendRequest(`/api/tasks/${created.body._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: false })
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.finished_at, null);

  const invalidUpdate = await sendRequest(`/api/tasks/${created.body._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cost: -1 })
  });
  assert.equal(invalidUpdate.status, 400);

  const deleted = await sendRequest(`/api/tasks/${created.body._id}`, {
    method: 'DELETE'
  });
  assert.equal(deleted.status, 200);
  assert.equal(deleted.body.task._id, created.body._id);
});

test('respon 400 quan el cos no conté JSON vàlid', async () => {
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"title":'
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).message, 'El JSON de la petició no és vàlid');
});
