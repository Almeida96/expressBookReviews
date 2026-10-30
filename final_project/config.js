const { randomBytes } = require('node:crypto');
function secret(name) {
  const value = process.env[name];
  if (value && Buffer.byteLength(value) >= 32) return value;
  if (process.env.NODE_ENV === 'production' || value) throw new Error(name + ' must contain at least 32 bytes');
  return randomBytes(32).toString('hex');
}
module.exports = { jwtSecret: secret('JWT_SECRET'), sessionSecret: secret('SESSION_SECRET') };
