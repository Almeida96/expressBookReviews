const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const publicRoutes = require('./router/general.js').general;

const app = express();
app.use(express.json());

app.use('/customer', session({
  secret: process.env.SESSION_SECRET || 'bookshop-local-development-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

app.use('/customer/auth', (req, res, next) => {
  const sessionToken = req.session?.authorization?.accessToken;
  const bearerToken = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const token = bearerToken || sessionToken;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'bookshop-local-jwt-secret');
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.use('/customer', customerRoutes);
app.use('/', publicRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Book Review API listening on port ${PORT}`));
}
module.exports = app;
