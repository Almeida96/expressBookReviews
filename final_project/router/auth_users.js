const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();

const users = [];

const isValid = (username) => users.some(user => user.username === username);

const authenticatedUser = (username, password) =>
  users.some(user => user.username === username && user.password === password);

// A registered user can log in and receive a signed JWT.
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  const accessToken = jwt.sign(
    { username },
    process.env.JWT_SECRET || 'bookshop-local-jwt-secret',
    { expiresIn: '1h' }
  );
  req.session.authorization = { accessToken, username };
  return res.status(200).json({ message: 'User successfully logged in', accessToken });
});

// Add or update the current user's review of a book.
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.query.review ?? req.body?.review;
  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({ message: 'A non-empty review is required' });
  }
  book.reviews[req.user.username] = review.trim();
  return res.status(200).json({ message: 'Review added or updated successfully', reviews: book.reviews });
});

// Delete only the authenticated user's review of a book.
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.prototype.hasOwnProperty.call(book.reviews, req.user.username)) {
    return res.status(404).json({ message: 'Review not found for this user' });
  }
  delete book.reviews[req.user.username];
  return res.status(200).json({ message: 'Review deleted successfully', reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
