const {test, before, after} = require('node:test');
const assert = require('node:assert/strict');
const app = require('../index');

let server, base;
before(async () => {
  await new Promise(resolve => {server = app.listen(0, '127.0.0.1', resolve);});
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => server?.close());

test('lists books and supports ISBN, author, title and reviews', async () => {
  const all = await (await fetch(base + '/')).json();
  assert.equal(Object.keys(all).length, 10);
  const byIsbn = await (await fetch(base + '/isbn/8')).json();
  assert.equal(byIsbn.author, 'Jane Austen');
  const byAuthor = await (await fetch(base + '/author/Jane%20Austen')).json();
  assert.equal(byAuthor['8'].title, 'Pride and Prejudice');
  const byTitle = await (await fetch(base + '/title/Pride%20and%20Prejudice')).json();
  assert.equal(byTitle['8'].author, 'Jane Austen');
  const reviews = await (await fetch(base + '/review/8')).json();
  assert.equal(typeof reviews, 'object');
});

test('registration, login, review update and delete require authentication', async () => {
  const username = 'test_' + Date.now();
  const json = (method, body) => ({method, headers:{'content-type':'application/json'}, body:JSON.stringify(body)});
  const register = await fetch(base + '/register', json('POST',{username,password:'testpass'}));
  assert.equal(register.status, 201);
  const duplicate = await fetch(base + '/register', json('POST',{username,password:'testpass'}));
  assert.equal(duplicate.status, 409);
  const noAuth = await fetch(base + '/customer/auth/review/8?review=Nice',{method:'PUT'});
  assert.equal(noAuth.status, 401);
  const login = await fetch(base + '/customer/login', json('POST',{username,password:'testpass'}));
  assert.equal(login.status, 200);
  const {accessToken} = await login.json();
  assert.ok(accessToken);
  const auth = {authorization:'Bearer ' + accessToken};
  const added = await fetch(base + '/customer/auth/review/8?review=Excellent',{method:'PUT',headers:auth});
  assert.equal(added.status, 200);
  const bookReviews = await (await fetch(base + '/review/8')).json();
  assert.equal(bookReviews[username], 'Excellent');
  const removed = await fetch(base + '/customer/auth/review/8',{method:'DELETE',headers:auth});
  assert.equal(removed.status, 200);
  const afterDelete = await (await fetch(base + '/review/8')).json();
  assert.equal(afterDelete[username], undefined);
});
