const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const accounts = require('../accounts');
const { jwtSecret } = require('../config');
const router = express.Router();
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!await accounts.authenticate(username, password)) return res.status(401).json({ message: 'Invalid username or password' });
    const accessToken = jwt.sign({ username }, jwtSecret, { algorithm: 'HS256', issuer: 'bookshop', audience: 'bookshop-api', expiresIn: '1h' });
    req.session.authorization = { accessToken, username };
    res.json({ message: 'User successfully logged in', accessToken });
  } catch (error) { next(error); }
});
router.put('/auth/review/:isbn', (req, res) => {
  const book = Object.hasOwn(books, req.params.isbn) ? books[req.params.isbn] : null;
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.body?.review ?? req.query.review;
  if (typeof review !== 'string' || !review.trim() || review.length > 5000) {
    return res.status(400).json({ message: 'Review must contain 1 to 5000 characters' });
  }
  book.reviews[req.user.username] = review.trim();
  res.json({ message: 'Review added or updated successfully', reviews: book.reviews });
});
router.delete('/auth/review/:isbn', (req, res) => {
  const book = Object.hasOwn(books, req.params.isbn) ? books[req.params.isbn] : null;
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.hasOwn(book.reviews, req.user.username)) return res.status(404).json({ message: 'Review not found for this user' });
  delete book.reviews[req.user.username];
  res.json({ message: 'Review deleted successfully', reviews: book.reviews });
});
module.exports.authenticated = router;
