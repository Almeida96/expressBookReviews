const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const derive = promisify(scrypt);
const users = new Map();
const reserved = new Set(['__proto__', 'constructor', 'prototype']);
const validUsername = value => typeof value === 'string' && /^[A-Za-z0-9_]{3,64}$/.test(value) && !reserved.has(value.toLowerCase());
const validPassword = value => typeof value === 'string' && value.length >= 8 && Buffer.byteLength(value) <= 128;
async function register(username, password) {
  if (!validUsername(username) || !validPassword(password)) return 400;
  if (users.has(username)) return 409;
  if (users.size >= 1000) return 503;
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password, salt, 64);
  // Another request may have registered the same account while hashing.
  if (users.has(username)) return 409;
  if (users.size >= 1000) return 503;
  users.set(username, { salt, hash });
  return 201;
}
async function authenticate(username, password) {
  if (!validUsername(username) || !validPassword(password)) return false;
  const account = users.get(username);
  const hash = await derive(password, account?.salt || 'missing-account', 64);
  return !!account && timingSafeEqual(hash, account.hash);
}
module.exports = { register, authenticate, exists: username => users.has(username) };
