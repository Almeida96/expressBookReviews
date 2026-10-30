const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../index');
let server, base;
before(async () => {
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => server.close());
const request = (route, data, method = 'POST', token) => fetch(base + route, {
  method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
  ...(data === undefined ? {} : { body: JSON.stringify(data) })
});
test('prototype properties are not books or valid usernames', async () => {
  for (const key of ['__proto__', 'constructor', 'prototype', 'toString']) {
    assert.equal((await fetch(base + '/isbn/' + key)).status, 404);
  }
  for (const username of ['__proto__', 'constructor', 'prototype', ' reader ', 'ab']) {
    assert.equal((await request('/register', { username, password: 'example-password' })).status, 400);
  }
});
test('malformed and oversized JSON return client errors', async () => {
  const bad = await fetch(base + '/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' });
  assert.equal(bad.status, 400);
  assert.equal((await request('/register', { username: 'big', password: 'x'.repeat(20000) })).status, 413);
});
test('password verification and ownership isolate reviews', async () => {
  for (const username of ['reader_one', 'reader_two']) assert.equal((await request('/register', { username, password: 'example-password' })).status, 201);
  assert.equal((await request('/customer/login', { username: 'reader_one', password: 'wrong-password' })).status, 401);
  const login = async username => (await (await request('/customer/login', { username, password: 'example-password' })).json()).accessToken;
  const one = await login('reader_one'), two = await login('reader_two');
  assert.equal((await request('/customer/auth/review/1', { review: 'One review' }, 'PUT', one)).status, 200);
  assert.equal((await request('/customer/auth/review/1', undefined, 'DELETE', two)).status, 404);
  assert.equal((await (await fetch(base + '/review/1')).json()).reader_one, 'One review');
  assert.equal((await request('/customer/auth/review/1', { review: 'x'.repeat(5001) }, 'PUT', one)).status, 400);
});
test('registration races cannot create duplicate accounts', async () => {
  const results = await Promise.all([1, 2].map(() => request('/register', { username: 'same_account', password: 'example-password' })));
  assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
});
test('known historical development keys cannot forge access', async () => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ username: 'reader_one' }, 'bookshop-local-jwt-secret');
  assert.equal((await request('/customer/auth/review/1', { review: 'forged' }, 'PUT', token)).status, 401);
});
