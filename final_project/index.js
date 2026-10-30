const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const config = require('./config');
const accounts = require('./accounts');
const customerRoutes = require('./router/auth_users.js').authenticated;
const publicRoutes = require('./router/general.js').general;
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '16kb' }));
app.use('/customer', session({
  secret: config.sessionSecret, resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 3600000, secure: process.env.NODE_ENV === 'production' }
}));
app.use('/customer/auth', (req, res, next) => {
  const token = req.get('authorization')?.replace(/^Bearer\s+/i, '') || req.session?.authorization?.accessToken;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const user = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'], issuer: 'bookshop', audience: 'bookshop-api' });
    if (typeof user !== 'object' || !accounts.exists(user.username)) throw new Error('Unknown user');
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});
app.use('/customer', customerRoutes);
app.use('/', publicRoutes);
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON' });
  if (err.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large' });
  res.status(500).json({ message: 'Internal server error' });
});
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, process.env.HOST || '127.0.0.1', () => console.log('Book Review API listening on port ' + port));
}
module.exports = app;
